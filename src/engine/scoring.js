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

  return {
    medianaRt: medRt,
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
 */
export function pontuarFase(respostas, itens, campo, contexto) {
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

    const valor = alt.peso * fGemeo * fImediato * fConf;
    scores[categoria] = (scores[categoria] || 0) + valor;
    contribuicoes.push({
      itemId: item.id,
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
      'Voce marcou a opcao mais "elogiavel" com frequencia acima do esperado nos itens ' +
        'desenhados para isso. Isso reduz a confianca no autorrelato direto e faz o ' +
        'instrumento dar mais peso as suas respostas indiretas e ao ritmo das respostas. ' +
        'Por si so, esse padrao ja e informacao: costuma aparecer em torno dos eneatipos 1, 2 e 3.'
    );
  }
  if (deliberacao.nivel === 'alto') {
    notas.push(
      'Voce deliberou bastante em itens que costumam ser respondidos de forma visceral. ' +
        'Isso pode indicar monitoramento da propria imagem/correcao (tipico da triade mental ' +
        'e das fixacoes dos tipos 1 e 3), e foi levado em conta ao ponderar essas respostas.'
    );
  }
  if (divergenciasGemeas && divergenciasGemeas.length) {
    notas.push(
      `Suas respostas divergiram em ${divergenciasGemeas.length} par(es) de cenarios quase-identicos ` +
        '(mesma tensao, contexto diferente, publico vs privado, hierarquia vs intimidade). ' +
        'Isso nao foi descartado como erro: indica em qual contexto sua defesa relaxa e em qual ' +
        'a persona fica mais vigiada.'
    );
  }

  // Confianca global do autorrelato
  const consMedia =
    consistencias && consistencias.length
      ? consistencias.reduce((a, b) => a + b, 0) / consistencias.length
      : 0;

  let confianca = 'alto';
  if (desejabilidade.nivel === 'alto' || deliberacao.nivel === 'alto' || consMedia < 0.45) {
    confianca = 'baixo';
  } else if (
    desejabilidade.nivel === 'moderado' ||
    deliberacao.nivel === 'moderado' ||
    (divergenciasGemeas && divergenciasGemeas.length) ||
    consMedia < 0.6
  ) {
    confianca = 'medio';
  }

  return {
    desejabilidade,
    deliberacao,
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
 *   fase1: { respostas, itens },
 *   fase2: { respostas, itens, triade },
 *   fase3: { respostas, itens }
 * }
 */
export function analisarFinal(dados) {
  const todas = [
    ...dados.fase1.respostas,
    ...dados.fase2.respostas,
    ...dados.fase3.respostas,
  ];
  const todosItens = [...dados.fase1.itens, ...dados.fase2.itens, ...dados.fase3.itens];
  const contexto = calcularContexto(todas, todosItens);

  const triade = pontuarFase(dados.fase1.respostas, dados.fase1.itens, 'triade', contexto);
  const tipo = pontuarFase(dados.fase2.respostas, dados.fase2.itens, 'tipo', contexto);
  const instinto = pontuarFase(dados.fase3.respostas, dados.fase3.itens, 'instinto', contexto);

  const confiabilidade = avaliarConfiabilidade(
    contexto,
    [
      ...triade.divergenciasGemeas,
      ...tipo.divergenciasGemeas,
      ...instinto.divergenciasGemeas,
    ],
    [triade.consistenciaInterna, tipo.consistenciaInterna, instinto.consistenciaInterna]
  );

  const subtipo =
    tipo.top && instinto.top ? `${tipo.top.categoria}-${instinto.top.categoria}` : null;

  return {
    contexto,
    triade,
    tipo,
    instinto,
    subtipo,
    confiabilidade,
    decisivos: {
      triade: triade.decisivo,
      tipo: tipo.decisivo,
      gemeoRevelador:
        [...triade.divergenciasGemeas, ...tipo.divergenciasGemeas][0] || null,
    },
  };
}
