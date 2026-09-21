/**
 * NAVEGACAO — "Voltar" e "Avancar" entre perguntas.
 * Puro (sem React), para poder ser testado isolado.
 *
 * Antes de cada resposta o App guarda uma copia do estado do fluxo. "Voltar"
 * restaura essa copia: a resposta daquela pergunta sai do registro e, se a pessoa
 * trocar uma resposta da Fase 1, a Fase 2 e replanejada normalmente ao avancar.
 */

/** Copia o estado do fluxo (listas e conjuntos novos; os itens do banco sao compartilhados). */
export function clonarEstado(f) {
  const copiarBaldes = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, [...v]]));
  return {
    ...f,
    fila: [...f.fila],
    respostas: copiarBaldes(f.respostas),
    itens: copiarBaldes(f.itens),
    desempateAplicado: { ...f.desempateAplicado },
    cruzadosIds: new Set(f.cruzadosIds),
  };
}

/**
 * Tempo de resposta a registrar ao avancar.
 * - Primeira vez na pergunta: o tempo ate o ultimo clique numa alternativa.
 * - Pergunta revisitada com a mesma resposta: o tempo original.
 * - Pergunta revisitada com resposta trocada: null (neutro no motor), porque uma
 *   resposta revista nao e uma reacao espontanea.
 */
export function tempoDaResposta({ anterior, altId, rtSelecao }) {
  if (!anterior) return rtSelecao;
  return anterior.altId === altId ? anterior.rtMs : null;
}

/** Alternativas do item (sem a "nula") em ordem aleatoria, Fisher-Yates. */
export function ordemAleatoria(item, aleatorio = Math.random) {
  const a = item.alternativas.filter((x) => !x.nula);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
