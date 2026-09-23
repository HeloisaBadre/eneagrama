import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IDIOMAS, PADRAO, TEXTOS } from './textos.jsx';
import * as ptConteudo from '../data/results.js';
import * as enConteudo from '../data/results.en.js';

/**
 * Idioma da interface. Portugues e o padrao; ingles e opcional, num botao
 * pequeno no canto da barra de titulo.
 *
 * A escolha vale para tudo: rotulos, perguntas e relatorio. As perguntas nao
 * trocam de arquivo: cada item carrega os dois textos (`cenario` e `cenario_en`),
 * entao trocar de idioma no meio do teste nao perde nenhuma resposta, e a
 * pontuacao nem fica sabendo.
 *
 * A preferencia fica no localStorage, dentro de try/catch: em aba anonima, ou
 * com armazenamento bloqueado, o acesso lanca, e ai o teste simplesmente abre em
 * portugues.
 */

const CHAVE = 'eneatipo.idioma';
const CONTEUDO = { pt: ptConteudo, en: enConteudo };

const Ctx = createContext(null);

function lerPreferencia() {
  try {
    const v = localStorage.getItem(CHAVE);
    return IDIOMAS.some((i) => i.chave === v) ? v : PADRAO;
  } catch {
    return PADRAO;
  }
}

export function ProvedorIdioma({ children }) {
  const [idioma, setIdiomaEstado] = useState(lerPreferencia);

  const setIdioma = useCallback((novo) => {
    setIdiomaEstado(novo);
    try {
      localStorage.setItem(CHAVE, novo);
    } catch {
      // Sem armazenamento: a escolha vale para esta sessao e pronto.
    }
  }, []);

  // O titulo da aba tambem segue o idioma.
  useEffect(() => {
    document.title = TEXTOS[idioma].titulo;
    document.documentElement.lang = idioma === 'en' ? 'en' : 'pt-BR';
  }, [idioma]);

  const valor = useMemo(
    () => ({ idioma, setIdioma, t: TEXTOS[idioma], conteudo: CONTEUDO[idioma] }),
    [idioma, setIdioma]
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useIdioma() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useIdioma fora do ProvedorIdioma');
  return v;
}

/** Texto de um item do banco no idioma atual, com o portugues como reserva. */
export function textoNoIdioma(obj, campo, idioma) {
  if (!obj) return '';
  if (idioma !== 'pt') {
    const traduzido = obj[`${campo}_en`];
    if (traduzido) return traduzido;
  }
  return obj[campo];
}

/** Botao pequeno no canto: mostra o idioma para o qual se troca. */
export function SeletorIdioma() {
  const { idioma, setIdioma, t } = useIdioma();
  const proximo = IDIOMAS[(IDIOMAS.findIndex((i) => i.chave === idioma) + 1) % IDIOMAS.length];
  return (
    <button
      type="button"
      onClick={() => setIdioma(proximo.chave)}
      title={`${t.trocarIdioma}: ${proximo.rotulo}`}
      aria-label={`${t.trocarIdioma}: ${proximo.rotulo}`}
      className="lang-btn"
    >
      <span aria-hidden="true">🌐</span> {proximo.curto}
    </button>
  );
}
