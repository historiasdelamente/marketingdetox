import fs from 'fs';
import path from 'path';

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

// ⚠️ CAMPAÑA TEMPORAL "Volver a mí" (hasta 17 jul 2026).
// Poner en false para REVERTIR a la venta normal de Apego Detox.
const CAMPANA_VOLVER_A_MI = true;

// Links canon (mismos que la landing — si cambian allá, cambiar acá y en el maestro).
const CHECKOUT_MARKER = CAMPANA_VOLVER_A_MI ? 'pay.hotmart.com/H106712135H' : 'pay.hotmart.com/W102751360L';
const LANDING_MARKER = CAMPANA_VOLVER_A_MI ? 'historiasdelamente.com/volver-a-mi' : 'historiasdelamente.com/apegodetox';

// Bloque de campaña que se antepone al prompt maestro (override de PRIORIDAD MÁXIMA).
const CAMPANA_OVERRIDE = `# ⚠️ CAMPAÑA ACTIVA — PRIORIDAD MÁXIMA (hasta el 17 de julio)

Durante esta campaña eres una ESTRATEGA DE VENTAS, NO una terapeuta. Tu ÚNICO objetivo es que ella asegure HOY su lugar en la clase en vivo "Volver a mí". Queda SUSPENDIDO todo lo que este prompt diga más abajo (Apego Detox, el flujo de "pasos", el discovery). Única excepción: el PROTOCOLO DE CRISIS manda sobre todo, siempre.

## Cómo te comportas (LO MÁS IMPORTANTE)
- Suenas a PERSONA REAL, cálida y natural — NUNCA a respuesta automática ni a robot. Nada de fórmulas repetidas ni de pegar el link en cada mensaje.
- Desde tu PRIMER mensaje le hablas de la CLASE "Volver a mí" con calidez y ganas de verdad (qué es, cuándo, qué se lleva). NO le preguntes por su caso: nada de "¿cómo estás?", "¿en qué momento estás con esa persona?", "¿qué te pasa?" ni "cuéntame". La charla es sobre la clase, no sobre diagnosticarla.
- Estás centrada en la venta, con calma: resuelves en 1-2 frases lo que pregunte y la vas guiando a que asegure su cupo.
- Comparte el link de la clase cuando muestre interés o pregunte cómo entrar (no a la fuerza desde el saludo).
- Mensajes cortos y humanos. Trátala bien pero SIN apodos ("amor", "cielo", "reina"). Háblale de "tú".

## La clase (tu ÚNICO producto)
Solo vendes la clase "Volver a mí". NUNCA menciones Apego Detox, ni "$37.97", ni "módulos", ni "suscripción/membresía mensual" — eso quedó suspendido. Tu precio es 17.000 COP, PAGO ÚNICO.
"Volver a mí": clase EN VIVO, 3 horas, una sola vez — jueves 17 de julio, 8:00 PM Colombia. Entiendes por qué no has podido soltar y sales con herramientas + terapia en vivo + meditación + testimonios + el libro "Volver a mí" + área de miembros + la grabación. Precio único: 17.000 COP (5 USD / 87 MXN). Cupos limitados, se están llenando.

## EL LINK
- El único link que compartes es el de la clase: https://historiasdelamente.com/volver-a-mi — ahí ella ve todo y asegura su lugar. (NO mandes links de pago de Hotmart; el pago se hace en esa página.)
- Si está en Colombia y prefiere Nequi: que envíe 17.000 COP al 3116329202 y luego mande el comprobante + su correo por WhatsApp (https://wa.me/573001681053) para su acceso.

## Precio
Si pregunta cuánto cuesta, dilo con naturalidad: 17.000 COP (5 USD / 87 MXN), y compártele el link de la clase para que asegure su lugar.

## Si ya es COMPRADORA de Apego Detox
Salúdala con cariño e invítala a la clase como un encuentro especial (mismo link). Sin presión.

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
async function updateUserOptional(manychatId: string, col: 'origen' | 'canal', val: string) {
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

function buildSystemPrompt(user: WaUser, origen: string): string {
  // Prompt MAESTRO autocontenido (venta Apego Detox) + contexto + crisis.
  const sistemaPrompt = loadPrompt('00_sistema_paula.md');
  const protocoloCrisis = loadPrompt('03_protocolo_crisis.md');

  const userContext = buildUserContext(user, origen);

  return `${CAMPANA_VOLVER_A_MI ? CAMPANA_OVERRIDE + '\n' : ''}${sistemaPrompt}

---

# CONTEXTO DE ESTA USUARIA
${userContext}

---

# PROTOCOLO DE CRISIS (REFERENCIA DETALLADA — PRIORIDAD MÁXIMA)
${protocoloCrisis}`;
}

function buildUserContext(user: WaUser, origen: string): string {
  const lines: string[] = [];

  if (user.name) {
    lines.push(`- Nombre: ${user.name}`);
  } else if (CAMPANA_VOLVER_A_MI) {
    lines.push('- Nombre: no lo sabemos — NO se lo preguntes. En campaña vas directa a la venta y al link.');
  } else {
    lines.push('- Nombre: NO LO SABEMOS TODAVÍA — preguntarlo (Paso 1)');
  }

  if (origen) {
    lines.push(`- Origen: ${origen} (adapta la apertura a este canal)`);
  }

  const stage = user.funnel_stage || 'new_lead';
  if (stage === 'compradora') {
    lines.push('- ETAPA: COMPRADORA. Ya pagó Apego Detox. MODO POST-VENTA: cero venta, no mandes links de pago. Acompaña, resuelve dudas de acceso, recuerda las clases en vivo (martes y jueves 8 pm Colombia) y el WhatsApp de Javier (+57 300 1681053) si hay problemas de acceso.');
  } else if (stage === 'link_enviado') {
    lines.push('- ETAPA: LINK YA ENVIADO. No repitas un link que ya enviaste, salvo que ella lo pida. Si solo diste el link de la PÁGINA, el link de PAGO sí se entrega cuando cierres (Paso 5). Tu foco ahora: descubrir qué la frena (pregunta directa) y resolver ESA objeción, luego cerrar de nuevo.');
  } else if (stage === 'no_molestar') {
    lines.push('- ETAPA: PIDIÓ NO RECIBIR MENSAJES. Si su último mensaje es pedir que no le escribas, despídete con respeto en 1 solo mensaje, sin vender. Si volvió a escribir por su cuenta con otro tema, responde con suavidad, sin venta agresiva; si pregunta por el programa, retoma normal.');
  } else if (CAMPANA_VOLVER_A_MI) {
    lines.push('- ETAPA: EN CONVERSACIÓN. Céntrate en vender la clase "Volver a mí" con naturalidad (ver CAMPAÑA arriba): guíala y comparte el link de la página cuando muestre interés. Nada de terapia, discovery ni sonar automática.');
  } else {
    lines.push('- ETAPA: EN CONVERSACIÓN. Objetivo: validar su dolor, prescribir Apego Detox y cerrar la venta (ver flujo).');
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
  const systemPrompt = buildSystemPrompt(userParaPrompt, origen);

  // 4. Modelo principal
  const messages = [...history, { role: 'user', content: userMessage }];
  let paulaResponse = await callOpenRouter(systemPrompt, messages);

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

  paulaResponse = stripHiddenTags(paulaResponse);

  // 6. Detección determinista del link en la respuesta de Paula
  const etapaFinal = updates.funnel_stage ?? user.funnel_stage ?? 'new_lead';
  const linkEntregado = paulaResponse.includes(CHECKOUT_MARKER) || paulaResponse.includes(LANDING_MARKER);
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
  // recordatorios salgan por el canal correcto.
  if (origen) await updateUserOptional(manychatId, 'origen', origen);
  if (canal) await updateUserOptional(manychatId, 'canal', canal.toLowerCase() === 'instagram' ? 'instagram' : 'whatsapp');

  return paulaResponse;
}
