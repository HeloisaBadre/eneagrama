/**
 * Barra de progresso DELIBERADAMENTE nao-reveladora: nao mostra
 * "pergunta X de Y" nem "fase X de 3". Avanca de forma suave e assintotica.
 * Visual: barra Aqua com listras diagonais (Mac OS X).
 */
export default function ProgressBar({ respondidas }) {
  // Curva assintotica: nunca chega a 100% ate o fim real.
  const pct = Math.min(92, 100 * (1 - Math.pow(0.94, respondidas)));
  return (
    <div className="w-full">
      <div className="aqua-progress">
        <div className="aqua-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p style={{ fontSize: 11, color: '#33536f', marginTop: 5, marginBottom: 0 }}>
        Em andamento. Responda com honestidade, sem calcular.
      </p>
    </div>
  );
}
