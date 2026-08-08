import { describe, it, expect } from 'vitest';

import { buildSystemPrompt, type WaUser } from '@/lib/whatsapp/paula';

const AHORA = new Date('2026-08-08T15:00:00Z');

/**
 * LA GARANTÍA NO SE NOMBRA EN WHATSAPP — Javier, 2026-08-08.
 *
 * ⚠️ ESTO SE PRUEBA SOBRE EL PROMPT ENTERO Y NO SOBRE UN BLOQUE, y es a
 * propósito. La garantía estaba en CINCO sitios distintos: el globo del precio,
 * la tabla de "qué contestar a qué", el bloque de datos duros, la instrucción de
 * corrección del reintento y —el peor— un EJEMPLO que se la ponía en la boca
 * palabra por palabra.
 *
 * El ejemplo es el que importa. La regla de oro del proyecto (ver
 * PAULA-ESTADO-2026-08-06) es que **lo que el modelo tiene delante lo copia,
 * aunque el texto diga que no lo copie**: quitar cuatro menciones y dejar el
 * ejemplo habría dejado la garantía viva en producción con la prohibición
 * escrita justo encima.
 *
 * Por eso se busca la FORMA AFIRMATIVA y no la palabra: "garantía" sigue en el
 * prompt, dentro de la prohibición que dice que no se nombre.
 */
const AFIRMA_GARANTIA = [
  /\d+\s*d[íi]as de garant[íi]a/i,
  /tienes\s+\d+\s*d[íi]as/i,
  /se te devuelve/i,
  /devoluci[óo]n total/i,
  /sin preguntas/i,
  /sin riesgo/i,
  // «pruébalo» a secas NO vale: el prompt ya trae un «ni "pruébalo sin costo"»
  // que es la prohibición vieja de decir que es gratis, y no tiene nada que ver
  // con la garantía. Marcarla sería un falso positivo.
  /pru[ée]balo sin riesgo/i,
];

/**
 * Se miran solo las líneas que le dicen a Paula QUÉ DECIR.
 *
 * Las prohibiciones citan las frases prohibidas —tienen que hacerlo, si no son
 * abstractas y el modelo no las reconoce— así que buscar «sin preguntas» en el
 * prompt entero marcaría como fallo el candado mismo. Se quitan las líneas de
 * prohibición y se busca en lo que queda, que es lo que ella podría copiar.
 */
const soloLoQueDebeDecir = (prompt: string) =>
  prompt
    .split('\n')
    .filter((l) => !/⛔|NO SE NOMBRA|no le nombres|\bNUNCA\b|no se contesta con la garant/i.test(l))
    .join('\n');

const mujeres: Array<{ caso: string; user: WaUser }> = [
  {
    caso: 'colombiana nueva',
    user: {
      id: 1, manychat_id: 'u-co', name: 'Ana', funnel_stage: 'nuevo',
      situacion_resumen: null, first_contact: '', last_interaction: '',
      conversation_count: 1, phone: '+573001234567', pais: 'CO',
    },
  },
  {
    caso: 'costarricense con conversación avanzada',
    user: {
      id: 2, manychat_id: 'u-cr', name: 'Hessell', funnel_stage: 'link_enviado',
      situacion_resumen: 'lleva nueve años', first_contact: '', last_interaction: '',
      conversation_count: 8, phone: '+50685021234', pais: 'CR',
    },
  },
  {
    caso: 'sin teléfono (Instagram)',
    user: {
      id: 3, manychat_id: 'u-ig', name: null, funnel_stage: 'nuevo',
      situacion_resumen: null, first_contact: '', last_interaction: '',
      conversation_count: 2, phone: null, pais: null,
    },
  },
];

describe('la garantía no se nombra', () => {
  for (const { caso, user } of mujeres) {
    for (const patron of AFIRMA_GARANTIA) {
      it(`${caso}: el prompt no dice ${patron}`, () => {
        expect(soloLoQueDebeDecir(buildSystemPrompt(user, 'tiktok_live', user.phone ?? '', { ahora: AHORA }))).not.toMatch(patron);
      });
    }
  }

  it('pero la prohibición sí está escrita', () => {
    const prompt = buildSystemPrompt(mujeres[0].user, 'tiktok_live', mujeres[0].user.phone ?? '', { ahora: AHORA });
    expect(prompt).toMatch(/NO SE NOMBRA|NUNCA LE NOMBRES LA GARANT[ÍI]A/i);
  });

  it('y lo que sí va pegado al precio sigue estando: mensual y cancela cuando quiera', () => {
    const prompt = buildSystemPrompt(mujeres[0].user, 'tiktok_live', mujeres[0].user.phone ?? '', { ahora: AHORA });
    expect(prompt).toMatch(/cancela cuando quiera/i);
  });
});
