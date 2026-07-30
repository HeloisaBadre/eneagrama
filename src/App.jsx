import { useRef, useState } from 'react';
import banco from './data/questions.json';
import { pontuarFase, calcularContexto, analisarFinal } from './engine/scoring.js';
import Landing from './components/Landing.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Report from './components/Report.jsx';

const CAMPO_POR_FASE = { fase1: 'triade', fase2: 'tipo', fase3: 'instinto' };

export default function App() {
  const [stage, setStage] = useState('landing'); // landing | quiz | report
  const [itemAtual, setItemAtual] = useState(null);
  const [respondidas, setRespondidas] = useState(0);
  const [analise, setAnalise] = useState(null);
  const [tipoDisponivel, setTipoDisponivel] = useState(false);

  // Estado do fluxo em refs (evita closures obsoletas nas transicoes).
  const fluxo = useRef(null);

  function iniciar() {
    fluxo.current = {
      faseKey: 'fase1',
      itens: [...banco.fase1],
      idx: 0,
      respostas: { fase1: [], fase2: [], fase3: [] },
      itensApresentados: { fase1: [], fase2: [], fase3: [] },
      desempateAplicado: { fase1: false, fase2: false, fase3: false },
      triade: null,
    };
    fluxo.current.itensApresentados.fase1 = [...banco.fase1];
    setRespondidas(0);
    setAnalise(null);
    setTipoDisponivel(false);
    setItemAtual(fluxo.current.itens[0]);
    setStage('quiz');
  }

  function todasRespostas(f) {
    return [...f.respostas.fase1, ...f.respostas.fase2, ...f.respostas.fase3];
  }
  function todosItens(f) {
    return [
      ...f.itensApresentados.fase1,
      ...f.itensApresentados.fase2,
      ...f.itensApresentados.fase3,
    ];
  }

  function aoResponder(altId, rtMs) {
    const f = fluxo.current;
    const item = f.itens[f.idx];
    f.respostas[f.faseKey].push({ itemId: item.id, altId, rtMs });
    setRespondidas((n) => n + 1);

    const proxIdx = f.idx + 1;
    if (proxIdx < f.itens.length) {
      f.idx = proxIdx;
      setItemAtual(f.itens[proxIdx]);
      return;
    }

    // Fase terminou — pontuar e decidir.
    finalizarFase();
  }

  function finalizarFase() {
    const f = fluxo.current;
    const campo = CAMPO_POR_FASE[f.faseKey];
    const ctx = calcularContexto(todasRespostas(f), todosItens(f));
    const resultado = pontuarFase(f.respostas[f.faseKey], f.itens, campo, ctx);

    // Desempate: uma unica rodada por fase, se ambiguo e houver itens apropriados.
    if (resultado.ambiguo && !f.desempateAplicado[f.faseKey] && resultado.segundo) {
      const par = [resultado.top.categoria, resultado.segundo.categoria];
      const extras = itensDesempate(f.faseKey, f.triade, par, f.itens);
      if (extras.length) {
        f.desempateAplicado[f.faseKey] = true;
        const novoIdx = f.itens.length;
        f.itens = [...f.itens, ...extras];
        f.itensApresentados[f.faseKey] = f.itens;
        f.idx = novoIdx;
        setItemAtual(f.itens[novoIdx]);
        return;
      }
    }

    avancarFase(resultado);
  }

  function avancarFase(resultado) {
    const f = fluxo.current;

    if (f.faseKey === 'fase1') {
      const triade = resultado.top.categoria;
      f.triade = triade;
      const itensFase2 = banco.fase2[triade] || [];
      if (itensFase2.length) {
        setTipoDisponivel(true);
        f.faseKey = 'fase2';
        f.itens = [...itensFase2];
        f.itensApresentados.fase2 = f.itens;
        f.idx = 0;
        setItemAtual(f.itens[0]);
      } else {
        // Fatia vertical: triade sem Fase 2 construida -> pula para Fase 3.
        setTipoDisponivel(false);
        irParaFase3();
      }
      return;
    }

    if (f.faseKey === 'fase2') {
      irParaFase3();
      return;
    }

    // fase3 terminou -> analise final + relatorio.
    concluir();
  }

  function irParaFase3() {
    const f = fluxo.current;
    f.faseKey = 'fase3';
    f.itens = [...banco.fase3];
    f.itensApresentados.fase3 = f.itens;
    f.idx = 0;
    setItemAtual(f.itens[0]);
  }

  function concluir() {
    const f = fluxo.current;
    const resultado = analisarFinal({
      fase1: { respostas: f.respostas.fase1, itens: f.itensApresentados.fase1 },
      fase2: { respostas: f.respostas.fase2, itens: f.itensApresentados.fase2, triade: f.triade },
      fase3: { respostas: f.respostas.fase3, itens: f.itensApresentados.fase3 },
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
              <QuestionCard item={itemAtual} onAnswer={aoResponder} />
            )}

            {stage === 'report' && analise && (
              <Report
                analise={analise}
                tipoDisponivel={tipoDisponivel}
                itensPorId={itensPorId}
                onRestart={() => setStage('landing')}
              />
            )}
          </div>
        </div>

        <p className="text-center" style={{ fontSize: 11, color: '#1c3a63', marginTop: 10 }}>
          © 2001. Questionário heurístico e educativo. Best viewed in any browser.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Selecao de itens de desempate para o par ambiguo
// ---------------------------------------------------------------------------

function itensDesempate(faseKey, triade, par, jaPresentes) {
  let pool = [];
  if (faseKey === 'fase1') pool = banco.fase1_desempate || [];
  else if (faseKey === 'fase2') pool = (banco.fase2_desempate && banco.fase2_desempate[triade]) || [];
  else if (faseKey === 'fase3') pool = banco.fase3_desempate || [];

  const idsPresentes = new Set(jaPresentes.map((i) => i.id));
  const parSet = new Set(par.map(String));
  return pool.filter((it) => {
    if (idsPresentes.has(it.id)) return false;
    if (!Array.isArray(it.separa)) return false;
    const s = new Set(it.separa.map(String));
    if (s.size !== parSet.size) return false;
    for (const v of s) if (!parSet.has(v)) return false;
    return true;
  });
}
