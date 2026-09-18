import { useEffect, useMemo, useRef, useState } from 'react';

// Embaralhamento Fisher-Yates (apresentacao apenas).
function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Renderiza um item e captura SILENCIOSAMENTE o tempo de resposta:
 * do momento em que o cenario aparece ate o clique na alternativa.
 * Nenhuma pista visual de cronometragem (por design).
 *
 * A ORDEM das alternativas e aleatorizada a cada exibicao (por item.id), para
 * que a posicao nunca vire uma pista de categoria. A alternativa "nula"
 * ("Nenhuma dessas se parece comigo") fica sempre por ultimo, separada.
 */
export default function QuestionCard({ item, onAnswer }) {
  const inicioRef = useRef(0);
  const [selecionada, setSelecionada] = useState(null);

  const alternativas = useMemo(() => embaralhar(item.alternativas.filter((a) => !a.nula)), [item.id]);
  const nula = useMemo(() => item.alternativas.find((a) => a.nula) || null, [item.id]);

  useEffect(() => {
    inicioRef.current = performance.now();
    setSelecionada(null);
  }, [item.id]);

  function escolher(altId) {
    if (selecionada) return; // evita duplo clique
    const rtMs = Math.round(performance.now() - inicioRef.current);
    setSelecionada(altId);
    setTimeout(() => onAnswer(altId, rtMs), 180);
  }

  function botao(alt, extraStyle) {
    const ativa = selecionada === alt.id;
    const cls = 'answer' + (ativa ? ' sel' : '') + (selecionada && !ativa ? ' dim' : '');
    return (
      <button
        key={alt.id}
        onClick={() => escolher(alt.id)}
        disabled={!!selecionada}
        className={cls}
        style={extraStyle}
      >
        {alt.texto}
      </button>
    );
  }

  return (
    <div className="fade-in" key={item.id}>
      <div className="box">
        <div className="box-hd">
          <span>{rotuloDominio(item.dominio) || 'Cenário'}</span>
        </div>
        <div className="box-bd">
          <h2
            className="serif-title"
            style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: '#1d1d1f', margin: 0 }}
          >
            {item.cenario}
          </h2>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#33536f', margin: '12px 2px 8px' }}>
        Escolha a alternativa mais verdadeira para você, mesmo que não seja perfeita:
      </p>

      <div>{alternativas.map((alt) => botao(alt))}</div>

      {nula && (
        <div style={{ marginTop: 10 }}>{botao(nula, { opacity: 0.8, fontStyle: 'italic' })}</div>
      )}
    </div>
  );
}

function rotuloDominio(d) {
  const map = {
    trabalho: 'No trabalho',
    familia: 'Na família',
    amizade: 'Entre amigos',
    romance: 'No amor',
    geral: '',
  };
  return map[d] ?? '';
}
