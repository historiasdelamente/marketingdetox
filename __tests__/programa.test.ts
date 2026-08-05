import { describe, expect, it } from 'vitest';

import { APEGO_DETOX, bloqueContexto, precioApego, proximoEncuentro } from '../lib/whatsapp/programa';
import { precioLocal, redondearBonito } from '../lib/whatsapp/moneda';

/** Un instante en hora Colombia, escrito como lo diría una persona. */
const colombia = (iso: string) => new Date(`${iso}-05:00`);

/** Tasas fijas: los tests no dependen de la red ni de la cotización del día. */
const TASAS = { USD: 1, COP: 4000, MXN: 18, EUR: 0.92, CLP: 950 };

describe('los talleres en vivo son martes y jueves', () => {
  it('el sábado apunta al martes', () => {
    expect(proximoEncuentro(colombia('2026-08-01T12:00:00')).fecha).toBe('martes 4 de agosto');
  });

  it('el martes tarde ya apunta al jueves', () => {
    expect(proximoEncuentro(colombia('2026-08-04T23:00:00')).fecha).toBe('jueves 6 de agosto');
  });

  it('nunca cae en un día que no sea martes o jueves', () => {
    for (let d = 1; d <= 28; d++) {
      const dia = String(d).padStart(2, '0');
      const { fecha } = proximoEncuentro(colombia(`2026-08-${dia}T15:00:00`));
      expect(fecha.startsWith('martes') || fecha.startsWith('jueves')).toBe(true);
    }
  });

  it('son 4 horas por semana, que es como lo dice la página', () => {
    expect(APEGO_DETOX.encuentros.horasSemana).toBe(4);
    expect(APEGO_DETOX.encuentros.dias.length * APEGO_DETOX.encuentros.duracionHoras).toBe(4);
  });
});

describe('lo que vende es una puerta abierta, no un evento', () => {
  const bloque = bloqueContexto(colombia('2026-08-05T10:00:00'), null, false, TASAS);

  it('le ordena decir que se entra HOY', () => {
    // Es el argumento que sustituye a toda la urgencia de la clase: ella escribe
    // de noche, encerrada y con poco tiempo. "Entras hoy" le resuelve el
    // problema que tiene AHORA.
    expect(bloque).toMatch(/entra\s+HOY/i);
    expect(bloque).toMatch(/no hay que esperar|no hay hora a la que conectarse/i);
  });

  it('le prohíbe citarla a una fecha', () => {
    expect(bloque).toMatch(/Nunca la cites a un día/i);
  });

  it('pone la comunidad por delante de los módulos', () => {
    // El orden de `pilares` no es decorativo: el primero es el que Paula nombra
    // por defecto, y la sala llena a las 3 AM vende más que 17 videos.
    expect(APEGO_DETOX.pilares[0]).toMatch(/comunidad/i);
    expect(bloque).toMatch(/El que más vende NO son los módulos/i);
  });

  it('no nombra la clase del jueves ni Hotmart por ninguna parte', () => {
    expect(bloque).not.toMatch(/clase del jueves/i);
    expect(bloque).not.toMatch(/hotmart/i);
    expect(bloque).not.toMatch(/nequi/i);
  });

  it('manda al link de Skool, que es donde se ve Y se entra', () => {
    expect(bloque).toContain(APEGO_DETOX.checkout);
  });
});

describe('el precio se calcula, no se escribe', () => {
  it('en lanzamiento son 20 con 40 tachado', () => {
    const p = precioApego(colombia('2026-08-01T09:00:00'));
    expect(p.enLanzamiento).toBe(true);
    expect(p.monto).toBe(20);
    expect(p.antes).toBe(40);
    expect(p.frase).toBe('$20 USD al mes');
    expect(p.diasRestantes).toBe(14);
  });

  it('el 15 de agosto todavía alcanza el precio de lanzamiento', () => {
    const p = precioApego(colombia('2026-08-15T22:00:00'));
    expect(p.enLanzamiento).toBe(true);
    expect(p.monto).toBe(20);
    expect(p.diasRestantes).toBe(0);
  });

  it('el 16 ya son 40 y desaparece el tachado', () => {
    const p = precioApego(colombia('2026-08-16T00:30:00'));
    expect(p.enLanzamiento).toBe(false);
    expect(p.monto).toBe(40);
    expect(p.antes).toBe(null);
    expect(p.frase).toBe('$40 USD al mes');
  });

  it('el precio nunca es un número que no sea 20 o 40', () => {
    const { precioPromo, precioNormal } = APEGO_DETOX.lanzamiento;
    expect([precioPromo, precioNormal]).toEqual([20, 40]);
  });

  it('la urgencia dice cuánto le cuesta esperar, no que pierda el producto', () => {
    // La de la clase era "no queda grabada": si se la perdía, perdía la plata.
    // Esta empuja sin castigar — perdérsela le sube el precio, no se lo quita.
    const b = bloqueContexto(colombia('2026-08-05T10:00:00'), null, false, TASAS);
    expect(b).toMatch(/\$20 de diferencia CADA MES/i);
  });
});

describe('el horario de los talleres, en la semana de ELLA', () => {
  // ⚠️ BUG REAL cazado el 2026-08-05 hablando con el bot como una mujer de
  // México: Paula le dijo "8:00 PM hora México", que son las 8 PM de COLOMBIA
  // con otra etiqueta. Habría llegado una hora tarde a cada taller. El prompt le
  // daba la hora de Colombia y a la vez le ordenaba "una sola hora: la de ella",
  // y el modelo resolvió la contradicción cambiándole el nombre al número.
  const ahora = colombia('2026-08-05T10:00:00');

  it('a México le da SU hora, no la de Colombia', () => {
    const b = bloqueContexto(ahora, '+525512345678', false, TASAS);
    expect(b).toContain('martes y jueves, 7:00 PM');
    // Y no le deja la hora de Colombia delante para que la copie.
    expect(b).not.toContain('8:00 PM hora Colombia');
  });

  it('a España le corre el DÍA, no solo la hora', () => {
    // Las 8 PM del martes en Colombia son las 3 de la madrugada del MIÉRCOLES en
    // Madrid. Decirle "los martes a las 3 AM" la cita el día equivocado.
    const b = bloqueContexto(ahora, '+34600112233', false, TASAS);
    expect(b).toContain('miércoles y viernes, 3:00 AM');
    expect(b).toMatch(/en Colombia son martes y jueves/i);
    expect(b).toMatch(/se conecta el día equivocado/i);
  });

  it('a Chile, que no cambia de día, no le mete la advertencia', () => {
    // En agosto Chile va una hora por delante de Colombia: las 8 PM de allá son
    // las 9 PM suyas. Mismo día, así que la advertencia sobra.
    const b = bloqueContexto(ahora, '+56912345678', false, TASAS);
    expect(b).toContain('martes y jueves, 9:00 PM');
    expect(b).not.toMatch(/se conecta el día equivocado/i);
  });

  it('sin país, dice "hora Colombia" explícito y prohíbe reetiquetarla', () => {
    const b = bloqueContexto(ahora, null, false, TASAS);
    expect(b).toContain('hora Colombia');
    expect(b).toMatch(/NUNCA le pongas la etiqueta de su país a la hora de Colombia/i);
  });

  it('el horario SÍ se da, la fecha del próximo NO', () => {
    // Preguntar cuándo son es una pregunta de compra: está midiendo si le cabe
    // en la vida. Lo que se reserva es el día del mes del próximo taller.
    const b = bloqueContexto(ahora, '+525512345678', false, TASAS);
    expect(b).toMatch(/pregunta de COMPRA/i);
    // El próximo taller cae el jueves 6; la única fecha que puede aparecer es la
    // de HOY, en la línea del reloj.
    expect(b).not.toContain('jueves 6 de agosto');
  });

  it('a la que ya entró sí le da la fecha, y también en su hora', () => {
    const b = bloqueContexto(ahora, '+525512345678', true, TASAS);
    expect(b).toContain('jueves 6 de agosto');
    expect(b).toContain('martes y jueves, 7:00 PM');
  });
});

describe('el precio en la moneda de ELLA', () => {
  const ahora = colombia('2026-08-05T10:00:00');

  it('a una colombiana le da las dos cifras, con el dólar delante', () => {
    const b = bloqueContexto(ahora, '+573001112233', false, TASAS);
    expect(b).toContain('$20 USD');
    expect(b).toContain('unos 80.000 COP');
  });

  it('siempre "unos" — nunca una cifra exacta', () => {
    const b = bloqueContexto(ahora, '+573001112233', false, TASAS);
    expect(b).toMatch(/SIEMPRE "unos"/);
  });

  it('en un país que ya usa dólares no repite la cifra dos veces', () => {
    // Ecuador (+593). "Son $20 USD, unos 20 dólares" suena a bot.
    const b = bloqueContexto(ahora, '+593991112233', false, TASAS);
    expect(b).toMatch(/se cuenta en dólares/i);
    expect(b).toMatch(/No la conviertas/i);
  });

  it('sin país le pide el país y no le adjudica ninguna moneda', () => {
    // La tabla de todas las monedas SÍ va (es lo que evita que se invente una),
    // pero mientras no sepa de dónde es, no le adjudica ninguna.
    const b = bloqueContexto(ahora, null, false, TASAS);
    expect(b).toMatch(/Todavía no sabes de qué país es/i);
    expect(b).not.toMatch(/LA SUYA \(/);
  });

  it('sin tasas a mano tampoco inventa nada', () => {
    // Si la API de cambio no responde, Paula sigue vendiendo en dólares. Una
    // divisa nunca puede tumbar una respuesta.
    const b = bloqueContexto(ahora, '+573001112233', false, undefined);
    expect(b).toMatch(/no hay tasa verificada/i);
    expect(b).toMatch(/no conviertas nada/i);
  });

  it('lleva TODAS las monedas calculadas, no solo la de su teléfono', () => {
    // ⚠️ BUG REAL (2026-08-05): a una mujer con línea colombiana que preguntó el
    // precio en pesos argentinos, Paula le dijo "unos 5.600" cuando eran unos
    // 30.000. El bloque solo traía la moneda de su indicativo, y lo que no tenía
    // delante se lo inventó.
    const completas = { USD: 1, COP: 4000, MXN: 18, ARS: 1000, CLP: 950, PEN: 3.7, EUR: 0.92, BRL: 5.5 };
    const b = bloqueContexto(ahora, '+573001112233', false, completas);
    expect(b).toContain('80.000 COP');
    expect(b).toContain('20.000 ARS');
    expect(b).toContain('360 MXN');
    // Y le prohíbe salirse de esa lista.
    expect(b).toMatch(/únicas cifras que puedes decir/i);
    expect(b).toMatch(/NUNCA calcules tú una conversión/i);
  });

  it('lo que ELLA dice de su país manda sobre el indicativo de su número', () => {
    // La colombiana que vive en Madrid tiene línea +57 y paga en euros.
    const b = bloqueContexto(ahora, '+573001112233', false, TASAS, 'ES');
    expect(b).toContain('España');
    expect(b).not.toContain('unos 80.000 COP');
  });
});

describe('el conversor de monedas', () => {
  it('redondea a algo que una persona diría en voz alta', () => {
    // "unos 79.412 pesos" se lee como cifra exacta y en cuanto el banco cobre
    // otra cosa, ella siente que le mintieron.
    expect(redondearBonito(79412)).toBe(80000);
    expect(redondearBonito(1234)).toBe(1000);
    expect(redondearBonito(367)).toBe(370);
    expect(redondearBonito(37.4)).toBe(35);
    expect(redondearBonito(18.4)).toBe(18);
  });

  it('no devuelve nada raro con entradas rotas', () => {
    expect(redondearBonito(0)).toBe(0);
    expect(redondearBonito(-5)).toBe(0);
    expect(redondearBonito(NaN)).toBe(0);
  });

  it('convierte con la tasa que le pasan', () => {
    expect(precioLocal(20, 'COP', TASAS).frase).toBe('unos 80.000 COP');
    expect(precioLocal(20, 'MXN', TASAS).frase).toBe('unos 360 MXN');
  });

  it('en dólar no convierte', () => {
    const r = precioLocal(20, 'USD', TASAS);
    expect(r.esDolar).toBe(true);
    expect(r.frase).toBe('');
  });

  it('con una moneda desconocida calla en vez de inventar', () => {
    expect(precioLocal(20, 'XYZ', TASAS).frase).toBe('');
  });

  it('SIN TASA VERIFICADA no convierte: solo dólares', () => {
    // ⚠️ La tabla de respaldo existe para que el sistema no se caiga, NO para
    // decirle cifras a una mujer. El 2026-08-05 la de COP decía 4.000 con el
    // dólar real a 3.234: habría dicho "unos 80.000" cuando eran unos 65.000.
    // Javier pidió que la conversión se verifique SIEMPRE; esto es lo que lo
    // hace cierto cuando la API no responde.
    const respaldo = { valores: { USD: 1, COP: 4000 }, vivas: false };
    expect(precioLocal(20, 'COP', respaldo).frase).toBe('');

    // Con la misma tabla marcada como viva, sí convierte.
    expect(precioLocal(20, 'COP', { valores: { USD: 1, COP: 4000 }, vivas: true }).frase)
      .toBe('unos 80.000 COP');
  });

  it('el bloque del reloj tampoco da cifra local sin tasa verificada', () => {
    const b = bloqueContexto(colombia('2026-08-05T10:00:00'), '+573001112233', false, {
      valores: { USD: 1, COP: 4000 },
      vivas: false,
    });
    expect(b).not.toContain('80.000');
    expect(b).toMatch(/no hay tasa verificada/i);
  });
});

describe('los datos duros coinciden con la página de Skool', () => {
  it('17 módulos, verificado el 2026-08-05', () => {
    expect(APEGO_DETOX.modulos).toBe(17);
  });

  it('se paga en Skool y solo en Skool', () => {
    expect(APEGO_DETOX.checkout).toContain('skool.com');
    expect(APEGO_DETOX.checkout).not.toContain('hotmart');
  });
});
