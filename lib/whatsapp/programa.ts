// ============================================================================
// PROGRAMA — LOS DOS PRODUCTOS Y TODO LO QUE SE CALCULA
//
// Reemplaza a `apego-detox.ts` + `contexto-clase.ts` como fuente de datos duros.
// Aquí vive SOLO lo que el modelo no puede deducir: precios, links, y las fechas
// que cambian solas. Lo que Paula *dice* vive en content/PAULA-CONOCIMIENTO.md.
//
// LA REGLA: si se puede calcular, se calcula aquí y se le entrega resuelto.
// El modelo no sabe qué día es hoy, ni desde dónde escribe ella, ni si el
// lanzamiento sigue vivo. Cada vez que se lo dejamos deducir, inventa.
//
// EL ORDEN DE VENTA (la escalera): primero la clase del jueves, y solo se sube
// a Apego Detox cuando ELLA lo pide.
// ============================================================================

import { PAISES, TZ_COLOMBIA, detectarPais, diasDeCalendario, fechaISO, fechaLarga, hora12 } from './contexto-clase';
import type { Escalon } from './escalera';

/** Colombia no tiene horario de verano: -05:00 vale todo el año. */
const OFFSET_COLOMBIA = '-05:00';

// ---------------------------------------------------------------------------
// 1. ESCALÓN 1 — LA CLASE DEL JUEVES
// ---------------------------------------------------------------------------

export const CLASE_JUEVES = {
  /**
   * CONFIRMADO por Javier el 2026-08-02. Es el nombre que ella va a ver en la
   * página al llegar (`desing_web/src/config/claseEnVivo.ts` → NOMBRE): si aquí
   * dice una cosa y la página otra, ella cree que se equivocó de link y cierra
   * sin pagar. Los dos se cambian juntos o no se cambia ninguno.
   *
   * OJO: "Volver a mí" NO es la clase, es el libro-regalo que viene con ella.
   * La ruta pública sigue siendo /volver-a-mi porque ahí apuntan los anuncios.
   */
  nombre: 'Recuperando mi ser',

  /**
   * Todos los jueves. 4 = jueves. La fecha NUNCA se escribe a mano: la calcula
   * `proximaClase()`, así que Paula siempre dice "este jueves" y acierta sola.
   *
   * ⚠️ EL RITUAL DE CADA JUEVES (dicho por Javier el 2026-08-02): la landing
   * `desing_web/src/config/claseEnVivo.ts` SÍ lleva la fecha a mano, y él la
   * corre al jueves siguiente cada semana mientras la clase se siga vendiendo.
   * Si una semana se le pasa, Paula seguirá vendiendo "este jueves" contra una
   * página que muestra la fecha vieja y el contador en cero — y ahí no compra
   * nadie. Es el único punto del embudo que depende de que alguien se acuerde.
   */
  diaSemana: 4,
  hora24: 20,
  horaTexto: '8:00 PM',
  /** ⚠️ PENDIENTE CONFIRMAR: la config dice 3, Javier dijo 2. */
  duracionHoras: 3,

  landing: 'https://historiasdelamente.com/volver-a-mi',
  /** La clase SÍ se cobra por Hotmart. Apego Detox NO. */
  checkout: 'https://pay.hotmart.com/H106712135H',

  /** Mismo peso en cada país. */
  precios: { COP: '25.000 COP', USD: '7 USD', MXN: '120 MXN' },
  /** Solo Colombia. */
  nequi: { numero: '3116329202', monto: '25.000 COP' },

  libro: { nombre: 'Volver a mí', detalle: 'cartilla de 16 páginas con ejercicios' },

  /**
   * WhatsApp de Javier con el mensaje ya escrito. Sin texto precargado, ella
   * abre el chat, no sabe qué poner y se va: ese silencio es donde se cae la
   * mitad de los pagos por Nequi.
   *
   * El texto es NEUTRO a propósito: `blindaje.repararLinks` normaliza TODOS los
   * wa.me del escalón a este único link, y por él entran cosas muy distintas
   * —el comprobante de Nequi, la que quiere hablar con él, la que pregunta por
   * terapia individual, la que tuvo un problema de pago—. Un texto específico
   * ("aquí va mi comprobante") sonaría absurdo en tres de esos cuatro casos.
   * Lo concreto se lo dice Paula en el globo de al lado.
   */
  whatsappJavier:
    'https://wa.me/573001681053?text=Hola%20Javier%2C%20te%20escribo%20desde%20el%20WhatsApp%20de%20Paula',

  /** ⚠️ PENDIENTE CONFIRMAR. `null` = Paula no afirma ni niega la grabación. */
  quedaGrabada: null as boolean | null,
} as const;

// ---------------------------------------------------------------------------
// 2. ESCALÓN 2 — APEGO DETOX
// ---------------------------------------------------------------------------

export const APEGO_DETOX = {
  nombre: 'Apego Detox',

  /** ÚNICO lugar donde se cobra. Hotmart quedó retirado para este producto. */
  checkout: 'https://www.skool.com/historias-de-la-mente-4978/about',
  landing: 'https://historiasdelamente.com/apegodetox',

  garantiaDias: 7,

  /**
   * Lanzamiento: $20 al mes hasta el 15 de agosto, $40 después. El precio le
   * queda BLOQUEADO a quien entra en lanzamiento — mientras no cancele, sigue
   * pagando 20 aunque suba. Los números son los de Skool ("JOIN $20/month"),
   * no 19.97: ella ve el de Skool al pagar y un centavo de diferencia se nota.
   */
  lanzamiento: {
    /** Último instante del 15 de agosto, hora Colombia. */
    finISO: '2026-08-15T23:59:59-05:00',
    precioPromo: 20,
    precioNormal: 40,
  },

  /** Los dos encuentros en vivo con Javier. 2 = martes, 4 = jueves. */
  encuentros: {
    dias: [2, 4] as const,
    diasTexto: 'martes y jueves',
    hora24: 20,
    horaTexto: '8:00 PM',
    duracionHoras: 2,
    plataforma: 'Google Meet',
  },

  /** WhatsApp de Javier, clicable y con el mensaje precargado. */
  whatsappJavier:
    'https://wa.me/573001681053?text=Hola%20Javier%2C%20quiero%20informaci%C3%B3n%20sobre%20Apego%20Detox%20o%20una%20cita%20contigo',
  /** El mismo número en crudo, para detectarlo y convertirlo en link. */
  numeroJavier: '3001681053',
} as const;

// ---------------------------------------------------------------------------
// 3. LA PRÓXIMA VEZ — SIRVE PARA LA CLASE Y PARA LOS ENCUENTROS
// ---------------------------------------------------------------------------

export type Ocurrencia = {
  /** Instante exacto de inicio. */
  inicio: Date;
  /** true mientras está ocurriendo. */
  enVivo: boolean;
  /** "jueves 6 de agosto" — en hora Colombia. */
  fecha: string;
  /** La frase exacta que Paula usa: "es HOY", "es MAÑANA", "es el jueves…". */
  frase: string;
};

const diaSemanaEnColombia = (iso: string): number =>
  new Date(`${iso}T12:00:00${OFFSET_COLOMBIA}`).getUTCDay();

/**
 * La próxima vez que ELLA todavía alcanza.
 *
 * EL SALTO ES AL TERMINAR, NO AL AMANECER. El jueves a las 10 de la mañana la
 * clase de esa noche sigue siendo "HOY" — que es el día que más vende. Solo
 * cuando termina se pasa a la semana siguiente. Si saltara a medianoche,
 * Paula pasaría el mejor día del embudo vendiendo la de dentro de 7 días.
 */
export function proximaOcurrencia(
  ahora: Date,
  dias: readonly number[],
  hora24: number,
  duracionHoras: number,
): Ocurrencia {
  const horaISO = String(hora24).padStart(2, '0');

  for (let i = 0; i <= 8; i++) {
    const iso = fechaISO(new Date(ahora.getTime() + i * 86_400_000), TZ_COLOMBIA);
    if (!dias.includes(diaSemanaEnColombia(iso))) continue;

    const inicio = new Date(`${iso}T${horaISO}:00:00${OFFSET_COLOMBIA}`);
    const fin = new Date(inicio.getTime() + duracionHoras * 3_600_000);
    if (ahora >= fin) continue; // esa ya terminó, sigue la siguiente

    const enVivo = ahora >= inicio;
    const faltan = diasDeCalendario(ahora, inicio, TZ_COLOMBIA);
    const fecha = fechaLarga(inicio, TZ_COLOMBIA);

    const frase = enVivo
      ? 'está EN VIVO ahora mismo'
      : faltan === 0
        ? 'es HOY'
        : faltan === 1
          ? 'es MAÑANA'
          : `es el ${fecha}`;

    return { inicio, enVivo, fecha, frase };
  }

  // Inalcanzable con una ventana de 8 días. Está para que nunca devuelva undefined.
  const inicio = new Date(ahora.getTime() + 86_400_000);
  return { inicio, enVivo: false, fecha: fechaLarga(inicio, TZ_COLOMBIA), frase: 'es esta semana' };
}

/** La clase de ESTE jueves (o la del siguiente, si la de hoy ya terminó). */
export function proximaClase(ahora: Date): Ocurrencia {
  const { diaSemana, hora24, duracionHoras } = CLASE_JUEVES;
  return proximaOcurrencia(ahora, [diaSemana], hora24, duracionHoras);
}

/** El próximo encuentro en vivo de Apego Detox (martes o jueves). */
export function proximoEncuentro(ahora: Date): Ocurrencia {
  const { dias, hora24, duracionHoras } = APEGO_DETOX.encuentros;
  return proximaOcurrencia(ahora, dias, hora24, duracionHoras);
}

// ---------------------------------------------------------------------------
// 4. EL PRECIO DE HOY — NADIE LO ESCRIBE A MANO
// ---------------------------------------------------------------------------

export type PrecioVigente = {
  /** true mientras el lanzamiento sigue vivo. */
  enLanzamiento: boolean;
  /** El número que Paula puede afirmar hoy: 20 o 40. */
  monto: number;
  /** "$20 USD al mes" — armado una sola vez, para no armarlo mal en cada sitio. */
  frase: string;
  /** El precio tachado. `null` cuando ya no hay promoción que mostrar. */
  antes: number | null;
  /** Días de calendario que le quedan (0 = hoy es el último). */
  diasRestantes: number;
};

/**
 * Qué precio está vigente en este instante y cuánto le queda al lanzamiento.
 * La urgencia sale de aquí: es una fecha real, no una frase de venta.
 */
export function precioApego(ahora: Date): PrecioVigente {
  const { finISO, precioPromo, precioNormal } = APEGO_DETOX.lanzamiento;
  const fin = new Date(finISO);
  const enLanzamiento = ahora <= fin;
  const monto = enLanzamiento ? precioPromo : precioNormal;

  return {
    enLanzamiento,
    monto,
    frase: `$${monto} USD al mes`,
    antes: enLanzamiento ? precioNormal : null,
    diasRestantes: enLanzamiento ? Math.max(0, diasDeCalendario(ahora, fin, TZ_COLOMBIA)) : 0,
  };
}

// ---------------------------------------------------------------------------
// 5. EL BLOQUE QUE SE INYECTA AL PROMPT EN CADA MENSAJE
// ---------------------------------------------------------------------------

/**
 * Los países desde los que más escriben. La hora ya resuelta en cada uno.
 *
 * POR QUÉ EXISTE: el país se deduce del indicativo del teléfono, pero muchas
 * lo DICEN por texto ("soy de México") con un número de otro país, o escriben
 * desde Instagram sin número. Sin esta tabla el modelo se pone a calcular la
 * diferencia horaria — y la calcula mal. Aquí la lee.
 */
const PAISES_TABLA = ['MX', 'CO', 'US', 'PE', 'EC', 'CL', 'AR', 'ES', 'VE'];

function tablaHorarios(inicio: Date): string {
  const diaEnColombia = fechaISO(inicio, TZ_COLOMBIA);

  return PAISES.filter((p) => PAISES_TABLA.includes(p.iso))
    .map((p) => {
      // En España la clase de las 8 PM del jueves cae a las 3 de la MADRUGADA
      // del viernes. Sin el día, ella la anota para el jueves y se la pierde.
      const otroDia = fechaISO(inicio, p.tz) !== diaEnColombia;
      const dia = otroDia
        ? ` (${new Intl.DateTimeFormat('es-CO', { timeZone: p.tz, weekday: 'long' }).format(inicio)})`
        : '';
      return `${p.nombre} ${hora12(inicio, p.tz)}${dia}`;
    })
    .join(' · ');
}

/** Su país y su hora, o la advertencia de que no lo sabemos. */
function bloqueSuPais(telefono: string | null | undefined, cuando: Ocurrencia | null, ahora: Date): string {
  const pais = detectarPais(telefono);

  if (!pais) {
    return `## 📱 NO SABES DE QUÉ PAÍS TE ESCRIBE
No llegó su número (pasa en Instagram), así que NO sabes dónde está.
- NUNCA asumas Colombia ni des una hora "local" que no puedes calcular.
- Di la hora así: "8:00 PM hora Colombia" — explícito, siempre.
- Solo le preguntas el país si ELLA pregunta a qué hora le queda a ella.`;
  }

  const enSuHora = cuando
    ? `\n- EN SU HORA eso es: ${fechaLarga(cuando.inicio, pais.tz)}, ${hora12(cuando.inicio, pais.tz)} (hora de ${pais.ciudad}).`
    : '';

  return `## 📱 ELLA TE ESCRIBE DESDE: ${pais.nombre}
- Su hora local en este momento: ${hora12(ahora, pais.tz)}.${enSuHora}
- Cuando hables de una hora, dásela en la de ELLA. Su país no se lo preguntas: ya lo sabes.`;
}

/**
 * Reloj y datos duros del escalón en el que va la conversación. Se recalcula en
 * CADA mensaje y va PRIMERO en el prompt.
 *
 * El modelo no sabe qué día es hoy ni desde dónde le escriben. Todo lo que se
 * puede calcular se calcula aquí y se le entrega resuelto: lee y repite.
 */
export function bloqueContexto(
  ahora: Date,
  telefono: string | null | undefined,
  escalon: Escalon,
  /**
   * ¿Ya está adentro de Apego Detox? Cambia lo que se le puede decir:
   * la FECHA del próximo encuentro en vivo es información de miembro. A una
   * mujer que llega de TikTok y todavía no ha entrado, darle "el próximo
   * encuentro es el martes 4" la cita a algo a lo que no puede entrar.
   */
  esMiembro = false,
): string {
  const anio = new Intl.DateTimeFormat('es-CO', { timeZone: TZ_COLOMBIA, year: 'numeric' }).format(ahora);
  const hoy = `- Hoy es ${fechaLarga(ahora, TZ_COLOMBIA)} de ${anio}. En Colombia son las ${hora12(ahora, TZ_COLOMBIA)}.`;

  // "ES HOY (jueves 6 de agosto)" sí; "ES EL JUEVES 6 DE AGOSTO (jueves 6 de
  // agosto)" no — la fecha repetida en cada mensaje solo gasta contexto.
  const cuando = (o: Ocurrencia) =>
    o.frase.includes(o.fecha) ? o.frase.toUpperCase() : `${o.frase.toUpperCase()} (${o.fecha})`;

  if (escalon === 'clase') {
    const clase = proximaClase(ahora);
    const { nombre, precios, nequi, horaTexto, duracionHoras, landing, libro, whatsappJavier } =
      CLASE_JUEVES;

    // Colombia paga por Nequi. Es transferencia directa: sin comisión de
    // pasarela y sin tarjeta de por medio, que es justo lo que frena a muchas.
    // Si su número es colombiano ya lo sabemos; si lo dice ella, manda lo que dice.
    const esColombiana = detectarPais(telefono)?.iso === 'CO';
    // Ella tiene que teclear este número en Nequi: se le da agrupado, no pegado.
    const nequiLegible = nequi.numero.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    // Los tres pasos van SIEMPRE juntos y en este orden. Dar el número sin decir
    // qué hacer después es donde se caía el pago: ella transfiere, no manda el
    // comprobante, nadie le da el acceso y se queda creyendo que la estafaron.
    const pasosNequi = `**Nequi: ${nequi.monto} al ${nequiLegible}** (a nombre de Javier Vieira). Cuando transfiera, le manda el comprobante Y su correo a Javier por este link: ${whatsappJavier} — él le da el acceso. Los tres pasos se los das juntos: sin el comprobante y el correo, nadie le puede entregar nada.`;
    // ⚠️ A la que NO es colombiana no se le puede nombrar Nequi por su cuenta:
    // "si eres de Colombia mandas a Nequi, si no pagas con tarjeta" la obliga a
    // escoger entre dos caminos y alarga el mensaje hasta que se corta el link.
    // Una sola vía por mujer.
    const nequiLinea = esColombiana
      ? `- 👉 ELLA ES DE COLOMBIA: la PRIMERA forma de pago que le ofreces es Nequi, antes que la página. ${pasosNequi}
- Solo si te dice que prefiere pagar con tarjeta le mandas la página.`
      : `- ⛔ ELLA NO ES DE COLOMBIA: **no le nombres Nequi.** Su vía es la página, y punto. Nada de "si eres de Colombia…": ofrecerle dos caminos la deja escogiendo en vez de pagando.
- 🇨🇴 Solo si ELLA misma te dice que está en Colombia (pasa: número de otro país, viviendo allá), ahí sí cambias a Nequi. ${pasosNequi}`;

    return `# ⏰ RELOJ Y DATOS DUROS — CALCULADO POR EL SISTEMA, ES LA VERDAD
Esto NO lo adivines ni lo calcules tú: ya viene resuelto. Léelo y úsalo tal cual.

${hoy}
- 👉 LA CLASE SE LLAMA **"${nombre}"** — así se llama también en la página, y así se lo dices. Es EN VIVO, con Javier Vieira.
- 👉 ${cuando(clase)}, ${horaTexto} hora Colombia, ${duracionHoras} horas.
- Es TODOS LOS JUEVES, a la misma hora. Nunca nombres otro día.
- Se lleva: la clase en vivo con él, el libro "${libro.nombre}" (${libro.detalle}) y la guía de la clase.
- Precio: ${precios.COP} / ${precios.USD} / ${precios.MXN}. Es PAGO ÚNICO, no una suscripción.
- 👉 EL LINK QUE LE MANDAS ES LA PÁGINA: ${landing}
  Ahí ella ve todo y aparta su lugar sola; el botón de pago está adentro. **NUNCA le mandes un link de pago suelto de entrada**: pedirle la tarjeta antes de contarle a qué la invitas la espanta.
- 🔁 **El link no se manda una sola vez.** Se lo vuelves a mandar cada vez que le sirva: si pregunta cómo pagar, si dice que sí, si vuelve al día siguiente, si dice que se le perdió. Un link que hay que buscar hacia arriba en el chat es una venta perdida.
${nequiLinea}

## 🕗 A QUÉ HORA LE QUEDA LA CLASE — YA CALCULADO, NO LO DEDUZCAS
${tablaHorarios(clase.inicio)}
- **Si ELLA te dice de qué país es, eso manda** sobre lo que diga su número de teléfono: muchas viven en otro país del que tienen la línea.
- Si su país no está en esta lista, dile la hora de Colombia diciéndolo explícito ("8:00 PM hora Colombia") y pregúntale desde qué ciudad, sin inventarle una diferencia horaria.

${bloqueSuPais(telefono, clase, ahora)}
`;
  }

  const encuentro = proximoEncuentro(ahora);
  const precio = precioApego(ahora);
  const { encuentros, garantiaDias, checkout, landing } = APEGO_DETOX;

  const lanzamiento = precio.enLanzamiento
    ? `- 🔥 LANZAMIENTO VIVO: ${precio.frase} (antes $${precio.antes}). Le quedan ${precio.diasRestantes} días — el 15 de agosto sube a $${precio.antes} y NO vuelve a bajar.
- El precio le queda BLOQUEADO: mientras no cancele, sigue pagando $${precio.monto} aunque suba.`
    : `- Precio: ${precio.frase}. El lanzamiento ya terminó — no lo nombres ni prometas que puede alcanzarlo.`;

  // La FECHA del próximo encuentro solo se le da a quien ya está adentro. A las
  // demás se les dice QUÉ incluye el programa (dos encuentros por semana), no
  // cuándo es el próximo: eso las citaría a algo a lo que no pueden entrar.
  const bloqueEncuentros = esMiembro
    ? `- 👉 SU PRÓXIMO ENCUENTRO EN VIVO CON JAVIER ${cuando(encuentro)}, ${encuentros.horaTexto} hora Colombia.
- Son SIEMPRE ${encuentros.diasTexto}, ${encuentros.horaTexto} hora Colombia, ${encuentros.duracionHoras} horas, por ${encuentros.plataforma}. NUNCA nombres otro día.`
    : `- El programa incluye DOS encuentros en vivo con Javier cada semana (${encuentros.diasTexto}, ${encuentros.horaTexto} hora Colombia, ${encuentros.duracionHoras} horas, por ${encuentros.plataforma}). Eso es lo que le cuentas: que los tiene todas las semanas.
- ⛔ NO le des la fecha del próximo encuentro: esos son para las que YA están adentro. Citarla a una fecha a la que todavía no puede entrar es prometerle algo que no tiene.`;

  return `# ⏰ RELOJ Y DATOS DUROS — CALCULADO POR EL SISTEMA, ES LA VERDAD
Esto NO lo adivines ni lo calcules tú: ya viene resuelto. Léelo y úsalo tal cual.

${hoy}
${bloqueEncuentros}
${lanzamiento}
- Es SUSCRIPCIÓN mensual y cancela cuando quiera. NUNCA digas "pago único".
- Si pregunta cuánto es en su moneda: se lo muestra Skool al pagar. Tú solo afirmas los $${precio.monto} USD.
- Garantía: ${garantiaDias} días, devolución total y sin preguntas.
- Se paga SOLO aquí (Skool): ${checkout}
- La página para verlo por dentro: ${landing}

${bloqueSuPais(telefono, esMiembro ? encuentro : null, ahora)}
`;
}
