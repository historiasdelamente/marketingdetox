import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildSystemPrompt, type WaUser } from '@/lib/whatsapp/paula';
import { esMonosilabo, puedeCallar } from '@/lib/whatsapp/prompt-v2';
import type { Turno } from '@/lib/whatsapp/guion';

// ============================================================================
// EL CONTRATO DEL PROMPT V2 — «cuatro hechos, cero libreto»
//
// Estos tests NO prueban lo que el modelo escribe (eso es el simulador): fijan
// lo que el prompt LE ENTREGA. Si alguien vuelve a meter el folleto, el menú
// de features o una orden de venta por posición en el embudo, esto revienta.
// ============================================================================

const USER: WaUser = {
  id: 0,
  manychat_id: 'test-v2',
  name: 'Jennifer',
  funnel_stage: 'link_enviado',
  situacion_resumen: null,
  first_contact: '',
  last_interaction: '',
  conversation_count: 0,
};

const ella = (content: string): Turno => ({ role: 'user', content });
const paula = (content: string): Turno => ({ role: 'assistant', content });

// La conversación de Jennifer al momento del «🙏🙏»: ya tiene el link.
const HISTORIAL_JENNIFER: Turno[] = [
  ella('Hola vengo de TikTok'),
  paula('Soy Paula, del equipo de Javier Vieira, Psicólogo Especialista. ¿Cómo te llamas?'),
  ella('Jennifer'),
  paula('Mucho gusto, Jennifer. ¿Sigues con él, o ya saliste?'),
  ella('Sigo con el aún y quiero salir de el'),
  paula('Apego Detox trabaja justo eso. Puedes verlo aquí 👉\nhttps://historiasdelamente.com/apegodetox'),
  ella('Si yo estoy ya que no soy yo y toda mi familia el me la alejo'),
  paula('Sentirte una extraña contigo misma y sin tu gente cerca pesa muchísimo, Jennifer.'),
];

function promptV2(historial: Turno[], mensaje: string): string {
  return buildSystemPrompt(USER, '', '+18095551234', {
    ahora: new Date('2026-08-14T20:00:00-05:00'),
    historial,
    mensajeDeElla: mensaje,
    tasas: { COP: 4100, MXN: 17, ARS: 1300, CLP: 950, PEN: 3.7, EUR: 0.9 },
  });
}

describe('v2 — el guion viejo no viaja en el prompt', () => {
  beforeEach(() => {
    process.env.PAULA_PROMPT = 'v2';
  });
  afterEach(() => {
    delete process.env.PAULA_PROMPT;
  });

  it('con «🙏🙏» el prompt no trae NINGUNA orden de venta ni menú de features', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '🙏🙏');
    // Las frases-menú del guion viejo, muertas:
    expect(p).not.toContain('LO QUE TOCA AHORA');
    expect(p).not.toContain('ESPERAR SU PREGUNTA, NO EMPUJAR');
    expect(p).not.toContain('le das UNA cosa nueva y concreta de adentro');
    // El folleto literal, muerto:
    expect(p).not.toContain('17 módulos de terapia en video: entiendes por qué te pasó');
    expect(p).not.toContain('es donde se trabaja justo eso, y es esto');
  });

  it('el ledger 🧾 lista lo ya dado, como hecho y no como orden', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '🙏🙏');
    expect(p).toContain('🧾 YA LE DISTE');
    expect(p).toContain('un link');
  });

  it('la pregunta del freno está prohibida SIEMPRE en el prompt', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '🙏🙏');
    expect(p).toMatch(/PROHIBIDO SIEMPRE[\s\S]{0,120}qué la frena/i);
  });

  it('las cifras del programa van exactas y con su regla de redacción', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '¿qué incluye?');
    expect(p).toContain('17 módulos');
    expect(p).toContain('4 horas de talleres EN VIVO');
    expect(p).toContain('la redacción es tuya, los números no');
  });

  it('💳 la seguridad del pago viaja siempre: Skool y Stripe con sus hechos', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'me da miedo poner mi tarjeta');
    expect(p).toContain('Skool');
    expect(p).toContain('Stripe');
    expect(p).toMatch(/NUNCA vemos ni guardamos su tarjeta/);
  });

  it('el caso Alejandra viaja como 📮: pidió correo y llegó otra cosa', () => {
    const conPeticion: Turno[] = [
      ella('Me llamo Alejandra'),
      paula('Tengo una cartilla de Javier, ¿a qué correo te la mando?'),
    ];
    const p = promptV2(conPeticion, 'Alejandra campos');
    expect(p).toContain('📮 PENDIENTE');
    expect(p).toContain('NO es un correo');
  });

  it('la hora del taller va en LA HORA DE ELLA (República Dominicana: 9 PM)', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'a qué hora son');
    expect(p).toMatch(/9:00 PM.*ESA ES LA HORA DE ELLA/);
  });

  it('el prompt renderizado respeta el fusible de tamaño (≤23.200 chars)', () => {
    // El v1 medía 42.000-47.000 y traía TRES órdenes contradictorias en el
    // mismo prompt. El fusible no es una meta estética: es el freno para que
    // el estado no vuelva a crecer hasta ser guion — para añadir algo aquí,
    // hay que borrar algo.
    //
    // ⚠️ EL NÚMERO SE MIDIÓ, NO SE ESTIMÓ (2026-08-15). El techo estuvo en
    // 20.000 con el contenido midiendo 20.071: se recortaron frases buenas dos
    // veces para ganar 20 caracteres, y aun así quedaba en rojo. El margen se
    // fija con holgura real (~400) sobre la medida del fixture largo — el de
    // Jennifer, cuyo bloque 🧾 pesa 460 porque arrastra los últimos cuatro
    // mensajes de Paula.
    //
    // ⚠️ SUBIÓ DE 20.500 A 22.500 EL 2026-08-15 (segunda vez ese día), y por
    // una razón, no por comodidad: Javier ordenó que Paula VENDA —«primero
    // motivas y después vendes», «un paso a paso lógico»— y eso entró como
    // doctrina nueva: el recorrido de cinco estaciones, la estación de
    // motivación, el trato formal-cercano, la política de precio, el sello de
    // pago y el correo como segunda puerta. Antes de subir el techo se pagó el
    // peaje: el canon de conocimiento se recortó a la mitad (todo lo que
    // también estaba en el prompt se borró de allí), el bloque 📊 se limpió de
    // órdenes, y el prompt se comprimió 2.600 caracteres. La medida final del
    // fixture largo fue 22.089. La regla sigue viva desde este número nuevo:
    // lo siguiente que entre, saca algo.
    //
    // ⚠️ SEGUNDA SUBIDA, A 23.200 — misma tarde, leyendo la conversación de
    // Jade. Ella escribió «sigo teniendo contacto» —una confesión, no un dato—
    // y Paula le contestó con una frase de molde y el precio pegado. Javier
    // pidió lo contrario: "algo afín a lo que ella te está diciendo (…) los
    // beneficios que podría alcanzar (…) altamente emocional, que toque el
    // corazón (…) luego ya sí pasas el link". Eso entró como la regla de LA
    // CONFESIÓN (ese turno no lleva precio ni link) y como la regla de que la
    // pieza del programa se elige por el MOMENTO que ella nombró, no del
    // catálogo. El peaje se pagó igual: 350 caracteres de solapamiento fuera
    // (la enumeración de casos, el checklist, el bloque del pago, el correo).
    // Medida del fixture largo: 22.906. Total recortado en el día: 3.700.
    const p = promptV2(HISTORIAL_JENNIFER, 'cuéntame qué es el programa');
    expect(p.length).toBeLessThanOrEqual(23200);
  });

  it('sin PAULA_PROMPT=v2, el prompt v1 sigue intacto (con su guion)', () => {
    delete process.env.PAULA_PROMPT;
    const p = promptV2(HISTORIAL_JENNIFER, '🙏🙏');
    expect(p).toContain('LO QUE TOCA AHORA');
  });
});

// ============================================================================
// EL CONTRATO DE VENTA — 2026-08-15
//
// Javier: *"el objetivo es que venda Apego Detox (…) eres el asistente del
// psicólogo Javier Vieira (…) primero motivas y después vendes (…) un paso a
// paso lógico, pero tampoco copiar y pegar siempre lo mismo"*.
//
// Estos tests fijan que esa doctrina VIAJA en el prompt. No prueban que el
// modelo la cumpla — eso es el simulador (`_chat-manual.test.ts`) — sino que
// nadie la borre por accidente al recortar para el fusible.
// ============================================================================
describe('v2 — el recorrido de venta viaja', () => {
  beforeEach(() => {
    process.env.PAULA_PROMPT = 'v2';
  });
  afterEach(() => {
    delete process.env.PAULA_PROMPT;
  });

  it('la misión es vender, y en el orden motivar → presentar → precio', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'cuéntame qué es el programa');
    expect(p).toContain('TU TRABAJO ES QUE ENTRE A APEGO DETOX');
    expect(p).toMatch(/motivando primero y vendiendo después/i);
    // El orden de las tres condiciones de compra, en una sola frase:
    expect(p).toMatch(/sabe qué le pasa[\s\S]{0,220}sabe cuánto vale/i);
  });

  it('las cinco estaciones viajan, con el tope de una por turno', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'hola');
    for (const estacion of ['RECIBIR', 'ESCUCHAR', 'MOTIVAR', 'PRESENTAR', 'CERRAR']) {
      expect(p).toContain(estacion);
    }
    expect(p).toMatch(/Una estación por turno como máximo/i);
    // …y sigue siendo un camino, no un libreto:
    expect(p).toMatch(/No es un libreto/i);
  });

  it('la motivación es su propia estación y sigue prohibido explicar el mecanismo', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'me dejó por otra y no puedo dormir');
    expect(p).toMatch(/LA MOTIVACIÓN \(estación 3\)[\s\S]{0,700}Sin mecanismos/i);
    expect(p).toMatch(/no es falta de carácter ni debilidad suya/i);
  });

  it('la regla vieja que impedía presentar el programa está muerta', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'hola');
    expect(p).not.toContain('Se presenta UNA sola vez por conversación, cuando ELLA abre la puerta');
    expect(p).toMatch(/venta perdida por silencio/i);
  });

  it('el trato es el de una asistente formal y cercana, sin apodos', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'hola');
    expect(p).toContain('la asistente de Javier Vieira, Psicólogo Especialista');
    expect(p).toMatch(/Cero apodos/i);
    expect(p).toMatch(/si ella escribe de «usted», tú también/i);
  });
});

// ============================================================================
// LA FORMA QUE PIDIÓ JAVIER VIENDO LAS CONVERSACIONES REALES — 2026-08-15 tarde
//
// *"se hicieron muchos globos y cuando ella pone varios renglones, sintetices
// lo que quiere decir en una respuesta. No uses tantos globos porque se pierde
// la claridad (…) el objetivo real es vender Apego Detox (…) si se motiva, pero
// con el fin de mostrar los beneficios de este programa"*.
//
// Lo que se vio en producción: seis preguntas seguidas antes de nombrar el
// programa, tres globos para contestar tres renglones de ella, y un link
// entregado sin que ella supiera qué hay dentro.
// ============================================================================
describe('v2 — un globo, síntesis y beneficios', () => {
  beforeEach(() => {
    process.env.PAULA_PROMPT = 'v2';
  });
  afterEach(() => {
    delete process.env.PAULA_PROMPT;
  });

  it('el default es UN globo, no tres', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'hola');
    expect(p).toMatch(/\*\*UN globo por turno\.\*\*/);
    expect(p).toMatch(/El segundo, solo si lleva el link/i);
  });

  it('varios renglones de ella = UNA respuesta sintetizada', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'me llama\ny me dice que me quiere\npero después me lastima');
    expect(p).toMatch(/SI ELLA MANDÓ VARIOS RENGLONES, ES UN SOLO MENSAJE/i);
    expect(p).toMatch(/Jamás renglón por renglón/i);
  });

  it('el interrogatorio tiene tope: dos preguntas y a presentar', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'sigo con él');
    expect(p).toMatch(/Como mucho DOS en toda la escucha/i);
    expect(p).toMatch(/un interrogatorio no vende/i);
    expect(p).toMatch(/nunca dos turnos seguidos terminados en pregunta/i);
  });

  it('motivar sin nombrar lo de dentro está prohibido: «se trabaja» a secas no vale', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'ya no puedo más con esto');
    expect(p).toMatch(/DÓNDE y CON QUÉ/);
    expect(p).toMatch(/no puede comprar un «se trabaja»/i);
  });

  it('el link no viaja solo: detrás de qué es y qué gana', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'cuéntame qué es el programa');
    expect(p).toMatch(/EL LINK NUNCA VA SOLO NI EN MEDIO DEL MENSAJE/i);
  });

  it('la pregunta de control por el link está prohibida', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'ok');
    expect(p).toMatch(/¿pudiste ver el enlace\?/i);
    expect(p).toMatch(/Prohibidas las preguntas de mostrador y las de control/i);
  });
});

describe('v2 — los hechos de la venta: precio, puertas, pago y correo', () => {
  beforeEach(() => {
    process.env.PAULA_PROMPT = 'v2';
  });
  afterEach(() => {
    delete process.env.PAULA_PROMPT;
  });

  it('el precio que viaja es el de Skool ($38), no el viejo de $40', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '¿cuánto cuesta?');
    expect(p).toContain('$38 USD al mes');
    expect(p).not.toContain('$40');
  });

  it('el precio no se manda desnudo ni minimizado', () => {
    const p = promptV2(HISTORIAL_JENNIFER, '¿cuánto cuesta?');
    expect(p).toMatch(/El número solo, sin nada al lado, no lo mandes/i);
    expect(p).toMatch(/Prohibido minimizarlo/i);
    // Y sigue prohibido esconderlo:
    expect(p).toMatch(/Esconderlo mata más que decirlo/i);
  });

  it('las dos puertas viajan EN ORDEN: la página antes que la plataforma de pago', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'cuéntame qué es el programa');
    const conocer = p.indexOf('https://historiasdelamente.com/apegodetox');
    const entrar = p.indexOf('https://www.skool.com/historias-de-la-mente-4978');
    expect(conocer).toBeGreaterThan(-1);
    expect(entrar).toBeGreaterThan(-1);
    expect(conocer).toBeLessThan(entrar);
    expect(p).toMatch(/la PRIMERA que recibe siempre/i);
  });

  it('el sello de seguridad va pegado al link de ENTRAR, no solo si ella pregunta', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'ya voy a entrar');
    expect(p).toMatch(/cada vez que le das el link de ENTRAR va pegada UNA línea/i);
    expect(p).toContain('Skool');
    expect(p).toContain('Stripe');
  });

  it('el correo viaja como segunda puerta de venta, con la secuencia detrás', () => {
    const p = promptV2(HISTORIAL_JENNIFER, 'gracias');
    expect(p).toContain('EL CORREO — la segunda puerta de venta');
    expect(p).toMatch(/los correos de Javier/i);
    expect(p).toMatch(/tú no mandas nada a mano/i);
  });

  it('el preámbulo editorial del canon NO viaja al modelo', () => {
    // Nombrar el título de corte dentro del preámbulo metía 1.900 caracteres
    // de notas para Javier en el prompt, sin que nada fallara. 2026-08-15.
    const p = promptV2(HISTORIAL_JENNIFER, 'hola');
    expect(p).not.toContain('BORRADOR PARA FIRMA');
    expect(p).toContain('# QUÉ ES APEGO DETOX');
  });
});

describe('v2 — [SILENCIO] solo con la doble condición', () => {
  it('monosílabo tras un cierre sin pregunta → puede callar', () => {
    const h: Turno[] = [...HISTORIAL_JENNIFER, ella('gracias'), paula('A ti, Jennifer 💛')];
    expect(puedeCallar(h, '🙏')).toBe(true);
  });

  it('si el último mensaje de Paula preguntó algo → NO se calla', () => {
    const h: Turno[] = [...HISTORIAL_JENNIFER, paula('¿A qué correo te la mando?')];
    expect(puedeCallar(h, '🙏')).toBe(false);
  });

  it('si ella escribió algo con sustancia → NO se calla', () => {
    const h: Turno[] = [...HISTORIAL_JENNIFER, paula('A ti 💛')];
    expect(puedeCallar(h, 'es que anoche volvió a escribirme y no sé qué hacer')).toBe(false);
  });

  it.each(['🙏🙏', 'ok', 'Está bien', 'gracias 💛', 'Si'])('«%s» es monosílabo', (m) => {
    expect(esMonosilabo(m)).toBe(true);
  });

  it.each(['¿y cuánto vale?', 'no sé si pueda pagarlo', 'anoche me buscó otra vez'])(
    '«%s» NO es monosílabo',
    (m) => {
      expect(esMonosilabo(m)).toBe(false);
    },
  );
});

describe('v2 — handoff con prefill por motivo', () => {
  beforeEach(() => {
    process.env.PAULA_PROMPT = 'v2';
  });
  afterEach(() => {
    delete process.env.PAULA_PROMPT;
  });

  it('pide terapia → el wa.me lleva el prefill de terapia, no el genérico', () => {
    const p = buildSystemPrompt(USER, '', '+573001112233', {
      handoff: 'pide_humano',
      historial: HISTORIAL_JENNIFER,
      mensajeDeElla: 'el da terapia?',
    });
    expect(p).toContain('vengo%20de%20hablar%20con%20Paula');
    expect(p).toContain('consulta%20contigo');
  });
});
