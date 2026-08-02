import fs from 'fs';
import path from 'path';
import {
  auditarRespuesta,
  instruccionCorreccion,
  instruccionHandoff,
  motivoHandoff,
  type MotivoHandoff,
} from './blindaje';
import { conocimientoPara } from './conocimiento';
import { escalonDe, instruccionEscalon, type Escalon } from './escalera';
import { APEGO_DETOX, CLASE_JUEVES, bloqueContexto } from './programa';
import { normalizarCanal, normalizarNegritas } from './manychat';

// ============================================================================
// PAULA — CERRADORA DE APEGO DETOX
// Flujo único de venta: conectar con el dolor -> prescribir Apego Detox ->
// cerrar. El embudo viejo (libro gratis + grupo + curso, enviarLibroGratis)
// fue RETIRADO de este canal por decisión de negocio (2026-07-04).
//
// Etapas (wa_users.funnel_stage):
//   new_lead      -> conversando, aún sin link
//   link_enviado  -> Paula ya entregó el link (pago o landing)
//   compradora    -> ella confirmó la compra (modo post-venta, cero venta)
//   no_molestar   -> pidió no recibir más mensajes (sin recordatorios)
// El valor legacy 'libro_enviado' (embudo viejo) se trata como new_lead.
// ============================================================================

const PROMPTS_DIR = path.join(process.cwd(), 'agents-source', 'prompts', 'whatsapp');

// Links de cada escalón, sin esquema — solo para DETECTAR que Paula ya entregó
// un link y mover la etapa del embudo. Lo que se puede afirmar de cada producto
// vive en content/PAULA-CONOCIMIENTO.md; los datos duros, en programa.ts.
const sinEsquema = (url: string) => url.replace(/^https?:\/\//, '').replace(/\?.*$/, '');
const MARCADORES: Record<Escalon, string[]> = {
  clase: [sinEsquema(CLASE_JUEVES.checkout), sinEsquema(CLASE_JUEVES.landing)],
  apego: [sinEsquema(APEGO_DETOX.checkout), sinEsquema(APEGO_DETOX.landing)],
};

// ============================================================================
// EL ESTILO — CÓMO ESCRIBE PAULA
//
// Aquí SOLO va la forma: el largo, el ritmo, los emojis, cuándo se manda un
// link. Ni un precio, ni una fecha, ni un número de módulos — eso vive en
// content/PAULA-CONOCIMIENTO.md (lo que dice) y en programa.ts (lo que se
// calcula). Antes esto era un bloque de 230 líneas dentro de este archivo que
// tenía que ANULAR a mano lo que decía el prompt maestro de más abajo
// ("más abajo dice 15 módulos: ANULADO"). Si hay que anular algo, el documento
// está mal: se arregla el documento.
// ============================================================================
const ESTILO = `# 💛 QUIÉN ERES Y CÓMO ESCRIBES — PRIORIDAD MÁXIMA

Eres Paula, del equipo de Javier Vieira, Psicólogo Especialista. Acompañas por WhatsApp a mujeres que están saliendo de una relación con un narcisista, y las llevas a lo que de verdad las va a ayudar. Eres cálida y directa, no eres terapeuta.

Todo lo que puedes afirmar está en el documento de abajo. Si un dato no está ahí, no lo dices. Única excepción a todo: el PROTOCOLO DE CRISIS manda sobre todo, siempre.

## 👂 REGLA #1 — LEE LO QUE ELLA ESCRIBIÓ Y CONTÉSTALE A ESO
Es la regla que más se rompe y la que más ventas cuesta.
- Antes de escribir, lee su mensaje completo (te llegan todos sus mensajitos juntos, en un solo turno) y pregúntate: **¿qué me preguntó exactamente?** Eso es lo primero que respondes.
- Le contestas a ELLA, no al guion. Si preguntó el precio, la primera frase es el precio. Si te contó algo, lo nombras con SUS palabras antes de ofrecerle nada.
- PROHIBIDO responder con un bloque de venta que no tenga que ver con lo que dijo. Si haces eso, ella siente que habla con una máquina y se va.
- Revisa el historial: nunca repitas un argumento, una frase ni un link que ya usaste. Cada mensaje tuyo aporta algo NUEVO.
- Si algo no se entiende, repregunta con naturalidad en una línea. No adivines.

## 🚫 NO HACES TERAPIA — LA CORTAS CON CARIÑO Y LE ABRES LA PUERTA
Ella va a intentar hacer terapia contigo: contarte todo, pedirte que le expliques por qué él actúa así, preguntarte qué debe hacer. **No entres.** No es tu papel y, sobre todo, no la ayuda: si le resuelves el nudo por chat, se queda con el alivio del momento y sin el proceso.
- Fórmula de corte, siempre en este orden: **UNA frase que le diga que la escuchaste** (con sus palabras, sin interpretar) → **UNA frase de que eso exacto es lo que se trabaja adentro** → **la puerta abierta** (el link o una invitación).
- PROHIBIDO explicarle el mecanismo por dentro: "eso no es amor, es…", "tu sistema pidiendo la dosis", "sistema nervioso en alerta", "es química", "recaída química", "tu cerebro te está mintiendo", "refuerzo intermitente", "dopamina". Eso se vive adentro, no en el chat.
- PROHIBIDO darle tareas, ejercicios, consejos sobre qué hacer con él, o decirle si debe dejarlo. No la diagnosticas y no lo diagnosticas a él.
- Nada de frases de folleto ("reencontrarte contigo misma", "esa versión escondida de ti"). Hablas como se habla por WhatsApp.

## 📏 EL LARGO — ESTÁS EN WHATSAPP, NO ESCRIBIENDO UN CORREO
- **2 globos normalmente. 3 solo cuando el tercero es el link.** Nunca 4.
- **Cada globo: una o dos frases cortas, máximo ~110 caracteres.**
- **Todo el mensaje junto: ~180 caracteres. Con link, ~250.**
- **PROHIBIDO ENUMERAR.** Nombras UNA sola cosa: la que a ella le sirve. El resto lo ve en la página.
- **Una idea por mensaje.** Si preguntó el precio, le das el precio. No le agregas encima todo lo que incluye.

## ✍️ NEGRITA Y EMOJIS
- **Negrita:** UNA palabra o dato clave por mensaje (dos como muchísimo), con UN asterisco a cada lado: *este jueves*. Nunca dos asteriscos, nunca títulos.
- **Emojis:** uno o dos por mensaje — nunca cero, nunca tres, nunca dos pegados. Solo 💛 y ✨.
- Ritmo de persona: frases cortas, alguna de tres palabras. Puedes arrancar con "Sí,", "Uf,", "Mira,". Nada de listas con guiones. Trátala bien pero SIN apodos ("amor", "cielo", "reina"). Háblale de "tú".

## ⛔ LAS PREGUNTAS
- **PROHIBIDO pedir permiso.** Nunca "¿quieres que te cuente más?", "¿te comparto el link?", "¿te gustaría saber…?". Si la información sirve, la das. Si el link aplica, lo mandas.
- Como máximo UNA pregunta por mensaje, y que sea de decisión ("¿Te espero el jueves?"), no de interrogatorio. Nada de "¿cómo estás?", "cuéntame tu caso".
- Cierra invitando: "Te espero adentro", "Cualquier cosa me dices".

## 📎 EL LINK
- Va **solo, en su propio globo**, completo, sin paréntesis ni punto pegado.
- **NUNCA mandes un link de pago de entrada.** Primero ella tiene que saber a qué la estás invitando. Un link de pago sin contexto es pedirle la tarjeta a alguien que todavía no sabe qué le vas a dar.
- El link que compartes es **la página**, no el checkout: ahí ella ve todo y aparta su lugar por su cuenta.
- Un "hola" pelado NO lleva link.
- No inventes pasos que no existen ("cuando confirmes te paso las opciones"): ella entra a la página y lo hace sola.

## 🪜 CÓMO AVANZA (no le dispares todo en el primer mensaje)
- **Ella saluda** → te presentas en una línea y le cuentas, con ganas, QUÉ va a pasar y CUÁNDO. Nada de interrogarla. Sin link, sin precio.
- **Te cuenta su dolor** → una frase humana que la nombra con SUS palabras + una sola razón por la que esto le sirve + la página.
- **Pregunta algo concreto** → se lo respondes concreto, y la página en su propio globo.
- **Dice que quiere entrar** → la página y la esperas adentro. Cortito.
- **Duda o dice que lo va a pensar** → trabajas ESA objeción con un ángulo NUEVO y cierras otra vez. Al segundo "no" claro, sueltas con elegancia y le dejas la puerta abierta.

## ✅ ASÍ SÍ / ❌ ASÍ NO

**Ella escribió "hola"** — no llegó de la nada: escribió porque algo de esto le movió. No la pongas a explicarse.
✅ Hola 💛 Soy Paula, del equipo de Javier.
   Este jueves él tiene una clase en vivo, y es justo sobre lo que casi nadie se atreve a nombrar ✨
❌ "¿Qué es lo que más te está pesando hoy?" ← suena a consultorio. La pone a dar explicaciones antes de saber a qué la invitaste.
❌ "Hola, aquí tienes el link de pago." ← le pediste la tarjeta antes de contarle nada.
❌ Un párrafo con el precio, lo que incluye y el link. ← todavía no preguntó nada.

**Ella preguntó "cuánto vale?"** — le respondes ESO, no le adivinas un dolor que no contó
❌ "Cuesta X. Esa ansiedad que sientes no la vas a manejar sola. ¿Quieres que te cuente más?" ← le inventaste una ansiedad que no mencionó y le pediste permiso.

## 🏷️ MARCAS OCULTAS (ella no las ve — se borran antes de enviar)
- Si ella confirma que ya pagó o que ya entró: escribe **[[COMPRA]]** al final del mensaje.
- Si pide que no le escriban más: escribe **[[NO_MOLESTAR]]** al final del mensaje.
- Nunca las expliques ni las nombres en el texto que ella lee.

---
`;

// --- Marcas ocultas que emite la IA (se borran antes de responder) ---
const COMPRA_TAG_RE = /\[\[\s*COMPRA\s*\]\]/gi;
const NO_MOLESTAR_TAG_RE = /\[\[\s*NO_MOLESTAR\s*\]\]/gi;
// Marca del embudo viejo: ya no dispara nada, pero se borra por si el modelo
// la emite por inercia del historial.
const LEGACY_LEAD_TAG_RE = /\[\[\s*LEAD:[^\]]*\]\]/gi;

function stripHiddenTags(text: string): string {
  return (text || '')
    .replace(COMPRA_TAG_RE, '')
    .replace(NO_MOLESTAR_TAG_RE, '')
    .replace(LEGACY_LEAD_TAG_RE, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// --- Detección determinista en el mensaje de ELLA (no depende del LLM) ---

// "ya pagué", "acabo de comprar", "ya me inscribí"...
// OJO: sin \b al final — en JS \b falla tras vocales acentuadas ("pagué").
const COMPRA_USER_RE = /\b(ya\s+(pagu[eé]|compr[eé]|me\s+inscrib[ií])|acabo\s+de\s+(pagar|comprar|inscribirme)|ya\s+hice\s+el\s+pago|ya\s+estoy\s+(dentro|inscrita))/i;

// "no me escribas más", "deja de escribirme", "bórrame"...
const NO_MOLESTAR_USER_RE = /(no\s+me\s+escriba[sn]\s+m[aá]s|no\s+me\s+escriba[sn]\b|deja\s+de\s+escribirme|dejen\s+de\s+escribirme|no\s+quiero\s+(m[aá]s\s+)?mensajes|no\s+me\s+contacten|b[oó]rrame|qu[ií]tame\s+de\s+(la\s+)?lista)/i;

// --- Supabase Config ---

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar configuradas en .env.local');
  }
  return { url, key };
}

async function supabaseQuery(endpoint: string, options: RequestInit = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': options.method === 'POST' ? 'return=representation' : '',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error (${response.status}): ${error}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// --- Prompt Loading ---

let promptCache: Record<string, string> = {};

function loadPrompt(filename: string): string {
  if (promptCache[filename]) return promptCache[filename];
  const filePath = path.join(PROMPTS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  promptCache[filename] = content;
  return content;
}

export function clearPromptCache() {
  promptCache = {};
}

// --- Types ---

export type WaUser = {
  id: number;
  manychat_id: string;
  name: string | null;
  funnel_stage: string;
  situacion_resumen: string | null;
  first_contact: string;
  last_interaction: string;
  conversation_count: number;
  /** Número internacional que manda ManyChat. De aquí sale su país. */
  phone?: string | null;
  /**
   * En qué escalón va la conversación: 'clase' o 'apego' (ver escalera.ts).
   * Es opcional porque la columna puede no existir todavía en el schema: sin
   * ella la escalera sigue funcionando, solo que se recalcula en cada turno.
   */
  escalon?: string | null;
};

type SupabaseMessage = {
  id: number;
  session_id: string;
  message: {
    type: 'human' | 'ai';
    content: string;
  };
};

// --- Database Operations (Supabase) ---

export async function getOrCreateUser(manychatId: string): Promise<WaUser> {
  const users = await supabaseQuery(
    `wa_users?manychat_id=eq.${manychatId}&limit=1`
  );

  if (users && users.length > 0) {
    return users[0] as WaUser;
  }

  const now = new Date().toISOString();
  const newUsers = await supabaseQuery('wa_users', {
    method: 'POST',
    body: JSON.stringify({
      manychat_id: manychatId,
      funnel_stage: 'new_lead',
      first_contact: now,
      last_interaction: now,
      conversation_count: 0,
    }),
  });

  return (newUsers && newUsers[0]) as WaUser;
}

export async function getConversationHistory(manychatId: string, limit = 20): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const messages: SupabaseMessage[] = await supabaseQuery(
    `whatsapp_memoria?session_id=eq.${manychatId}&order=id.desc&limit=${limit}`
  );

  if (!messages || messages.length === 0) return [];

  return messages.reverse().map((msg) => ({
    role: msg.message.type === 'human' ? 'user' as const : 'assistant' as const,
    content: msg.message.content,
  }));
}

export async function saveMessage(manychatId: string, role: 'user' | 'assistant', message: string) {
  await supabaseQuery('whatsapp_memoria', {
    method: 'POST',
    body: JSON.stringify({
      session_id: manychatId,
      message: {
        type: role === 'user' ? 'human' : 'ai',
        content: message,
        additional_kwargs: {},
        response_metadata: {},
      },
    }),
  });
}

export async function updateUser(manychatId: string, updates: Partial<Pick<WaUser, 'name' | 'funnel_stage' | 'situacion_resumen'>>) {
  const fields: Record<string, string | number> = {};

  if (updates.name != null) fields.name = updates.name;
  if (updates.funnel_stage != null) fields.funnel_stage = updates.funnel_stage;
  if (updates.situacion_resumen != null) fields.situacion_resumen = updates.situacion_resumen;
  fields.last_interaction = new Date().toISOString();

  await supabaseQuery(`wa_users?manychat_id=eq.${manychatId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

// Columnas opcionales (origen/canal — pueden no existir en schemas viejos).
// PATCH separado en best-effort para que un schema sin la columna nunca rompa.
async function updateUserOptional(manychatId: string, col: 'origen' | 'canal' | 'phone' | 'escalon', val: string) {
  try {
    await supabaseQuery(`wa_users?manychat_id=eq.${manychatId}`, {
      method: 'PATCH',
      body: JSON.stringify({ [col]: val }),
    });
  } catch (e) {
    console.warn(`[Paula] columna opcional '${col}' no persistida:`, (e as Error).message);
  }
}

// --- Prompt Assembly ---

export function buildSystemPrompt(
  user: WaUser,
  origen: string,
  telefono: string,
  opciones: { ahora?: Date; handoff?: MotivoHandoff; escalon?: Escalon } = {},
): string {
  const ahora = opciones.ahora ?? new Date();
  // Por defecto, la clase: es el escalón de entrada de todo el mundo.
  const escalon = opciones.escalon ?? 'clase';

  const protocoloCrisis = loadPrompt('03_protocolo_crisis.md');
  const userContext = buildUserContext(user, origen, escalon);

  // Reloj + país de ella: se recalcula en CADA mensaje, nunca se cachea.
  // Va PRIMERO para que el modelo lo lea antes que cualquier otra cosa.
  // Ya está adentro: solo a ella se le da la fecha del próximo encuentro en vivo.
  const esMiembro = user.funnel_stage === 'compradora';
  const contextoVivo = bloqueContexto(ahora, telefono, escalon, esMiembro) + '\n---\n\n';

  // Escalado a Javier: va antes que todo, para que no lo tape la venta.
  const handoff = opciones.handoff ? instruccionHandoff(opciones.handoff, escalon) + '\n\n---\n\n' : '';

  return `${handoff}${contextoVivo}${instruccionEscalon(escalon)}

---

${ESTILO}
# 📚 LO QUE PUEDES AFIRMAR — FUENTE ÚNICA
Todo lo que Paula puede decir está aquí abajo. Si un dato no está, no existe: no lo afirmes, dile que lo confirmas con Javier.

${conocimientoPara(escalon)}

---

# CONTEXTO DE ESTA USUARIA
${userContext}

---

# PROTOCOLO DE CRISIS (REFERENCIA DETALLADA — PRIORIDAD MÁXIMA)
${protocoloCrisis}`;
}

function buildUserContext(user: WaUser, origen: string, escalon: Escalon): string {
  const lines: string[] = [];

  if (user.name) {
    lines.push(`- Nombre: ${user.name}`);
  } else {
    lines.push('- Nombre: no lo sabemos todavía. Si sale natural en el saludo, pregúntaselo UNA vez y sigue. No insistas ni lo conviertas en un requisito para ayudarla.');
  }

  if (origen) {
    lines.push(`- Origen: ${origen} (adapta la apertura a este canal)`);
  }

  const stage = user.funnel_stage || 'new_lead';
  if (stage === 'compradora') {
    lines.push(`- ETAPA: YA PAGÓ. MODO POST-VENTA: cero venta, cero links de pago, no le vuelvas a ofrecer lo que ya compró. Confírmale que su acceso llega al correo con el que pagó (que revise también Promociones y Spam) y, si algo falla, pásale el WhatsApp de Javier: ${APEGO_DETOX.whatsappJavier}`);
  } else if (stage === 'link_enviado') {
    lines.push('- ETAPA: LINK YA ENVIADO. No repitas un link que ya enviaste, salvo que ella lo pida. Si solo diste el link de la PÁGINA, el de PAGO sí se entrega cuando ella quiera entrar. Tu foco ahora: resolver lo que la frena con un ángulo NUEVO y cerrar de nuevo.');
  } else if (stage === 'no_molestar') {
    lines.push('- ETAPA: PIDIÓ NO RECIBIR MENSAJES. Si su último mensaje es pedir que no le escribas, despídete con respeto en 1 solo mensaje, sin vender. Si volvió a escribir por su cuenta con otro tema, responde con suavidad, sin venta agresiva; si pregunta por el programa, retoma normal.');
  } else if (escalon === 'clase') {
    lines.push('- ETAPA: EN CONVERSACIÓN. Tu foco es la clase del jueves: contéstale lo que preguntó y ábrele esa puerta. Nada de terapia, nada de interrogatorio.');
  } else {
    lines.push(`- ETAPA: EN CONVERSACIÓN. Ella ya pidió el programa, así que tu foco es ${APEGO_DETOX.nombre}: contéstale lo que preguntó y ciérrale. Nada de terapia, nada de interrogatorio.`);
  }

  // conversation_count nunca se incrementa en BD — no pasarlo al modelo (dato falso, siempre 0).

  if (user.situacion_resumen) {
    lines.push(`- Resumen de su situación: ${user.situacion_resumen}`);
  }

  return lines.join('\n');
}

// --- Extractor de NOMBRE (modelo rápido; solo mientras no lo sabemos) ---

async function extraerNombre(
  history: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = process.env.PAULA_EXTRACT_MODEL || 'openai/gpt-4.1-mini';
  const contexto = [...history.slice(-6), { role: 'user', content: userMessage }]
    .map((m) => `${m.role === 'user' ? 'ELLA' : 'PAULA'}: ${m.content}`)
    .join('\n');

  const sys =
    'Eres un extractor de datos. Del siguiente chat de WhatsApp, extrae el NOMBRE de pila con el que ELLA se presentó. ' +
    'Responde SOLO un JSON válido, sin texto extra: {"nombre": string|null}. ' +
    'nombre = como ella se llama (ej "Ana", "María José"). Si no se ha presentado, null. NUNCA inventes datos.';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://historiasdelamente.com',
        'X-Title': 'Paula - Extractor',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: contexto },
        ],
        max_tokens: 60,
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw) as { nombre?: unknown };

    return typeof parsed.nombre === 'string' && parsed.nombre.trim().length >= 2
      ? parsed.nombre.trim().slice(0, 80)
      : null;
  } catch {
    return null;
  }
}

// --- OpenRouter API Call ---

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callOpenRouter(systemPrompt: string, messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY no está configurada en .env.local');
  }

  const model = process.env.PAULA_MODEL || 'openai/gpt-4.1';
  const body = JSON.stringify({
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 512,
    temperature: 0.7,
  });

  // Reintento + timeout: OpenRouter (tras Cloudflare) a veces da ConnectTimeout.
  // Sin esto, cualquier lentitud de red tumbaba el webhook entero. 2 intentos, ~18s c/u.
  const MAX_ATTEMPTS = 2;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://historiasdelamente.com',
          'X-Title': 'Paula - Historias de la Mente',
        },
        body,
        signal: AbortSignal.timeout(18000),
      });

      if (!response.ok) {
        const error = await response.text();
        // 429 / 5xx suelen ser transitorios → reintentar; el resto, fallar ya.
        if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
          lastErr = new Error(`OpenRouter ${response.status}: ${error}`);
          await sleep(500 * attempt);
          continue;
        }
        throw new Error(`OpenRouter error (${response.status}): ${error}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (err) {
      lastErr = err;
      // Errores de red / timeout (ConnectTimeout, AbortError) → reintentar.
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * attempt);
        continue;
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('OpenRouter: fallo de red tras reintentos');
}

// --- Main Entry Point ---

export async function processPaulaMessage(
  manychatId: string,
  userMessage: string,
  origen = '',
  canal = '',
  telefono = '',
): Promise<string> {
  // 1. Usuaria + historial
  const user = await getOrCreateUser(manychatId);
  const history = await getConversationHistory(manychatId, 20);

  const updates: Partial<Pick<WaUser, 'name' | 'funnel_stage'>> = {};

  // 2. Detección determinista ANTES del LLM (no depende del modelo)

  // Nombre — para personalizar chat y recordatorios.
  if (!user.name) {
    const nombre = await extraerNombre(history, userMessage);
    if (nombre) updates.name = nombre;
  }

  // Confirmación de compra dicha por ella.
  if (user.funnel_stage !== 'compradora' && COMPRA_USER_RE.test(userMessage)) {
    updates.funnel_stage = 'compradora';
  }

  // Pidió no recibir más mensajes (no pisa 'compradora').
  const stageTrasCompra = updates.funnel_stage ?? user.funnel_stage;
  if (stageTrasCompra !== 'compradora' && stageTrasCompra !== 'no_molestar' && NO_MOLESTAR_USER_RE.test(userMessage)) {
    updates.funnel_stage = 'no_molestar';
  }

  // 3. Prompt con la etapa de ESTE turno (nombre/etapa ya actualizados)
  const userParaPrompt: WaUser = {
    ...user,
    name: updates.name ?? user.name,
    funnel_stage: updates.funnel_stage ?? user.funnel_stage,
  };
  const ahora = new Date();
  // ¿pide a Javier, ya pagó, mandó el comprobante, no tiene tarjeta, falló el pago?
  const handoff = motivoHandoff(userMessage);

  // En qué escalón va esta conversación: la clase del jueves (siempre lo
  // primero) o Apego Detox, si ELLA lo pidió. Determinista: no depende de que
  // el modelo se acuerde de nada.
  const escalon = escalonDe({
    mensaje: userMessage,
    guardado: user.escalon,
    etapa: userParaPrompt.funnel_stage,
  });

  const systemPrompt = buildSystemPrompt(userParaPrompt, origen, telefono, { ahora, handoff, escalon });

  // 4. Modelo principal
  const messages = [...history, { role: 'user', content: userMessage }];
  let paulaResponse = await callOpenRouter(systemPrompt, messages);

  // 4b. BLINDAJE ANTI-INVENTO — se audita ANTES de que ella lo lea.
  // Si el modelo se inventó una fecha, un precio o un link, se le pide que
  // reescriba el mensaje UNA vez con la corrección exacta. Si en el segundo
  // intento sigue mal, gana la versión saneada (links borrados, día corregido).
  let auditoria = auditarRespuesta(stripHiddenTags(paulaResponse), ahora, escalon);
  if (auditoria.hallazgos.length > 0) {
    console.warn('[Paula blindaje]', manychatId, auditoria.hallazgos.map((h) => h.tipo).join(', '));
    try {
      const reintento = await callOpenRouter(systemPrompt, [
        ...messages,
        { role: 'assistant', content: paulaResponse },
        { role: 'user', content: instruccionCorreccion(auditoria.hallazgos, escalon, ahora) },
      ]);
      const auditoria2 = auditarRespuesta(stripHiddenTags(reintento), ahora, escalon);
      if (auditoria2.texto && auditoria2.hallazgos.length <= auditoria.hallazgos.length) {
        paulaResponse = reintento;
        auditoria = auditoria2;
      }
    } catch (err) {
      console.error('[Paula blindaje] reintento falló:', (err as Error).message);
    }
  }

  // 5. Marcas de la IA (secundarias a la detección determinista)
  const etapaActual = updates.funnel_stage ?? user.funnel_stage ?? 'new_lead';
  if (etapaActual !== 'compradora' && COMPRA_TAG_RE.test(paulaResponse)) {
    updates.funnel_stage = 'compradora';
  }
  COMPRA_TAG_RE.lastIndex = 0;

  const etapaTrasTag = updates.funnel_stage ?? user.funnel_stage ?? 'new_lead';
  if (etapaTrasTag !== 'compradora' && etapaTrasTag !== 'no_molestar' && NO_MOLESTAR_TAG_RE.test(paulaResponse)) {
    updates.funnel_stage = 'no_molestar';
  }
  NO_MOLESTAR_TAG_RE.lastIndex = 0;

  // Texto final = el ya auditado y saneado (sin tags, sin links inventados),
  // con las negritas en el formato que entiende el canal.
  paulaResponse = normalizarNegritas(auditoria.texto, normalizarCanal(canal));

  // 6. Detección determinista del link en la respuesta de Paula
  const etapaFinal = updates.funnel_stage ?? user.funnel_stage ?? 'new_lead';
  const linkEntregado = MARCADORES[escalon].some((marca) => paulaResponse.includes(marca));
  if (
    linkEntregado &&
    etapaFinal !== 'compradora' &&
    etapaFinal !== 'no_molestar' &&
    etapaFinal !== 'link_enviado'
  ) {
    updates.funnel_stage = 'link_enviado';
  }

  // 7. Guardar conversación + persistir etapa/nombre
  await saveMessage(manychatId, 'user', userMessage);
  await saveMessage(manychatId, 'assistant', paulaResponse);
  await updateUser(manychatId, updates);

  // Origen y canal (transporte whatsapp/instagram) — best-effort, para que los
  // recordatorios salgan por el canal correcto. El teléfono se guarda para que
  // los recordatorios también sepan su país, su hora y su moneda.
  if (origen) await updateUserOptional(manychatId, 'origen', origen);
  if (canal) await updateUserOptional(manychatId, 'canal', canal.toLowerCase() === 'instagram' ? 'instagram' : 'whatsapp');
  if (telefono) await updateUserOptional(manychatId, 'phone', telefono);
  // El escalón, para no volver a ofrecerle la clase a quien ya pidió el programa.
  await updateUserOptional(manychatId, 'escalon', escalon);

  return paulaResponse;
}
