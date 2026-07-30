import { describe, it, expect } from 'vitest';
import {
  calcularContexto,
  pontuarFase,
  analisarGemeos,
  avaliarConfiabilidade,
  analisarFinal,
  LIMIARES,
} from './scoring.js';

// ---------------------------------------------------------------------------
// Fabricas de itens/respostas sinteticos (nao dependem do questions.json real)
// ---------------------------------------------------------------------------

function itemTriade(id, extras = {}) {
  return {
    id,
    fase: 1,
    dominio: extras.dominio || 'geral',
    par_gemeo_id: extras.par_gemeo_id || null,
    indireto: extras.indireto || false,
    flag_desejabilidade_social: extras.flag_desejabilidade_social || false,
    alternativas: [
      { id: 'a', texto: 'inst', mapa: { triade: 'instintiva', tipo: null, instinto: null }, eixo: extras.eixo || 'emocao', peso: extras.peso || 1.0, desejavel: false },
      { id: 'b', texto: 'emo', mapa: { triade: 'emocional', tipo: null, instinto: null }, eixo: extras.eixo || 'emocao', peso: extras.peso || 1.0, desejavel: extras.desejavelB || false },
      { id: 'c', texto: 'men', mapa: { triade: 'mental', tipo: null, instinto: null }, eixo: extras.eixo || 'emocao', peso: extras.peso || 1.0, desejavel: false },
    ],
  };
}

function itemTipo(id, extras = {}) {
  return {
    id,
    fase: 2,
    dominio: extras.dominio || 'geral',
    par_gemeo_id: extras.par_gemeo_id || null,
    indireto: extras.indireto || false,
    flag_desejabilidade_social: extras.flag_desejabilidade_social || false,
    alternativas: [
      { id: 'a', texto: '8', mapa: { triade: 'instintiva', tipo: 8, instinto: null }, eixo: extras.eixo || 'fixacao', peso: extras.peso || 1.5, desejavel: false },
      { id: 'b', texto: '9', mapa: { triade: 'instintiva', tipo: 9, instinto: null }, eixo: extras.eixo || 'fixacao', peso: extras.peso || 1.5, desejavel: false },
      { id: 'c', texto: '1', mapa: { triade: 'instintiva', tipo: 1, instinto: null }, eixo: extras.eixo || 'fixacao', peso: extras.peso || 1.5, desejavel: false },
    ],
  };
}

const RT = 1000; // tempo "normal"

// ---------------------------------------------------------------------------

describe('pontuarFase — vencedor simples', () => {
  it('elege a triade mais escolhida', () => {
    const itens = [itemTriade('t1'), itemTriade('t2'), itemTriade('t3')];
    const respostas = [
      { itemId: 't1', altId: 'a', rtMs: RT },
      { itemId: 't2', altId: 'a', rtMs: RT },
      { itemId: 't3', altId: 'b', rtMs: RT },
    ];
    const r = pontuarFase(respostas, itens, 'triade');
    expect(r.top.categoria).toBe('instintiva');
    expect(r.segundo.categoria).toBe('emocional');
  });
});

describe('pontuarFase — pesos de fixacao valem mais que emocao', () => {
  it('uma fixacao supera duas emocoes de peso base', () => {
    const itens = [
      itemTriade('e1', { eixo: 'emocao', peso: 1.0 }),
      itemTriade('e2', { eixo: 'emocao', peso: 1.0 }),
      itemTipo('fx', { eixo: 'fixacao', peso: 1.5 }),
    ];
    // duas respostas emocao -> emocional; uma fixacao -> tipo 8 (instintiva)
    // Como a fase eh 'triade', o item de tipo tambem mapeia triade=instintiva.
    const respostas = [
      { itemId: 'e1', altId: 'b', rtMs: RT }, // emocional
      { itemId: 'e2', altId: 'b', rtMs: RT }, // emocional
      { itemId: 'fx', altId: 'a', rtMs: RT }, // instintiva, peso 1.5
    ];
    const r = pontuarFase(respostas, itens, 'triade');
    // emocional = 2.0 ; instintiva = 1.5 -> emocional ainda vence (esperado)
    expect(r.top.categoria).toBe('emocional');
    expect(r.scores.emocional).toBeGreaterThan(r.scores.instintiva);
  });
});

describe('imediatismo', () => {
  it('resposta rapida numa alternativa de paixao ganha peso extra', () => {
    const itens = [itemTipo('p1', { eixo: 'paixao', peso: 1.0 }), itemTipo('p2', { eixo: 'paixao', peso: 1.0 })];
    const contexto = { medianaRt: 1000, desejabilidade: { nivel: 'baixo' }, deliberacao: { nivel: 'baixo' } };
    const rapida = pontuarFase([{ itemId: 'p1', altId: 'a', rtMs: 300 }], itens, 'tipo', contexto);
    const normal = pontuarFase([{ itemId: 'p2', altId: 'a', rtMs: 1000 }], itens, 'tipo', contexto);
    expect(rapida.scores[8]).toBeCloseTo(1.0 * LIMIARES.imediatoPaixao, 5);
    expect(normal.scores[8]).toBeCloseTo(1.0, 5);
    expect(rapida.scores[8]).toBeGreaterThan(normal.scores[8]);
  });

  it('deliberar num item visceral reduz o peso', () => {
    const itens = [itemTipo('d1', { eixo: 'emocao', peso: 1.0 })];
    const contexto = { medianaRt: 1000, desejabilidade: { nivel: 'baixo' }, deliberacao: { nivel: 'baixo' } };
    const lenta = pontuarFase([{ itemId: 'd1', altId: 'a', rtMs: 5000 }], itens, 'tipo', contexto);
    expect(lenta.scores[8]).toBeCloseTo(1.0 * LIMIARES.deliberadoVisceral, 5);
  });
});

describe('gemeos', () => {
  it('respostas consistentes entre gemeos recebem bonus', () => {
    const itens = [
      itemTriade('g1', { par_gemeo_id: 'par', dominio: 'romance' }),
      itemTriade('g2', { par_gemeo_id: 'par', dominio: 'trabalho' }),
    ];
    const respostas = [
      { itemId: 'g1', altId: 'a', rtMs: RT },
      { itemId: 'g2', altId: 'a', rtMs: RT },
    ];
    const { fatorPorItem, divergencias } = analisarGemeos(respostas, itens, 'triade');
    expect(divergencias.length).toBe(0);
    expect(fatorPorItem.get('g1')).toBe(LIMIARES.gemeoConsistente);
  });

  it('respostas divergentes viram dado de contexto, nao erro', () => {
    const itens = [
      itemTriade('g1', { par_gemeo_id: 'par', dominio: 'romance' }),
      itemTriade('g2', { par_gemeo_id: 'par', dominio: 'trabalho' }),
    ];
    const respostas = [
      { itemId: 'g1', altId: 'a', rtMs: RT }, // instintiva (privado)
      { itemId: 'g2', altId: 'b', rtMs: RT }, // emocional (publico)
    ];
    const { fatorPorItem, divergencias } = analisarGemeos(respostas, itens, 'triade');
    expect(divergencias.length).toBe(1);
    expect(divergencias[0].contextos.map((c) => c.dominio).sort()).toEqual(['romance', 'trabalho']);
    expect(fatorPorItem.get('g1')).toBe(LIMIARES.gemeoDivergente);
  });
});

describe('desejabilidade social', () => {
  it('marcar sempre a opcao elogiavel sinaliza nivel alto e penaliza autorrelato direto', () => {
    const itens = [
      itemTriade('s1', { flag_desejabilidade_social: true, desejavelB: true }),
      itemTriade('s2', { flag_desejabilidade_social: true, desejavelB: true }),
      itemTriade('s3', { flag_desejabilidade_social: true, desejavelB: true }),
    ];
    const respostas = [
      { itemId: 's1', altId: 'b', rtMs: RT },
      { itemId: 's2', altId: 'b', rtMs: RT },
      { itemId: 's3', altId: 'b', rtMs: RT },
    ];
    const ctx = calcularContexto(respostas, itens);
    expect(ctx.desejabilidade.nivel).toBe('alto');

    // Item direto perde peso quando desejabilidade eh alta
    const direto = pontuarFase([{ itemId: 's1', altId: 'a', rtMs: RT }], itens, 'triade', ctx);
    expect(direto.scores.instintiva).toBeCloseTo(1.0 * LIMIARES.penalDiretoAlto, 5);

    // Item indireto ganha peso relativo
    const itensInd = [itemTriade('i1', { indireto: true })];
    const indireto = pontuarFase([{ itemId: 'i1', altId: 'a', rtMs: RT }], itensInd, 'triade', ctx);
    expect(indireto.scores.instintiva).toBeCloseTo(1.0 * LIMIARES.bonusIndiretoAlto, 5);
  });
});

describe('ambiguidade / empate tecnico', () => {
  it('marca ambiguo quando a margem eh menor que o limiar', () => {
    const itens = [itemTriade('t1'), itemTriade('t2')];
    const respostas = [
      { itemId: 't1', altId: 'a', rtMs: RT }, // instintiva
      { itemId: 't2', altId: 'b', rtMs: RT }, // emocional -> empate 1x1
    ];
    const r = pontuarFase(respostas, itens, 'triade');
    expect(r.ambiguo).toBe(true);
    expect(r.margem).toBeLessThan(LIMIARES.margemAmbiguo);
  });

  it('nao marca ambiguo quando ha folga clara', () => {
    const itens = [itemTriade('t1'), itemTriade('t2'), itemTriade('t3'), itemTriade('t4')];
    const respostas = [
      { itemId: 't1', altId: 'a', rtMs: RT },
      { itemId: 't2', altId: 'a', rtMs: RT },
      { itemId: 't3', altId: 'a', rtMs: RT },
      { itemId: 't4', altId: 'b', rtMs: RT },
    ];
    const r = pontuarFase(respostas, itens, 'triade');
    expect(r.ambiguo).toBe(false);
    expect(r.top.categoria).toBe('instintiva');
  });
});

describe('analisarFinal — integracao', () => {
  it('produz triade, tipo, instinto, subtipo e confiabilidade', () => {
    const f1 = [itemTriade('a1'), itemTriade('a2'), itemTriade('a3')];
    const f2 = [itemTipo('b1'), itemTipo('b2'), itemTipo('b3')];
    const f3 = [
      {
        id: 'c1', fase: 3, dominio: 'geral', par_gemeo_id: null, indireto: false, flag_desejabilidade_social: false,
        alternativas: [
          { id: 'a', texto: 'ap', mapa: { triade: null, tipo: null, instinto: 'autopreservacao' }, eixo: 'paixao', peso: 1.0, desejavel: false },
          { id: 'b', texto: 'so', mapa: { triade: null, tipo: null, instinto: 'social' }, eixo: 'paixao', peso: 1.0, desejavel: false },
          { id: 'c', texto: 'sx', mapa: { triade: null, tipo: null, instinto: 'sexual' }, eixo: 'paixao', peso: 1.0, desejavel: false },
        ],
      },
    ];
    const resultado = analisarFinal({
      fase1: { respostas: [
        { itemId: 'a1', altId: 'a', rtMs: RT }, { itemId: 'a2', altId: 'a', rtMs: RT }, { itemId: 'a3', altId: 'a', rtMs: RT },
      ], itens: f1 },
      fase2: { respostas: [
        { itemId: 'b1', altId: 'c', rtMs: RT }, { itemId: 'b2', altId: 'c', rtMs: RT }, { itemId: 'b3', altId: 'c', rtMs: RT },
      ], itens: f2, triade: 'instintiva' },
      fase3: { respostas: [{ itemId: 'c1', altId: 'a', rtMs: RT }], itens: f3 },
    });

    expect(resultado.triade.top.categoria).toBe('instintiva');
    expect(resultado.tipo.top.categoria).toBe(1);
    expect(resultado.instinto.top.categoria).toBe('autopreservacao');
    expect(resultado.subtipo).toBe('1-autopreservacao');
    expect(['alto', 'medio', 'baixo']).toContain(resultado.confiabilidade.confiancaAutorrelato);
  });
});

describe('avaliarConfiabilidade — notas honestas', () => {
  it('gera nota quando a desejabilidade eh alta', () => {
    const contexto = {
      desejabilidade: { total: 4, marcadas: 4, razao: 1, nivel: 'alto' },
      deliberacao: { total: 5, deliberadas: 0, taxa: 0, nivel: 'baixo' },
    };
    const c = avaliarConfiabilidade(contexto, [], [0.8, 0.8, 0.8]);
    expect(c.confiancaAutorrelato).toBe('baixo');
    expect(c.notas.join(' ')).toMatch(/elogiavel/i);
  });
});
