import { describe, it, expect } from 'vitest';

import {
  auditarRespuesta,
  instruccionCorreccion,
  instruccionHandoff,
  motivoHandoff,
} from '@/lib/whatsapp/blindaje';
import { APEGO_DETOX, CLASE_JUEVES, precioApego, proximoEncuentro } from '@/lib/whatsapp/programa';
import { buildSystemPrompt } from '@/lib/whatsapp/paula';

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
    expect(auditar('El aula tiene 16 módulos y el Súper Bonus 💛').hallazgos).toHaveLength(0);
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
// Escalón 1: la clase del jueves.
// ---------------------------------------------------------------------------

describe('blindaje — escalón de la clase del jueves', () => {
  const auditar = (texto: string) => auditarRespuesta(texto, VIERNES_31, 'clase');

  it('la clase es pago único: hablar de mensualidades aquí es un error', () => {
    expect(auditar('Son 7 USD al mes').hallazgos.map((h) => h.tipo)).toContain('mensualidad_en_clase');
    expect(auditar('Son *7 USD*, un solo pago 💛').hallazgos).toHaveLength(0);
  });

  it('un link de pago suelto se cambia por la página', () => {
    // Pedirle la tarjeta antes de contarle a qué la invitan es perderla.
    // El botón de pago está DENTRO de la página.
    const { texto } = auditar('Entra aquí: https://pay.hotmart.com/H106712135H');
    expect(texto).toContain(CLASE_JUEVES.landing);
    expect(texto).not.toContain('pay.hotmart.com');
  });

  it('el link de Skool aquí es un error: la clase se paga en Hotmart', () => {
    const { hallazgos } = auditar('Entras aquí: https://www.skool.com/historias-de-la-mente-4978/about');
    expect(hallazgos.map((h) => h.tipo)).toContain('plataforma_cruzada');
    expect(instruccionCorreccion(hallazgos, 'clase', VIERNES_31)).toContain(CLASE_JUEVES.checkout);
  });

  it('no promete los módulos de Apego Detox como parte de la clase', () => {
    expect(
      auditar('Te llevas los 16 módulos del programa').hallazgos.map((h) => h.tipo),
    ).toContain('contenido_de_otro_producto');
  });

  it('no promete la grabación mientras no esté confirmada', () => {
    expect(auditar('Tranquila, queda grabada y la ves después').hallazgos.map((h) => h.tipo)).toContain(
      'grabacion_inexistente',
    );
    // Decir que NO queda grabada sí se permite.
    expect(auditar('Es en vivo, no queda grabada 💛').hallazgos).toHaveLength(0);
  });

  it('nombrar Apego Detox ya NO es un error — la escalera lo permite', () => {
    // Con las reglas viejas esto marcaba fallo y quemaba un reintento por turno.
    expect(auditar('Después de la clase hay un programa completo, Apego Detox ✨').hallazgos).toHaveLength(0);
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
  const prompt = (escalon: 'clase' | 'apego') =>
    buildSystemPrompt(usuaria, 'tiktok_live', '+521234567890', { ahora: VIERNES_31, escalon });

  it('por defecto ofrece la clase — es el escalón de entrada', () => {
    const porDefecto = buildSystemPrompt(usuaria, '', '', { ahora: VIERNES_31 });
    expect(porDefecto).toContain('OFRECES: LA CLASE DEL JUEVES');
  });

  it('en el escalón de la clase no le mete encima el material de Apego Detox', () => {
    const p = prompt('clase');
    expect(p).toContain('OFRECES: LA CLASE DEL JUEVES');
    // El link que lleva es la página, nunca el checkout suelto.
    expect(p).toContain(CLASE_JUEVES.landing);
    expect(p).not.toContain(CLASE_JUEVES.checkout);
    // Sabe que Apego Detox existe (para reconocerlo si ella pregunta)…
    expect(p).toContain('QUÉ ES APEGO DETOX');
    // …pero no lleva su precio ni su checkout encima.
    expect(p).not.toContain(APEGO_DETOX.checkout);
  });

  it('en el escalón de Apego Detox lleva el precio del día y su plataforma', () => {
    const p = prompt('apego');
    expect(p).toContain('OFRECES: APEGO DETOX');
    expect(p).toContain(APEGO_DETOX.checkout);
    expect(p).toContain(precioApego(VIERNES_31).frase);
    expect(p).toContain('LANZAMIENTO VIVO');
  });

  it('lleva las reglas de estilo y el conocimiento del documento', () => {
    const p = prompt('apego');
    // El prompt se reescribió de cero el 2026-08-02: ya no es un reglamento de
    // prohibiciones, arranca por QUIÉN ES ELLA. Lo que se exige aquí es que
    // sigan estando las cuatro piezas que sostienen todo lo demás.
    expect(p).toContain('A QUIÉN LE ESTÁS ESCRIBIENDO');
    expect(p).toContain('LO QUE NO HACES NUNCA');
    expect(p).toContain('LO QUE PAULA NO PUEDE DECIR NUNCA');
    expect(p).toContain('CUÁNDO PASA A JAVIER');
  });

  // El primer turno recibe un prompt DISTINTO. No es una regla más dentro del
  // mismo texto: pedírselo no bastaba, mini mandaba las viñetas igual porque
  // las tenía renderizadas ahí mismo. La única forma de que no las mande es
  // que no las vea.
  const entrada = () =>
    buildSystemPrompt(usuaria, '', '+573001112233', {
      ahora: VIERNES_31,
      escalon: 'clase',
      esPrimerTurno: true,
    });

  it('en el PRIMER turno solo va la entrada: sin viñetas, sin precio, sin link', () => {
    const p = entrada();
    expect(p).toContain('ESTE ES TU PRIMER MENSAJE');
    expect(p).toContain('¿Todavía estás con él, o ya lo dejaste?');
    // Las viñetas NO pueden estar: lo que el modelo ve, lo usa.
    expect(p).not.toMatch(/^• .+$/m);
    expect(p).not.toContain('YA TE CONTESTÓ');
    // El link sí sigue en el bloque del reloj (es la fuente de verdad y el
    // blindaje lo repara), pero la entrada lo tiene prohibido explícitamente.
    expect(p).toContain('En este mensaje NO va:');
  });

  it('del SEGUNDO turno en adelante ya no aparece la entrada', () => {
    const p = prompt('clase');
    expect(p).not.toContain('ESTE ES TU PRIMER MENSAJE');
    expect(p).toContain('YA TE CONTESTÓ');
    expect(p).toMatch(/^• .+$/m);
    expect(p).toContain(CLASE_JUEVES.landing);
  });

  it('lleva las DOS listas de dolores, la de adentro y la de afuera', () => {
    // A la que sigue viviendo con él, "revisas su última conexión" no le dice
    // nada: él duerme al lado. Mandarle la lista equivocada le confirma que
    // esto es un mensaje en serie.
    const p = prompt('clase');
    expect(p).toContain('SI TODAVÍA ESTÁ CON ÉL');
    expect(p).toContain('SI YA LO DEJÓ');
    expect(p).toContain('No las mezcles');
  });

  it('si no sabe el país, lo pregunta en el mensaje 2 y dice para qué', () => {
    // De ahí sale si le toca Nequi o tarjeta. Sin teléfono no hay país.
    const sinPais = buildSystemPrompt(usuaria, '', '', { ahora: VIERNES_31, escalon: 'clase' });
    expect(sinPais).toContain('NO sabes de qué país te escribe');
    expect(sinPais).toContain('es para decirte cómo pagas');

    // Y si el número ya lo dice, no se lo pregunta: eso delata al formulario.
    const conPais = buildSystemPrompt(usuaria, '', '+573001112233', { ahora: VIERNES_31, escalon: 'clase' });
    expect(conPais).toContain('no se lo preguntes');
  });

  it('a dos mujeres distintas les toca una lista de dolores distinta', () => {
    // Con una lista fija, mini se la copia igual a todas y se nota el bot.
    const vinetas = (id: string) =>
      buildSystemPrompt({ ...usuaria, manychat_id: id }, '', '', { ahora: VIERNES_31 })
        .split('\n')
        .filter((l) => l.startsWith('• '))
        .join('|');
    expect(vinetas('mujer-a')).not.toBe(vinetas('mujer-b'));
  });

  it('a quien todavía no ha entrado NO le da la fecha del próximo encuentro', () => {
    // Los encuentros del martes y jueves son de las que ya están adentro.
    // Citar a una fecha a la que no puede entrar es prometerle lo que no tiene.
    const p = prompt('apego');
    expect(p).not.toContain('martes 4 de agosto');
    expect(p).toContain('NO le des la fecha del próximo encuentro');
    // Pero sí sabe QUÉ incluye el programa, y su hora local.
    expect(p).toContain('DOS encuentros en vivo con Javier cada semana');
    expect(p).toContain('ELLA TE ESCRIBE DESDE: México');
  });

  it('a la que ya está adentro sí le entrega el reloj de sus encuentros', () => {
    const miembro = { ...usuaria, funnel_stage: 'compradora' };
    const p = buildSystemPrompt(miembro, '', '+521234567890', { ahora: VIERNES_31, escalon: 'apego' });
    expect(p).toContain('martes 4 de agosto');
    expect(p).toContain('SU PRÓXIMO ENCUENTRO EN VIVO');
  });

  it('en la clase del jueves no se nombran los encuentros del programa', () => {
    const p = prompt('clase');
    expect(p).not.toContain('martes 4 de agosto');
    expect(p).toContain('NO nombres los encuentros en vivo de los martes y jueves');
  });

  it('en la clase le entrega el próximo jueves, no una fecha escrita a mano', () => {
    expect(prompt('clase')).toContain('jueves 6 de agosto');
  });

  it('ya no queda nada que anular: el prompt no se contradice a sí mismo', () => {
    // El bloque viejo tenía que decir "más abajo dice 15 módulos: ANULADO".
    for (const p of [prompt('clase'), prompt('apego')]) {
      expect(p).not.toContain('ANULADO');
      expect(p).not.toContain('15 módulos');
    }
  });
});
