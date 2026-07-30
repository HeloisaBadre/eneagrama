import { triades, tipos, instintos, subtipos, rotulos } from '../data/results.js';

/**
 * Relatorio final (repintura retro; lógica de dados inalterada). Recebe:
 *  - analise: saida de analisarFinal()
 *  - tipoDisponivel: se a Fase 2 daquela triade existe nesta fatia
 *  - itensPorId: mapa id->item para citar textos de respostas decisivas
 */
export default function Report({ analise, tipoDisponivel, itensPorId, onRestart }) {
  const { triade, tipo, instinto, confiabilidade } = analise;
  const triadeInfo = triades[triade.top.categoria];
  const tipoNum = tipo.top ? tipo.top.categoria : null;
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
        <div className="pill" style={{ fontSize: 15 }}>{triadeInfo.nome}</div>
        <p style={{ marginTop: 12 }}>{triadeInfo.texto}</p>
        <p style={{ marginTop: 10, fontSize: 13, color: '#4a4a4a' }}>
          A emoção reativa de fundo aqui é <strong>{triadeInfo.emocao}</strong>. A pergunta
          silenciosa que organiza suas reações: <em>“{triadeInfo.pergunta}”</em>
        </p>
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
      {tipoDisponivel && tipoInfo && !tipoInfo._stub ? (
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
            rotulo="Como este tipo foi inferido dentro da tríade"
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
          <div className="box" style={{ borderColor: '#c9b96a' }}>
            <div className="bar-olive">Ainda não disponível para esta tríade</div>
            <div className="box-bd" style={{ fontSize: 13, lineHeight: 1.55 }}>
              <p style={{ marginTop: 0 }}>
                Esta versão tem a Fase 2 desenvolvida por completo para a{' '}
                <strong>tríade instintiva (8/9/1)</strong>. Como seu centro dominante saiu{' '}
                <strong>{triadeInfo.nome.toLowerCase()}</strong>, a distinção entre os três tipos
                dessa tríade será adicionada numa próxima etapa.
              </p>
              <p style={{ marginBottom: 0 }}>
                Mesmo assim, o centro, o instinto e o índice de confiabilidade abaixo já são válidos.
              </p>
            </div>
          </div>
        </Secao>
      )}

      {/* 3. INSTINTO / SUBTIPO */}
      <Secao numero="3" titulo="Instinto dominante (subtipo)">
        <div className="pill" style={{ fontSize: 15 }}>{instintos[instintoKey]?.nome}</div>
        <p style={{ marginTop: 8, fontSize: 13, color: '#4a4a4a' }}>{instintos[instintoKey]?.resumo}</p>
        {subInfo ? (
          <>
            <p style={{ marginTop: 12, fontWeight: 700, color: '#12325e' }}>{subInfo.titulo}</p>
            <p style={{ marginTop: 4 }}>{subInfo.texto}</p>
          </>
        ) : (
          <p style={{ marginTop: 12, fontSize: 13, color: '#4a4a4a' }}>
            O texto do subtipo específico ({tipoNum ?? '?'} · {instintos[instintoKey]?.nome}) será
            exibido quando a Fase 2 desta tríade estiver disponível. O instinto dominante já está
            identificado acima.
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
  const max = entradas.length ? entradas[0].v : 1;

  const itemDecisivo = decisivo ? itensPorId.get(decisivo.itemId) : null;
  const altDecisiva =
    itemDecisivo && decisivo
      ? itemDecisivo.alternativas.find(
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

/** Diferenca central entre dois tipos da triade instintiva, para o caso ambiguo. */
function diferencaTipos(a, b) {
  const par = [a, b].sort((x, y) => x - y).join('-');
  const mapa = {
    '1-8': 'no 1 a raiva é internalizada e vira correção/dever; no 8 ela é externalizada e vira impacto e conquista de limite.',
    '8-9': 'no 8 a raiva explode e se impõe; no 9 ela é anestesiada e a vontade se dissolve para manter a paz.',
    '1-9': 'no 1 há uma tensão ativa de corrigir o que está errado; no 9 há uma acomodação que evita o conflito e apaga o próprio querer.',
  };
  return mapa[par] || 'observe qual paixão/fixação ressoa mais com sua experiência interna.';
}
