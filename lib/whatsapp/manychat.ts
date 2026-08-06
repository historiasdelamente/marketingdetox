// ============================================================================
// CLIENTE MANYCHAT — envío PROACTIVO de mensajes (Paula responde por su cuenta)
//
// Por qué existe: la "Solicitud externa" de ManyChat se cae a los 10 segundos.
// Si Paula tiene que esperar 10 segundos a que la mujer termine de escribir y
// además pensar la respuesta, NO cabe en esos 10 segundos. La salida es
// invertir el flujo: el webhook contesta vacío al instante y Paula empuja la
// respuesta después, por la API de ManyChat. Este archivo es ese empujón.
//
// Requiere MANYCHAT_API_TOKEN (ya configurado — mismo token que usan los
// recordatorios en app/api/cron/recordatorios-apego).
// ============================================================================

import { MAX_CHARS_GLOBO, comprimirGlobos, esLineaVineta } from './formato';

const API_URL = 'https://api.manychat.com/fb/sending/sendContent';

export type Canal = 'whatsapp' | 'instagram';

export function normalizarCanal(canal?: string | null): Canal {
  return String(canal || '').toLowerCase() === 'instagram' ? 'instagram' : 'whatsapp';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// EL LINK ES SAGRADO
// Un link partido, con un asterisco de más o recortado del mensaje deja a la
// mujer sin poder pagar. Todo lo que toca el texto respeta estas dos reglas:
// una URL nunca se corta, y una URL nunca se pierde.
// ---------------------------------------------------------------------------

const URL_RE = /https?:\/\/\S+/g;

/**
 * Tope de globos por respuesta: TRES, y el del link es uno de los tres.
 *
 * Este es el número que ella cuenta en la pantalla, así que es el que manda.
 * Antes eran 7 —cinco bloques aprobados por el blindaje más los links
 * aislados— y esa ráfaga es literalmente la queja de Javier el 2026-08-03:
 * *"veo que mandas tres, cuatro mensajes seguidos, mandas el link, eso así no
 * es"*. Cuatro mensajes de golpe no se leen como alguien contestando, se leen
 * como un sistema descargando información encima de alguien.
 *
 * `formato.aplicarFormato` ya dejó tres bloques antes de llegar aquí; este
 * tope es el último seguro, por si el corte por frases de un bloque largo
 * volvió a multiplicarlos. El rescate de links de abajo garantiza que recortar
 * nunca se coma el enlace: sin link no hay venta.
 */
const MAX_GLOBOS_ENVIO = 3;

const tieneUrl = (texto: string) => /https?:\/\//.test(texto);

/**
 * Quita la palabrita que quedó colgando donde estaba el link.
 *
 * "…le mandas el comprobante a" → "…le mandas el comprobante". Son las que
 * anuncian lo que venía justo detrás: preposiciones, artículos y los "aquí /
 * acá" de "aquí te lo dejo". También se lleva los dos puntos y la coma finales,
 * que sin el link detrás no van a ninguna parte.
 */
const CONECTOR_FINAL = /[\s,:;]*\b(?:a|al|en|con|por|para|de|del|hacia|aqu[íi]|ac[áa]|este|esta|ese|esa|el|la|lo)\b[\s,:;]*$/i;

function sinConectorFinal(texto: string): string {
  return texto.replace(CONECTOR_FINAL, '').replace(/[\s,:;]+$/, '');
}

/**
 * Aplica `fn` solo al texto, dejando las URLs intactas.
 * El marcador es deliberadamente improbable: con uno "normal" (por ejemplo
 * " 0 ") un texto como "son 3 horas" terminaria convertido en una URL.
 */
function respetandoLinks(texto: string, fn: (fragmento: string) => string): string {
  const urls: string[] = [];
  const conMarcas = texto.replace(URL_RE, (url) => {
    urls.push(url);
    return `<<<URL${urls.length - 1}>>>`;
  });
  return fn(conMarcas).replace(/<<<URL(\d+)>>>/g, (_m, i) => urls[Number(i)] ?? '');
}

/** Envía un bloque de texto tal cual (línea en blanco = globo aparte). */
export async function enviarManyChat(
  subscriberId: string,
  texto: string,
  canal: Canal = 'whatsapp',
): Promise<void> {
  const token = process.env.MANYCHAT_API_TOKEN;
  if (!token) throw new Error('MANYCHAT_API_TOKEN no configurado');

  const messages = texto
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ type: 'text', text: p }));

  if (messages.length === 0) return;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriber_id: Number(subscriberId),
      data: { version: 'v2', content: { type: canal, messages } },
    }),
    signal: AbortSignal.timeout(15000),
  });

  const data = await response.json().catch(() => ({}));
  if (data?.status !== 'success') {
    throw new Error(`ManyChat error: ${JSON.stringify(data).slice(0, 400)}`);
  }
}

// ---------------------------------------------------------------------------
// NEGRITAS — WhatsApp no entiende markdown
// ---------------------------------------------------------------------------

/** Máximo de palabras en negrita por mensaje. Más de esto grita, no resalta. */
const MAX_NEGRITAS = 2;

/**
 * Deja las negritas como cada canal las entiende:
 *   - WhatsApp: `*palabra*` (asterisco simple). El modelo tiende a escribir
 *     `**palabra**` por costumbre de markdown, y eso se ve literal en el chat.
 *   - Instagram: no tiene negrita. Los asteriscos se quitan del todo.
 * Y se limita a MAX_NEGRITAS: la negrita solo funciona si es escasa.
 */
export function normalizarNegritas(texto: string, canal: Canal = 'whatsapp'): string {
  // Las URLs se apartan primero: una con guiones bajos dobles, o con un
  // asterisco, saldría mutilada por estas mismas reglas.
  return respetandoLinks(texto || '', (fragmento) => {
    // **x** y __x__ → *x*
    let out = fragmento
      .replace(/\*\*([^*\n]+)\*\*/g, '*$1*')
      .replace(/__([^_\n]+)__/g, '*$1*');

    if (canal === 'instagram') {
      return out.replace(/\*([^*\n]+)\*/g, '$1');
    }

    // De la tercera negrita en adelante, se quita el resaltado (no el texto).
    let vistas = 0;
    out = out.replace(/\*([^*\n]+)\*/g, (_m, contenido) => {
      vistas += 1;
      return vistas <= MAX_NEGRITAS ? `*${contenido}*` : String(contenido);
    });

    return out;
  });
}

// ---------------------------------------------------------------------------
// RITMO HUMANO
// ---------------------------------------------------------------------------

/**
 * ms que "tarda en escribir" un globo. Calibrado para globos cortos de chat:
 * ~60 caracteres salen en 2 segundos, que es lo que tarda alguien escribiendo
 * en el celular. Antes la fórmula estaba pensada para párrafos y dejaba pausas
 * de 6 segundos entre frases de una línea — se sentía lento, no humano.
 */
function tiempoDeTecleo(texto: string): number {
  const base = 400 + texto.length * 28;
  return Math.min(Math.max(base, 900), 4000);
}

/**
 * Parte la respuesta en globos como escribe una persona:
 *   - respeta las líneas en blanco que ya vengan del modelo
 *   - si un globo quedó larguísimo, lo corta por frases
 *   - un link SIEMPRE va en su propio globo (así se ve limpio en WhatsApp)
 */
/**
 * Los globos TAL COMO SALDRÍAN, sin recortar.
 *
 * ⚠️ Existe separada de `partirEnGlobos` por un tropiezo real: cuando el tope
 * de envío bajó a 3, el blindaje —que contaba con `partirEnGlobos`— dejó de
 * poder detectar un mensaje de cinco globos, porque la función ya se los había
 * recortado a tres antes de devolverlos. La comprobación quedó siempre en
 * verde y el reintento nunca se disparaba. Quien quiera MEDIR usa esta; quien
 * quiera ENVIAR usa la de abajo.
 */
export function globosDe(texto: string, maxChars = MAX_CHARS_GLOBO): string[] {
  // Se parte por CUALQUIER salto de línea, no solo por la línea en blanco. El
  // modelo mezcla los dos —a veces separa dos ideas con un `\n` suelto— y con
  // el corte antiguo esas dos ideas salían pegadas en un globo de 260
  // caracteres: justo el ladrillo que no queremos que ella reciba.
  const bloques = texto.split(/\n+/).map((b) => b.trim()).filter(Boolean);
  const piezas: Array<{ url: boolean; valor: string }> = [];

  for (const bloque of bloques) {
    // Las URLs se AÍSLAN ANTES de cortar por frases. Si no, el punto de
    // "historiasdelamente.com" se lee como fin de oración y el link sale
    // partido en dos mensajes — con eso deja de ser clicable.
    const urls = [...bloque.matchAll(/https?:\/\/\S+/g)];

    // EL LINK EN MITAD DE LA FRASE. El modelo escribe "le mandas el comprobante
    // a <link> para que te dé acceso", y al sacar la URL de ahí quedaban tres
    // trozos: "…el comprobante a", el link, y "para que te dé acceso". En la
    // auditoría del 2026-08-03 eso llegó al chat como *"por WhatsApp a para que
    // te dé acceso"* — una preposición huérfana, que es justo el tipo de
    // costura que delata a un bot. La frase se recompone entera y el link se va
    // al final, que es donde lo pondría cualquiera escribiendo por WhatsApp.
    if (urls.length === 1) {
      const m = urls[0];
      const inicio = m.index ?? 0;
      const antes = bloque.slice(0, inicio).trim();
      const despues = bloque.slice(inicio + m[0].length).trim();

      if (antes && despues) {
        piezas.push({ url: false, valor: `${sinConectorFinal(antes)} ${despues}`.trim() });
        piezas.push({ url: true, valor: m[0] });
        continue;
      }
    }

    let cursor = 0;
    for (const m of urls) {
      const antes = bloque.slice(cursor, m.index).trim();
      if (antes) piezas.push({ url: false, valor: antes });
      piezas.push({ url: true, valor: m[0] });
      cursor = (m.index ?? 0) + m[0].length;
    }
    const resto = bloque.slice(cursor).trim();
    if (resto) piezas.push({ url: false, valor: resto });
  }

  const globos: string[] = [];
  for (const pieza of piezas) {
    if (pieza.url || pieza.valor.length <= maxChars) {
      globos.push(pieza.valor);
      continue;
    }
    // Corte por frases, agrupando hasta maxChars (aquí ya no hay URLs).
    //
    // ⚠️ EL PUNTO DE "25.000 COP" NO ES UN FIN DE ORACIÓN. Sin el lookahead, el
    // precio salía partido en dos globos —"Vale 25." / "000 COP"— y ella leía
    // un precio que no existe, justo en el mensaje que tenía que cerrar la
    // venta. `[.!?…](?=\d)` deja pasar el punto que lleva un dígito detrás.
    const frases = pieza.valor.match(/(?:[^.!?…]|[.!?…](?=\d))+[.!?…]*\s*/g) || [pieza.valor];
    let acc = '';
    for (const frase of frases) {
      if ((acc + frase).trim().length > maxChars && acc.trim()) {
        globos.push(acc.trim());
        acc = frase;
      } else {
        acc += frase;
      }
    }
    if (acc.trim()) globos.push(acc.trim());
  }

  // Cosido final: una frase corta de entrada ("Aquí aseguras tu lugar:") o una
  // cola mínima ("💛") viajan pegadas al link, no como globo suelto.
  const finales: string[] = [];
  for (const globo of globos) {
    const previo = finales[finales.length - 1];
    const esUrl = /^https?:\/\//.test(globo);

    if (esUrl && previo && !/^https?:\/\//.test(previo) && previo.length <= 40) {
      finales[finales.length - 1] = `${previo} ${globo}`;
      continue;
    }
    if (!esUrl && globo.length <= 6 && previo && /https?:\/\/\S+$/.test(previo)) {
      finales[finales.length - 1] = `${previo} ${globo}`;
      continue;
    }
    finales.push(globo);
  }

  return finales.filter(Boolean);
}

/**
 * Los globos que se ENVÍAN de verdad: como mucho `MAX_GLOBOS_ENVIO`.
 *
 * El largo real lo controla el blindaje (que pide reescribir, sin perder texto)
 * y la forma la garantiza `formato.ts`. Esto solo evita una ráfaga absurda si
 * algo se les escapó a los dos.
 */
export function partirEnGlobos(texto: string, maxChars = MAX_CHARS_GLOBO): string[] {
  // Se comprime FUSIONANDO, nunca tirando: los links conservan su globo y no se
  // pierde ni una frase. El detalle de por qué —y qué se rompió cuando esto
  // recortaba por el final— está en `formato.comprimirGlobos`.
  return comprimirGlobos(globosDe(texto, maxChars), MAX_GLOBOS_ENVIO);
}

/**
 * Envía la respuesta como la mandaría una persona: globo por globo, con la
 * pausa que tomaría escribirlo. `pausaInicial` es el respiro antes del primer
 * mensaje (que la mujer no vea la respuesta salir en el mismo segundo).
 */
export async function responderComoHumana(
  subscriberId: string,
  texto: string,
  canal: Canal = 'whatsapp',
  pausaInicial = 0,
): Promise<number> {
  const globos = partirEnGlobos(texto);
  if (globos.length === 0) return 0;

  if (pausaInicial > 0) await sleep(pausaInicial);

  for (let i = 0; i < globos.length; i++) {
    if (i > 0) await sleep(tiempoDeTecleo(globos[i]));
    await enviarManyChat(subscriberId, globos[i], canal);
  }

  return globos.length;
}

/**
 * EL TELEFONO DE ELLA, PREGUNTADO A MANYCHAT.
 *
 * POR QUE EXISTE. La Solicitud externa de ManyChat estaba enviando el marcador
 * literal "{{phone}}" en vez del numero (visto en produccion el 2026-08-06:
 * decenas de filas de wa_users con ese texto). Consecuencia: Paula no sabia de
 * que pais era NINGUNA mujer, asi que no le daba la hora en su zona ni el
 * precio en su moneda — que es medio embudo.
 *
 * Arreglarlo en el panel de ManyChat es un clic, pero deja el sistema colgando
 * de que ese clic siga bien puesto para siempre. Esto lo hace robusto: el
 * `subscriber_id` SI llega bien (sin el no habria conversacion), y con el se le
 * pregunta el telefono a la API. Si algun dia alguien vuelve a romper la
 * plantilla, Paula ni se entera.
 *
 * Ante cualquier fallo devuelve null y no rompe nada: se sigue sin saber el
 * pais, que es exactamente donde estabamos.
 */
const INFO_URL = 'https://api.manychat.com/fb/subscriber/getInfo';

export async function telefonoDeManyChat(subscriberId: string): Promise<string | null> {
  const token = process.env.MANYCHAT_API_TOKEN;
  if (!token || !subscriberId) return null;

  try {
    const r = await fetch(`${INFO_URL}?subscriber_id=${encodeURIComponent(subscriberId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return null;

    const data = (await r.json()) as { status?: string; data?: Record<string, unknown> };
    if (data.status !== 'success' || !data.data) return null;

    // ManyChat nombra el campo distinto segun el canal, asi que se prueban los
    // tres y gana el primero que traiga digitos suficientes.
    for (const campo of ['whatsapp_phone', 'phone', 'wa_id']) {
      const v = data.data[campo];
      if (typeof v === 'string' && v.replace(/\D/g, '').length >= 8) return v;
    }
    return null;
  } catch {
    return null;
  }
}
