// ============================================================================
// BLINDAJE ANTI-INVENTO
//
// El modelo, por bueno que sea, tarde o temprano se inventa una fecha, un
// precio o un link. Esto revisa CADA respuesta de Paula antes de que ella la
// lea: repara solo lo que se puede reparar (links y el día de la semana) y
// reporta el resto, para que el motor le pida al modelo que lo corrija.
//
// ⚠️ UN SOLO PRODUCTO DESDE EL 2026-08-05: Apego Detox, SUSCRIPCIÓN por Skool.
// Decir "pago único" es un error, y nombrar la clase del jueves también: ya no
// se vende (ver la caja de `programa.ts`).
//
// ⚠️ LA PLATAFORMA NO SE CRUZA: Apego Detox solo se paga en Skool. Un link de
// Hotmart es el error más caro que existe aquí — ella llega a pagar y no puede,
// o peor, paga otra cosa.
//
// Todos los datos salen de `programa.ts` — acá no se escribe ni una fecha ni un
// precio a mano. Si se duplica, se contradice.
//
// Regla de oro: es preferible que Paula diga "eso prefiero confirmártelo" a
// que le prometa a una mujer algo que no existe.
// ============================================================================

import type { Escalon } from './escalera';
import {
  MAX_CHARS_GLOBO,
  MAX_CHARS_TURNO,
  MAX_GLOBOS,
  largoSinLinks,
  tieneVinetas,
} from './formato';
// Se mide con `globosDe`, NO con `partirEnGlobos`: esta última ya recorta a
// tres, así que contando con ella un mensaje de cinco globos parecía de tres y
// el reintento no se disparaba nunca.
import { globosDe } from './manychat';
import { APEGO_DETOX, precioApego } from './programa';

/** En qué está vendiendo Paula. Hoy solo hay una cosa. */
export type ModoVenta = Escalon;

export const MODO_VENTA: ModoVenta = 'apego';

export type Hallazgo = {
  tipo:
    | 'link_inventado'
    | 'plataforma_cruzada'
    | 'urgencia_falsa'
    | 'psicoeducacion'
    | 'precio_falso'
    | 'pago_unico'
    | 'dia_encuentro_equivocado'
    | 'promesa_gratis'
    | 'modulos_inventados'
    | 'producto_retirado'
    | 'conversion_inventada'
    | 'pide_permiso'
    | 'vinetas'
    | 'demasiado_largo';
  detalle: string;
};

// --- El largo y la forma viven en formato.ts ---
//
// ⚠️ LOS TOPES BAJARON MUCHO EL 2026-08-03 (de 230/600/6 a 160/320/3), y el
// motivo no es estético. Los números viejos se calibraron para que cupiera la
// LISTA DE VIÑETAS —cuatro dolores más la frase que los abría— y esa lista es
// justo lo que Javier mandó eliminar: *"me estás hablando con viñetas, le estás
// haciendo como si fuera un flyer a las personas"*. Sin lista que proteger, el
// tope vuelve a ser el de un chat: tres globos, 160 caracteres cada uno.
//
// Los tres números y la definición de "línea con forma de lista" viven en
// `formato.ts`, que es también quien los HACE CUMPLIR después del modelo. Aquí
// solo se miden para pedir un reintento: reescribir sale mejor que recortar.

/** Dominios/rutas que Paula tiene permitido enviar. Todo lo demás se borra. */
const LINKS_OK = [
  'historiasdelamente.com',
  'skool.com',
  'wa.me/',
  'chat.whatsapp.com',
  /** Testimonios en video de alumnas reales (los mismos de la página). */
  'd3734kf5tip0j0.cloudfront.net',
];

/**
 * Apego Detox se cobra SOLO en Skool. Un link de Hotmart la manda a pagar otro
 * producto o a una oferta muerta, y desde que la clase se retiró ya no hay
 * ningún caso legítimo en el que Paula deba mandar uno.
 */
const PLATAFORMA_PROHIBIDA: Record<Escalon, { patron: RegExp; nombre: string }> = {
  apego: { patron: /pay\.hotmart\.com|hotmart\.com/i, nombre: 'Hotmart' },
};

/** Un salto de linea. Como constante para no pelear con los escapes. */
const SALTO = String.fromCharCode(10);

const URL_RE = /https?:\/\/[^\s<>()"']+/gi;

// --- Productos retirados ----------------------------------------------------

/**
 * LA CLASE DEL JUEVES, QUE YA NO SE VENDE.
 *
 * ⚠️ Esto NO es paranoia: el historial de cada conversación viva está lleno de
 * mensajes de Paula vendiendo la clase, y el modelo copia lo que ve arriba.
 * Sin este candado, las mujeres que ya venían hablando con ella seguirían
 * recibiendo "la clase del jueves a las 8" durante semanas.
 *
 * Se busca la CLASE como producto (con su nombre, su precio o su invitación),
 * no la palabra "clase" suelta: "las clases en vivo son dos por semana" es
 * correcto y no puede marcarse.
 */
const CLASE_RETIRADA =
  /clase\s+del\s+jueves|la\s+clase\s+en\s+vivo\s+del|recuperando\s+mi\s+ser|volver\s+a\s+m[íi]\b|te\s+espero\s+el\s+jueves|25\.?000|\b7\s*(?:usd|d[óo]lares)|120\s*(?:mxn|pesos\s+mexicanos)|volver-a-mi/i;

// La clase era el único sitio donde Nequi tenía sentido. Skool cobra con
// tarjeta y nadie recibe transferencias: si Paula da un número de Nequi, está
// mandando a una mujer a transferirle plata a alguien por su cuenta.
const NEQUI = /\bnequi\b|\bdaviplata\b/i;

/**
 * UNA CIFRA EN MONEDA LOCAL. Se caza el número y la moneda que lo acompaña.
 *
 * ⚠️ NACIÓ DE UN FALLO EN PRODUCCIÓN (2026-08-05): a una mujer con línea
 * colombiana que preguntó el precio en pesos argentinos, Paula le contestó
 * "unos 5.600 pesos argentinos" cuando eran unos 30.000. El bloque del reloj
 * solo traía la moneda de su teléfono, y lo que no tenía delante se lo inventó.
 *
 * El `precio_falso` de siempre no lo veía, y a propósito: solo vigila la cifra
 * en DÓLARES, porque la conversión es aproximada por diseño. Esto cubre el otro
 * lado — que sea aproximada no significa que pueda ser cualquiera.
 */
const CIFRA_LOCAL =
  /(\d{1,3}(?:[.,]\d{3})+|\d{2,3})\s*(pesos?|COP|MXN|ARS|CLP|PEN|EUR|BRL|DOP|CRC|GTQ|soles?|euros?|reales?|quetzales?|colones?)\b/gi;

// --- Reglas SOLO del escalón de Apego Detox ---------------------------------

// Un precio mensual que no sea el vigente. Se mira solo si va pegado a "al mes"
// o "mensual": así los reencuadres honestos ("una consulta cuesta $60") y el
// "menos de un dólar al día" no se marcan como error.
//
// ⚠️ EXIGE MARCA DE DÓLAR ("$", "usd" o "dólares"), y no es un detalle: desde
// que Paula convierte a moneda local, el cierre correcto dice "20 dólares al
// mes, unos 80.000 pesos". Con la versión anterior —donde la marca de moneda
// era opcional— ese "80.000 al mes" entraba como cifra, se leía como 0 y se
// marcaba precio falso en CADA mensaje de cierre, quemando el reintento en algo
// que estaba perfecto. El precio en pesos es aproximado por diseño; el único
// número que tiene que cuadrar exacto es el dólar.
const PRECIO_MENSUAL = /(?:\$\s*(\d{1,3}(?:[.,]\d{1,2})?)|(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:usd|d[óo]lares))\s*(?:al\s+mes|mensual(?:es)?|por\s+mes|cada\s+mes)/gi;

// Apego Detox es SUSCRIPCIÓN. Prometer pago único se descubre en el checkout
// y quema la venta y la confianza en el mismo segundo.
const PAGO_UNICO = /pago\s+[úu]nico|un\s+solo\s+pago|[úu]nico\s+pago|una\s+sola\s+vez\s+y\s+ya|pagas\s+una\s+vez/i;

// Un número de módulos que no es el del aula: es una promesa que ella no va a
// encontrar cuando entre.
const MODULOS = /(\d{1,2})\s+m[óo]dulos/gi;
/** Sale de `programa.ts`, que es lo que dice la página de Skool. Nunca a mano. */
const MODULOS_REALES = APEGO_DETOX.modulos;

/**
 * Los talleres son martes y jueves EN COLOMBIA. Cualquier otro día es inventado…
 * salvo que ella viva donde la diferencia horaria los corre de día.
 *
 * ⚠️ ESTO ERA UN FALSO POSITIVO CARO, visto el 2026-08-05 probando el bot como
 * una mujer de Madrid: las 8 PM del martes en Colombia son las 3 de la madrugada
 * del MIÉRCOLES en España, así que Paula le dijo —bien— "miércoles y viernes", y
 * el blindaje se lo marcó como día inventado. La corrección le habría exigido
 * decirle "martes y jueves", que para ella es el día equivocado.
 *
 * Por eso los días válidos LLEGAN POR PARÁMETRO, ya calculados para su zona.
 * Aquí no se decide cuáles son: solo se comprueba que no diga otros.
 */
const TODOS_LOS_DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

/** Colombia, que es lo que vale mientras no sepamos de dónde escribe ella. */
export const DIAS_TALLER_COLOMBIA = ['martes', 'jueves'];

/** "lunes|mi[ée]rcoles|viernes|…" — todos MENOS los suyos. */
function patronDiasProhibidos(validos: string[]): string {
  const sinTilde = (s: string) => s.replace('é', '[ée]').replace('á', '[áa]');
  return TODOS_LOS_DIAS.filter((d) => !validos.includes(d)).map(sinTilde).join('|');
}

// OJO con el otro falso positivo, el de siempre: "hoy es viernes y el próximo
// taller es el martes" es CORRECTO. Por eso no basta con que el día aparezca
// cerca de la palabra "taller" — tiene que estar AFIRMÁNDOLO como día de sesión.
const patronesDiaInventado = (validos: string[]): RegExp[] => {
  const DIA_NO_ENCUENTRO = patronDiasProhibidos(validos);
  return [
  // "los viernes", "todos los miércoles" → día recurrente que no existe
  new RegExp(`\\b(?:los|todos\\s+los)\\s+(${DIA_NO_ENCUENTRO})\\b`, 'i'),
  // "la sesión es el viernes", "clase en vivo los lunes"
  new RegExp(`\\b(?:en\\s+vivo|encuentros?|sesi[óo]n|sesiones|clases?|talleres?)\\s+(?:es\\s+|son\\s+)?(?:el\\s+|los\\s+)?(${DIA_NO_ENCUENTRO})\\b`, 'i'),
  // "el viernes hay clase", "los lunes tenemos sesión"
  new RegExp(`\\b(?:el|los)\\s+(?:${DIA_NO_ENCUENTRO})\\s+(?:hay|tienes|tenemos|son|es)\\s+(?:la\\s+|el\\s+|una\\s+)?(?:clase|sesi[óo]n|encuentro|taller|en\\s+vivo)`, 'i'),
  ];
};

// --- Reglas generales --------------------------------------------------------

const URGENCIA_FALSA = /[úu]ltimo\s+cupo|queda\s+1\s+cupo|solo\s+queda\s+un\s+cupo|[úu]ltima\s+oportunidad/i;

// Nada es gratis en este canal. Es la regla #1 de las prohibiciones de Javier.
const PROMESA_GRATIS = /(?:te\s+(?:lo\s+)?(?:regalo|env[íi]o\s+gratis)|(?:clase|libro|curso|acceso|prueba|mes|taller)\s+gratis|gratis\s+(?:el|la|los|las)\s+(?:libro|clase|curso|taller)|sin\s+costo\s+(?:el|la)\s+(?:libro|clase|curso|taller))/i;

// Pedir permiso para lo obvio la cansa y delata al bot.
// Ojo con la última alternativa: un "¿Quieres?" o "¿Te parece?" suelto al final
// es la misma pedida de permiso disfrazada de cortesía, y se le escapaba porque
// no nombra lo que va a mandar. Se exige el signo de apertura y el cierre
// pegado para no marcar preguntas legítimas ("¿quieres entrar el jueves?").
const PIDE_PERMISO =
  /(?:quieres|te\s+gustar[íi]a|deseas)\s+que\s+te\s+(?:cuente|comparta|mande|env[íi]e|pase|explique|diga|deje)|¿\s*te\s+(?:cuento|comparto|mando|env[íi]o|paso|dejo)\b|¿\s*(?:quieres|te\s+parece|te\s+sirve|lo\s+quieres)\s*\?/i;

// Paula acompaña y vende; NO psicoeduca. Explicarle el mecanismo por chat la
// deja satisfecha con la explicación y sin entrar al proceso — y además suena
// a terapeuta, que es justo lo que no es.
// "estás programada" NO está en la lista a propósito: es el titular de la marca
// ("No estás rota. Estás programada."), un gancho que abre curiosidad, no una
// explicación que la deje servida.
const PSICOEDUCACION = /no\s+es\s+amor,?\s+es\b|sistema\s+nervioso|pidiendo\s+la\s+dosis|la\s+dosis\s+que|reca[íi]da\s+qu[íi]mica|es\s+qu[íi]mica\b|tu\s+cerebro\s+(te\s+)?(miente|est[áa]|te\s+enga)|refuerzo\s+intermitente|dopamina|cortisol/i;

/** Un día de la semana que no es martes ni jueves, afirmado como día de sesión. */
function diaDeEncuentroInventado(texto: string, validos: string[]): string | null {
  for (const patron of patronesDiaInventado(validos)) {
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

const VARIANTE_LANDING_APEGO = variante(APEGO_DETOX.landing);
const VARIANTE_CHECKOUT_APEGO = variante(APEGO_DETOX.checkout);
const VARIANTE_WA_JAVIER = /(?:https?:\/\/)?(?:www\.)?wa\.me\/57\s?300\s?168\s?1053(?:\?\S*)?/gi;

/**
 * El WhatsApp de Javier con el mensaje ya escrito. Sin el texto precargado,
 * ella abre el chat, se queda mirando el cursor sin saber qué poner y se sale.
 */
function linkJavier(): string {
  return APEGO_DETOX.whatsappJavier;
}

/**
 * Un número de teléfono escrito a mano. Se compara por dígitos, no por forma:
 * "+57 300 1681053", "300 168 1053" y "3001681053" son el mismo número.
 * Exige 10 dígitos o más, así ningún precio ni hora se confunde con un móvil.
 */
const CANDIDATO_TELEFONO = /(?:\b(?:al|el)\s+)?\+?\s?\d[\d\s().-]{8,18}\d/g;

/** El número suelto de Javier → link clicable. Sin link, ella no lo toca. */
function numeroAEnlace(texto: string): string {
  return fueraDeLinks(texto, (plano) =>
    plano.replace(CANDIDATO_TELEFONO, (match) => {
      const digitos = match.replace(/\D/g, '');
      return digitos.endsWith(APEGO_DETOX.numeroJavier) ? linkJavier() : match;
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

/**
 * ⛔ NO SE APELLIDA CUANDO "JAVIER" ES UN SALUDO A ELLA.
 *
 * Bug real visto en producción el 2026-08-05: una mujer llamada Javier (o el
 * propio Javier probando el bot) recibió **"Mucho gusto, Javier Vieira."**. El
 * reparador convertía cualquier "Javier" en "Javier Vieira" sin mirar si estaba
 * nombrando al psicólogo o saludándola a ella.
 *
 * Se detectan las fórmulas de saludo y de vocativo, que es donde el nombre es
 * de la persona que escribe y no del profesional.
 */
/** Un saludo o un vocativo justo antes: ahí "Javier" es ELLA, no el psicólogo. */
const SALUDO_PREVIO = /(mucho\s+gusto|encantad[ao]|hola|buenas(?:\s+\w+)?|qu[ée]\s+tal|bienvenida)\s*,?\s*$/i;

function apellidarAJavier(texto: string, nombreDeElla?: string | null): string {
  // Si ELLA se llama Javier, aquí no se apellida nada: tratarla con el apellido
  // del psicólogo es peor error que dejarlo a él sin apellido una vez.
  if (nombreDeElla && /^javier\b/i.test(nombreDeElla.trim())) return texto;

  return fueraDeLinks(texto, (plano) =>
    plano.replace(/((?:\S+\s+){0,2})\bJavier\b(?!\s+Vieira)/g, (todo, previa: string) =>
      SALUDO_PREVIO.test(previa) ? todo : `${previa}Javier Vieira`,
    ),
  );
}

/**
 * "en vivo con él" → "en vivo con Javier Vieira".
 *
 * En este chat "él" YA TIENE DUEÑO: es el hombre de ella. Las viñetas acaban de
 * decir "te despiertas pensando en él" y "revisas su última conexión", y dos
 * renglones después llega "la clase es en vivo con él". El pronombre cambia de
 * dueño sin avisar, justo en el globo que tiene que quedar cristalino.
 *
 * Se repara en silencio (no gasta reintento) porque el modelo lo hace por
 * economía de lenguaje por mucho que se lo prohíbas.
 */
// ⚠️ SOLO en contextos donde "él" nombra a quien da la sesión. Un
// `\b(con|de)\s+él\b` a secas es demasiado bruto y ya rompió una frase en una
// auditoría real: convirtió "Ya no sabes qué te gusta a ti sin consultarlo con
// él" en "…con Javier Vieira", que es exactamente el revés del error que esto
// viene a arreglar. Aquí "él" solo se toca cuando va pegado a "en vivo", a
// "taller/clase/terapia" o a la duración.
const EL_ES_JAVIER: RegExp[] = [
  /\ben\s+vivo\s+con\s+(él)\b/gi,
  /\b(?:taller(?:es)?|clases?|terapias?|sesi[óo]n|sesiones)\s+(?:en\s+vivo\s+)?(?:es\s+|son\s+)?con\s+(él)\b/gi,
  /\bcon\s+(él)(?=,?\s+(?:dos|2|tres|3)\s+horas)/gi,
];

/** Las viñetas son de ELLA: ahí "él" nunca es Javier. */
const LINEA_VINETA = /^\s*[•·\-–*]\s+\S/;

function desambiguarEl(texto: string): string {
  return fueraDeLinks(texto, (plano) =>
    plano
      .split('\n')
      .map((linea) => {
        if (LINEA_VINETA.test(linea)) return linea;
        return EL_ES_JAVIER.reduce(
          (acc, re) => acc.replace(re, (m, pron) => m.replace(pron, 'Javier Vieira')),
          linea,
        );
      })
      .join('\n'),
  );
}

function repararLinks(texto: string, nombreDeElla?: string | null): string {
  let out = texto;
  // Puntuación pegada al final: "…/apegodetox." rompe el clic en WhatsApp.
  out = out.replace(/(https?:\/\/\S+?)[.,;:!?)]+(?=\s|$)/g, '$1');

  out = out.replace(VARIANTE_CHECKOUT_APEGO, APEGO_DETOX.checkout);
  out = out.replace(VARIANTE_LANDING_APEGO, APEGO_DETOX.landing);

  out = out.replace(VARIANTE_WA_JAVIER, linkJavier());
  out = numeroAEnlace(out);
  out = desambiguarEl(out);
  out = apellidarAJavier(out, nombreDeElla);
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
  /**
   * Los días en que los talleres le caen a ELLA, ya convertidos a su zona. Por
   * defecto los de Colombia, que es lo válido mientras no sepamos su país.
   * Ver `patronesDiaInventado`: para una mujer en Madrid, "miércoles y viernes"
   * es la respuesta CORRECTA y marcarla dispararía una corrección equivocada.
   */
  diasTaller: string[] = DIAS_TALLER_COLOMBIA,
  /**
   * Las cifras en moneda local que HOY son ciertas (de `cifrasLocalesValidas`).
   * Vacío = no se comprueba, que es lo correcto cuando no hay tasa verificada:
   * ahí Paula no debería dar ninguna, y si da una la caza igual el prompt.
   */
  cifrasLocales: string[] = [],
  /** Cómo se llama ELLA. Si es "Javier", no se le pone el apellido del psicólogo. */
  nombreDeElla?: string | null,
): { texto: string; hallazgos: Hallazgo[] } {
  const hallazgos: Hallazgo[] = [];
  let out = repararLinks(texto || '', nombreDeElla);

  // 1) LA PLATAFORMA EQUIVOCADA — se mira ANTES de borrar nada.
  //
  // ⚠️ El orden importa desde que Hotmart salió de la lista blanca: si se
  // borrara primero, un link de Hotmart desaparecería del texto y se reportaría
  // como 'link_inventado' a secas. El modelo recibiría "ese link no existe" en
  // vez de "Apego Detox se paga SOLO en Skool, y con ese link ella no puede
  // entrar" — que es la corrección que de verdad le enseña la regla.
  const cruzada = PLATAFORMA_PROHIBIDA[modo];
  for (const m of out.matchAll(URL_RE)) {
    if (cruzada.patron.test(m[0])) {
      hallazgos.push({ tipo: 'plataforma_cruzada', detalle: m[0] });
      break;
    }
  }

  // 2) Links: se borran los que no están en la lista blanca (Hotmart incluido).
  out = out.replace(URL_RE, (url) => {
    const limpia = url.replace(/[.,;:)]+$/, '');
    if (LINKS_OK.some((ok) => limpia.includes(ok))) return url;
    // Ya se reportó arriba como plataforma cruzada: no se cuenta dos veces.
    if (!cruzada.patron.test(limpia)) {
      hallazgos.push({ tipo: 'link_inventado', detalle: limpia });
    }
    return '';
  });

  {
    const precio = precioApego(ahora);

    // 3') Un precio mensual que no es el vigente hoy.
    //
    // ⚠️ Se mide SOLO contra cifras en dólares. Desde que Paula convierte a
    // moneda local, un mensaje correcto dice "20 dólares al mes, unos 80.000
    // pesos" — y sin el filtro de moneda, esos 80.000 se marcaban como precio
    // falso en cada cierre, quemando el reintento en algo que estaba bien.
    for (const m of out.matchAll(PRECIO_MENSUAL)) {
      // Dos alternativas en el patrón ("$20 al mes" / "20 dólares al mes"),
      // así que la cifra cae en el grupo 1 o en el 2.
      const valor = Number((m[1] ?? m[2] ?? '').replace(',', '.'));
      if (Number.isFinite(valor) && Math.abs(valor - precio.monto) > 0.005) {
        hallazgos.push({ tipo: 'precio_falso', detalle: m[0].trim() });
      }
    }

    // 4') Suscripción vendida como pago único.
    const unico = out.match(PAGO_UNICO);
    if (unico) hallazgos.push({ tipo: 'pago_unico', detalle: unico[0] });

    // 4a') UNA CONVERSIÓN QUE NO SALIÓ DEL BLOQUE DEL RELOJ.
    if (cifrasLocales.length > 0) {
      for (const m of out.matchAll(CIFRA_LOCAL)) {
        const cifra = m[1];
        // "20 dólares… unos 65.000 pesos" — el 20 es el precio en USD y va con
        // su moneda al lado, así que no entra aquí. Solo se juzgan las locales.
        if (!cifrasLocales.includes(cifra)) {
          hallazgos.push({ tipo: 'conversion_inventada', detalle: m[0].trim() });
          break;
        }
      }
    }

    // 4b') LA CLASE RETIRADA. El historial de las conversaciones vivas está
    //      lleno de mensajes donde Paula la vendía, y el modelo copia lo que ve
    //      arriba: sin este candado seguiría ofreciéndola durante semanas.
    const retirado = out.match(CLASE_RETIRADA) ?? out.match(NEQUI);
    if (retirado) hallazgos.push({ tipo: 'producto_retirado', detalle: retirado[0] });

    // 5') Un día de encuentro que no existe.
    const dia = diaDeEncuentroInventado(out, diasTaller);
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

  // 12) LE MANDÓ UNA LISTA. Es el error de forma más caro que existe en este
  //     canal: una mujer que acaba de contar que lleva nueve años con alguien
  //     recibe viñetas y entiende, sin pensarlo, que le llegó un folleto en
  //     cadena. `formato.ts` lo arregla igual antes de enviarlo, pero se marca
  //     aquí para gastar el reintento en que el modelo lo reescriba bien: una
  //     frase escogida por él siempre queda mejor que la que salva el código.
  if (tieneVinetas(out)) {
    hallazgos.push({ tipo: 'vinetas', detalle: 'el mensaje trae líneas con forma de lista' });
  }

  // 13) Se le fue la mano con el largo. Va de último: se mide el texto ya limpio.
  const largo = largoSinLinks(out);

  // Dos medidas distintas, a propósito:
  //
  // · EL LARGO se mide sobre los BLOQUES QUE ESCRIBIÓ EL MODELO. Un folleto es
  //   un párrafo de corrido, y eso solo se ve aquí: al enviarse,
  //   `partirEnGlobos` lo trocea por frases y ya no se distingue de un mensaje
  //   bien escrito.
  // · EL NÚMERO se cuenta sobre los globos QUE ELLA VA A RECIBIR, con la misma
  //   función del envío. El modelo escribe 4 líneas y el envío cose las cortas
  //   en 3; contar las 4 marcaba como largos mensajes que llegan perfectos.
  const bloques = out.split(/\n+/).filter((g) => g.trim());
  const bloqueMasLargo = Math.max(0, ...bloques.map(largoSinLinks));
  const globosReales = globosDe(out).length;

  if (bloqueMasLargo > MAX_CHARS_GLOBO || largo > MAX_CHARS_TURNO || globosReales > MAX_GLOBOS) {
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
  _modo: ModoVenta = MODO_VENTA,
  ahora: Date = new Date(),
  /** Los días del taller EN LA ZONA DE ELLA. Ver `auditarRespuesta`. */
  diasTaller: string[] = DIAS_TALLER_COLOMBIA,
  /** Las cifras locales ciertas de hoy, para decírselas en la corrección. */
  cifrasLocales: string[] = [],
): string {
  const precio = precioApego(ahora);

  const lineas = hallazgos.map((h) => {
    switch (h.tipo) {
      case 'link_inventado':
        return `- Enviaste un link que NO existe (${h.detalle}). Los únicos links son el de Skool, que es donde se entra y se paga (${APEGO_DETOX.checkout}), la página (${APEGO_DETOX.landing}) y el WhatsApp de Javier (${APEGO_DETOX.whatsappJavier}).`;
      case 'plataforma_cruzada':
        return `- Mandaste un link de Hotmart (${h.detalle}). ${APEGO_DETOX.nombre} se paga SOLO en Skool: ${APEGO_DETOX.checkout} — con ese link ella no puede entrar al programa.`;
      case 'conversion_inventada':
        return `- Escribiste "${h.detalle}", y esa conversión NO es la de hoy: te la inventaste. Las únicas cifras válidas están en el bloque del reloj, ya calculadas con la tasa de hoy${cifrasLocales.length ? ` (${cifrasLocales.join(' · ')})` : ''}. Usa la que corresponda a la moneda que ella te pidió, y si esa moneda no está en la lista, dile que se lo confirmas — no la calcules tú.`;
      case 'producto_retirado':
        return `- Escribiste "${h.detalle}", y eso ya NO se vende. La clase suelta del jueves se retiró: ahora los talleres en vivo son parte del programa, dos por semana. Tampoco existe el pago por Nequi — se paga con tarjeta dentro de Skool. Quítalo y ofrécele ${APEGO_DETOX.nombre}, que se entra HOY: ${APEGO_DETOX.checkout}`;
      case 'urgencia_falsa':
        return `- Usaste "${h.detalle}". Prohibido inventar escasez. No hay cupos que se acaben: la única fecha real es el 15 de agosto, cuando sube el precio.`;
      case 'psicoeducacion':
        return `- Escribiste "${h.detalle}": te pusiste a explicarle lo que le pasa por dentro, y eso NO lo haces por chat. Quita esa explicación. En su lugar, las tres piezas de siempre: la escuchaste, eso se trabaja adentro, y ahí hay más mujeres pasando por lo mismo.`;
      case 'vinetas':
        return `- Le mandaste una LISTA, y eso está prohibido en todos los mensajes sin excepción. Nada de •, guiones, números ni frases cortas en renglones seguidos: eso se ve como un folleto en cadena y es justo lo que la hace irse. Escoge UNA sola de esas líneas —la que más se parezca a lo que ELLA te contó— y escríbela como una frase normal, pegada a lo que ella dijo. Las demás se borran.`;
      case 'demasiado_largo':
        return `- Te pasaste de largo: ${h.detalle}. El tope son **${MAX_CHARS_TURNO} caracteres de texto** repartidos en **${MAX_GLOBOS} globos como mucho, y el del link es uno de los tres** — o sea DOS globos de texto, de ${MAX_CHARS_GLOBO} caracteres cada uno como máximo, separados por una línea en blanco. Escoge los DOS datos que ella necesita ahora mismo y borra los demás: si preguntó el precio, el precio y el link. Lo que incluye, los talleres, la comunidad y la garantía NO caben todos en el mismo mensaje, y lo primero que sobra es la frase de despedida.`;
      case 'precio_falso':
        return `- Escribiste "${h.detalle}", y ese NO es el precio de hoy. ${APEGO_DETOX.nombre} son ${precio.frase}, suscripción mensual con ${APEGO_DETOX.garantiaDias} días de garantía. No inventes otra cifra en dólares. (La equivalencia en su moneda sí es aproximada: esa va con "unos" y te la da el bloque del reloj, ya calculada.)`;
      case 'pago_unico':
        return `- Escribiste "${h.detalle}". ${APEGO_DETOX.nombre} es una SUSCRIPCIÓN mensual (${precio.frase}) que ella cancela cuando quiera, no un pago único. Corrígelo: al pagar lo descubriría y perderías su confianza.`;
      case 'dia_encuentro_equivocado':
        return `- Nombraste el día "${h.detalle}" hablando de los talleres en vivo. A ELLA le caen **${diasTaller.join(' y ')}**, tal como está calculado en el bloque del reloj. Usa esos días y esa hora: no los deduzcas ni los traduzcas tú.`;
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

// 0) RIESGO. Va antes que todo y no es un handoff a Javier: es parar la venta.
//
// ⚠️ ESTO NO EXISTÍA. Los cinco motivos de abajo son todos comerciales, y los
// 16 tipos de Hallazgo revisan links, precios y largo — ninguno revisaba si
// ella acababa de decir que le pegan o que se quiere morir. Toda la seguridad
// dependía de que el modelo se acordara del protocolo de crisis, que está
// enterrado al final del prompt; y DESPUÉS de ese protocolo venían las líneas
// de venta, así que lo último que leía antes de escribir era "¿está el link?".
// Una mujer que escribe "me pegó" y recibe un link de pago no es un riesgo
// teórico: es lo que ese orden produce.
// OJO: sin `\b` al final de las alternativas con tilde. En JS "ó" no es un
// carácter de palabra, así que `\b` después de "golpeó" no casa nunca — es el
// mismo tropiezo que ya está documentado arriba con "pagué". Una mujer que
// escribe "anoche me golpeó" tiene que disparar esto sí o sí.
/**
 * LAS SEÑALES QUE PARAN LA VENTA.
 *
 * ⚠️ TIENE QUE CUBRIR LO MISMO QUE `03_protocolo_crisis.md`. Estaban desfasados:
 * el protocolo listaba "ojalá no me despertara", "ya no quiero estar aquí",
 * "sería mejor si no estuviera" y "no tiene sentido seguir", y el regex no. Eso
 * lo salvaba el modelo porque tenía el protocolo entero delante en cada mensaje
 * — y dejó de valer cuando el protocolo pasó a cargarse solo en crisis. Si se
 * añade una señal al protocolo, se añade aquí el mismo día.
 *
 * Ante la duda, esta lista peca de ancha: un falso positivo cuesta una venta,
 * un falso negativo cuesta otra cosa.
 */
const RIESGO_RE =
  /me\s+peg(a|ó|o)|me\s+golpe(a|ó|o)|me\s+amenaz|me\s+va\s+a\s+matar|me\s+quiere\s+matar|tengo\s+miedo\s+de\s+(lo\s+que\s+)?(me\s+)?(haga|hacerme)|me\s+quiero\s+morir|quiero\s+morirme|no\s+quiero\s+vivir|no\s+quiero\s+seguir\s+viviendo|quitarme\s+la\s+vida|hacerme\s+da[ñn]o|da[ñn]arme|lastimarme|cortarme|quiero\s+desaparecer|matarme|suicid|mejor\s+(si\s+)?no\s+estuviera|ya\s+no\s+quiero\s+estar\s+aqu[íi]|ojal[áa]\s+no\s+(me\s+)?despert|no\s+despertar(me)?\s+m[áa]s|no\s+tiene\s+sentido\s+seguir|para\s+qu[ée]\s+seguir\s+viviendo|acabar\s+con\s+(todo|mi\s+vida)/i;

/** ¿Ella dijo algo que obliga a parar la venta en este mismo turno? */
export function hayRiesgo(mensaje: string): boolean {
  return RIESGO_RE.test(mensaje || '');
}

/** Habla de plata. El 155 o el 123 de una línea de ayuda no caen aquí: no
 *  llevan separador de miles ni moneda al lado. */
const HABLA_DE_PLATA =
  /\d{1,3}[.,]\d{3}|\b\d+\s*(?:usd|cop|mxn|d[óo]lares|pesos)|pago\s+[úu]nico|\bvale\b|\bcuesta\b|\bprecio\b/i;

/**
 * Deja el mensaje sin NADA de venta. Se aplica cuando `motivoHandoff` devolvió
 * 'crisis', y es la garantía por código de lo que el prompt ya pide: el modelo
 * puede olvidarlo, esto no.
 *
 * Borra los links de producto, cualquier línea que hable de plata y las
 * viñetas. NO toca el WhatsApp de Javier Vieira ni los números de las líneas de
 * ayuda: eso es justamente lo único que ella necesita en ese momento.
 *
 * Se filtra por LÍNEA y no por trozo a propósito: borrar el precio a media
 * frase deja "Son , pago único", que se lee peor que no haber borrado nada.
 */
export function quitarVentaEnCrisis(texto: string): string {
  const sinEsquema = (url: string) => url.replace(/^https?:\/\//, '').replace(/\?.*$/, '');
  const productos = [
    APEGO_DETOX.landing,
    APEGO_DETOX.checkout,
    // Los links de los productos RETIRADOS también. En crisis no puede
    // sobrevivir ningún link de venta, y el modelo tiene el de la clase en el
    // historial de la conversación: es exactamente el sitio donde podría
    // repetirlo por inercia. Aquí equivocarse no cuesta una venta.
    'historiasdelamente.com/volver-a-mi',
    'pay.hotmart.com',
  ].map(sinEsquema);

  return (texto || '')
    .split('\n')
    .filter((linea) => {
      if (/^\s*[•·\-–*]\s+\S/.test(linea)) return false;
      if (productos.some((p) => linea.includes(p))) return false;
      if (HABLA_DE_PLATA.test(linea)) return false;
      return true;
    })
    .join('\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * PREGUNTA POR LA CLASE RETIRADA.
 *
 * Javier lo dictó el 2026-08-05: *"si preguntan por la clase le das el link de
 * WhatsApp"*. Va por código y no por prompt porque quien pregunta por un
 * producto que ya no existe suele traer algo que Paula no puede resolver —
 * la compró y no sabe qué pasa con su acceso, la vio en un anuncio que sigue
 * corriendo, o le prometieron algo. Eso lo atiende él.
 *
 * ⚠️ Busca la CLASE como producto, no la palabra "clase": "¿las clases en vivo
 * son todas las semanas?" es una pregunta legítima del programa y no puede
 * dispararlo.
 */
const PREGUNTA_CLASE_RE =
  /clase\s+del\s+jueves|recuperando\s+mi\s+ser|volver\s+a\s+m[íi]\b|la\s+clase\s+(?:en\s+vivo\s+)?(?:de|del|que)\b|clase\s+suelta|(?:compr[ée]|pagu[ée]|inscrib[íi])\s+(?:la\s+)?clase|clase\s+de\s+25|clase\s+de\s+hotmart/i;

/**
 * Deja SOLO el WhatsApp de Javier: quita el link del programa y el de la página.
 *
 * ⚠️ Es la garantía por código de lo que el prompt ya pide en el handoff de
 * `pregunta_clase`. Probándolo el 2026-08-05, Paula mandó los DOS links en el
 * mismo mensaje —el de él y el de Skool— y encima la frase quedó cortada al
 * comprimir globos. Pedirlo por prompt no basta cuando el resto del sistema le
 * está diciendo que venda: aquí el mensaje tiene un solo destino, y es él.
 *
 * Se filtra por línea, como en crisis: borrar un link a media frase deja el
 * texto peor que no haber borrado nada.
 */
export function dejarSoloJavier(texto: string): string {
  const sinEsquema = (url: string) => url.replace(/^https?:\/\//, '').replace(/\?.*$/, '');
  const productos = [APEGO_DETOX.checkout, APEGO_DETOX.landing].map(sinEsquema);

  return (texto || '')
    .split('\n')
    .filter((linea) => !productos.some((p) => linea.includes(p)))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Quita el link del programa cuando ella YA lo tiene y no lo ha pedido.
 *
 * ⚠️ Es el candado que faltaba. El prompt tenia SEIS ordenes de mandar el link
 * —una de ellas cerrando el prompt entero, que es la posicion que mas pesa—
 * contra dos de no mandarlo. Con un modelo literal gana lo concreto y lo
 * ultimo, asi que el link salia en cada mensaje y esa es la mitad visible de
 * "parece dando el mismo guion".
 *
 * Se filtra por linea, como en crisis: quitar un link a media frase deja el
 * texto peor que no tocarlo.
 */
export function quitarLinkRepetido(texto: string): string {
  const productos = [APEGO_DETOX.checkout, APEGO_DETOX.landing]
    .map((url) => url.replace(/^https?:\/\//, '').replace(/\?.*$/, ''));

  return (texto || '')
    .split(SALTO)
    .filter((linea) => !productos.some((prod) => linea.includes(prod)))
    .join(SALTO)
    .replace(/\n{3,}/g, SALTO + SALTO)
    .trim();
}

export type MotivoHandoff =
  | 'crisis'
  | 'pide_humano'
  | 'problema_pago'
  | 'compra_cerrada'
  | 'recibo_pago'
  | 'sin_tarjeta'
  | 'pregunta_clase'
  | null;

export function motivoHandoff(mensaje: string): MotivoHandoff {
  // El riesgo manda sobre todo lo demás, incluido "ya pagué".
  if (hayRiesgo(mensaje)) return 'crisis';
  // El orden importa. El fallo de pago va ANTES que la compra cerrada: "ya
  // pagué y no me llegó el acceso" empieza igual que un cierre feliz, pero es
  // lo contrario — felicitarla ahí sería quedar como sordos.
  if (RECIBO_RE.test(mensaje)) return 'recibo_pago';
  if (PROBLEMA_PAGO_RE.test(mensaje)) return 'problema_pago';
  if (COMPRA_CERRADA_RE.test(mensaje)) return 'compra_cerrada';
  if (SIN_TARJETA_RE.test(mensaje)) return 'sin_tarjeta';
  if (PIDE_HUMANO_RE.test(mensaje)) return 'pide_humano';
  // Va de último: "ya pagué la clase" es un recibo, y "no puedo pagar la clase"
  // es un problema de pago. Los dos se atienden antes que la pregunta en sí.
  if (PREGUNTA_CLASE_RE.test(mensaje)) return 'pregunta_clase';
  return null;
}

/** Bloque que se añade al prompt cuando toca escalar. */
export function instruccionHandoff(
  motivo: Exclude<MotivoHandoff, null>,
  _modo: ModoVenta = MODO_VENTA,
): string {
  const link = linkJavier();
  const landing = APEGO_DETOX.landing;

  switch (motivo) {
    case 'crisis':
      return `# 🛑 ELLA DIJO ALGO GRAVE — SE ACABÓ LA VENTA EN ESTE TURNO
Acaba de nombrar violencia física, amenazas o que se quiere morir. **Nada de lo que dice el resto del prompt aplica aquí.**

PROHIBIDO en este mensaje, sin excepción: el link del programa, el precio, la lista de viñetas, invitarla a entrar, preguntarle si quiere.

Lo único que haces:
1. UNA frase que le diga que la leíste y que eso que está viviendo es serio. Sin dramatizar y sin "todo va a estar bien".
2. La línea de ayuda de SU país, tal como está en el PROTOCOLO DE CRISIS de abajo, con el número completo.
3. Si hay peligro ahora mismo, el número de emergencias de su país.

No la interrogues, no le des consejos, no le digas qué hacer con su relación y no le enseñes técnicas. Entregas la línea y ahí termina el mensaje.`;

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

    case 'pregunta_clase':
      return `# 🗓️ PREGUNTA POR LA CLASE DEL JUEVES — SE LA PASAS A JAVIER
Está preguntando por un producto que **ya no se vende**. No se lo vendas, no le des su precio, no le des su fecha y NUNCA le mandes su página ni un link de Hotmart.

Dos globos y el link, en este orden:
1. La verdad en una línea: los talleres en vivo con Javier Vieira ahora son parte del programa — son dos por semana, todas las semanas, en vez de una clase suelta. Sin disculparte y sin explicarle cambios de negocio.
2. Le dices que eso se lo confirma Javier Vieira directamente, y le mandas este link COMPLETO, solo, en su propio globo:

${link}

Le dices qué escribirle: que preguntó por la clase del jueves. **Si ya la había comprado, con más razón** — eso solo lo puede resolver él.

⛔ En este mensaje NO va el link de Skool ni el precio del programa: un solo link por mensaje, y aquí el que toca es el de él. Si ella vuelve preguntando por el programa, ahí retomas normal.`;
  }
}
