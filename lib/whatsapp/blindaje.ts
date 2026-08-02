// ============================================================================
// BLINDAJE ANTI-INVENTO
//
// El modelo, por bueno que sea, tarde o temprano se inventa una fecha, un
// precio o un link. Esto revisa CADA respuesta de Paula antes de que ella la
// lea: repara solo lo que se puede reparar (links y el día de la semana) y
// reporta el resto, para que el motor le pida al modelo que lo corrija.
//
// ⚠️ LAS REGLAS DEPENDEN DEL ESCALÓN (ver `escalera.ts`):
//   'clase' → la clase del jueves. PAGO ÚNICO por Hotmart. Hablar de
//             mensualidades aquí es un error: es otro producto.
//   'apego' → Apego Detox. SUSCRIPCIÓN por Skool. Decir "pago único" es un error.
// El escalón llega por parámetro en cada turno — ya no es un interruptor global
// del despliegue. Antes o se vendía la clase o se vendía Apego, nunca los dos.
//
// ⚠️ LA PLATAFORMA NO SE CRUZA: Apego Detox solo se paga en Skool; la clase y
// todo lo demás, en Hotmart. Mandar el link correcto de la plataforma
// equivocada es el error más caro: ella llega a pagar y no puede.
//
// Todos los datos salen de `programa.ts` — acá no se escribe ni una fecha ni un
// precio a mano. Si se duplica, se contradice.
//
// Regla de oro: es preferible que Paula diga "eso prefiero confirmártelo" a
// que le prometa a una mujer algo que no existe.
// ============================================================================

import type { Escalon } from './escalera';
import { partirEnGlobos } from './manychat';
import { APEGO_DETOX, CLASE_JUEVES, precioApego, proximaClase } from './programa';

/** En qué está vendiendo Paula en este turno. */
export type ModoVenta = Escalon;

/** Por defecto se ofrece la clase: es el escalón de entrada. */
export const MODO_VENTA: ModoVenta = 'clase';

export type Hallazgo = {
  tipo:
    | 'link_inventado'
    | 'plataforma_cruzada'
    | 'dia_equivocado'
    | 'fecha_inventada'
    | 'mensualidad_en_clase'
    | 'urgencia_falsa'
    | 'psicoeducacion'
    | 'contenido_de_otro_producto'
    | 'grabacion_inexistente'
    | 'precio_falso'
    | 'pago_unico'
    | 'dia_encuentro_equivocado'
    | 'promesa_gratis'
    | 'modulos_inventados'
    | 'pide_permiso'
    | 'demasiado_largo';
  detalle: string;
};

// --- Largo máximo de un mensaje de WhatsApp ---
// El link no cuenta en ninguno de los tres topes: se ve como una tarjeta, no
// como texto.
//
// ⚠️ LO QUE DELATA UN FOLLETO ES EL GLOBO GIGANTE, NO EL TOTAL. El tope
// anterior (300 chars en total) marcaba `demasiado_largo` justo en los dos
// mensajes que más venden —el saludo con día, hora y link, y el cierre por
// Nequi con sus tres pasos— y gastaba el único reintento en recortarlos: Paula
// sonaba breve y dejaba a la mujer sin los datos con los que se decide.
// Ahora el que manda es MAX_CHARS_GLOBO: tres frases cortas seguidas se leen
// como una persona escribiendo; el mismo texto en un solo bloque, no. Así cabe
// la información y el párrafo-folleto sigue prohibido.
// Calibrado con salidas reales del modelo (`_auditoria-manual.test.ts`), no a
// ojo: los mensajes buenos —los que cuentan de qué va la clase y dejan el
// link— traen un bloque largo de ~225 y suman 300-430 en total. Los folletos
// que hay que seguir cazando son un ÚNICO bloque de 340-385. De ahí los dos
// números: el que separa a uno de otro es el del BLOQUE, no el del total.
const MAX_CHARS_GLOBO = 230;
const MAX_CHARS_MENSAJE = 450;
// Globos YA CONTADOS COMO LLEGAN (el link va aislado en el suyo). Un mensaje
// bueno son 4-6: recoger lo que dijo, contarle de qué va, el link y el cierre.
// Se queda por debajo de MAX_GLOBOS_ENVIO (7) para que el blindaje pida
// reescribir ANTES de que el envío tenga que recortar. Lo que no se lee como
// una persona es el bloque largo, y de eso se encarga MAX_CHARS_GLOBO.
const MAX_GLOBOS = 6;

function largoSinLinks(texto: string): number {
  return texto.replace(URL_RE, '').replace(/\s+/g, ' ').trim().length;
}

const TZ_COLOMBIA = 'America/Bogota';

/** Dominios/rutas que Paula tiene permitido enviar. Todo lo demás se borra. */
const LINKS_OK = [
  'historiasdelamente.com',
  'pay.hotmart.com',
  'skool.com',
  'wa.me/',
  'chat.whatsapp.com',
  /** Testimonios en video de alumnas reales (los mismos de la página). */
  'd3734kf5tip0j0.cloudfront.net',
];

/** El pago de cada producto vive en una plataforma y solo en una. */
const PLATAFORMA_PROHIBIDA: Record<Escalon, { patron: RegExp; nombre: string }> = {
  // Apego Detox se cobra SOLO en Skool. Un link de Hotmart aquí la manda a pagar
  // otro producto (o a una oferta muerta).
  apego: { patron: /pay\.hotmart\.com/i, nombre: 'Hotmart' },
  // La clase se cobra en Hotmart. Skool es la puerta de Apego Detox, no de la clase.
  clase: { patron: /skool\.com/i, nombre: 'Skool' },
};

const URL_RE = /https?:\/\/[^\s<>()"']+/gi;

const MESES = 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre';
const DIAS_SEMANA = 'lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo';

/** El día, el número y el mes de la PRÓXIMA clase — calculados, nunca escritos. */
function fechaDeLaClase(ahora: Date) {
  const { inicio } = proximaClase(ahora);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('es-CO', { timeZone: TZ_COLOMBIA, ...opts }).format(inicio);
  return {
    diaSemana: fmt({ weekday: 'long' }).toLowerCase(),
    numero: Number(new Intl.DateTimeFormat('en-CA', { timeZone: TZ_COLOMBIA, day: 'numeric' }).format(inicio)),
    mes: fmt({ month: 'long' }).toLowerCase(),
  };
}

// --- Reglas SOLO del escalón de la clase ------------------------------------

// La clase es PAGO ÚNICO. Cualquier mensualidad aquí es de otro producto, y la
// mujer termina creyendo que le van a cobrar todos los meses por una clase.
const MENSUALIDAD = /suscripci[óo]n\s+mensual|membres[íi]a\s+mensual|\bal\s+mes\b|\bmensualidad\b/i;

// Contenido de Apego Detox prometido COMO PARTE de la clase. Nombrar el programa
// ya no es un error (la escalera lo permite): prometer sus módulos, sí.
const OTRO_PRODUCTO = /m[óo]dulo\s*\d+|\d+\s+m[óo]dulos|protocolo\s+de\s+\d+\s+pasos/i;

// La grabación es la promesa más cara de todas: la mujer paga contando con verla
// después. Mientras `quedaGrabada` no sea `true` explícito, no se promete.
const MENCIONA_GRABACION = /grabaci[óo]n|grabad[oa]|se\s+graba|la\s+ves\s+despu[ée]s|verla\s+despu[ée]s|queda\s+guardada|repetici[óo]n/gi;
const NEGACION = /\b(no|nunca|tampoco|sin|ni)\b/i;

// --- Reglas SOLO del escalón de Apego Detox ---------------------------------

// Un precio mensual que no sea el vigente. Se mira solo si va pegado a "al mes"
// o "mensual": así los reencuadres honestos ("una consulta cuesta $60") y el
// "menos de un dólar al día" no se marcan como error.
const PRECIO_MENSUAL = /\$?\s*(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:usd|d[óo]lares)?\s*(?:al\s+mes|mensual(?:es)?|por\s+mes|cada\s+mes)/gi;

// Apego Detox es SUSCRIPCIÓN. Prometer pago único se descubre en el checkout
// y quema la venta y la confianza en el mismo segundo.
const PAGO_UNICO = /pago\s+[úu]nico|un\s+solo\s+pago|[úu]nico\s+pago|una\s+sola\s+vez\s+y\s+ya|pagas\s+una\s+vez/i;

// Un número de módulos que no es el del aula: es una promesa que ella no va a
// encontrar cuando entre.
const MODULOS = /(\d{1,2})\s+m[óo]dulos/gi;
const MODULOS_REALES = 16;

// Los encuentros en vivo son martes y jueves. Cualquier otro día es inventado.
// OJO con el falso positivo: "hoy es viernes y el próximo encuentro es el
// martes" es CORRECTO. Por eso no basta con que el día aparezca cerca de la
// palabra "encuentro" — tiene que estar AFIRMÁNDOLO como día de sesión.
const DIA_NO_ENCUENTRO = 'lunes|mi[ée]rcoles|viernes|s[áa]bado|domingo';
const PATRONES_DIA_INVENTADO: RegExp[] = [
  // "los viernes", "todos los miércoles" → día recurrente que no existe
  new RegExp(`\\b(?:los|todos\\s+los)\\s+(${DIA_NO_ENCUENTRO})\\b`, 'i'),
  // "la sesión es el viernes", "clase en vivo los lunes"
  new RegExp(`\\b(?:en\\s+vivo|encuentros?|sesi[óo]n|sesiones|clases?)\\s+(?:es\\s+|son\\s+)?(?:el\\s+|los\\s+)?(${DIA_NO_ENCUENTRO})\\b`, 'i'),
  // "el viernes hay clase", "los lunes tenemos sesión"
  new RegExp(`\\b(?:el|los)\\s+(?:${DIA_NO_ENCUENTRO})\\s+(?:hay|tienes|tenemos|son|es)\\s+(?:la\\s+|el\\s+|una\\s+)?(?:clase|sesi[óo]n|encuentro|en\\s+vivo)`, 'i'),
];

// --- Reglas de los DOS escalones --------------------------------------------

const URGENCIA_FALSA = /[úu]ltimo\s+cupo|queda\s+1\s+cupo|solo\s+queda\s+un\s+cupo|[úu]ltima\s+oportunidad/i;

// Nada es gratis en este canal. Es la regla #1 de las prohibiciones de Javier.
const PROMESA_GRATIS = /(?:te\s+(?:lo\s+)?(?:regalo|env[íi]o\s+gratis)|(?:clase|libro|curso|acceso|prueba|mes|taller)\s+gratis|gratis\s+(?:el|la|los|las)\s+(?:libro|clase|curso|taller)|sin\s+costo\s+(?:el|la)\s+(?:libro|clase|curso|taller))/i;

// Pedir permiso para lo obvio la cansa y delata al bot.
const PIDE_PERMISO = /(?:quieres|te\s+gustar[íi]a|deseas)\s+que\s+te\s+(?:cuente|comparta|mande|env[íi]e|pase|explique|diga|deje)|¿\s*te\s+(?:cuento|comparto|mando|env[íi]o|paso|dejo)\b/i;

// Paula acompaña y vende; NO psicoeduca. Explicarle el mecanismo por chat la
// deja satisfecha con la explicación y sin entrar al proceso — y además suena
// a terapeuta, que es justo lo que no es.
// "estás programada" NO está en la lista a propósito: es el titular de la marca
// ("No estás rota. Estás programada."), un gancho que abre curiosidad, no una
// explicación que la deje servida.
const PSICOEDUCACION = /no\s+es\s+amor,?\s+es\b|sistema\s+nervioso|pidiendo\s+la\s+dosis|la\s+dosis\s+que|reca[íi]da\s+qu[íi]mica|es\s+qu[íi]mica\b|tu\s+cerebro\s+(te\s+)?(miente|est[áa]|te\s+enga)|refuerzo\s+intermitente|dopamina|cortisol/i;

/**
 * ¿Está PROMETIENDO la grabación, o está diciendo que no existe?
 * "no queda grabada" es exactamente lo que queremos que diga — marcarlo
 * dispararía un reintento inútil en cada mensaje.
 */
function prometeGrabacion(texto: string): string | null {
  for (const m of texto.matchAll(MENCIONA_GRABACION)) {
    const hasta = m.index ?? 0;
    const inicioClausula = Math.max(...[...texto.slice(0, hasta).matchAll(/[.,;:!?¡¿\n]/g)].map((p) => (p.index ?? 0) + 1), 0);
    const clausula = texto.slice(inicioClausula, hasta);
    if (!NEGACION.test(clausula)) return m[0];
  }
  return null;
}

/** Un día de la semana que no es martes ni jueves, afirmado como día de sesión. */
function diaDeEncuentroInventado(texto: string): string | null {
  for (const patron of PATRONES_DIA_INVENTADO) {
    const m = texto.match(patron);
    if (m) return m[0].trim();
  }
  return null;
}

// --- EL LINK ES SAGRADO --------------------------------------------------
// Si llega mal escrito, ella no puede pagar. No basta con que el modelo lo
// copie bien: cualquier variante se normaliza al link canónico exacto.

/** Aplica `fn` solo al texto plano, dejando las URLs intactas. */
function fueraDeLinks(texto: string, fn: (fragmento: string) => string): string {
  const urls: string[] = [];
  const conMarcas = texto.replace(URL_RE, (url) => {
    urls.push(url);
    return `\u0000URL${urls.length - 1}\u0000`;
  });
  return fn(conMarcas).replace(/\u0000URL(\d+)\u0000/g, (_m, i) => urls[Number(i)] ?? '');
}

/** Una variante escrita a mano (sin https, con www, con barra final) → canónica. */
function variante(url: string): RegExp {
  const sinEsquema = url.replace(/^https?:\/\//, '').replace(/\?.*$/, '');
  return new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${sinEsquema.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/?(?:\\?\\S*)?`, 'gi');
}

const VARIANTE_LANDING_CLASE = variante(CLASE_JUEVES.landing);
const VARIANTE_CHECKOUT_CLASE = variante(CLASE_JUEVES.checkout);
const VARIANTE_LANDING_APEGO = variante(APEGO_DETOX.landing);
const VARIANTE_CHECKOUT_APEGO = variante(APEGO_DETOX.checkout);
const VARIANTE_WA_JAVIER = /(?:https?:\/\/)?(?:www\.)?wa\.me\/57\s?300\s?168\s?1053(?:\?\S*)?/gi;

/**
 * El WhatsApp de Javier con el mensaje ya escrito, distinto por escalón.
 * Antes, en el escalón de la clase se mandaba el link pelado: ella lo abría,
 * se quedaba mirando el cursor sin saber qué poner y se salía — justo el paso
 * donde se cierra el pago por Nequi.
 */
function linkJavier(modo: ModoVenta): string {
  return modo === 'apego' ? APEGO_DETOX.whatsappJavier : CLASE_JUEVES.whatsappJavier;
}

/**
 * Un número de teléfono escrito a mano. Se compara por dígitos, no por forma:
 * "+57 300 1681053", "300 168 1053" y "3001681053" son el mismo número.
 * Exige 10 dígitos o más, así ningún precio ni hora se confunde con un móvil.
 */
const CANDIDATO_TELEFONO = /(?:\b(?:al|el)\s+)?\+?\s?\d[\d\s().-]{8,18}\d/g;

/** El número suelto de Javier → link clicable. Sin link, ella no lo toca. */
function numeroAEnlace(texto: string, modo: ModoVenta): string {
  return fueraDeLinks(texto, (plano) =>
    plano.replace(CANDIDATO_TELEFONO, (match) => {
      const digitos = match.replace(/\D/g, '');
      return digitos.endsWith(APEGO_DETOX.numeroJavier) ? linkJavier(modo) : match;
    }),
  );
}

/**
 * "Javier" a secas → "Javier Vieira".
 *
 * Ella no lo conoce: sin el apellido suena a un amigo de Paula, no al psicólogo
 * que va a dar la clase. Es una reparación silenciosa (no gasta reintento)
 * porque el modelo lo olvida a la tercera frase por mucho que se lo pidas.
 * Se deja intacto lo que va dentro de los links (el wa.me lleva "Javier" en el
 * mensaje precargado).
 */
const JAVIER_SIN_APELLIDO = /\bJavier\b(?!\s+Vieira)/g;

function apellidarAJavier(texto: string): string {
  return fueraDeLinks(texto, (plano) => plano.replace(JAVIER_SIN_APELLIDO, 'Javier Vieira'));
}

function repararLinks(texto: string, modo: ModoVenta): string {
  let out = texto;
  // Puntuación pegada al final: "…/apegodetox." rompe el clic en WhatsApp.
  out = out.replace(/(https?:\/\/\S+?)[.,;:!?)]+(?=\s|$)/g, '$1');

  if (modo === 'clase') {
    // El link de pago suelto se cambia por LA PÁGINA. El botón de pago está
    // dentro de ella: mandarle el checkout de entrada es pedirle la tarjeta
    // antes de contarle a qué la invitan, y eso la espanta.
    out = out.replace(VARIANTE_CHECKOUT_CLASE, CLASE_JUEVES.landing);
    out = out.replace(VARIANTE_LANDING_CLASE, CLASE_JUEVES.landing);
  } else {
    out = out.replace(VARIANTE_CHECKOUT_APEGO, APEGO_DETOX.checkout);
    out = out.replace(VARIANTE_LANDING_APEGO, APEGO_DETOX.landing);
  }

  out = out.replace(VARIANTE_WA_JAVIER, linkJavier(modo));
  out = numeroAEnlace(out, modo);
  out = apellidarAJavier(out);
  return out;
}

/**
 * Revisa y repara la respuesta de Paula.
 * Devuelve el texto ya saneado + la lista de lo que estaba mal.
 */
export function auditarRespuesta(
  texto: string,
  ahora: Date = new Date(),
  modo: ModoVenta = MODO_VENTA,
): { texto: string; hallazgos: Hallazgo[] } {
  const hallazgos: Hallazgo[] = [];
  let out = repararLinks(texto || '', modo);

  // 1) Links: se borran los que no están en la lista blanca.
  out = out.replace(URL_RE, (url) => {
    const limpia = url.replace(/[.,;:)]+$/, '');
    if (LINKS_OK.some((ok) => limpia.includes(ok))) return url;
    hallazgos.push({ tipo: 'link_inventado', detalle: limpia });
    return '';
  });

  // 2) La plataforma del otro producto. El link existe, pero es el de la
  //    plataforma equivocada: ella llega a pagar y no puede.
  const cruzada = PLATAFORMA_PROHIBIDA[modo];
  for (const m of out.matchAll(URL_RE)) {
    if (cruzada.patron.test(m[0])) {
      hallazgos.push({ tipo: 'plataforma_cruzada', detalle: m[0] });
      break;
    }
  }

  if (modo === 'clase') {
    const clase = fechaDeLaClase(ahora);

    // 3) Día de la semana pegado a la fecha de la clase: se corrige solo.
    const diaPegado = new RegExp(`\\b(${DIAS_SEMANA})\\s+(${clase.numero})\\s+de\\s+${clase.mes}`, 'gi');
    out = out.replace(diaPegado, (match, dia) => {
      if (String(dia).toLowerCase() === clase.diaSemana) return match;
      hallazgos.push({ tipo: 'dia_equivocado', detalle: match });
      return `${clase.diaSemana} ${clase.numero} de ${clase.mes}`;
    });

    // 4) Cualquier otra fecha que no sea la de la próxima clase.
    const otraFecha = new RegExp(`\\b(\\d{1,2})\\s+de\\s+(${MESES})\\b`, 'gi');
    for (const m of out.matchAll(otraFecha)) {
      const esLaDeLaClase = Number(m[1]) === clase.numero && m[2].toLowerCase() === clase.mes;
      if (!esLaDeLaClase) {
        hallazgos.push({ tipo: 'fecha_inventada', detalle: m[0] });
      }
    }

    // 5) Le vendió la clase como si fuera una mensualidad.
    const mensual = out.match(MENSUALIDAD);
    if (mensual) hallazgos.push({ tipo: 'mensualidad_en_clase', detalle: mensual[0] });

    // 6) Prometió contenido de Apego Detox como si viniera con la clase.
    const otro = out.match(OTRO_PRODUCTO);
    if (otro) hallazgos.push({ tipo: 'contenido_de_otro_producto', detalle: otro[0] });

    // 7) Prometió una grabación que no está confirmada (decir que NO existe sí se permite).
    if (CLASE_JUEVES.quedaGrabada !== true) {
      const promesa = prometeGrabacion(out);
      if (promesa) hallazgos.push({ tipo: 'grabacion_inexistente', detalle: promesa });
    }
  } else {
    const precio = precioApego(ahora);

    // 3') Un precio mensual que no es el vigente hoy.
    for (const m of out.matchAll(PRECIO_MENSUAL)) {
      const valor = Number(m[1].replace(',', '.'));
      if (Number.isFinite(valor) && Math.abs(valor - precio.monto) > 0.005) {
        hallazgos.push({ tipo: 'precio_falso', detalle: m[0].trim() });
      }
    }

    // 4') Suscripción vendida como pago único.
    const unico = out.match(PAGO_UNICO);
    if (unico) hallazgos.push({ tipo: 'pago_unico', detalle: unico[0] });

    // 5') Un día de encuentro que no existe.
    const dia = diaDeEncuentroInventado(out);
    if (dia) hallazgos.push({ tipo: 'dia_encuentro_equivocado', detalle: dia });

    // 6') Un número de módulos que ella no va a encontrar adentro.
    for (const m of out.matchAll(MODULOS)) {
      if (Number(m[1]) !== MODULOS_REALES) {
        hallazgos.push({ tipo: 'modulos_inventados', detalle: m[0] });
      }
    }
  }

  // 8) Regalos que no existen (los dos escalones).
  const gratis = out.match(PROMESA_GRATIS);
  if (gratis) hallazgos.push({ tipo: 'promesa_gratis', detalle: gratis[0] });

  // 9) Le pidió permiso en vez de darle lo que sirve (los dos escalones).
  const permiso = out.match(PIDE_PERMISO);
  if (permiso) hallazgos.push({ tipo: 'pide_permiso', detalle: permiso[0] });

  // 10) Urgencia falsa (los dos escalones).
  const urgencia = out.match(URGENCIA_FALSA);
  if (urgencia) hallazgos.push({ tipo: 'urgencia_falsa', detalle: urgencia[0] });

  // 11) Se puso a hacer terapia por chat (los dos escalones).
  const psico = out.match(PSICOEDUCACION);
  if (psico) hallazgos.push({ tipo: 'psicoeducacion', detalle: psico[0] });

  out = out.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  // 12) Se le fue la mano con el largo. Va de último: se mide el texto ya limpio.
  const largo = largoSinLinks(out);

  // Dos medidas distintas, a propósito:
  //
  // · EL LARGO se mide sobre los BLOQUES QUE ESCRIBIÓ EL MODELO. Un folleto es
  //   un párrafo de 340-385 caracteres de corrido, y eso solo se ve aquí: al
  //   enviarse, `partirEnGlobos` lo trocea por frases y ya no se distingue de
  //   un mensaje bien escrito.
  // · EL NÚMERO se cuenta sobre los globos QUE ELLA VA A RECIBIR, con la misma
  //   función del envío. El modelo escribe 6 líneas y el envío cose las cortas
  //   en 4; contar las 6 marcaba como largos mensajes que llegan perfectos y
  //   gastaba el reintento en encogerlos.
  const bloques = out.split(/\n+/).filter((g) => g.trim());
  const bloqueMasLargo = Math.max(0, ...bloques.map(largoSinLinks));
  const globosReales = partirEnGlobos(out).length;

  if (bloqueMasLargo > MAX_CHARS_GLOBO || largo > MAX_CHARS_MENSAJE || globosReales > MAX_GLOBOS) {
    hallazgos.push({
      tipo: 'demasiado_largo',
      detalle: `${largo} caracteres en ${globosReales} globos (el bloque más largo, ${bloqueMasLargo})`,
    });
  }

  return { texto: out, hallazgos };
}

/** Instrucción de corrección que se le manda al modelo en el segundo intento. */
export function instruccionCorreccion(
  hallazgos: Hallazgo[],
  modo: ModoVenta = MODO_VENTA,
  ahora: Date = new Date(),
): string {
  const clase = fechaDeLaClase(ahora);
  const fechaOk = `${clase.diaSemana} ${clase.numero} de ${clase.mes}`;
  const precio = precioApego(ahora);

  const lineas = hallazgos.map((h) => {
    switch (h.tipo) {
      case 'link_inventado':
        return modo === 'clase'
          ? `- Enviaste un link que NO existe (${h.detalle}). Los únicos links de la clase son la página (${CLASE_JUEVES.landing}), el pago (${CLASE_JUEVES.checkout}) y el WhatsApp de Javier.`
          : `- Enviaste un link que NO existe (${h.detalle}). Los únicos links son la página (${APEGO_DETOX.landing}), el pago en Skool (${APEGO_DETOX.checkout}) y el WhatsApp de Javier (${APEGO_DETOX.whatsappJavier}).`;
      case 'plataforma_cruzada':
        return modo === 'clase'
          ? `- Mandaste un link de Skool (${h.detalle}). Skool es SOLO para Apego Detox. La clase se paga en Hotmart: ${CLASE_JUEVES.checkout}`
          : `- Mandaste un link de Hotmart (${h.detalle}). Apego Detox se paga SOLO en Skool: ${APEGO_DETOX.checkout} — con ese link ella no puede entrar al programa.`;
      case 'dia_equivocado':
        return `- Escribiste "${h.detalle}". La próxima clase es el ${fechaOk}.`;
      case 'fecha_inventada':
        return `- Escribiste la fecha "${h.detalle}", que no es la de la clase. La única fecha es ${fechaOk}.`;
      case 'mensualidad_en_clase':
        return `- Escribiste "${h.detalle}". La clase es un PAGO ÚNICO de ${CLASE_JUEVES.precios.USD}, no una mensualidad. Quítalo: si ella cree que le van a cobrar todos los meses por una clase, no paga.`;
      case 'urgencia_falsa':
        return `- Usaste "${h.detalle}". Prohibido inventar escasez. No hay cupos que se acaben.`;
      case 'psicoeducacion':
        return `- Escribiste "${h.detalle}": te pusiste a explicarle lo que le pasa por dentro, y eso NO lo haces por chat. Quita esa explicación. En su lugar: una frase humana y corta de que la escuchaste, y le abres la puerta.`;
      case 'demasiado_largo':
        return `- Te saliste del largo de WhatsApp (${h.detalle}). Pártelo en 3 globos (4 solo si uno es el link) separados por una línea en blanco, de una o dos frases cortas cada uno — ningún globo pasa de ~200 caracteres. Recorta el relleno, NO los datos: el día, la hora, el precio, los pasos del pago y el link se quedan.`;
      case 'contenido_de_otro_producto':
        return `- Mencionaste "${h.detalle}", que es del programa Apego Detox y NO viene con esta clase. Quítalo. Solo prometes lo que pasa en las ${CLASE_JUEVES.duracionHoras} horas de la clase y lo que se lleva de ahí.`;
      case 'grabacion_inexistente':
        return `- Escribiste "${h.detalle}": no está confirmado que la clase quede grabada, así que NO lo prometas. Si ella dijo que a esa hora no puede, díselo de frente en vez de prometerle verla después.`;
      case 'precio_falso':
        return `- Escribiste "${h.detalle}", y ese NO es el precio de hoy. ${APEGO_DETOX.nombre} son ${precio.frase}, suscripción mensual con ${APEGO_DETOX.garantiaDias} días de garantía. No inventes otra cifra.`;
      case 'pago_unico':
        return `- Escribiste "${h.detalle}". ${APEGO_DETOX.nombre} es una SUSCRIPCIÓN mensual (${precio.frase}) que ella cancela cuando quiera, no un pago único. Corrígelo: al pagar lo descubriría y perderías su confianza.`;
      case 'dia_encuentro_equivocado':
        return `- Nombraste el día "${h.detalle}" hablando de los encuentros en vivo. Son SIEMPRE ${APEGO_DETOX.encuentros.diasTexto}, ${APEGO_DETOX.encuentros.horaTexto} hora Colombia. Usa la fecha del próximo que está en el bloque del reloj.`;
      case 'promesa_gratis':
        return `- Escribiste "${h.detalle}". En este canal no se regala nada: no hay clase, libro, curso ni prueba gratis. Quita esa promesa.`;
      case 'modulos_inventados':
        return `- Escribiste "${h.detalle}", y ese número no es el que ella va a ver. El aula tiene ${MODULOS_REALES} módulos más el Súper Bonus. Mejor todavía: no des números — nombra UN módulo, el que le responde a lo que te contó.`;
      case 'pide_permiso':
        return `- Escribiste "${h.detalle}": le pediste permiso para algo obvio, y eso te delata como bot y la cansa. Quítalo. Si la información sirve, dásela; si el link aplica, mándalo. Cierra invitando ("Te espero adentro"), no preguntando.`;
      default:
        return `- ${h.detalle}`;
    }
  });

  return `Tu respuesta anterior tenía errores de datos y NO se le envió a ella. Corrígelos y vuelve a escribir el mensaje completo, con el mismo tono, sin disculparte por el error ni mencionar esta corrección:\n${lineas.join('\n')}\n\nUsa SOLO los datos del bloque "RELOJ Y DATOS DUROS" que está arriba. Si un dato no está ahí, no lo afirmes.`;
}

// ---------------------------------------------------------------------------
// HANDOFF — cuándo pasarla a Javier
// ---------------------------------------------------------------------------

// Los cinco casos que dictó Javier. Los tres últimos son mujeres que YA dijeron
// que sí: son las que más se pierden si nadie las recoge.

// 1) Pedir a Javier tiene MUCHAS formas: "quiero hablar con él", "me pasas su
//    número", "tiene consulta?", "quiero una cita". Todas terminan igual: el
//    link clicable de su WhatsApp, sin venta encima.
const PIDE_HUMANO_RE = /(hablar|habla|comunicar|comunicarme|contactar|contacto|escribirle|conversar)\s+(con\s+|a\s+|al\s+)?(una?\s+)?(persona|humano|humana|asesor|asesora|alguien\s+real|javier|el\s+psic[óo]logo|[ée]l\s+directamente)|(?:n[uú]mero|whatsapp|celular|tel[ée]fono|contacto)\s+(de\s+|del\s+)?(javier|el\s+psic[óo]logo)|(?:cita|consulta|sesi[óo]n|terapia)\s+(?:privada|individual|personal|con\s+javier|con\s+el\s+psic[óo]logo)|eres\s+(un\s+)?(bot|robot|m[áa]quina|ia)|esto\s+es\s+(un\s+)?(bot|robot|autom[áa]tico)|no\s+quiero\s+(hablar\s+con\s+)?(un\s+)?(bot|robot|m[áa]quina)|atenci[óo]n\s+humana/i;

// 2) Un fallo real de pago SIEMPRE nombra la cosa que falla (el link, la página,
//    la tarjeta, el acceso). Sin esa exigencia, "¿y si no me funciona?" —la
//    objeción de venta más común de todas— la sacaba del embudo.
const COSA_QUE_FALLA = 'link|enlace|p[áa]gina|bot[óo]n|pago|tarjeta|acceso|hotmart|skool|compra|plataforma|correo';
const PROBLEMA_PAGO_RE = new RegExp(
  `(?:${COSA_QUE_FALLA})[^.!?\\n]{0,30}(?:no\\s+me\\s+(?:deja|carga|funciona|sirve)|no\\s+funciona|no\\s+carga|da\\s+error|est[áa]\\s+ca[íi]d[oa])` +
    `|(?:no\\s+me\\s+(?:deja|carga|funciona|sirve)|error\\s+(?:al|en|con)|fall[óo]|rechaz[óa])[^.!?\\n]{0,30}(?:${COSA_QUE_FALLA}|pagar|comprar|entrar)` +
    `|no\\s+pude?\\s+pagar|no\\s+me\\s+lleg[óo]\\s+(?:el|la|nada|ning)|ya\\s+pagu[ée]\\s+y\\s+no`,
  'i',
);

// 3) Cerró la venta. Javier la recibe, la mete al grupo y le dice cómo empezar.
//    El primer día después de pagar es cuando más se arrepiente la gente.
const COMPRA_CERRADA_RE = /\b(ya\s+(pagu[eé]|compr[eé]|me\s+inscrib[ií]|entr[eé])|acabo\s+de\s+(pagar|comprar|inscribirme|entrar)|ya\s+hice\s+el\s+pago|ya\s+estoy\s+(dentro|inscrita|adentro))/i;

// 4) Mandó el comprobante. Eso lo verifica Javier, no Paula.
const RECIBO_RE = /\b(comprobante|recibo|pantallazo|captura\s+del?\s+pago|soporte\s+de(l)?\s+pago|voucher|le\s+mand[oé]\s+el\s+pago|te\s+mando\s+el\s+pago)\b/i;

// 5) No tiene cómo pagar por el medio normal. La salida la resuelve Javier.
const SIN_TARJETA_RE = /\bno\s+(tengo|manejo|cuento\s+con|poseo)\s+(una\s+)?tarjeta|sin\s+tarjeta\s+(de\s+)?(cr[ée]dito|d[ée]bito)|no\s+tengo\s+(cr[ée]dito|c[óo]mo\s+pagar)|(?:puedo|hay\s+forma\s+de)\s+pagar\s+(de\s+)?otra\s+(forma|manera)|otro\s+m[ée]todo\s+de\s+pago/i;

export type MotivoHandoff =
  | 'pide_humano'
  | 'problema_pago'
  | 'compra_cerrada'
  | 'recibo_pago'
  | 'sin_tarjeta'
  | null;

export function motivoHandoff(mensaje: string): MotivoHandoff {
  // El orden importa. El fallo de pago va ANTES que la compra cerrada: "ya
  // pagué y no me llegó el acceso" empieza igual que un cierre feliz, pero es
  // lo contrario — felicitarla ahí sería quedar como sordos.
  if (RECIBO_RE.test(mensaje)) return 'recibo_pago';
  if (PROBLEMA_PAGO_RE.test(mensaje)) return 'problema_pago';
  if (COMPRA_CERRADA_RE.test(mensaje)) return 'compra_cerrada';
  if (SIN_TARJETA_RE.test(mensaje)) return 'sin_tarjeta';
  if (PIDE_HUMANO_RE.test(mensaje)) return 'pide_humano';
  return null;
}

/** Bloque que se añade al prompt cuando toca escalar. */
export function instruccionHandoff(
  motivo: Exclude<MotivoHandoff, null>,
  modo: ModoVenta = MODO_VENTA,
): string {
  const link = linkJavier(modo);
  const landing = modo === 'clase' ? CLASE_JUEVES.landing : APEGO_DETOX.landing;

  switch (motivo) {
    case 'pide_humano':
      return `# 🙋 ELLA PIDIÓ HABLAR CON JAVIER (O CON UNA PERSONA) — PRIORIDAD ALTA
No lo niegues, no te defiendas y no discutas si eres o no un bot. En 1-2 frases cortas: le dices que le pasas el WhatsApp directo de Javier y le mandas este link COMPLETO, solo, en su propio globo:

${link}

Nada de venta en este mensaje: ella pidió a Javier, le das a Javier. NUNCA escribas el número suelto — siempre el link, para que le baste con tocarlo.`;

    case 'problema_pago':
      return `# 💳 PROBLEMA CON EL PAGO O EL ACCESO — PRIORIDAD ALTA
No intentes resolverlo tú y NUNCA le pidas datos de su tarjeta. Discúlpate en una frase y pásala con Javier con este link completo, solo, en su propio globo:

${link}

Si lo que falla es que el link no le carga, puedes darle ${landing} una vez.`;

    case 'compra_cerrada':
      return `# 🎉 YA ENTRÓ — SE ACABÓ LA VENTA, AHORA LA RECIBE JAVIER — PRIORIDAD ALTA
Cero venta, cero links de pago, cero precio. En este mensaje:
1. La felicitas corto y cálido, sin exagerar.
2. Le pasas el WhatsApp de Javier, completo, solo, en su propio globo, para que él la reciba y la meta al grupo:

${link}

3. Le dices qué escribirle: que le cuente que acaba de entrar.
El primer día después de pagar es cuando más se arrepiente la gente: no la dejas sola.`;

    case 'recibo_pago':
      return `# 🧾 TE MANDÓ EL COMPROBANTE — LO VERIFICA JAVIER — PRIORIDAD ALTA
Tú no verificas pagos y NUNCA le pides datos de su tarjeta. Le agradeces en una frase y le mandas este link completo, solo, en su propio globo:

${link}

Le dices exactamente qué hacer: "mándale ahí tu comprobante y tu correo, y él te da el acceso".`;

    case 'sin_tarjeta':
      return `# 💳 NO TIENE TARJETA — LO RESUELVE JAVIER — PRIORIDAD ALTA
No inventes formas de pago, no le prometas otro método y NUNCA recibas dinero por WhatsApp. Le dices que sí hay salida y le mandas este link completo, solo, en su propio globo:

${link}

Le dices qué escribirle: que no tiene tarjeta y que quiere entrar. Javier lo resuelve con ella.`;
  }
}
