import { describe, it, expect } from 'vitest';
import banco from '../data/questions.json';
import {
  calcularContexto,
  pontuarPorTaxa,
  analisarFinal,
  pontuarConfirmacao,
  aplicarConfirmacao,
} from './scoring.js';
import {
  resultadoFase1,
  planejarFase2,
  itensFase4,
  itensConfirmacao,
  candidatosParaConfirmar,
  parParaConfirmar,
  TRIADE_DE,
} from './fluxo.js';

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

describe('perguntas de centro: o contratipo que se reconhece pouco', () => {
  /** Responde a Fase 1 marcando o proprio tipo so `k` vezes e espalhando o resto. */
  function fase1Esparsa(k, tipo, espalha) {
    const respostas = [];
    banco.fase1.forEach((it, idx) => {
      const t = idx < k ? tipo : espalha[idx % espalha.length];
      const alvo = it.alternativas.find((a) => a.mapa && a.mapa.tipo === t);
      respostas.push({ itemId: it.id, altId: alvo.id, rtMs: RT });
    });
    return respostas;
  }

  function planoDe(k, { centro }) {
    const itens = [...banco.fase1, ...banco.fase1_desempate];
    const respostas = fase1Esparsa(k, 5, [8, 1, 4, 9]);
    for (const it of banco.fase1_desempate) {
      const alvo = it.alternativas.find((a) => a.mapa && a.mapa.triade === centro) || it.alternativas[0];
      respostas.push({ itemId: it.id, altId: alvo.id, rtMs: RT });
    }
    const ctx = calcularContexto(respostas, itens);
    return planejarFase2(banco, resultadoFase1(respostas, itens, ctx));
  }

  it('a triade das perguntas de centro e testada mesmo quando a triagem aponta outra', () => {
    // Caso real: um 5 marcou a alternativa do 5 em 1 de 14 itens da Fase 1, a
    // triagem deu instintiva com folga, e o bloco mental nunca foi aplicado.
    const plano = planoDe(1, { centro: 'mental' });
    expect(plano.triades[0]).toBe('instintiva');
    expect(plano.triades).toContain('mental');
    expect(plano.itens.some((i) => i.id.startsWith('f2m_'))).toBe(true);
  });

  it('quando o centro confirma a triagem, nao adiciona triade a toa', () => {
    const plano = planoDe(1, { centro: 'instintiva' });
    expect(plano.triades[0]).toBe('instintiva');
    expect(plano.triades).not.toContain('mental');
  });
});

describe('confirmacao em escala', () => {
  const tipos = (t) => banco.confirmacao[String(t)];

  it('sao duas afirmacoes por tipo, com a mesma escala de seis pontos', () => {
    for (let t = 1; t <= 9; t++) {
      const lst = tipos(t);
      expect(lst, `tipo ${t}`).toHaveLength(2);
      for (const it of lst) {
        expect(it.escala).toBe(true);
        expect(it.tipo_alvo).toBe(t);
        expect(it.alternativas.map((a) => a.valor)).toEqual([1, 0.6, 0.25, 0, -0.5, -1]);
        expect(it.alternativas.every((a) => a.mapa.tipo === t)).toBe(true);
        expect(it.alternativas.some((a) => a.nula)).toBe(false);
      }
    }
  });

  it('itensConfirmacao traz as afirmacoes do tipo apurado e do segundo', () => {
    const itens = itensConfirmacao(banco, [5, 8]);
    expect(itens.map((i) => i.id)).toEqual(['cf_5a', 'cf_5b', 'cf_8a', 'cf_8b']);
  });

  /** Responde as afirmacoes do tipo `t` com o valor pedido. */
  function responderEscala(itens, valores) {
    return itens.map((it) => {
      const v = valores[it.tipo_alvo];
      const alt = it.alternativas.find((a) => a.valor === v);
      return { itemId: it.id, altId: alt.id, rtMs: RT };
    });
  }

  const apurado = (top, segundo) => ({
    top: { categoria: top, score: 10 },
    segundo: { categoria: segundo, score: 8 },
    ranking: [],
    scores: {},
  });

  it('troca o tipo quando a pessoa se reconhece muito mais no segundo', () => {
    const itens = itensConfirmacao(banco, [8, 5]);
    const escala = pontuarConfirmacao(responderEscala(itens, { 8: -0.5, 5: 1 }), itens);
    const { tipo, confirmacao } = aplicarConfirmacao(apurado(8, 5), escala);
    expect(confirmacao.trocou).toBe(true);
    expect(tipo.top.categoria).toBe(5);
    expect(tipo.segundo.categoria).toBe(8);
  });

  it('nao troca quando a pessoa se reconhece no tipo apurado', () => {
    const itens = itensConfirmacao(banco, [8, 5]);
    const escala = pontuarConfirmacao(responderEscala(itens, { 8: 1, 5: 1 }), itens);
    const { tipo, confirmacao } = aplicarConfirmacao(apurado(8, 5), escala);
    expect(confirmacao.trocou).toBe(false);
    expect(tipo.top.categoria).toBe(8);
    expect(confirmacao.notas.join(' ')).toMatch(/reconheceu tanto/i);
  });

  it('nao troca por pouca diferenca', () => {
    const itens = itensConfirmacao(banco, [8, 5]);
    const escala = pontuarConfirmacao(responderEscala(itens, { 8: 0.25, 5: 0.6 }), itens);
    const { tipo, confirmacao } = aplicarConfirmacao(apurado(8, 5), escala);
    expect(confirmacao.trocou).toBe(false);
    expect(tipo.top.categoria).toBe(8);
  });

  it('avisa quando a pessoa nao se reconhece no tipo apurado nem no segundo', () => {
    const itens = itensConfirmacao(banco, [8, 5]);
    const escala = pontuarConfirmacao(responderEscala(itens, { 8: -1, 5: -1 }), itens);
    const { tipo, confirmacao } = aplicarConfirmacao(apurado(8, 5), escala);
    expect(confirmacao.trocou).toBe(false);
    expect(tipo.top.categoria).toBe(8);
    expect(confirmacao.notas.join(' ')).toMatch(/não se reconheceu/i);
  });

  it('o relatorio final aplica a confirmacao sobre o tipo apurado', () => {
    // Fase 1 com o 8 na frente e o 5 atras, e os dois blocos aplicados: assim a
    // apuracao tem um primeiro e um segundo colocado de centros diferentes.
    const f1 = banco.fase1;
    const resp1 = f1.map((it, idx) => {
      const t = idx < 9 ? 8 : 5;
      const alt = it.alternativas.find((a) => a.mapa && a.mapa.tipo === t);
      return { itemId: it.id, altId: alt.id, rtMs: RT };
    });
    const blocoI = banco.fase2.instintiva;
    const blocoM = banco.fase2.mental;
    const f2itens = [...blocoI, ...blocoM];
    const f2resp = [...responderPorTipo(blocoI, 8), ...responderPorTipo(blocoM, 5)];
    const vazio = { respostas: [], itens: [] };
    const base = {
      fase1: { respostas: resp1, itens: f1 },
      fase2: { respostas: f2resp, itens: f2itens },
      fase2x: vazio,
      fase3: vazio,
      fase4: vazio,
    };

    const semConf = analisarFinal(base);
    const top = Number(semConf.tipo.top.categoria);
    const segundo = Number(semConf.tipo.segundo.categoria);
    expect([top, segundo].sort()).toEqual([5, 8]);

    // A pessoa nega o tipo apurado e se reconhece por completo no segundo.
    const itensConf = itensConfirmacao(banco, [top, segundo]);
    const fim = analisarFinal({
      ...base,
      confirmacao: { respostas: responderEscala(itensConf, { [top]: -1, [segundo]: 1 }), itens: itensConf },
    });
    expect(Number(fim.tipoApurado.top.categoria)).toBe(top);
    expect(Number(fim.tipo.top.categoria)).toBe(segundo);
    expect(Number(fim.tipo.segundo.categoria)).toBe(top);
    expect(fim.confirmacao.trocou).toBe(true);
    expect(fim.confiabilidade.notas.join(' ')).toMatch(/afirmações finais/i);
  });
});

describe('candidatos da confirmacao', () => {
  it('usa o segundo do confronto quando existe', () => {
    const prov = { top: { categoria: 5, score: 1 }, segundo: { categoria: 8, score: 0.8 }, ranking: [] };
    expect(candidatosParaConfirmar(prov)).toEqual([5, 8]);
  });

  it('cai no mais pontuado depois do vencedor quando nao houve rival', () => {
    const prov = {
      top: { categoria: 5, score: 1 },
      segundo: null,
      ranking: [
        { categoria: 5, score: 1 },
        { categoria: 6, score: 0 },
        { categoria: 4, score: 0.3 },
      ],
    };
    expect(candidatosParaConfirmar(prov)).toEqual([5, 4]);
  });

  it('confirma so o vencedor quando nenhum outro tipo foi escolhido', () => {
    const prov = { top: { categoria: 5, score: 1 }, segundo: null, ranking: [{ categoria: 5, score: 1 }] };
    expect(candidatosParaConfirmar(prov)).toEqual([5]);
  });
});
