import { useEffect, useRef, useState } from 'react';
import { tempoDaResposta } from '../engine/navegacao.js';
import { useIdioma, textoNoIdioma } from '../i18n/index.jsx';

/**
 * Renderiza um item. Clicar numa alternativa so a marca (a pessoa pode trocar);
 * "Avancar" confirma a resposta e so fica ativo com uma alternativa marcada.
 * "Voltar" leva a pergunta anterior (desativado na primeira).
 *
 * O tempo de resposta e capturado SILENCIOSAMENTE, do momento em que o cenario
 * aparece ate o ultimo clique numa alternativa (ver tempoDaResposta para as
 * perguntas revisitadas). Nenhuma pista visual de cronometragem (por design).
 *
 * A ordem das alternativas vem pronta do App (`alternativas`), aleatoria mas
 * estavel por pergunta, para que a posicao nunca vire pista de categoria e para
 * que a pessoa reencontre a mesma ordem ao voltar. A alternativa "nula"
 * ("Nenhuma dessas se parece comigo") fica sempre por ultimo, separada.
 *
 * O App recria este componente a cada pergunta (key = item.id), entao o estado
 * sempre nasce limpo, ou com a resposta anterior marcada.
 *
 * Itens de escala (`item.escala`) sao a excecao: a frase e uma afirmacao sobre a
 * pessoa, as opcoes vao de "me identifico completamente" a "nao me identifico
 * nada", e por isso a ordem NAO e embaralhada e nao existe alternativa nula.
 *
 * @param respostaAnterior { altId, rtMs } se a pessoa ja respondeu esta pergunta
 */
export default function QuestionCard({ item, alternativas, respostaAnterior, onAvancar, onVoltar }) {
  const { t, idioma } = useIdioma();
  const inicioRef = useRef(0);
  const rtSelecaoRef = useRef(null);
  const [selecionada, setSelecionada] = useState(respostaAnterior ? respostaAnterior.altId : null);
  const [enviando, setEnviando] = useState(false);
  // Trava sincrona: dois cliques seguidos em "Avancar" chegam antes de o estado
  // `enviando` ser aplicado, e o segundo nao pode confirmar nada.
  const enviandoRef = useRef(false);

  const escala = !!item.escala;
  const nula = escala ? null : item.alternativas.find((a) => a.nula) || null;

  // O cronometro comeca quando a pergunta aparece.
  useEffect(() => {
    inicioRef.current = performance.now();
  }, []);

  function marcar(altId) {
    if (enviandoRef.current) return;
    rtSelecaoRef.current = Math.round(performance.now() - inicioRef.current);
    setSelecionada(altId);
  }

  function avancar() {
    if (!selecionada || enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    const rtMs = tempoDaResposta({ anterior: respostaAnterior, altId: selecionada, rtSelecao: rtSelecaoRef.current });
    onAvancar(item.id, selecionada, rtMs);
  }

  function voltar() {
    if (enviandoRef.current || !onVoltar) return;
    enviandoRef.current = true;
    setEnviando(true);
    onVoltar(item.id);
  }

  function botao(alt, extraStyle) {
    const ativa = selecionada === alt.id;
    return (
      <button
        key={alt.id}
        onClick={() => marcar(alt.id)}
        className={'answer' + (ativa ? ' sel' : '')}
        aria-pressed={ativa}
        style={extraStyle}
      >
        {textoNoIdioma(alt, 'texto', idioma)}
      </button>
    );
  }

  return (
    <div className="fade-in" key={item.id}>
      <div className="box">
        <div className="box-hd">
          <span>{escala ? t.quiz.cabecalhoEscala : t.quiz.dominio[item.dominio] || t.quiz.cabecalhoCenario}</span>
        </div>
        <div className="box-bd">
          <h2
            className="serif-title"
            style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: '#1d1d1f', margin: 0 }}
          >
            {textoNoIdioma(item, 'cenario', idioma)}
          </h2>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#33536f', margin: '12px 2px 8px' }}>
        {escala ? t.quiz.instrucaoEscala : t.quiz.instrucao}
      </p>

      <div>{alternativas.map((alt) => botao(alt, escala ? estiloEscala(alt) : undefined))}</div>

      {nula && (
        <div style={{ marginTop: 10 }}>{botao(nula, { opacity: 0.8, fontStyle: 'italic' })}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <button onClick={voltar} disabled={!onVoltar || enviando} className="bevel-btn">
          {t.quiz.voltar}
        </button>
        <button
          onClick={avancar}
          disabled={!selecionada || enviando}
          className="aqua-btn"
          style={{ fontSize: 14, padding: '7px 26px' }}
        >
          {t.quiz.avancar}
        </button>
      </div>
    </div>
  );
}

/**
 * Na escala, a opcao carrega uma pista visual da propria intensidade: quem
 * concorda fica em cima, quem nega fica embaixo, e o texto vai clareando. Sem
 * numeros, para nao virar conta.
 */
function estiloEscala(alt) {
  const v = typeof alt.valor === 'number' ? alt.valor : 0;
  const forca = Math.abs(v);
  return {
    fontWeight: forca >= 1 ? 600 : 400,
    color: forca === 0 ? '#5a6b7a' : '#1d1d1f',
    borderLeft: `4px solid ${v > 0 ? 'rgba(53,116,180,' + (0.25 + 0.55 * forca) + ')' : v < 0 ? 'rgba(150,90,70,' + (0.2 + 0.4 * forca) + ')' : 'rgba(140,140,140,0.35)'}`,
  };
}
