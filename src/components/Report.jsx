import { useState } from 'react';
import { TRIADE_DE } from '../engine/fluxo.js';
import { montarRegistro } from '../engine/exportar.js';
import { useIdioma, textoNoIdioma } from '../i18n/index.jsx';

/**
 * Relatorio final. Recebe:
 *  - analise: saida de analisarFinal()
 *  - itensPorId: mapa id->item para citar textos de respostas decisivas
 *  - respostasPorFase, assinatura: para o arquivo de respostas opcional (secao 6)
 *
 * Os textos vem do idioma escolhido: os rotulos de `useIdioma().t`, e as
 * descricoes de tipo e subtipo de `useIdioma().conteudo` (results.js ou
 * results.en.js). A logica de dados nao muda com o idioma.
 */
export default function Report({ analise, itensPorId, respostasPorFase, assinatura, onRestart }) {
  const { t, conteudo } = useIdioma();
  const tr = t.relatorio;
  const { triades, tipos, instintos, subtipos, rotulos } = conteudo;

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
          {tr.titulo}
        </h1>
      </div>

      {/* 1. TRIADE */}
      <Secao numero="1" titulo={tr.s1}>
        {triadeInfo ? (
          <>
            <div className="pill" style={{ fontSize: 15 }}>{triadeInfo.nome}</div>
            <p style={{ marginTop: 12 }}>{triadeInfo.texto}</p>
            <p style={{ marginTop: 10, fontSize: 13, color: '#4a4a4a' }}>
              {tr.emocaoDeFundo(triadeInfo.emocao, triadeInfo.pergunta)}
            </p>
          </>
        ) : (
          <SemResultado>{tr.semTriade}</SemResultado>
        )}
        {triadeDivergiu && (
          <div className="box" style={{ marginTop: 12, borderColor: '#c9b96a' }}>
            <div className="bar-olive">{tr.triagemOutroCentro}</div>
            <div className="box-bd" style={{ fontSize: 13 }}>
              {tr.triagemOutroCentroTexto((triades[triadeTriagem]?.nome || '').toLowerCase())}
              <ConfrontoDecisivo tipo={tipo} />
              {tr.triagemOutroCentroFim}
            </div>
          </div>
        )}
        <PorQue
          rotulo={tr.comoTriagemPontuou}
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
        <Secao numero="2" titulo={tr.s2}>
          <div className="pill" style={{ fontSize: 15 }}>{tipoInfo.nome}</div>
          <p style={{ marginTop: 12 }}>{tipoInfo.nucleo}</p>
          <p style={{ marginTop: 10 }}>
            <span style={{ fontWeight: 700, color: '#12325e' }}>{tr.dorPorTras}</span>
            {tipoInfo.dorDeFundo}
          </p>
          <p className="ficha">{tr.ficha(tipoInfo.paixao, tipoInfo.fixacao)}</p>

          {tipo.ambiguo && tipo.segundo && (
            <Ambiguidade
              a={tipos[tipo.top.categoria]?.nome}
              b={tipos[tipo.segundo.categoria]?.nome}
              diferenca={diferencaTipos(conteudo, tipo.top.categoria, tipo.segundo.categoria)}
            />
          )}

          {confiabilidade.subtipoNaoReconhecido && (
            <div className="box" style={{ marginTop: 12, borderColor: '#c9b96a' }}>
              <div className="bar-olive">{tr.naoReconheceuSubtipo}</div>
              <div className="box-bd" style={{ fontSize: 13 }}>
                {tr.naoReconheceuSubtipoTexto(
                  confiabilidade.subtipoNaoReconhecido.tipo,
                  confiabilidade.subtipoNaoReconhecido.nulas,
                  confiabilidade.subtipoNaoReconhecido.total
                )}
              </div>
            </div>
          )}

          <Confirmacao confirmacao={analise.confirmacao} tipos={tipos} />

          <PorQue
            rotulo={tr.comoTipoInferido((triadeInfo?.nome || '').toLowerCase())}
            scores={soDaTriade(tipo.scores, triadeFinalKey)}
            decisivo={analise.decisivos.tipo}
            itensPorId={itensPorId}
            ambiguo={tipo.ambiguo}
            segundo={tipo.segundo}
            rotuladorNome={(k) => tr.rotuloTipo(k)}
          />
          <Confrontos tipo={tipo} />
        </Secao>
      ) : (
        <Secao numero="2" titulo={tr.s2}>
          <SemResultado>{tr.semTipo}</SemResultado>
        </Secao>
      )}

      {/* 3. INSTINTO / SUBTIPO */}
      <Secao numero="3" titulo={tr.s3}>
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
            {instintoKey ? tr.subtipoSemTipo : tr.semInstinto}
          </p>
        )}
        <PorQue
          rotulo={tr.comoInstintoInferido}
          scores={instinto.scores}
          decisivo={null}
          itensPorId={itensPorId}
          ambiguo={instinto.ambiguo}
          segundo={instinto.segundo}
          rotuladorNome={(k) => rotulos.instinto[k] || k}
        />
      </Secao>

      {/* 4. CONFIABILIDADE */}
      <Secao numero="4" titulo={tr.s4}>
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
          {tr.confianca(rotulos.confianca[confiabilidade.confiancaAutorrelato])}
        </span>

        <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
          <li>
            <strong>{tr.nulasRotulo}</strong>{' '}
            {confiabilidade.nulas
              ? tr.nulasTexto(confiabilidade.nulas.marcadas, confiabilidade.nulas.total, confiabilidade.nulas.nivel)
              : tr.naoMedido}
          </li>
          <li>
            <strong>{tr.desejabilidadeRotulo}</strong>{' '}
            {tr.desejabilidadeTexto(
              confiabilidade.desejabilidade.marcadas,
              confiabilidade.desejabilidade.total,
              confiabilidade.desejabilidade.nivel
            )}
          </li>
          <li>
            <strong>{tr.deliberacaoRotulo}</strong>{' '}
            {tr.deliberacaoTexto(
              confiabilidade.deliberacao.nivel,
              confiabilidade.deliberacao.total > 0
                ? ` (${confiabilidade.deliberacao.deliberadas}/${confiabilidade.deliberacao.total})`
                : ''
            )}
          </li>
          <li>
            <strong>{tr.gemeosRotulo}</strong>{' '}
            {confiabilidade.divergenciasGemeas.length === 0
              ? tr.gemeosSem
              : tr.gemeosCom(confiabilidade.divergenciasGemeas.length)}
          </li>
        </ul>

        {confiabilidade.notas.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {notasTraduzidas(confiabilidade, tr).map((n, i) => (
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
            <p style={{ fontWeight: 700, color: '#12325e', marginBottom: 6 }}>{tr.divergenciasTitulo}</p>
            {confiabilidade.divergenciasGemeas.map((d, i) => (
              <div key={i} className="box" style={{ marginBottom: 8 }}>
                <div className="box-bd" style={{ fontSize: 13 }}>
                  {d.contextos.map((c) => (
                    <div key={c.itemId}>
                      <span style={{ color: 'var(--aqua-2)', fontWeight: 700 }}>
                        {tr.dominioCurto[c.dominio] || c.dominio}:
                      </span>{' '}
                      “{c.textoEscolha}”
                    </div>
                  ))}
                  <p style={{ marginTop: 8, marginBottom: 0, fontSize: 11.5, color: '#666' }}>
                    {tr.divergenciasTexto}
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
      <p style={{ fontSize: 11.5, color: '#5a5a5a', marginTop: 0 }}>{tr.ressalva}</p>
      <div style={{ marginTop: 10 }}>
        <button onClick={onRestart} className="bevel-btn">{tr.refazer}</button>
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
  const { t, conteudo } = useIdioma();
  const tr = t.relatorio;
  const a = tipo.top ? tipo.top.categoria : null;
  const b = tipo.segundo && tipo.segundo.score > 0 ? tipo.segundo.categoria : null;
  const segundoInfo = a != null && b != null ? conteudo.tipos[b] : null;

  return (
    <Secao numero="5" titulo={tr.s5}>
      <p style={{ marginTop: 0 }}>
        {tr.passo1}
        {segundoInfo ? tr.passo1ComSegundo : tr.passo1SemSegundo}
      </p>
      {segundoInfo && (
        <>
          <p>{tr.segundoCandidato(segundoInfo.nome, diferencaTipos(conteudo, a, b))}</p>
          <details style={{ marginTop: 4 }}>
            <summary className="retro-link" style={{ fontSize: 12.5 }}>
              {tr.lerDescricao(segundoInfo.nome)}
            </summary>
            <p style={{ marginTop: 8 }}>{segundoInfo.nucleo}</p>
            <p style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: '#12325e' }}>{tr.dorPorTras}</span>
              {segundoInfo.dorDeFundo}
            </p>
          </details>
        </>
      )}
      <p>{tr.passo2}</p>
    </Secao>
  );
}

/**
 * Arquivo de respostas anonimo, para validar o teste com pessoas ja tipadas.
 * Nada e enviado: o arquivo e gerado no navegador e baixado pela propria pessoa.
 */
function Contribuir({ analise, itensPorId, respostasPorFase, assinatura }) {
  const { t, conteudo } = useIdioma();
  const tr = t.relatorio;
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
    <Secao numero="6" titulo={tr.s6}>
      <p style={{ marginTop: 0, fontSize: 13 }}>{tr.contribuirP1}</p>
      <p style={{ fontSize: 13 }}>{tr.contribuirP2}</p>

      <label style={estiloCampo}>
        <span style={estiloRotulo}>{tr.meuTipo}</span>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={estiloSelect}>
          <option value="">{tr.naoSei}</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={n}>
              {tr.tipoN(n)}
            </option>
          ))}
        </select>
      </label>
      <label style={estiloCampo}>
        <span style={estiloRotulo}>{tr.meuInstinto}</span>
        <select value={instinto} onChange={(e) => setInstinto(e.target.value)} style={estiloSelect}>
          <option value="">{tr.naoSei}</option>
          {['autopreservacao', 'social', 'sexual'].map((k) => (
            <option key={k} value={k}>
              {conteudo.rotulos.instinto[k]}
            </option>
          ))}
        </select>
      </label>
      <label style={estiloCampo}>
        <span style={estiloRotulo}>{tr.comoSei}</span>
        <select value={fonte} onChange={(e) => setFonte(e.target.value)} style={estiloSelect} disabled={!tipo}>
          <option value="">{tr.prefiroNaoDizer}</option>
          <option value="entrevista">{tr.fonteEntrevista}</option>
          <option value="outro-teste">{tr.fonteOutroTeste}</option>
          <option value="auto-observacao">{tr.fonteAutoObservacao}</option>
        </select>
      </label>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={baixar} className="aqua-btn" style={{ fontSize: 13, padding: '6px 18px' }}>
          {tr.baixar}
        </button>
        {baixado && <span style={{ fontSize: 12, color: '#1c5c1c' }}>{tr.baixado}</span>}
      </div>
    </Secao>
  );
}

/** So os tipos de uma triade, para as barras nao compararem taxas de blocos diferentes. */
function soDaTriade(scores, triadeKey) {
  return Object.fromEntries(Object.entries(scores || {}).filter(([k]) => TRIADE_DE[Number(k)] === triadeKey));
}

/** Frase curta com o confronto direto que decidiu o tipo (para o aviso de divergencia). */
function ConfrontoDecisivo({ tipo }) {
  const { t } = useIdioma();
  const c = tipo.confrontoFinal;
  if (!c || !tipo.top) return null;
  const venc = tipo.top.categoria;
  const rival = c.a === venc ? c.b : c.a;
  const [ev, er] = c.a === venc ? [c.escolhasA, c.escolhasB] : [c.escolhasB, c.escolhasA];
  return t.relatorio.confrontoDecisivo(venc, rival, ev, er);
}

/**
 * Confrontos diretos entre os vencedores de cada centro testado: so as perguntas em
 * que os dois tipos eram opcao (Fase 1 e itens cruzados daquele par).
 */
function Confrontos({ tipo }) {
  const { t } = useIdioma();
  const tr = t.relatorio;
  if (!tipo.confrontos || !tipo.confrontos.length) return null;
  return (
    <details style={{ marginTop: 8 }}>
      <summary className="retro-link" style={{ fontSize: 12.5 }}>
        {tr.comoComparados}
      </summary>
      <p style={{ marginTop: 8, fontSize: 12.5, color: '#333' }}>{tr.comoComparadosTexto}</p>
      <ul style={{ marginTop: 4, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
        {tipo.confrontos.map((c) => (
          <li key={`${c.a}-${c.b}`}>{tr.confrontoLinha(c)}</li>
        ))}
      </ul>
    </details>
  );
}

/**
 * O que a pessoa respondeu nas afirmacoes finais sobre si mesma, e o que isso
 * mudou. E a unica parte do teste em que ela fala de si diretamente, entao vale
 * mostrar por inteiro: as frases, a resposta dada, e se elas confirmaram ou
 * corrigiram o que as situacoes tinham apurado.
 */
function Confirmacao({ confirmacao, tipos }) {
  const { t, idioma } = useIdioma();
  const tr = t.relatorio;
  if (!confirmacao || !confirmacao.aplicada) return null;
  const nome = (n) => tipos[n]?.nome || tr.rotuloTipo(n);
  const pares = Object.entries(confirmacao.detalhe || {});
  return (
    <>
      {confirmacao.trocou && (
        <div className="box" style={{ marginTop: 12, borderColor: '#c9b96a' }}>
          <div className="bar-olive">{tr.confirmouTroca}</div>
          <div className="box-bd" style={{ fontSize: 13 }}>
            {tr.confirmouTrocaTexto(nome(confirmacao.de), nome(confirmacao.para))}
          </div>
        </div>
      )}
      <details style={{ marginTop: 8 }}>
        <summary className="retro-link" style={{ fontSize: 12.5 }}>
          {tr.confirmacaoResumo}
        </summary>
        <p style={{ marginTop: 8, fontSize: 12.5, color: '#333' }}>{tr.confirmacaoTexto}</p>
        {pares.map(([n, lst]) => (
          <div key={n} style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: '#12325e' }}>
              {tr.confirmacaoLinha(
                nome(Number(n)),
                tr.confirmacaoGrau(lst.reduce((a, b) => a + b.valor, 0) / lst.length)
              )}
            </div>
            <ul style={{ marginTop: 4, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
              {lst.map((d) => (
                <li key={d.itemId}>
                  “{textoNoIdioma(d, 'afirmacao', idioma)}”{' '}
                  <span style={{ color: '#5a6b7a' }}>→ {textoNoIdioma(d, 'resposta', idioma)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </details>
    </>
  );
}

function SemResultado({ children }) {
  const { t } = useIdioma();
  return (
    <div className="box" style={{ borderColor: '#c9b96a' }}>
      <div className="bar-olive">{t.relatorio.resultadoInconclusivo}</div>
      <div className="box-bd" style={{ fontSize: 13, lineHeight: 1.55 }}>
        {children}
      </div>
    </div>
  );
}

function Ambiguidade({ a, b, diferenca }) {
  const { t } = useIdioma();
  const tr = t.relatorio;
  return (
    <div className="box" style={{ marginTop: 12, borderColor: '#c9b96a' }}>
      <div className="bar-olive">{tr.ambiguidadeTitulo}</div>
      <div className="box-bd" style={{ fontSize: 13 }}>
        {tr.ambiguidadeTexto(a, b, diferenca)}
      </div>
    </div>
  );
}

/** Mostra a distribuicao e cita a resposta decisiva. */
function PorQue({ rotulo, scores, decisivo, itensPorId, ambiguo, segundo, rotuladorNome }) {
  const { t, idioma } = useIdioma();
  const tr = t.relatorio;
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
          <strong>{tr.respostaDecisiva}</strong>{' '}
          {tr.respostaDecisivaTexto(
            truncar(textoNoIdioma(itemDecisivo, 'cenario', idioma), 70),
            truncar(textoNoIdioma(altDecisiva, 'texto', idioma), 80)
          )}
        </p>
      )}
      {ambiguo && segundo && (
        <p style={{ marginTop: 6, fontSize: 11.5, color: '#666' }}>
          {tr.margemEstreita(rotuladorNome(segundo.categoria))}
        </p>
      )}
    </details>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * As notas de confiabilidade nascem em portugues dentro do motor. Quando a nota
 * tem codigo, o relatorio a escreve no idioma da tela; sem codigo, usa o texto
 * como veio.
 */
function notasTraduzidas(confiabilidade, tr) {
  const codigos = confiabilidade.notasCodigos || [];
  if (!codigos.length) return confiabilidade.notas;
  return codigos.map((c, i) => (tr.notas[c.codigo] ? tr.notas[c.codigo](c) : confiabilidade.notas[i]));
}

function coerce(k) {
  const n = Number(k);
  return Number.isInteger(n) && String(n) === k ? n : k;
}

function corConfianca(nivel) {
  if (nivel === 'alto') return { background: '#d8f0d8', color: '#1c5c1c', border: '1px solid #6fae6f' };
  if (nivel === 'medio') return { background: '#fdeecb', color: '#7a5310', border: '1px solid #d1a53c' };
  return { background: '#f7d6d6', color: '#8a2020', border: '1px solid #cf7a7a' };
}

function truncar(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

/**
 * Diferenca central entre dois tipos. O mapa dos 36 pares mora no conteudo
 * (results.js / results.en.js), porque e texto e precisa existir nos dois
 * idiomas. Se faltar um par, cai na paixao e na fixacao de cada um.
 */
function diferencaTipos(conteudo, a, b) {
  const par = [a, b].sort((x, y) => x - y).join('-');
  if (conteudo.diferencas[par]) return conteudo.diferencas[par];
  const [ta, tb] = [conteudo.tipos[a], conteudo.tipos[b]];
  if (!ta || !tb) return conteudo.semPar;
  return conteudo.porPaixao(a, ta, b, tb);
}
