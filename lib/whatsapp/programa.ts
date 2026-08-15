// ============================================================================
// PROGRAMA — EL ÚNICO PRODUCTO Y TODO LO QUE SE CALCULA
//
// Aquí vive SOLO lo que el modelo no puede deducir: precios, links, y las fechas
// que cambian solas. Lo que Paula *dice* vive en content/PAULA-CONOCIMIENTO.md.
//
// LA REGLA: si se puede calcular, se calcula aquí y se le entrega resuelto.
// El modelo no sabe qué día es hoy, ni desde dónde escribe ella, ni si el
// lanzamiento sigue vivo. Cada vez que se lo dejamos deducir, inventa.
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  📌 CAMBIO DE MODELO DE VENTA — 2026-08-05, decidido por Javier.          ║
// ║                                                                           ║
// ║  ANTES: Paula vendía LA CLASE DEL JUEVES (evento, pago único, Hotmart) y  ║
// ║  solo subía a Apego Detox si ELLA lo pedía. Eso era la "escalera".        ║
// ║                                                                           ║
// ║  AHORA: Paula vende SOLO Apego Detox en Skool. Un producto, un link.      ║
// ║                                                                           ║
// ║  POR QUÉ SE FUE LA CLASE (el diagnóstico de por qué no vendía):           ║
// ║  la clase le pedía a una mujer que escribe a las 11 de la noche encerrada ║
// ║  en el baño que (1) esperara al jueves, (2) tuviera tres horas libres a   ║
// ║  las 8 con él en la casa, y (3) si se la perdía, perdía la plata — porque ║
// ║  no quedaba grabada. Ese "no queda grabada" estaba escrito aquí como "la  ║
// ║  única urgencia real"; en el chat real era una fábrica de objeciones: al  ║
// ║  "no puedo a esa hora" no había nada más que ofrecerle y el lead moría.   ║
// ║                                                                           ║
// ║  El programa no tiene ninguna de esas tres fricciones: entra HOY, desde   ║
// ║  el celular, a la hora que sea. Su momento de dolor son las 3 de la       ║
// ║  mañana, y a esa hora una clase del jueves no le sirve — la comunidad sí. ║
// ║                                                                           ║
// ║  Y de paso arregla un choque real de agenda: la clase era jueves 8 PM     ║
// ║  (3 h) y los encuentros del programa son martes y jueves 8 PM (2 h). Era  ║
// ║  la misma franja: Javier no podía dar las dos cosas.                      ║
// ║                                                                           ║
// ║  La clase NO se borró del mundo: sigue existiendo como taller en vivo,    ║
// ║  pero ahora vive DENTRO del programa (es uno de los dos de la semana).    ║
// ║  Paula no la ofrece suelta nunca, y si ella pregunta por la clase, la     ║
// ║  respuesta está en PAULA-CONOCIMIENTO.md, bloque 11.                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// ============================================================================

import {
  PAISES,
  TZ_COLOMBIA,
  detectarPais,
  diasDeCalendario,
  fechaISO,
  fechaLarga,
  hora12,
  paisPorIso,
  type Pais,
} from './paises';
import { precioLocal, type Tasas } from './moneda';

/** Las tasas del día, o una tabla pelada (lo que usan los tests). */
export type TablaTasas = Tasas | Record<string, number>;

/** Colombia no tiene horario de verano: -05:00 vale todo el año. */
const OFFSET_COLOMBIA = '-05:00';

// ---------------------------------------------------------------------------
// 1. EL PRODUCTO — APEGO DETOX
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  📌 SI VIENES A CAMBIAR LA OFERTA, ES AQUÍ Y SOLO AQUÍ.                   ║
// ║                                                                           ║
// ║  Todo lo de aquí tiene que coincidir CLAVADO con lo que ella lee al abrir ║
// ║  el link de Skool. Si Paula le promete una cosa y la página dice otra,    ║
// ║  ella cree que se equivocó de link y cierra sin pagar. Verificado contra  ║
// ║  skool.com/historias-de-la-mente-4978/about el 2026-08-05.                ║
// ║                                                                           ║
// ║  LO QUE NO SE TOCA A MANO NUNCA: la fecha del próximo encuentro (la       ║
// ║  calcula `proximoEncuentro()`) y el precio vigente (lo calcula            ║
// ║  `precioApego()` contra la fecha de `lanzamiento.finISO`).                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// ---------------------------------------------------------------------------

/** Los días de la semana, empezando en domingo como `getUTCDay()`. */
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** "a la 1:00 PM" / "a las 8:00 PM" — el español no perdona ese singular. */
export function aLaHora(hora: string): string {
  return `${/^1:\d\d\s?(AM|PM)$/i.test(hora) ? 'a la' : 'a las'} ${hora}`;
}

/**
 * LOS DOS TALLERES EN VIVO, cada uno con su día y SU hora (hora Colombia).
 * Es el único sitio donde se tocan: todo lo demás —el texto del horario, el
 * próximo encuentro, la conversión a la hora de ella y lo que el blindaje
 * acepta como día válido— sale calculado de aquí.
 */
const SESIONES = [
  { dia: 2, hora24: 13, horaTexto: '1:00 PM' },
  { dia: 4, hora24: 20, horaTexto: '8:00 PM' },
] as const;

export const APEGO_DETOX = {
  nombre: 'Apego Detox',

  /** ÚNICO lugar donde se cobra. Hotmart quedó retirado para este producto. */
  checkout: 'https://www.skool.com/historias-de-la-mente-4978/about',
  landing: 'https://historiasdelamente.com/apegodetox',

  garantiaDias: 7,

  /**
   * EL LANZAMIENTO SE CERRÓ EL 2026-08-07, antes de tiempo (iba hasta el 15).
   * Desde entonces Paula no puede nombrar ninguna promoción: `precioApego()`
   * devuelve enLanzamiento=false y el bloque del reloj le dice explícitamente
   * que ya terminó.
   *
   * A quien entró en lanzamiento el precio le quedó BLOQUEADO: mientras no
   * cancele sigue pagando 20 aunque haya subido.
   *
   * ⚠️ EL NÚMERO ES EL DE SKOOL, VERIFICADO EN LA PÁGINA — NO EL DICTADO DE
   * MEMORIA. El 2026-08-15 Skool mostraba "$38/month" y aquí decía 40: Paula
   * le prometía a cada mujer dos dólares más de los que iba a pagar, y el que
   * manda es el que ella ve en el botón. Antes de cambiarlo, se abre
   * skool.com/historias-de-la-mente-4978/about y se lee el botón JOIN. Nunca
   * decimales (39.97): ella ve el redondo al pagar y un centavo se nota.
   *
   * ⚠️ El mismo número vive en la web (`desing_web/src/config/apegoDetox.ts`,
   * `PRECIO_REAL`). Si aquí dice uno y allá otro, ella lee un precio en la
   * página y otro en el chat, y eso es lo que la hace cerrar.
   *
   * ⚠️ `finISO` YA PASÓ a propósito. Para abrir una campaña nueva se pone una
   * fecha futura aquí y el lanzamiento revive solo, en Paula y en la página.
   */
  lanzamiento: {
    /** Último instante del 6 de agosto, hora Colombia: el último día a $20. */
    finISO: '2026-08-06T23:59:59-05:00',
    precioPromo: 20,
    /** Verificado contra el botón JOIN de Skool el 2026-08-15: $38/month. */
    precioNormal: 38,
  },

  /**
   * CUÁNTOS MÓDULOS HAY. 17, verificado contra la página de Skool el
   * 2026-08-05 ("17 módulos de terapia guiada").
   *
   * ⚠️ El blindaje marca como invento cualquier otro número, así que este es el
   * único sitio donde se cambia. Si algún día el aula tiene 18, se cambia aquí
   * y en PAULA-CONOCIMIENTO.md a la vez — nunca en uno solo.
   */
  modulos: 17,

  /**
   * LOS CUATRO PILARES, en el orden en que los lee ella en la página.
   *
   * ⚠️ EL ORDEN NO ES DECORATIVO Y NO ES EL DE LA PÁGINA POR CASUALIDAD: el
   * primero de la lista es el que Paula nombra por defecto, y el que más vende
   * NO son los módulos. Es la comunidad. La mujer que escribe a las tres de la
   * mañana con el dedo temblando sobre el chat de él no está comprando 17
   * videos: está comprando que alguien conteste a esa hora. Los módulos son lo
   * que se lleva; la sala llena a las 3 AM es lo que compra.
   *
   * Paula nombra UNO, el que le sirva a lo que ella acabó de contar. Nunca los
   * cuatro, y nunca en lista (`formato.ts` mata las listas de todos modos).
   */
  pilares: [
    'una comunidad activa 24/7, para esas 3 de la mañana en que el dedo le tiembla sobre el chat de él',
    'talleres terapéuticos en vivo con Javier Vieira: 4 horas de acompañamiento cada semana',
    '17 módulos de terapia guiada, paso a paso, desde su casa',
    'meditaciones y ejercicios para ese cuerpo que lleva años en alerta',
  ],

  /**
   * LOS SEIS BENEFICIOS DE LAS VIÑETAS. Salen en DOS tandas de tres, con ella
   * hablando en medio: *"tres viñetas cortas, y luego que ella hable puedes
   * anexar tres beneficios más"* (Javier, 2026-08-07).
   *
   * ⚠️ REESCRITOS EL 2026-08-08, Y EL CAMBIO ES DE FONDO. Javier, viendo tres
   * conversaciones reales: *"la usuaria queda sin saber qué es Apego Detox (…)
   * solo habla de terapias en vivo en una chorrera de texto"*. Y al elegir qué
   * llevan: *"viñetas con transformación e información, y muy importante que
   * hagas terapia en video, con 17 módulos"*.
   *
   * La versión anterior era SOLO transformación —"Vuelves a dormir toda la
   * noche", "Alguien te contesta a las tres de la mañana"—. Se leían bonito y
   * dejaban a la mujer sin saber qué estaba comprando: ni un módulo, ni un
   * formato, ni una hora. Bonito no vende si ella no sabe qué hay dentro de la
   * caja.
   *
   * **AHORA CADA VIÑETA LLEVA LAS DOS MITADES:** el entregable delante (qué es)
   * y lo que ella saca detrás (qué logra), unidas por dos puntos. Ese ":" es la
   * bisagra — a la izquierda lo que compra, a la derecha por qué le sirve.
   *
   * ⚠️ EL TOPE YA NO SE CUENTA EN PALABRAS, SE CUENTA EN CARACTERES. El límite
   * viejo (menos de diez palabras) hacía imposible meter las dos mitades. El
   * que manda de verdad es `MAX_CHARS_VINETA` en `formato.ts`, que es el que
   * recorta: una viñeta que se pasa no se rechaza, se corta con puntos
   * suspensivos. Debajo de ese número caben en un renglón de celular, que es
   * todo lo que hay que respetar.
   *
   * ⚠️ EL ORDEN DE LOS TRES PRIMEROS NO SE TOCA Y NO ROTA: son los tres
   * pilares, o sea la respuesta a "¿qué es Apego Detox?". Rotarlos —como se
   * hacía— significaba que a unas mujeres les tocaba enterarse de las
   * meditaciones y no de los 17 módulos. Ver `beneficiosPara()` en paula.ts.
   */
  beneficios: [
    // ── TANDA 1: los tres pilares. Fijos. Esto ES Apego Detox. ──
    '17 módulos de terapia en video: entiendes por qué te pasó y que no fue por débil',
    '4 horas en vivo con Javier Vieira cada semana: no lo haces sola',
    'Comunidad a cualquier hora: alguien te contesta a las 3 de la mañana',
    // ── TANDA 2: los otros tres, cuando ella ya contestó. ──
    'Meditaciones y ejercicios: el cuerpo baja de la alerta y vuelves a dormir',
    'Se desbloquea por etapas: sabes qué hacer la próxima vez que él escriba',
    'Bonus Taller Plus: PDFs y hojas de ruta para los días de crisis',
  ],

  /**
   * LO QUE VA A SABER HACER. Son los cuatro resultados de la página, y valen
   * más que los pilares para vender: describen a la mujer que sale, no la caja
   * que entra.
   */
  resultados: [
    'entender de dónde nació la herida — que casi nunca empieza con él',
    'reconocer la manipulación mientras está ocurriendo, no tres días después',
    'bajarle el volumen a la obsesión',
    'sostenerse afuera sin volver',
  ],

  /**
   * EL ÁNGULO — el mismo de la página, y es el que hace que se reconozca.
   *
   * Tiene DOS entradas a propósito, porque las dos mujeres que escriben están
   * en sitios opuestos y una sola frase expulsa a la otra. La que sigue adentro
   * no se reconoce en "él sigue viviendo en tu cabeza" (él está en la cocina);
   * la que ya salió no se reconoce en "vuelves aunque te esté destruyendo".
   * `paula.ts` elige el banco de dolores por esta misma partición.
   */
  angulo:
    'Siga con él o ya se haya ido, la cabeza todavía la tiene ocupada por él. Si está adentro: revisa su última conexión, justifica lo injustificable, vuelve aunque la esté destruyendo. Si ya salió: durmió sola meses y él sigue viviendo en su cabeza, preguntándose si con la otra sí cambió, si el problema fue ella. No es debilidad, y es lo que se trabaja adentro.',

  /**
   * Los dos talleres en vivo con Javier. 2 = martes, 4 = jueves.
   *
   * ⚠️ CADA UNO TIENE SU HORA, Y NO ES UN DETALLE (2026-08-15). Javier:
   * *"las clases son el martes a la una pm hora Colombia, y los jueves a las
   * 8 pm hora Colombia"*. Hasta ese día el modelo de datos tenía UNA hora para
   * los dos (`hora24: 20`) y Paula citaba a todo el mundo a las 8: la mitad de
   * las mujeres habría llegado siete horas tarde al taller del martes.
   *
   * Por eso el horario ya no es un número suelto sino una lista de SESIONES, y
   * la conversión a la zona horaria de ella se hace por sesión: las 8 PM del
   * jueves en Colombia son las 3 de la madrugada del VIERNES en Madrid, pero
   * la 1 PM del martes sigue cayendo el martes. Con una sola conversión para
   * las dos, uno de los dos días salía mal.
   */
  encuentros: {
    sesiones: SESIONES,
    dias: SESIONES.map((s) => s.dia),
    diasTexto: SESIONES.map((s) => DIAS[s.dia]).join(' y '),
    /** "martes a la 1:00 PM y jueves a las 8:00 PM" — hora Colombia. */
    horarioTexto: SESIONES.map((s) => `${DIAS[s.dia]} ${aLaHora(s.horaTexto)}`).join(' y '),
    duracionHoras: 2,
    /** 2 talleres × 2 h. Es el "4 horas cada semana" de la página. */
    horasSemana: 4,
    plataforma: 'Google Meet',
  },

  /** WhatsApp de Javier, clicable y con el mensaje precargado. */
  whatsappJavier:
    'https://wa.me/573001681053?text=Hola%20Javier%2C%20quiero%20informaci%C3%B3n%20sobre%20Apego%20Detox%20o%20una%20cita%20contigo',
  /** El mismo número en crudo, para detectarlo y convertirlo en link. */
  numeroJavier: '3001681053',
} as const;

// ---------------------------------------------------------------------------
// EL WHATSAPP DE JAVIER, CON EL MENSAJE SEGÚN POR QUÉ VIENE — 2026-08-14
//
// El prefill era el mismo para las cinco razones de handoff: una mujer que
// preguntó «¿él da terapia?» aterrizaba en el teléfono de Javier diciendo
// «quiero información sobre Apego Detox» — algo que no quiso decir — y Javier
// abría el chat sin saber si le llegaba una paciente, una venta atascada o un
// problema de soporte, cuando el sistema ya lo sabía. Ahora el primer mensaje
// dice a qué viene, y las dos partes empiezan la conversación ya ubicadas.
//
// El «vengo de hablar con Paula» no es decorativo: es la continuidad. Ella no
// tiene que volver a contar desde cero, y Javier sabe que el contexto está en
// el chat de Paula.
// ---------------------------------------------------------------------------

export type MotivoContactoJavier = 'terapia' | 'pago' | 'compra' | 'general';

const PREFILL_JAVIER: Record<MotivoContactoJavier, string> = {
  terapia: 'Hola Javier, vengo de hablar con Paula y quisiera una consulta contigo',
  pago: 'Hola Javier, vengo de hablar con Paula, quiero entrar a Apego Detox y el pago no me deja avanzar',
  compra: 'Hola Javier, ya hice el pago de Apego Detox y necesito ayuda con mi acceso',
  general: 'Hola Javier, quiero información sobre Apego Detox o una cita contigo',
};

export function linkJavier(motivo: MotivoContactoJavier = 'general'): string {
  return `https://wa.me/57${APEGO_DETOX.numeroJavier}?text=${encodeURIComponent(PREFILL_JAVIER[motivo])}`;
}

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
  /** "8:00 PM" — la hora DE ESTA sesión en Colombia; el martes y el jueves no coinciden. */
  horaTexto: string;
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

    return { inicio, enVivo, fecha, frase, horaTexto: hora12(inicio, TZ_COLOMBIA) };
  }

  // Inalcanzable con una ventana de 8 días. Está para que nunca devuelva undefined.
  const inicio = new Date(ahora.getTime() + 86_400_000);
  return {
    inicio,
    enVivo: false,
    fecha: fechaLarga(inicio, TZ_COLOMBIA),
    frase: 'es esta semana',
    horaTexto: hora12(inicio, TZ_COLOMBIA),
  };
}

/**
 * El próximo taller en vivo de Apego Detox — el más cercano de los dos.
 *
 * ⚠️ Cada sesión tiene su propia hora desde el 2026-08-15, así que se calcula
 * la próxima de CADA UNA y se devuelve la que llegue antes. Con una hora común
 * (lo de antes) el martes salía citado a las 8 PM: siete horas tarde.
 */
export function proximoEncuentro(ahora: Date): Ocurrencia {
  const { sesiones, duracionHoras } = APEGO_DETOX.encuentros;
  return sesiones
    .map((s) => proximaOcurrencia(ahora, [s.dia], s.hora24, duracionHoras))
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())[0];
}

// ---------------------------------------------------------------------------
// 4. EL PRECIO DE HOY — NADIE LO ESCRIBE A MANO
// ---------------------------------------------------------------------------

export type PrecioVigente = {
  /** true mientras el lanzamiento sigue vivo. */
  enLanzamiento: boolean;
  /** El número que Paula puede afirmar hoy: el de lanzamiento o el normal. */
  monto: number;
  /** "$38 USD al mes" — armado una sola vez, para no armarlo mal en cada sitio. */
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
 * De qué país es ELLA. Lo que dijo por texto MANDA sobre su indicativo.
 *
 * Muchas viven en un país distinto del que tienen la línea —la colombiana en
 * Madrid, la venezolana en Santiago— y a esas el número las manda a la moneda
 * y la hora equivocadas. Por eso `paisIso` (lo que ella contó, guardado en la
 * base) gana siempre que exista.
 */
function paisDeElla(telefono: string | null | undefined, paisIso?: string | null): Pais | null {
  return paisPorIso(paisIso) ?? detectarPais(telefono);
}

/**
 * EL PRECIO EN LO QUE ELLA USA PARA CONTAR EL DINERO.
 *
 * "20 dólares al mes" no es una cifra para una mujer en Bogotá: es una
 * incógnita. Puede ser 40.000 pesos o 400.000, y mientras no lo sepa, abrir el
 * link se siente como firmar en blanco. Traducírselo es lo que convierte el
 * precio en una decisión que puede tomar sin miedo.
 *
 * ⚠️ SIEMPRE "UNOS", Y EL DÓLAR SIEMPRE DELANTE. Lo que su banco le cobre
 * depende de la tasa del día y del recargo de su tarjeta. Una cifra exacta que
 * después no cuadra en el extracto es justo la sorpresa que hace pedir la
 * devolución — y el número que ella va a ver en Skool es el dólar, no el peso.
 */
/**
 * Las monedas de las que preguntan de verdad. Van TODAS calculadas en cada
 * mensaje: son ~60 tokens y matan una familia entera de inventos.
 */
const MONEDAS_TABLA = ['COP', 'MXN', 'ARS', 'CLP', 'PEN', 'EUR', 'BRL', 'DOP', 'CRC', 'GTQ'];

export function bloqueMoneda(
  montoUSD: number,
  telefono: string | null | undefined,
  tasasUSD: TablaTasas | undefined,
  paisIso: string | null | undefined,
): string {
  const pais = paisDeElla(telefono, paisIso);

  if (!tasasUSD) {
    return `💵 EN SU MONEDA: no hay tasa verificada ahora mismo, así que **no conviertas nada**. Di $${montoUSD} USD y ya. Nunca te inventes la equivalencia.`;
  }

  // LA TABLA COMPLETA. Sin ella, el bloque solo traía la moneda del país que se
  // deducía de su teléfono — y si ella preguntaba por otra, el modelo se la
  // inventaba. Pasó de verdad el 2026-08-05: a una mujer con línea colombiana
  // que preguntó en pesos argentinos, Paula le dijo "unos 5.600" cuando eran
  // unos 30.000. Ahora la cifra que pida está siempre delante, calculada.
  const tabla = MONEDAS_TABLA
    .map((c) => precioLocal(montoUSD, c, tasasUSD))
    .filter((p) => p.frase)
    .map((p) => p.frase.replace('unos ', ''))
    .join(' · ');

  if (!tabla) {
    return `💵 EN SU MONEDA: no hay tasa verificada ahora mismo. Di $${montoUSD} USD y no inventes la equivalencia.`;
  }

  const comun = `## 💵 $${montoUSD} USD AL MES, EN CADA MONEDA — TASA DE HOY, YA CALCULADA
${tabla}
⛔ **Estas son las únicas cifras que puedes decir.** Si te pregunta por una moneda que no esté en esta lista, dile que se lo confirmas y no te la inventes. NUNCA calcules tú una conversión.
⛔ SIEMPRE "unos", nunca la cifra exacta: lo que le cobre su banco depende de la tasa del día y del recargo de su tarjeta.
⛔ El dólar va SIEMPRE delante, porque es lo que ella va a ver en la pantalla de Skool.`;

  if (!pais) {
    return `${comun}
👉 Todavía no sabes de qué país es: **pregúntaselo** y dale la cifra que le toque de la lista. Mientras no lo sepas, di solo los $${montoUSD} USD.`;
  }

  const local = precioLocal(montoUSD, pais.moneda, tasasUSD);

  if (local.esDolar) {
    return `${comun}
👉 ELLA ESCRIBE DESDE ${pais.nombre.toUpperCase()}, donde se cuenta en dólares: $${montoUSD} USD ya es su cifra. **No la conviertas ni la repitas dos veces.**`;
  }

  return `${comun}
👉 **LA SUYA (${pais.nombre}): $${montoUSD} USD son ${local.frase} al mes.** Se lo dices con las dos cifras juntas: *"son $${montoUSD} al mes, ${local.frase}"*.
🌎 Si ELLA te dice que está en otro país, o te pregunta por otra moneda, usas la de esa lista — lo que ella diga manda sobre lo que diga su número de teléfono.`;
}

/** Su país y su hora, o la advertencia de que no lo sabemos. */
function bloqueSuPais(
  telefono: string | null | undefined,
  cuando: Ocurrencia | null,
  ahora: Date,
  paisIso?: string | null,
): string {
  const pais = paisDeElla(telefono, paisIso);

  if (!pais) {
    return `## 📱 TODAVÍA NO SABES DE QUÉ PAÍS TE ESCRIBE
No llegó su número (pasa en Instagram) y ella no te lo ha dicho. Nunca asumas Colombia ni des una hora "local" que no puedes calcular.
👉 **Pregúntaselo, en media línea y pegado a otra cosa** — nunca como interrogatorio: *"¿de dónde me escribes?"*. Con eso le puedes dar el precio en su moneda, que es justo lo que la hace decidirse.`;
  }

  const enSuHora = cuando
    ? ` En su hora, eso es ${fechaLarga(cuando.inicio, pais.tz)}, ${hora12(cuando.inicio, pais.tz)} (hora de ${pais.ciudad}).`
    : '';

  return `## 📱 ELLA TE ESCRIBE DESDE: ${pais.nombre}
Su hora local en este momento son las ${hora12(ahora, pais.tz)}.${enSuHora} Cuando hables de una hora, dásela en la de ELLA; su país no se lo preguntas, ya lo sabes.
⛔ **UNA sola hora: la de ella**, la que ya viene calculada arriba. No le pongas las dos —la de allá y la de acá— en el mismo mensaje: la ponen a calcular, alargan el globo y no suenan a persona. La de Colombia solo se nombra si ELLA pregunta a qué hora es allá.
⛔ Y NUNCA le cambies la etiqueta a una hora: coger la de Colombia y llamarla "hora de ${pais.ciudad}" la hace llegar tarde a todo. Si la hora que vas a decir no está calculada aquí arriba, no la digas.`;
}

/**
 * EL HORARIO DE LOS TALLERES, EN LA SEMANA DE ELLA.
 *
 * ⚠️ POR QUÉ EXISTE. Sin esto, el prompt le daba "martes y jueves, 8:00 PM hora
 * Colombia" y a la vez le ordenaba "una sola hora: la de ella". El modelo
 * resolvía la contradicción de la peor forma posible: le cambiaba la etiqueta al
 * número. A una mujer de México le decía **"8:00 PM hora México"**, que son las
 * 8 PM de Colombia — o sea que habría llegado una hora tarde a cada taller. Se
 * vio en una prueba real el 2026-08-05.
 *
 * Y EL DÍA TAMBIÉN SE MUEVE, que es lo que casi nadie ve: las 8 PM del jueves en
 * Colombia son las 3 de la MADRUGADA DEL VIERNES en Madrid. Decirle a una
 * española "los jueves a las 3 AM" la cita el día equivocado.
 *
 * ⚠️ SE CONVIERTE SESIÓN POR SESIÓN (2026-08-15). Desde que el martes es a la
 * 1 PM y el jueves a las 8 PM, una sola conversión para los dos días miente en
 * uno de ellos: a Madrid, la 1 PM del martes le cae el martes por la tarde y
 * las 8 PM del jueves le caen el viernes de madrugada. Días distintos y
 * desplazamientos distintos, del mismo horario.
 *
 * Se calcula sobre ocurrencias reales (no sobre una tabla de offsets) para que
 * el horario de verano de Chile, España o Estados Unidos salga solo.
 */
export type HorarioLocal = {
  /** "martes a la 1:00 PM y viernes a las 3:00 AM" — ya en la hora de ella. */
  texto: string;
  /** Sus días, para el blindaje: ["martes", "viernes"]. */
  dias: string[];
  /** true si alguno de los talleres le cae en otro día que en Colombia. */
  cambiaDia: boolean;
};

export function horarioParaElla(ahora: Date, tz: string): HorarioLocal {
  const partes = APEGO_DETOX.encuentros.sesiones.map((s) => {
    const inicio = proximaOcurrencia(ahora, [s.dia], s.hora24, APEGO_DETOX.encuentros.duracionHoras).inicio;
    const desplazamiento = diasDeCalendario(
      new Date(`${fechaISO(inicio, TZ_COLOMBIA)}T12:00:00Z`),
      new Date(`${fechaISO(inicio, tz)}T12:00:00Z`),
      'UTC',
    );
    return {
      dia: DIAS[(s.dia + desplazamiento + 7) % 7],
      hora: hora12(inicio, tz),
      cambiaDia: desplazamiento !== 0,
    };
  });

  return {
    texto: partes.map((p) => `${p.dia} ${aLaHora(p.hora)}`).join(' y '),
    dias: partes.map((p) => p.dia),
    cambiaDia: partes.some((p) => p.cambiaDia),
  };
}

/**
 * Las cifras en moneda local que Paula PUEDE decir hoy, tal cual salen del
 * bloque del reloj. Lo usa el blindaje para cazar una conversión inventada.
 *
 * Devuelve solo los números ("65.000", "30.000"…): comparar por número y no por
 * frase completa deja pasar que el modelo escriba "30.000 pesos argentinos" en
 * vez de "30.000 ARS", que es correcto y natural.
 */
export function cifrasLocalesValidas(montoUSD: number, tasasUSD?: TablaTasas): string[] {
  if (!tasasUSD) return [];
  return MONEDAS_TABLA.map((c) => precioLocal(montoUSD, c, tasasUSD))
    .map((p) => p.frase.replace(/^unos\s+/, '').replace(/\s+[A-Z]{3}$/, ''))
    .filter(Boolean);
}

/**
 * En qué días de la semana le caen los talleres a ELLA.
 *
 * Lo usa el BLINDAJE para no marcar como inventado un día que es correcto en su
 * país: a una mujer de Madrid le tocan miércoles y viernes, y exigirle "martes y
 * jueves" sería mandarla el día equivocado.
 */
export function diasTallerPara(
  ahora: Date,
  telefono?: string | null,
  paisIso?: string | null,
): string[] {
  const pais = paisDeElla(telefono, paisIso);
  if (!pais) return APEGO_DETOX.encuentros.dias.map((d) => DIAS[d]);
  return horarioParaElla(ahora, pais.tz).dias;
}

/**
 * Reloj y datos duros. Se recalcula en CADA mensaje y va PRIMERO en el prompt.
 *
 * El modelo no sabe qué día es hoy ni desde dónde le escriben. Todo lo que se
 * puede calcular se calcula aquí y se le entrega resuelto: lee y repite.
 */
export function bloqueContexto(
  ahora: Date,
  telefono: string | null | undefined,
  /**
   * ¿Ya está adentro de Apego Detox? Cambia lo que se le puede decir:
   * la FECHA del próximo encuentro en vivo es información de miembro. A una
   * mujer que llega de TikTok y todavía no ha entrado, darle "el próximo
   * encuentro es el martes 4" la cita a algo a lo que no puede entrar.
   */
  esMiembro = false,
  /**
   * Tasas de cambio del día (de `moneda.ts`). Opcional: sin ellas Paula sigue
   * dando el precio en dólares y no se rompe nada — solo pierde la conversión.
   */
  tasasUSD?: TablaTasas,
  /** El país que ELLA dijo por texto, si lo dijo. Manda sobre el indicativo. */
  paisIso?: string | null,
): string {
  const anio = new Intl.DateTimeFormat('es-CO', { timeZone: TZ_COLOMBIA, year: 'numeric' }).format(ahora);
  const hoy = `- Hoy es ${fechaLarga(ahora, TZ_COLOMBIA)} de ${anio}. En Colombia son las ${hora12(ahora, TZ_COLOMBIA)}.`;

  // "ES HOY (jueves 6 de agosto)" sí; "ES EL JUEVES 6 DE AGOSTO (jueves 6 de
  // agosto)" no — la fecha repetida en cada mensaje solo gasta contexto.
  const cuando = (o: Ocurrencia) =>
    o.frase.includes(o.fecha) ? o.frase.toUpperCase() : `${o.frase.toUpperCase()} (${o.fecha})`;

  const encuentro = proximoEncuentro(ahora);
  const precio = precioApego(ahora);
  const { encuentros, garantiaDias, checkout, landing, modulos, pilares, resultados, angulo } = APEGO_DETOX;

  // LA URGENCIA, CUANDO LA HAY. Es una fecha de calendario, no una frase de
  // venta — y a diferencia de la que tenía la clase ("no queda grabada"),
  // perdérsela no le quita el producto: le sube el precio. Empuja sin castigar.
  //
  // ⚠️ HOY NO HAY NINGUNA: el lanzamiento se cerró el 2026-08-07 y esta rama
  // está dormida. La fecha se saca de `finISO` en vez de escribirla aquí,
  // porque la anterior decía "el 15 de agosto" a mano y habría mentido en la
  // campaña siguiente. Ahora se abre una fecha nueva en APEGO_DETOX y esto
  // sale correcto solo.
  const normal = precio.antes ?? APEGO_DETOX.lanzamiento.precioNormal;
  const cierre = fechaLarga(new Date(APEGO_DETOX.lanzamiento.finISO), TZ_COLOMBIA);
  const lanzamiento = precio.enLanzamiento
    ? `🔥 LANZAMIENTO VIVO: ${precio.frase} (antes $${normal}). Le quedan ${precio.diasRestantes} días — el ${cierre} a medianoche sube a $${normal} y no vuelve a bajar. El precio le queda BLOQUEADO: mientras no cancele, sigue pagando $${precio.monto} aunque suba. Entrar hoy o entrar al día siguiente son $${normal - precio.monto} de diferencia CADA MES, para siempre.`
    : `PRECIO: ${precio.frase}. NO hay lanzamiento, NO hay descuento y NO hay fecha límite: no los nombres, no los insinúes y nunca le prometas que todavía alcanza un precio más bajo. Quien entró en el lanzamiento anterior conserva el suyo, y eso solo se dice si ELLA ya está adentro y pregunta si le va a subir.`;

  // La FECHA del próximo encuentro solo se le da a quien ya está adentro. A las
  // demás se les dice QUÉ incluye el programa (dos encuentros por semana), no
  // cuándo es el próximo: eso las citaría a algo a lo que no pueden entrar.
  // EL HORARIO EN LA SEMANA DE ELLA, ya resuelto. Si no sabemos su país, se dice
  // "hora Colombia" explícito — que es lo honesto — y se le pregunta de dónde es.
  const suPais = paisDeElla(telefono, paisIso);
  const suyo = suPais ? horarioParaElla(ahora, suPais.tz) : null;

  // ⛔ PAÍSES CON VARIAS ZONAS HORARIAS: no se afirma una hora.
  //
  // Vanesa escribió desde Phoenix el 2026-08-06 y Paula le dijo "9:00 PM": la
  // hora de Nueva York, que es la zona por defecto de Estados Unidos en la
  // tabla de países. En Phoenix eran las 6. Habría llegado TRES HORAS TARDE a
  // cada taller, todas las semanas, hasta darse de baja pensando que el
  // programa era un desastre.
  //
  // Con varias zonas, la única respuesta honesta es preguntarle la ciudad. Es
  // la regla de esta casa: mejor no saber que afirmar mal.
  const variasZonas = Boolean(suPais?.zonaAmbigua);

  const horarioTexto = variasZonas
    ? `⚠️ **EN ${(suPais?.nombre ?? '').toUpperCase()} HAY VARIAS ZONAS HORARIAS Y NO SABES EN CUÁL ESTÁ ELLA — NO le des una hora suya.** Los talleres son ${encuentros.horarioTexto} **hora de Colombia**: se lo dices así, explícito. Y le preguntas la ciudad para poder decírsela: *"¿en qué ciudad estás? así te digo a qué hora te queda"*. Darle una hora sin saber su ciudad la hace llegar tarde a todo.`
    : suyo
    ? `**${suyo.texto} — ESA ES LA HORA DE ELLA, ya convertida.** Dísela así, sin nombrar la de Colombia. Los dos talleres NO son a la misma hora: cada uno lleva la suya.${
        suyo.cambiaDia
          ? `\n⚠️ OJO: en Colombia son ${encuentros.horarioTexto}, pero por la diferencia horaria a ELLA le caen en ${suyo.dias.join(' y ')}. El día que le dices es el SUYO — si le dices el de Colombia, se conecta el día equivocado.`
          : ''
      }`
    : `${encuentros.horarioTexto} **hora Colombia** — y como no sabes su país, se lo dices así de explícito y le preguntas de dónde te escribe. NUNCA le pongas la etiqueta de su país a la hora de Colombia.`;

  const bloqueEncuentros = esMiembro
    ? `👉 SU PRÓXIMO ENCUENTRO EN VIVO CON JAVIER ${cuando(encuentro)}. Son SIEMPRE dos por semana, ${encuentros.duracionHoras} horas cada uno, por ${encuentros.plataforma}.
🕗 CUÁNDO LE CAEN A ELLA: ${horarioTexto}`
    : `LOS TALLERES EN VIVO: ${encuentros.horasSemana} horas de acompañamiento cada semana con Javier Vieira — son DOS, de ${encuentros.duracionHoras} horas cada uno, por ${encuentros.plataforma}. Eso es lo que le cuentas: que los tiene TODAS las semanas.
🕗 QUÉ DÍAS Y A QUÉ HORA LE CAEN A ELLA: ${horarioTexto}
👉 **Preguntar cuándo son es una pregunta de COMPRA, no de curiosidad**: está mirando si le cabe en la vida. Contéstale el día y la hora sin rodeos — esconderlo es perderla.
⛔ Lo que NO le das es la FECHA del próximo, con su número y su mes: eso es de las que ya están adentro, y citarla a un día al que todavía no puede entrar es prometerle algo que no tiene. **El horario de cada semana SÍ; la fecha concreta NO.**`;

  return `# ⏰ RELOJ Y DATOS DUROS — LO CALCULÓ EL SISTEMA, ES LA VERDAD
No lo deduzcas ni lo calcules: ya viene resuelto. Léelo y úsalo tal cual.

${hoy}
SE ENTRA HOY, desde el celular y a cualquier hora: no hay fecha de inicio ni nada que esperar. Nunca la cites a un día ni le preguntes si "te espera".

${bloqueEncuentros}
${lanzamiento}
${bloqueMoneda(precio.monto, telefono, tasasUSD, paisIso)}
Es SUSCRIPCIÓN mensual y cancela cuando quiera: NUNCA digas "pago único". **Eso —que es mensual y que la cancela cuando quiera— es lo que va pegado al precio**, y es lo que le quita el miedo a poner la tarjeta.

⛔ **TÚ NO OFRECES LA GARANTÍA.** No la uses como argumento: ni con el precio, ni para vencer una duda, ni para cerrar. Aunque exista y aunque venga a mano. Decisión de Javier Vieira, 2026-08-08.
✅ **PERO SI ELLA LA PREGUNTA, SE LA CONFIRMAS:** son ${garantiaDias} días. Está publicada en la página y en los términos — negársela a quien pregunta sería mentirle sobre su dinero.

## 🔗 EL LINK
👉 **Por defecto le mandas la página: ${landing}** — está en español, ahí ve el programa entero explicado y desde ahí mismo entra. Es la primera puerta, y es la que no la asusta.
💳 **El de Skool (${checkout}) es SOLO cuando ella ya va a pagar**: cuando dice que sí, cuando pregunta cómo se paga, cuando pide el link para entrar. Ahí va directo y sin rodeos — es el único sitio donde se cobra.
⛔ **Nunca las dos en el mismo mensaje.** Un mensaje, un link.

✍️ **CÓMO SE LO PRESENTAS.** El link nunca cae seco. Justo antes va una línea corta que lo invita con educación y termina con la manito 👉 — *"Puedes ingresar aquí 👉"*, *"Te dejo el acceso por aquí 👉"*, *"Aquí puedes entrar cuando quieras 👉"*. Escoge una y varíala entre mensajes; la misma frase calcada dos veces se nota. **La manito va SIEMPRE**, y va pegada al final de esa línea, no dentro del globo del link.
🔁 Se lo vuelves a mandar cada vez que le sirva (si vuelve al día siguiente, si se le perdió). Un link que hay que buscar hacia arriba en el chat es una venta perdida.
🪪 Se paga con tarjeta, dentro de Skool. **Si te dice que no tiene tarjeta, no le inventes otra forma de pagar**: eso lo resuelve Javier Vieira y se la pasas.

## 🚪 «¿Y CÓMO ME UNO?» — CONTÉSTALE ESTO, QUE ELLA NO SABE NADA
Cuando pregunta cómo se une NO te está pidiendo un trámite: te está preguntando **a qué se va a unir**. Contestarle solo el horario la deja igual de perdida que antes de preguntar, y ahí se va.

Va en este orden, y cabe en dos globos:

**1. Dónde queda y qué va a ver al abrir el link.** La comunidad vive en una plataforma que se llama **Skool**. Al entrar ve la página del grupo con un botón que dice **UNIRSE**; al darle, Skool le pide **crear su cuenta —nombre, apellido, correo y una contraseña—** y después la tarjeta. Son dos minutos, desde el celular, y queda adentro al instante: no hay lista de espera, no hay fecha de inicio y no tiene que descargar nada.

👉 **Nómbrale el paso de la cuenta ANTES de que se lo encuentre.** Ella espera pagar y entrar; si le aparece un formulario que le pide contraseña sin avisar, piensa que se equivocó de sitio y se sale. Avisado en media frase —*"te va a pedir crear tu cuenta con tu correo, es rápido"*— deja de ser un obstáculo.
⛔ Y "Skool" hay que explicarlo siempre: para ella es una palabra que no ha oído nunca, y una palabra rara sin explicar es una razón para no hacer clic.

**2. Qué se encuentra al entrar.** Aquí SÍ van viñetas cortas — es la pregunta en la que están permitidas, y es la única forma de que esto se lea de un vistazo en un celular. Tres, de menos de diez palabras cada una, de lo que va a LOGRAR (no de lo que hay en la caja). Después de que ella conteste algo, van las otras tres.

⛔ **Nada de párrafo corrido con todo adentro.** Un bloque de seis renglones con la plataforma, el horario, el precio y los módulos es exactamente lo que ella lee como folleto en cadena, y no lo lee.
⛔ **No le sueltes el precio aquí** si no lo ha preguntado: preguntó cómo entra, no cuánto cuesta.
👉 Y el link, en su propio globo, SIEMPRE. Preguntar cómo se une **es pedir el link**: si ese mensaje sale sin link, la dejaste sin puerta.

${bloqueSuPais(telefono, esMiembro ? encuentro : null, ahora, paisIso)}
`;
}
