import { describe, it, expect } from 'vitest';

import { quitarLinkRepetido } from '@/lib/whatsapp/blindaje';
import { pideElLink, preguntaQueIncluye } from '@/lib/whatsapp/guion';
import { APEGO_DETOX } from '@/lib/whatsapp/programa';

/**
 * EL FALLO DE HESSELL — 2026-08-08, visto en producción.
 *
 * Ella preguntó «Y como me uno a la comunidad» y recibió:
 *
 *   «Los talleres en vivo con Javier Vieira son martes y jueves a las 7:00 PM,
 *    hora de Costa Rica, y son parte del programa. Para unirte hoy mismo, solo
 *    entras aquí:»
 *
 * y NADA debajo. Dos causas encadenadas: `pideElLink` no conocía «me uno», así
 * que el candado de `paula.ts` creyó que el link sobraba y lo borró; y
 * `quitarLinkRepetido` se llevó la línea del link dejando viva la frase que lo
 * anunciaba.
 *
 * Es la segunda vez que pasa lo mismo (Analia, 2026-08-06). Por eso se prueban
 * las DOS capas por separado: la de arriba siempre se va a quedar corta.
 */
describe('el link huérfano', () => {
  describe('capa 1 — ella está pidiendo el link aunque no diga «link»', () => {
    const pidiendo = [
      'Y como me uno a la comunidad', // ← el de Hessell, textual
      'como me uno',
      'cómo me uno a la comunidad',
      'donde me uno',
      'quiero unirme',
      'me quiero unir',
      'como me inscribo',
      'cómo ingreso',
      'como me meto',
      'como me suscribo',
      'cómo me registro',
      'como accedo',
      'qué hago para entrar',
      'por dónde entro',
      'quiero ser parte',
      'como empiezo',
      'cómo hago para unirme',
      'mándamelo',
      'se me perdió',
    ];

    for (const mensaje of pidiendo) {
      it(`«${mensaje}» pide el link`, () => {
        expect(pideElLink(mensaje)).toBe(true);
      });
    }

    // Si esto se dispara de más, el link vuelve a salir en cada mensaje — que es
    // justo el problema que el candado vino a resolver.
    const noPidiendo = [
      'Soy de Costa Rica',
      'Gracias',
      'hola',
      'ya pagué',
      'llevo nueve años con él',
      'no quiero volver a empezar',
      'me da miedo que se entere',
    ];

    for (const mensaje of noPidiendo) {
      it(`«${mensaje}» NO pide el link`, () => {
        expect(pideElLink(mensaje)).toBe(false);
      });
    }
  });

  /**
   * Javier, 2026-08-08: *"debes de saber cómo unirse (…) porque ellas no saben
   * nada"* y *"en viñetas cortas los beneficios de lo que se logrará, no como un
   * chorrero de letras"*. Preguntar cómo se une abre las viñetas: es la única
   * pregunta en la que están permitidas, y es lo que evita el párrafo corrido
   * que recibió Hessell.
   */
  describe('«cómo me uno» abre las viñetas cortas', () => {
    for (const mensaje of [
      'Y como me uno a la comunidad',
      'cómo me uno',
      'quiero unirme',
      'qué es la comunidad',
      'cómo funciona la comunidad',
      'dónde me inscribo',
    ]) {
      it(`«${mensaje}» permite viñetas`, () => {
        expect(preguntaQueIncluye(mensaje)).toBe(true);
      });
    }

    it('«Soy de Costa Rica» no las abre', () => {
      expect(preguntaQueIncluye('Soy de Costa Rica')).toBe(false);
    });
  });

  describe('capa 2 — si el link se va, el anuncio se va con él', () => {
    it('el mensaje textual de Hessell no deja los dos puntos colgando', () => {
      const original = [
        'Los talleres en vivo con Javier Vieira son martes y jueves a las 7:00 PM, hora de Costa Rica, y son parte del programa. Para unirte hoy mismo, solo entras aquí:',
        APEGO_DETOX.checkout,
      ].join('\n');

      const limpio = quitarLinkRepetido(original);

      expect(limpio).not.toContain('entras aquí');
      expect(limpio.trim()).not.toMatch(/:$/);
      // Lo que sí le servía se queda: ella había preguntado por la comunidad.
      expect(limpio).toContain('martes y jueves');
    });

    /**
     * LA INVARIANTE DE VERDAD, y la que se violó las dos veces en producción:
     * **si queda un anuncio de link, tiene que quedar el link.**
     *
     * No es lo mismo que "borra el anuncio". En el caso de Analia el mensaje
     * entero ERA el anuncio más el link: al quitar los dos no queda nada, y ahí
     * la función devuelve el original a propósito. Ella recibe el link repetido
     * —malo— en vez de un globo vacío —peor—, y la invariante se cumple igual.
     */
    const anuncioSinLink = (t: string) =>
      /(aqu[íi] tienes el link|entras aqu[íi]|te dejo el link|:\s*$)/i.test(t.trim()) &&
      !/https?:\/\//.test(t);

    const mensajes = [
      `Aquí tienes el link para que puedas entrar hoy mismo:\n${APEGO_DETOX.landing}`,
      `Los talleres son martes y jueves. Para unirte hoy mismo, solo entras aquí:\n${APEGO_DETOX.checkout}`,
      `Te dejo el link:\n${APEGO_DETOX.checkout}`,
      `Me alegra leerte, Ana. Entras aquí:\n${APEGO_DETOX.landing}`,
    ];

    for (const [i, original] of mensajes.entries()) {
      it(`nunca deja un anuncio apuntando a nada (caso ${i + 1})`, () => {
        expect(anuncioSinLink(quitarLinkRepetido(original))).toBe(false);
      });
    }

    it('no borra un anuncio cuando NO se quitó ningún link', () => {
      const sinLink = 'Te cuento lo que hay adentro: son diecisiete módulos y la comunidad.';
      expect(quitarLinkRepetido(sinLink)).toBe(sinLink);
    });

    it('nunca devuelve vacío: un link repetido es malo, el silencio es peor', () => {
      const soloElLink = `Aquí lo tienes:\n${APEGO_DETOX.checkout}`;
      expect(quitarLinkRepetido(soloElLink).trim().length).toBeGreaterThan(0);
    });

    it('sigue quitando el link, que es para lo que existe', () => {
      const original = `Me alegra leerte. Cuéntame qué pasó.\n${APEGO_DETOX.checkout}`;
      expect(quitarLinkRepetido(original)).not.toContain('skool.com');
      expect(quitarLinkRepetido(original)).toContain('Cuéntame qué pasó');
    });
  });
});
