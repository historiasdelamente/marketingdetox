import { describe, expect, it } from 'vitest';

import { cargarConocimiento, conocimientoPara } from '@/lib/whatsapp/conocimiento';
import { acabaDeSubir, escalonDe } from '@/lib/whatsapp/escalera';
import { APEGO_DETOX, CLASE_JUEVES } from '@/lib/whatsapp/programa';

describe('la escalera — primero la clase, y solo sube si ELLA lo pide', () => {
  const escalon = (mensaje: string, extra = {}) => escalonDe({ mensaje, ...extra });

  it('todo el mundo entra por la clase del jueves', () => {
    for (const mensaje of [
      'hola',
      'buenas noches',
      'no puedo más con esto',
      'cuánto vale?',
      'a qué hora es?',
      'llevo tres meses sin dormir',
    ]) {
      expect(escalon(mensaje)).toBe('clase');
    }
  });

  it('sube cuando pregunta por el programa, los talleres o la terapia', () => {
    for (const mensaje of [
      'qué es apego detox?',
      'me hablaron de Apego Detox',
      'tienen algún programa?',
      'quiero el programa completo',
      'hacen talleres?',
      'hacen terapia?',
      'tienen una comunidad?',
      'quiero algo más largo, no una clase suelta',
      'qué más tienen?',
    ]) {
      expect(escalon(mensaje)).toBe('apego');
    }
  });

  it('una vez arriba no se baja: no le vuelve a ofrecer la clase', () => {
    expect(escalon('gracias, lo voy a pensar', { guardado: 'apego' })).toBe('apego');
    expect(escalon('y cuánto cuesta?', { guardado: 'apego' })).toBe('apego');
  });

  it('si ya pagó, la clase no se le vuelve a vender', () => {
    expect(escalon('hola de nuevo', { etapa: 'compradora' })).toBe('apego');
  });

  it('sabe cuándo acaba de subir, para no repetir el pitch', () => {
    expect(acabaDeSubir('clase', 'apego')).toBe(true);
    expect(acabaDeSubir(null, 'apego')).toBe(true);
    expect(acabaDeSubir('apego', 'apego')).toBe(false);
    expect(acabaDeSubir('clase', 'clase')).toBe(false);
  });
});

describe('el conocimiento sale del documento, no del código', () => {
  it('carga el documento que escribió Javier', () => {
    const texto = cargarConocimiento();
    expect(texto).toContain('QUÉ ES APEGO DETOX');
    expect(texto).toContain('LO QUE PAULA NO PUEDE DECIR NUNCA');
    expect(texto).toContain('CUÁNDO PASA A JAVIER');
  });

  it('las notas internas no llegan al modelo', () => {
    expect(cargarConocimiento()).not.toContain('CONTROL INTERNO');
    expect(cargarConocimiento()).not.toContain('<!--');
  });

  it('en la clase no le mete encima el material de venta de Apego Detox', () => {
    const texto = conocimientoPara('clase');
    // Lleva la clase, con la PÁGINA como único link (nunca el checkout suelto).
    expect(texto).toContain('LA CLASE DEL JUEVES');
    expect(texto).toContain(CLASE_JUEVES.landing);
    expect(texto).not.toContain(CLASE_JUEVES.checkout);
    // …y sabe que Apego Detox existe, para reconocerlo si ella pregunta.
    expect(texto).toContain('QUÉ ES APEGO DETOX');
    // Pero no lleva su precio, ni su plataforma, ni sus objeciones.
    expect(texto).not.toContain(APEGO_DETOX.checkout);
    expect(texto).not.toContain('PRECIO, PAGO Y GARANTÍA');
    // Las respuestas a objeciones de Apego hablan de "$20 al mes": puestas en el
    // escalón de la clase, el blindaje marcaría cada mensaje como error.
    expect(texto).not.toContain('OBJECIONES DE APEGO DETOX');
    expect(texto).not.toContain('$20 al mes');
    // El método de objeciones sí sirve para los dos productos.
    expect(texto).toContain('OBJECIONES — EL MÉTODO');
  });

  it('el escalón de la clase pesa bastante menos que el del programa', () => {
    // Importa con mini: cuanto más texto irrelevante tenga delante, más se
    // agarra de plantillas y menos lee lo que ella escribió.
    expect(conocimientoPara('clase').length).toBeLessThan(conocimientoPara('apego').length * 0.6);
  });

  it('en Apego Detox lleva todo: precio, links, objeciones y prohibiciones', () => {
    const texto = conocimientoPara('apego');
    expect(texto).toContain('PRECIO, PAGO Y GARANTÍA');
    expect(texto).toContain(APEGO_DETOX.checkout);
    expect(texto).toContain('OBJECIONES');
    expect(texto).toContain('QUÉ INCLUYE');
  });

  it('las prohibiciones y el paso a Javier van en los dos escalones', () => {
    for (const escalon of ['clase', 'apego'] as const) {
      const texto = conocimientoPara(escalon);
      expect(texto).toContain('LO QUE PAULA NO PUEDE DECIR NUNCA');
      expect(texto).toContain('CUÁNDO PASA A JAVIER');
      expect(texto).toContain('OBJECIONES');
    }
  });
});
