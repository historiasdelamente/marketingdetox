import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildSystemPrompt, type WaUser } from '@/lib/whatsapp/paula';
import { esMonosilabo, puedeCallar } from '@/lib/whatsapp/prompt-v2';
import type { Turno } from '@/lib/whatsapp/guion';

// ============================================================================
// EL CONTRATO DEL PROMPT V2 — «cuatro hechos, cero libreto»
//
// Estos tests NO prueban lo que el modelo escribe (eso es el simulador): fijan
// lo que el prompt LE ENTREGA. Si alguien vuelve a meter el folleto, el menú
// de features o una orden de venta por posición en el embudo, esto revienta.
// ============================================================================

const USER: WaUser = {
  id: 0,
  manychat_id: 'test-v2',
  name: 'Jennifer',
  funnel_stage: 'link_enviado',
  situacion_resumen: null,
  first_contact: '',
  last_interaction: '',
  conversation_count: 0,
};

const ella = (content: string): Turno => ({ role: 'user', content });
const paula = (content: string): Turno => ({ role: 'assistant', content });

// La conversación de Jennifer al momento del «🙏🙏»: ya tiene el link.
const HISTORIAL_JENNIFER: Turno[] = [
  ella('Hola vengo de TikTok'),
  paula('Soy Paula, del equipo de Javier Vieira, Psicólogo Especialista. ¿Cómo te llamas?'),
  ella('Jennifer'),
  paula('Mucho gusto, Jennifer. ¿Sigues con él, o ya saliste?'),
  ella('Sigo con el aún y quiero salir de el'),
  paula('Apego Detox trabaja justo eso. Puedes verlo aquí 👉\nhttps://historiasdelamente.com/apegodetox'),
  ella('Si yo estoy ya que no soy yo y toda mi familia el me la alejo'),
  paula('Sentirte una extraña contigo misma y sin tu gente cerca pesa muchísimo, Jennifer.'),
];

function promptV2(historial: Turno[], mensaje: string): string {
  return buildSystemPrompt(USER, '', '+18095551234', {
    ahora: new Date('2026-08-14T20:00:00-05:00'),
    historial,
    mensajeDeElla: mensaje,
    tasas: { COP: 4100, MXN: 17, ARS: 1300, CLP: 950, PEN: 3.7, EUR: 0.9 },
  });
}

describe('v2 — el guion viejo no viaja en el prompt', () => {
  beforeEach(() => {
    process.env.PAULA_PROMPT = 'v2';
  });
  afterEach(() => {
    delete process.env.PAULA_PROMPT;
  });

  it('con «🙏🙏» el prompt no trae NINGUNA orden de venta ni menú de features', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '🙏🙏');
    // Las frases-menú del guion viejo, muertas:
    expect(p).not.toContain('LO QUE TOCA AHORA');
    expect(p).not.toContain('ESPERAR SU PREGUNTA, NO EMPUJAR');
    expect(p).not.toContain('le das UNA cosa nueva y concreta de adentro');
    // El folleto literal, muerto:
    expect(p).not.toContain('17 módulos de terapia en video: entiendes por qué te pasó');
    expect(p).not.toContain('es donde se trabaja justo eso, y es esto');
  });

  it('el ledger 🧾 lista lo ya dado, como hecho y no como orden', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '🙏🙏');
    expect(p).toContain('🧾 YA LE DISTE');
    expect(p).toContain('un link');
  });

  it('la pregunta del freno está prohibida SIEMPRE en el prompt', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '🙏🙏');
    expect(p).toMatch(/PROHIBIDO SIEMPRE[\s\S]{0,120}qué la frena/i);
  });

  it('las cifras del programa van exactas y con su regla de redacción', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '¿qué incluye?');
    expect(p).toContain('17 módulos');
    expect(p).toContain('4 horas de talleres EN VIVO');
    expect(p).toContain('la redacción es tuya, los números no');
  });

  it('💳 la seguridad del pago viaja siempre: Skool y Stripe con sus hechos', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'me da miedo poner mi tarjeta');
    expect(p).toContain('Skool');
    expect(p).toContain('Stripe');
    expect(p).toMatch(/NUNCA vemos ni guardamos su tarjeta/);
  });

  it('el caso Alejandra viaja como 📮: pidió correo y llegó otra cosa', () => {
    const conPeticion: Turno[] = [
      ella('Me llamo Alejandra'),
      paula('Tengo una cartilla de Javier, ¿a qué correo te la mando?'),
    ];
    const p = promptV2(conPeticion, 'Alejandra campos');
    expect(p).toContain('📮 PENDIENTE');
    expect(p).toContain('NO es un correo');
  });

  it('la hora del taller va en LA HORA DE ELLA (República Dominicana: 9 PM)', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'a qué hora son');
    expect(p).toMatch(/9:00 PM.*ESA ES LA HORA DE ELLA/);
  });

  it('el prompt renderizado respeta el fusible de tamaño (≤23.500 chars)', () => {
    // El v1 medía 42.000-47.000 con TRES órdenes contradictorias dentro. El
    // fusible no es meta estética: es el freno para que el estado no vuelva a
    // crecer hasta ser guion — para añadir aquí, hay que borrar allá.
    //
    // ⚠️ SUBIDO DE 20.000 A 23.500 EL 2026-08-15, CON LA CONTABILIDAD HECHA.
    // Orden de Javier: «el objetivo es vender (…) no des el precio sin antes
    // hacer una motivación real». La sección EL PROGRAMA se reescribió entera y
    // ABSORBIÓ dos secciones que vivían aparte —MODO CONSERJE y TERAPIA
    // INDIVIDUAL— más el tratamiento del precio que estaba disperso. A cambio
    // se borraron los argumentos duplicados de PAULA-CONOCIMIENTO-V2.md.
    // Neto: +3.100 por una reescritura pedida por el dueño, no por acumular.
    //
    // El techo se sube con una orden detrás y la cuenta escrita, jamás para que
    // quepa una idea más. Sigue siendo la mitad del v1.
    const p = promptV2(HISTORIAL_JENNIFER, 'cuéntame qué es el programa');
    expect(p.length).toBeLessThanOrEqual(23500);
  });

  it('sin PAULA_PROMPT=v2, el prompt v1 sigue intacto (con su guion)', () => {
    delete process.env.PAULA_PROMPT;
    const p = promptV2(HISTORIAL_JENNIFER, '🙏🙏');
    expect(p).toContain('LO QUE TOCA AHORA');
  });
});

describe('v2 — [SILENCIO] solo con la doble condición', () => {
  it('monosílabo tras un cierre sin pregunta → puede callar', () => {
    const h: Turno[] = [...HISTORIAL_JENNIFER, ella('gracias'), paula('A ti, Jennifer 💛')];
    expect(puedeCallar(h, '🙏')).toBe(true);
  });

  it('si el último mensaje de Paula preguntó algo → NO se calla', () => {
    const h: Turno[] = [...HISTORIAL_JENNIFER, paula('¿A qué correo te la mando?')];
    expect(puedeCallar(h, '🙏')).toBe(false);
  });

  it('si ella escribió algo con sustancia → NO se calla', () => {
    const h: Turno[] = [...HISTORIAL_JENNIFER, paula('A ti 💛')];
    expect(puedeCallar(h, 'es que anoche volvió a escribirme y no sé qué hacer')).toBe(false);
  });

  it.each(['🙏🙏', 'ok', 'Está bien', 'gracias 💛', 'Si'])('«%s» es monosílabo', (m) => {
    expect(esMonosilabo(m)).toBe(true);
  });

  it.each(['¿y cuánto vale?', 'no sé si pueda pagarlo', 'anoche me buscó otra vez'])(
    '«%s» NO es monosílabo',
    (m) => {
      expect(esMonosilabo(m)).toBe(false);
    },
  );
});

describe('v2 — handoff con prefill por motivo', () => {
  beforeEach(() => {
    process.env.PAULA_PROMPT = 'v2';
  });
  afterEach(() => {
    delete process.env.PAULA_PROMPT;
  });

  it('pide terapia → el wa.me lleva el prefill de terapia, no el genérico', () => {
    const p = buildSystemPrompt(USER, '', '+573001112233', {
      handoff: 'pide_humano',
      historial: HISTORIAL_JENNIFER,
      mensajeDeElla: 'el da terapia?',
    });
    expect(p).toContain('vengo%20de%20hablar%20con%20Paula');
    expect(p).toContain('consulta%20contigo');
  });
});
