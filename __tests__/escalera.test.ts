import { describe, expect, it } from 'vitest';

import { cargarConocimiento, conocimientoPara } from '@/lib/whatsapp/conocimiento';
import { escalonDe, instruccionEscalon } from '@/lib/whatsapp/escalera';
import { APEGO_DETOX } from '@/lib/whatsapp/programa';

describe('un solo producto: la escalera se retiró el 2026-08-05', () => {
  it('diga lo que diga ella, siempre se le ofrece Apego Detox', () => {
    // Estos mensajes son los que ANTES caían en el escalón de la clase, que era
    // el caso normal: el 100% de las mujeres que llegaban de TikTok. El programa
    // solo se les ofrecía si acertaban a decir "programa", "talleres" o "terapia".
    for (const mensaje of [
      'hola',
      'buenas noches',
      'no puedo más con esto',
      'cuánto vale?',
      'a qué hora es?',
      'llevo tres meses sin dormir',
      'qué es apego detox?',
      'tienen algún programa?',
      'quiero saber de la clase del jueves',
    ]) {
      expect(escalonDe()).toBe('apego');
      // El mensaje ya no decide nada: se lee aquí solo para dejar claro que
      // ninguno de ellos cambia el resultado.
      expect(mensaje.length).toBeGreaterThan(0);
    }
  });

  it('la instrucción prohíbe explícitamente la clase y Hotmart', () => {
    const bloque = instruccionEscalon();
    expect(bloque).toContain('APEGO DETOX');
    expect(bloque).toMatch(/clase del jueves/i);
    expect(bloque).toMatch(/Hotmart no se nombra/i);
    // Y le recuerda el argumento que sustituye a la urgencia de la clase.
    expect(bloque).toMatch(/entra hoy/i);
  });
});

describe('el conocimiento sale del documento, no del código', () => {
  it('carga el documento que escribió Javier', () => {
    const texto = cargarConocimiento();
    expect(texto).toContain('QUÉ ES APEGO DETOX');
    expect(texto).toContain('LO QUE PAULA NO DICE NUNCA');
    expect(texto).toContain('CUÁNDO PASA A JAVIER');
  });

  it('las notas internas no llegan al modelo', () => {
    expect(cargarConocimiento()).not.toContain('CONTROL INTERNO');
    expect(cargarConocimiento()).not.toContain('<!--');
  });

  it('lleva todo: precio, links, objeciones y prohibiciones', () => {
    const texto = conocimientoPara('apego');
    expect(texto).toContain('PRECIO Y PAGO');
    expect(texto).toContain(APEGO_DETOX.checkout);
    expect(texto).toContain('OBJECIONES');
    expect(texto).toContain('QUÉ INCLUYE');
    expect(texto).toContain('LO QUE PAULA NO DICE NUNCA');
    expect(texto).toContain('CUÁNDO PASA A JAVIER');
  });

  it('lleva la respuesta para cuando ella pregunte por la clase retirada', () => {
    // No es material de venta: es lo que contesta a la que la vio en un anuncio
    // viejo. Sin esto, Paula se queda muda o se la inventa.
    const texto = conocimientoPara('apego');
    expect(texto).toContain('SI PREGUNTA POR LA CLASE DEL JUEVES');
  });

  it('el bloque de la clase va AL FINAL, no arriba', () => {
    // Si fuera lo primero que lee, el modelo lo tomaría como lo primero que
    // tiene que decir y volvería a nombrar la clase por su cuenta — que es
    // justo lo que se acaba de quitar.
    const texto = conocimientoPara('apego');
    expect(texto.indexOf('SI PREGUNTA POR LA CLASE'))
      .toBeGreaterThan(texto.indexOf('PRECIO Y PAGO'));
  });
});
