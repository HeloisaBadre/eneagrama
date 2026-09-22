/**
 * Junta os arquivos de respostas baixados no fim do teste e mostra:
 *   - a taxa de "Nenhuma dessas" por item, no total e so entre quem tinha a propria opcao
 *     no item (esta e a que indica item mal escrito; sem a propria opcao, "nenhuma" e o esperado);
 *   - quanto cada item acerta o tipo de quem ja conhece o proprio tipo;
 *   - o acerto geral do teste e a matriz de confusao (tipo conhecido x tipo obtido).
 *
 * Uso:
 *   node ferramentas/agregar_respostas.mjs <pasta ou arquivos .json> [--csv saida.csv]
 *
 * Respostas dadas a versoes diferentes das perguntas sao somadas separadamente. Para cada
 * versao, o script procura o banco correspondente: o atual ou, pela assinatura, uma versao
 * antiga no historico do git. Com o banco em maos ele mostra o enunciado e calcula a
 * discriminacao (e preciso saber se o item oferecia o tipo da pessoa).
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assinaturaBanco, agregar, ehRegistro, marcarOferta } from '../src/engine/exportar.js';

const args = process.argv.slice(2);
const iCsv = args.indexOf('--csv');
const csv = iCsv >= 0 ? args[iCsv + 1] : null;
const entradas = args.filter((_, i) => iCsv < 0 || (i !== iCsv && i !== iCsv + 1));
if (!entradas.length) {
  console.error('Uso: node ferramentas/agregar_respostas.mjs <pasta ou arquivos .json> [--csv saida.csv]');
  process.exit(1);
}

const arquivos = entradas.flatMap((e) => {
  const p = resolve(e);
  return statSync(p).isDirectory()
    ? readdirSync(p).filter((f) => f.toLowerCase().endsWith('.json')).map((f) => join(p, f))
    : [p];
});

const itensDe = (b) =>
  new Map(
    Object.entries(b)
      .filter(([k]) => k !== '_meta')
      .flatMap(([, v]) => (Array.isArray(v) ? v : Object.values(v).flat()))
      .map((it) => [it.id, it])
  );

const banco = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));
const atual = assinaturaBanco(banco);
// assinatura -> { rotulo, itens }. Comeca com o banco atual; as versoes antigas vem do git.
const bancos = new Map([[atual, { rotulo: 'versao atual das perguntas', itens: itensDe(banco) }]]);

let historicoLido = false;
function buscarNoHistorico() {
  if (historicoLido) return;
  historicoLido = true;
  const raiz = fileURLToPath(new URL('..', import.meta.url));
  let shas = [];
  try {
    shas = execFileSync('git', ['log', '--format=%H', '--', 'src/data/questions.json'], { cwd: raiz, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    return; // sem git: as versoes antigas ficam sem enunciado e sem discriminacao
  }
  for (const sha of shas) {
    try {
      const txt = execFileSync('git', ['show', `${sha}:src/data/questions.json`], {
        cwd: raiz,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      });
      const b = JSON.parse(txt);
      const sig = assinaturaBanco(b);
      if (!bancos.has(sig)) bancos.set(sig, { rotulo: `versao do commit ${sha.slice(0, 7)}`, itens: itensDe(b) });
    } catch {
      // versao ilegivel: ignora
    }
  }
}

const registros = [];
const ignorados = [];
for (const arq of arquivos) {
  try {
    const obj = JSON.parse(readFileSync(arq, 'utf8'));
    if (!ehRegistro(obj)) throw new Error('nao e um arquivo de respostas do teste');
    if (!bancos.has(obj.banco)) buscarNoHistorico();
    const versao = bancos.get(obj.banco);
    registros.push(versao ? marcarOferta(obj, versao.itens) : obj);
  } catch (e) {
    ignorados.push(`${arq}: ${e.message}`);
  }
}
const cenarioDe = (assinatura, id) => {
  const it = bancos.get(assinatura) && bancos.get(assinatura).itens.get(id);
  return it ? it.cenario : '';
};

const pct = (x) => (x === null || x === undefined ? '   -' : `${Math.round(100 * x)}%`.padStart(4));
const r = agregar(registros);

console.log(`Arquivos lidos: ${registros.length}${ignorados.length ? ` (ignorados: ${ignorados.length})` : ''}`);
ignorados.forEach((m) => console.log(`  ignorado: ${m}`));

for (const [assinatura, grupo] of Object.entries(r.porBanco)) {
  const rotulo = bancos.has(assinatura) ? bancos.get(assinatura).rotulo : 'versao desconhecida (nao esta no historico)';
  console.log(`\n== Banco ${assinatura} (${rotulo}): ${grupo.registros} aplicacao(oes) ==`);
  console.log('item        vezes  nenhuma  taxa  nenhuma_tendo_a_sua  acerta_tipo  cenario');
  const ordem = (x) => (x.taxaNulaComPropria === null ? -1 : x.taxaNulaComPropria);
  const itens = [...grupo.itens].sort((a, b) => ordem(b) - ordem(a) || b.taxaNula - a.taxaNula || a.id.localeCompare(b.id));
  for (const it of itens) {
    const cen = cenarioDe(assinatura, it.id);
    console.log(
      `${it.id.padEnd(10)} ${String(it.vezes).padStart(6)} ${String(it.nulas).padStart(8)}  ${pct(it.taxaNula)}  ${(pct(it.taxaNulaComPropria) + ` (${it.nulasComPropria}/${it.comPropria})`).padEnd(19)}  ${pct(it.taxaProprioTipo)}         ${cen.slice(0, 60)}`
    );
  }
}

const v = r.validacao;
console.log('\n== Validacao (so quem informou o proprio tipo) ==');
if (!v.comTipo) {
  console.log('Nenhum arquivo com tipo conhecido.');
} else {
  console.log(`Acerto de tipo: ${v.acertosTipo}/${v.comTipo} (${pct(v.acertosTipo / v.comTipo).trim()})`);
  if (v.comSubtipo) {
    console.log(`Acerto de tipo e instinto: ${v.acertosSubtipo}/${v.comSubtipo} (${pct(v.acertosSubtipo / v.comSubtipo).trim()})`);
  }
  console.log('Tipo conhecido -> tipo obtido pelo teste:');
  for (const t of Object.keys(v.confusao).sort()) {
    const linha = Object.entries(v.confusao[t])
      .sort((a, b) => b[1] - a[1])
      .map(([obtido, n]) => `${obtido}: ${n}`)
      .join(' | ');
    console.log(`  ${t} -> ${linha}`);
  }
}

if (csv) {
  const linhas = ['banco,item,vezes,nenhuma,taxa_nenhuma,com_propria_opcao,nenhuma_com_propria,taxa_nenhuma_com_propria,com_tipo_conhecido,escolheu_proprio_tipo,taxa_proprio_tipo,cenario'];
  for (const [assinatura, grupo] of Object.entries(r.porBanco)) {
    for (const it of grupo.itens) {
      const cen = cenarioDe(assinatura, it.id);
      linhas.push(
        [assinatura, it.id, it.vezes, it.nulas, it.taxaNula.toFixed(3), it.comPropria, it.nulasComPropria,
          it.taxaNulaComPropria === null ? '' : it.taxaNulaComPropria.toFixed(3), it.comTipoConhecido, it.escolheuProprioTipo,
          it.taxaProprioTipo === null ? '' : it.taxaProprioTipo.toFixed(3), `"${cen.replace(/"/g, '""')}"`].join(',')
      );
    }
  }
  writeFileSync(csv, '﻿' + linhas.join('\n'), 'utf8');
  console.log(`\nCSV gravado em ${csv}`);
}
