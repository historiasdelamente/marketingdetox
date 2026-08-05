import { describe, it, expect } from 'vitest';

import {
  auditarRespuesta,
  instruccionCorreccion,
  instruccionHandoff,
  motivoHandoff,
} from '@/lib/whatsapp/blindaje';
import { APEGO_DETOX, precioApego, proximoEncuentro } from '@/lib/whatsapp/programa';
import { precioLocal } from '@/lib/whatsapp/moneda';
import { DOLORES_DENTRO, DOLORES_FUERA, buildSystemPrompt, preguntaEntradaPara } from '@/lib/whatsapp/paula';

// Viernes 31 de julio de 2026, 10:00 AM Colombia. El lanzamiento de Apego Detox
// está vivo (termina el 15 de agosto), así que el precio del día es $20.
const VIERNES_31 = new Date('2026-07-31T15:00:00Z');

// ---------------------------------------------------------------------------
// Escalón 2: Paula cerrando Apego Detox.
// ---------------------------------------------------------------------------

describe('blindaje — escalón de Apego Detox', () => {
  const auditar = (texto: string) => auditarRespuesta(texto, VIERNES_31, 'apego');

  it('no marca como error lo que AHORA es la verdad', () => {
    const buenos = [
      'Son *$20 USD al mes* y cancelas cuando quieras 💛',
      'En Apego Detox hay un módulo entero para eso, el 7 ✨',
      'Adentro tienes la comunidad y dos encuentros en vivo con Javier 💛',
    ];
    for (const bueno of buenos) {
      expect(auditar(bueno).hallazgos).toHaveLength(0);
    }
  });

  it('deja los tres links perfectos, escriba el modelo lo que escriba', () => {
    expect(auditar('Mírala aquí: historiasdelamente.com/apegodetox').texto).toContain(APEGO_DETOX.landing);
    expect(auditar('Entras aquí: www.historiasdelamente.com/apegodetox/').texto).toContain(APEGO_DETOX.landing);
    expect(auditar('Este es el pago: www.skool.com/historias-de-la-mente-4978/about').texto).toContain(APEGO_DETOX.checkout);
    expect(auditar('Escríbele: wa.me/573001681053').texto).toContain(APEGO_DETOX.whatsappJavier);
  });

  it('el link de Hotmart aquí es un error: Apego Detox solo se paga en Skool', () => {
    const { hallazgos } = auditar('Entras por aquí: https://pay.hotmart.com/W102751360L');
    expect(hallazgos.map((h) => h.tipo)).toContain('plataforma_cruzada');
    // Y la corrección le dice a dónde debía mandarla.
    expect(instruccionCorreccion(hallazgos, 'apego', VIERNES_31)).toContain(APEGO_DETOX.checkout);
  });

  it('le pone el apellido a Javier — ella no lo conoce', () => {
    // Sin apellido suena a un amigo de Paula, no al psicólogo de la clase.
    expect(auditar('Eso lo trabaja Javier contigo 💛').texto).toContain('Javier Vieira');
    // No lo duplica si ya venía bien.
    expect(auditar('Eso lo trabaja Javier Vieira contigo 💛').texto).not.toContain('Vieira Vieira');
    // Y no toca lo que va dentro del link (el wa.me lleva "Javier" precargado).
    const { texto } = auditar(`Escríbele: ${APEGO_DETOX.whatsappJavier}`);
    expect(texto).toContain(APEGO_DETOX.whatsappJavier);
  });

  it('convierte el número suelto de Javier en un link clicable', () => {
    for (const caso of ['Escríbele al +57 300 1681053', 'Su WhatsApp es 3001681053']) {
      const { texto } = auditar(caso);
      expect(texto).toContain(APEGO_DETOX.whatsappJavier);
      expect(texto).not.toMatch(/\b300\s?168\s?1053\b/);
    }
    expect(auditar('Son $20 al mes').texto).toContain('$20');
    expect(auditar(`Aquí: ${APEGO_DETOX.whatsappJavier}`).texto).toContain(APEGO_DETOX.whatsappJavier);
  });

  it('no deja inventar otro precio ni vender la suscripción como pago único', () => {
    expect(auditar('Son $25 al mes').hallazgos.map((h) => h.tipo)).toContain('precio_falso');
    // El precio viejo también es un error ahora.
    expect(auditar('Son $37.97 al mes').hallazgos.map((h) => h.tipo)).toContain('precio_falso');
    expect(auditar('Son $20, un solo pago').hallazgos.map((h) => h.tipo)).toContain('pago_unico');
    // El reencuadre honesto NO es un precio inventado.
    expect(auditar('Sale a poco más de medio dólar al día 💛').hallazgos).toHaveLength(0);
  });

  it('después del 15 de agosto el precio bueno pasa a ser $40', () => {
    const DIECISEIS = new Date('2026-08-16T15:00:00Z');
    expect(auditarRespuesta('Son $20 al mes', DIECISEIS, 'apego').hallazgos.map((h) => h.tipo)).toContain('precio_falso');
    expect(auditarRespuesta('Son $40 al mes 💛', DIECISEIS, 'apego').hallazgos).toHaveLength(0);
  });

  it('los encuentros son martes y jueves — cualquier otro día se marca', () => {
    expect(
      auditar('Las sesiones en vivo son los lunes y miércoles').hallazgos.map((h) => h.tipo),
    ).toContain('dia_encuentro_equivocado');

    // Pero decir qué día es HOY junto al próximo encuentro es correcto.
    expect(auditar('Hoy es viernes y el próximo encuentro con Javier es el martes 💛').hallazgos).toHaveLength(0);
  });

  it('no promete nada gratis', () => {
    expect(auditar('Te regalo el libro 💛').hallazgos.map((h) => h.tipo)).toContain('promesa_gratis');
    expect(auditar('Tienes un mes gratis para probarlo').hallazgos.map((h) => h.tipo)).toContain('promesa_gratis');
  });

  it('sigue sin dejarla hacer terapia por chat, pero el titular de la marca sí pasa', () => {
    expect(
      auditar('Eso es tu sistema nervioso pidiendo la dosis').hallazgos.map((h) => h.tipo),
    ).toContain('psicoeducacion');
    expect(auditar('No estás rota. Estás programada 💛').hallazgos).toHaveLength(0);
  });

  it('deja pasar los testimonios en video de alumnas reales', () => {
    const { texto, hallazgos } = auditar(
      'Mira a Danna, alumna del programa: https://d3734kf5tip0j0.cloudfront.net/danna+testimonio.mp4',
    );
    expect(texto).toContain('cloudfront.net');
    expect(hallazgos).toHaveLength(0);
  });

  it('no deja prometer un número de módulos que ella no va a encontrar', () => {
    expect(
      auditar('Hoy mismo te llegan los 15 módulos completos').hallazgos.map((h) => h.tipo),
    ).toContain('modulos_inventados');
    // 17 es lo que dice la página de Skool, verificado el 2026-08-05.
    expect(auditar('El aula tiene 17 módulos y el Súper Bonus 💛').hallazgos).toHaveLength(0);
  });

  it('no la deja pedir permiso para lo obvio', () => {
    for (const caso of ['¿Quieres que te cuente más?', '¿Te comparto el link?']) {
      expect(auditar(caso).hallazgos.map((h) => h.tipo)).toContain('pide_permiso');
    }
    expect(auditar('Te espero adentro 💛').hallazgos).toHaveLength(0);
  });

  it('la corrección le dice al modelo el precio del día y los días reales', () => {
    const { hallazgos } = auditar('Son $19 al mes, un solo pago, y las sesiones son los lunes');
    const texto = instruccionCorreccion(hallazgos, 'apego', VIERNES_31);
    expect(texto).toContain('$20 USD al mes');
    expect(texto).toContain('martes y jueves');
  });

  it('el folleto sigue prohibido: esto es WhatsApp', () => {
    const folleto =
      'Hola, soy Paula, del equipo de Javier. Apego Detox trae modulos de trabajo psicologico profundo, dos encuentros en vivo con Javier cada semana por Google Meet, la comunidad de mujeres en WhatsApp donde nadie te juzga, el Super Bonus con PDFs y ejercicios, acceso permanente al material y acompanamiento para cuando llegue la noche dificil. Todo eso por $20 al mes con 7 dias de garantia.';
    expect(auditar(folleto).hallazgos.map((h) => h.tipo)).toContain('demasiado_largo');
  });
});

// ---------------------------------------------------------------------------
// EL PRODUCTO RETIRADO — la clase del jueves (fuera desde el 2026-08-05).
//
// Es el candado más importante de esta tanda. El historial de TODA conversación
// viva está lleno de mensajes de Paula vendiendo la clase, y gpt-4.1-mini copia
// lo que ve arriba: sin esto, las mujeres que ya venían hablando con ella
// seguirían recibiendo "la clase del jueves a las 8" durante semanas.
// ---------------------------------------------------------------------------

describe('blindaje — la clase del jueves ya no se vende', () => {
  const auditar = (texto: string) => auditarRespuesta(texto, VIERNES_31, 'apego');

  it('nombrar la clase del jueves se marca', () => {
    expect(auditar('La clase del jueves es a las 8 💛').hallazgos.map((h) => h.tipo))
      .toContain('producto_retirado');
  });

  it('su nombre y su precio también', () => {
    expect(auditar('Se llama "Recuperando mi ser"').hallazgos.map((h) => h.tipo))
      .toContain('producto_retirado');
    expect(auditar('Son 25.000, pago único').hallazgos.map((h) => h.tipo))
      .toContain('producto_retirado');
  });

  it('el pago por Nequi se marca: Skool cobra con tarjeta', () => {
    // Dar un número de Nequi ahora es mandar a una mujer a transferirle plata a
    // alguien por su cuenta, por un producto que no se cobra así.
    expect(auditar('Mandas el pago por Nequi al 311 632 9202').hallazgos.map((h) => h.tipo))
      .toContain('producto_retirado');
  });

  it('un link de Hotmart es plataforma cruzada', () => {
    const { hallazgos } = auditar('Entra aquí: https://pay.hotmart.com/H106712135H');
    expect(hallazgos.map((h) => h.tipo)).toContain('plataforma_cruzada');
    expect(instruccionCorreccion(hallazgos, 'apego', VIERNES_31)).toContain(APEGO_DETOX.checkout);
  });

  it('la corrección le dice qué ofrecer en su lugar', () => {
    const { hallazgos } = auditar('Te espero el jueves en la clase');
    const correccion = instruccionCorreccion(hallazgos, 'apego', VIERNES_31);
    expect(correccion).toMatch(/ya NO se vende/i);
    expect(correccion).toMatch(/dos por semana/i);
    expect(correccion).toContain(APEGO_DETOX.checkout);
  });

  it('el día del taller se juzga en la zona de ELLA, no en la de Colombia', () => {
    // ⚠️ FALSO POSITIVO REAL, visto el 2026-08-05 hablando con el bot como una
    // mujer de Madrid: Paula le dijo —correctamente— "miércoles y viernes",
    // porque las 8 PM del martes en Colombia son las 3 AM del miércoles allí.
    // El blindaje se lo marcó como día inventado, y la corrección le habría
    // exigido decirle "martes y jueves": el día equivocado, cada semana.
    const enMadrid = ['miércoles', 'viernes'];
    const texto = 'Los talleres en vivo son los miércoles y viernes a las 3:00 AM para ti.';

    expect(auditarRespuesta(texto, VIERNES_31, 'apego', enMadrid).hallazgos.map((h) => h.tipo))
      .not.toContain('dia_encuentro_equivocado');

    // Y con los días de Colombia esa misma frase SÍ se marca, que es lo correcto
    // para una mujer que no cambia de día.
    expect(auditarRespuesta(texto, VIERNES_31, 'apego').hallazgos.map((h) => h.tipo))
      .toContain('dia_encuentro_equivocado');
  });

  it('la corrección le dice los días de ELLA, no los de Colombia', () => {
    const { hallazgos } = auditarRespuesta('Los talleres son los lunes', VIERNES_31, 'apego', [
      'miércoles',
      'viernes',
    ]);
    expect(instruccionCorreccion(hallazgos, 'apego', VIERNES_31, ['miércoles', 'viernes']))
      .toContain('miércoles y viernes');
  });

  it('hablar de los talleres en vivo NO es un error', () => {
    // "clase" a secas es legítimo: lo prohibido es la CLASE como producto suelto.
    expect(auditar('Son dos talleres en vivo cada semana con Javier Vieira 💛').hallazgos)
      .toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Los cinco casos que pasan a Javier.
// ---------------------------------------------------------------------------

describe('handoff a Javier — los cinco casos', () => {
  it('pide hablar con él', () => {
    expect(motivoHandoff('quiero hablar con Javier')).toBe('pide_humano');
    expect(motivoHandoff('me pasas el número de Javier?')).toBe('pide_humano');
    expect(motivoHandoff('quiero una cita con Javier')).toBe('pide_humano');
    expect(motivoHandoff('hacen terapia individual?')).toBe('pide_humano');
    // Contarle algo a Paula NO es pedir un humano.
    expect(motivoHandoff('quiero hablar contigo de lo que me pasa')).toBeNull();
  });

  it('cerró la venta', () => {
    expect(motivoHandoff('ya pagué')).toBe('compra_cerrada');
    expect(motivoHandoff('acabo de inscribirme 💛')).toBe('compra_cerrada');
    const instruccion = instruccionHandoff('compra_cerrada', 'apego');
    expect(instruccion).toContain(APEGO_DETOX.whatsappJavier);
    expect(instruccion).toContain('Cero venta');
  });

  it('mandó el comprobante', () => {
    expect(motivoHandoff('te mando el comprobante')).toBe('recibo_pago');
    expect(motivoHandoff('aquí está el pantallazo del pago')).toBe('recibo_pago');
    expect(instruccionHandoff('recibo_pago', 'apego')).toContain('no verificas pagos');
  });

  it('no tiene tarjeta', () => {
    expect(motivoHandoff('no tengo tarjeta de crédito')).toBe('sin_tarjeta');
    expect(motivoHandoff('puedo pagar de otra forma?')).toBe('sin_tarjeta');
    expect(instruccionHandoff('sin_tarjeta', 'apego')).toContain('No inventes formas de pago');
  });

  it('un fallo de pago pesa más que un "ya pagué"', () => {
    // "ya pagué y no me llegó" empieza como un cierre feliz y es lo contrario.
    expect(motivoHandoff('ya pagué y no me llegó el acceso')).toBe('problema_pago');
    expect(motivoHandoff('el link no me deja pagar')).toBe('problema_pago');
    expect(motivoHandoff('la página no carga')).toBe('problema_pago');
  });

  it('una objeción de venta NO es un problema de pago', () => {
    // Este falso positivo la sacaba del embudo.
    expect(motivoHandoff('y si no me funciona? ya intenté de todo')).toBeNull();
    expect(motivoHandoff('no sé si esto me sirve a mí')).toBeNull();
  });
});

describe('reloj de los encuentros en vivo con Javier', () => {
  it('apunta siempre al próximo martes o jueves, nunca a otro día', () => {
    expect(proximoEncuentro(VIERNES_31).fecha).toBe('martes 4 de agosto');

    const martesTemprano = proximoEncuentro(new Date('2026-08-04T15:00:00Z'));
    expect(martesTemprano.frase).toBe('es HOY');
    expect(martesTemprano.enVivo).toBe(false);

    expect(proximoEncuentro(new Date('2026-08-05T01:30:00Z')).enVivo).toBe(true);
    expect(proximoEncuentro(new Date('2026-08-05T03:30:00Z')).fecha).toBe('jueves 6 de agosto');
  });
});

// ---------------------------------------------------------------------------
// El prompt que de verdad recibe el modelo en cada mensaje.
// ---------------------------------------------------------------------------

describe('el prompt que se arma en cada turno', () => {
  const usuaria = {
    id: 1,
    manychat_id: '999',
    name: null,
    funnel_stage: 'new_lead',
    situacion_resumen: null,
    first_contact: '',
    last_interaction: '',
    conversation_count: 0,
  };

  // Un número de México: de ahí salen su hora y su zona, sin preguntarle nada.
  const prompt = (escalon: 'apego' = 'apego') =>
    buildSystemPrompt(usuaria, 'tiktok_live', '+521234567890', { ahora: VIERNES_31, escalon });

  it('por defecto, y siempre, ofrece Apego Detox', () => {
    const porDefecto = buildSystemPrompt(usuaria, '', '', { ahora: VIERNES_31 });
    expect(porDefecto).toContain('OFRECES: APEGO DETOX');
  });

  it('lleva el precio del día, su plataforma y el link de Skool', () => {
    const p = prompt();
    expect(p).toContain('OFRECES: APEGO DETOX');
    expect(p).toContain(APEGO_DETOX.checkout);
    expect(p).toContain(precioApego(VIERNES_31).frase);
    expect(p).toContain('LANZAMIENTO VIVO');
  });

  it('no ofrece la clase del jueves por ninguna parte', () => {
    const p = prompt();
    expect(p).toMatch(/Ya NO existe "la clase del jueves"/i);
    expect(p).not.toContain('pay.hotmart.com');
    expect(p).not.toContain('/volver-a-mi');
  });

  it('los EJEMPLOS dicen el mismo precio local que los datos duros', () => {
    // ⚠️ REGRESIÓN REAL (2026-08-05). Los ejemplos del prompt llevaban "unos
    // 80.000 pesos" escrito a mano mientras el bloque de datos duros, con la
    // tasa del día, decía 65.000. Dos cifras distintas en el mismo prompt — y
    // mini copia los ejemplos antes que los datos, así que a una mujer de
    // Bogotá le habría dicho un precio inventado un 23% más alto.
    const TASAS = { USD: 1, COP: 4000 };
    const p = buildSystemPrompt(usuaria, '', '+573001112233', { ahora: VIERNES_31, tasas: TASAS });

    expect(p).toContain('unos 80.000 COP');
    // Y ninguna otra cifra en pesos: si aparece una segunda, es una escrita a mano.
    const enPesos = [...p.matchAll(/unos [\d.]+ COP/g)].map((m) => m[0]);
    expect(new Set(enPesos).size).toBe(1);
  });

  it('NINGUNA cifra local escrita a mano sobrevive en todo el prompt', () => {
    // ⚠️ BUG REAL, cazado el 2026-08-05 probando el bot como una mujer de Chile:
    // le dijo "unos 80.000 pesos" — la cifra COLOMBIANA — cuando a ella le
    // corresponden unos 20.000. Cuatro veces el precio. El número estaba escrito
    // a mano en PAULA-CONOCIMIENTO.md y el modelo lo copió tal cual.
    //
    // Este test mira el prompt ENTERO (prompt + documento de conocimiento) y
    // exige que la ÚNICA cifra local que aparezca sea la calculada para ELLA.
    const TASAS = { USD: 1, CLP: 950 };
    const p = buildSystemPrompt(usuaria, '', '+56912345678', { ahora: VIERNES_31, tasas: TASAS });

    const suya = precioLocal(20, 'CLP', TASAS).frase; // "unos 20.000 CLP"
    expect(p).toContain(suya);

    // Cualquier otra cantidad con pinta de precio local es una escrita a mano.
    const sospechosas = [...p.matchAll(/\b\d{1,3}\.\d{3}\b/g)].map((m) => m[0]);
    expect(
      sospechosas.filter((n) => !suya.includes(n)),
      'hay cifras locales a mano en el prompt o en PAULA-CONOCIMIENTO.md',
    ).toEqual([]);
  });

  it('sin país ni tasas, los ejemplos se quedan solo con los dólares', () => {
    const p = buildSystemPrompt(usuaria, '', '', { ahora: VIERNES_31 });
    expect(p).not.toMatch(/unos [\d.]+ (COP|MXN|EUR)/);
    expect(p).toContain('20 dólares al mes');
  });

  it('le da la forma canónica para cuando ella pida terapia por chat', () => {
    // Dictada por Javier el 2026-08-05: te escuché → eso se trabaja adentro →
    // ahí hay más mujeres. Nada de explicarle el mecanismo.
    const p = prompt();
    expect(p).toMatch(/Te entiendo\. Eso es justo lo que se trabaja adentro/);
    expect(p).toMatch(/no vas a estar sola/i);
  });

  it('lleva las reglas de estilo y el conocimiento del documento', () => {
    const p = prompt('apego');
    // El prompt se reescribió de cero el 2026-08-02: ya no es un reglamento de
    // prohibiciones, arranca por QUIÉN ES ELLA. Lo que se exige aquí es que
    // sigan estando las cuatro piezas que sostienen todo lo demás.
    expect(p).toContain('QUIÉN TE ESCRIBE');
    expect(p).toContain('CÓMO ESCRIBES');
    expect(p).toContain('LO QUE NO HACES NUNCA');
    expect(p).toContain('LO QUE PAULA NO PUEDE DECIR NUNCA');
    expect(p).toContain('CUÁNDO PASA A JAVIER');
  });

  // El primer turno recibe un prompt DISTINTO. No es una regla más dentro del
  // mismo texto: pedírselo no bastaba, mini soltaba el precio igual porque lo
  // tenía renderizado ahí mismo. La única forma de que no lo mande es que no
  // lo vea.
  const entrada = () =>
    buildSystemPrompt(usuaria, '', '+573001112233', {
      ahora: VIERNES_31,
      escalon: 'apego',
      esPrimerTurno: true,
    });

  it('en el PRIMER turno solo va la entrada: sin dolores, sin precio, sin link', () => {
    const p = entrada();
    expect(p).toContain('ES TU PRIMER MENSAJE');
    // La pregunta de segmentación ya no va en el primer mensaje, pero sí se le
    // deja guardada para el siguiente: de ella depende qué dolor se le nombra.
    expect(p).toContain(preguntaEntradaPara(usuaria.manychat_id));
    expect(p).not.toContain('YA TE CONTESTÓ');
    // El link sí sigue en el bloque del reloj (es la fuente de verdad y el
    // blindaje lo repara), pero la entrada lo tiene prohibido explícitamente.
    expect(p).toContain('Aquí NO va:');
  });

  it('la entrada pregunta su nombre — es lo que la hace contestar', () => {
    // Se contesta en tres palabras, así que casi todas contestan; y una
    // conversación que arrancó es media venta. Además deja el nombre para
    // tratarla como persona en los turnos siguientes.
    expect(entrada()).toMatch(/¿Cómo te llamas/);
  });

  it('si no sabe su país, se lo pregunta en la entrada — de ahí sale su moneda', () => {
    const sinTelefono = buildSystemPrompt(usuaria, '', '', {
      ahora: VIERNES_31,
      esPrimerTurno: true,
    });
    expect(sinTelefono).toMatch(/desde qué país me escribes/i);
  });

  it('del SEGUNDO turno en adelante ya no aparece la entrada', () => {
    const p = prompt();
    expect(p).not.toContain('ES TU PRIMER MENSAJE');
    expect(p).toContain('YA TE CONTESTÓ');
    expect(p).toContain(APEGO_DETOX.checkout);
  });

  // ⚠️ 2026-08-03: esta prueba comprobaba lo contrario — que el prompt trajera
  // las DOS listas de cuatro dolores. Ahora trae UN dolor de cada banco y en
  // prosa, y eso no es cosmética: con cuatro delante, mini los pone en columna
  // por mucho que se le prohíba. Con uno, lo único que puede hacer es escribir
  // una frase. Si algún día vuelve a aparecer un "•" aquí, vuelve el folleto.
  it('NO le pone ni una viñeta delante al modelo — es lo que la hacía copiarlas', () => {
    // El "•" es el carácter exacto que Paula copiaba al chat, así que es el que
    // no puede aparecer en ninguna parte de lo que ella lee.
    for (const p of [prompt(), entrada()]) {
      expect(p).not.toContain('•');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EL BANCO DE PREGUNTAS DE ENTRADA
  //
  // Es la única frase que ella lee antes de decidir si contesta o se va, y es
  // la más fácil de estropear después: alguien pega una que "suena bien" y se
  // lleva por delante una regla que costó una auditoría entera descubrir. Esto
  // no juzga si la frase vende —eso no lo puede medir un test— sino que ninguna
  // rompa lo que no se puede romper.
  // ═══════════════════════════════════════════════════════════════════════════
  describe('el banco de preguntas de entrada', () => {
    // Un ID cualquiera devuelve una del banco; recorriendo muchos salen todas.
    const banco = [...new Set(
      Array.from({ length: 200 }, (_, i) => preguntaEntradaPara(`mujer-${i}`)),
    )];

    it('todas caben en un globo de WhatsApp y son una pregunta', () => {
      for (const q of banco) {
        expect(q.length, `«${q}» tiene ${q.length} caracteres`).toBeLessThanOrEqual(160);
        // Antes se exigía que TERMINARAN en "?". Dejó de valer el 2026-08-05:
        // las preguntas nuevas cierran con "las dos se trabajan aquí" DESPUÉS
        // de preguntar, para que su respuesta desemboque en la oferta en vez de
        // quedar en el aire. Lo que sigue siendo obligatorio es que pregunten.
        expect(q, `«${q}» no le pregunta nada`).toMatch(/¿[^?]+\?/);
      }
    });

    it('todas preguntan por lo que ELLA QUIERE, no por lo que le pasó', () => {
      // Es la corrección de fondo de Javier: una pregunta sobre su vida privada
      // la invita a desahogarse, y en cuanto se desahoga espera terapia gratis.
      // Se va satisfecha y no compra. La pregunta mira al futuro, no a la herida.
      for (const q of banco) {
        expect(q, `«${q}» le pregunta por su intención`).toMatch(/quieres|interesa|buscas/i);
        expect(q, `«${q}» la pone a contar su caso`).not.toMatch(
          /cu[ée]ntame|qu[ée]\s+te\s+(pasa|est[áa]\s+pasando|pas[óo])|c[óo]mo\s+(est[áa]s|te\s+sientes)|hace\s+cu[áa]nto/i,
        );
      }
    });

    it('todas segmentan: de la respuesta sale si sigue con él o ya salió', () => {
      // De eso depende cuál de los dos bancos de dolores se usa después.
      for (const q of banco) {
        expect(q, `«${q}» no bifurca`).toMatch(/,\s*o\s+|\bo\s+ya\b|\bo\s+todav[íi]a\b/i);
      }
    });

    it('ninguna la deja colgada: le dicen que las dos salidas se trabajan aquí', () => {
      for (const q of banco) {
        expect(q, `«${q}» no cierra la puerta hacia la oferta`).toMatch(/se\s+trabaja/i);
      }
    });

    it('ninguna diagnostica a su pareja — a él nadie lo ha evaluado', () => {
      // Nombrar el tema en abstracto se puede; decirle que SU hombre es
      // narcisista es lo que expone legalmente al psicólogo.
      for (const q of banco) {
        expect(q, `«${q}» le diagnostica el marido`).not.toMatch(
          /\b(tu|su)\s+(pareja|esposo|marido|novio|ex)\s+(es|era)\b|\bes\s+un\s+narcisista\b|\bnarcisista\s+que\s+tienes\b/i,
        );
      }
    });

    it('ninguna la diagnostica a ella, ni le dice qué hacer con su vida', () => {
      for (const q of banco) {
        expect(q, `«${q}» la diagnostica`).not.toMatch(
          /\b(tienes|sufres|padeces)\s+(ansiedad|depresi[óo]n|trauma|dependencia)|trauma\s+bonding|codependen/i,
        );
        // "déjalo" como consejo. "querer dejarlo" (algo que ella ya quiere) sí vale.
        expect(q, `«${q}» le dice qué hacer`).not.toMatch(
          /\b(d[ée]jalo|ya\s+es\s+hora\s+de\s+dejarlo|den[úu]ncialo|vuelve\s+con\s+[ée]l|m[úu]date)\b/i,
        );
        expect(q, `«${q}» usa "loca"`).not.toMatch(/\bloca\b/i);
      }
    });

    it('ninguna suena a coach, a vendedor ni a formulario', () => {
      for (const q of banco) {
        expect(q, `«${q}» suena a coach`).not.toMatch(
          /\b(sanar|sanaci[óo]n|empoderar|tu\s+mejor\s+versi[óo]n|reinventar|merecerte|brillar|guerrera|reina|tu\s+proceso|transformaci[óo]n|abundancia)\b/i,
        );
        expect(q, `«${q}» suena a vendedor`).not.toMatch(
          /\b(oferta|promoci[óo]n|aprovecha|no\s+te\s+lo\s+pierdas|cupos?|inversi[óo]n|oportunidad\s+[úu]nica)\b/i,
        );
        expect(q, `«${q}» es un formulario`).not.toMatch(
          /en\s+qu[ée]\s+te\s+puedo\s+ayudar|cu[ée]ntame\s+tu\s+caso|qu[ée]\s+te\s+est[áa]\s+pasando|qu[ée]\s+es\s+lo\s+que\s+m[áa]s\s+te\s+pesa/i,
        );
      }
    });

    it('ninguna psicoeduca ni promete un resultado', () => {
      for (const q of banco) {
        expect(q, `«${q}» psicoeduca`).not.toMatch(
          /dopamina|cortisol|sistema\s+nervioso|refuerzo\s+intermitente|no\s+es\s+amor,?\s+es/i,
        );
        expect(q, `«${q}» promete resultado`).not.toMatch(
          /\bvas\s+a\s+(sanar|estar\s+bien|lograrlo)\b|en\s+\d+\s+(d[íi]as|semanas|meses)/i,
        );
      }
    });

    it('hay más de una: mil mujeres no pueden recibir la misma frase', () => {
      expect(banco.length).toBeGreaterThanOrEqual(3);
    });

    it('cada una ofrece las dos salidas, para que su respuesta diga si él sigue ahí', () => {
      // Es el requisito que más se falla. Una pregunta de sí/no sobre una
      // conducta ("¿todavía te pasa?") no sirve: la que salió hace ocho meses y
      // todavía relee sus mensajes contesta "sí" y el sistema le manda el dolor
      // de la que sigue adentro. Tiene que haber DOS ramas.
      for (const q of banco) {
        expect(q, `«${q}» no bifurca: un "no" seco deja a Paula sin siguiente movimiento`).toMatch(/,\s*o\b/);
      }
    });

    // ⚠️ La pregunta de entrada y el banco de dolores salen del mismo material,
    // así que se pisan: la entrada dice "borras la mitad para que no suene mal"
    // y el banco tiene "lo lees tres veces y borras la mitad para que no suene
    // mal". Como se eligen con la MISMA semilla, a una misma mujer le tocaban
    // las dos y en el mensaje 2 le llegaba calcada la frase del mensaje 1.
    it('el dolor del mensaje 2 nunca repite la imagen de la pregunta de entrada', () => {
      const trios = (t: string) => {
        const p = t
          .toLowerCase()
          .replace(/[áéíóúüñ]/g, (c) => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n' })[c] ?? c)
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(Boolean);
        const out = new Set<string>();
        for (let i = 0; i + 2 < p.length; i++) {
          const trio = [p[i], p[i + 1], p[i + 2]];
          if (trio.some((w) => w.length >= 5)) out.add(trio.join(' '));
        }
        return out;
      };

      for (let i = 0; i < 300; i++) {
        const id = `mujer-${i}`;
        const p = buildSystemPrompt({ ...usuaria, manychat_id: id }, '', '+573001112233', {
          ahora: VIERNES_31,
          escalon: 'apego',
        });
        const pregunta = preguntaEntradaPara(id);
        const dolores = [...DOLORES_DENTRO, ...DOLORES_FUERA].filter((d) => p.includes(d));

        for (const dolor of dolores) {
          const compartidos = [...trios(dolor)].filter((t) => trios(pregunta).has(t));
          expect(
            compartidos,
            `${id}: el dolor «${dolor}» repite «${compartidos.join(', ')}» de su pregunta de entrada`,
          ).toHaveLength(0);
        }
      }
    });

    it('ninguna invita ni suelta precio o link', () => {
      // Es enganche. El programa, el precio y el link son del mensaje siguiente.
      for (const q of banco) {
        expect(q, `«${q}» invita antes de tiempo`).not.toMatch(
          /te\s+espero|25\.000|120\s+pesos|\d+\s*usd|https?:\/\//i,
        );
      }
    });

    it('ninguna nombra la clase retirada', () => {
      for (const q of banco) {
        expect(q, `«${q}» nombra un producto que ya no existe`).not.toMatch(/clase|jueves/i);
      }
    });
  });

  it('la regla de forma va escrita con números, no como una sugerencia', () => {
    const p = prompt();
    expect(p).toContain('Máximo TRES mensajes');
    expect(p).toContain('160 caracteres');
    expect(p).toContain('Nunca una lista');
  });

  it('le da UN dolor de cada banco, en prosa, y le dice cuál usar', () => {
    const p = prompt();
    expect(p).toContain('si TODAVÍA está con él');
    expect(p).toContain('si YA lo dejó');
    expect(p).toContain('nunca en lista');
    // Exactamente uno de cada banco: si aparecieran dos, vuelve la columna.
    const dentro = DOLORES_DENTRO.filter((d) => p.includes(d));
    const fuera = DOLORES_FUERA.filter((d) => p.includes(d));
    expect(dentro).toHaveLength(1);
    expect(fuera).toHaveLength(1);
  });

  it('si no sabe el país lo pregunta, y dice que es para darle su moneda', () => {
    // Ya no es para saber si le toca Nequi o tarjeta: es para el precio en la
    // moneda con la que ella cuenta el dinero, que es lo que la hace decidirse.
    const sinPais = buildSystemPrompt(usuaria, '', '', { ahora: VIERNES_31 });
    expect(sinPais).toMatch(/Todavía no sabes de qué país te escribe/);
    expect(sinPais).toContain('es para decirte cuánto te queda a ti');

    // Y si el número ya lo dice, no se lo pregunta: eso delata al formulario.
    const conPais = buildSystemPrompt(usuaria, '', '+573001112233', { ahora: VIERNES_31 });
    expect(conPais).toContain('no se lo preguntes');
  });

  it('si ya sabe su nombre, le dice que lo use y que no lo vuelva a preguntar', () => {
    const conNombre = { ...usuaria, name: 'Marcela' };
    const p = buildSystemPrompt(conNombre, '', '+573001112233', { ahora: VIERNES_31 });
    expect(p).toContain('SE LLAMA MARCELA');
    expect(p).toMatch(/no se lo vuelvas a preguntar/i);
  });

  it('lo que ella contó en conversaciones anteriores entra al prompt', () => {
    // El historial son los últimos 20 mensajes: una mujer que vuelve tres
    // semanas después ya no está ahí, y sin esto Paula la trata como nueva
    // después de que le contó nueve años de su vida.
    const conMemoria = {
      ...usuaria,
      situacion_resumen: 'Lleva 9 años con él, no duerme, la frena el dinero.',
    };
    const p = buildSystemPrompt(conMemoria, '', '', { ahora: VIERNES_31 });
    expect(p).toContain('LO QUE YA TE CONTÓ');
    expect(p).toContain('Lleva 9 años con él');
    expect(p).toMatch(/para no hacerla repetir nada/i);
  });

  it('a dos mujeres distintas les toca un dolor distinto', () => {
    // Con un dolor fijo, mini se lo copia igual a todas y se nota el bot.
    const dolores = (id: string) => {
      const p = buildSystemPrompt({ ...usuaria, manychat_id: id }, '', '', { ahora: VIERNES_31 });
      return DOLORES_DENTRO.filter((d) => p.includes(d)).join('|');
    };
    expect(dolores('mujer-a')).not.toBe(dolores('mujer-b'));
  });

  it('a quien todavía no ha entrado NO le da la fecha del próximo taller', () => {
    // Los talleres del martes y jueves son de las que ya están adentro.
    // Citar a una fecha a la que no puede entrar es prometerle lo que no tiene.
    const p = prompt();
    expect(p).not.toContain('martes 4 de agosto');
    expect(p).toMatch(/Lo que NO le das es la FECHA del próximo/);
    // Pero sí sabe QUÉ incluye el programa, el horario EN SU HORA, y su país.
    expect(p).toContain('4 horas de acompañamiento cada semana');
    expect(p).toContain('martes y jueves, 7:00 PM');
    expect(p).toContain('ELLA TE ESCRIBE DESDE: México');
  });

  it('a la que ya está adentro sí le entrega el reloj de sus talleres', () => {
    const miembro = { ...usuaria, funnel_stage: 'compradora' };
    const p = buildSystemPrompt(miembro, '', '+521234567890', { ahora: VIERNES_31, escalon: 'apego' });
    expect(p).toContain('martes 4 de agosto');
    expect(p).toContain('SU PRÓXIMO ENCUENTRO EN VIVO');
  });

  it('ya no queda nada que anular: el prompt no se contradice a sí mismo', () => {
    // El bloque viejo tenía que decir "más abajo dice 15 módulos: ANULADO".
    for (const p of [prompt()]) {
      expect(p).not.toContain('ANULADO');
      expect(p).not.toContain('15 módulos');
    }
  });
});
