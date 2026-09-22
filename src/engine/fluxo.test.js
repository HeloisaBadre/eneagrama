import { describe, it, expect } from 'vitest';
import banco from '../data/questions.json';
import { calcularContexto, pontuarPorTaxa, analisarFinal } from './scoring.js';
import { resultadoFase1, planejarFase2, itensFase4, parParaConfirmar, TRIADE_DE } from './fluxo.js';

const RT = 1500;

/** Responde um conjunto de itens sempre pela alternativa do tipo `t` quando existe. */
function responderPorTipo(itens, t, fallback = 'primeira') {
  const respostas = [];
  for (const it of itens) {
    const alts = it.alternativas.filter((a) => !a.nula);
    const meu = alts.filter((a) => a.mapa.tipo === t);
    const alvo = meu.length
      ? meu[0]
      : fallback === 'nula'
        ? it.alternativas.find((a) => a.nula) || alts[0]
        : alts[0];
    respostas.push({ itemId: it.id, altId: alvo.id, rtMs: RT });
  }
  return respostas;
}

function responderPorInstinto(itens, inst) {
  return itens.map((it) => {
    const alts = it.alternativas.filter((a) => !a.nula);
    const alvo = alts.find((a) => a.mapa.instinto === inst) || alts[0];
    return { itemId: it.id, altId: alvo.id, rtMs: RT };
  });
}

describe('banco proposto: equilibrio estrutural', () => {
  it('cada item da Fase 1 tem exatamente uma alternativa por tipo', () => {
    for (const it of banco.fase1) {
      const tipos = it.alternativas.filter((a) => !a.nula).map((a) => a.mapa.tipo).sort();
      expect(tipos).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }
  });

  it('todas as alternativas de um mesmo item tem o mesmo eixo e o mesmo peso', () => {
    const todos = [
      ...banco.fase1,
      ...banco.fase1_desempate,
      ...Object.values(banco.fase2).flat(),
      ...Object.values(banco.fase2_desempate).flat(),
      ...banco.fase2_cruzada,
      ...banco.fase3,
      ...banco.fase3_desempate,
      ...Object.values(banco.fase4).flat(),
    ];
    for (const it of todos) {
      const ativos = it.alternativas.filter((a) => !a.nula);
      const chaves = new Set(ativos.map((a) => `${a.eixo}|${a.peso}`));
      expect(chaves.size, it.id).toBe(1);
    }
  });

  it('cada item da Fase 2 tem o mesmo numero de alternativas para cada tipo da triade', () => {
    for (const lista of Object.values(banco.fase2)) {
      for (const it of lista) {
        const cont = {};
        it.alternativas.filter((a) => !a.nula).forEach((a) => (cont[a.mapa.tipo] = (cont[a.mapa.tipo] || 0) + 1));
        expect(Object.keys(cont).length, it.id).toBe(3);
        expect(new Set(Object.values(cont)).size, it.id).toBe(1);
      }
    }
  });
});

describe('pontuarPorTaxa', () => {
  it('nao favorece o tipo que aparece em mais itens (normaliza pela exposicao)', () => {
    // Tipo 8 disponivel em 3 itens, tipo 6 em 1. Em ambos, o respondente escolhe
    // o tipo sempre que ele aparece. A taxa deve empatar em 100.
    const mk = (id, tipos) => ({
      id,
      fase: 2,
      dominio: 'geral',
      par_gemeo_id: null,
      indireto: false,
      flag_desejabilidade_social: false,
      alternativas: tipos.map((t, i) => ({
        id: 'abc'[i],
        texto: String(t),
        mapa: { triade: TRIADE_DE[t], tipo: t, instinto: null },
        eixo: 'fixacao',
        peso: 1.5,
        desejavel: false,
      })),
    });
    const itens = [mk('i1', [8, 9]), mk('i2', [8, 1]), mk('i3', [8, 9]), mk('i4', [6, 5])];
    const respostas = [
      { itemId: 'i1', altId: 'a', rtMs: RT },
      { itemId: 'i2', altId: 'a', rtMs: RT },
      { itemId: 'i3', altId: 'a', rtMs: RT },
      { itemId: 'i4', altId: 'a', rtMs: RT },
    ];
    const ctx = calcularContexto(respostas, itens);
    const r = pontuarPorTaxa([{ respostas, itens, peso: 1 }], 'tipo', ctx);
    expect(r.scores[8]).toBeCloseTo(100, 5);
    expect(r.scores[6]).toBeCloseTo(100, 5);
  });

  it('respostas "nenhuma dessas" nao contam como exposicao nem como escolha', () => {
    const itens = banco.fase1.slice(0, 4);
    const respostas = itens.map((it) => ({
      itemId: it.id,
      altId: it.alternativas.find((a) => a.nula).id,
      rtMs: RT,
    }));
    const ctx = calcularContexto(respostas, itens);
    expect(ctx.nulas.razao).toBe(1);
    expect(ctx.nulas.nivel).toBe('alto');
    const r = pontuarPorTaxa([{ respostas, itens, peso: 1 }], 'tipo', ctx);
    expect(r.ranking.length).toBe(0);
  });
});

describe('fluxo adaptativo', () => {
  it('leva para a Fase 2 um tipo forte de OUTRA triade (nao ha mais portao de triade)', () => {
    // Respondente que escolhe 6 quando pode e 8 quando 6 nao esta disponivel.
    const itens = banco.fase1;
    const respostas = itens.map((it) => {
      const alts = it.alternativas.filter((a) => !a.nula);
      const seis = alts.find((a) => a.mapa.tipo === 6);
      const oito = alts.find((a) => a.mapa.tipo === 8);
      // simula o contrafobico: em metade dos itens escolhe 8 mesmo tendo 6
      const usarOito = ['f1_01', 'f1_04', 'f1_06', 'f1_08', 'f1_13'].includes(it.id);
      const alvo = (usarOito ? oito : seis) || alts[0];
      return { itemId: it.id, altId: alvo.id, rtMs: RT };
    });
    const ctx = calcularContexto(respostas, itens);
    const res1 = resultadoFase1(respostas, itens, ctx);
    const plano = planejarFase2(banco, res1);
    expect(plano.candidatos).toContain(6);
    expect(plano.candidatos).toContain(8);
    // e existem itens cruzados 8 x 6 para decidir por motivacao
    expect(plano.itensCruzados.some((it) => it.separa.includes(8) && it.separa.includes(6))).toBe(true);
  });

  it('a Fase 4 traz itens de subtipo do tipo encontrado', () => {
    const itens = itensFase4(banco, [4]);
    expect(itens.length).toBe(3);
    for (const it of itens) {
      expect(it.tipo_alvo).toBe(4);
      const instintos = it.alternativas.filter((a) => !a.nula).map((a) => a.mapa.instinto).sort();
      expect(instintos).toEqual(['autopreservacao', 'sexual', 'social']);
    }
  });

  it('ponta a ponta: respondente coerente com 6 sexual sai 6, nao 8', () => {
    const f1 = banco.fase1;
    // Fase 1: escolhe 6 em 60% dos itens e 8 nos demais (comportamento contrafobico)
    const usarOito = new Set(['f1_01', 'f1_04', 'f1_06', 'f1_08', 'f1_13']);
    const r1 = f1.map((it) => {
      const alts = it.alternativas.filter((a) => !a.nula);
      const alvo = alts.find((a) => a.mapa.tipo === (usarOito.has(it.id) ? 8 : 6));
      return { itemId: it.id, altId: alvo.id, rtMs: RT };
    });
    let ctx = calcularContexto(r1, f1);
    const res1 = resultadoFase1(r1, f1, ctx);
    const plano = planejarFase2(banco, res1);
    const cruzados = plano.itensCruzados;
    const triadeItens = plano.itensTriade;
    // Na Fase 2: no bloco da triade mental ele escolhe o 6 (o proprio tipo esta ali);
    // no bloco instintivo, onde nao ha 6, escolhe o 8. Nos cruzados, o 6.
    const r2 = triadeItens.map((it) => {
      const alts = it.alternativas.filter((a) => !a.nula);
      const alvo = alts.find((a) => a.mapa.tipo === 6) || alts.find((a) => a.mapa.tipo === 8) || alts[0];
      return { itemId: it.id, altId: alvo.id, rtMs: RT };
    });
    const r2x = responderPorTipo(cruzados, 6);
    const f3 = banco.fase3;
    const r3 = responderPorInstinto(f3, 'sexual');
    const f4 = itensFase4(banco, [6]);
    const r4 = responderPorInstinto(f4, 'sexual');
    const fim = analisarFinal({
      fase1: { respostas: r1, itens: f1 },
      fase2: { respostas: r2, itens: triadeItens },
      fase2x: { respostas: r2x, itens: cruzados },
      fase3: { respostas: r3, itens: f3 },
      fase4: { respostas: r4, itens: f4 },
    });
    expect(fim.tipo.top.categoria).toBe(6);
    expect(fim.subtipo).toBe('6-sexual');
  });

  it('cobre todos os pares do apendice de diagnostico diferencial do livro', () => {
    // Pares que Caracter e neurose discute no apendice de diagnostico diferencial.
    const PARES_LIVRO = [
      [1, 3], [1, 5], [1, 6], [2, 3], [2, 7], [2, 8], [2, 9], [3, 4], [3, 5], [3, 6],
      [3, 7], [3, 8], [3, 9], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9], [5, 6], [5, 9],
      [6, 7], [6, 8], [6, 9], [7, 8], [7, 9],
    ];
    const comSepara = [
      ...banco.fase2_cruzada,
      ...Object.values(banco.fase2_desempate).flat(),
    ].filter((it) => Array.isArray(it.separa) && typeof it.separa[0] === 'number');
    const cobertos = new Set(comSepara.map((it) => [...it.separa].sort((a, b) => a - b).join('-')));
    const faltando = PARES_LIVRO.filter(([a, b]) => !cobertos.has(`${a}-${b}`));
    expect(faltando).toEqual([]);
  });
});

describe('respostas "nenhuma dessas" em tudo', () => {
  const nula = (it) => ({ itemId: it.id, altId: it.alternativas.find((a) => a.nula).id, rtMs: RT });

  it('sem triade na Fase 1, a Fase 2 testa as tres triades em vez de quebrar', () => {
    const f1 = banco.fase1;
    const r1 = f1.map(nula);
    const res1 = resultadoFase1(r1, f1, calcularContexto(r1, f1));
    expect(res1.triade.top).toBeNull();
    const plano = planejarFase2(banco, res1);
    expect(plano.triades.sort()).toEqual(['emocional', 'instintiva', 'mental']);
    const tipos = new Set(plano.itensTriade.flatMap((it) => it.alternativas.map((a) => a.mapa.tipo)));
    for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9]) expect(tipos.has(t)).toBe(true);
  });

  it('a analise final nao quebra e devolve tipo e triade vazios', () => {
    const f1 = banco.fase1;
    const f2 = banco.fase2.instintiva;
    const f3 = banco.fase3;
    const fim = analisarFinal({
      fase1: { respostas: f1.map(nula), itens: f1 },
      fase2: { respostas: f2.map(nula), itens: f2 },
      fase2x: { respostas: [], itens: [] },
      fase3: { respostas: f3.map(nula), itens: f3 },
      fase4: { respostas: [], itens: [] },
    });
    expect(fim.triade.top).toBeNull();
    expect(fim.tipo.top).toBeNull();
    expect(fim.instinto.top).toBeNull();
    expect(fim.subtipo).toBeNull();
    expect(fim.confiabilidade.confiancaAutorrelato).toBe('baixo');
  });
});

describe('resposta decisiva', () => {
  it('guarda a alternativa escolhida, mesmo com duas alternativas do mesmo tipo no item', () => {
    // Na Fase 2 cada tipo tem duas alternativas; escolhe sempre a SEGUNDA do 4.
    const itens = banco.fase2.emocional;
    const respostas = itens.map((it) => {
      const doQuatro = it.alternativas.filter((a) => a.mapa.tipo === 4);
      return { itemId: it.id, altId: doQuatro[doQuatro.length - 1].id, rtMs: RT };
    });
    const ctx = calcularContexto(respostas, itens);
    const r = pontuarPorTaxa([{ respostas, itens, peso: 1 }], 'tipo', ctx);
    expect(r.top.categoria).toBe(4);
    const escolhida = respostas.find((x) => x.itemId === r.decisivo.itemId).altId;
    expect(r.decisivo.altId).toBe(escolhida);
  });
});

describe('candidatos da Fase 2', () => {
  it('tipo com pontuacao zero na Fase 1 nao abre triade extra', () => {
    // Respondente que so escolhe 4: os outros tipos ficam com zero.
    const f1 = banco.fase1;
    const r1 = responderPorTipo(f1, 4);
    const res1 = resultadoFase1(r1, f1, calcularContexto(r1, f1));
    const plano = planejarFase2(banco, res1);
    expect(plano.triades).toEqual(['emocional']);
    expect(plano.itensCruzados.length).toBe(0);
  });
});

describe('decisao do tipo em duas etapas (confronto direto)', () => {
  const RT_ = 1500;
  const escolher = (it, pred) => {
    const alvo = it.alternativas.find((a) => !a.nula && pred(a)) || it.alternativas.find((a) => a.nula);
    return { itemId: it.id, altId: alvo.id, rtMs: RT_ };
  };

  it('um 5 que marca o mais proximo no bloco 8/9/1 continua 5, e tipo e triade concordam', () => {
    // Fase 1: o 5 aparece mais que o 8 (os nove tipos estao em todos os itens).
    const f1 = banco.fase1.slice(0, 12);
    const plano5 = new Map([[0, 8], [1, 8], [4, 5], [5, 5], [7, 5], [9, 5], [2, 7], [3, 9], [6, 1], [8, 4], [10, 1], [11, 9]]);
    const r1 = f1.map((it, i) => escolher(it, (a) => a.mapa.tipo === plano5.get(i)));
    // Fase 2: bloco mental escolhendo 5; bloco instintivo (sem 5) marcando o 8 ou "nenhuma".
    const mental = banco.fase2.mental.slice(0, 10);
    const instintiva = banco.fase2.instintiva.slice(0, 5);
    const r2 = [
      ...mental.map((it) => escolher(it, (a) => a.mapa.tipo === 5)),
      ...instintiva.map((it, i) => (i % 2 ? escolher(it, () => false) : escolher(it, (a) => a.mapa.tipo === 8))),
    ];
    const fim = analisarFinal({
      fase1: { respostas: r1, itens: f1 },
      fase2: { respostas: r2, itens: [...mental, ...instintiva] },
      fase2x: { respostas: [], itens: [] },
      fase3: { respostas: [], itens: [] },
      fase4: { respostas: [], itens: [] },
    });
    expect(fim.tipo.top.categoria).toBe(5);
    expect(TRIADE_DE[fim.tipo.top.categoria]).toBe('mental');
    // O 8 ganhou o bloco instintivo, mas perde o confronto direto com o 5 na Fase 1.
    expect(fim.tipo.confrontoFinal).toMatchObject({ escolhasA: expect.any(Number), escolhasB: expect.any(Number) });
    const c = fim.tipo.confrontoFinal;
    const [do5, do8] = c.a === 5 ? [c.escolhasA, c.escolhasB] : [c.escolhasB, c.escolhasA];
    expect(do5).toBeGreaterThan(do8);
  });

  it('vencedor decidido sem pergunta cruzada contra o rival pede confirmacao', () => {
    const prov = { top: { categoria: 5 }, ambiguo: false, confrontoFinal: { a: 5, b: 8, cruzados: 0 } };
    expect(parParaConfirmar(prov)).toEqual([5, 8]);
    expect(parParaConfirmar({ ...prov, confrontoFinal: { a: 5, b: 8, cruzados: 2 } })).toBeNull();
  });

  it('marcar "nenhuma dessas" na maioria das perguntas de subtipo do tipo encontrado vira alerta', () => {
    const f4 = itensFase4(banco, [4]);
    const r4 = f4.map((it, i) => (i < 2 ? escolher(it, () => false) : escolher(it, (a) => a.mapa.instinto === 'sexual')));
    const f2 = banco.fase2.emocional;
    const fim = analisarFinal({
      fase1: { respostas: responderPorTipo(banco.fase1, 4), itens: banco.fase1 },
      fase2: { respostas: responderPorTipo(f2, 4), itens: f2 },
      fase2x: { respostas: [], itens: [] },
      fase3: { respostas: [], itens: [] },
      fase4: { respostas: r4, itens: f4 },
    });
    expect(fim.tipo.top.categoria).toBe(4);
    expect(fim.confiabilidade.subtipoNaoReconhecido).toMatchObject({ tipo: 4, nulas: 2, total: 3 });
    expect(fim.confiabilidade.notas.join(' ')).toMatch(/subtipo do tipo 4/);
  });
});

describe('cobertura dos confrontos diretos', () => {
  it('todo par de tipos de triades diferentes tem pelo menos um item cruzado', () => {
    const cobertos = new Set(banco.fase2_cruzada.map((it) => [...it.separa].sort((a, b) => a - b).join('-')));
    const faltando = [];
    for (let a = 1; a <= 9; a++) {
      for (let b = a + 1; b <= 9; b++) {
        if (TRIADE_DE[a] !== TRIADE_DE[b] && !cobertos.has(`${a}-${b}`)) faltando.push(`${a}-${b}`);
      }
    }
    expect(faltando).toEqual([]);
  });
});
