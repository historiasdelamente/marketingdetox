import { describe, expect, it } from 'vitest';

import { APEGO_DETOX, CLASE_JUEVES, bloqueContexto, precioApego, proximaClase, proximoEncuentro } from '../lib/whatsapp/programa';

/** Un instante en hora Colombia, escrito como lo diría una persona. */
const colombia = (iso: string) => new Date(`${iso}-05:00`);

describe('la clase del jueves rueda sola', () => {
  it('el miércoles anuncia la de mañana', () => {
    const c = proximaClase(colombia('2026-08-05T10:00:00'));
    expect(c.fecha).toBe('jueves 6 de agosto');
    expect(c.frase).toBe('es MAÑANA');
    expect(c.enVivo).toBe(false);
  });

  it('el jueves en la mañana sigue siendo HOY — es el día que más vende', () => {
    const c = proximaClase(colombia('2026-08-06T10:00:00'));
    expect(c.fecha).toBe('jueves 6 de agosto');
    expect(c.frase).toBe('es HOY');
  });

  it('mientras se dicta, dice que está en vivo', () => {
    const c = proximaClase(colombia('2026-08-06T21:00:00'));
    expect(c.enVivo).toBe(true);
    expect(c.frase).toBe('está EN VIVO ahora mismo');
  });

  it('al terminar salta al jueves siguiente, no antes', () => {
    const c = proximaClase(colombia('2026-08-06T23:30:00'));
    expect(c.fecha).toBe('jueves 13 de agosto');
    expect(c.enVivo).toBe(false);
  });

  it('el viernes ya habla de la de la otra semana', () => {
    expect(proximaClase(colombia('2026-08-07T09:00:00')).fecha).toBe('jueves 13 de agosto');
  });

  it('nunca nombra un día que no sea jueves', () => {
    for (let d = 1; d <= 28; d++) {
      const dia = String(d).padStart(2, '0');
      const c = proximaClase(colombia(`2026-08-${dia}T15:00:00`));
      expect(c.fecha.startsWith('jueves')).toBe(true);
    }
  });
});

describe('los encuentros de Apego Detox son martes y jueves', () => {
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
});

describe('la hora de la clase en cada país viene resuelta', () => {
  // Si ella DICE de qué país es, el teléfono ya no manda: sin la tabla el
  // modelo se pone a calcular la diferencia horaria, y la calcula mal.
  const bloque = bloqueContexto(colombia('2026-08-02T10:00:00'), null, 'clase');

  it('trae la hora de los países que más escriben', () => {
    expect(bloque).toContain('Colombia 8:00 PM');
    expect(bloque).toContain('México 7:00 PM');
    expect(bloque).toContain('Argentina 10:00 PM');
    expect(bloque).toContain('Chile 9:00 PM');
  });

  it('en España avisa que es de MADRUGADA del día siguiente', () => {
    // 8 PM del jueves en Colombia son las 3 AM del viernes en Madrid. Sin el
    // día, ella la anota para el jueves y se la pierde.
    expect(bloque).toContain('España 3:00 AM (viernes)');
  });

  it('deja claro que lo que ella dice de su país manda sobre su número', () => {
    expect(bloque).toContain('Si ELLA te dice de qué país es, eso manda');
  });
});

describe('Colombia paga por Nequi antes que por tarjeta', () => {
  const ahora = colombia('2026-08-02T10:00:00');

  it('a una colombiana le ofrece Nequi primero', () => {
    const b = bloqueContexto(ahora, '+573001112233', 'clase');
    expect(b).toContain('ELLA ES DE COLOMBIA');
    expect(b).toContain('25.000 COP');
    expect(b).toContain('311 632 9202');
    expect(b).toContain('prefiere pagar con tarjeta');
  });

  it('los dos pasos de Nequi van juntos — el número solo no sirve', () => {
    // Darle el número sin decirle que mande el comprobante y su correo la deja
    // pagando al vacío: transfiere, nadie le entrega nada y cree que la estafaron.
    const b = bloqueContexto(ahora, '+573001112233', 'clase');
    expect(b).toContain('comprobante');
    expect(b).toContain('correo');
    expect(b).toContain(CLASE_JUEVES.whatsappJavier);
  });

  it('le da con qué verificar antes de transferir', () => {
    // Mandarle plata por Nequi a alguien que conoció por WhatsApp da miedo. No
    // se resuelve insistiendo, se resuelve dándole con qué comprobar.
    const b = bloqueContexto(ahora, '+573001112233', 'clase');
    expect(b).toContain('CONFIANZA PARA TRANSFERIR');
    expect(b).toContain('página oficial');
    expect(b).toContain('claves');
  });

  it('dice a nombre de quién está la cuenta ANTES de que ella abra Nequi', () => {
    // Confirmado por Javier el 2026-08-02: la cuenta es de Javier Vieira. Es el
    // nombre que ella va a leer en la pantalla de confirmación; si nadie se lo
    // anunció, cancela ahí mismo.
    const b = bloqueContexto(ahora, '+573001112233', 'clase');
    expect(b).toContain(`a nombre de **${CLASE_JUEVES.nequi.titular}**`);
    expect(b).toMatch(/antes de que abra la app/i);
  });

  it('a una de otro país NO le ofrece Nequi, pero deja la puerta si ella lo dice', () => {
    // Muchas viven fuera con la línea de allá, o al revés. Aun así, a la que no
    // es colombiana se le da UNA sola vía: ofrecerle las dos la deja escogiendo
    // en vez de pagando, y alarga el mensaje hasta que se corta el link.
    const b = bloqueContexto(ahora, '+521234567890', 'clase');
    expect(b).toContain('ELLA NO ES DE COLOMBIA');
    expect(b).toContain('no le nombres Nequi');
    expect(b).toContain('Solo si ELLA misma te dice que está en Colombia');
    expect(b).toContain('311 632 9202');
  });

  it('el número de Nequi va legible, no pegado', () => {
    // Ella lo tiene que teclear en la app.
    expect(bloqueContexto(ahora, '+573001112233', 'clase')).not.toContain('3116329202');
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
});

describe('la clase NO queda grabada — y se dice de frente', () => {
  const ahora = colombia('2026-08-02T10:00:00');

  it('el bloque le ordena decirlo, no callarlo', () => {
    // Antes `quedaGrabada` era null: Paula no podía afirmarlo ni negarlo, así
    // que ante "¿y si a esa hora no puedo?" se quedaba muda. Es la objeción
    // más común de toda clase en vivo y la única urgencia real que existe.
    const b = bloqueContexto(ahora, '+573001112233', 'clase');
    expect(b).toContain('NO queda grabada');
    expect(b).toMatch(/nunca le prometas/i);
  });

  it('el dato duro sigue en false: el blindaje bloquea la promesa', () => {
    expect(CLASE_JUEVES.quedaGrabada).toBe(false);
  });
});
