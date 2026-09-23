import { useRef, useState } from 'react';
import banco from './data/questions.json';
import {
  pontuarPorTaxa,
  calcularContexto,
  analisarFinal,
  pontuarConfirmacao,
  aplicarConfirmacao,
  PESOS,
} from './engine/scoring.js';
import {
  itensFase1,
  itensFase3,
  resultadoFase1,
  planejarFase2,
  itensDesempateTipo,
  itensFase4,
  tipoProvisorio,
  parParaConfirmar,
  itensConfirmacao,
  candidatosParaConfirmar,
} from './engine/fluxo.js';
import Landing from './components/Landing.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Report from './components/Report.jsx';
import { assinaturaBanco } from './engine/exportar.js';
import { clonarEstado, ordemAleatoria } from './engine/navegacao.js';

// Identifica a versao do banco no arquivo de respostas que a pessoa pode baixar.
const ASSINATURA_BANCO = assinaturaBanco(banco);

/**
 * Maquina de estados:
 *   fase1       -> triagem (triade + tipo), com as perguntas de centro no fim
 *   fase2       -> itens da(s) triade(s) candidata(s) + itens cruzados, com desempate de tipo
 *   confirmacao -> afirmacoes em escala sobre o tipo apurado e o segundo colocado
 *   fase3       -> instinto
 *   fase4       -> confirmacao de subtipo dentro do tipo encontrado
 *
 * A confirmacao vem depois da fase 2 e antes da fase 3 porque ela pode trocar o
 * tipo, e a fase 4 pergunta pelo subtipo DO tipo encontrado.
 *
 * Os itens cruzados (fase2_cruzada) sao guardados separadamente (fase2x) porque
 * recebem peso proprio na decisao do tipo.
 */
const FASES = ['fase1', 'fase2', 'confirmacao', 'fase3', 'fase4'];

function vazio() {
  return { fase1: [], fase2: [], fase2x: [], confirmacao: [], fase3: [], fase4: [] };
}

export default function App() {
  const [stage, setStage] = useState('landing'); // landing | quiz | report
  const [itemAtual, setItemAtual] = useState(null);
  const [respondidas, setRespondidas] = useState(0);
  const [analise, setAnalise] = useState(null);

  const fluxo = useRef(null);
  // Navegacao: copia do estado antes de cada resposta (para "Voltar"), a ultima
  // resposta dada a cada pergunta (fica marcada ao revisitar) e a ordem das
  // alternativas de cada pergunta (a mesma ao voltar).
  const historico = useRef([]);
  const respostasDadas = useRef(new Map());
  const ordens = useRef(new Map());
  const [podeVoltar, setPodeVoltar] = useState(false);

  function iniciar() {
    historico.current = [];
    respostasDadas.current = new Map();
    ordens.current = new Map();
    setPodeVoltar(false);
    fluxo.current = {
      faseKey: 'fase1',
      fila: itensFase1(banco), // itens da fase atual, na ordem de apresentacao
      idx: 0,
      respostas: vazio(),
      itens: vazio(), // itens apresentados, por "balde"
      desempateAplicado: { fase1: false, fase2: false, fase3: false, fase4: false },
      cruzadosIds: new Set(),
      tipoFinal: null,
    };
    setRespondidas(0);
    setAnalise(null);
    setItemAtual(fluxo.current.fila[0]);
    setStage('quiz');
  }

  function balde(f, item) {
    if (f.faseKey === 'fase2' && f.cruzadosIds.has(item.id)) return 'fase2x';
    return f.faseKey;
  }

  function todasRespostas(f) {
    return Object.values(f.respostas).flat();
  }
  function todosItens(f) {
    return Object.values(f.itens).flat();
  }

  function ordemDe(item) {
    // Itens de escala mantem a ordem: de "me identifico completamente" a "nada".
    if (item.escala) return item.alternativas;
    if (!ordens.current.has(item.id)) ordens.current.set(item.id, ordemAleatoria(item));
    return ordens.current.get(item.id);
  }

  // Os dois recebem o id da pergunta exibida quando o botao foi clicado. Um clique
  // que chega atrasado (a pergunta ja mudou) e ignorado, para nunca gravar uma
  // resposta numa pergunta que a pessoa nao viu nem voltar duas vezes.
  function naTela(itemId) {
    const f = fluxo.current;
    return !!f && f.fila[f.idx] && f.fila[f.idx].id === itemId;
  }

  function voltar(itemId) {
    if (!naTela(itemId)) return;
    const anterior = historico.current.pop();
    if (!anterior) return;
    fluxo.current = anterior;
    setRespondidas((n) => Math.max(0, n - 1));
    setPodeVoltar(historico.current.length > 0);
    setItemAtual(anterior.fila[anterior.idx]);
  }

  function aoResponder(itemId, altId, rtMs) {
    if (!naTela(itemId)) return;
    historico.current.push(clonarEstado(fluxo.current));
    setPodeVoltar(true);
    const f = fluxo.current;
    const item = f.fila[f.idx];
    respostasDadas.current.set(item.id, { altId, rtMs });
    const b = balde(f, item);
    f.respostas[b].push({ itemId: item.id, altId, rtMs });
    if (!f.itens[b].some((i) => i.id === item.id)) f.itens[b].push(item);
    setRespondidas((n) => n + 1);

    const prox = f.idx + 1;
    if (prox < f.fila.length) {
      f.idx = prox;
      setItemAtual(f.fila[prox]);
      return;
    }
    finalizarFase();
  }

  function anexar(extras, { cruzados = false } = {}) {
    const f = fluxo.current;
    if (!extras.length) return false;
    if (cruzados) extras.forEach((it) => f.cruzadosIds.add(it.id));
    const novoIdx = f.fila.length;
    f.fila = [...f.fila, ...extras];
    f.idx = novoIdx;
    setItemAtual(f.fila[novoIdx]);
    return true;
  }

  function iniciarFase(faseKey, itens) {
    const f = fluxo.current;
    f.faseKey = faseKey;
    f.fila = [...itens];
    f.idx = 0;
    if (!f.fila.length) return avancar();
    setItemAtual(f.fila[0]);
  }

  function finalizarFase() {
    const f = fluxo.current;
    const ctx = calcularContexto(todasRespostas(f), todosItens(f));

    if (f.faseKey === 'fase1') {
      // As tres perguntas que separam os centros (corpo, emocao, mente) sao feitas
      // sempre, e nao so quando a triagem empata: elas perguntam direto pelo centro
      // e protegem o caso em que a pessoa se reconhece pouco nas alternativas do
      // proprio tipo e o centro dela nem chegaria a ser testado.
      if (!f.desempateAplicado.fase1) {
        f.desempateAplicado.fase1 = true;
        if (anexar(banco.fase1_desempate || [])) return;
      }
      const res1 = resultadoFase1(f.respostas.fase1, f.itens.fase1, ctx);
      const plano = planejarFase2(banco, res1);
      plano.itensCruzados.forEach((it) => f.cruzadosIds.add(it.id));
      return iniciarFase('fase2', plano.itens);
    }

    if (f.faseKey === 'fase2') {
      const prov = tipoProvisorio(
        { respostas: f.respostas.fase1, itens: f.itens.fase1 },
        { respostas: f.respostas.fase2, itens: f.itens.fase2 },
        { respostas: f.respostas.fase2x, itens: f.itens.fase2x },
        ctx,
        PESOS
      );
      // Uma rodada extra: se ficou ambiguo, ou se o vencedor ganhou de um tipo de
      // outra triade sem nenhuma pergunta cruzada entre os dois.
      const par = parParaConfirmar(prov);
      if (par && !f.desempateAplicado.fase2) {
        f.desempateAplicado.fase2 = true;
        const extras = itensDesempateTipo(banco, par, todosItens(f));
        const saoCruzados = extras.length > 0 && extras[0].id.startsWith('fx_');
        if (anexar(extras, { cruzados: saoCruzados })) return;
      }
      f.tipoFinal = prov;
      return iniciarFase('confirmacao', itensConfirmacao(banco, candidatosParaConfirmar(prov)));
    }

    if (f.faseKey === 'confirmacao') {
      const escala = pontuarConfirmacao(f.respostas.confirmacao, f.itens.confirmacao);
      const { tipo } = aplicarConfirmacao(f.tipoFinal, escala);
      f.tipoFinal = tipo;
      return iniciarFase('fase3', itensFase3(banco));
    }

    if (f.faseKey === 'fase3') {
      const inst = pontuarPorTaxa(
        [{ respostas: f.respostas.fase3, itens: f.itens.fase3, peso: 1 }],
        'instinto',
        ctx
      );
      if (inst.ambiguo && inst.segundo && !f.desempateAplicado.fase3) {
        f.desempateAplicado.fase3 = true;
        const par = [inst.top.categoria, inst.segundo.categoria];
        const extras = (banco.fase3_desempate || []).filter(
          (it) => Array.isArray(it.separa) && par.every((p) => it.separa.includes(p))
        );
        if (anexar(extras)) return;
      }
      const t = f.tipoFinal;
      const tipos = t && t.top ? [t.top.categoria] : [];
      if (t && t.ambiguo && t.segundo) tipos.push(t.segundo.categoria);
      return iniciarFase('fase4', itensFase4(banco, tipos));
    }

    return avancar();
  }

  function avancar() {
    const f = fluxo.current;
    const i = FASES.indexOf(f.faseKey);
    if (i >= 0 && i < FASES.length - 1 && f.faseKey !== 'fase4') {
      // so chega aqui se uma fase ficou vazia
      return iniciarFase(FASES[i + 1], FASES[i + 1] === 'fase3' ? itensFase3(banco) : []);
    }
    concluir();
  }

  function concluir() {
    const f = fluxo.current;
    const resultado = analisarFinal({
      fase1: { respostas: f.respostas.fase1, itens: f.itens.fase1 },
      fase2: { respostas: f.respostas.fase2, itens: f.itens.fase2 },
      fase2x: { respostas: f.respostas.fase2x, itens: f.itens.fase2x },
      confirmacao: { respostas: f.respostas.confirmacao, itens: f.itens.confirmacao },
      fase3: { respostas: f.respostas.fase3, itens: f.itens.fase3 },
      fase4: { respostas: f.respostas.fase4, itens: f.itens.fase4 },
    });
    setAnalise(resultado);
    setStage('report');
  }

  // -----------------------------------------------------------------------
  const itensPorId = new Map();
  if (fluxo.current) {
    for (const it of todosItens(fluxo.current)) itensPorId.set(it.id, it);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-3 py-6 sm:py-10">
      <div className="w-full max-w-2xl">
        <div className="win">
          <div className="titlebar">
            <div className="lights">
              <span className="light r" />
              <span className="light y" />
              <span className="light g" />
            </div>
            <div className="title">Teste de Eneagrama</div>
            <div style={{ width: 44 }} />
          </div>

          {stage === 'quiz' && (
            <div className="metalbar" style={{ padding: '10px 16px' }}>
              <ProgressBar respondidas={respondidas} />
            </div>
          )}

          <div className="win-body">
            {stage === 'landing' && <Landing onStart={iniciar} />}

            {stage === 'quiz' && itemAtual && (
              <QuestionCard
                key={itemAtual.id}
                item={itemAtual}
                alternativas={ordemDe(itemAtual)}
                respostaAnterior={respostasDadas.current.get(itemAtual.id) || null}
                onAvancar={aoResponder}
                onVoltar={podeVoltar ? voltar : null}
              />
            )}

            {stage === 'report' && analise && (
              <Report
                analise={analise}
                itensPorId={itensPorId}
                respostasPorFase={fluxo.current.respostas}
                assinatura={ASSINATURA_BANCO}
                onRestart={() => setStage('landing')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
