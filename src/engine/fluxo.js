/**
 * FLUXO ADAPTATIVO — decide QUAIS perguntas aparecem depois de cada fase.
 * Puro (sem React), para poder ser testado e simulado fora da UI.
 *
 * Mudanca central em relacao a versao anterior: a Fase 1 deixa de ser um
 * "portao" que so libera os 3 tipos de uma triade. Ela gera uma lista de
 * candidatos, e a Fase 2 testa:
 *   1. os itens da triade vencedora;
 *   2. os itens da segunda triade, se a margem for pequena;
 *   3. itens CRUZADOS para cada par de candidatos de triades diferentes
 *      (ex.: 8 x 6, 8 x 4), que perguntam pela motivacao, nao pelo comportamento.
 */
import { pontuarFase, pontuarPorTaxa, tiposTestados, decidirTipo, LIMIARES } from './scoring.js';

export const TRIADE_DE = {
  8: 'instintiva', 9: 'instintiva', 1: 'instintiva',
  2: 'emocional', 3: 'emocional', 4: 'emocional',
  5: 'mental', 6: 'mental', 7: 'mental',
};

const TRIADES = ['instintiva', 'emocional', 'mental'];

export const FLUXO = {
  margemSegundaTriade: 0.3, // abre a segunda triade se (1a - 2a) / 1a < 0.30
  itensFase1: 12, // de 14 no banco
  maxItensTriadePrincipal: 10, // de 13 ou 14 no banco
  maxItensSegundaTriade: 5, // itens usados de cada triade extra
  maxCruzadosTotal: 4,
  maxCruzadosPorPar: 2,
  itensFase3: 6, // de 12 no banco; a Fase 4 confirma o instinto dentro do tipo
  topTiposParaCruzar: 3, // quantos tipos da Fase 1 viram candidatos
  maxCruzadosDesempate: 2,
};

/**
 * Corta uma lista para `max` itens, tirando primeiro os marcados "opcional":
 * true no banco. Assim o teste curto perde redundancia, nao cobertura.
 */
export function selecionar(itens, max) {
  if (!max || itens.length <= max) return [...itens];
  const manter = new Set();
  for (const it of itens) {
    if (it.opcional) continue;
    if (manter.size >= max) break;
    manter.add(it.id);
  }
  for (const it of itens) {
    if (manter.size >= max) break;
    manter.add(it.id);
  }
  return itens.filter((it) => manter.has(it.id));
}

export const itensFase1 = (banco) => selecionar(banco.fase1 || [], FLUXO.itensFase1);
export const itensFase3 = (banco) => selecionar(banco.fase3 || [], FLUXO.itensFase3);

function mesmoConjunto(a, b) {
  const sa = new Set(a.map(String));
  const sb = new Set(b.map(String));
  if (sa.size !== sb.size) return false;
  for (const v of sa) if (!sb.has(v)) return false;
  return true;
}

/** Intercala B dentro de A a cada `passo` itens, para os cruzados nao ficarem em bloco. */
function intercalar(a, b, passo = 3) {
  const out = [];
  let j = 0;
  a.forEach((x, i) => {
    out.push(x);
    if ((i + 1) % passo === 0 && j < b.length) out.push(b[j++]);
  });
  while (j < b.length) out.push(b[j++]);
  return out;
}

/**
 * Resultado da Fase 1 em dois niveis: triade (soma) e tipo (taxa).
 */
export function resultadoFase1(respostas, itens, contexto) {
  const triade = pontuarFase(respostas, itens, 'triade', contexto);
  const tipo = pontuarPorTaxa([{ respostas, itens, peso: 1 }], 'tipo', contexto);
  // As tres perguntas que separam os centros, pontuadas a parte. Elas perguntam
  // pelo centro diretamente, sem passar pelas alternativas de tipo, e por isso
  // valem como um segundo parecer sobre o centro.
  const itensCentro = itens.filter((i) => Array.isArray(i.separa) && i.separa.length === 2);
  const idsCentro = new Set(itensCentro.map((i) => i.id));
  const centro = itensCentro.length
    ? pontuarFase(respostas.filter((r) => idsCentro.has(r.itemId)), itensCentro, 'triade', contexto)
    : null;
  return { triade, tipo, centro };
}

/**
 * Monta a Fase 2.
 * @returns { triades, candidatos, itensTriade, itensCruzados, itens }
 */
export function planejarFase2(banco, res1) {
  const { triade, tipo } = res1;
  // Sem triade vencedora (a pessoa marcou "nenhuma dessas" em toda a Fase 1):
  // nenhuma triade e principal, e as tres entram como extras, com menos itens.
  const principal = triade.top ? triade.top.categoria : null;

  // Tipos fortes da Fase 1 (de qualquer triade) viram candidatos. Tipo com
  // pontuacao zero nunca foi escolhido e nao conta como forte, mesmo no top 3.
  const topTipos = tipo.ranking
    .filter((r) => r.score > 0)
    .slice(0, FLUXO.topTiposParaCruzar)
    .map((r) => Number(r.categoria));

  // Triades extras: a segunda triade (se a margem for pequena) e a triade de
  // qualquer tipo forte que nao pertenca a triade principal.
  const extras = [];
  const seg = triade.segundo;
  if (principal === null) {
    extras.push(...TRIADES);
  } else if (seg && triade.top.score > 0 && (triade.top.score - seg.score) / triade.top.score < FLUXO.margemSegundaTriade) {
    extras.push(seg.categoria);
  }
  for (const t of topTipos) {
    const tr = TRIADE_DE[t];
    if (tr !== principal && !extras.includes(tr)) extras.push(tr);
  }
  // Se as perguntas de centro apontam um centro diferente do que a triagem
  // apontou, esse centro entra. E o caso de quem nao se reconhece nas
  // alternativas do proprio tipo, mas reconhece o proprio centro: sem isso, o
  // centro dela nunca seria testado e o tipo sairia da triade errada.
  const centro = res1.centro;
  if (centro && centro.top && centro.top.score > 0 && !centro.ambiguo) {
    const tr = centro.top.categoria;
    if (tr !== principal && !extras.includes(tr)) extras.push(tr);
  }
  const triades = principal === null ? extras : [principal, ...extras];

  let itensTriade =
    principal === null
      ? []
      : selecionar((banco.fase2 && banco.fase2[principal]) || [], FLUXO.maxItensTriadePrincipal);
  for (const tr of extras) {
    itensTriade = itensTriade.concat(
      selecionar((banco.fase2 && banco.fase2[tr]) || [], FLUXO.maxItensSegundaTriade)
    );
  }
  const candidatos = new Set(tiposTestados(itensTriade));
  topTipos.forEach((t) => candidatos.add(t));
  const lista = [...candidatos];

  // Pares de candidatos de triades diferentes -> itens cruzados
  const pool = banco.fase2_cruzada || [];
  const usados = new Set();
  const itensCruzados = [];
  for (const a of topTipos) {
    for (const b of lista) {
      if (a === b || TRIADE_DE[a] === TRIADE_DE[b]) continue;
      // so cruza com tipos que tambem pontuaram na Fase 1 (evita perguntas inuteis)
      if (!topTipos.includes(b)) continue;
      const doPar = pool.filter((it) => Array.isArray(it.separa) && mesmoConjunto(it.separa, [a, b]));
      for (const it of doPar.slice(0, FLUXO.maxCruzadosPorPar)) {
        if (usados.has(it.id)) continue;
        if (itensCruzados.length >= FLUXO.maxCruzadosTotal) break;
        usados.add(it.id);
        itensCruzados.push(it);
      }
    }
  }

  return {
    triades,
    candidatos: lista,
    itensTriade,
    itensCruzados,
    itens: intercalar(itensTriade, itensCruzados),
  };
}

/**
 * Itens extras quando o tipo final ficou ambiguo entre dois candidatos.
 * Usa desempate intra-triade ou o restante dos itens cruzados do par.
 */
export function itensDesempateTipo(banco, par, jaPresentes) {
  const ids = new Set(jaPresentes.map((i) => i.id));
  const [a, b] = par.map(Number);
  if (TRIADE_DE[a] === TRIADE_DE[b]) {
    const pool = (banco.fase2_desempate && banco.fase2_desempate[TRIADE_DE[a]]) || [];
    return pool.filter((it) => !ids.has(it.id) && Array.isArray(it.separa) && mesmoConjunto(it.separa, [a, b]));
  }
  return (banco.fase2_cruzada || [])
    .filter((it) => !ids.has(it.id) && Array.isArray(it.separa) && mesmoConjunto(it.separa, [a, b]))
    .slice(0, FLUXO.maxCruzadosDesempate);
}

/** Itens de confirmacao de subtipo para o(s) tipo(s) encontrado(s). */
export function itensFase4(banco, tipos) {
  const out = [];
  for (const t of tipos) {
    const lst = (banco.fase4 && banco.fase4[String(t)]) || [];
    out.push(...lst);
  }
  return out;
}

/**
 * Afirmacoes de confirmacao dos tipos dados (o apurado e o segundo colocado).
 * Sao as unicas perguntas do teste em que a pessoa fala de si em vez de escolher
 * uma cena, e por isso vem no fim: ate aqui ela ja respondeu sem saber o que
 * cada alternativa media.
 */
export function candidatosParaConfirmar(prov) {
  if (!prov || !prov.top) return [];
  const top = prov.top.categoria;
  // O segundo do confronto; se o vencedor limpou a triade e nao sobrou rival,
  // vale o tipo mais pontuado depois dele, contanto que tenha sido escolhido.
  const seg =
    (prov.segundo && prov.segundo.categoria) ??
    ((prov.ranking || []).find((r) => r.categoria !== top && r.score > 0) || {}).categoria;
  return seg == null ? [top] : [top, seg];
}

export function itensConfirmacao(banco, tipos) {
  const out = [];
  for (const t of tipos || []) {
    const lst = (banco.confirmacao || {})[String(t)] || [];
    out.push(...lst);
  }
  return out;
}

/** Tipo provisorio ao fim da Fase 2 (mesma regra do relatorio final). */
export function tipoProvisorio(fase1, fase2, fase2x, contexto, pesos) {
  return decidirTipo({ fase1, fase2, fase2x }, contexto, pesos);
}

/**
 * Par que ainda precisa de perguntas extras ao fim da Fase 2, ou null:
 * - o tipo ficou ambiguo entre dois candidatos; ou
 * - o vencedor foi decidido contra um tipo de outra triade sem nenhuma pergunta
 *   cruzada entre os dois (so pela Fase 1): antes de fechar, pergunta direto.
 */
export function parParaConfirmar(prov) {
  if (!prov || !prov.top) return null;
  if (prov.ambiguo && prov.segundo) return [prov.top.categoria, prov.segundo.categoria];
  const c = prov.confrontoFinal;
  if (c && c.cruzados === 0) return [c.a, c.b];
  return null;
}

export { LIMIARES };
