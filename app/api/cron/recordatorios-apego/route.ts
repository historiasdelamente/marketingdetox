/**
 * Cron de RECORDATORIOS DE COMPRA de Apego Detox.
 *
 * Revisa conversaciones de Paula que quedaron en silencio y envía hasta 2
 * recordatorios por ManyChat para cerrar la venta:
 *   - Recordatorio 1: ≥4h de silencio (retomar el hilo / preguntar qué la frena)
 *   - Recordatorio 2: ≥16h de silencio (clase en vivo + garantía + link de pago)
 *
 * Reglas duras:
 *   - Nunca a compradoras ni a quien pidió no_molestar.
 *   - Nunca si la conversación pasó por protocolo de crisis.
 *   - Solo dentro de la ventana de 24h de WhatsApp (desde su último mensaje).
 *   - Solo en horario prudente Colombia (8 am - 9 pm).
 *   - El flag se marca ANTES de enviar (si algo falla, jamás se repite spam).
 *
 * Configurar (EasyPanel cron / n8n / cron-job.org), cada 2 horas:
 *   curl -H "Authorization: Bearer ${CRON_SECRET}" https://<host>/api/cron/recordatorios-apego
 *
 * Requiere env: CRON_SECRET, MANYCHAT_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

const CHECKOUT_URL = 'https://pay.hotmart.com/W102751360L?bid=1771690985611';
const LANDING_URL = 'https://historiasdelamente.com/apegodetox';
// Grupo gratuito de la comunidad — SOLO para el toque 3 (última ventana):
// si tras 2 toques de venta no compró, se le da el grupo para no perder el
// contacto (dentro del grupo no aplica la ventana de 24h de WhatsApp).
const GRUPO_URL = 'https://chat.whatsapp.com/E0W15Gwuvrx3FlgrRC0I0x';

// Marcadores de que la conversación pasó por protocolo de crisis
// (respuestas de Paula en nivel 1 — líneas de ayuda — y nivel 2 — violencia)
const CRISIS_MARKERS_AI = [
  'línea 106', 'linea 106', '800-911-2000', '717-003-717', '600-360-7777', '273-8026',
  'línea de crisis', 'linea de crisis', 'líneas gratuitas', 'lineas gratuitas',
  'línea de la mujer', 'linea de la mujer', 'llama a emergencias',
];
// Frases de crisis dichas por ELLA (alto valor de señal)
const CRISIS_MARKERS_HUMAN = [
  'me quiero morir', 'quiero morirme', 'no quiero vivir', 'quiero desaparecer',
  'hacerme daño', 'suicid', 'me golpea', 'me pega', 'me amenaza',
];

type MemMessage = {
  id: number;
  session_id: string;
  created_at?: string;
  message: { type: 'human' | 'ai'; content: string };
};

type WaUserRow = {
  manychat_id: string;
  name: string | null;
  funnel_stage: string | null;
  last_interaction: string | null;
  followup_sent?: boolean;
  followup2_sent?: boolean;
  canal?: string | null;
};

async function supabaseQuery(endpoint: string, options: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_KEY faltantes');
  const response = await fetch(`${url}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
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

async function sendManyChat(subscriberId: string, text: string, canal?: string | null) {
  const token = process.env.MANYCHAT_API_TOKEN;
  if (!token) throw new Error('MANYCHAT_API_TOKEN no configurado');

  const contentType = String(canal || '').toLowerCase() === 'instagram' ? 'instagram' : 'whatsapp';
  // Línea en blanco = globo aparte
  const parts = text.split(/\n\n/).filter((p) => p.trim());
  const messages = parts.map((p) => ({ type: 'text', text: p.trim() }));

  const response = await fetch('https://api.manychat.com/fb/sending/sendContent', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriber_id: Number(subscriberId),
      data: { version: 'v2', content: { type: contentType, messages } },
    }),
  });

  const data = await response.json();
  if (data.status !== 'success') {
    throw new Error(`ManyChat error: ${JSON.stringify(data)}`);
  }
  return data;
}

// Hora local Colombia (UTC-5, sin horario de verano)
function horaColombia(date: Date): number {
  return (date.getUTCHours() - 5 + 24) % 24;
}

// Variante determinista por seed (sin Math.random: reproducible)
function pick(variants: string[], seedStr: string): string {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  return variants[h % variants.length];
}

function saludo(nombre: string | null): string {
  return nombre ? `${nombre}, ` : '';
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Copys FIJOS (fallback si el generador LLM falla) ---
// Regla: todo recordatorio VENDE — siempre lleva link y pregunta de decisión.

function copyRecordatorio1(nombre: string | null, linkYaEnviado: boolean): string {
  const n = saludo(nombre);
  if (linkYaEnviado) {
    return cap(pick([
      `${n}soy Paula 💛 Lo que me contaste tiene tratamiento, y es el programa que te mandé. Cuando decidas entrar, este es el link: ${CHECKOUT_URL}\n\nTienes 7 días de garantía total: entras, lo ves por dentro y decides. ¿Qué es lo que te detiene hoy?`,
      `${n}me quedé pensando en ti 💛 El programa que te mandé trabaja justo eso que me contaste — no es consuelo, es proceso. Entras aquí: ${CHECKOUT_URL}\n\nSi algo te frena, dímelo y lo resolvemos ya mismo. ¿Es el dinero, el tiempo o el miedo a que no funcione?`,
    ], (nombre || '') + '1'));
  }
  return cap(pick([
    `${n}soy Paula 💛 Eso que me contaste tiene nombre y tiene salida — y no es a punta de fuerza de voluntad. Javier creó Apego Detox exacto para esto: ${LANDING_URL}\n\nSon $37.97 al mes, con 7 días de garantía total. ¿Empezamos hoy?`,
    `${n}te escribo porque lo que me contaste no se me olvidó 💛 No estás rota: tu sistema quedó enganchado, y eso se reentrena con proceso. Míralo aquí: ${LANDING_URL}\n\nCancelas cuando quieras y tienes 7 días de garantía. ¿Te animas a entrar hoy? ✨`,
  ], (nombre || '') + '1'));
}

function copyRecordatorio2(nombre: string | null): string {
  const n = saludo(nombre);
  return cap(pick([
    `${n}esta semana hay clase en vivo con Javier (martes y jueves, 8 pm hora Colombia). Si entras hoy, llegas con acceso a todo: ${CHECKOUT_URL}\n\nSon $37.97 al mes, cancelas cuando quieras y tienes 7 días de garantía total. ¿Te guardo el cupo de hoy? 💛`,
    `${n}no te escribo para presionarte — te escribo porque sé cómo pesa cada semana más dentro del bucle 💛 La próxima clase en vivo con Javier es martes y jueves a las 8 pm (Colombia).\n\nEntras aquí, con 7 días de garantía y cancelas cuando quieras: ${CHECKOUT_URL} ¿Entras hoy? ✨`,
  ], (nombre || '') + '2'));
}

// Toque 3 (~21-23h, última ventana): invitación al grupo. Sin venta dura —
// el objetivo es no perder el contacto y dejar la puerta abierta.
function copyInvitacionGrupo(nombre: string | null): string {
  const n = saludo(nombre);
  return cap(pick([
    `${n}no te voy a llenar de mensajes, tranquila 💛 Solo no quiero que pases por esto sola: este es el grupo donde Javier y la comunidad te acompañan → ${GRUPO_URL}\n\nEntra cuando quieras. Y cuando decidas empezar tu proceso con Apego Detox, aquí estoy ✨`,
    `${n}te dejo algo antes de despedirme por hoy 💛 Este es el grupo de la comunidad de Javier, donde hay mujeres pasando por lo mismo que tú → ${GRUPO_URL}\n\nAhí se avisan las clases y nadie te deja sola. Cuando estés lista para tu proceso, me escribes ✨`,
  ], (nombre || '') + '3'));
}

// --- Generador INTELIGENTE (LLM): recordatorio personalizado al dolor de ELLA ---
// Lee el historial real de la conversación y escribe un recordatorio de VENTA
// hecho a su medida. Si falla o devuelve algo inválido, cae al copy fijo.

async function generarRecordatorioLLM(
  user: WaUserRow,
  messages: MemMessage[],
  toque: 1 | 2,
  linkYaEnviado: boolean,
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const linkRequerido = toque === 2 || linkYaEnviado ? CHECKOUT_URL : LANDING_URL;

  const historial = messages
    .slice(0, 10)
    .reverse()
    .map((m) => `${m.message.type === 'human' ? 'ELLA' : 'PAULA'}: ${m.message.content}`)
    .join('\n');

  const objetivo = toque === 1
    ? `TOQUE 1 (lleva ~4h en silencio): retoma SU dolor exacto (usa sus palabras del historial, no frases genéricas), preséntale Apego Detox como el tratamiento para ESO, entrega este link UNA vez: ${linkRequerido} y cierra con UNA pregunta de decisión.`
    : `TOQUE 2 (lleva ~16h en silencio, último toque): cierre directo. Su dolor en una frase, el link de pago UNA vez: ${linkRequerido}, la clase en vivo con Javier (martes y jueves 8 pm hora Colombia), la garantía de 7 días, y UNA pregunta de decisión que invite a entrar HOY.`;

  const sys = `Eres Paula, asesora de Apego Detox del equipo de Javier Vieira, Psicólogo Especialista. Escribes UN mensaje de seguimiento de VENTA por WhatsApp/Instagram para una mujer que dejó de responder. Tu único objetivo es acercarla HOY a comprar Apego Detox ($37.97 USD al mes, suscripción mensual, cancela cuando quiera, garantía total de 7 días, 15 módulos, clases en vivo con Javier martes y jueves 8 pm hora Colombia).

${objetivo}

REGLAS DURAS:
- Máximo 2 globos separados por UNA línea en blanco, ~250 caracteres por globo.
- El link va UNA sola vez, completo y sin modificar.
- Texto plano de WhatsApp: sin markdown, sin listas. Emojis solo 💛 y ✨ (máximo 1 por globo).
- PROHIBIDO: "oferta", "descuento", "cupos limitados", "última oportunidad", "pago único", reprocharle el silencio ("vi que no respondiste"), decir que es un mensaje automático, diagnosticar, prometer cura.
- Tono: hermana mayor con criterio clínico. Cálida, directa, sutil y firme. Nunca de feria, nunca rogando.
- Si el nombre de ella aparece en el contexto, úsalo una vez.
- Si en el historial hay señales de crisis (suicidio, autolesión, violencia física), responde EXACTAMENTE: NO_ENVIAR

Responde SOLO con el mensaje final (o NO_ENVIAR). Nada de explicaciones.`;

  const contexto = `Nombre de ella: ${user.name || 'desconocido'}\n\nHISTORIAL RECIENTE:\n${historial}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://historiasdelamente.com',
        'X-Title': 'Paula - Recordatorios',
      },
      body: JSON.stringify({
        model: process.env.PAULA_MODEL || 'openai/gpt-4.1',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: contexto },
        ],
        max_tokens: 320,
        temperature: 0.7,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    let texto: string = (data.choices?.[0]?.message?.content || '').trim();

    // Validación dura: si no cumple, se usa el copy fijo.
    if (!texto) return null;
    if (texto.includes('NO_ENVIAR')) return 'NO_ENVIAR';
    texto = texto.replace(/\[\[[^\]]*\]\]/g, '').trim();
    if (!texto.includes(linkRequerido)) return null;
    if (texto.length > 900) return null;
    if (/oferta|descuento|cupos|última oportunidad|ultima oportunidad|pago único|pago unico/i.test(texto)) return null;
    return texto;
  } catch {
    return null;
  }
}

async function handle(req: NextRequest) {
  // Auth: Bearer token o ?secret= (mismo patrón que enviar-libros-pendientes)
  const authHeader = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');
  const provided = (authHeader && authHeader.replace(/^Bearer\s+/i, '')) || querySecret || '';

  if (!CRON_SECRET) {
    console.error('[recordatorios] CRON_SECRET no definido');
    return NextResponse.json({ error: 'Server config missing' }, { status: 500 });
  }
  if (provided !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users: WaUserRow[] = await supabaseQuery('wa_users?select=*');
  if (!users || users.length === 0) {
    return NextResponse.json({ checked: 0, sent: 0 });
  }

  const now = new Date();
  const hora = horaColombia(now);
  if (hora < 8 || hora >= 21) {
    return NextResponse.json({ checked: users.length, sent: 0, skipped: 'quiet_hours' });
  }

  let sent = 0;
  const errores: string[] = [];

  for (const user of users) {
    try {
      const stage = user.funnel_stage || 'new_lead';
      if (stage === 'compradora' || stage === 'no_molestar') continue;
      // OJO: no cortar aquí cuando followup_sent && followup2_sent — el toque 3
      // (invitación al grupo, ~21-23h) va DESPUÉS de los dos toques de venta.

      const messages: MemMessage[] = await supabaseQuery(
        `whatsapp_memoria?session_id=eq.${user.manychat_id}&order=id.desc&limit=12`
      );
      if (!messages || messages.length < 2) continue;

      // Nunca recordar venta a una conversación que pasó por crisis
      const huboCrisis = messages.some((m) => {
        if (!m.message) return false;
        const c = (m.message.content || '').toLowerCase();
        if (m.message.type === 'ai') return CRISIS_MARKERS_AI.some((k) => c.includes(k));
        return CRISIS_MARKERS_HUMAN.some((k) => c.includes(k));
      });
      if (huboCrisis) continue;

      // whatsapp_memoria puede no tener created_at — fallback last_interaction
      // (solo se actualiza cuando ELLA escribe; los recordatorios no la tocan).
      const fallbackTime = user.last_interaction ? new Date(user.last_interaction) : now;

      const lastMsgTime = messages[0].created_at ? new Date(messages[0].created_at) : fallbackTime;
      const hoursSinceLastMsg = (now.getTime() - lastMsgTime.getTime()) / 3600000;

      // Ventana de 24h de WhatsApp: desde el último mensaje de ELLA
      const lastHuman = messages.find((m) => m.message && m.message.type === 'human');
      if (!lastHuman) continue;
      const lastHumanTime = lastHuman.created_at ? new Date(lastHuman.created_at) : fallbackTime;
      const hoursSinceHuman = (now.getTime() - lastHumanTime.getTime()) / 3600000;
      if (hoursSinceHuman >= 23.5) continue;

      const linkYaEnviado = stage === 'link_enviado' || messages.some((m) =>
        m.message && m.message.type === 'ai' &&
        ((m.message.content || '').includes('apegodetox') || (m.message.content || '').includes('hotmart'))
      );

      // ¿Ya tiene el link del grupo? (incluye a las del embudo viejo — a esas
      // no se les repite la invitación)
      const grupoYaEnviado = messages.some((m) =>
        m.message && m.message.type === 'ai' &&
        (m.message.content || '').includes('chat.whatsapp.com')
      );

      let toque: 1 | 2 | 3 | null = null;
      let patch: Record<string, boolean> | null = null;

      if (!user.followup_sent && hoursSinceLastMsg >= 4) {
        toque = 1;
        patch = { followup_sent: true };
      } else if (user.followup_sent && !user.followup2_sent && hoursSinceLastMsg >= 16 && hoursSinceHuman >= 16) {
        toque = 2;
        patch = { followup2_sent: true };
      } else if (user.followup_sent && user.followup2_sent && !grupoYaEnviado && hoursSinceHuman >= 21) {
        // TOQUE 3 — última ventana (~21-23.5h): no compró tras 2 toques de
        // venta → invitarla al grupo de la comunidad para no perder el
        // contacto (dentro del grupo no aplica la ventana de 24h).
        toque = 3;
        patch = null; // idempotencia por contenido: el link del grupo queda en
        // whatsapp_memoria y grupoYaEnviado lo bloquea en el próximo run.
      }

      if (!toque) continue;

      let msg: string | null;
      if (toque === 3) {
        msg = copyInvitacionGrupo(user.name);
      } else {
        // Recordatorio inteligente: personalizado al dolor de ELLA vía LLM;
        // si el generador falla o devuelve algo inválido, copy fijo de venta.
        msg = await generarRecordatorioLLM(user, messages, toque, linkYaEnviado);
        if (msg === 'NO_ENVIAR') continue; // el generador detectó crisis
        if (!msg) {
          msg = toque === 1
            ? copyRecordatorio1(user.name, linkYaEnviado)
            : copyRecordatorio2(user.name);
        }
      }

      // Marcar ANTES de enviar (anti-spam: si el envío falla tras marcar, se
      // pierde ese recordatorio — preferible a repetírselo cada 2 horas).
      if (patch) {
        await supabaseQuery(`wa_users?manychat_id=eq.${user.manychat_id}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
      }
      await sendManyChat(user.manychat_id, msg, user.canal);

      // Guardar en el historial para que Paula tenga contexto si ella responde
      await supabaseQuery('whatsapp_memoria', {
        method: 'POST',
        body: JSON.stringify({
          session_id: user.manychat_id,
          message: { type: 'ai', content: msg, additional_kwargs: {}, response_metadata: {} },
        }),
      });

      sent++;
    } catch (err) {
      errores.push(`${user.manychat_id}: ${(err as Error).message}`);
    }
  }

  if (errores.length) console.error('[recordatorios] errores:', errores.slice(0, 5));
  return NextResponse.json({ checked: users.length, sent, errors: errores.length });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
