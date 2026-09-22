import { useState } from 'react';
import { triades, tipos, instintos, subtipos, rotulos } from '../data/results.js';
import { TRIADE_DE } from '../engine/fluxo.js';
import { montarRegistro } from '../engine/exportar.js';

/**
 * Relatorio final (repintura retro; lógica de dados inalterada). Recebe:
 *  - analise: saida de analisarFinal()
 *  - itensPorId: mapa id->item para citar textos de respostas decisivas
 *  - respostasPorFase, assinatura: para o arquivo de respostas opcional (secao 6)
 */
export default function Report({ analise, itensPorId, respostasPorFase, assinatura, onRestart }) {
  const { triade, tipo, instinto, confiabilidade } = analise;
  const tipoNum = tipo.top ? tipo.top.categoria : null;
  const triadeTriagem = triade.top ? triade.top.categoria : null;
  // O tipo manda: a triade e o centro do tipo encontrado. A Fase 1 e so triagem.
  const triadeFinalKey = tipoNum != null ? TRIADE_DE[tipoNum] : triadeTriagem;
  const triadeDivergiu = triadeTriagem !== null && triadeFinalKey !== triadeTriagem;
  const triadeInfo = triadeFinalKey ? triades[triadeFinalKey] : null;
  const tipoInfo = tipoNum != null ? tipos[tipoNum] : null;
  const instintoKey = instinto.top ? instinto.top.categoria : null;
  const subKey = tipoNum != null && instintoKey ? `${tipoNum}-${instintoKey}` : null;
  const subInfo = subKey ? subtipos[subKey] : null;

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h1 className="serif-title" style={{ fontSize: 28, fontWeight: 700, color: '#12325e', margin: '4px 0 0' }}>
          Resultado
        </h1>
      </div>

      {/* 1. TRIADE */}
      <Secao numero="1" titulo="Centro dominante (tríade)">
        {triadeInfo ? (
          <>
            <div className="pill" style={{ fontSize: 15 }}>{triadeInfo.nome}</div>
            <p style={{ marginTop: 12 }}>{triadeInfo.texto}</p>
            <p style={{ marginTop: 10, fontSize: 13, color: '#4a4a4a' }}>
              A emoção reativa de fundo aqui é <strong>{triadeInfo.emocao}</strong>. A pergunta
              silenciosa que organiza suas reações: <em>“{triadeInfo.pergunta}”</em>
            </p>
          </>
        ) : (
          <SemResultado>
            Suas respostas não apontaram um centro dominante. Isso acontece quando quase nenhuma
            alternativa pareceu com você.
          </SemResultado>
        )}
        {triadeDivergiu && (
          <div className="box" style={{ marginTop: 12, borderColor: '#c9b96a' }}>
            <div className="bar-olive">A triagem inicial apontou outro centro</div>
            <div className="box-bd" style={{ fontSize: 13 }}>
              Nas primeiras perguntas o seu centro aparente foi{' '}
              <strong>{(triades[triadeTriagem]?.nome || '').toLowerCase()}</strong>, mas as perguntas
              de motivação apontaram um tipo da tríade acima. Isso é comum em quem tem um
              comportamento parecido com o de outro centro (por exemplo, um 6 sexual ou um 4 sexual que
              se comportam como 8). O centro exibido acima segue o tipo encontrado.
            </div>
          </div>
        )}
        <PorQue
          rotulo="Como esta tríade foi inferida"
          scores={triade.scores}
          decisivo={analise.decisivos.triade}
          itensPorId={itensPorId}
          ambiguo={triade.ambiguo}
          segundo={triade.segundo}
          rotuladorNome={(k) => rotulos.triade[k] || k}
        />
      </Secao>

      {/* 2. TIPO */}
      {tipoInfo ? (
        <Secao numero="2" titulo="Eneatipo">
          <div className="pill" style={{ fontSize: 15 }}>{tipoInfo.nome}</div>
          <p style={{ marginTop: 12 }}>{tipoInfo.nucleo}</p>
          <p style={{ marginTop: 10 }}>
            <span style={{ fontWeight: 700, color: '#12325e' }}>A dor por trás: </span>
            {tipoInfo.dorDeFundo}
          </p>
          <p className="ficha">
            Ficha técnica (linguagem de análise): paixão, {tipoInfo.paixao}; fixação,{' '}
            {tipoInfo.fixacao}.
          </p>

          {tipo.ambiguo && tipo.segundo && (
            <Ambiguidade
              a={tipos[tipo.top.categoria]?.nome}
              b={tipos[tipo.segundo.categoria]?.nome}
              diferenca={diferencaTipos(tipo.top.categoria, tipo.segundo.categoria)}
            />
          )}

          <PorQue
            rotulo="Como este tipo foi inferido"
            scores={tipo.scores}
            decisivo={analise.decisivos.tipo}
            itensPorId={itensPorId}
            ambiguo={tipo.ambiguo}
            segundo={tipo.segundo}
            rotuladorNome={(k) => `Tipo ${k}`}
          />
        </Secao>
      ) : (
        <Secao numero="2" titulo="Eneatipo">
          <SemResultado>
            Não foi possível identificar o seu tipo, porque você não se reconheceu nas alternativas
            das perguntas que distinguem os tipos. Refazer o teste escolhendo a opção mais próxima,
            mesmo quando nenhuma for perfeita, costuma resolver.
          </SemResultado>
        </Secao>
      )}

      {/* 3. INSTINTO / SUBTIPO */}
      <Secao numero="3" titulo="Instinto dominante (subtipo)">
        {instintoKey && (
          <>
            <div className="pill" style={{ fontSize: 15 }}>{instintos[instintoKey]?.nome}</div>
            <p style={{ marginTop: 8, fontSize: 13, color: '#4a4a4a' }}>{instintos[instintoKey]?.resumo}</p>
          </>
        )}
        {subInfo ? (
          <>
            <p style={{ marginTop: 12, fontWeight: 700, color: '#12325e' }}>{subInfo.titulo}</p>
            <p style={{ marginTop: 4 }}>{subInfo.texto}</p>
          </>
        ) : (
          <p style={{ marginTop: 12, fontSize: 13, color: '#4a4a4a' }}>
            {instintoKey
              ? 'O texto do subtipo depende do tipo, que não pôde ser identificado. O instinto dominante está indicado acima.'
              : 'Suas respostas não apontaram um instinto dominante.'}
          </p>
        )}
        <PorQue
          rotulo="Como este instinto foi inferido"
          scores={instinto.scores}
          decisivo={null}
          itensPorId={itensPorId}
          ambiguo={instinto.ambiguo}
          segundo={instinto.segundo}
          rotuladorNome={(k) => rotulos.instinto[k] || k}
        />
      </Secao>

      {/* 4. CONFIABILIDADE */}
      <Secao numero="4" titulo="Índice de confiabilidade do autorrelato">
        <span
          style={{
            display: 'inline-block',
            borderRadius: 12,
            padding: '3px 12px',
            fontSize: 12,
            fontWeight: 700,
            ...corConfianca(confiabilidade.confiancaAutorrelato),
          }}
        >
          Confiança {rotulos.confianca[confiabilidade.confiancaAutorrelato]}
        </span>

        <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
          <li>
            <strong>“Nenhuma dessas”:</strong>{' '}
            {confiabilidade.nulas
              ? `${confiabilidade.nulas.marcadas} de ${confiabilidade.nulas.total} perguntas (nível ${confiabilidade.nulas.nivel}).`
              : 'não medido.'}
          </li>
          <li>
            <strong>Desejabilidade social:</strong> {confiabilidade.desejabilidade.marcadas} de{' '}
            {confiabilidade.desejabilidade.total} itens elogiáveis marcados (nível{' '}
            {confiabilidade.desejabilidade.nivel}).
          </li>
          <li>
            <strong>Deliberação em itens viscerais:</strong> nível {confiabilidade.deliberacao.nivel}
            {confiabilidade.deliberacao.total > 0
              ? ` (${confiabilidade.deliberacao.deliberadas}/${confiabilidade.deliberacao.total})`
              : ''}
            .
          </li>
          <li>
            <strong>Consistência entre itens gêmeos:</strong>{' '}
            {confiabilidade.divergenciasGemeas.length === 0
              ? 'sem divergências registradas.'
              : `${confiabilidade.divergenciasGemeas.length} divergência(s), ver abaixo.`}
          </li>
        </ul>

        {confiabilidade.notas.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {confiabilidade.notas.map((n, i) => (
              <p
                key={i}
                style={{ fontSize: 13, color: '#333', borderLeft: '3px solid var(--aqua-2)', paddingLeft: 10, margin: '8px 0' }}
              >
                {n}
              </p>
            ))}
          </div>
        )}

        {confiabilidade.divergenciasGemeas.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontWeight: 700, color: '#12325e', marginBottom: 6 }}>
              Divergências entre cenários quase-idênticos
            </p>
            {confiabilidade.divergenciasGemeas.map((d, i) => (
              <div key={i} className="box" style={{ marginBottom: 8 }}>
                <div className="box-bd" style={{ fontSize: 13 }}>
                  {d.contextos.map((c) => (
                    <div key={c.itemId}>
                      <span style={{ color: 'var(--aqua-2)', fontWeight: 700 }}>
                        {rotuloDominio(c.dominio)}:
                      </span>{' '}
                      “{c.textoEscolha}”
                    </div>
                  ))}
                  <p style={{ marginTop: 8, marginBottom: 0, fontSize: 11.5, color: '#666' }}>
                    A mesma tensão produziu escolhas diferentes conforme o contexto, sinal de onde
                    sua defesa relaxa e onde a persona fica mais vigiada.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Secao>

      {/* 5. PROXIMO PASSO (Naranjo: reconhecimento e autobiografia) */}
      <ProximoPasso tipo={tipo} />

      {/* 6. CONTRIBUIR (opcional) */}
      {respostasPorFase && (
        <Contribuir
          analise={analise}
          itensPorId={itensPorId}
          respostasPorFase={respostasPorFase}
          assinatura={assinatura}
        />
      )}

      <hr className="rule" />
      <p style={{ fontSize: 11.5, color: '#5a5a5a', marginTop: 0 }}>
        Lembrete: os pesos e limiares deste instrumento são heurísticas transparentes, não valores
        validados por amostra. Trate o resultado como um espelho para reflexão, não como um veredito.
      </p>
      <div style={{ marginTop: 10 }}>
        <button onClick={onRestart} className="bevel-btn">Refazer</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------

function Secao({ numero, titulo, children }) {
  return (
    <div className="box" style={{ marginTop: 14 }}>
      <div className="box-hd">
        <span>
          {numero}. {titulo}
        </span>
      </div>
      <div className="box-bd" style={{ fontSize: 14, lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * O passo seguinte que Naranjo recomendava: o tipo se confirma pelo reconhecimento na
 * descricao, nao pela soma de pontos, e depois pela autobiografia. Mostra o segundo
 * candidato (quando ele teve alguma pontuacao) e a diferenca central entre os dois.
 */
function ProximoPasso({ tipo }) {
  const a = tipo.top ? tipo.top.categoria : null;
  const b = tipo.segundo && tipo.segundo.score > 0 ? tipo.segundo.categoria : null;
  const segundoInfo = a != null && b != null ? tipos[b] : null;

  return (
    <Secao numero="5" titulo="O que fazer com este resultado">
      <p style={{ marginTop: 0 }}>
        Um teste escrito não substitui o reconhecimento. Naranjo tratava a leitura das
        descrições como o instrumento de diagnóstico: o tipo certo é aquele em que a pessoa se
        reconhece por inteiro, não o que soma mais pontos. Então o primeiro passo é ler a
        descrição acima
        {segundoInfo
          ? ' e a do segundo candidato, e ver qual delas incomoda mais.'
          : ' com calma, e ver o quanto ela incomoda.'}
      </p>
      {segundoInfo && (
        <>
          <p>
            O segundo candidato nas suas respostas foi o <strong>{segundoInfo.nome}</strong>. A
            diferença central entre os dois: {diferencaTipos(a, b)}
          </p>
          <details style={{ marginTop: 4 }}>
            <summary className="retro-link" style={{ fontSize: 12.5 }}>
              Ler a descrição do {segundoInfo.nome}
            </summary>
            <p style={{ marginTop: 8 }}>{segundoInfo.nucleo}</p>
            <p style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: '#12325e' }}>A dor por trás: </span>
              {segundoInfo.dorDeFundo}
            </p>
          </details>
        </>
      )}
      <p>
        O passo seguinte que ele recomendava é escrever uma autobiografia focada na paixão e na
        fixação encontradas: começar pelas cenas concretas da infância, sobretudo as dolorosas,
        e acompanhar como o caráter foi se formando como defesa diante delas. Sem pressa e sem
        abstração: o som, a imagem, o que foi dito, o que você concluiu ali.
      </p>
    </Secao>
  );
}

/**
 * Arquivo de respostas anonimo, para validar o teste com pessoas ja tipadas.
 * Nada e enviado: o arquivo e gerado no navegador e baixado pela propria pessoa.
 */
function Contribuir({ analise, itensPorId, respostasPorFase, assinatura }) {
  const [tipo, setTipo] = useState('');
  const [instinto, setInstinto] = useState('');
  const [fonte, setFonte] = useState('');
  const [baixado, setBaixado] = useState(false);

  function baixar() {
    const registro = montarRegistro({
      respostasPorFase,
      itensPorId,
      analise,
      assinatura,
      conhecido: { tipo, instinto, fonte },
    });
    const blob = new Blob([JSON.stringify(registro, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eneatipo-respostas-${registro.data}-${Math.random().toString(36).slice(2, 6)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBaixado(true);
  }

  const estiloCampo = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 };
  const estiloRotulo = { width: 190, fontSize: 13 };
  const estiloSelect = { fontSize: 13, padding: '3px 6px', maxWidth: '100%' };

  return (
    <Secao numero="6" titulo="Contribuir com a validação do teste (opcional)">
      <p style={{ marginTop: 0, fontSize: 13 }}>
        Este teste ainda está sendo validado. Para ajudar, baixe um arquivo com as suas respostas e
        entregue a quem indicou o teste. O arquivo não tem nome nem dados pessoais, só as alternativas
        escolhidas, o tempo de cada resposta e o resultado. Nada é enviado pela internet.
      </p>
      <p style={{ fontSize: 13 }}>
        Se você já conhece o seu tipo por outro caminho, indique abaixo. É isso que permite medir se o
        teste acerta.
      </p>

      <label style={estiloCampo}>
        <span style={estiloRotulo}>Meu tipo, se já sei:</span>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={estiloSelect}>
          <option value="">Não sei</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={n}>
              Tipo {n}
            </option>
          ))}
        </select>
      </label>
      <label style={estiloCampo}>
        <span style={estiloRotulo}>Meu instinto, se já sei:</span>
        <select value={instinto} onChange={(e) => setInstinto(e.target.value)} style={estiloSelect}>
          <option value="">Não sei</option>
          <option value="autopreservacao">Autopreservação</option>
          <option value="social">Social</option>
          <option value="sexual">Sexual</option>
        </select>
      </label>
      <label style={estiloCampo}>
        <span style={estiloRotulo}>Como sei:</span>
        <select value={fonte} onChange={(e) => setFonte(e.target.value)} style={estiloSelect} disabled={!tipo}>
          <option value="">Prefiro não dizer</option>
          <option value="entrevista">Entrevista com alguém que conhece o modelo</option>
          <option value="outro-teste">Outro teste</option>
          <option value="auto-observacao">Observação de mim mesmo</option>
        </select>
      </label>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={baixar} className="aqua-btn" style={{ fontSize: 13, padding: '6px 18px' }}>
          Baixar minhas respostas
        </button>
        {baixado && <span style={{ fontSize: 12, color: '#1c5c1c' }}>Arquivo gerado.</span>}
      </div>
    </Secao>
  );
}

function SemResultado({ children }) {
  return (
    <div className="box" style={{ borderColor: '#c9b96a' }}>
      <div className="bar-olive">Resultado inconclusivo</div>
      <div className="box-bd" style={{ fontSize: 13, lineHeight: 1.55 }}>
        {children}
      </div>
    </div>
  );
}

function Ambiguidade({ a, b, diferenca }) {
  return (
    <div className="box" style={{ marginTop: 12, borderColor: '#c9b96a' }}>
      <div className="bar-olive">Ambiguidade não resolvida entre dois tipos</div>
      <div className="box-bd" style={{ fontSize: 13 }}>
        Suas respostas ficaram tecnicamente próximas entre <strong>{a}</strong> e{' '}
        <strong>{b}</strong>. Em vez de forçar uma resposta única: {diferenca}
      </div>
    </div>
  );
}

/** Mostra a distribuicao e cita a resposta decisiva (requisito 7). */
function PorQue({ rotulo, scores, decisivo, itensPorId, ambiguo, segundo, rotuladorNome }) {
  const entradas = Object.entries(scores)
    .map(([k, v]) => ({ k: coerce(k), v }))
    .sort((a, b) => b.v - a.v);
  const max = entradas.length && entradas[0].v > 0 ? entradas[0].v : 1;

  const itemDecisivo = decisivo ? itensPorId.get(decisivo.itemId) : null;
  // Prefere a alternativa escolhida (altId): o item pode ter mais de uma
  // alternativa da mesma categoria, e a primeira nem sempre e a escolhida.
  const altDecisiva =
    itemDecisivo && decisivo
      ? itemDecisivo.alternativas.find((al) => al.id === decisivo.altId) ||
        itemDecisivo.alternativas.find(
          (al) =>
            (al.mapa.tipo != null && al.mapa.tipo === decisivo.categoria) ||
            al.mapa.triade === decisivo.categoria ||
            al.mapa.instinto === decisivo.categoria
        )
      : null;

  return (
    <details style={{ marginTop: 12 }}>
      <summary className="retro-link" style={{ fontSize: 12.5 }}>
        {rotulo}
      </summary>
      <div style={{ marginTop: 8 }}>
        {entradas.map((e) => (
          <div key={String(e.k)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ width: 150, flexShrink: 0, fontSize: 11.5, color: '#333' }}>
              {rotuladorNome(e.k)}
            </span>
            <div
              style={{
                flex: 1,
                height: 12,
                borderRadius: 7,
                background: '#dfe6ef',
                border: '1px solid #b7c4d6',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(e.v / max) * 100}%`,
                  background: 'linear-gradient(180deg, var(--aqua-1), var(--aqua-2))',
                }}
              />
            </div>
            <span style={{ width: 34, textAlign: 'right', fontSize: 11, color: '#666' }}>
              {e.v.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
      {altDecisiva && (
        <p style={{ marginTop: 10, fontSize: 12, color: '#333' }}>
          <strong>Resposta mais decisiva:</strong> no cenário “{truncar(itemDecisivo.cenario, 70)}”,
          sua escolha “{truncar(altDecisiva.texto, 80)}” pesou mais para essa inferência.
        </p>
      )}
      {ambiguo && segundo && (
        <p style={{ marginTop: 6, fontSize: 11.5, color: '#666' }}>
          Margem estreita em relação à segunda hipótese ({rotuladorNome(segundo.categoria)}), por isso
          foram aplicadas perguntas de desempate.
        </p>
      )}
    </details>
  );
}

// ---------------------------------------------------------------------------
// Helpers (inalterados)
// ---------------------------------------------------------------------------

function coerce(k) {
  const n = Number(k);
  return Number.isInteger(n) && String(n) === k ? n : k;
}

function corConfianca(nivel) {
  if (nivel === 'alto') return { background: '#d8f0d8', color: '#1c5c1c', border: '1px solid #6fae6f' };
  if (nivel === 'medio') return { background: '#fdeecb', color: '#7a5310', border: '1px solid #d1a53c' };
  return { background: '#f7d6d6', color: '#8a2020', border: '1px solid #cf7a7a' };
}

function rotuloDominio(d) {
  const map = { trabalho: 'Trabalho', familia: 'Família', amizade: 'Amizade', romance: 'Amor', geral: 'Geral' };
  return map[d] || d;
}

function truncar(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

/**
 * Diferenca central entre dois tipos (36 pares, do apendice de diagnostico
 * diferencial de Caracter e neurose). Se faltar um par, usa paixao e fixacao.
 */
function diferencaTipos(a, b) {
  const par = [a, b].sort((x, y) => x - y).join('-');
  // Adaptado do apendice de diagnostico diferencial de Caracter e neurose.
  const mapa = {
    '1-2': 'no 1 o motor é o dever e a correção; no 2 é o vínculo e a necessidade de ser querido.',
    '1-3': 'os dois se controlam e são formais, mas o 1 é contido e sério, guiado pelo que é certo; o 3 é expansivo e animado, guiado pelo que os outros valorizam.',
    '1-4': 'no 1 o que dói é ter feito errado; no 4, ter confirmado que vale menos que os outros.',
    '1-5': 'os dois são controlados e perfeccionistas, mas o 1 é assertivo e direto, enquanto o 5 é tímido e inibido na expressão.',
    '1-6': 'os dois levam o dever a sério; o 1 é mais assertivo e decide, o 6 trava na decisão e teme o erro.',
    '1-7': 'no 1 o prazer só vem depois do dever; no 7 o prazer vem primeiro, e sem culpa.',
    '1-8': 'no 1 a raiva é internalizada e vira correção e dever; no 8 ela é externalizada e vira impacto e limite.',
    '1-9': 'no 1 há uma tensão ativa de corrigir o que está errado; no 9 há acomodação, que evita o conflito e apaga o próprio querer.',
    '2-3': 'os dois cuidam da aparência e querem atenção, mas o 2 é mais solto, espontâneo e invasivo; o 3 é controlado e atento aos limites.',
    '2-4': 'o 2 esconde a carência e se apresenta cheio; o 4 vive e mostra a falta.',
    '2-5': 'o 2 se move na direção do vínculo; o 5 se retira dele.',
    '2-6': 'no 2 o carinho busca um lugar especial; no 6, proteção e segurança.',
    '2-7': 'os dois seduzem e gostam de prazer, mas o 2 é emocional de verdade, enquanto no 7 a simpatia convive com independência e um fundo de não envolvimento.',
    '2-8': 'o 2 também pode ser impulsivo e arrogante, mas é emocional e sedutor; o 8 é ativo e vai direto ao poder.',
    '2-9': 'os dois são generosos, mas o 2 é dramático, impaciente e romântico, e cobra pelo que dá; o 9 é discreto, paciente e prático, e se esquece de si sem cobrar.',
    '3-4': 'o 3 controla a emoção e se identifica com a sua melhor versão; o 4 expressa a emoção e se identifica com a falta.',
    '3-5': 'o 3 é eficiente, social e enfrenta; o 5 é pouco prático e evita o contato e o confronto.',
    '3-6': 'a ansiedade do 3 gira em torno de se expor e ser deixado de lado; a do 6, em torno de errar e de não saber qual é o caminho.',
    '3-7': 'o 3 se disciplina para conquistar; o 7 evita o esforço e busca o prazer, com pouca preocupação com convenção.',
    '3-8': 'o 3 é controlado e se adapta ao que se espera; o 8 é impulsivo e rebelde.',
    '3-9': 'os dois podem trabalhar muito e viver na superfície, mas o 3 é energético e dirigido pelo olhar dos outros, e o 9 é relaxado e dirigido pelo costume.',
    '4-5': 'os dois se sentem por baixo, mas o 4 se agarra à relação e chora, e o 5 desiste e seca.',
    '4-6': 'o 4 é emocional e expressivo; o 6 é mental e inibido.',
    '4-7': 'o 4 pende para a tristeza e a culpa; o 7, para a euforia e o "está tudo bem". O 4 mostra a raiva, o 7 é gentil por compulsão.',
    '4-8': 'nos dois há intensidade, mas no 4 a raiva dura e vem junto com uma proibição interna do próprio desejo; no 8 ela explode, passa, e o desejo vira ação. O 8 invade, o 4 cobra pelo sofrimento.',
    '4-9': 'os dois podem deprimir, mas no 4 a depressão reclama e pede atenção, e no 9 ela é resignada e sem drama.',
    '5-6': 'os dois desconfiam, mas o 5 se afasta e o 6 se apega a quem protege e leva a autoridade mais em conta.',
    '5-7': 'o 5 reduz o próprio desejo; o 7 multiplica.',
    '5-8': 'o 5 se retira do embate; o 8 avança.',
    '5-9': 'nos dois há resignação e auto-esquecimento, mas no 5 é retirada e pouca disponibilidade, e no 9 é participação e generosidade.',
    '6-7': 'o 6 sente culpa e enxerga hierarquia; o 7 quase não sente culpa, trata todos como iguais e é mais charmoso e adaptável.',
    '6-8': 'o 6 duvida e tem medo, mesmo quando parte para cima; o 8 é assertivo sem dúvida, mais impulsivo e menos disciplinado.',
    '6-9': 'o 6 é introvertido, mental e orientado à hierarquia; o 9 é voltado para fora, sensório-motor, e recusa a hierarquia.',
    '7-8': 'o 7 é mente e charme, e cede mais; o 8 é ação e domínio.',
    '7-9': 'no 7 a vida de fantasia é intensa, com astúcia e autoindulgência; no 9 há pouca vida interior, ingenuidade e facilidade em adiar o próprio desejo.',
    '8-9': 'no 8 a raiva explode e se impõe; no 9 ela é anestesiada e a vontade se dissolve para manter a paz.',
  };
  if (mapa[par]) return mapa[par];
  const [ta, tb] = [tipos[a], tipos[b]];
  if (!ta || !tb) return 'observe qual paixão/fixação ressoa mais com sua experiência interna.';
  return (
    `no ${a} a paixão é ${ta.paixao.toLowerCase()}, e a fixação, ${ta.fixacao.toLowerCase()}. ` +
    `No ${b} a paixão é ${tb.paixao.toLowerCase()}, e a fixação, ${tb.fixacao.toLowerCase()}. ` +
    'Observe qual das duas descreve melhor o que acontece por dentro, e não só o comportamento.'
  );
}
