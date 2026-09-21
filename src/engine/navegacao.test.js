import { describe, it, expect } from 'vitest';
import banco from '../data/questions.json';
import { clonarEstado, tempoDaResposta, ordemAleatoria } from './navegacao.js';

function estadoExemplo() {
  return {
    faseKey: 'fase1',
    fila: banco.fase1.slice(0, 3),
    idx: 1,
    respostas: { fase1: [{ itemId: 'f1_01', altId: 'a', rtMs: 900 }], fase2: [], fase2x: [], fase3: [], fase4: [] },
    itens: { fase1: [banco.fase1[0]], fase2: [], fase2x: [], fase3: [], fase4: [] },
    desempateAplicado: { fase1: false, fase2: false, fase3: false, fase4: false },
    cruzadosIds: new Set(['fx_68a']),
    tipoFinal: null,
  };
}

describe('clonarEstado', () => {
  it('mexer no estado depois nao altera a copia guardada', () => {
    const f = estadoExemplo();
    const copia = clonarEstado(f);
    f.respostas.fase1.push({ itemId: 'f1_02', altId: 'b', rtMs: 800 });
    f.itens.fase1.push(banco.fase1[1]);
    f.fila.push(banco.fase1[3]);
    f.idx = 2;
    f.desempateAplicado.fase1 = true;
    f.cruzadosIds.add('fx_48a');
    f.faseKey = 'fase2';

    expect(copia.respostas.fase1).toHaveLength(1);
    expect(copia.itens.fase1).toHaveLength(1);
    expect(copia.fila).toHaveLength(3);
    expect(copia.idx).toBe(1);
    expect(copia.desempateAplicado.fase1).toBe(false);
    expect([...copia.cruzadosIds]).toEqual(['fx_68a']);
    expect(copia.faseKey).toBe('fase1');
  });

  it('compartilha os itens do banco em vez de copia-los', () => {
    const f = estadoExemplo();
    expect(clonarEstado(f).fila[0]).toBe(f.fila[0]);
  });
});

describe('tempoDaResposta', () => {
  it('primeira vez: o tempo ate a ultima selecao', () => {
    expect(tempoDaResposta({ anterior: null, altId: 'c', rtSelecao: 4200 })).toBe(4200);
  });
  it('revisitada com a mesma resposta: mantem o tempo original', () => {
    expect(tempoDaResposta({ anterior: { altId: 'c', rtMs: 1800 }, altId: 'c', rtSelecao: 300 })).toBe(1800);
  });
  it('revisitada com resposta trocada: tempo neutro (null)', () => {
    expect(tempoDaResposta({ anterior: { altId: 'c', rtMs: 1800 }, altId: 'd', rtSelecao: 300 })).toBeNull();
  });
});

describe('ordemAleatoria', () => {
  it('traz todas as alternativas, menos a "nenhuma dessas"', () => {
    const it0 = banco.fase1[0];
    const ordem = ordemAleatoria(it0);
    expect(ordem.some((a) => a.nula)).toBe(false);
    expect(ordem.map((a) => a.id).sort()).toEqual(it0.alternativas.filter((a) => !a.nula).map((a) => a.id).sort());
  });
  it('nao altera o item do banco', () => {
    const it0 = banco.fase1[0];
    const antes = it0.alternativas.map((a) => a.id).join();
    ordemAleatoria(it0, () => 0);
    expect(it0.alternativas.map((a) => a.id).join()).toBe(antes);
  });
});
