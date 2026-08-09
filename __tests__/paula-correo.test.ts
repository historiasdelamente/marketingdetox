import { describe, it, expect } from 'vitest';

import { correoEn } from '@/lib/whatsapp/crm';
import { buildSystemPrompt, type WaUser } from '@/lib/whatsapp/paula';

const VIERNES_31 = new Date('2026-07-31T15:00:00Z');

const ella: WaUser = {
  id: 1,
  manychat_id: 'u-correo',
  name: 'Ana',
  funnel_stage: 'nuevo',
  situacion_resumen: null,
  first_contact: '',
  last_interaction: '',
  conversation_count: 3,
  phone: '+521234567890',
  pais: 'MX',
};

/**
 * LA CONVERSACIÓN EN LA QUE LA CARTILLA YA PUEDE SALIR.
 *
 * ⚠️ EL ÚLTIMO MENSAJE DE PAULA IMPORTA Y NO ES DECORADO. Desde el 2026-08-08 la
 * cartilla no se ofrece hasta que ella sepa qué es Apego Detox (`sabeQueEs`), y
 * eso se lee de lo que Paula ya escribió: por eso aquí nombra los talleres, la
 * comunidad y los módulos. Sin esa línea, la cartilla no sale — y hay un test
 * justo debajo que lo comprueba.
 */
const charla = [
  { role: 'user' as const, content: 'hola' },
  { role: 'assistant' as const, content: 'Hola, ¿cómo te llamas?' },
  { role: 'user' as const, content: 'Ana, de México' },
  { role: 'assistant' as const, content: 'Un gusto, Ana. Adentro hay módulos de terapia en video, talleres en vivo con Javier cada semana y una comunidad a cualquier hora.' },
];

/** La misma charla ANTES de que Paula le contara qué es el programa. */
const charlaSinPresentar = [
  { role: 'user' as const, content: 'hola' },
  { role: 'assistant' as const, content: 'Hola, ¿cómo te llamas?' },
  { role: 'user' as const, content: 'Ana, de México' },
  { role: 'assistant' as const, content: '¿Sigues con él y quieres salir, o ya saliste y quieres recuperarte?' },
];

describe('sacar el correo de lo que ella escribe', () => {
  it('lo encuentra escrito como lo escribe la gente', () => {
    expect(correoEn('mi correo es ana.perez@gmail.com')).toBe('ana.perez@gmail.com');
    expect(correoEn('ANA_PEREZ@Hotmail.COM')).toBe('ana_perez@hotmail.com');
    // Un punto de fin de frase pegado al dominio no es parte del correo.
    expect(correoEn('mándamela a ana@gmail.com.')).toBe('ana@gmail.com');
    expect(correoEn('  ana+detox@mi-dominio.co  ')).toBe('ana+detox@mi-dominio.co');
  });

  it('no se inventa uno donde no lo hay', () => {
    for (const m of ['no tengo correo', 'arroba', 'llámame al 3001234567', '', 'hola@']) {
      expect(correoEn(m)).toBeNull();
    }
  });
});

describe('cuándo le pide el correo', () => {
  const prompt = (u: WaUser, opts: Record<string, unknown> = {}) =>
    buildSystemPrompt(u, 'tiktok_live', '+521234567890', {
      ahora: VIERNES_31,
      historial: charla,
      mensajeDeElla: 'llevo dos años así',
      ...opts,
    });

  it('se lo pide cuando la conversación ya arrancó y no lo tenemos', () => {
    expect(prompt(ella)).toContain('TIENES ALGO QUE MANDARLE');
  });

  it('NO se lo pide si ya lo tenemos', () => {
    expect(prompt({ ...ella, email: 'ana@gmail.com' })).not.toContain('TIENES ALGO QUE MANDARLE');
  });

  it('NO se lo pide en el primer mensaje — ahí solo va su nombre', () => {
    expect(prompt(ella, { esPrimerTurno: true, historial: [] })).not.toContain('TIENES ALGO QUE MANDARLE');
  });

  it('NO se lo pide si ella se está despidiendo', () => {
    expect(prompt(ella, { mensajeDeElla: 'gracias, luego te escribo' })).not.toContain(
      'TIENES ALGO QUE MANDARLE',
    );
  });

  it('lo ofrece como regalo, no como registro', () => {
    const p = prompt(ella);
    expect(p).toContain('Sal del Narcisismo');
    expect(p).toMatch(/No la nombres como un requisito ni como un registro/);
    expect(p).toMatch(/Una sola vez/);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LA CARTILLA NO LE ROBA EL SITIO A APEGO DETOX — 2026-08-08
  //
  // Javier, viendo tres conversaciones reales: *"se le da más fuerza a la
  // cartilla siendo el elemento principal Apego Detox"*. Y no era una cuestión
  // de tono: **la cartilla termina en pregunta y el programa no**. Puestos en el
  // mismo mensaje, ella contesta la pregunta —manda su correo— y el programa se
  // queda en la línea que se saltó para llegar hasta ahí. A Paulina le pasó
  // entero: nunca leyó qué es Apego Detox y contestó con su Gmail.
  // ═══════════════════════════════════════════════════════════════════════════

  it('NO se lo pide antes de que ella sepa qué es Apego Detox', () => {
    const p = prompt(ella, { historial: charlaSinPresentar, mensajeDeElla: 'llevo dos años así' });
    expect(p).not.toContain('TIENES ALGO QUE MANDARLE');
  });

  it('NO se lo pide en el mismo mensaje en que le presenta el programa', () => {
    // El turno exacto de las capturas: ella contesta la pregunta de entrada, y
    // ese mensaje es el de la presentación (bloque 📦). Ahí la cartilla calla.
    const p = prompt(ella, {
      historial: charlaSinPresentar,
      mensajeDeElla: 'ya salí y quiero recuperarme',
    });
    expect(p).toContain('ELLA SE ENTERA DE QUÉ ES APEGO DETOX');
    expect(p).not.toContain('TIENES ALGO QUE MANDARLE');
  });
});
