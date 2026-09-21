/**
 * REGISTRO DE RESPOSTAS — para validar o instrumento com pessoas reais.
 * Puro (sem React/DOM), testavel isolado.
 *
 * O site e estatico: nada e enviado a lugar nenhum. No fim do teste a pessoa pode
 * baixar um arquivo JSON anonimo com as proprias respostas (e, se quiser, o tipo que
 * ja conhece). Quem aplica o teste junta os arquivos e roda
 * `node ferramentas/agregar_respostas.mjs <pasta>`, que usa `agregar()` daqui para
 * calcular a taxa de "nenhuma dessas" por item e o acerto por tipo conhecido.
 */

export const FORMATO = 'eneatipo-respostas';
export const VERSAO_FORMATO = 1;

const TIPOS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const INSTINTOS = ['autopreservacao', 'social', 'sexual'];
const FONTES = ['entrevista', 'outro-teste', 'auto-observacao'];

/**
 * Assinatura curta do banco (FNV-1a de 32 bits sobre ids, textos e mapas). Muda
 * sempre que uma pergunta muda, para que respostas a versoes diferentes do banco
 * nao sejam somadas como se fossem o mesmo item.
 */
export function assinaturaBanco(banco) {
  const partes = [];
  for (const [secao, valor] of Object.entries(banco)) {
    if (secao === '_meta') continue;
    const itens = Array.isArray(valor) ? valor : Object.values(valor).flat();
    for (const it of itens) {
      partes.push(it.id, it.cenario);
      for (const a of it.alternativas) partes.push(a.id, a.texto, JSON.stringify(a.mapa));
    }
  }
  let h = 0x811c9dc5;
  const s = partes.join('');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function limpar(valor, permitidos) {
  return permitidos.includes(valor) ? valor : null;
}

/**
 * Monta o registro anonimo de uma aplicacao.
 * @param respostasPorFase { fase1: [{itemId, altId, rtMs}], fase2, fase2x, fase3, fase4 }
 * @param itensPorId       Map id -> item apresentado
 * @param analise          saida de analisarFinal()
 * @param conhecido        { tipo, instinto, fonte } informados pela pessoa (opcionais)
 */
export function montarRegistro({ respostasPorFase, itensPorId, analise, assinatura, conhecido = {}, data = new Date() }) {
  const respostas = [];
  for (const [fase, lista] of Object.entries(respostasPorFase)) {
    for (const r of lista) {
      const item = itensPorId.get(r.itemId);
      const alt = item ? item.alternativas.find((a) => a.id === r.altId) : null;
      respostas.push({
        item: r.itemId,
        fase,
        alternativa: r.altId,
        nula: !!(alt && alt.nula),
        tipo: alt && alt.mapa ? alt.mapa.tipo : null,
        instinto: alt && alt.mapa ? alt.mapa.instinto : null,
        triade: alt && alt.mapa ? alt.mapa.triade : null,
        ms: r.rtMs,
      });
    }
  }

  const tipoConhecido = limpar(Number(conhecido.tipo), TIPOS);
  return {
    formato: FORMATO,
    versao: VERSAO_FORMATO,
    banco: assinatura,
    data: data.toISOString().slice(0, 10), // so o dia
    conhecido: {
      tipo: tipoConhecido,
      instinto: limpar(conhecido.instinto, INSTINTOS),
      fonte: tipoConhecido ? limpar(conhecido.fonte, FONTES) : null,
    },
    resultado: {
      triade: analise.triade.top ? analise.triade.top.categoria : null,
      tipo: analise.tipo.top ? analise.tipo.top.categoria : null,
      instinto: analise.instinto.top ? analise.instinto.top.categoria : null,
      tipoAmbiguo: !!analise.tipo.ambiguo,
      confianca: analise.confiabilidade.confiancaAutorrelato,
    },
    respostas,
  };
}

/** Confere se um objeto lido de arquivo e um registro deste formato. */
export function ehRegistro(obj) {
  return !!obj && obj.formato === FORMATO && Array.isArray(obj.respostas) && typeof obj.banco === 'string';
}

/**
 * Soma varios registros. Os itens sao agrupados por versao do banco (assinatura).
 * @returns {
 *   total, porBanco: { [assinatura]: { registros, itens: [{ id, vezes, nulas, taxaNula,
 *     comTipoConhecido, escolheuProprioTipo, taxaProprioTipo }] } },
 *   validacao: { comTipo, acertosTipo, comSubtipo, acertosSubtipo, confusao: { conhecido: { obtido: n } } }
 * }
 * "taxaProprioTipo": entre as pessoas com tipo conhecido para quem o item ofereceu uma
 * alternativa do proprio tipo, a fracao que a escolheu. Item com taxa baixa discrimina mal.
 */
export function agregar(registros) {
  const porBanco = {};
  const validacao = { comTipo: 0, acertosTipo: 0, comSubtipo: 0, acertosSubtipo: 0, confusao: {} };

  for (const reg of registros) {
    const grupo = (porBanco[reg.banco] ||= { registros: 0, itens: {} });
    grupo.registros += 1;
    const t = reg.conhecido ? reg.conhecido.tipo : null;
    const inst = reg.conhecido ? reg.conhecido.instinto : null;

    for (const r of reg.respostas) {
      const it = (grupo.itens[r.item] ||= { id: r.item, vezes: 0, nulas: 0, comTipoConhecido: 0, escolheuProprioTipo: 0 });
      it.vezes += 1;
      if (r.nula) it.nulas += 1;
    }
    // Discriminacao: so conta respostas marcadas por marcarOferta() como vindas de um
    // item que oferecia o tipo conhecido da pessoa (o registro sozinho nao sabe disso).
    if (t) {
      for (const r of reg.respostas) {
        if (r.ofereceTipoConhecido !== true) continue;
        const it = grupo.itens[r.item];
        it.comTipoConhecido += 1;
        if (r.tipo === t) it.escolheuProprioTipo += 1;
      }

      validacao.comTipo += 1;
      const obtido = reg.resultado ? reg.resultado.tipo : null;
      if (obtido === t) validacao.acertosTipo += 1;
      const linha = (validacao.confusao[t] ||= {});
      const chave = obtido === null ? 'nenhum' : obtido;
      linha[chave] = (linha[chave] || 0) + 1;
      if (inst) {
        validacao.comSubtipo += 1;
        if (obtido === t && reg.resultado.instinto === inst) validacao.acertosSubtipo += 1;
      }
    }
  }

  const saida = {};
  for (const [assinatura, grupo] of Object.entries(porBanco)) {
    const itens = Object.values(grupo.itens).map((it) => ({
      ...it,
      taxaNula: it.vezes ? it.nulas / it.vezes : 0,
      taxaProprioTipo: it.comTipoConhecido ? it.escolheuProprioTipo / it.comTipoConhecido : null,
    }));
    itens.sort((a, b) => b.taxaNula - a.taxaNula || b.vezes - a.vezes || a.id.localeCompare(b.id));
    saida[assinatura] = { registros: grupo.registros, itens };
  }
  return { total: registros.length, porBanco: saida, validacao };
}

/**
 * Marca em cada resposta se o item oferecia uma alternativa do tipo conhecido da
 * pessoa. Precisa do banco da mesma versao do registro; sem essa marca, agregar()
 * nao calcula a discriminacao daquele registro.
 */
export function marcarOferta(registro, itensPorId) {
  const t = registro.conhecido ? registro.conhecido.tipo : null;
  if (!t) return registro;
  return {
    ...registro,
    respostas: registro.respostas.map((r) => {
      const item = itensPorId.get(r.item);
      if (!item) return r;
      return { ...r, ofereceTipoConhecido: item.alternativas.some((a) => !a.nula && a.mapa && a.mapa.tipo === t) };
    }),
  };
}
