// ============================================================================
// EL MENSAJE EN EL QUE ELLA SE ENTERA DE QUÉ ES APEGO DETOX
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ 📌 POR QUÉ EXISTE ESTE ARCHIVO. Javier, 2026-08-08, con tres capturas de   ║
// ║ WhatsApp delante: *"la usuaria queda sin saber qué es Apego Detox y se le  ║
// ║ da más fuerza a la cartilla, siendo el elemento principal Apego Detox (…)  ║
// ║ solo habla de terapias en vivo en una chorrera de texto; necesito que      ║
// ║ tenga orden en este discurso"*.                                           ║
// ║                                                                           ║
// ║ Las viñetas llevaban DOS DÍAS en el código sin haber salido ni una vez, y  ║
// ║ no por una causa sino por cuatro encadenadas. Cada `it` de aquí abajo es   ║
// ║ una de ellas. Los tests que había pasaban todos en verde mientras esto     ║
// ║ ocurría, porque probaban la pieza y nunca el camino entero.                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// ============================================================================

import { describe, it, expect } from 'vitest';

import { asegurarLinkTrasLaLista, auditarRespuesta } from '@/lib/whatsapp/blindaje';
import { aplicarFormato } from '@/lib/whatsapp/formato';
import { tandaDeVinetas, type Turno } from '@/lib/whatsapp/guion';
import { partirEnGlobos } from '@/lib/whatsapp/manychat';
import { APEGO_DETOX } from '@/lib/whatsapp/programa';
import { buildSystemPrompt, type WaUser } from '@/lib/whatsapp/paula';

const VIERNES_31 = new Date('2026-07-31T15:00:00Z');

const ella: WaUser = {
  id: 1,
  manychat_id: 'u-presentacion',
  name: 'Mayra',
  funnel_stage: 'nuevo',
  situacion_resumen: null,
  first_contact: '',
  last_interaction: '',
  conversation_count: 2,
  phone: '+573001112233',
  pais: 'CO',
};

/** Lo que hay en el chat justo antes de que ella conteste la pregunta de entrada. */
const ANTES_DE_CONTESTAR: Turno[] = [
  { role: 'assistant', content: 'Hola 💛 Soy Paula, del equipo de Javier Vieira, Psicólogo Especialista.' },
  { role: 'user', content: 'Mayra' },
  { role: 'assistant', content: '¿Sigues con el narcisista y quieres salir de ahí, o ya saliste y quieres recuperarte?' },
];

/**
 * LAS TRES RESPUESTAS REALES DE LAS CAPTURAS.
 *
 * Ninguna pregunta "¿qué incluye?" — contestan la pregunta que les hicimos. Ese
 * era el punto ciego: la única llave de las viñetas era que ELLA preguntara.
 */
const LO_QUE_CONTESTARON = [
  'Quiero dejarlo',
  'Ya salí y quiero recuperarme',
  'Quiero dejarlo. Pero quiero saber si el problema soy yo',
];

const prompt = (mensajeDeElla: string, historial = ANTES_DE_CONTESTAR) =>
  buildSystemPrompt(ella, 'tiktok_live', '+573001112233', {
    ahora: VIERNES_31,
    historial,
    mensajeDeElla,
  });

/** Una viñeta DE VERDAD abre renglón; el "• " dentro de una instrucción no cuenta. */
const vinetasDe = (texto: string) => texto.split('\n').filter((l) => /^\s*>?\s*•/.test(l));

describe('1. las viñetas se disparan cuando ella contesta, no solo cuando pregunta', () => {
  it.each(LO_QUE_CONTESTARON)('«%s» abre la presentación con viñetas', (mensaje) => {
    // ⚠️ ESTO DEVOLVÍA 0 EN LAS TRES. Medido el 2026-08-08 contra el código de
    // producción: `preguntaQueIncluye` no casa con ninguna, así que la lista no
    // salía nunca y ellas terminaban la conversación sin saber qué se vendía.
    expect(tandaDeVinetas(ANTES_DE_CONTESTAR, mensaje, null)).toBe(1);
  });

  it('en el saludo de entrada NO, que ahí solo se pregunta', () => {
    expect(tandaDeVinetas([], 'hola', null)).toBe(0);
  });

  it('y tampoco después, cuando ella ya sabe qué es', () => {
    const yaSabe: Turno[] = [
      ...ANTES_DE_CONTESTAR,
      { role: 'user', content: 'Ya salí y quiero recuperarme' },
      { role: 'assistant', content: 'Hay módulos, talleres en vivo y una comunidad a cualquier hora.' },
    ];
    expect(tandaDeVinetas(yaSabe, 'y cuánto vale?', null)).toBe(0);
  });
});

describe('2. el prompt de ese turno trae UNA sola receta, y es la de las viñetas', () => {
  const p = prompt('Ya salí y quiero recuperarme');

  it('trae el bloque 📦 con las tres viñetas escritas', () => {
    expect(p).toContain('ELLA SE ENTERA DE QUÉ ES APEGO DETOX');
    expect(vinetasDe(p)).toHaveLength(3);
  });

  it('nombra los 17 módulos de terapia en video — lo que ella nunca llegaba a leer', () => {
    expect(p).toContain('17 módulos de terapia en video');
    expect(p).toContain('en vivo con Javier Vieira');
  });

  it('NO trae además la receta en prosa que producía la chorrera', () => {
    // Eran dos órdenes para el mismo mensaje —una con viñetas y otra de
    // corrido— y con gpt-4.1-mini ganaba la de corrido. De ahí salía el
    // *"vas a poder entender por qué pasó y sostenerte sin volver,
    // acompañada con Javier Vieira en vivo cada semana"* de las capturas.
    expect(p).not.toContain('Escoge UNA transformación');
    expect(p).not.toContain('Prohibido el globo-catálogo');
  });

  it('y no le encima la cartilla', () => {
    expect(p).not.toContain('TIENES ALGO QUE MANDARLE');
  });
});

describe('3. la lista sobrevive el camino entero hasta el celular', () => {
  // La respuesta bien escrita, tal como la pide el bloque 📦.
  const respuesta = [
    'Mayra, ya saliste y él sigue ocupándote la cabeza. Apego Detox es donde se trabaja justo eso, y es esto:',
    ...APEGO_DETOX.beneficios.slice(0, 3).map((b) => `• ${b}`),
    'Sales entendiendo que no fue por débil, y sabiendo sostenerte sin volver.',
    APEGO_DETOX.landing,
  ].join('\n');

  const final = aplicarFormato(respuesta, true);
  const globos = partirEnGlobos(final);

  it('llegan tres globos, no seis', () => {
    // ⚠️ AQUÍ SE ROMPÍA TODO, Y NO SE VEÍA EN NINGÚN TEST. `globosDe` parte por
    // cualquier salto de línea, así que las tres viñetas salían como TRES
    // mensajes sueltos; el tope de tres se disparaba y `comprimirGlobos` las
    // pegaba con un espacio, dejando las tres en un solo renglón corrido.
    expect(globos).toHaveLength(3);
  });

  it('las tres viñetas viajan juntas en UN globo y enteras', () => {
    const conLista = globos.filter((g) => g.includes('•'));
    expect(conLista, 'la lista quedó repartida en varios globos').toHaveLength(1);
    expect(conLista[0].split('\n').filter((l) => l.trim().startsWith('•'))).toHaveLength(3);
    for (const b of APEGO_DETOX.beneficios.slice(0, 3)) {
      expect(conLista[0]).toContain(b);
    }
  });

  it('el link sigue solo en su globo y clicable', () => {
    expect(globos[globos.length - 1]).toBe(APEGO_DETOX.landing);
  });

  it('el blindaje no lo marca ni por largo ni por llevar lista', () => {
    // El tope de 320 se mide sobre la PROSA: sin esa resta, este mensaje se
    // pasaba siempre y la corrección le ordenaba al modelo deshacer la lista.
    const { hallazgos } = auditarRespuesta(respuesta, VIERNES_31, 'apego', [], [], 'Mayra', true);
    const tipos = hallazgos.map((h) => h.tipo);
    expect(tipos).not.toContain('demasiado_largo');
    expect(tipos).not.toContain('vinetas');
  });
});

describe('4. si se queda en la última viñeta, el código le pone la puerta', () => {
  // Pasó contra el modelo real en el primer intento: escribió la entrada y las
  // tres viñetas, y ahí paró. Una lista se ve terminada, y el mensaje con más
  // ganas de entrar de toda la conversación se quedaba sin link.
  const descabezado = [
    'Mayra, ya saliste y él sigue en tu cabeza. Apego Detox es donde se trabaja eso, y es esto:',
    ...APEGO_DETOX.beneficios.slice(0, 3).map((b) => `• ${b}`),
  ].join('\n');

  it('le añade la página detrás de la lista', () => {
    const reparado = asegurarLinkTrasLaLista(descabezado);
    expect(reparado).toContain(APEGO_DETOX.landing);
    expect(partirEnGlobos(reparado).at(-1)).toBe(APEGO_DETOX.landing);
  });

  it('no toca el mensaje si Paula ya mandó un link', () => {
    const conLink = `${descabezado}\n\n${APEGO_DETOX.checkout}`;
    expect(asegurarLinkTrasLaLista(conLink)).toBe(conLink);
  });

  it('no toca un mensaje que cierra en prosa: ahí no mandar link es una decisión', () => {
    const conCierre = `${descabezado}\nSales sabiendo que no fue por débil.`;
    expect(asegurarLinkTrasLaLista(conCierre)).toBe(conCierre);
  });

  it('no le cuelga un link a un mensaje sin lista', () => {
    const prosa = 'Te entiendo, Mayra. Eso es justo lo que se trabaja adentro.';
    expect(asegurarLinkTrasLaLista(prosa)).toBe(prosa);
  });
});

describe('5. fuera de ese mensaje, la regla de la casa sigue en pie', () => {
  it('una lista en un turno que no toca se sigue matando', () => {
    const conLista = 'Adentro tienes:\n• Talleres en vivo\n• Comunidad\n• Módulos';
    expect(aplicarFormato(conLista)).not.toContain('•');
  });

  it('y el blindaje la marca para que el modelo la reescriba', () => {
    const { hallazgos } = auditarRespuesta(
      'Mira:\n• una cosa\n• otra cosa',
      VIERNES_31,
      'apego',
      [],
      [],
      'Mayra',
      false,
    );
    expect(hallazgos.map((h) => h.tipo)).toContain('vinetas');
  });
});
