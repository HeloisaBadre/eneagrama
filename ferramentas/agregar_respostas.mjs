/**
 * Junta os arquivos de respostas baixados no fim do teste e mostra:
 *   - a taxa de "Nenhuma dessas" por item (item com taxa alta provavelmente esta mal escrito);
 *   - quanto cada item acerta o tipo de quem ja conhece o proprio tipo;
 *   - o acerto geral do teste e a matriz de confusao (tipo conhecido x tipo obtido).
 *
 * Uso:
 *   node ferramentas/agregar_respostas.mjs <pasta ou arquivos .json> [--csv saida.csv]
 *
 * Respostas dadas a outra versao do banco sao somadas separadamente. A discriminacao
 * por item so e calculada para a versao atual (e preciso o banco para saber se o item
 * oferecia o tipo da pessoa).
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
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

const banco = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));
const atual = assinaturaBanco(banco);
const itensAtuais = new Map(
  Object.entries(banco)
    .filter(([k]) => k !== '_meta')
    .flatMap(([, v]) => (Array.isArray(v) ? v : Object.values(v).flat()))
    .map((it) => [it.id, it])
);

const registros = [];
const ignorados = [];
for (const arq of arquivos) {
  try {
    const obj = JSON.parse(readFileSync(arq, 'utf8'));
    if (!ehRegistro(obj)) throw new Error('nao e um arquivo de respostas do teste');
    registros.push(obj.banco === atual ? marcarOferta(obj, itensAtuais) : obj);
  } catch (e) {
    ignorados.push(`${arq}: ${e.message}`);
  }
}

const pct = (x) => (x === null || x === undefined ? '   -' : `${Math.round(100 * x)}%`.padStart(4));
const r = agregar(registros);

console.log(`Arquivos lidos: ${registros.length}${ignorados.length ? ` (ignorados: ${ignorados.length})` : ''}`);
ignorados.forEach((m) => console.log(`  ignorado: ${m}`));

for (const [assinatura, grupo] of Object.entries(r.porBanco)) {
  const rotulo = assinatura === atual ? 'versao atual do banco' : 'OUTRA versao do banco';
  console.log(`\n== Banco ${assinatura} (${rotulo}): ${grupo.registros} aplicacao(oes) ==`);
  console.log('item        vezes  nenhuma  taxa  acerta_tipo  cenario');
  for (const it of grupo.itens) {
    const cen = assinatura === atual && itensAtuais.get(it.id) ? itensAtuais.get(it.id).cenario : '';
    console.log(
      `${it.id.padEnd(10)} ${String(it.vezes).padStart(6)} ${String(it.nulas).padStart(8)}  ${pct(it.taxaNula)}         ${pct(it.taxaProprioTipo)}  ${cen.slice(0, 60)}`
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
  const linhas = ['banco,item,vezes,nenhuma,taxa_nenhuma,com_tipo_conhecido,escolheu_proprio_tipo,taxa_proprio_tipo,cenario'];
  for (const [assinatura, grupo] of Object.entries(r.porBanco)) {
    for (const it of grupo.itens) {
      const cen = assinatura === atual && itensAtuais.get(it.id) ? itensAtuais.get(it.id).cenario : '';
      linhas.push(
        [assinatura, it.id, it.vezes, it.nulas, it.taxaNula.toFixed(3), it.comTipoConhecido, it.escolheuProprioTipo,
          it.taxaProprioTipo === null ? '' : it.taxaProprioTipo.toFixed(3), `"${cen.replace(/"/g, '""')}"`].join(',')
      );
    }
  }
  writeFileSync(csv, '﻿' + linhas.join('\n'), 'utf8');
  console.log(`\nCSV gravado em ${csv}`);
}
