// ============================================================================
// BLINDAJE ANTI-INVENTO
//
// El modelo, por bueno que sea, tarde o temprano se inventa una fecha, un
// precio o un link. Esto revisa CADA respuesta de Paula antes de que ella la
// lea: repara solo lo que se puede reparar (links y el día de la semana) y
// reporta el resto, para que el motor le pida al modelo que lo corrija.
//
// Todos los datos de la clase salen de `contexto-clase.ts` — acá no se escribe
// ni una fecha a mano. Si se duplica, se contradice.
//
// Regla de oro: es preferible que Paula diga "eso prefiero confirmártelo" a
// que le prometa a una mujer una fecha que no existe.
// ============================================================================

import { CLASE, cuentaRegresiva } from './contexto-clase';

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
const LINKS_OK = [
  'historiasdelamente.com',
  'pay.hotmart.com',
  'wa.me/',
  'chat.whatsapp.com',
];

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

// Producto suspendido durante la campaña de la clase.
const PRECIO_PROHIBIDO = /\$?\s*37[.,]97|suscripci[óo]n\s+mensual|membres[íi]a\s+mensual|al\s+mes\b/i;

const URGENCIA_FALSA = /[úu]ltimo\s+cupo|queda\s+1\s+cupo|solo\s+queda\s+un\s+cupo|[úu]ltima\s+oportunidad/i;

// Paula acompaña y vende; NO psicoeduca. Explicarle el mecanismo por chat la
// deja satisfecha con la explicación y sin entrar a la clase — y además suena
// a terapeuta, que es justo lo que no es.
const PSICOEDUCACION = /no\s+es\s+amor,?\s+es\b|sistema\s+nervioso|pidiendo\s+la\s+dosis|la\s+dosis\s+que|reca[íi]da\s+qu[íi]mica|es\s+qu[íi]mica\b|tu\s+cerebro\s+(te\s+)?(miente|est[áa]|te\s+enga)|est[áa]s\s+programada|refuerzo\s+intermitente|dopamina|cortisol/i;

// Contenido del programa Apego Detox — NO viene incluido en la clase en vivo.
const OTRO_PRODUCTO = /m[óo]dulo\s*\d+|\d+\s+m[óo]dulos|protocolo\s+de\s+\d+\s+pasos|comunidad\s+privada|apego\s+detox/i;

// La clase NO se graba (CLASE.quedaGrabada). Prometer la grabación es la
// promesa más cara de todas: la mujer paga contando con verla después y no
// existe. Se revisa solo mientras la campaña de la clase está activa — las
// clases de Apego Detox SÍ quedan grabadas y ahí decirlo es correcto.
const MENCIONA_GRABACION = /grabaci[óo]n|grabad[oa]|se\s+graba|la\s+ves\s+despu[ée]s|verla\s+despu[ée]s|queda\s+guardada|repetici[óo]n/gi;
const NEGACION = /\b(no|nunca|tampoco|sin|ni)\b/i;

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

// Promesas de futuro — prohibidas cuando la clase ya se dictó.
const PROMESA_FUTURO = /pr[óo]xim[oa]\s+jueves|este\s+jueves|faltan?\s+\d+\s+d[ií]as|es\s+ma[ñn]ana/i;

// --- EL LINK ES SAGRADO --------------------------------------------------
// Si llega mal escrito, ella no puede pagar. No basta con que el modelo lo
// copie bien: cualquier variante se normaliza al link canónico exacto.

const LANDING_SIN_ESQUEMA = CLASE.landing.replace(/^https?:\/\//, '');
const VARIANTE_LANDING = new RegExp(
  `(?:https?:\\/\\/)?(?:www\\.)?${LANDING_SIN_ESQUEMA.replace(/\./g, '\\.')}\\/?`,
  'gi',
);

function repararLinks(texto: string): string {
  let out = texto;
  // Puntuación pegada al final: "…/volver-a-mi." rompe el clic en WhatsApp.
  out = out.replace(/(https?:\/\/\S+?)[.,;:!?)]+(?=\s|$)/g, '$1');
  // Sin https://, con www, con barra de más → el canónico exacto.
  out = out.replace(VARIANTE_LANDING, CLASE.landing);
  return out;
}

/**
 * Revisa y repara la respuesta de Paula.
 * Devuelve el texto ya saneado + la lista de lo que estaba mal.
 */
export function auditarRespuesta(texto: string, ahora: Date = new Date()): { texto: string; hallazgos: Hallazgo[] } {
  const hallazgos: Hallazgo[] = [];
  const clase = fechaDeLaClase();
  const estado = cuentaRegresiva(ahora).estado;
  let out = repararLinks(texto || '');

  // 1) Links: se borran los que no están en la lista blanca.
  out = out.replace(URL_RE, (url) => {
    const limpia = url.replace(/[.,;:)]+$/, '');
    if (LINKS_OK.some((ok) => limpia.includes(ok))) return url;
    hallazgos.push({ tipo: 'link_inventado', detalle: limpia });
    return '';
  });

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

  // 6) Urgencia falsa.
  const urgencia = out.match(URGENCIA_FALSA);
  if (urgencia) hallazgos.push({ tipo: 'urgencia_falsa', detalle: urgencia[0] });

  // 7) Se puso a hacer terapia por chat.
  const psico = out.match(PSICOEDUCACION);
  if (psico) hallazgos.push({ tipo: 'psicoeducacion', detalle: psico[0] });

  // 8) Prometió contenido de Apego Detox como si viniera con la clase.
  const otro = out.match(OTRO_PRODUCTO);
  if (otro) hallazgos.push({ tipo: 'contenido_de_otro_producto', detalle: otro[0] });

  // 8b) Prometió una grabación que no existe (decir que NO existe sí se permite).
  if (CLASE.activa && !CLASE.quedaGrabada) {
    const promesa = prometeGrabacion(out);
    if (promesa) hallazgos.push({ tipo: 'grabacion_inexistente', detalle: promesa });
  }

  out = out.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  // 9) Se le fue la mano con el largo. Va de último: se mide el texto ya limpio.
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
export function instruccionCorreccion(hallazgos: Hallazgo[]): string {
  const clase = fechaDeLaClase();
  const fechaOk = `${clase.diaSemana} ${clase.numero} de ${clase.mes}`;

  const lineas = hallazgos.map((h) => {
    switch (h.tipo) {
      case 'link_inventado':
        return `- Enviaste un link que NO existe (${h.detalle}). El único link de la clase es ${CLASE.landing}, y para soporte el WhatsApp de Javier.`;
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
        return `- Usaste "${h.detalle}". Prohibido inventar escasez. Solo puedes decir que los cupos se están llenando.`;
      case 'psicoeducacion':
        return `- Escribiste "${h.detalle}": te pusiste a explicarle lo que le pasa por dentro, y eso NO lo haces por chat. Quita esa explicación. En su lugar: una frase humana y corta de que la escuchaste, y le abres la puerta de la clase.`;
      case 'demasiado_largo':
        return `- Te saliste del largo de WhatsApp (${h.detalle}). Reescríbelo en 2 globos (3 solo si uno es el link), de una o dos frases cortas cada uno. Quita las enumeraciones y deja UNA sola idea: lo que ella preguntó. Lo demás lo ve en la página.`;
      case 'contenido_de_otro_producto':
        return `- Mencionaste "${h.detalle}", que es del programa Apego Detox y NO viene con esta clase. Quítalo. Solo prometes lo que pasa en las ${CLASE.duracionHoras} horas de la clase.`;
      case 'grabacion_inexistente':
        return `- Escribiste "${h.detalle}": la clase NO queda grabada. Es en vivo, una sola vez. Quita esa promesa por completo. Si ella dijo que a esa hora no puede, díselo de frente en vez de prometerle verla después.`;
      default:
        return `- ${h.detalle}`;
    }
  });

  return `Tu respuesta anterior tenía errores de datos y NO se le envió a ella. Corrígelos y vuelve a escribir el mensaje completo, con el mismo tono, sin disculparte por el error ni mencionar esta corrección:\n${lineas.join('\n')}\n\nUsa SOLO los datos del bloque "RELOJ Y CALENDARIO" que está arriba. Si un dato no está ahí, no lo afirmes.`;
}

// ---------------------------------------------------------------------------
// HANDOFF — cuándo pasarla a un humano
// ---------------------------------------------------------------------------

const PIDE_HUMANO_RE = /(hablar|habla|comunicar|comunicarme|contactar)\s+(con\s+)?(una?\s+)?(persona|humano|humana|asesor|asesora|alguien\s+real|javier|el\s+psic[óo]logo)|eres\s+(un\s+)?(bot|robot|m[áa]quina|ia)|esto\s+es\s+(un\s+)?(bot|robot|autom[áa]tico)|no\s+quiero\s+(hablar\s+con\s+)?(un\s+)?(bot|robot|m[áa]quina)|atenci[óo]n\s+humana/i;

const PROBLEMA_PAGO_RE = /(no\s+me\s+(deja|carga|funciona|sirve)|error\s+(al|en|con)|fall[óo]\s+(el|la)|rechaz[óa]\s+(mi|la)|no\s+pude?\s+pagar|no\s+me\s+lleg[óo]|ya\s+pagu[ée]\s+y\s+no)/i;

export type MotivoHandoff = 'pide_humano' | 'problema_pago' | null;

export function motivoHandoff(mensaje: string): MotivoHandoff {
  if (PIDE_HUMANO_RE.test(mensaje)) return 'pide_humano';
  if (PROBLEMA_PAGO_RE.test(mensaje)) return 'problema_pago';
  return null;
}

/** Bloque que se añade al prompt cuando toca escalar. */
export function instruccionHandoff(motivo: Exclude<MotivoHandoff, null>): string {
  if (motivo === 'pide_humano') {
    return `# 🙋 ELLA PIDIÓ UN HUMANO — PRIORIDAD ALTA
No lo niegues, no te defiendas y no discutas si eres o no un bot. En 1-2 frases: dile que la pasas con el equipo de Javier y dale su WhatsApp directo (${CLASE.soporte}). Nada de venta en este mensaje.`;
  }
  return `# 💳 PROBLEMA CON EL PAGO O EL ACCESO — PRIORIDAD ALTA
No intentes resolverlo tú y NUNCA le pidas datos de su tarjeta. Discúlpate en una frase y pásala al equipo humano: ${CLASE.soporte}. Si lo que falla es que el link no le carga, puedes darle ${CLASE.landing} una vez.`;
}
