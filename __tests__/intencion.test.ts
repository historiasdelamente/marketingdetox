import { describe, expect, it } from 'vitest';

import { estaCorrigiendo, haySenalDeDuda, leerIntencion, bloqueIntencion } from '@/lib/whatsapp/intencion';

// ===========================================================================
// TODO LO DE ABAJO ES TEXTUAL DE PRODUCCIÓN — conversaciones del 2026-08-06.
// ===========================================================================

const PAULA_NUEVE_ANIOS =
  'Uf, Yeny, nueve años pidiendo perdón por cosas que ni hiciste, con tal de que no se enoje.';
const PAULA_ENTRADA =
  '¿Sigues con el narcisista y quieres salir de ahí, o ya saliste y quieres recuperarte? Aquí se trabajan las dos.';
const PAULA_OFRECE_LINK =
  '¿Quieres que te vuelva a mandar el link para que puedas entrar hoy mismo y empezar a soltar ese enojo?';

describe('Yeny: la corrección que se ignoró cuatro veces', () => {
  it('reconoce que «No tengo 9 años» corrige a «nueve años»', () => {
    expect(estaCorrigiendo('No tengo 9 años', PAULA_NUEVE_ANIOS)).toBe(true);
    expect(leerIntencion('No tengo 9 años', PAULA_NUEVE_ANIOS)).toBe('corrige');
  });

  it('«No he salido» es una respuesta, no una corrección', () => {
    // Contesta a la pregunta de entrada. Si esto se leyera como corrección,
    // Paula se disculparía por nada y sonaría más robot todavía.
    expect(estaCorrigiendo('No he salido', PAULA_ENTRADA)).toBe(false);
    expect(leerIntencion('No he salido', PAULA_ENTRADA)).toBe('responde_corto');
  });

  it('la orden ante una corrección prohíbe seguir vendiendo', () => {
    const b = bloqueIntencion('corrige');
    expect(b).toMatch(/TE ESTÁ CORRIGIENDO/);
    expect(b).toMatch(/NO va: el link/);
  });

  it('otras correcciones reales también se cazan', () => {
    expect(estaCorrigiendo('yo no dije que estuviera casada', 'Entiendo que estés casada con él.')).toBe(true);
    expect(estaCorrigiendo('eso no es así, nunca lo dejé', 'Ya lo dejaste y sigues pensando en él.')).toBe(true);
    // Sin choque con lo que Paula dijo, no es corrección.
    expect(estaCorrigiendo('no gracias', 'Aquí tienes el link.')).toBe(false);
  });
});

describe('Analia: el sí que se perdió y las preguntas fuera de lugar', () => {
  it('«Dale» tras un ofrecimiento es un SÍ', () => {
    expect(leerIntencion('Dale', PAULA_OFRECE_LINK)).toBe('acepta');
    for (const si of ['dale', 'ok', 'bueno', 'listo', 'sí', 'mándamelo', 'por favor']) {
      expect(leerIntencion(si, PAULA_OFRECE_LINK), si).toBe('acepta');
    }
  });

  it('un «ok» suelto sin ofrecimiento no es un sí', () => {
    expect(leerIntencion('ok', 'Los talleres son martes y jueves.')).not.toBe('acepta');
  });

  it('la orden ante un sí obliga a mandar el link de verdad', () => {
    const b = bloqueIntencion('acepta');
    expect(b).toMatch(/Prohibido anunciar algo y no mandarlo/);
  });

  it('«Muchísimas gracias!!» es despedida, y ahí no se pregunta por dudas', () => {
    expect(leerIntencion('Muchísimas gracias!!', 'De nada.')).toBe('se_despide');
    expect(bloqueIntencion('se_despide')).toMatch(/ninguna pregunta sobre qué la frena/);
  });

  it('su párrafo largo es «cuenta», y obliga a usar SUS palabras', () => {
    const suyo =
      'En febrero lo eche d mi casa pero cuando recuerdo todavía me hace sentir mal , me enoja , estoy muy enojada con todo lo q me hizo , me puede , sabe donde tocar para q me enoje , y cada vez q eso pasa son x lo menos 3 días q estoy muy mal , me hace mal al cuerpo y a la mente';
    expect(leerIntencion(suyo, '')).toBe('cuenta');

    const b = bloqueIntencion('cuenta');
    expect(b).toMatch(/algo concreto que ELLA acaba de escribir/);
    expect(b).toMatch(/se le podría mandar igual a otra mujer/);
  });

  it('«Vos me mandas a la hora d argentina?» es pregunta', () => {
    expect(leerIntencion('Vos me mandas a la hora d argentina?', '')).toBe('pregunta');
    expect(bloqueIntencion('pregunta')).toMatch(/No contestes con otra pregunta/);
  });
});

describe('cuando ella no ha contado nada, Paula NO se lo inventa', () => {
  it('un saludo suelto es responde_corto', () => {
    for (const corto of ['Hola', 'Buen día', 'Ok aquí estoy', 'ya']) {
      expect(leerIntencion(corto, ''), corto).toBe('responde_corto');
    }
  });

  it('la orden prohíbe afirmarle un dolor y manda UN solo globo', () => {
    const b = bloqueIntencion('responde_corto');
    expect(b).toMatch(/No sabes lo que le pasa. No te lo inventes/);
    expect(b).toMatch(/Prohibido afirmarle un dolor que ella no ha dicho/);
    expect(b).toMatch(/UN globo/);
  });
});

describe('señal de duda: solo se pregunta qué la frena si algo frena', () => {
  it('no la ve donde no la hay', () => {
    expect(haySenalDeDuda(['Hola', 'Ya lo dejé', 'Muchísimas gracias!!'])).toBe(false);
  });

  it('un «pero» de su historia NO es una duda de compra', () => {
    // Textual de Analia. Con «pero» en la lista, Paula creía que había un freno
    // y volvía a preguntarle qué la frenaba — justo lo que se quería matar.
    expect(
      haySenalDeDuda([
        'En febrero lo eche d mi casa pero cuando recuerdo todavía me hace sentir mal',
      ]),
    ).toBe(false);
    expect(haySenalDeDuda(['despues te cuento como me fue'])).toBe(false);
    expect(haySenalDeDuda(['luego lo vi con otra'])).toBe(false);
  });

  it('la ve cuando ella la pone', () => {
    expect(haySenalDeDuda(['me interesa pero no tengo plata ahorita'])).toBe(true);
    expect(haySenalDeDuda(['está muy caro'])).toBe(true);
    expect(haySenalDeDuda(['déjame pensarlo'])).toBe(true);
    expect(haySenalDeDuda(['lo voy a pensar'])).toBe(true);
    expect(haySenalDeDuda(['no sé si me sirva'])).toBe(true);
  });
});

describe('lo que NO es un sí', () => {
  // Probando el 2026-08-06: «Ya lo dejé» se leía como que ella aceptaba algo,
  // porque empieza por «ya» y la pregunta de entrada lleva «?». Es la respuesta
  // a esa pregunta, no un sí — y confundirlo desvía toda la conversación.
  const ENTRADA = 'Hoy, ¿ya dejaste al narcisista y quieres recuperarte, o todavía quieres dejarlo?';

  it('las respuestas a la pregunta de entrada no son aceptaciones', () => {
    for (const r of ['Ya lo dejé', 'ya lo deje', 'Sigo con él', 'No he salido', 'todavía estoy con él']) {
      expect(leerIntencion(r, ENTRADA), r).not.toBe('acepta');
    }
  });

  it('una pregunta cualquiera de Paula no convierte un "ok" en un sí', () => {
    expect(leerIntencion('ok', '¿Cómo te llamas?')).not.toBe('acepta');
    // Pero un ofrecimiento de verdad, sí.
    expect(leerIntencion('ok', '¿Quieres que te mande el link?')).toBe('acepta');
  });
});
