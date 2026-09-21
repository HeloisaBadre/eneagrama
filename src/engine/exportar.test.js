import { describe, it, expect } from 'vitest';
import banco from '../data/questions.json';
import { analisarFinal } from './scoring.js';
import { itensFase4, TRIADE_DE } from './fluxo.js';
import { assinaturaBanco, montarRegistro, agregar, ehRegistro, marcarOferta } from './exportar.js';

const RT = 1500;
const porId = (itens) => new Map(itens.map((it) => [it.id, it]));
const assinatura = assinaturaBanco(banco);
const todosItens = porId(
  Object.entries(banco)
    .filter(([k]) => k !== '_meta')
    .flatMap(([, v]) => (Array.isArray(v) ? v : Object.values(v).flat()))
);

/** Aplicacao sintetica de alguem do tipo `t` e instinto `inst` (Fase 2 da propria triade). */
function aplicacao(t, inst) {
  const itens = {
    fase1: banco.fase1,
    fase2: banco.fase2[TRIADE_DE[t]],
    fase2x: [],
    fase3: banco.fase3,
    fase4: itensFase4(banco, [t]),
  };
  const escolher = (it) => {
    // Fases 3 e 4: decide o instinto. Fases 1 e 2: decide o tipo (alternativas sem instinto).
    const alvo =
      it.alternativas.find((a) => !a.nula && a.mapa.instinto === inst && (a.mapa.tipo == null || a.mapa.tipo === t)) ||
      it.alternativas.find((a) => !a.nula && a.mapa.instinto == null && a.mapa.tipo === t);
    return { itemId: it.id, altId: (alvo || it.alternativas.find((a) => a.nula)).id, rtMs: RT };
  };
  const respostasPorFase = Object.fromEntries(Object.entries(itens).map(([k, lst]) => [k, lst.map(escolher)]));
  const analise = analisarFinal(
    Object.fromEntries(Object.keys(itens).map((k) => [k, { respostas: respostasPorFase[k], itens: itens[k] }]))
  );
  return { respostasPorFase, itensPorId: porId(Object.values(itens).flat()), analise };
}

describe('arquivo de respostas', () => {
  it('traz uma entrada por resposta e nenhum dado pessoal', () => {
    const ap = aplicacao(4, 'sexual');
    const reg = montarRegistro({ ...ap, assinatura, data: new Date('2026-09-21T15:30:00Z') });
    expect(ehRegistro(reg)).toBe(true);
    expect(reg.respostas.length).toBe(Object.values(ap.respostasPorFase).flat().length);
    expect(reg.data).toBe('2026-09-21');
    expect(Object.keys(reg).sort()).toEqual(['banco', 'conhecido', 'data', 'formato', 'respostas', 'resultado', 'versao']);
    expect(Object.keys(reg.respostas[0]).sort()).toEqual(['alternativa', 'fase', 'instinto', 'item', 'ms', 'nula', 'tipo', 'triade']);
    expect(reg.respostas.filter((r) => r.fase === 'fase1').every((r) => !r.nula && r.tipo === 4)).toBe(true);
    expect(reg.resultado.tipo).toBe(4);
    expect(reg.resultado.instinto).toBe('sexual');
  });

  it('marca as respostas "nenhuma dessas"', () => {
    const ap = aplicacao(4, 'sexual');
    const primeiro = ap.respostasPorFase.fase2[0];
    primeiro.altId = 'z';
    const reg = montarRegistro({ ...ap, assinatura });
    const r = reg.respostas.find((x) => x.item === primeiro.itemId);
    expect(r).toMatchObject({ nula: true, alternativa: 'z', tipo: null });
  });

  it('guarda o tipo conhecido so quando e valido, e a fonte so quando ha tipo', () => {
    const ap = aplicacao(4, 'sexual');
    expect(montarRegistro({ ...ap, assinatura }).conhecido).toEqual({ tipo: null, instinto: null, fonte: null });
    const invalido = montarRegistro({ ...ap, assinatura, conhecido: { tipo: '12', instinto: 'x', fonte: 'entrevista' } });
    expect(invalido.conhecido).toEqual({ tipo: null, instinto: null, fonte: null });
    const valido = montarRegistro({ ...ap, assinatura, conhecido: { tipo: '4', instinto: 'sexual', fonte: 'entrevista' } });
    expect(valido.conhecido).toEqual({ tipo: 4, instinto: 'sexual', fonte: 'entrevista' });
  });

  it('a assinatura do banco muda quando um texto muda', () => {
    const copia = JSON.parse(JSON.stringify(banco));
    expect(assinaturaBanco(copia)).toBe(assinatura);
    copia.fase1[0].alternativas[0].texto += ' ';
    expect(assinaturaBanco(copia)).not.toBe(assinatura);
  });
});

describe('agregar', () => {
  it('calcula a taxa de "nenhuma dessas" por item, em ordem decrescente', () => {
    const a = aplicacao(4, 'sexual');
    const reg1 = montarRegistro({ ...a, assinatura });
    const b = aplicacao(4, 'sexual');
    const alvo = b.respostasPorFase.fase2[0].itemId;
    b.respostasPorFase.fase2[0].altId = 'z';
    const reg2 = montarRegistro({ ...b, assinatura });

    const grupo = agregar([reg1, reg2]).porBanco[assinatura];
    expect(grupo.registros).toBe(2);
    const it = grupo.itens.find((x) => x.id === alvo);
    expect(it).toMatchObject({ vezes: 2, nulas: 1 });
    expect(it.taxaNula).toBeCloseTo(0.5, 5);
    expect(grupo.itens[0].id).toBe(alvo);
    const taxas = grupo.itens.map((x) => x.taxaNula);
    expect([...taxas].sort((x, y) => y - x)).toEqual(taxas);
  });

  it('mede o acerto por tipo conhecido e quanto cada item discrimina', () => {
    // A conhece o tipo 4 e responde como 4. B diz ser 4 mas responde como 6.
    const regA = montarRegistro({ ...aplicacao(4, 'sexual'), assinatura, conhecido: { tipo: 4, instinto: 'sexual' } });
    const regB = montarRegistro({ ...aplicacao(6, 'social'), assinatura, conhecido: { tipo: 4 } });
    expect(regB.resultado.tipo).toBe(6);
    const r = agregar([regA, regB].map((reg) => marcarOferta(reg, todosItens)));

    expect(r.validacao).toMatchObject({ comTipo: 2, acertosTipo: 1, comSubtipo: 1, acertosSubtipo: 1 });
    expect(r.validacao.confusao[4]).toEqual({ 4: 1, 6: 1 });
    // Todo item da Fase 1 oferece o 4: A escolheu, B nao.
    const f1 = r.porBanco[assinatura].itens.find((x) => x.id === banco.fase1[0].id);
    expect(f1).toMatchObject({ comTipoConhecido: 2, escolheuProprioTipo: 1 });
    expect(f1.taxaProprioTipo).toBeCloseTo(0.5, 5);
    // Itens da Fase 2 mental nao oferecem o 4: nao entram na discriminacao.
    const f2m = r.porBanco[assinatura].itens.find((x) => x.id === banco.fase2.mental[0].id);
    expect(f2m.taxaProprioTipo).toBeNull();
  });

  it('sem marcarOferta, nao estima a discriminacao', () => {
    const reg = montarRegistro({ ...aplicacao(4, 'sexual'), assinatura, conhecido: { tipo: 4 } });
    const itens = agregar([reg]).porBanco[assinatura].itens;
    expect(itens.every((x) => x.taxaProprioTipo === null)).toBe(true);
  });

  it('separa respostas de versoes diferentes do banco', () => {
    const a = aplicacao(4, 'sexual');
    const reg1 = montarRegistro({ ...a, assinatura });
    const reg2 = { ...montarRegistro({ ...a, assinatura }), banco: 'deadbeef' };
    const r = agregar([reg1, reg2]);
    expect(Object.keys(r.porBanco).sort()).toEqual([assinatura, 'deadbeef'].sort());
    expect(r.porBanco.deadbeef.registros).toBe(1);
  });
});
