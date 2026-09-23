/**
 * MOTOR DE PONTUACAO — camada separada da UI, testavel isoladamente.
 *
 * Implementa a formula de score composto descrita no design do instrumento:
 *
 *   contribuicao = peso_base
 *                × fator_gemeo          (consistencia entre itens gemeos)
 *                × fator_imediatismo    (resposta rapida/passional vs deliberada)
 *                × fator_confiabilidade (ajuste por desejabilidade social)
 *
 * O motor NAO conhece React nem o DOM. Recebe:
 *   respostas: [{ itemId, altId, rtMs }]
 *   itens:     [ objeto-de-pergunta do questions.json ]
 * e devolve estruturas de dados puras.
 *
 * IMPORTANTE (honestidade metodologica): os limiares abaixo sao HEURISTICAS
 * transparentes e ajustaveis, NAO valores validados por amostra empirica.
 */

// ---------------------------------------------------------------------------
// Constantes / limiares ajustaveis
// ---------------------------------------------------------------------------

export const LIMIARES = {
  // Imediatismo: razao entre o tempo do item e a mediana da pessoa naquela fase.
  imediato: 0.6, //  <= 0.6 da mediana => resposta rapida/visceral
  deliberado: 1.8, //  >= 1.8 da mediana => resposta muito deliberada
  rtMinMs: 200, // piso para evitar divisao por ruido
  rtRatioMax: 4, // teto para nao deixar um outlier dominar

  // Consistencia entre gemeos
  gemeoConsistente: 1.1,
  gemeoDivergente: 0.9,

  // Imediatismo (fatores multiplicativos)
  imediatoBase: 1.1,
  imediatoPaixao: 1.2, // resposta rapida numa alternativa de eixo "paixao"
  deliberadoBase: 0.85,
  deliberadoVisceral: 0.8, // deliberar num item que deveria ser visceral

  // Desejabilidade social
  desejabilidadeAlvo: 0.4, // proporcao "esperada" de escolhas elogiaveis (heuristica)
  desejabilidadeAlto: 0.66, // acima disso => sinal forte de auto-apresentacao favoravel
  desejabilidadeModerado: 0.5,

  // Confiabilidade (fatores aplicados as contribuicoes)
  penalDiretoAlto: 0.85, // itens de autorrelato direto perdem peso se desejabilidade alta
  penalDiretoModerado: 0.95,
  bonusIndiretoAlto: 1.1, // itens projetivos/indiretos ganham peso relativo

  // Ambiguidade: margem relativa (top1 - top2) / top1 abaixo disso => empate tecnico
  margemAmbiguo: 0.15,

  // "Nenhuma dessas se parece comigo": proporcao de uso que reduz a confianca
  nulasModerado: 0.15,
  nulasAlto: 0.3,
};

// ---------------------------------------------------------------------------
// Utilitarios
// ---------------------------------------------------------------------------

function mediana(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function indexarItens(itens) {
  const porId = new Map();
  for (const it of itens) porId.set(it.id, it);
  return porId;
}

function altDe(item, altId) {
  return item.alternativas.find((a) => a.id === altId) || null;
}

/** Chave da categoria pontuada, conforme a fase. */
function chaveCategoria(alt, campo) {
  return alt.mapa[campo];
}

// ---------------------------------------------------------------------------
// Contexto global (mediana de tempo + desejabilidade social)
// ---------------------------------------------------------------------------

/**
 * Calcula sinais que dependem do conjunto de respostas como um todo:
 *  - medianaRt: mediana do tempo de resposta (para normalizar imediatismo)
 *  - desejabilidade: quantas opcoes "elogiaveis" a pessoa marcou vs esperado
 *  - deliberacao: proporcao de respostas muito deliberadas em itens viscerais
 */
export function calcularContexto(respostas, itens) {
  const porId = indexarItens(itens);
  const tempos = respostas.map((r) => r.rtMs).filter((t) => typeof t === 'number' && t > 0);
  const medRt = Math.max(mediana(tempos), LIMIARES.rtMinMs);

  // Desejabilidade social
  let desejTotal = 0;
  let desejMarcadas = 0;
  for (const r of respostas) {
    const item = porId.get(r.itemId);
    if (!item || !item.flag_desejabilidade_social) continue;
    desejTotal += 1;
    const alt = altDe(item, r.altId);
    if (alt && alt.desejavel) desejMarcadas += 1;
  }
  const razaoDesej = desejTotal > 0 ? desejMarcadas / desejTotal : 0;
  let nivelDesej = 'baixo';
  if (desejTotal > 0) {
    if (razaoDesej >= LIMIARES.desejabilidadeAlto) nivelDesej = 'alto';
    else if (razaoDesej >= LIMIARES.desejabilidadeModerado) nivelDesej = 'moderado';
  }

  // Deliberacao em itens viscerais (eixo paixao/emocao)
  let visceralTotal = 0;
  let visceralDeliberado = 0;
  for (const r of respostas) {
    const item = porId.get(r.itemId);
    if (!item) continue;
    const alt = altDe(item, r.altId);
    if (!alt) continue;
    const visceral = alt.eixo === 'paixao' || alt.eixo === 'emocao';
    if (!visceral) continue;
    visceralTotal += 1;
    const ratio = Math.min((r.rtMs || medRt) / medRt, LIMIARES.rtRatioMax);
    if (ratio >= LIMIARES.deliberado) visceralDeliberado += 1;
  }
  const taxaDeliberacao = visceralTotal > 0 ? visceralDeliberado / visceralTotal : 0;

  // Respostas "Nenhuma dessas se parece comigo"
  let nulasTotal = 0;
  let nulasMarcadas = 0;
  for (const r of respostas) {
    const item = porId.get(r.itemId);
    if (!item) continue;
    nulasTotal += 1;
    const alt = altDe(item, r.altId);
    if (alt && alt.nula) nulasMarcadas += 1;
  }
  const razaoNulas = nulasTotal > 0 ? nulasMarcadas / nulasTotal : 0;

  return {
    medianaRt: medRt,
    nulas: {
      total: nulasTotal,
      marcadas: nulasMarcadas,
      razao: razaoNulas,
      nivel:
        razaoNulas >= LIMIARES.nulasAlto
          ? 'alto'
          : razaoNulas >= LIMIARES.nulasModerado
            ? 'moderado'
            : 'baixo',
    },
    desejabilidade: {
      total: desejTotal,
      marcadas: desejMarcadas,
      razao: razaoDesej,
      nivel: nivelDesej,
    },
    deliberacao: {
      total: visceralTotal,
      deliberadas: visceralDeliberado,
      taxa: taxaDeliberacao,
      nivel: taxaDeliberacao >= 0.4 ? 'alto' : taxaDeliberacao >= 0.2 ? 'moderado' : 'baixo',
    },
  };
}

// ---------------------------------------------------------------------------
// Fatores individuais
// ---------------------------------------------------------------------------

function fatorImediatismo(rtMs, medRt, alt) {
  const ratio = Math.min((rtMs || medRt) / medRt, LIMIARES.rtRatioMax);
  if (ratio <= LIMIARES.imediato) {
    // Resposta rapida => reacao automatica/passional real. Peso extra na paixao.
    return alt.eixo === 'paixao' ? LIMIARES.imediatoPaixao : LIMIARES.imediatoBase;
  }
  if (ratio >= LIMIARES.deliberado) {
    const visceral = alt.eixo === 'paixao' || alt.eixo === 'emocao';
    return visceral ? LIMIARES.deliberadoVisceral : LIMIARES.deliberadoBase;
  }
  return 1.0;
}

function fatorConfiabilidade(item, alt, nivelDesej) {
  const indireto = !!item.indireto;
  if (nivelDesej === 'alto') {
    return indireto ? LIMIARES.bonusIndiretoAlto : LIMIARES.penalDiretoAlto;
  }
  if (nivelDesej === 'moderado') {
    return indireto ? 1.0 : LIMIARES.penalDiretoModerado;
  }
  return 1.0;
}

/**
 * Compara os itens gemeos. Devolve:
 *  - fatorPorItem: Map itemId -> fator (consistente/divergente/1.0)
 *  - divergencias: lista descritiva das divergencias (dado, nao ruido)
 */
export function analisarGemeos(respostas, itens, campo) {
  const porId = indexarItens(itens);
  const grupos = new Map(); // par_gemeo_id -> [{item, alt, resp}]
  for (const r of respostas) {
    const item = porId.get(r.itemId);
    if (!item || !item.par_gemeo_id) continue;
    const alt = altDe(item, r.altId);
    if (!alt) continue;
    if (!grupos.has(item.par_gemeo_id)) grupos.set(item.par_gemeo_id, []);
    grupos.get(item.par_gemeo_id).push({ item, alt, resp: r });
  }

  const fatorPorItem = new Map();
  const divergencias = [];
  for (const [parId, membros] of grupos) {
    if (membros.length < 2) continue;
    const chaves = membros.map((m) => chaveCategoria(m.alt, campo));
    const consistente = chaves.every((k) => k === chaves[0]);
    const fator = consistente ? LIMIARES.gemeoConsistente : LIMIARES.gemeoDivergente;
    for (const m of membros) fatorPorItem.set(m.item.id, fator);
    if (!consistente) {
      divergencias.push({
        parId,
        contextos: membros.map((m) => ({
          itemId: m.item.id,
          dominio: m.item.dominio,
          escolha: chaveCategoria(m.alt, campo),
          textoEscolha: m.alt.texto,
        })),
      });
    }
  }
  return { fatorPorItem, divergencias };
}

// ---------------------------------------------------------------------------
// Pontuacao de uma fase
// ---------------------------------------------------------------------------

/**
 * Pontua uma fase inteira.
 * @param respostas  respostas SO desta fase
 * @param itens      itens SO desta fase
 * @param campo      'triade' | 'tipo' | 'instinto'
 * @param contexto   saida de calcularContexto (pode ser do conjunto completo)
 * @param opcoes     { multiplicador(item) } fator extra por item (opcional)
 */
export function pontuarFase(respostas, itens, campo, contexto, opcoes = {}) {
  const multiplicador = opcoes.multiplicador || (() => 1);
  const ctx = contexto || calcularContexto(respostas, itens);
  const porId = indexarItens(itens);
  const { fatorPorItem: fatorGemeo, divergencias } = analisarGemeos(respostas, itens, campo);

  const scores = {}; // categoria -> soma
  const contribuicoes = []; // [{itemId, categoria, valor, fatores}]

  for (const r of respostas) {
    const item = porId.get(r.itemId);
    if (!item) continue;
    const alt = altDe(item, r.altId);
    if (!alt) continue;
    const categoria = chaveCategoria(alt, campo);
    if (categoria === null || categoria === undefined) continue;

    const fGemeo = fatorGemeo.get(item.id) || 1.0;
    const fImediato = fatorImediatismo(r.rtMs, ctx.medianaRt, alt);
    const fConf = fatorConfiabilidade(item, alt, ctx.desejabilidade.nivel);

    const valor = alt.peso * fGemeo * fImediato * fConf * multiplicador(item);
    scores[categoria] = (scores[categoria] || 0) + valor;
    contribuicoes.push({
      itemId: item.id,
      altId: alt.id,
      categoria,
      valor,
      eixo: alt.eixo,
      fatores: { peso: alt.peso, gemeo: fGemeo, imediatismo: fImediato, confiabilidade: fConf },
    });
  }

  // Ranking
  const ranking = Object.entries(scores)
    .map(([categoria, score]) => ({ categoria: coerceKey(categoria), score }))
    .sort((a, b) => b.score - a.score);

  const top = ranking[0] || null;
  const segundo = ranking[1] || null;
  const margem = top && segundo && top.score > 0 ? (top.score - segundo.score) / top.score : top ? 1 : 0;
  const ambiguo = !!(top && segundo) && margem < LIMIARES.margemAmbiguo;

  // Consistencia interna: fracao de itens que apontaram para o vencedor
  const totalItens = contribuicoes.length;
  const aoVencedor = top ? contribuicoes.filter((c) => c.categoria === top.categoria).length : 0;
  const consistenciaInterna = totalItens ? aoVencedor / totalItens : 0;

  // Item mais decisivo para o vencedor (maior contribuicao)
  let decisivo = null;
  if (top) {
    decisivo = contribuicoes
      .filter((c) => c.categoria === top.categoria)
      .sort((a, b) => b.valor - a.valor)[0] || null;
  }

  return {
    scores,
    ranking,
    top,
    segundo,
    margem,
    ambiguo,
    consistenciaInterna,
    divergenciasGemeas: divergencias,
    decisivo,
    contribuicoes,
  };
}

/**
 * Pontuacao por TAXA DE ESCOLHA quando a categoria estava disponivel.
 *
 * Problema que resolve: se um tipo aparece em mais itens do que outro, a soma
 * bruta favorece quem aparece mais (era isso que empurrava 4 e 6 para 8).
 * Aqui cada categoria recebe: (o que foi escolhido) / (o que poderia ter sido
 * escolhido nos itens em que ela era opcao). Respostas "nula" nao contam como
 * exposicao. Resultado em 0..100.
 *
 * @param componentes [{ respostas, itens, peso }]
 * @param candidatos  categorias elegiveis para o ranking (ou null = todas)
 */
export function pontuarPorTaxa(componentes, campo, contexto, candidatos = null) {
  const ctx = contexto;
  const acumulado = {}; // cat -> { soma, pesoTotal }
  const contribuicoes = [];
  const divergencias = [];

  for (const comp of componentes) {
    const porId = indexarItens(comp.itens);
    const { fatorPorItem, divergencias: div } = analisarGemeos(comp.respostas, comp.itens, campo);
    divergencias.push(...div);
    const escolhido = {};
    const exposto = {};
    for (const r of comp.respostas) {
      const item = porId.get(r.itemId);
      if (!item) continue;
      const alt = altDe(item, r.altId);
      if (!alt || alt.nula) continue;
      const fGemeo = fatorPorItem.get(item.id) || 1.0;
      const fImediato = fatorImediatismo(r.rtMs, ctx.medianaRt, alt);
      const fConf = fatorConfiabilidade(item, alt, ctx.desejabilidade.nivel);
      const valor = alt.peso * fGemeo * fImediato * fConf;
      const presentes = new Set(
        item.alternativas
          .filter((a) => !a.nula)
          .map((a) => chaveCategoria(a, campo))
          .filter((k) => k !== null && k !== undefined)
      );
      for (const k of presentes) exposto[k] = (exposto[k] || 0) + valor;
      const cat = chaveCategoria(alt, campo);
      if (cat === null || cat === undefined) continue;
      escolhido[cat] = (escolhido[cat] || 0) + valor;
      contribuicoes.push({ itemId: item.id, altId: alt.id, categoria: coerceKey(String(cat)), valor, eixo: alt.eixo });
    }
    for (const k of Object.keys(exposto)) {
      if (!acumulado[k]) acumulado[k] = { soma: 0, pesoTotal: 0 };
      acumulado[k].soma += comp.peso * ((escolhido[k] || 0) / exposto[k]);
      acumulado[k].pesoTotal += comp.peso;
    }
  }

  const permitido = candidatos ? new Set(candidatos.map(String)) : null;
  const scores = {};
  for (const [k, v] of Object.entries(acumulado)) {
    if (permitido && !permitido.has(String(k))) continue;
    scores[k] = v.pesoTotal > 0 ? (100 * v.soma) / v.pesoTotal : 0;
  }

  const ranking = Object.entries(scores)
    .map(([categoria, score]) => ({ categoria: coerceKey(categoria), score }))
    .sort((a, b) => b.score - a.score);
  const top = ranking[0] || null;
  const segundo = ranking[1] || null;
  const margem = top && segundo && top.score > 0 ? (top.score - segundo.score) / top.score : top ? 1 : 0;
  const ambiguo = !!(top && segundo) && margem < LIMIARES.margemAmbiguo;
  const validas = contribuicoes.filter((c) => !permitido || permitido.has(String(c.categoria)));
  const aoVencedor = top ? validas.filter((c) => c.categoria === top.categoria).length : 0;
  const consistenciaInterna = validas.length ? aoVencedor / validas.length : 0;
  const decisivo = top
    ? validas.filter((c) => c.categoria === top.categoria).sort((a, b) => b.valor - a.valor)[0] || null
    : null;

  return {
    scores,
    ranking,
    top,
    segundo,
    margem,
    ambiguo,
    consistenciaInterna,
    divergenciasGemeas: divergencias,
    decisivo,
    contribuicoes: validas,
  };
}

/** Categorias de tipo/instinto vem como string das chaves do objeto; recupera numero quando aplicavel. */
function coerceKey(k) {
  const n = Number(k);
  return Number.isInteger(n) && String(n) === k ? n : k;
}

// ---------------------------------------------------------------------------
// Confiabilidade agregada (para o relatorio final)
// ---------------------------------------------------------------------------

export function avaliarConfiabilidade(contexto, divergenciasGemeas, consistencias) {
  const { desejabilidade, deliberacao } = contexto;
  const notas = [];

  if (desejabilidade.total > 0 && desejabilidade.nivel === 'alto') {
    notas.push(
      'Você marcou a opção mais "elogiável" com frequência acima do esperado nos itens ' +
        'desenhados para isso. Isso reduz a confiança no autorrelato direto e faz o ' +
        'instrumento dar mais peso às suas respostas indiretas e ao ritmo das respostas. ' +
        'Por si só, esse padrão já é informação: costuma aparecer em torno dos eneatipos 1, 2 e 3.'
    );
  }
  if (deliberacao.nivel === 'alto') {
    notas.push(
      'Você deliberou bastante em itens que costumam ser respondidos de forma visceral. ' +
        'Isso pode indicar monitoramento da própria imagem ou da correção (típico da tríade mental ' +
        'e das fixações dos tipos 1 e 3), e foi levado em conta ao ponderar essas respostas.'
    );
  }
  if (contexto.nulas && contexto.nulas.nivel !== 'baixo') {
    notas.push(
      `Em ${contexto.nulas.marcadas} de ${contexto.nulas.total} perguntas você indicou que nenhuma ` +
        'alternativa se parecia com você. O resultado foi calculado só com as respostas em que você ' +
        'se reconheceu, mas vale ler as descrições dos tipos vizinhos antes de fechar uma conclusão.'
    );
  }
  if (divergenciasGemeas && divergenciasGemeas.length) {
    notas.push(
      `Suas respostas divergiram em ${divergenciasGemeas.length} par(es) de cenários quase idênticos ` +
        '(mesma tensão, contexto diferente: em público ou na intimidade). ' +
        'Isso não foi descartado como erro: indica em qual contexto sua defesa relaxa e em qual ' +
        'a persona fica mais vigiada.'
    );
  }

  // Confianca global do autorrelato
  const consMedia =
    consistencias && consistencias.length
      ? consistencias.reduce((a, b) => a + b, 0) / consistencias.length
      : 0;

  let confianca = 'alto';
  const nivelNulas = contexto.nulas ? contexto.nulas.nivel : 'baixo';
  if (
    desejabilidade.nivel === 'alto' ||
    deliberacao.nivel === 'alto' ||
    nivelNulas === 'alto' ||
    consMedia < 0.45
  ) {
    confianca = 'baixo';
  } else if (
    desejabilidade.nivel === 'moderado' ||
    deliberacao.nivel === 'moderado' ||
    nivelNulas === 'moderado' ||
    (divergenciasGemeas && divergenciasGemeas.length) ||
    consMedia < 0.6
  ) {
    confianca = 'medio';
  }

  return {
    desejabilidade,
    deliberacao,
    nulas: contexto.nulas || null,
    divergenciasGemeas: divergenciasGemeas || [],
    consistenciaInternaMedia: consMedia,
    confiancaAutorrelato: confianca,
    notas,
  };
}

// ---------------------------------------------------------------------------
// Analise final (combina tudo)
// ---------------------------------------------------------------------------

/**
 * @param dados {
 *   fase1:  { respostas, itens },
 *   fase2:  { respostas, itens },   // itens da(s) triade(s) + desempates intra-triade
 *   fase2x: { respostas, itens },   // itens cruzados (pares de triades diferentes)
 *   fase3:  { respostas, itens },
 *   fase4:  { respostas, itens },   // confirmacao de subtipo (opcional)
 * }
 * O TIPO final e decidido por taxa de escolha (nao por soma bruta), combinando
 * Fase 1, Fase 2 da triade e itens cruzados, e so entre os tipos que chegaram a
 * ser testados na Fase 2. Assim, errar a triade na Fase 1 nao condena mais o
 * resultado: os candidatos de outra triade continuam no jogo.
 */
export const PESOS = { tipoF1: 1.0, tipoF2: 1.0, tipoCruz: 1.5, instF3: 1.0, instF4: 1.5 };

const TRIADE_DO_TIPO = {
  8: 'instintiva', 9: 'instintiva', 1: 'instintiva',
  2: 'emocional', 3: 'emocional', 4: 'emocional',
  5: 'mental', 6: 'mental', 7: 'mental',
};
const TIPOS_DA_TRIADE = { instintiva: [8, 9, 1], emocional: [2, 3, 4], mental: [5, 6, 7] };

/** Tipos (sem a "nula") oferecidos como alternativa num item. */
function tiposDoItem(item) {
  return new Set(item.alternativas.filter((a) => !a.nula && a.mapa && a.mapa.tipo != null).map((a) => a.mapa.tipo));
}

/** Triade de um item em que todos os tipos oferecidos sao da mesma triade (blocos da Fase 2). */
function triadeDoItem(item) {
  const triades = new Set([...tiposDoItem(item)].map((t) => TRIADE_DO_TIPO[t]));
  return triades.size === 1 ? [...triades][0] : null;
}

/**
 * CONFRONTO DIRETO entre dois tipos: so conta as respostas a itens em que OS DOIS
 * eram opcao (Fase 1, onde os nove aparecem sempre, e os itens cruzados daquele par).
 * Assim os dois sao medidos nas mesmas perguntas. "Nenhuma dessas" nao conta para
 * nenhum dos dois.
 * @returns { a, b, pontosA, pontosB, escolhasA, escolhasB, itens, cruzados }
 */
export function confrontar(a, b, componentes, contexto) {
  const res = { a, b, pontosA: 0, pontosB: 0, escolhasA: 0, escolhasB: 0, itens: 0, cruzados: 0 };
  for (const comp of componentes) {
    const porId = indexarItens(comp.itens);
    const { fatorPorItem } = analisarGemeos(comp.respostas, comp.itens, 'tipo');
    for (const r of comp.respostas) {
      const item = porId.get(r.itemId);
      if (!item) continue;
      const tipos = tiposDoItem(item);
      if (!tipos.has(a) || !tipos.has(b)) continue;
      const alt = altDe(item, r.altId);
      if (!alt || alt.nula) continue;
      res.itens += 1;
      if (tipos.size === 2) res.cruzados += 1;
      const valor =
        alt.peso *
        (fatorPorItem.get(item.id) || 1.0) *
        fatorImediatismo(r.rtMs, contexto.medianaRt, alt) *
        fatorConfiabilidade(item, alt, contexto.desejabilidade.nivel) *
        comp.peso;
      if (alt.mapa.tipo === a) {
        res.pontosA += valor;
        res.escolhasA += 1;
      } else if (alt.mapa.tipo === b) {
        res.pontosB += valor;
        res.escolhasB += 1;
      }
    }
  }
  return res;
}

/**
 * DECISAO DO TIPO em duas etapas, sempre comparando tipos nas mesmas perguntas:
 *
 * 1. Dentro de cada triade testada na Fase 2, os tres tipos disputam por taxa de
 *    escolha na Fase 1 e no bloco daquela triade (os tres aparecem em todos esses
 *    itens). Sai um vencedor por triade.
 * 2. Os vencedores de triades diferentes disputam em CONFRONTO DIRETO (confrontar):
 *    so os itens em que os dois eram opcao. Ganha quem vence mais confrontos.
 *
 * Isso substitui a media de taxas medidas em itens diferentes, que deixava um tipo
 * ganhar com a taxa de um bloco em que o tipo da pessoa nem aparecia (ex.: um 5 que,
 * no bloco 8/9/1, marca o mais proximo) e deixava o tipo e a triade se contradizerem.
 */
export function decidirTipo({ fase1, fase2, fase2x }, contexto, pesos = PESOS) {
  const vazio = { respostas: [], itens: [] };
  const f1 = fase1 || vazio;
  const f2 = fase2 || vazio;
  const f2x = fase2x || vazio;

  // Blocos de Fase 2 por triade (inclui os desempates internos da triade).
  const blocos = {};
  const porIdF2 = indexarItens(f2.itens);
  for (const r of f2.respostas) {
    const item = porIdF2.get(r.itemId);
    const tr = item ? triadeDoItem(item) : null;
    if (!tr) continue;
    const bloco = (blocos[tr] ||= { respostas: [], itens: [] });
    bloco.respostas.push(r);
    if (!bloco.itens.includes(item)) bloco.itens.push(item);
  }
  const triades = Object.keys(blocos).length ? Object.keys(blocos) : Object.keys(TIPOS_DA_TRIADE);

  // 1. Vencedor de cada triade.
  const dentro = {};
  for (const tr of triades) {
    const comps = [{ ...f1, peso: pesos.tipoF1 }];
    if (blocos[tr]) comps.push({ ...blocos[tr], peso: pesos.tipoF2 });
    const r = pontuarPorTaxa(comps.filter((c) => c.respostas.length), 'tipo', contexto, TIPOS_DA_TRIADE[tr]);
    if (r.top && r.top.score > 0) dentro[tr] = r;
  }
  const finalistas = Object.values(dentro).map((r) => r.top.categoria);
  const divergencias = Object.values(dentro).flatMap((r) => r.divergenciasGemeas);
  const unicas = [...new Map(divergencias.map((d) => [d.parId, d])).values()];

  if (!finalistas.length) {
    return {
      scores: {}, ranking: [], top: null, segundo: null, margem: 0, ambiguo: false,
      consistenciaInterna: 0, divergenciasGemeas: unicas, decisivo: null, contribuicoes: [],
      confrontos: [], confrontoFinal: null,
    };
  }

  // 2. Confrontos diretos entre os vencedores de triades diferentes.
  const compsConfronto = [
    { ...f1, peso: pesos.tipoF1 },
    { ...f2x, peso: pesos.tipoCruz },
  ].filter((c) => c.respostas.length);
  const confrontos = [];
  for (let i = 0; i < finalistas.length; i++) {
    for (let j = i + 1; j < finalistas.length; j++) {
      confrontos.push(confrontar(finalistas[i], finalistas[j], compsConfronto, contexto));
    }
  }
  const scoreDentro = (t) => dentro[TRIADE_DO_TIPO[t]].top.score;
  const vitorias = Object.fromEntries(finalistas.map((t) => [t, 0]));
  const saldo = Object.fromEntries(finalistas.map((t) => [t, 0]));
  for (const c of confrontos) {
    if (c.pontosA > c.pontosB) vitorias[c.a] += 1;
    else if (c.pontosB > c.pontosA) vitorias[c.b] += 1;
    saldo[c.a] += c.pontosA - c.pontosB;
    saldo[c.b] += c.pontosB - c.pontosA;
  }
  const ordem = [...finalistas].sort(
    (x, y) => vitorias[y] - vitorias[x] || saldo[y] - saldo[x] || scoreDentro(y) - scoreDentro(x)
  );
  const vencedor = ordem[0];
  const doVencedor = dentro[TRIADE_DO_TIPO[vencedor]];

  // Rival mais proximo: o outro finalista com o confronto mais apertado contra o
  // vencedor, ou o segundo da propria triade, o que estiver mais perto.
  const margemDe = (p, q) => (p > 0 ? (p - q) / p : 0);
  const rivais = [];
  let confrontoFinal = null;
  for (const c of confrontos) {
    if (c.a !== vencedor && c.b !== vencedor) continue;
    const [pv, pr, rival] = c.a === vencedor ? [c.pontosA, c.pontosB, c.b] : [c.pontosB, c.pontosA, c.a];
    const m = margemDe(pv, pr);
    rivais.push({ categoria: rival, margem: m, score: scoreDentro(rival) });
    if (!confrontoFinal || m < confrontoFinal.margem) confrontoFinal = { ...c, margem: m };
  }
  const segundoDentro = doVencedor.segundo;
  if (segundoDentro && segundoDentro.score > 0) {
    rivais.push({ categoria: segundoDentro.categoria, margem: doVencedor.margem, score: segundoDentro.score });
  }
  rivais.sort((x, y) => x.margem - y.margem);
  const rival = rivais[0] || null;

  // Scores para o relatorio: taxa de cada tipo dentro da propria triade.
  const scores = {};
  for (const r of Object.values(dentro)) Object.assign(scores, r.scores);
  const top = { categoria: vencedor, score: scores[vencedor] };
  const segundo = rival ? { categoria: rival.categoria, score: scores[rival.categoria] ?? rival.score } : null;
  const resto = Object.entries(scores)
    .map(([k, v]) => ({ categoria: coerceKey(k), score: v }))
    .filter((x) => x.categoria !== vencedor && (!segundo || x.categoria !== segundo.categoria))
    .sort((a, b) => b.score - a.score);
  const margem = rival ? rival.margem : 1;

  return {
    scores,
    ranking: [top, ...(segundo ? [segundo] : []), ...resto],
    top,
    segundo,
    margem,
    ambiguo: !!rival && margem < LIMIARES.margemAmbiguo,
    consistenciaInterna: doVencedor.consistenciaInterna,
    divergenciasGemeas: unicas,
    decisivo: doVencedor.decisivo,
    contribuicoes: doVencedor.contribuicoes,
    confrontos,
    confrontoFinal,
  };
}

/**
 * CONFIRMACAO EM ESCALA
 * ---------------------
 * As afirmacoes de confirmacao nao pedem uma escolha entre tipos: pedem o quanto
 * a pessoa se identifica com uma frase sobre a propria paixao ou a propria ideia
 * central, de "me identifico completamente" (+1) a "nao me identifico nada" (-1).
 *
 * Elas entram so no fim, para o tipo apurado e para o segundo colocado, e servem
 * para tres coisas:
 *   - confirmar o tipo quando a pessoa se reconhece nele;
 *   - corrigir quando ela se reconhece MUITO mais no segundo (a apuracao pode
 *     errar quando alguem marca poucas vezes o proprio tipo);
 *   - avisar, quando ela nao se reconhece em nenhum dos dois.
 *
 * O autorrelato so derruba a apuracao quando a diferenca e grande: uma frase
 * sobre a propria neurose e facil de negar, e quem se descreve nao e testemunha
 * neutra de si (Naranjo insiste nisso). Por isso os limiares sao exigentes.
 */
export const CONFIRMACAO = {
  troca: 0.85, // o quanto o segundo precisa estar acima do primeiro para trocar
  reconhece: 0.6, // "me identifico" ou mais
  naoReconhece: 0, // "neutro" ou menos
};

/** Valor medio (-1 a 1) dado as afirmacoes de cada tipo, com o detalhe por item. */
export function pontuarConfirmacao(respostas, itens) {
  const porId = indexarItens(itens);
  const detalhe = {};
  for (const r of respostas || []) {
    const item = porId.get(r.itemId);
    if (!item || !item.escala) continue;
    const alt = altDe(item, r.altId);
    if (!alt || typeof alt.valor !== 'number') continue;
    const t = item.tipo_alvo;
    (detalhe[t] = detalhe[t] || []).push({
      itemId: item.id,
      afirmacao: item.cenario,
      resposta: alt.texto,
      valor: alt.valor,
    });
  }
  const media = {};
  for (const [t, lst] of Object.entries(detalhe)) {
    media[t] = lst.reduce((a, b) => a + b.valor, 0) / lst.length;
  }
  return { media, detalhe };
}

/**
 * Confronta a apuracao com a confirmacao em escala.
 * Devolve o tipo (trocado ou nao) e o que a confirmacao disse.
 */
export function aplicarConfirmacao(tipo, escala) {
  const vazia = { trocou: false, valorTop: null, valorSegundo: null, notas: [], aplicada: false };
  if (!tipo || !tipo.top || !escala || !Object.keys(escala.media || {}).length) {
    return { tipo, confirmacao: vazia };
  }
  const vTop = escala.media[tipo.top.categoria];
  const vSeg = tipo.segundo ? escala.media[tipo.segundo.categoria] : undefined;
  const info = {
    trocou: false,
    aplicada: true,
    valorTop: vTop ?? null,
    valorSegundo: vSeg ?? null,
    detalhe: escala.detalhe,
    notas: [],
  };

  const trocar =
    typeof vTop === 'number' &&
    typeof vSeg === 'number' &&
    vSeg - vTop >= CONFIRMACAO.troca &&
    vSeg >= CONFIRMACAO.reconhece &&
    vTop < CONFIRMACAO.reconhece;

  let saida = tipo;
  if (trocar) {
    saida = { ...tipo, top: tipo.segundo, segundo: tipo.top, trocadoNaConfirmacao: true };
    info.trocou = true;
    info.de = tipo.top.categoria;
    info.para = tipo.segundo.categoria;
    info.notas.push(
      `As perguntas de situação apontaram o tipo ${tipo.top.categoria}, mas nas afirmações finais você se ` +
        `reconheceu bem mais no tipo ${tipo.segundo.categoria}. O resultado seguiu o seu reconhecimento, e o ` +
        `tipo ${tipo.top.categoria} ficou como segundo candidato.`
    );
  } else if (typeof vTop === 'number' && vTop <= CONFIRMACAO.naoReconhece) {
    info.notas.push(
      `Você não se reconheceu nas afirmações do tipo ${saida.top.categoria}, que foi o apurado pelas situações. ` +
        'Leia também a descrição do segundo candidato antes de concluir.'
    );
  } else if (
    typeof vTop === 'number' &&
    typeof vSeg === 'number' &&
    vTop >= CONFIRMACAO.reconhece &&
    vSeg >= CONFIRMACAO.reconhece
  ) {
    info.notas.push(
      `Você se reconheceu tanto nas afirmações do tipo ${saida.top.categoria} quanto nas do tipo ` +
        `${saida.segundo.categoria}. As situações desempataram a favor do primeiro, mas vale ler os dois.`
    );
  }
  return { tipo: saida, confirmacao: info };
}

/**
 * Quantas perguntas de subtipo (Fase 4) de cada tipo a pessoa respondeu com
 * "nenhuma dessas". Se ela nao se reconhece nas perguntas do tipo encontrado, o
 * tipo provavelmente esta errado.
 */
function nulasFase4PorTipo(f4) {
  const porId = indexarItens(f4.itens);
  const cont = {};
  for (const r of f4.respostas) {
    const item = porId.get(r.itemId);
    if (!item || item.tipo_alvo == null) continue;
    const alt = altDe(item, r.altId);
    const c = (cont[item.tipo_alvo] ||= { total: 0, nulas: 0 });
    c.total += 1;
    if (alt && alt.nula) c.nulas += 1;
  }
  return cont;
}

export function analisarFinal(dados) {
  const vazio = { respostas: [], itens: [] };
  const f2x = dados.fase2x || vazio;
  const f4 = dados.fase4 || vazio;
  const cf = dados.confirmacao || vazio;
  const todas = [
    ...dados.fase1.respostas,
    ...dados.fase2.respostas,
    ...f2x.respostas,
    ...cf.respostas,
    ...dados.fase3.respostas,
    ...f4.respostas,
  ];
  const todosItens = [
    ...dados.fase1.itens,
    ...dados.fase2.itens,
    ...f2x.itens,
    ...cf.itens,
    ...dados.fase3.itens,
    ...f4.itens,
  ];
  const contexto = calcularContexto(todas, todosItens);

  const triade = pontuarFase(dados.fase1.respostas, dados.fase1.itens, 'triade', contexto);

  const apurado = decidirTipo({ fase1: dados.fase1, fase2: dados.fase2, fase2x: f2x }, contexto);
  // O autorrelato entra por ultimo, e so com margem larga (ver aplicarConfirmacao).
  const escala = pontuarConfirmacao(cf.respostas, cf.itens);
  const { tipo, confirmacao } = aplicarConfirmacao(apurado, escala);

  const instinto = pontuarPorTaxa(
    [
      { respostas: dados.fase3.respostas, itens: dados.fase3.itens, peso: PESOS.instF3 },
      { respostas: f4.respostas, itens: f4.itens, peso: PESOS.instF4 },
    ].filter((c) => c.respostas.length),
    'instinto',
    contexto
  );

  const confiabilidade = avaliarConfiabilidade(
    contexto,
    [...triade.divergenciasGemeas, ...tipo.divergenciasGemeas, ...instinto.divergenciasGemeas],
    [triade.consistenciaInterna, tipo.consistenciaInterna, instinto.consistenciaInterna]
  );

  // A pessoa nao se reconheceu na maioria das perguntas de subtipo do tipo encontrado:
  // sinal forte de que o tipo pode ser outro. Entra como nota e limita a confianca.
  const f4Nulas = tipo.top ? nulasFase4PorTipo(f4)[tipo.top.categoria] : null;
  const subtipoNaoReconhecido = !!f4Nulas && f4Nulas.total >= 2 && f4Nulas.nulas / f4Nulas.total >= 2 / 3;
  confiabilidade.subtipoNaoReconhecido = subtipoNaoReconhecido ? { tipo: tipo.top.categoria, ...f4Nulas } : null;
  if (subtipoNaoReconhecido) {
    confiabilidade.notas.push(
      `Nas perguntas de subtipo do tipo ${tipo.top.categoria}, você marcou "nenhuma dessas" em ${f4Nulas.nulas} de ` +
        `${f4Nulas.total}. Quando a pessoa não se reconhece nas variantes do tipo encontrado, o tipo pode ser outro: ` +
        'leia com atenção a descrição do segundo candidato.'
    );
    if (confiabilidade.confiancaAutorrelato === 'alto') confiabilidade.confiancaAutorrelato = 'medio';
  }

  for (const n of confirmacao.notas) confiabilidade.notas.push(n);
  confiabilidade.confirmacao = confirmacao;
  if (confirmacao.aplicada && typeof confirmacao.valorTop === 'number') {
    // Nao se reconhecer no proprio resultado e o sinal mais direto de erro de tipo.
    if (confirmacao.valorTop <= CONFIRMACAO.naoReconhece && confiabilidade.confiancaAutorrelato === 'alto') {
      confiabilidade.confiancaAutorrelato = 'medio';
    }
  }

  const subtipo = tipo.top && instinto.top ? `${tipo.top.categoria}-${instinto.top.categoria}` : null;

  return {
    contexto,
    triade,
    tipo,
    tipoApurado: apurado,
    confirmacao,
    instinto,
    subtipo,
    confiabilidade,
    decisivos: {
      triade: triade.decisivo,
      tipo: tipo.decisivo,
      gemeoRevelador: [...triade.divergenciasGemeas, ...tipo.divergenciasGemeas][0] || null,
    },
  };
}

/** Tipos que apareceram como alternativa em algum item (exceto "nula"). */
export function tiposTestados(itens) {
  const s = new Set();
  for (const it of itens) {
    for (const a of it.alternativas) {
      if (!a.nula && a.mapa && a.mapa.tipo !== null && a.mapa.tipo !== undefined) s.add(a.mapa.tipo);
    }
  }
  return [...s];
}
