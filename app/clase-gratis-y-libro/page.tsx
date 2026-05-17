'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const IMG = '/img/clase-gratis-y-libro';

export default function ClaseGratisYLibroPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Reveal observer
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: '#0A0A0A', color: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@400;500;600;700&family=Caveat:wght@700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        :root { --ink:#0A0A0A; --cream:#FFFFFF; --brand:#D4AF37; --terra:#C9663F; --copper:#B8915C; }
        .ad-serif{ font-family:'Fraunces',Georgia,serif; font-optical-sizing:auto; }
        .ad-sans{ font-family:'Inter',system-ui,sans-serif; }
        .ad-hand{ font-family:'Caveat',cursive; }
        .h-display{ font-family:'Fraunces',serif; font-weight:900; letter-spacing:-0.02em; line-height:1.05; }
        .h-section{ font-family:'Fraunces',serif; font-weight:700; letter-spacing:-0.015em; line-height:1.15; }
        .eyebrow{ font-family:'Inter',sans-serif; text-transform:uppercase; letter-spacing:0.18em; font-weight:600; font-size:11px; color:var(--brand); }
        .reveal{ opacity:0; transform:translateY(18px); transition:opacity .8s ease, transform .8s ease; }
        .reveal.in{ opacity:1; transform:none; }
        @media (prefers-reduced-motion: reduce){ .reveal{ opacity:1; transform:none; transition:none; } }

        .input-field{
          width:100%;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(212,175,55,0.25);
          color:#FFFFFF;
          font-family:'Inter',sans-serif;
          font-size:16px;
          padding:14px 16px;
          border-radius:6px;
          outline:none;
          transition:border-color .2s ease, background .2s ease;
        }
        .input-field:focus{ border-color:#D4AF37; background:rgba(255,255,255,0.06); }
        .input-field::placeholder{ color:rgba(255,255,255,0.45); }

        .btn-primary{
          display:inline-flex; align-items:center; justify-content:center; gap:.5rem;
          width:100%;
          background:#D4AF37; color:#0A0A0A;
          font-weight:700; font-family:'Inter',sans-serif;
          padding:16px 24px; min-height:56px; border-radius:8px;
          box-shadow:0 8px 32px rgba(212,175,55,0.3);
          transition:transform .25s ease, box-shadow .25s ease;
          letter-spacing:.04em; text-decoration:none;
          border:none; cursor:pointer; font-size:15px;
          text-transform:uppercase;
        }
        .btn-primary:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 14px 40px rgba(212,175,55,0.5); }
        .btn-primary:active{ transform:translateY(0); }
        .btn-primary:disabled{ opacity:.6; cursor:wait; }

        .copper-dot::before{
          content:''; display:inline-block; width:7px; height:7px; border-radius:50%;
          background:var(--copper); margin-right:14px; vertical-align:middle;
          box-shadow:0 0 0 4px rgba(184,145,92,0.12);
          flex-shrink:0;
        }

        .img-frame{ border-radius:14px; overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,0.55); }

        @keyframes pulseSlow{
          0%,100%{ box-shadow:0 8px 32px rgba(212,175,55,0.30); }
          50%    { box-shadow:0 8px 48px rgba(212,175,55,0.55), 0 0 0 6px rgba(212,175,55,0.08); }
        }
        .pulse-cta{ animation:pulseSlow 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .pulse-cta{ animation:none; } }
      `}</style>

      {/* ============ FREE BAR (sticky top) ============ */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: 'linear-gradient(90deg, #D4AF37 0%, #E5C870 50%, #D4AF37 100%)',
          color: '#0A0A0A',
          textAlign: 'center',
          padding: '10px 16px',
          fontFamily: "'Inter',sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        Gratis · Libro digital
      </div>

      {/* ============ HERO ============ */}
      <section className="px-5 md:px-8 pt-8 md:pt-14 pb-12 md:pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Foto hero */}
            <div className="reveal order-2 md:order-1">
              <div className="img-frame">
                <img
                  src={`${IMG}/hero.png`}
                  alt="Cómo Dejar al Narcisista — el alma se reconstruye"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>

            {/* Form column */}
            <div className="order-1 md:order-2">
              {/* Big GRATIS badge */}
              <div
                className="reveal"
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  background: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.45)',
                  borderRadius: 999,
                  marginBottom: 18,
                  fontFamily: "'Inter',sans-serif",
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#D4AF37',
                }}
              >
                ✦ Gratis hoy
              </div>

              <h1
                className="h-display reveal"
                style={{
                  color: '#FFFFFF',
                  fontSize: 'clamp(28px, 6vw, 44px)',
                  marginBottom: 16,
                }}
              >
                Cómo dejar al narcisista<br />
                <span style={{ color: '#D4AF37' }}>cuando tu cuerpo</span><br />
                no te deja salir.
              </h1>

              <p
                className="reveal ad-sans"
                style={{
                  color: 'rgba(255,255,255,0.78)',
                  fontSize: 16,
                  lineHeight: 1.55,
                  marginBottom: 24,
                  maxWidth: '36ch',
                }}
              >
                Lo dejaste y aún así no se te va de la cabeza.
                Esto no es debilidad. Es química.
                Aquí adentro está cómo se rompe.
              </p>

              <CaptureForm onSuccess={() => router.push('/clase-gratis-y-libro/redirigiendo')} />

              {/* What you get inline (below form) */}
              <div
                className="reveal"
                style={{
                  display: 'flex',
                  gap: 18,
                  marginTop: 20,
                  paddingTop: 18,
                  borderTop: '1px solid rgba(212,175,55,0.15)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="ad-serif" style={{ color: '#D4AF37', fontWeight: 700, fontSize: 13, marginBottom: 2, letterSpacing: '0.05em' }}>
                    📖 El libro
                  </div>
                  <div className="ad-sans" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 1.4 }}>
                    Cómo Dejar al Narcisista — PDF digital
                  </div>
                </div>
                <div style={{ width: 1, background: 'rgba(212,175,55,0.15)' }} />
                <div style={{ flex: 1 }}>
                  <div className="ad-serif" style={{ color: '#D4AF37', fontWeight: 700, fontSize: 13, marginBottom: 2, letterSpacing: '0.05em' }}>
                    📥 Acceso inmediato
                  </div>
                  <div className="ad-sans" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 1.4 }}>
                    Llega a tu correo en 60 segundos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ EMPATÍA ============ */}
      <section
        className="px-5 md:px-8 py-14 md:py-20"
        style={{ background: '#F5F1EA', color: '#1A1410' }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="h-section reveal"
            style={{
              color: '#1A1410',
              fontSize: 'clamp(22px, 4vw, 32px)',
              marginBottom: 28,
              textAlign: 'center',
            }}
          >
            Si llegaste hasta aquí,<br />ya sabes esto:
          </h2>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Te prometiste no pensar en él hoy. Fallaste antes del mediodía.',
              'Defiendes a quien te lastimó cuando una amiga te dice la verdad.',
              'Sabes con la cabeza que tienes que soltarlo. Tu cuerpo te lleva de vuelta.',
            ].map((t, i) => (
              <li
                key={i}
                className="copper-dot reveal ad-serif"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  fontSize: 17,
                  lineHeight: 1.6,
                  marginBottom: 18,
                  color: '#1A1410',
                  fontStyle: 'italic',
                }}
              >
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <p
            className="reveal ad-sans"
            style={{
              fontSize: 18,
              fontWeight: 600,
              textAlign: 'center',
              marginTop: 32,
              color: '#1A1410',
            }}
          >
            Eso no es amor. Es <span style={{ color: '#B8861F' }}>química</span>. Y se puede{' '}
            <span style={{ color: '#B8861F' }}>romper</span>.
          </p>
        </div>
      </section>

      {/* ============ LO QUE RECIBES ============ */}
      <section className="px-5 md:px-8 py-14 md:py-20" style={{ background: '#0A0A0A' }}>
        <div className="max-w-4xl mx-auto">
          <div className="eyebrow reveal" style={{ textAlign: 'center', marginBottom: 14 }}>
            Lo que llega a tu correo
          </div>
          <h2
            className="h-section reveal"
            style={{
              color: '#D4AF37',
              fontSize: 'clamp(24px, 4vw, 36px)',
              marginBottom: 36,
              textAlign: 'center',
            }}
          >
            En menos de un minuto.
          </h2>

          <div className="reveal img-frame" style={{ marginBottom: 28 }}>
            <img
              src={`${IMG}/oferta-completa.png`}
              alt="Cómo Dejar al Narcisista — libro digital, clase y plataforma"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          <ul
            className="reveal"
            style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: '36ch', marginInline: 'auto' }}
          >
            {[
              { titulo: 'El libro digital', desc: 'Cómo Dejar al Narcisista — Por Javier Vieira. PDF descargable.' },
              { titulo: 'Acceso inmediato', desc: 'Llega en menos de 60 segundos. Sin pago. Sin tarjeta.' },
            ].map((item, i) => (
              <li
                key={i}
                style={{
                  marginBottom: 16,
                  paddingLeft: 18,
                  borderLeft: '2px solid #D4AF37',
                }}
              >
                <div className="ad-serif" style={{ color: '#D4AF37', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                  {item.titulo}
                </div>
                <div className="ad-sans" style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.55 }}>
                  {item.desc}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ AUTORIDAD JAVIER ============ */}
      <section
        className="px-5 md:px-8 py-14 md:py-20"
        style={{ background: '#F5F1EA', color: '#1A1410' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[280px_1fr] gap-10 md:gap-14 items-center">
            <div className="reveal">
              <div className="img-frame">
                <picture>
                  <source srcSet="/img/apegodetox/javier-800.webp" media="(min-width: 768px)" />
                  <img
                    src="/img/apegodetox/javier-400.webp"
                    alt="Javier Vieira — Psicólogo Especialista"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </picture>
              </div>
            </div>

            <div>
              <h3 className="h-section reveal" style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', marginBottom: 6, color: '#1A1410' }}>
                Soy Javier Vieira.
              </h3>
              <p className="ad-serif reveal" style={{ fontSize: 18, color: 'rgba(26,20,16,0.65)', marginBottom: 18, fontStyle: 'italic' }}>
                Psicólogo Especialista.
              </p>
              <p className="ad-sans reveal" style={{ fontSize: 16, lineHeight: 1.65, color: '#1A1410', marginBottom: 18 }}>
                Llevo casi dos décadas trabajando con mujeres exactamente como tú. Mujeres brillantes, profesionales, madres — consumidas por un hombre que las trata como si no valieran nada.
              </p>
              <p
                className="ad-serif reveal"
                style={{
                  fontSize: 18,
                  fontStyle: 'italic',
                  color: '#C9663F',
                  fontWeight: 600,
                  lineHeight: 1.45,
                  borderLeft: '2px solid #C9663F',
                  paddingLeft: 16,
                }}
              >
                A una mujer en trauma bonding no le sirve más información. Le sirve regulación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROMESA ============ */}
      <section className="px-5 md:px-8 py-14 md:py-20" style={{ background: '#0A0A0A' }}>
        <div className="max-w-3xl mx-auto" style={{ textAlign: 'center' }}>
          <h2 className="h-section reveal" style={{ color: '#FFFFFF', fontSize: 'clamp(22px, 4vw, 32px)', lineHeight: 1.3, marginBottom: 16 }}>
            Vas a entender por qué.
          </h2>
          <h2 className="h-section reveal" style={{ color: '#FFFFFF', fontSize: 'clamp(22px, 4vw, 32px)', lineHeight: 1.3, marginBottom: 16 }}>
            Vas a dejar de odiarte por haberte quedado.
          </h2>
          <h2 className="h-section reveal" style={{ color: '#D4AF37', fontSize: 'clamp(22px, 4vw, 32px)', lineHeight: 1.3 }}>
            Vas a recuperar tu cabeza.
          </h2>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section
        className="px-5 md:px-8 py-14 md:py-20"
        style={{ background: '#F5F1EA', color: '#1A1410' }}
      >
        <div className="max-w-md mx-auto">
          <h2
            className="h-section reveal"
            style={{ color: '#1A1410', fontSize: 'clamp(24px, 4vw, 34px)', marginBottom: 12, textAlign: 'center', lineHeight: 1.2 }}
          >
            Mereces entender<br />
            <span style={{ color: '#B8861F' }}>qué te está pasando.</span>
          </h2>
          <p
            className="ad-sans reveal"
            style={{ fontSize: 15, color: 'rgba(26,20,16,0.7)', textAlign: 'center', marginBottom: 26 }}
          >
            Descarga el libro gratis. Ahora mismo.
          </p>

          <CaptureForm
            onSuccess={() => router.push('/clase-gratis-y-libro/redirigiendo')}
            theme="light"
          />
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 text-center">
          <div className="ad-serif" style={{ color: '#D4AF37', fontSize: 14, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Historias de la Mente
          </div>
          <div className="ad-sans" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 8, letterSpacing: '0.05em' }}>
            Javier Vieira · Psicólogo Especialista
          </div>
          <div className="ad-sans" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 18, lineHeight: 1.6 }}>
            No reemplaza terapia clínica.<br />
            Programa educativo y de acompañamiento emocional dirigido por Psicólogo Especialista.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// FORM COMPONENT
// ============================================================================
function CaptureForm({
  onSuccess,
  theme = 'dark',
}: {
  onSuccess: () => void;
  theme?: 'dark' | 'light';
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLight = theme === 'light';
  const inputStyle: React.CSSProperties = isLight
    ? {
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid rgba(184,134,31,0.4)',
        color: '#1A1410',
        fontFamily: "'Inter',sans-serif",
        fontSize: 16,
        padding: '14px 16px',
        borderRadius: 6,
        outline: 'none',
      }
    : {};

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const n = nombre.trim();
    const em = email.trim().toLowerCase();
    if (n.length < 2) return setError('Escribe tu nombre.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return setError('Escribe un email válido.');

    setLoading(true);
    try {
      const r = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: n, email: em }),
      });
      // Aunque haya warnings, si el endpoint responde con success igual continuamos
      if (r.status === 429) {
        const j = await r.json().catch(() => ({}));
        setError(j.error || 'Demasiados intentos. Espera un minuto.');
        setLoading(false);
        return;
      }
      // Continuar al redirect aunque haya warnings parciales
      onSuccess();
    } catch {
      // Aún en error de red, llevamos a la página intermedia para no perder al lead
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text"
        autoComplete="given-name"
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className={isLight ? '' : 'input-field'}
        style={isLight ? inputStyle : undefined}
        required
      />
      <input
        type="email"
        autoComplete="email"
        placeholder="Tu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={isLight ? '' : 'input-field'}
        style={isLight ? inputStyle : undefined}
        required
      />
      {error && (
        <div
          className="ad-sans"
          style={{
            color: '#C9663F',
            fontSize: 13,
            background: isLight ? 'rgba(201,102,63,0.08)' : 'rgba(201,102,63,0.12)',
            border: '1px solid rgba(201,102,63,0.3)',
            padding: '8px 12px',
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}
      <button type="submit" className="btn-primary pulse-cta" disabled={loading}>
        {loading ? 'Enviando…' : 'Recibir el libro gratis →'}
      </button>
      <p
        className="ad-sans"
        style={{
          fontSize: 12,
          color: isLight ? 'rgba(26,20,16,0.6)' : 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          marginTop: 4,
          lineHeight: 1.5,
        }}
      >
        Acceso inmediato. Sin spam. Sin tarjeta.
      </p>
    </form>
  );
}
