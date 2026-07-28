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

/** Tope de globos por respuesta. El del link nunca cae fuera. */
const MAX_GLOBOS_ENVIO = 5;

const tieneUrl = (texto: string) => /https?:\/\//.test(texto);

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
export function partirEnGlobos(texto: string, maxChars = 150): string[] {
  const bloques = texto.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const piezas: Array<{ url: boolean; valor: string }> = [];

  for (const bloque of bloques) {
    // Las URLs se AÍSLAN ANTES de cortar por frases. Si no, el punto de
    // "historiasdelamente.com" se lee como fin de oración y el link sale
    // partido en dos mensajes — con eso deja de ser clicable.
    let cursor = 0;
    for (const m of bloque.matchAll(/https?:\/\/\S+/g)) {
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
    const frases = pieza.valor.match(/[^.!?…]+[.!?…]*\s*/g) || [pieza.valor];
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

  // Tope de seguridad: el largo real lo controla el blindaje (que pide
  // reescribir, sin perder texto). Esto solo evita una ráfaga absurda.
  const limpios = finales.filter(Boolean);
  if (limpios.length <= MAX_GLOBOS_ENVIO) return limpios;

  // Recortar NUNCA puede tragarse el link: sin link no hay venta. Si el globo
  // del link cae fuera del tope, se queda con el último puesto.
  const recorte = limpios.slice(0, MAX_GLOBOS_ENVIO);
  if (!recorte.some(tieneUrl)) {
    const globoConLink = limpios.slice(MAX_GLOBOS_ENVIO).find(tieneUrl);
    if (globoConLink) recorte[MAX_GLOBOS_ENVIO - 1] = globoConLink;
  }
  return recorte;
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
