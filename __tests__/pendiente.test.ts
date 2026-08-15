import { describe, expect, it } from 'vitest';
import { bloquePendiente, hayPedidoSinContestar } from '@/lib/whatsapp/pendiente';
import { comprimirGlobos, desvinetar } from '@/lib/whatsapp/formato';
import type { Turno } from '@/lib/whatsapp/guion';

// ============================================================================
// 📮 PENDIENTE — el caso Alejandra (1273511096, 2026-08-14): Paula pidió el
// correo, ella contestó su apellido, y el sistema soltó el folleto como si el
// correo hubiera llegado. Estos tests fijan el concepto nuevo: «pregunté algo
// y lo que llegó no lo responde» es un hecho que el modelo tiene que ver.
// ============================================================================

const ella = (content: string): Turno => ({ role: 'user', content });
const paula = (content: string): Turno => ({ role: 'assistant', content });

const PIDE = paula('Tengo una cartilla que te va a servir, ¿a qué correo te la mando?');

describe('pendiente — el caso Alejandra', () => {
  it('apellido en vez de correo → pendiente detectado', () => {
    const p = hayPedidoSinContestar([ella('hola'), PIDE], 'Alejandra campos');
    expect(p).toEqual({ pedido: 'correo', vecesPedido: 1 });
  });

  it('el bloque 📮 le prohíbe al modelo confirmar un envío que no existe', () => {
    const b = bloquePendiente([ella('hola'), PIDE], 'Alejandra campos');
    expect(b).toContain('NO es un correo');
    expect(b).toContain('no des por hecho');
  });

  it('correo de verdad → nada pendiente', () => {
    expect(hayPedidoSinContestar([PIDE], 'alehangarita11@gmail.com')).toBeNull();
  });

  it('correo con texto alrededor → nada pendiente', () => {
    expect(hayPedidoSinContestar([PIDE], 'claro, es maria.79@hotmail.com gracias')).toBeNull();
  });

  it('Paula no pidió nada → nada pendiente', () => {
    const p = hayPedidoSinContestar([paula('¿Cómo te llamas?')], 'Jennifer');
    expect(p).toBeNull();
  });

  it('a la tercera vez se suelta: dos peticiones previas → null (insistir es acoso)', () => {
    const historial = [PIDE, ella('si'), paula('¿me dejas tu correo para mandártela?')];
    expect(hayPedidoSinContestar(historial, '🙏')).toBeNull();
  });
});

// ============================================================================
// FORMATO — los arreglos del 2026-08-14: la raya no es viñeta, los datos no se
// tiran, y la lista jamás se suelda con la prosa (el ladrillo de 433 chars).
// ============================================================================

describe('formato — la raya de la prosa no es una viñeta', () => {
  it('un inciso con raya sobrevive a desvinetar', () => {
    const prosa = 'Te fuiste y volviste a los quince días.\n— eso llega aquí todas las semanas.';
    expect(desvinetar(prosa)).toBe(prosa);
  });

  it('las viñetas de verdad se siguen matando', () => {
    const lista = 'Esto es para ti:\n• primer dolor\n• segundo dolor\n• tercer dolor';
    const out = desvinetar(lista);
    expect(out).not.toContain('•');
    expect(out).toContain('primer dolor');
    expect(out).not.toContain('segundo dolor');
  });
});

describe('formato — una viñeta con dato no se tira en silencio', () => {
  it('la línea con la hora del taller se promueve a frase', () => {
    const t = 'Adentro tienes:\n• acompañamiento cada semana\n• talleres en vivo martes y jueves a las 8 PM';
    const out = desvinetar(t);
    expect(out).toContain('8 PM');
  });

  it('la línea con link jamás desaparece', () => {
    const t = 'Mira:\n• lo que hay adentro\n• entra aquí https://historiasdelamente.com/apegodetox';
    expect(desvinetar(t)).toContain('https://historiasdelamente.com/apegodetox');
  });
});

describe('formato — la lista no se suelda con la prosa (el ladrillo de 433)', () => {
  it('comprimir con lista presente deja la lista en su propio globo', () => {
    const lista = '• 17 módulos de terapia en video\n• 4 horas en vivo cada semana';
    const globos = ['Apertura que la recoge.', lista, 'Cierre con lo que logra.', 'Otra frase.', 'https://x.com/y'];
    const out = comprimirGlobos(globos, 3);
    expect(out.length).toBeLessThanOrEqual(3);
    const conLista = out.find((g) => g.includes('17 módulos'));
    expect(conLista).toBeDefined();
    // La lista quedó SOLA en su globo: sin la apertura ni el cierre pegados.
    expect(conLista).not.toContain('Apertura');
    expect(conLista).not.toContain('Cierre');
  });
});
