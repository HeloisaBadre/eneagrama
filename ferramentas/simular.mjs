/**
 * Simulacao comparativa: banco/motor ATUAL x banco/motor PROPOSTO.
 *
 * Respondentes sinteticos: 27 personas (9 tipos x 3 instintos). Cada persona
 * escolhe a alternativa do PROPRIO tipo com probabilidade pSelf; quando o
 * proprio tipo nao esta disponivel no item (ou no complemento de pSelf), escolhe
 * entre os tipos "parecidos por comportamento" segundo Naranjo (mapa PARECIDOS).
 *
 * Isto NAO e validacao empirica: e um teste de VIES ESTRUTURAL. O mesmo modelo
 * de respondente roda nos dois bancos; o que muda e so o instrumento.
 */
import { readFileSync } from 'node:fs';

// NOVO  = raiz do projeto (padrao: o diretorio de onde o script e chamado)
// ORIG   = opcional, uma copia de uma versao anterior do projeto para comparar
//          (ex.: ORIG=../eneagrama-antigo node ferramentas/simular.mjs)
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const NOVO = resolve(process.env.NOVO || process.cwd());
const ORIG = process.env.ORIG ? resolve(process.env.ORIG) : null;
const url = (p) => pathToFileURL(p).href;

const novoEng = await import(url(`${NOVO}/src/engine/scoring.js`));
const fluxo = await import(url(`${NOVO}/src/engine/fluxo.js`));
const bancoN = JSON.parse(readFileSync(`${NOVO}/src/data/questions.json`, 'utf8'));
const antigo = ORIG ? await import(url(`${ORIG}/src/engine/scoring.js`)) : null;
const bancoA = ORIG ? JSON.parse(readFileSync(`${ORIG}/src/data/questions.json`, 'utf8')) : null;

// LONGO=1 roda o fluxo sem os cortes do modo curto (para comparar tamanho x acerto)
if (process.env.LONGO) {
  Object.assign(fluxo.FLUXO, {
    itensFase1: 14,
    maxItensTriadePrincipal: 99,
    maxItensSegundaTriade: 6,
    maxCruzadosTotal: 99,
    itensFase3: 12,
  });
}

const TRIADE_DE = fluxo.TRIADE_DE;
const INSTINTOS = ['autopreservacao', 'social', 'sexual'];

// --- Mapa de confusoes comportamentais (derivado dos livros de Naranjo) -----
// Para cada subtipo: com quais TIPOS ele se confunde quando nao encontra o seu.
const PARECIDOS = {
  '8-autopreservacao': [[7, 3], [5, 2], [1, 2], [6, 2], [9, 1]],
  '8-social': [[2, 3], [6, 3], [7, 2], [1, 2], [3, 1]],
  '8-sexual': [[4, 3], [2, 3], [7, 2], [6, 2], [3, 1]],
  '9-autopreservacao': [[5, 3], [8, 3], [6, 2], [1, 2], [2, 1]],
  '9-social': [[2, 3], [3, 3], [6, 2], [7, 2], [1, 1]],
  '9-sexual': [[4, 3], [2, 3], [6, 2], [5, 2], [3, 1]],
  '1-autopreservacao': [[6, 3], [3, 3], [2, 2], [5, 2], [9, 1]],
  '1-social': [[5, 3], [6, 3], [3, 2], [8, 2], [2, 1]],
  '1-sexual': [[8, 4], [4, 2], [6, 2], [3, 1], [2, 1]],
  '2-autopreservacao': [[4, 3], [9, 3], [7, 2], [6, 2], [3, 1]],
  '2-social': [[3, 4], [7, 2], [8, 2], [1, 1], [6, 1]],
  '2-sexual': [[8, 3], [4, 3], [7, 2], [3, 2], [6, 1]],
  '3-autopreservacao': [[1, 4], [6, 2], [9, 2], [5, 1], [2, 1]],
  '3-social': [[7, 3], [8, 3], [2, 2], [1, 1], [6, 1]],
  '3-sexual': [[2, 3], [9, 2], [4, 2], [7, 2], [6, 1]],
  '4-autopreservacao': [[1, 3], [8, 3], [3, 2], [5, 2], [6, 1]],
  '4-social': [[9, 3], [6, 3], [5, 2], [2, 2], [3, 1]],
  '4-sexual': [[8, 4], [2, 3], [1, 2], [6, 1], [3, 1]],
  '5-autopreservacao': [[9, 3], [6, 2], [1, 2], [4, 2], [8, 1]],
  '5-social': [[1, 3], [6, 2], [7, 2], [3, 2], [9, 1]],
  '5-sexual': [[4, 4], [9, 2], [6, 2], [2, 1], [7, 1]],
  '6-autopreservacao': [[9, 3], [2, 3], [5, 2], [4, 2], [1, 1]],
  '6-social': [[1, 4], [5, 2], [3, 2], [9, 1], [2, 1]],
  '6-sexual': [[8, 4], [1, 2], [3, 2], [7, 1], [5, 1]],
  '7-autopreservacao': [[8, 4], [3, 2], [2, 2], [5, 1], [9, 1]],
  '7-social': [[2, 3], [1, 3], [9, 2], [3, 1], [5, 1]],
  '7-sexual': [[2, 3], [4, 2], [9, 2], [3, 2], [5, 1]],
};

// --- RNG deterministico ----------------------------------------------------
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function escolherPeso(pares, rand) {
  const total = pares.reduce((a, b) => a + b[1], 0);
  if (!total) return null;
  let x = rand() * total;
  for (const [v, p] of pares) {
    x -= p;
    if (x <= 0) return v;
  }
  return pares[pares.length - 1][0];
}

// --- Persona ---------------------------------------------------------------
function responder(item, persona, rand, opts) {
  const alts = item.alternativas.filter((a) => !a.nula);
  const nula = item.alternativas.find((a) => a.nula);
  const campo = item.alternativas.some((a) => a.mapa.instinto)
    ? 'instinto'
    : alts.some((a) => a.mapa.tipo != null)
      ? 'tipo'
      : 'triade';

  let escolha = null;
  if (campo === 'instinto') {
    const meus = alts.filter((a) => a.mapa.instinto === persona.instinto);
    if (meus.length && rand() < opts.pInstinto) escolha = meus[Math.floor(rand() * meus.length)];
    else {
      const outros = alts.filter((a) => a.mapa.instinto !== persona.instinto);
      escolha = (outros.length ? outros : alts)[Math.floor(rand() * (outros.length || alts.length))];
    }
  } else if (campo === 'triade') {
    const minha = TRIADE_DE[persona.tipo];
    const meus = alts.filter((a) => a.mapa.triade === minha);
    if (meus.length && rand() < opts.pSelf) escolha = meus[Math.floor(rand() * meus.length)];
    else {
      // cai na triade do tipo parecido mais forte disponivel
      const pares = PARECIDOS[persona.chave]
        .map(([t, p]) => [TRIADE_DE[t], p])
        .filter(([tr]) => alts.some((a) => a.mapa.triade === tr));
      const tr = escolherPeso(pares, rand);
      const cand = alts.filter((a) => a.mapa.triade === (tr || minha));
      escolha = (cand.length ? cand : alts)[Math.floor(rand() * (cand.length || alts.length))];
    }
  } else {
    const meus = alts.filter((a) => a.mapa.tipo === persona.tipo);
    const usarProprio = meus.length && rand() < opts.pSelf;
    if (usarProprio) {
      escolha = meus[Math.floor(rand() * meus.length)];
    } else {
      const disponiveis = new Set(alts.map((a) => a.mapa.tipo));
      const pares = PARECIDOS[persona.chave].filter(([t]) => disponiveis.has(t));
      const t = escolherPeso(pares, rand);
      if (t != null) {
        const cand = alts.filter((a) => a.mapa.tipo === t);
        escolha = cand[Math.floor(rand() * cand.length)];
      } else if (meus.length) {
        escolha = meus[Math.floor(rand() * meus.length)];
      } else if (nula && rand() < opts.pNula) {
        escolha = nula;
      } else {
        escolha = alts[Math.floor(rand() * alts.length)];
      }
    }
  }
  return { itemId: item.id, altId: escolha.id, rtMs: 1500 + Math.floor(rand() * 2000) };
}

// --- Fluxo ANTIGO ----------------------------------------------------------
function rodarAntigo(persona, rand, opts) {
  const R = { fase1: [], fase2: [], fase3: [] };
  const I = { fase1: [], fase2: [], fase3: [] };
  const aplicar = (fase, itens) => {
    for (const it of itens) {
      I[fase].push(it);
      R[fase].push(responder(it, persona, rand, opts));
    }
  };
  const desempate = (pool, par, presentes) =>
    (pool || []).filter(
      (it) =>
        !presentes.some((p) => p.id === it.id) &&
        Array.isArray(it.separa) &&
        it.separa.length === par.length &&
        par.every((p) => it.separa.map(String).includes(String(p)))
    );

  aplicar('fase1', bancoA.fase1);
  let ctx = antigo.calcularContexto([...R.fase1], [...I.fase1]);
  let r1 = antigo.pontuarFase(R.fase1, I.fase1, 'triade', ctx);
  if (r1.ambiguo && r1.segundo) {
    const ex = desempate(bancoA.fase1_desempate, [r1.top.categoria, r1.segundo.categoria], I.fase1);
    if (ex.length) {
      aplicar('fase1', ex);
      r1 = antigo.pontuarFase(R.fase1, I.fase1, 'triade', ctx);
    }
  }
  const triade = r1.top.categoria;
  aplicar('fase2', bancoA.fase2[triade] || []);
  ctx = antigo.calcularContexto([...R.fase1, ...R.fase2], [...I.fase1, ...I.fase2]);
  let r2 = antigo.pontuarFase(R.fase2, I.fase2, 'tipo', ctx);
  if (r2.ambiguo && r2.segundo) {
    const ex = desempate(
      (bancoA.fase2_desempate || {})[triade],
      [r2.top.categoria, r2.segundo.categoria],
      I.fase2
    );
    if (ex.length) aplicar('fase2', ex);
  }
  aplicar('fase3', bancoA.fase3);
  ctx = antigo.calcularContexto([...R.fase1, ...R.fase2, ...R.fase3], [...I.fase1, ...I.fase2, ...I.fase3]);
  let r3 = antigo.pontuarFase(R.fase3, I.fase3, 'instinto', ctx);
  if (r3.ambiguo && r3.segundo) {
    const ex = desempate(bancoA.fase3_desempate, [r3.top.categoria, r3.segundo.categoria], I.fase3);
    if (ex.length) aplicar('fase3', ex);
  }
  const fin = antigo.analisarFinal({
    fase1: { respostas: R.fase1, itens: I.fase1 },
    fase2: { respostas: R.fase2, itens: I.fase2, triade },
    fase3: { respostas: R.fase3, itens: I.fase3 },
  });
  return {
    triade: fin.triade.top.categoria,
    tipo: fin.tipo.top ? Number(fin.tipo.top.categoria) : null,
    instinto: fin.instinto.top ? fin.instinto.top.categoria : null,
    perguntas: R.fase1.length + R.fase2.length + R.fase3.length,
  };
}

// --- Fluxo NOVO ------------------------------------------------------------
function rodarNovo(persona, rand, opts) {
  const R = { fase1: [], fase2: [], fase2x: [], fase3: [], fase4: [] };
  const I = { fase1: [], fase2: [], fase2x: [], fase3: [], fase4: [] };
  const aplicar = (b, itens) => {
    for (const it of itens) {
      I[b].push(it);
      R[b].push(responder(it, persona, rand, opts));
    }
  };
  const todas = () => Object.values(R).flat();
  const todos = () => Object.values(I).flat();

  aplicar('fase1', fluxo.itensFase1(bancoN));
  let ctx = novoEng.calcularContexto(todas(), todos());
  // As tres perguntas de centro sao feitas sempre, como no app.
  aplicar('fase1', bancoN.fase1_desempate || []);
  ctx = novoEng.calcularContexto(todas(), todos());
  const res1 = fluxo.resultadoFase1(R.fase1, I.fase1, ctx);
  const plano = fluxo.planejarFase2(bancoN, res1);
  const cruzados = new Set(plano.itensCruzados.map((i) => i.id));
  for (const it of plano.itens) aplicar(cruzados.has(it.id) ? 'fase2x' : 'fase2', [it]);

  ctx = novoEng.calcularContexto(todas(), todos());
  let prov = fluxo.tipoProvisorio(
    { respostas: R.fase1, itens: I.fase1 },
    { respostas: R.fase2, itens: I.fase2 },
    { respostas: R.fase2x, itens: I.fase2x },
    ctx,
    novoEng.PESOS
  );
  // Mesma regra do App: rodada extra se ambiguo, ou se o vencedor ganhou de um tipo
  // de outra triade sem pergunta cruzada entre os dois (versoes antigas: so ambiguo).
  const par = fluxo.parParaConfirmar
    ? fluxo.parParaConfirmar(prov)
    : prov.ambiguo && prov.segundo
      ? [prov.top.categoria, prov.segundo.categoria]
      : null;
  if (par) {
    const ex = fluxo.itensDesempateTipo(bancoN, par, todos());
    if (ex.length) {
      aplicar(ex[0].id.startsWith('fx_') ? 'fase2x' : 'fase2', ex);
      ctx = novoEng.calcularContexto(todas(), todos());
      prov = fluxo.tipoProvisorio(
        { respostas: R.fase1, itens: I.fase1 },
        { respostas: R.fase2, itens: I.fase2 },
        { respostas: R.fase2x, itens: I.fase2x },
        ctx,
        novoEng.PESOS
      );
    }
  }
  aplicar('fase3', fluxo.itensFase3(bancoN));
  ctx = novoEng.calcularContexto(todas(), todos());
  const inst = novoEng.pontuarPorTaxa([{ respostas: R.fase3, itens: I.fase3, peso: 1 }], 'instinto', ctx);
  if (inst.ambiguo && inst.segundo) {
    const par = [inst.top.categoria, inst.segundo.categoria];
    const ex = (bancoN.fase3_desempate || []).filter(
      (it) => Array.isArray(it.separa) && par.every((p) => it.separa.includes(p))
    );
    if (ex.length) aplicar('fase3', ex);
  }
  const tipos = prov.top ? [prov.top.categoria] : [];
  if (prov.ambiguo && prov.segundo) tipos.push(prov.segundo.categoria);
  aplicar('fase4', fluxo.itensFase4(bancoN, tipos));

  const fin = novoEng.analisarFinal({
    fase1: { respostas: R.fase1, itens: I.fase1 },
    fase2: { respostas: R.fase2, itens: I.fase2 },
    fase2x: { respostas: R.fase2x, itens: I.fase2x },
    fase3: { respostas: R.fase3, itens: I.fase3 },
    fase4: { respostas: R.fase4, itens: I.fase4 },
  });
  return {
    triade: fin.triade.top.categoria,
    tipo: fin.tipo.top ? Number(fin.tipo.top.categoria) : null,
    instinto: fin.instinto.top ? fin.instinto.top.categoria : null,
    perguntas: todas().length,
  };
}

// --- Execucao --------------------------------------------------------------
const N = Number(process.env.N || 200);
const PSELF = Number(process.env.PSELF || 0.7);
const PSELF_CONTRA = Number(process.env.PSELF_CONTRA || PSELF); // aplicado so no banco ATUAL
const CONTRATIPOS = new Set([
  '3-autopreservacao', '7-social', '6-sexual', '9-social', '4-autopreservacao',
  '2-autopreservacao', '5-sexual', '1-sexual', '8-social',
]);

const personas = [];
for (const tipo of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
  for (const instinto of INSTINTOS) personas.push({ tipo, instinto, chave: `${tipo}-${instinto}` });
}

const linhas = [];
let accA = 0, accN = 0, triA = 0, triN = 0, subA = 0, subN = 0, qA = 0, qN = 0;
const confusaoA = {}, confusaoN = {};
for (const p of personas) {
  let a = 0, n = 0, ta = 0, tn = 0, sa = 0, sn = 0, pa = 0, pn = 0;
  for (let i = 0; i < N; i++) {
    const seed = 1000 + i * 17;
    const optsA = {
      pSelf: CONTRATIPOS.has(p.chave) ? PSELF_CONTRA : PSELF,
      pInstinto: 0.7,
      pNula: 0.5,
    };
    const optsN = { pSelf: PSELF, pInstinto: 0.7, pNula: 0.5 };
    const ra = ORIG ? rodarAntigo(p, rng(seed), optsA) : { tipo: null, triade: null, instinto: null, perguntas: 0 };
    const rn = rodarNovo(p, rng(seed), optsN);
    if (ra.tipo === p.tipo) a++;
    else (confusaoA[p.chave] ||= {})[ra.tipo] = ((confusaoA[p.chave] || {})[ra.tipo] || 0) + 1;
    if (rn.tipo === p.tipo) n++;
    else (confusaoN[p.chave] ||= {})[rn.tipo] = ((confusaoN[p.chave] || {})[rn.tipo] || 0) + 1;
    if (ra.triade === TRIADE_DE[p.tipo]) ta++;
    if (rn.triade === TRIADE_DE[p.tipo]) tn++;
    if (ra.tipo === p.tipo && ra.instinto === p.instinto) sa++;
    if (rn.tipo === p.tipo && rn.instinto === p.instinto) sn++;
    pa += ra.perguntas;
    pn += rn.perguntas;
  }
  linhas.push({ chave: p.chave, atual: a / N, novo: n / N, triA: ta / N, triN: tn / N, subA: sa / N, subN: sn / N });
  accA += a; accN += n; triA += ta; triN += tn; subA += sa; subN += sn; qA += pa; qN += pn;
}
const tot = personas.length * N;
if (!ORIG) console.log('(sem ORIG definido: as colunas "atual" ficam vazias e so o banco deste projeto e medido)\n');
console.log(`N=${N} por persona, pSelf=${PSELF}${PSELF_CONTRA !== PSELF ? ` (contratipos no banco atual: ${PSELF_CONTRA})` : ''}\n`);
console.log('subtipo               tipo(atual)  tipo(novo)   triade(atual) triade(novo) subtipo(atual) subtipo(novo)');
for (const l of linhas) {
  console.log(
    l.chave.padEnd(22) +
      pct(l.atual).padStart(8) + pct(l.novo).padStart(12) +
      pct(l.triA).padStart(13) + pct(l.triN).padStart(13) +
      pct(l.subA).padStart(15) + pct(l.subN).padStart(14)
  );
}
console.log('\nGERAL  tipo: atual ' + pct(accA / tot) + '  novo ' + pct(accN / tot));
console.log('GERAL  triade: atual ' + pct(triA / tot) + '  novo ' + pct(triN / tot));
console.log('GERAL  subtipo (tipo+instinto): atual ' + pct(subA / tot) + '  novo ' + pct(subN / tot));
console.log('Perguntas por aplicacao: atual ' + (qA / tot).toFixed(1) + '  novo ' + (qN / tot).toFixed(1));

const FOCO = (process.env.FOCO || '6-sexual,4-sexual,4-autopreservacao,4-social,7-autopreservacao,1-autopreservacao').split(',');
console.log('\nDetalhe das confusoes (banco ATUAL -> banco NOVO):');
for (const k of FOCO) {
  const fmt = (o) => Object.entries(o || {}).sort((a, b) => b[1] - a[1]).map(([t, c]) => `${t}:${(100 * c / N).toFixed(0)}%`).join(' ');
  console.log(`  ${k.padEnd(20)} atual -> ${fmt(confusaoA[k]) || '(sem erro)'}   |   novo -> ${fmt(confusaoN[k]) || '(sem erro)'}`);
}
console.log('\nPara onde vai quem erra (banco ATUAL):');
const alvoA = {};
for (const k of Object.keys(confusaoA)) for (const [t, c] of Object.entries(confusaoA[k])) alvoA[t] = (alvoA[t] || 0) + c;
console.log(Object.entries(alvoA).sort((a, b) => b[1] - a[1]).map(([t, c]) => `tipo ${t}: ${(100 * c / (tot - accA)).toFixed(0)}%`).join(' | '));
const alvoN = {};
for (const k of Object.keys(confusaoN)) for (const [t, c] of Object.entries(confusaoN[k])) alvoN[t] = (alvoN[t] || 0) + c;
console.log('Para onde vai quem erra (banco NOVO):');
console.log(Object.entries(alvoN).sort((a, b) => b[1] - a[1]).map(([t, c]) => `tipo ${t}: ${(100 * c / (tot - accN)).toFixed(0)}%`).join(' | '));

function pct(x) {
  return (100 * x).toFixed(0) + '%';
}
