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

  // ═══════════════════════════════════════════════════════════════════════════
  // LA CARTILLA SE ADELANTÓ AL PROGRAMA — 2026-08-09
  //
  // La regla del 08 se cumplía a la letra y el resultado fue que **el correo no
  // se pedía casi nunca**: el turno en que `sabeQueEs` se pone en true es justo
  // el de la presentación, donde la cartilla calla; al siguiente saltaba la
  // segunda tanda de viñetas y volvía a callar; al tercero, cualquier pregunta
  // suya lo apagaba. Cinco conversaciones seguidas de la noche del 9 al 10 de
  // agosto terminaron sin correo. Javier: *"tampoco le manda el correo"*.
  //
  // Su regla del 08 era MECÁNICA —*la cartilla termina en pregunta y el
  // programa no; en el mismo mensaje ella contesta la cartilla y se salta el
  // programa*— y sigue en pie: nunca van juntas. Lo que cambia es el orden.
  // ═══════════════════════════════════════════════════════════════════════════

  it('ahora SÍ se lo pide antes del programa: ese es el turno de escucha', () => {
    const p = prompt(ella, {
      historial: charlaSinPresentar,
      mensajeDeElla: 'ya salí y quiero recuperarme',
    });
    expect(p).toContain('TIENES ALGO QUE MANDARLE');
    // …y en ese mismo mensaje el programa NO va. Esa es la regla de Javier.
    expect(p).not.toContain('ELLA SE ENTERA DE QUÉ ES APEGO DETOX');
  });

  it('NO se lo pide a quien solo ha dicho «hola» y su nombre', () => {
    const p = prompt(ella, { historial: charlaSinPresentar, mensajeDeElla: 'ok' });
    expect(p).not.toContain('TIENES ALGO QUE MANDARLE');
  });

  it('NO se lo pide en el mismo mensaje en que le presenta el programa', () => {
    // Un turno después: la cartilla ya salió, así que ahora toca el bloque 📦 —
    // y ahí la cartilla calla. Las dos piezas nunca coinciden en un mensaje.
    const yaOfrecida = [
      ...charlaSinPresentar,
      { role: 'user' as const, content: 'ya salí y quiero recuperarme' },
      { role: 'assistant' as const, content: 'Tengo una cartilla que te va a servir, ¿a qué correo te la mando?' },
    ];
    const p = prompt(ella, { historial: yaOfrecida, mensajeDeElla: 'ana@gmail.com' });
    expect(p).toContain('ELLA SE ENTERA DE QUÉ ES APEGO DETOX');
    expect(p).not.toContain('TIENES ALGO QUE MANDARLE');
  });

  it('y no la vuelve a pedir si ya se la ofreció y ella no contestó', () => {
    // «Una sola vez» dejó de ser una frase del prompt y pasó a ser código: el
    // bloque desaparece en cuanto Paula ya nombró la cartilla.
    const yaOfrecida = [
      ...charla,
      { role: 'user' as const, content: 'llevo dos años así' },
      { role: 'assistant' as const, content: 'Tengo una cartilla que te va a servir, ¿a qué correo te la mando?' },
    ];
    const p = prompt(ella, { historial: yaOfrecida, mensajeDeElla: 'no sé si me sirva' });
    expect(p).not.toContain('TIENES ALGO QUE MANDARLE');
  });
});
