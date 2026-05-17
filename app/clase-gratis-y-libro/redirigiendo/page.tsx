'use client';

import { useEffect, useState } from 'react';

const REDIRECT_URL = 'https://historiasdelamente.com/apegodetox';
const COUNTDOWN_SECONDS = 10;

export default function RedirigiendoPage() {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    const timeout = setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, COUNTDOWN_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const progressPct = ((COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS) * 100;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        background: '#0A0A0A',
        color: '#FFFFFF',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes breathe { 0%,100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }
        .breathe-dot { animation: breathe 1.4s ease-in-out infinite; }
        .breathe-dot.d2 { animation-delay: 0.2s; }
        .breathe-dot.d3 { animation-delay: 0.4s; }
        @keyframes barFill { from { width: 0%; } to { width: 100%; } }
      `}</style>

      <div style={{ maxWidth: 480, padding: '0 24px', textAlign: 'center' }}>
        {/* Logo / eyebrow */}
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: 11,
            letterSpacing: '0.35em',
            color: '#D4AF37',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 32,
          }}
        >
          Historias de la Mente
        </div>

        {/* Loader 3 dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 36 }}>
          <span className="breathe-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4AF37', display: 'inline-block' }} />
          <span className="breathe-dot d2" style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4AF37', display: 'inline-block' }} />
          <span className="breathe-dot d3" style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4AF37', display: 'inline-block' }} />
        </div>

        {/* H1 */}
        <h1
          style={{
            fontFamily: "'Fraunces',Georgia,serif",
            fontWeight: 700,
            fontSize: 'clamp(24px, 5vw, 36px)',
            lineHeight: 1.2,
            color: '#FFFFFF',
            marginBottom: 18,
            letterSpacing: '-0.01em',
          }}
        >
          Estamos enviando tu correo.
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: 15,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.75)',
            marginBottom: 36,
          }}
        >
          La clase está a punto de empezar.
          <br />
          En unos segundos te llevamos.
        </p>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 4,
            background: 'rgba(212,175,55,0.15)',
            borderRadius: 999,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: '#D4AF37',
              transition: 'width 1s linear',
              borderRadius: 999,
            }}
          />
        </div>

        <p
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 36,
          }}
        >
          {secondsLeft > 0 ? `${secondsLeft} ${secondsLeft === 1 ? 'segundo' : 'segundos'}` : 'Llevándote…'}
        </p>

        {/* Microcopy */}
        <p
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}
        >
          Si no llega en 5 minutos, revisa tu carpeta de spam.<br />
          O escríbenos a <span style={{ color: '#D4AF37' }}>info@historiasdelamente.com</span>
        </p>

        {/* Manual fallback link */}
        <a
          href={REDIRECT_URL}
          style={{
            display: 'inline-block',
            marginTop: 28,
            fontFamily: "'Inter',sans-serif",
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'underline',
            letterSpacing: '0.05em',
          }}
        >
          o haz click aquí si no avanza
        </a>
      </div>
    </div>
  );
}
