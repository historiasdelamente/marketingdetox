// ============================================================================
// BLINDAJE ANTI-INVENTO
//
// El modelo, por bueno que sea, tarde o temprano se inventa una fecha, un
// precio o un link. Esto revisa CADA respuesta de Paula antes de que ella la
// lea: repara solo lo que se puede reparar (links y el día de la semana) y
// reporta el resto, para que el motor le pida al modelo que lo corrija.
//
// ⚠️ DOS MODOS, REGLAS OPUESTAS:
//   'clase' → campaña de clase en vivo. Pago único, fecha fija, y nombrar
//             Apego Detox o "$37.97 al mes" es un error (otro producto).
//   'apego' → venta de Apego Detox. Suscripción de $37.97 al mes, encuentros
//             los martes y jueves, y decir "pago único" es un error.
// Aplicar las reglas del modo equivocado marca CADA mensaje como fallo y
// dispara un reintento inútil por turno. El modo sale de CLASE.activa.
//
// Todos los datos salen de `contexto-clase.ts` y `apego-detox.ts` — acá no se
// escribe ni una fecha ni un precio a mano. Si se duplica, se contradice.
//
// Regla de oro: es preferible que Paula diga "eso prefiero confirmártelo" a
// que le prometa a una mujer algo que no existe.
// ============================================================================

import { CLASE, cuentaRegresiva } from './contexto-clase';
import { APEGO } from './apego-detox';

/** En qué está vendiendo Paula ahora mismo. */
export type ModoVenta = 'clase' | 'apego';

/** El modo real del despliegue. Se apaga/enciende con `CLASE.activa`. */
export const MODO_VENTA: ModoVenta = CLASE.activa ? 'clase' : 'apego';

export type Hallazgo = {
  tipo:
    | 'link_inventado'
    | 'dia_equivocado'
    | 'fecha_inventada'
    | 'precio_prohibido'
    | 'urgencia_falsa'
    | 'clase_caducada'
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
// Un mensaje real de chat anda entre 30 y 70 caracteres. Paula puede estirarse
// hasta un par de frases, pero pasado esto deja de leerse como una persona y
// empieza a leerse como un folleto. El link no cuenta: se ve como una tarjeta,
// no como texto.
const MAX_CHARS_MENSAJE = 300;
const MAX_GLOBOS = 3;

function largoSinLinks(texto: string): number {
  return texto.replace(URL_RE, '').replace(/\s+/g, ' ').trim().length;
}

const TZ_COLOMBIA = 'America/Bogota';

/** Dominios/rutas que Paula tiene permitido enviar. Todo lo demás se borra. */
const LINKS_OK_BASE = [
  'historiasdelamente.com',
  'pay.hotmart.com',
  'wa.me/',
  'chat.whatsapp.com',
];

/** Vendiendo Apego Detox también puede mandar testimonios en video reales. */
function linksPermitidos(modo: ModoVenta): string[] {
  return modo === 'apego' ? [...LINKS_OK_BASE, APEGO.testimoniosHost] : LINKS_OK_BASE;
}

const URL_RE = /https?:\/\/[^\s<>()"']+/gi;

const MESES = 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre';
const DIAS_SEMANA = 'lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo';

/** El día, el número y el mes reales de la clase, sacados de CLASE.inicioISO. */
function fechaDeLaClase() {
  const inicio = new Date(CLASE.inicioISO);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('es-CO', { timeZone: TZ_COLOMBIA, ...opts }).format(inicio);
  return {
    diaSemana: fmt({ weekday: 'long' }).toLowerCase(),
    numero: Number(new Intl.DateTimeFormat('en-CA', { timeZone: TZ_COLOMBIA, day: 'numeric' }).format(inicio)),
    mes: fmt({ month: 'long' }).toLowerCase(),
  };
}

// --- Reglas SOLO de la campaña de clase -------------------------------------

// Producto suspendido durante la campaña de la clase.
const PRECIO_PROHIBIDO = /\$?\s*37[.,]97|suscripci[óo]n\s+mensual|membres[íi]a\s+mensual|al\s+mes\b/i;

// Contenido del programa Apego Detox — NO viene incluido en la clase en vivo.
const OTRO_PRODUCTO = /m[óo]dulo\s*\d+|\d+\s+m[óo]dulos|protocolo\s+de\s+\d+\s+pasos|comunidad\s+privada|apego\s+detox/i;

// Promesas de futuro — prohibidas cuando la clase ya se dictó.
const PROMESA_FUTURO = /pr[óo]xim[oa]\s+jueves|este\s+jueves|faltan?\s+\d+\s+d[ií]as|es\s+ma[ñn]ana/i;

// La clase NO se graba (CLASE.quedaGrabada). Prometer la grabación es la
// promesa más cara de todas: la mujer paga contando con verla después y no
// existe. Se revisa solo mientras la campaña de la clase está activa — las
// sesiones de Apego Detox SÍ quedan grabadas y ahí decirlo es correcto.
const MENCIONA_GRABACION = /grabaci[óo]n|grabad[oa]|se\s+graba|la\s+ves\s+despu[ée]s|verla\s+despu[ée]s|queda\s+guardada|repetici[óo]n/gi;
const NEGACION = /\b(no|nunca|tampoco|sin|ni)\b/i;

// --- Reglas SOLO de la venta de Apego Detox ---------------------------------

// Un precio mensual que no sea el real. Se mira solo si va pegado a "al mes"
// o "mensual": así los reencuadres honestos ("una consulta cuesta $60") y el
// "poco más de un dólar al día" no se marcan como error.
const PRECIO_MENSUAL = /\$?\s*(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:usd|d[óo]lares)?\s*(?:al\s+mes|mensual(?:es)?|por\s+mes|cada\s+mes)/gi;
const PRECIO_REAL = 37.97;

// Apego Detox es SUSCRIPCIÓN. Prometer pago único se descubre en el checkout
// y quema la venta y la confianza en el mismo segundo.
const PAGO_UNICO = /pago\s+[úu]nico|un\s+solo\s+pago|[úu]nico\s+pago|una\s+sola\s+vez\s+y\s+ya|pagas\s+una\s+vez/i;

// Un número de módulos que no es el de la página. El prompt maestro trae un
// ejemplo de cierre con "los 15 módulos completos" y el modelo lo copia literal:
// es una promesa que ella no va a encontrar cuando entre.
const MODULOS = /(\d{1,2})\s+m[óo]dulos/gi;
const MODULOS_REALES = 9;

// Pedir permiso para lo obvio la cansa y delata al bot. Es la regla que más se
// rompe: el prompt maestro la modela ("¿Te cuento cómo lo trabaja Javier?").
const PIDE_PERMISO = /(?:quieres|te\s+gustar[íi]a|deseas)\s+que\s+te\s+(?:cuente|comparta|mande|env[íi]e|pase|explique|diga|deje)|¿\s*te\s+(?:cuento|comparto|mando|env[íi]o|paso|dejo)\b/i;

// El embudo del regalo se retiró de este canal: nada es gratis aquí.
const PROMESA_GRATIS = /(?:te\s+(?:lo\s+)?(?:regalo|env[íi]o\s+gratis)|(?:clase|libro|curso|acceso|prueba|mes)\s+gratis|gratis\s+(?:el|la|los|las)\s+(?:libro|clase|curso|acceso)|sin\s+costo\s+(?:el|la)\s+(?:libro|clase|curso))/i;

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

// --- Reglas de los DOS modos ------------------------------------------------

const URGENCIA_FALSA = /[úu]ltimo\s+cupo|queda\s+1\s+cupo|solo\s+queda\s+un\s+cupo|[úu]ltima\s+oportunidad/i;

// Paula acompaña y vende; NO psicoeduca. Explicarle el mecanismo por chat la
// deja satisfecha con la explicación y sin entrar al proceso — y además suena
// a terapeuta, que es justo lo que no es.
// "estás programada" NO está en la lista a propósito: es el titular de la marca
// ("No estás rota. Estás programada."), un gancho que abre curiosidad, no una
// explicación que la deje servida. Lo que se bloquea es el mecanismo por dentro.
const PSICOEDUCACION = /no\s+es\s+amor,?\s+es\b|sistema\s+nervioso|pidiendo\s+la\s+dosis|la\s+dosis\s+que|reca[íi]da\s+qu[íi]mica|es\s+qu[íi]mica\b|tu\s+cerebro\s+(te\s+)?(miente|est[áa]|te\s+enga)|refuerzo\s+intermitente|dopamina|cortisol/i;

/**
 * ¿Está PROMETIENDO la grabación, o está diciendo que no existe?
 * "no queda grabada" es exactamente lo que queremos que diga — marcarlo
 * dispararía un reintento inútil en cada mensaje.
 * Se mira solo la cláusula en la que aparece (desde el último signo de
 * puntuación), para que un "no te preocupes, queda grabada" NO se cuele.
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

const VARIANTE_LANDING_CLASE = variante(CLASE.landing);
const VARIANTE_LANDING_APEGO = variante(APEGO.landing);
const VARIANTE_CHECKOUT_APEGO = variante(APEGO.checkout);
const VARIANTE_WA_JAVIER = /(?:https?:\/\/)?(?:www\.)?wa\.me\/57\s?300\s?168\s?1053(?:\?\S*)?/gi;

/** El WhatsApp de Javier, con el mensaje precargado solo cuando aplica. */
function linkJavier(modo: ModoVenta): string {
  return modo === 'apego' ? APEGO.whatsappJavier : 'https://wa.me/573001681053';
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
      return digitos.endsWith(APEGO.numeroJavier) ? linkJavier(modo) : match;
    }),
  );
}

function repararLinks(texto: string, modo: ModoVenta): string {
  let out = texto;
  // Puntuación pegada al final: "…/apegodetox." rompe el clic en WhatsApp.
  out = out.replace(/(https?:\/\/\S+?)[.,;:!?)]+(?=\s|$)/g, '$1');

  if (modo === 'clase') {
    out = out.replace(VARIANTE_LANDING_CLASE, CLASE.landing);
  } else {
    // El checkout va PRIMERO: su variante sin `?bid=` es prefijo de sí misma.
    out = out.replace(VARIANTE_CHECKOUT_APEGO, APEGO.checkout);
    out = out.replace(VARIANTE_LANDING_APEGO, APEGO.landing);
  }

  out = out.replace(VARIANTE_WA_JAVIER, linkJavier(modo));
  out = numeroAEnlace(out, modo);
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
  const permitidos = linksPermitidos(modo);
  out = out.replace(URL_RE, (url) => {
    const limpia = url.replace(/[.,;:)]+$/, '');
    if (permitidos.some((ok) => limpia.includes(ok))) return url;
    hallazgos.push({ tipo: 'link_inventado', detalle: limpia });
    return '';
  });

  if (modo === 'clase') {
    const clase = fechaDeLaClase();
    const estado = cuentaRegresiva(ahora).estado;

    // 2) Día de la semana pegado a la fecha de la clase: se corrige solo.
    const diaPegado = new RegExp(`\\b(${DIAS_SEMANA})\\s+(${clase.numero})\\s+de\\s+${clase.mes}`, 'gi');
    out = out.replace(diaPegado, (match, dia) => {
      if (String(dia).toLowerCase() === clase.diaSemana) return match;
      hallazgos.push({ tipo: 'dia_equivocado', detalle: match });
      return `${clase.diaSemana} ${clase.numero} de ${clase.mes}`;
    });

    // 3) Cualquier otra fecha que no sea la de la clase.
    const otraFecha = new RegExp(`\\b(\\d{1,2})\\s+de\\s+(${MESES})\\b`, 'gi');
    for (const m of out.matchAll(otraFecha)) {
      const esLaDeLaClase = Number(m[1]) === clase.numero && m[2].toLowerCase() === clase.mes;
      if (!esLaDeLaClase) {
        hallazgos.push({ tipo: 'fecha_inventada', detalle: m[0] });
      }
    }

    // 4) La clase ya se dictó: puede vender la grabación, pero NO prometer futuro.
    if (estado === 'pasada') {
      const promesa = out.match(PROMESA_FUTURO);
      if (promesa) hallazgos.push({ tipo: 'clase_caducada', detalle: promesa[0] });
    }

    // 5) Precio de otro producto.
    const precio = out.match(PRECIO_PROHIBIDO);
    if (precio) hallazgos.push({ tipo: 'precio_prohibido', detalle: precio[0] });

    // 6) Prometió contenido de Apego Detox como si viniera con la clase.
    const otro = out.match(OTRO_PRODUCTO);
    if (otro) hallazgos.push({ tipo: 'contenido_de_otro_producto', detalle: otro[0] });

    // 7) Prometió una grabación que no existe (decir que NO existe sí se permite).
    if (!CLASE.quedaGrabada) {
      const promesa = prometeGrabacion(out);
      if (promesa) hallazgos.push({ tipo: 'grabacion_inexistente', detalle: promesa });
    }
  } else {
    // 2') Un precio mensual que no es el real.
    for (const m of out.matchAll(PRECIO_MENSUAL)) {
      const valor = Number(m[1].replace(',', '.'));
      if (Number.isFinite(valor) && Math.abs(valor - PRECIO_REAL) > 0.005) {
        hallazgos.push({ tipo: 'precio_falso', detalle: m[0].trim() });
      }
    }

    // 3') Suscripción vendida como pago único.
    const unico = out.match(PAGO_UNICO);
    if (unico) hallazgos.push({ tipo: 'pago_unico', detalle: unico[0] });

    // 4') Un día de encuentro que no existe.
    const dia = diaDeEncuentroInventado(out);
    if (dia) hallazgos.push({ tipo: 'dia_encuentro_equivocado', detalle: dia });

    // 5') Regalos que ya no existen en este canal.
    const gratis = out.match(PROMESA_GRATIS);
    if (gratis) hallazgos.push({ tipo: 'promesa_gratis', detalle: gratis[0] });

    // 6') Un número de módulos que ella no va a encontrar adentro.
    for (const m of out.matchAll(MODULOS)) {
      if (Number(m[1]) !== MODULOS_REALES) {
        hallazgos.push({ tipo: 'modulos_inventados', detalle: m[0] });
      }
    }

    // 7') Le pidió permiso en vez de darle lo que sirve.
    const permiso = out.match(PIDE_PERMISO);
    if (permiso) hallazgos.push({ tipo: 'pide_permiso', detalle: permiso[0] });
  }

  // 8) Urgencia falsa (los dos modos).
  const urgencia = out.match(URGENCIA_FALSA);
  if (urgencia) hallazgos.push({ tipo: 'urgencia_falsa', detalle: urgencia[0] });

  // 9) Se puso a hacer terapia por chat (los dos modos).
  const psico = out.match(PSICOEDUCACION);
  if (psico) hallazgos.push({ tipo: 'psicoeducacion', detalle: psico[0] });

  out = out.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  // 10) Se le fue la mano con el largo. Va de último: se mide el texto ya limpio.
  const largo = largoSinLinks(out);
  const globos = out.split(/\n{2,}/).filter((g) => g.trim()).length;
  if (largo > MAX_CHARS_MENSAJE || globos > MAX_GLOBOS) {
    hallazgos.push({
      tipo: 'demasiado_largo',
      detalle: `${largo} caracteres en ${globos} globos`,
    });
  }

  return { texto: out, hallazgos };
}

/** Instrucción de corrección que se le manda al modelo en el segundo intento. */
export function instruccionCorreccion(hallazgos: Hallazgo[], modo: ModoVenta = MODO_VENTA): string {
  const clase = fechaDeLaClase();
  const fechaOk = `${clase.diaSemana} ${clase.numero} de ${clase.mes}`;

  const lineas = hallazgos.map((h) => {
    switch (h.tipo) {
      case 'link_inventado':
        return modo === 'clase'
          ? `- Enviaste un link que NO existe (${h.detalle}). El único link de la clase es ${CLASE.landing}, y para soporte el WhatsApp de Javier.`
          : `- Enviaste un link que NO existe (${h.detalle}). Los únicos links son la página (${APEGO.landing}), el pago (${APEGO.checkout}) y el WhatsApp de Javier (${APEGO.whatsappJavier}).`;
      case 'dia_equivocado':
        return `- Escribiste "${h.detalle}". La clase es el ${fechaOk}.`;
      case 'fecha_inventada':
        return `- Escribiste la fecha "${h.detalle}", que no es la de la clase. La única fecha es ${fechaOk}.`;
      case 'clase_caducada':
        return CLASE.quedaGrabada
          ? `- Escribiste "${h.detalle}" y la clase YA SE DICTÓ. No la vendas como si fuera a pasar: lo que ofreces ahora es el acceso con la grabación.`
          : `- Escribiste "${h.detalle}" y la clase YA SE DICTÓ. No queda grabación, así que no hay nada que venderle de esa edición: díselo con calidez y ofrécele avisarle de la próxima.`;
      case 'precio_prohibido':
        return `- Mencionaste "${h.detalle}". Esta clase es un PAGO ÚNICO, no una suscripción. No menciones otros productos ni mensualidades.`;
      case 'urgencia_falsa':
        return `- Usaste "${h.detalle}". Prohibido inventar escasez. No hay cupos que se acaben.`;
      case 'psicoeducacion':
        return `- Escribiste "${h.detalle}": te pusiste a explicarle lo que le pasa por dentro, y eso NO lo haces por chat. Quita esa explicación. En su lugar: una frase humana y corta de que la escuchaste, y le abres la puerta.`;
      case 'demasiado_largo':
        return `- Te saliste del largo de WhatsApp (${h.detalle}). Reescríbelo en 2 globos (3 solo si uno es el link), de una o dos frases cortas cada uno. Quita las enumeraciones y deja UNA sola idea: lo que ella preguntó. Lo demás lo ve en la página.`;
      case 'contenido_de_otro_producto':
        return `- Mencionaste "${h.detalle}", que es del programa Apego Detox y NO viene con esta clase. Quítalo. Solo prometes lo que pasa en las ${CLASE.duracionHoras} horas de la clase.`;
      case 'grabacion_inexistente':
        return `- Escribiste "${h.detalle}": la clase NO queda grabada. Es en vivo, una sola vez. Quita esa promesa por completo. Si ella dijo que a esa hora no puede, díselo de frente en vez de prometerle verla después.`;
      case 'precio_falso':
        return `- Escribiste "${h.detalle}", y ese NO es el precio. ${APEGO.nombre} son ${APEGO.precioFrase}, suscripción mensual con ${APEGO.garantiaDias} días de garantía. No inventes otra cifra.`;
      case 'pago_unico':
        return `- Escribiste "${h.detalle}". ${APEGO.nombre} es una SUSCRIPCIÓN mensual (${APEGO.precioFrase}) que ella cancela cuando quiera, no un pago único. Corrígelo: al pagar lo descubriría y perderías su confianza.`;
      case 'dia_encuentro_equivocado':
        return `- Nombraste el día "${h.detalle}" hablando de los encuentros en vivo. Son SIEMPRE ${APEGO.encuentros.diasTexto}, ${APEGO.encuentros.horaTexto} hora Colombia. Usa la fecha del próximo que está en el bloque del reloj.`;
      case 'promesa_gratis':
        return `- Escribiste "${h.detalle}". En este canal no se regala nada: no hay libro, clase, curso ni prueba gratis. Quita esa promesa y ofrécele la garantía de ${APEGO.garantiaDias} días, que sí existe.`;
      case 'modulos_inventados':
        return `- Escribiste "${h.detalle}", y ese número no es el que ella va a ver. En la página hay ${MODULOS_REALES} módulos más el Súper Bonus. Mejor todavía: no des números — nombra UN módulo, el que le responde a lo que te contó.`;
      case 'pide_permiso':
        return `- Escribiste "${h.detalle}": le pediste permiso para algo obvio, y eso te delata como bot y la cansa. Quítalo. Si la información sirve, dásela; si el link aplica, mándalo. Cierra invitando ("Te espero adentro"), no preguntando.`;
      default:
        return `- ${h.detalle}`;
    }
  });

  const cierre = modo === 'clase'
    ? 'Usa SOLO los datos del bloque "RELOJ Y CALENDARIO" que está arriba. Si un dato no está ahí, no lo afirmes.'
    : 'Usa SOLO los datos del bloque "RELOJ Y DATOS DUROS" que está arriba. Si un dato no está ahí, no lo afirmes.';

  return `Tu respuesta anterior tenía errores de datos y NO se le envió a ella. Corrígelos y vuelve a escribir el mensaje completo, con el mismo tono, sin disculparte por el error ni mencionar esta corrección:\n${lineas.join('\n')}\n\n${cierre}`;
}

// ---------------------------------------------------------------------------
// HANDOFF — cuándo pasarla a un humano
// ---------------------------------------------------------------------------

// Pedir a Javier tiene MUCHAS formas: "quiero hablar con él", "me pasas su
// número", "tiene consulta?", "quiero una cita". Todas terminan igual: el link
// clicable de su WhatsApp, sin venta encima.
const PIDE_HUMANO_RE = /(hablar|habla|comunicar|comunicarme|contactar|contacto|escribirle|conversar)\s+(con\s+|a\s+|al\s+)?(una?\s+)?(persona|humano|humana|asesor|asesora|alguien\s+real|javier|el\s+psic[óo]logo|[ée]l\s+directamente)|(?:n[uú]mero|whatsapp|celular|tel[ée]fono|contacto)\s+(de\s+|del\s+)?(javier|el\s+psic[óo]logo)|(?:cita|consulta|sesi[óo]n|terapia)\s+(?:privada|individual|personal|con\s+javier|con\s+el\s+psic[óo]logo)|eres\s+(un\s+)?(bot|robot|m[áa]quina|ia)|esto\s+es\s+(un\s+)?(bot|robot|autom[áa]tico)|no\s+quiero\s+(hablar\s+con\s+)?(un\s+)?(bot|robot|m[áa]quina)|atenci[óo]n\s+humana/i;

// Un fallo real de pago SIEMPRE nombra la cosa que falla (el link, la página,
// la tarjeta, el acceso). Sin esa exigencia, "¿y si no me funciona?" —la
// objeción de venta más común de todas— la sacaba del embudo y la mandaba con
// Javier en vez de responderle la duda.
const COSA_QUE_FALLA = 'link|enlace|p[áa]gina|bot[óo]n|pago|tarjeta|acceso|hotmart|compra|plataforma|correo';
const PROBLEMA_PAGO_RE = new RegExp(
  `(?:${COSA_QUE_FALLA})[^.!?\\n]{0,30}(?:no\\s+me\\s+(?:deja|carga|funciona|sirve)|no\\s+funciona|no\\s+carga|da\\s+error|est[áa]\\s+ca[íi]d[oa])` +
    `|(?:no\\s+me\\s+(?:deja|carga|funciona|sirve)|error\\s+(?:al|en|con)|fall[óo]|rechaz[óa])[^.!?\\n]{0,30}(?:${COSA_QUE_FALLA}|pagar|comprar|entrar)` +
    `|no\\s+pude?\\s+pagar|no\\s+me\\s+lleg[óo]\\s+(?:el|la|nada|ning)|ya\\s+pagu[ée]\\s+y\\s+no`,
  'i',
);

export type MotivoHandoff = 'pide_humano' | 'problema_pago' | null;

export function motivoHandoff(mensaje: string): MotivoHandoff {
  if (PIDE_HUMANO_RE.test(mensaje)) return 'pide_humano';
  if (PROBLEMA_PAGO_RE.test(mensaje)) return 'problema_pago';
  return null;
}

/** Bloque que se añade al prompt cuando toca escalar. */
export function instruccionHandoff(
  motivo: Exclude<MotivoHandoff, null>,
  modo: ModoVenta = MODO_VENTA,
): string {
  const link = linkJavier(modo);
  const landing = modo === 'clase' ? CLASE.landing : APEGO.landing;

  if (motivo === 'pide_humano') {
    return `# 🙋 ELLA PIDIÓ HABLAR CON JAVIER (O CON UNA PERSONA) — PRIORIDAD ALTA
No lo niegues, no te defiendas y no discutas si eres o no un bot. En 1-2 frases cortas: le dices que le pasas el WhatsApp directo de Javier y le mandas este link COMPLETO, solo, en su propio globo:

${link}

Nada de venta en este mensaje: ella pidió a Javier, le das a Javier. NUNCA escribas el número suelto — siempre el link, para que le baste con tocarlo.`;
  }

  return `# 💳 PROBLEMA CON EL PAGO O EL ACCESO — PRIORIDAD ALTA
No intentes resolverlo tú y NUNCA le pidas datos de su tarjeta. Discúlpate en una frase y pásala con Javier con este link completo, solo, en su propio globo:

${link}

Si lo que falla es que el link no le carga, puedes darle ${landing} una vez.`;
}
