/**
 * Teste de neutralidade do banco: o respondente marca AO ACASO.
 *
 * Num instrumento sem viés, quem responde sem nenhuma coerência interna deve sair
 * espalhado entre os nove tipos, perto de 11% cada. Se um tipo for um imã — porque
 * as alternativas dele são mais bonitas, mais longas, mais fáceis de concordar, ou
 * porque ele aparece em mais itens — ele aparece aqui, e não na simulação com
 * personas, onde o respondente já sabe o próprio tipo.
 *
 *   node ferramentas/neutralidade.mjs            # banco deste projeto
 *   N=5000 node ferramentas/neutralidade.mjs
 *   ORIG=/caminho/para/outro/checkout node ferramentas/neutralidade.mjs   # compara
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const N = Number(process.env.N || 3000);
const P_NULA = Number(process.env.P_NULA || 0.05); // chance de marcar "nenhuma dessas"

async function carregar(raiz) {
  const u = (p) => pathToFileURL(resolve(raiz, p)).href;
  const { default: banco } = await import(u('src/data/questions.json'), { with: { type: 'json' } });
  return { banco, fluxo: await import(u('src/engine/fluxo.js')), eng: await import(u('src/engine/scoring.js')) };
}

/** Gerador com semente, para o resultado ser reproduzível. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function umaAplicacao({ banco, fluxo, eng }, rand) {
  const R = { fase1: [], fase2: [], fase2x: [], confirmacao: [], fase3: [], fase4: [] };
  const I = { fase1: [], fase2: [], fase2x: [], confirmacao: [], fase3: [], fase4: [] };
  const responder = (item) => {
    const nula = item.alternativas.find((a) => a.nula);
    const ativos = item.alternativas.filter((a) => !a.nula);
    const alt = nula && rand() < P_NULA ? nula : ativos[Math.floor(rand() * ativos.length)];
    return { itemId: item.id, altId: alt.id, rtMs: 1500 + Math.floor(rand() * 2000) };
  };
  const aplicar = (b, itens) => {
    for (const it of itens) {
      I[b].push(it);
      R[b].push(responder(it));
    }
  };
  const todas = () => Object.values(R).flat();
  const todos = () => Object.values(I).flat();

  aplicar('fase1', fluxo.itensFase1(banco));
  aplicar('fase1', banco.fase1_desempate || []);
  let ctx = eng.calcularContexto(todas(), todos());
  const plano = fluxo.planejarFase2(banco, fluxo.resultadoFase1(R.fase1, I.fase1, ctx));
  const cruz = new Set(plano.itensCruzados.map((i) => i.id));
  for (const it of plano.itens) aplicar(cruz.has(it.id) ? 'fase2x' : 'fase2', [it]);

  ctx = eng.calcularContexto(todas(), todos());
  const argsTipo = () => [
    { respostas: R.fase1, itens: I.fase1 },
    { respostas: R.fase2, itens: I.fase2 },
    { respostas: R.fase2x, itens: I.fase2x },
    ctx,
    eng.PESOS,
  ];
  let prov = fluxo.tipoProvisorio(...argsTipo());
  const par = fluxo.parParaConfirmar(prov);
  if (par) {
    const ex = fluxo.itensDesempateTipo(banco, par, todos());
    if (ex.length) {
      aplicar(ex[0].id.startsWith('fx_') ? 'fase2x' : 'fase2', ex);
      ctx = eng.calcularContexto(todas(), todos());
      prov = fluxo.tipoProvisorio(...argsTipo());
    }
  }
  if (fluxo.itensConfirmacao) {
    const cands = fluxo.candidatosParaConfirmar(prov);
    aplicar('confirmacao', fluxo.itensConfirmacao(banco, cands));
    prov = eng.aplicarConfirmacao(prov, eng.pontuarConfirmacao(R.confirmacao, I.confirmacao)).tipo;
  }
  aplicar('fase3', fluxo.itensFase3(banco));
  const tipos = prov.top ? [prov.top.categoria] : [];
  if (prov.ambiguo && prov.segundo) tipos.push(prov.segundo.categoria);
  aplicar('fase4', fluxo.itensFase4(banco, tipos));

  const fin = eng.analisarFinal({
    fase1: { respostas: R.fase1, itens: I.fase1 },
    fase2: { respostas: R.fase2, itens: I.fase2 },
    fase2x: { respostas: R.fase2x, itens: I.fase2x },
    confirmacao: { respostas: R.confirmacao, itens: I.confirmacao },
    fase3: { respostas: R.fase3, itens: I.fase3 },
    fase4: { respostas: R.fase4, itens: I.fase4 },
  });
  return {
    tipo: fin.tipo.top ? Number(fin.tipo.top.categoria) : null,
    triade: fin.triade.top ? fin.triade.top.categoria : null,
    instinto: fin.instinto.top ? fin.instinto.top.categoria : null,
  };
}

function distribuicao(mod, rodadas) {
  const tipo = {}, triade = {}, instinto = {};
  const rand = rng(20260922);
  for (let i = 0; i < rodadas; i++) {
    const r = umaAplicacao(mod, rand);
    tipo[r.tipo] = (tipo[r.tipo] || 0) + 1;
    triade[r.triade] = (triade[r.triade] || 0) + 1;
    instinto[r.instinto] = (instinto[r.instinto] || 0) + 1;
  }
  return { tipo, triade, instinto };
}

const pct = (c, n) => `${((100 * c) / n).toFixed(1)}%`;
function linha(rotulo, mapa, chaves, n) {
  return `${rotulo.padEnd(10)} ${chaves.map((k) => `${k}: ${pct(mapa[k] || 0, n).padStart(6)}`).join('  ')}`;
}

const modNovo = await carregar(process.env.NOVO || process.cwd());
const dNovo = distribuicao(modNovo, N);
const dOrig = process.env.ORIG ? distribuicao(await carregar(process.env.ORIG), N) : null;

const TIPOS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const TRI = ['instintiva', 'emocional', 'mental'];
const INST = ['autopreservacao', 'social', 'sexual'];

console.log(`Respondente ao acaso, N=${N} aplicacoes. Esperado sem vies: 11.1% por tipo.\n`);
console.log(linha('tipo', dNovo.tipo, TIPOS, N));
if (dOrig) console.log(linha('  (antes)', dOrig.tipo, TIPOS, N));
console.log('');
console.log(linha('triade', dNovo.triade, TRI, N));
if (dOrig) console.log(linha('  (antes)', dOrig.triade, TRI, N));
console.log('');
console.log(linha('instinto', dNovo.instinto, INST, N));
if (dOrig) console.log(linha('  (antes)', dOrig.instinto, INST, N));

const vals = TIPOS.map((t) => (100 * (dNovo.tipo[t] || 0)) / N);
const max = Math.max(...vals), min = Math.min(...vals);
console.log(`\nTipo mais frequente ${max.toFixed(1)}% | menos frequente ${min.toFixed(1)}% | amplitude ${(max - min).toFixed(1)} pontos`);
