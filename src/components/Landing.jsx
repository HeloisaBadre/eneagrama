export default function Landing({ onStart }) {
  return (
    <div className="fade-in">
      <h1
        className="serif-title"
        style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', margin: '6px 0 16px', color: '#12325e' }}
      >
        Teste de Eneagrama
      </h1>

      <div className="box">
        <div className="box-hd"><span>Como funciona</span></div>
        <div className="box-bd" style={{ fontSize: 14, lineHeight: 1.65 }}>
          <p style={{ marginTop: 0 }}>
            Este teste ajuda você a descobrir o seu tipo no eneagrama.
          </p>
          <p style={{ marginBottom: 0 }}>
            Responda com honestidade: em cada pergunta, escolha a alternativa que soa mais
            verdadeira para você, sem tentar calcular ou adivinhar a resposta “certa”. Leva alguns
            minutos.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <button onClick={onStart} className="aqua-btn" style={{ fontSize: 15, padding: '9px 34px' }}>
          Começar
        </button>
      </div>
    </div>
  );
}
