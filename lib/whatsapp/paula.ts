import fs from 'fs';
import path from 'path';
import { getDb, type WaUser, type WaConversation } from '../db';

const PROMPTS_DIR = path.join(process.cwd(), 'agents-source', 'prompts', 'whatsapp');

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

// --- Database Operations ---

export function getOrCreateUser(manychatId: string): WaUser {
  const db = getDb();

  let user = db.prepare('SELECT * FROM wa_users WHERE manychat_id = ?').get(manychatId) as WaUser | undefined;

  if (!user) {
    db.prepare(
      'INSERT INTO wa_users (manychat_id, funnel_stage) VALUES (?, ?)'
    ).run(manychatId, 'new_lead');
    user = db.prepare('SELECT * FROM wa_users WHERE manychat_id = ?').get(manychatId) as WaUser;
  }

  return user;
}

export function getConversationHistory(manychatId: string, limit = 20): WaConversation[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM wa_conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(manychatId, limit) as WaConversation[];
}

export function saveMessage(manychatId: string, role: 'user' | 'assistant', message: string, phase?: string) {
  const db = getDb();
  db.prepare(
    'INSERT INTO wa_conversations (user_id, role, message, phase) VALUES (?, ?, ?, ?)'
  ).run(manychatId, role, message, phase || null);
}

export function updateUser(manychatId: string, updates: Partial<Pick<WaUser, 'name' | 'funnel_stage' | 'situacion_resumen'>>) {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.name != null) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.funnel_stage != null) { fields.push('funnel_stage = ?'); values.push(updates.funnel_stage); }
  if (updates.situacion_resumen != null) { fields.push('situacion_resumen = ?'); values.push(updates.situacion_resumen); }

  fields.push('last_interaction = datetime(\'now\')');
  fields.push('conversation_count = conversation_count + 1');

  values.push(manychatId);
  db.prepare(`UPDATE wa_users SET ${fields.join(', ')} WHERE manychat_id = ?`).run(...values);
}

// --- Prompt Assembly ---

function buildSystemPrompt(user: WaUser): string {
  const sistemaPrompt = loadPrompt('00_sistema_paula.md');
  const bancoRespuestas = loadPrompt('02_banco_respuestas.md');
  const protocoloCrisis = loadPrompt('03_protocolo_crisis.md');
  const configDinamica = loadPrompt('05_config_dinamica.md');

  // Build context about this specific user
  const userContext = buildUserContext(user);

  return `${sistemaPrompt}

---

# CONTEXTO DE ESTA USUARIA
${userContext}

---

# CONFIGURACIÓN ACTUAL
${configDinamica}

---

# BANCO DE RESPUESTAS (FAQ)
${bancoRespuestas}

---

# PROTOCOLO DE CRISIS (PRIORIDAD MÁXIMA)
${protocoloCrisis}`;
}

function buildUserContext(user: WaUser): string {
  const lines: string[] = [];

  if (user.name) {
    lines.push(`- Nombre: ${user.name}`);
  } else {
    lines.push('- Nombre: NO LO SABEMOS TODAVÍA — preguntarlo');
  }

  lines.push(`- Etapa del funnel: ${user.funnel_stage}`);
  lines.push(`- Mensajes intercambiados: ${user.conversation_count}`);
  lines.push(`- Primer contacto: ${user.first_contact}`);

  if (user.situacion_resumen) {
    lines.push(`- Resumen de su situación: ${user.situacion_resumen}`);
  }

  return lines.join('\n');
}

function buildMessages(history: WaConversation[], currentMessage: string): Array<{ role: string; content: string }> {
  // History comes in DESC order, reverse to chronological
  const chronological = [...history].reverse();

  const messages: Array<{ role: string; content: string }> = [];

  for (const msg of chronological) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.message,
    });
  }

  // Add current message
  messages.push({ role: 'user', content: currentMessage });

  return messages;
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
      max_tokens: 1024,
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

// --- Main Entry Point ---

export async function processPaulaMessage(
  manychatId: string,
  userMessage: string,
): Promise<string> {
  // 1. Get or create user
  const user = getOrCreateUser(manychatId);

  // 2. Get conversation history (last 20 messages)
  const history = getConversationHistory(manychatId, 20);

  // 3. Build system prompt with user context
  const systemPrompt = buildSystemPrompt(user);

  // 4. Build message array
  const messages = buildMessages(history, userMessage);

  // 5. Call OpenRouter
  const paulaResponse = await callOpenRouter(systemPrompt, messages);

  // 6. Save both messages to DB
  saveMessage(manychatId, 'user', userMessage);
  saveMessage(manychatId, 'assistant', paulaResponse);

  // 7. Update user interaction
  updateUser(manychatId, {});

  return paulaResponse;
}
