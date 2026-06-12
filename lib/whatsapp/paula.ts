import fs from 'fs';
import path from 'path';

const PROMPTS_DIR = path.join(process.cwd(), 'agents-source', 'prompts', 'whatsapp');

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
  // Check if user exists in wa_users table
  const users = await supabaseQuery(
    `wa_users?manychat_id=eq.${manychatId}&limit=1`
  );

  if (users && users.length > 0) {
    return users[0] as WaUser;
  }

  // Create new user
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
  // Read from whatsapp_memoria (legacy n8n format)
  const messages: SupabaseMessage[] = await supabaseQuery(
    `whatsapp_memoria?session_id=eq.${manychatId}&order=id.desc&limit=${limit}`
  );

  if (!messages || messages.length === 0) return [];

  // Reverse to chronological order and convert format
  return messages.reverse().map((msg) => ({
    role: msg.message.type === 'human' ? 'user' as const : 'assistant' as const,
    content: msg.message.content,
  }));
}

export async function saveMessage(manychatId: string, role: 'user' | 'assistant', message: string) {
  // Save in whatsapp_memoria format (compatible with n8n legacy)
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

// --- Prompt Assembly ---

function buildSystemPrompt(user: WaUser): string {
  // Prompt MAESTRO autocontenido — incluye TODO lo necesario.
  // No cargar banco_respuestas / config_dinamica / libro_nina_callada (ya están dentro del maestro).
  // Mantener protocolo_crisis solo como referencia adicional de seguridad.
  const sistemaPrompt = loadPrompt('00_sistema_paula.md');
  const protocoloCrisis = loadPrompt('03_protocolo_crisis.md');

  const userContext = buildUserContext(user);

  return `${sistemaPrompt}

---

# CONTEXTO DE ESTA USUARIA
${userContext}

---

# PROTOCOLO DE CRISIS (REFERENCIA DETALLADA)
${protocoloCrisis}`;
}

function buildUserContext(user: WaUser): string {
  const lines: string[] = [];

  if (user.name) {
    lines.push(`- Nombre: ${user.name}`);
  } else {
    lines.push('- Nombre: NO LO SABEMOS TODAVÍA — preguntarlo');
  }

  lines.push(`- Mensajes intercambiados: ${user.conversation_count}`);
  lines.push(`- Primer contacto: ${user.first_contact}`);

  if (user.situacion_resumen) {
    lines.push(`- Resumen de su situación: ${user.situacion_resumen}`);
  }

  return lines.join('\n');
}

// --- OpenRouter API Call ---

export async function callOpenRouter(systemPrompt: string, messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY no está configurada en .env.local');
  }

  const model = process.env.PAULA_MODEL || 'openai/gpt-4.1-mini';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://historiasdelamente.com',
      'X-Title': 'Paula - Historias de la Mente',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// --- Captura del nombre ---

/**
 * Extrae el nombre de pila del historial + el último mensaje. Usa un modelo
 * rápido. NUNCA inventa. Solo se usa mientras no sepamos cómo se llama.
 * (Paula ya NO captura correos ni envía el libro: su único foco es Apego Detox.)
 */
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
    'nombre = como ella se llama (ej "Ana", "María José"). Si no se ha presentado, null. NUNCA inventes.';

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
        max_tokens: 80,
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
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

// --- Main Entry Point ---

export async function processPaulaMessage(
  manychatId: string,
  userMessage: string,
): Promise<string> {
  // 1. Usuaria + historial
  const user = await getOrCreateUser(manychatId);
  const history = await getConversationHistory(manychatId, 10);

  // 2. Captura del nombre (mientras no lo sepamos) para saludarla por su nombre
  const updates: Partial<Pick<WaUser, 'name' | 'funnel_stage' | 'situacion_resumen'>> = {};

  if (!user.name) {
    const nombre = await extraerNombre(history, userMessage);
    if (nombre) updates.name = nombre;
  }

  // 3. Prompt con el nombre de ESTE turno
  const userParaPrompt: WaUser = {
    ...user,
    name: updates.name ?? user.name,
  };
  const systemPrompt = buildSystemPrompt(userParaPrompt);

  // 4. Modelo principal
  const messages = [...history, { role: 'user', content: userMessage }];
  const paulaResponse = await callOpenRouter(systemPrompt, messages);

  // 5. Guardar conversación
  await saveMessage(manychatId, 'user', userMessage);
  await saveMessage(manychatId, 'assistant', paulaResponse);

  // 6. Persistir nombre (para no volver a preguntarlo) + last_interaction
  await updateUser(manychatId, updates);

  return paulaResponse;
}
