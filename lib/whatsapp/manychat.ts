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
  // **x** y __x__ → *x*
  let out = (texto || '')
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
  const globos: string[] = [];

  for (const bloque of bloques) {
    if (bloque.length <= maxChars) {
      globos.push(bloque);
      continue;
    }
    // Corte por frases, agrupando hasta maxChars.
    const frases = bloque.match(/[^.!?…]+[.!?…]*\s*/g) || [bloque];
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

  // Un link solo, en su propio globo.
  const finales: string[] = [];
  for (const g of globos) {
    const m = g.match(/^([\s\S]*?)\s*(https?:\/\/\S+)\s*([\s\S]*)$/);
    if (m && m[1].trim().length > 40) {
      finales.push(m[1].trim());
      finales.push([m[2], m[3].trim()].filter(Boolean).join(' ').trim());
    } else {
      finales.push(g);
    }
  }

  // Tope de seguridad: el largo real lo controla el blindaje (que pide
  // reescribir, sin perder texto). Esto solo evita una ráfaga absurda.
  return finales.filter(Boolean).slice(0, 5);
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
