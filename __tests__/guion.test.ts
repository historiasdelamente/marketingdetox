import { describe, expect, it } from 'vitest';

import { analizarConversacion, bloqueGuion, pideElLink, type Turno } from '@/lib/whatsapp/guion';
import { motivoHandoff, quitarPreguntaDeFreno } from '@/lib/whatsapp/blindaje';

const ella = (content: string): Turno => ({ role: 'user', content });
const paula = (content: string): Turno => ({ role: 'assistant', content });

const SKOOL = 'https://www.skool.com/historias-de-la-mente-4978/about';

/**
 * Lo que ELLA tiene que haber dicho para que Paula pueda empezar a vender.
 * Desde el 2026-08-06 hay 2-3 mensajes de escucha antes del link, asi que casi
 * todos los tests de venta necesitan que ella haya contado algo primero.
 */
const YA_CONTO = ella('Sigo con el y llevo nueve anios asi, ya no se ni que me gusta a mi sin preguntarle');

describe('el guion de venta — para que Paula deje de repetirse', () => {
  it('en el primer turno no hay guion: manda el bloque de entrada', () => {
    expect(bloqueGuion([])).toBe('');
    expect(bloqueGuion([ella('hola')])).toBe('');
  });

  it('lee de sus propios mensajes qué le ha contado ya', () => {
    const e = analizarConversacion([
      ella('hola'),
      paula('Hola, soy Paula.'),
      ella('llevo 9 años'),
      paula(`Adentro hay talleres en vivo y una comunidad a cualquier hora.\n\n${SKOOL}`),
    ]);
    expect(e.turnos).toBe(2);
    expect(e.sabeQueEs).toBe(true);
    expect(e.tieneLink).toBe(true);
    expect(e.sabePrecio).toBe(false);
  });

  it('si todavía no sabe qué es, el paso es contárselo', () => {
    const g = bloqueGuion([ella('hola'), paula('Hola, soy Paula. ¿Cómo te llamas?'), YA_CONTO]);
    expect(g).toMatch(/CONTARLE QUÉ ES/);
    expect(g).toMatch(/Todavía no le has dado nada del programa/);
  });

  it('si ya sabe qué es pero no tiene link, el paso es el link', () => {
    const g = bloqueGuion([
      YA_CONTO,
      paula('Adentro tienes talleres en vivo cada semana y la comunidad.'),
    ]);
    expect(g).toMatch(/DARLE EL LINK/);
    expect(g).toMatch(/YA LE DISTE: qué hay adentro/);
  });

  it('con el link entregado y una objeción, el paso es esa objeción', () => {
    const g = bloqueGuion([
      YA_CONTO,
      paula(`Adentro hay talleres y comunidad.\n\n${SKOOL}`),
      ella('me interesa pero no tengo plata ahorita'),
    ]);
    expect(g).toMatch(/TRABAJAR SU OBJECIÓN: dinero/);
    expect(g).toMatch(/un ángulo que NO hayas usado/);
  });

  it('cuando ya lo sabe todo, se vende sin empujar — y sin la pregunta del freno', () => {
    const g = bloqueGuion([
      YA_CONTO,
      paula(`Son $20 al mes con garantía de 7 días. Adentro hay talleres y comunidad.\n\n${SKOOL}`),
      ella('ok'),
    ]);
    expect(g).toMatch(/YA LO TIENE TODO/);
    expect(g).toMatch(/Repetir la oferta la aleja/);
    // Javier, 2026-08-09: la pregunta del freno no existe en este chat. El paso
    // tiene que PROHIBIRLA, nunca sugerirla.
    expect(g).toMatch(/PROHIBIDO preguntarle qué la frena/);
    expect(g).not.toMatch(/pregunta corta que destape/);
  });

  it('le pone delante sus dos últimos mensajes con la prohibición de repetirlos', () => {
    const g = bloqueGuion([
      paula('Primera cosa que dijo.'),
      ella('ajá'),
      paula('Segunda cosa que dijo.'),
      ella('ya'),
      paula('Tercera cosa que dijo.'),
    ]);
    expect(g).toMatch(/ESTO YA SE LO DIJISTE/);
    expect(g).toContain('Segunda cosa que dijo.');
    expect(g).toContain('Tercera cosa que dijo.');
    // La primera ya no: solo las dos últimas, para no inflar el prompt.
    expect(g).not.toContain('Primera cosa que dijo.');
    expect(g).toMatch(/Ni con las mismas palabras ni con sinónimos/);
  });

  it('cuenta los turnos de PAULA, no los de ella', () => {
    const g = bloqueGuion([ella('a'), paula('b'), ella('c'), paula('d'), ella('e')]);
    expect(g).toMatch(/Llevas \*\*2 mensajes\*\*/);
  });

  it('sabe cuándo ELLA está pidiendo el link', () => {
    // De esto depende el candado por código: si ya lo tiene y no lo pide, el
    // link se le quita a la respuesta.
    for (const pide of [
      'mándame el link',
      'y dónde me inscribo?',
      'cómo pago?',
      'se me perdió el enlace',
      'sí quiero entrar',
      'cuánto vale?',
    ]) {
      expect(pideElLink(pide), `«${pide}» sí lo pide`).toBe(true);
    }
    for (const noPide of [
      'sigo pensando en él todo el día',
      'llevo 9 años así',
      'no sé si voy a poder',
      'gracias',
    ]) {
      expect(pideElLink(noPide), `«${noPide}» no lo pide`).toBe(false);
    }
  });

  it('acumula las objeciones que ella fue poniendo, y trabaja la última', () => {
    const e = analizarConversacion([
      ella('está muy caro'),
      paula('...'),
      ella('además no tengo tiempo'),
    ]);
    expect(e.objeciones).toEqual(['dinero', 'tiempo']);
  });
});

// ===========================================================================
// LA CONVERSACIÓN DE NEDITH — 2026-08-06, Perú
//
// Todo lo que sigue son frases TEXTUALES de producción. Nedith quería entrar,
// dijo cuatro veces que no tenía cómo pagar y una vez que el lunes estaría en
// su ciudad. Paula le preguntó cuatro veces qué la frenaba y le repitió un
// mensaje palabra por palabra. Se perdió.
// ===========================================================================

describe('la conversación de Nedith: leerla de verdad', () => {
  // LAS CUATRO VECES QUE LO DIJO. Ninguna hizo saltar el handoff, y ese handoff
  // —pasarla con Javier— es exactamente la salida que existe para su caso.
  const LAS_CUATRO = [
    'Es que estoy en distrito y no puedo realizar pagos',
    'Si quisiera pero no hay un lugar para poder realizar el pago',
    'Esto es un pueblito',
    'Lo que pasa que tengo que recargar mi tarjeta solo tengo enefect8vo',
  ];

  it('escala a Javier las cuatro veces, aunque nunca diga "no tengo tarjeta"', () => {
    for (const frase of LAS_CUATRO) {
      expect(motivoHandoff(frase), frase).toBe('sin_tarjeta');
    }
  });

  it('no escala a quien simplemente no tiene el dinero: eso es objeción, no logística', () => {
    // La diferencia importa: si escaláramos toda duda de plata, Javier
    // recibiría a todas las que dudan y el handoff dejaría de servir.
    for (const frase of ['está muy caro para mí', 'no tengo plata ahora', 'llevo año y medio sin trabajo']) {
      expect(motivoHandoff(frase), frase).not.toBe('sin_tarjeta');
    }
  });

  it('el guion también lee su bloqueo de pago cuando lo nombra', () => {
    for (const frase of LAS_CUATRO.filter((f) => f !== 'Esto es un pueblito')) {
      const e = analizarConversacion([paula('Te espero adentro. ' + SKOOL), ella(frase)]);
      expect(e.objeciones, frase).toContain('no tiene cómo pagar');
    }
  });

  it('registra la fecha que ella dio en vez de seguir vendiendo', () => {
    const e = analizarConversacion([
      paula('Los talleres son martes y jueves. ' + SKOOL),
      ella('El dia lunes estaré en mi ciudad'),
    ]);
    expect(e.citaFutura).toContain('lunes');

    const guion = bloqueGuion([
      YA_CONTO,
      paula('Los talleres son martes y jueves. ' + SKOOL),
      ella('El dia lunes estaré en mi ciudad'),
    ]);
    // Se le confirma la fecha y se deja de empujar.
    expect(guion).toContain('DEJA DE VENDER');
    expect(guion).toContain('lunes');
  });

  it('cuenta las veces que ya le preguntó qué la frena', () => {
    const e = analizarConversacion([
      paula('¿Hay algo que te esté haciendo dudar?'),
      ella('No para nada'),
      paula('¿Qué te está frenando para entrar hoy?'),
      ella('Es que estoy en distrito'),
      paula('¿Es solo eso lo que te detiene para entrar?'),
      ella('El dia lunes estaré en mi ciudad'),
    ]);
    expect(e.vecesQuePregunto).toBe(3);
  });

  it('a la tercera pregunta le prohíbe volver a preguntar', () => {
    const historial: Turno[] = [
      YA_CONTO,
      paula('Apego Detox tiene talleres en vivo. ' + SKOOL),
      ella('ya vi'),
      paula('¿Qué te está frenando?'),
      ella('nada en especial'),
      paula('¿Es solo eso lo que te detiene?'),
      ella('pues no sé'),
    ];
    const guion = bloqueGuion(historial);
    expect(guion).toContain('DEJA DE PREGUNTARLE');
    expect(guion).toContain('NO puede terminar');
  });

  it('con handoff activo el guion se calla, para no dar dos órdenes', () => {
    const historial: Turno[] = [
      paula('Apego Detox tiene talleres en vivo. ' + SKOOL),
      ella('solo tengo efectivo'),
    ];
    expect(bloqueGuion(historial)).not.toBe('');
    expect(bloqueGuion(historial, true)).toBe('');
  });
});

describe('la conversación de Marcela: lo que ella puso sobre la mesa', () => {
  it('lee las objeciones que antes pasaban de largo', () => {
    const casos: Array<[string, string]> = [
      ['yo llevo año y medio sin trabajo, inestabilidad economica', 'dinero'],
      ['No quiero tener otra pareja, y a mi edad no quiero volver a conseguir otra persona', 'no quiere rehacer su vida'],
      ['pienso que le digo a mi hijo', 'los hijos'],
      ['El miedo a perderlo', 'miedo a perderlo'],
      ['Porque me siento muy desesperada', 'desesperación'],
    ];
    for (const [frase, clave] of casos) {
      const e = analizarConversacion([paula('Te espero adentro. ' + SKOOL), ella(frase)]);
      expect(e.objeciones, frase).toContain(clave);
    }
  });
});

describe('el candado: la pregunta que ya le hizo no sale', () => {
  // LAS DOS FRASES SON REALES, del A/B del 2026-08-06 con la rama de la fecha
  // ACTIVA — o sea con la prohibición delante, en negrita, y aun así salieron.
  it('borra la pregunta y deja lo que sí sirve', () => {
    const deHaiku = [
      'Dale, Nedith.',
      '',
      '¿Y eso qué cambia para ti — es que recién ahí vas a tener tiempo, o hay algo más que te frena?',
    ].join('\n');
    const limpio = quitarPreguntaDeFreno(deHaiku);
    expect(limpio).toContain('Dale, Nedith.');
    expect(limpio).not.toMatch(/algo más que te frena/);

    expect(quitarPreguntaDeFreno('Entiendo. ¿Es solo eso lo que te detiene?')).toBe('Entiendo.');
    expect(quitarPreguntaDeFreno('Claro. ¿Qué te está frenando para entrar hoy?')).toBe('Claro.');
  });

  it('no toca las preguntas que sí puede hacer', () => {
    const buenas = [
      '¿Ya lo dejaste o todavía estás con él?',
      '¿Desde qué país me escribes?',
      '¿Cómo te llamas?',
    ];
    for (const q of buenas) expect(quitarPreguntaDeFreno(q), q).toBe(q);
  });

  it('si al quitarla no queda nada, devuelve el original', () => {
    // Un mensaje repetido es malo; uno vacío es peor.
    const solo = '¿Qué te está frenando?';
    expect(quitarPreguntaDeFreno(solo)).toBe(solo);
    expect(quitarPreguntaDeFreno('')).toBe('');
  });
});

describe('2-3 mensajes de escucha antes del link', () => {
  // Javier lo eligio el 2026-08-06. Antes Paula soltaba el programa entero en
  // el segundo mensaje, en cuanto ella decia su nombre.
  it('si ella solo ha contestado, el paso es ESCUCHAR y no vender', () => {
    const g = bloqueGuion([
      ella('Ok aqui estoy'),
      paula('Hola, soy Paula. ¿Como te llamas?'),
      ella('Chile, Yeny lamdrid'),
    ]);
    expect(g).toMatch(/ESCUCHAR/);
    expect(g).toMatch(/NO va: el link/);
    expect(g).toMatch(/Un solo globo/);
  });

  it('en cuanto ella cuenta algo suyo, ya se puede vender', () => {
    const antes = analizarConversacion([ella('Chile, Yeny lamdrid')]);
    expect(antes.ellaYaConto).toBe(false);

    // Una frase entera sobre lo suyo.
    const largo = analizarConversacion([
      ella('En febrero lo eche de mi casa pero cuando recuerdo todavia me hace sentir mal'),
    ]);
    expect(largo.ellaYaConto).toBe(true);

    // O contestar la pregunta de entrada, aunque sea corto.
    for (const corta of ['No he salido', 'ya lo dejé', 'sigo con él']) {
      expect(analizarConversacion([ella(corta)]).ellaYaConto, corta).toBe(true);
    }
  });

  it('pasados 3 turnos deja de esperar, para no quedarse en bucle de preguntas', () => {
    const historial: Turno[] = [];
    for (let i = 0; i < 4; i++) {
      historial.push(ella('ok'), paula('¿Y como estas hoy?'));
    }
    expect(bloqueGuion(historial)).not.toMatch(/ESCUCHAR/);
  });
});
