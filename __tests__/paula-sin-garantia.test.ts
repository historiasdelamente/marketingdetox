import { describe, it, expect } from 'vitest';

import { buildSystemPrompt, type WaUser } from '@/lib/whatsapp/paula';
import { preguntaPorGarantia } from '@/lib/whatsapp/guion';
import { quitarGarantiaNoPedida } from '@/lib/whatsapp/blindaje';

const AHORA = new Date('2026-08-08T15:00:00Z');

/**
 * LA GARANTÍA — Javier, 2026-08-08. La regla tiene DOS mitades:
 *
 *   · Paula NO la ofrece. No es un argumento de venta en este canal.
 *   · Si ELLA pregunta, se la confirma: son 7 días.
 *
 * Este primer bloque prueba la primera mitad. La segunda está más abajo.
 *
 * ⚠️ SE PRUEBA SOBRE EL PROMPT ENTERO Y NO SOBRE UN BLOQUE, y es a propósito.
 * La garantía estaba en SIETE sitios: el globo del precio, la tabla de "qué
 * contestar a qué", el bloque de datos duros, la instrucción de corrección del
 * reintento, dos entradas de PAULA-CONOCIMIENTO.md y —el peor— un EJEMPLO que
 * se la ponía en la boca palabra por palabra.
 *
 * Las dos del markdown no las vio ningún grep de `lib/`: solo aparecen al mirar
 * el prompt ya armado, que es lo que el modelo lee de verdad. Y el ejemplo era
 * el peligroso: la regla de oro del proyecto (ver PAULA-ESTADO-2026-08-06) es
 * que **lo que el modelo tiene delante lo copia, aunque el texto diga que no lo
 * copie**, así que quitar seis y dejar el ejemplo habría dejado la garantía
 * viva en producción con la prohibición escrita justo encima.
 *
 * Por eso se busca la FORMA AFIRMATIVA y no la palabra: "garantía" sigue en el
 * prompt, dentro de la regla que dice cuándo se usa y cuándo no.
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
    // ⛔ y ✅ marcan las líneas que enuncian LA REGLA (no la ofrezcas / si te
    // pregunta, confírmasela). La regla tiene que citar las frases para ser
    // concreta, así que buscarlas ahí marcaría como fallo el candado mismo.
    .filter((l) => !/⛔|✅|NO SE NOMBRA|no le nombres|\bNUNCA\b|no se contesta con la garant/i.test(l))
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

/**
 * LA OTRA MITAD DE LA REGLA — Javier, 2026-08-08: *"confirme y di que tiene 7
 * días de garantía cuando te pregunte"*.
 *
 * No ofrecerla y negarla no son lo mismo. La garantía está publicada en la
 * página y en los términos: a una mujer que pregunta directamente por su dinero
 * hay que contestarle que sí.
 */
describe('si ELLA pregunta, se le confirma', () => {
  const preguntando = [
    'hay garantía?',
    'tiene garantia?',
    'y si no me gusta me devuelven el dinero?',
    'puedo pedir reembolso',
    'me devuelven la plata si no me sirve',
    'y si me arrepiento?',
    'hay devolución?',
  ];

  for (const mensaje of preguntando) {
    it(`«${mensaje}» se detecta como pregunta por la garantía`, () => {
      expect(preguntaPorGarantia(mensaje)).toBe(true);
    });
  }

  // Si esto se disparara de más, Paula le ofrecería la garantía a quien no
  // preguntó — que es justo lo que Javier mandó quitar.
  for (const mensaje of ['llevo nueve años con él', 'cuánto cuesta?', 'como me uno a la comunidad', 'gracias']) {
    it(`«${mensaje}» NO es una pregunta por la garantía`, () => {
      expect(preguntaPorGarantia(mensaje)).toBe(false);
    });
  }

  it('el prompt cambia a CONFÍRMASELA cuando ella pregunta', () => {
    const prompt = buildSystemPrompt(mujeres[0].user, 'tiktok_live', mujeres[0].user.phone ?? '', {
      ahora: AHORA,
      mensajeDeElla: 'hay garantía?',
    });
    expect(prompt).toMatch(/CONF[ÍI]RMASELA/i);
    expect(prompt).not.toMatch(/NUNCA LE NOMBRES LA GARANT[ÍI]A/i);
  });

  it('y sigue en modo prohibición cuando ella habla de otra cosa', () => {
    const prompt = buildSystemPrompt(mujeres[0].user, 'tiktok_live', mujeres[0].user.phone ?? '', {
      ahora: AHORA,
      mensajeDeElla: 'llevo nueve años con él',
    });
    expect(prompt).toMatch(/NUNCA LE NOMBRES LA GARANT[ÍI]A/i);
    expect(prompt).not.toMatch(/CONF[ÍI]RMASELA/i);
  });
});

/**
 * EL CANDADO. El prompt lo pide; esto lo hace cierto — la garantía es el cierre
 * más fácil que existe y el modelo la va a alcanzar en cuanto ella dude.
 */
describe('quitarGarantiaNoPedida', () => {
  it('borra la garantía y deja el precio en pie', () => {
    const r = quitarGarantiaNoPedida('Son $40 USD al mes, unos 125.000 COP. Y tienes 7 días de garantía: si no es para ti se te devuelve.');
    expect(r).toContain('125.000 COP');
    expect(r).not.toMatch(/garant[íi]a/i);
    expect(r).not.toMatch(/se te devuelve/i);
  });

  it('no toca «cancela cuando quiera», que sí se puede decir', () => {
    const t = 'Son $40 al mes, es mensual y la cancelas cuando quieras.';
    expect(quitarGarantiaNoPedida(t)).toBe(t);
  });

  it('nunca devuelve vacío', () => {
    expect(quitarGarantiaNoPedida('Tienes 7 días de garantía.').trim().length).toBeGreaterThan(0);
  });
});
