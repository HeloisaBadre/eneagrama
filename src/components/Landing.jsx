import { useIdioma } from '../i18n/index.jsx';

export default function Landing({ onStart }) {
  const { t } = useIdioma();
  return (
    <div className="fade-in">
      <h1
        className="serif-title"
        style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', margin: '6px 0 16px', color: '#12325e' }}
      >
        {t.titulo}
      </h1>

      <div className="box">
        <div className="box-hd"><span>{t.landing.comoFunciona}</span></div>
        <div className="box-bd" style={{ fontSize: 14, lineHeight: 1.65 }}>
          <p style={{ marginTop: 0 }}>{t.landing.p1}</p>
          <p style={{ marginBottom: 0 }}>{t.landing.p2}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <button onClick={onStart} className="aqua-btn" style={{ fontSize: 15, padding: '9px 34px' }}>
          {t.landing.comecar}
        </button>
      </div>
    </div>
  );
}
