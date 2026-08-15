/**
 * Cron de RECORDATORIOS DE COMPRA de Paula.
 *
 * Vende SIEMPRE lo mismo que el chat: Apego Detox en Skool. Desde el
 * 2026-08-05 la clase del jueves se retiró y con ella toda la rama de copys
 * que la vendía (ver la caja de `lib/whatsapp/programa.ts`).
 *
 * Revisa conversaciones de Paula que quedaron en silencio y envía hasta 2
 * recordatorios por ManyChat para cerrar la venta:
 *   - Recordatorio 1: ≥4h de silencio (retomar el hilo / preguntar qué la frena)
 *   - Recordatorio 2: ≥16h de silencio (entra hoy + garantía + link de pago)
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
import { TZ_COLOMBIA, detectarPais, fechaLarga, hora12, paisPorIso } from '@/lib/whatsapp/paises';
import { precioLocal, tasas } from '@/lib/whatsapp/moneda';
import type { TablaTasas } from '@/lib/whatsapp/programa';
import { APEGO, bloqueContextoApego, proximoEncuentro } from '@/lib/whatsapp/apego-detox';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

const CHECKOUT_URL = APEGO.checkout;
const LANDING_URL = APEGO.landing;
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
  /** Para darle la hora en su zona y el precio en su moneda. */
  phone?: string | null;
  /** Se conserva por compatibilidad de schema; hoy siempre es 'apego'. */
  escalon?: string | null;
  /** ISO del país que ELLA dijo. Manda sobre el indicativo de su número. */
  pais?: string | null;
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

function copyRecordatorio1(user: WaUserRow, linkYaEnviado: boolean, tabla: TablaTasas): string {
  const nombre = user.name;
  const n = saludo(nombre);
  const precio = precioParaElla(user, tabla);

  if (linkYaEnviado) {
    return cap(pick([
      `${n}soy Paula 💛 Lo que me contaste tiene tratamiento, y es el programa que te mandé. Cuando decidas entrar, este es el link: ${CHECKOUT_URL}\n\nTienes ${APEGO.garantiaDias} días de garantía total: entras, lo ves por dentro y decides. ¿Qué es lo que te detiene hoy?`,
      `${n}me quedé pensando en ti 💛 El programa que te mandé trabaja justo eso que me contaste — no es consuelo, es proceso. Entras aquí: ${CHECKOUT_URL}\n\nSi algo te frena, dímelo y lo resolvemos ya mismo. ¿Es el dinero, el tiempo o el miedo a que no funcione?`,
    ], (nombre || '') + '1'));
  }
  return cap(pick([
    `${n}soy Paula 💛 Eso que me contaste tiene nombre y tiene salida — y no es a punta de fuerza de voluntad. Javier creó ${APEGO.nombre} exacto para esto, y se entra hoy mismo: ${CHECKOUT_URL}\n\nSon ${precio}, con ${APEGO.garantiaDias} días de garantía total. ¿Empezamos hoy?`,
    `${n}te escribo porque lo que me contaste no se me olvidó 💛 Adentro hay una comunidad activa a cualquier hora, y no vas a tener que explicarle nada a nadie. Entras aquí: ${CHECKOUT_URL}\n\nSon ${precio}, cancelas cuando quieras y tienes ${APEGO.garantiaDias} días de garantía. ¿Te animas hoy? ✨`,
  ], (nombre || '') + '1'));
}

function copyRecordatorio2(user: WaUserRow, ahora: Date, tabla: TablaTasas): string {
  const nombre = user.name;
  const n = saludo(nombre);
  const precio = precioParaElla(user, tabla);
  const encuentro = proximoEncuentro(ahora);
  const cuando = encuentro.enVivo ? 'está empezando ahora mismo' : `${encuentro.frase} (${encuentro.fecha})`;

  return cap(pick([
    `${n}no hay que esperar a ninguna fecha: entras hoy y ya estás adentro 💛 El próximo taller en vivo con Javier ${cuando}, y son dos cada semana.\n\n${CHECKOUT_URL}\n\nSon ${precio}, cancelas cuando quieras y tienes ${APEGO.garantiaDias} días de garantía total. ¿Entras hoy?`,
    `${n}no te escribo para presionarte — te escribo porque sé cómo pesa cada semana más dentro del bucle 💛 Si entras hoy, esta misma noche tienes con quién hablar.\n\nCon ${APEGO.garantiaDias} días de garantía y cancelando cuando quieras: ${CHECKOUT_URL}\n\nSon ${precio}. ¿Te veo adentro? ✨`,
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

/**
 * El precio listo para decírselo a ELLA, en dólares y en su moneda.
 *
 * El dólar va SIEMPRE delante porque es lo que va a ver en la pantalla de
 * Skool; la cifra local va detrás y siempre con "unos", porque lo que le cobre
 * su banco depende de la tasa del día. Si no sabemos de qué país es, va solo el
 * dólar: inventarle una equivalencia sería peor que no darla.
 */
function precioParaElla(user: WaUserRow, tabla: TablaTasas): string {
  const usd = `${APEGO.precio} al mes`;
  const pais = paisPorIso(user.pais) ?? detectarPais(user.phone);
  if (!pais) return usd;

  const local = precioLocal(Number(APEGO.precio.replace(/\D/g, '')), pais.moneda, tabla);
  return local.frase ? `${usd} (${local.frase})` : usd;
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

  // Siempre el de Skool: es donde se ve el programa por dentro Y donde se
  // entra, así que no hay motivo para mandarla primero a la página y hacerla
  // dar un salto de más.
  const linkRequerido = CHECKOUT_URL;

  const historial = messages
    .slice(0, 10)
    .reverse()
    .map((m) => `${m.message.type === 'human' ? 'ELLA' : 'PAULA'}: ${m.message.content}`)
    .join('\n');

  const objetivo =
    toque === 1
      ? `TOQUE 1 (lleva ~4h en silencio): retoma SU dolor exacto (usa sus palabras del historial, no frases genéricas), preséntale ${APEGO.nombre} como el proceso para ESO, entrega este link UNA vez: ${linkRequerido} y cierra con UNA pregunta de decisión.`
      : `TOQUE 2 (lleva ~16h en silencio, último toque): cierre directo. Su dolor en una frase, que se entra HOY mismo sin esperar a ninguna fecha, el link UNA vez: ${linkRequerido}, la garantía de ${APEGO.garantiaDias} días, y UNA pregunta de decisión.`;

  const encargo = `${bloqueContextoApego(new Date(), user.phone)}
---

Eres Paula, cerradora de ${APEGO.nombre} del equipo de Javier Vieira, Psicólogo Especialista. Escribes UN mensaje de seguimiento de VENTA por WhatsApp/Instagram para una mujer que dejó de responder. Tu único objetivo es acercarla HOY a entrar.

Lo que vendes, y todo es verdad: ${APEGO.precioFrase} (SUSCRIPCIÓN mensual, cancela cuando quiera, garantía total de ${APEGO.garantiaDias} días), una COMUNIDAD activa a cualquier hora (ahí no está sola ni tiene que explicarse), ${APEGO.encuentros.horasSemana} horas de talleres en vivo con Javier cada semana (${APEGO.encuentros.diasTexto}, ${APEGO.encuentros.horaTexto} hora Colombia, por ${APEGO.encuentros.plataforma}), ${APEGO.modulos} módulos de terapia guiada paso a paso, y meditaciones y ejercicios para el cuerpo.

**SE ENTRA HOY.** No hay fecha de inicio, no hay que esperar a nada, no hay hora a la que conectarse. Ese es el argumento más fuerte que tienes: úsalo.

⛔ NUNCA nombres la clase del jueves, ni Hotmart, ni Nequi: eso ya no se vende y la mandaría a pagar donde no puede. NUNCA nombres otro día de la semana para los talleres. NUNCA digas "pago único" (es suscripción). NUNCA prometas nada gratis ni un número de módulos distinto de ${APEGO.modulos}.`;

  const prohibido = `"oferta", "descuento", "cupos limitados", "última oportunidad", "pago único"`;

  const sys = `${encargo}

${objetivo}

REGLAS DURAS:
- Máximo 3 globos separados por UNA línea en blanco, ~250 caracteres por globo. El link va en su propio globo.
- El link obligatorio va completo y sin modificar. En el cierre por Nequi puedes usar además el WhatsApp de Javier Vieira que está arriba.
- Texto plano de WhatsApp: sin markdown, sin listas. Emojis solo 💛 y ✨ (máximo 1 por globo).
- PROHIBIDO: ${prohibido}, reprocharle el silencio ("vi que no respondiste"), decir que es un mensaje automático, diagnosticar, prometer cura.
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
    const prohibidoRe = /oferta|descuento|cupos|última oportunidad|ultima oportunidad|pago único|pago unico/i;
    if (prohibidoRe.test(texto)) return null;
    // El candado del producto retirado, igual que en `blindaje.ts`: el historial
    // de estas conversaciones está lleno de la clase del jueves y el modelo la
    // copia. Si se cuela, se cae al copy fijo.
    if (/clase\s+del\s+jueves|nequi|hotmart|recuperando\s+mi\s+ser|volver-a-mi/i.test(texto)) return null;
    return texto;
  } catch {
    return null;
  }
}

async function handle(req: NextRequest) {
  // ═══════════════════════════════════════════════════════════════════════════
  // ⛔ APAGADO POR DEFECTO DESDE EL 2026-08-14 — NO ENCENDER SIN REESCRIBIR.
  //
  // El copy de este cron contiene, textual, «¿Qué es lo que te detiene hoy?» y
  // «¿Es el dinero, el tiempo o el miedo a que no funcione?» — LA PREGUNTA DEL
  // FRENO que Javier prohibió el 2026-08-09 con estas palabras: esa pregunta no
  // existe en este chat, con ninguna palabra. El chat en vivo la tiene vetada
  // por `quitarPreguntaDeFreno`; este cron la mandaba por la puerta de atrás,
  // más garantía no pedida y urgencia. La reescritura del follow-up (un solo
  // toque a +24h, redactado por el modelo con la frase literal de ella) es la
  // fase 7 del plan v2 y se enciende con RECORDATORIOS_V1=on solo con el OK
  // explícito de Javier.
  // ═══════════════════════════════════════════════════════════════════════════
  if (process.env.RECORDATORIOS_V1 !== 'on') {
    return NextResponse.json({
      status: 'apagado',
      motivo: 'copy con la pregunta del freno prohibida — pendiente de reescritura (fase 7 del plan v2)',
    });
  }

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

  // Una sola vez por corrida: va cacheada 12 h y con respaldo, así que ni
  // siquiera es una llamada de red en la mayoría de las ejecuciones.
  const tabla = await tasas();

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

      const marcaLink = ['apegodetox', 'skool.com'];
      const linkYaEnviado = stage === 'link_enviado' || messages.some((m) =>
        m.message && m.message.type === 'ai' &&
        marcaLink.some((marca) => (m.message.content || '').includes(marca))
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
            ? copyRecordatorio1(user, linkYaEnviado, tabla)
            : copyRecordatorio2(user, now, tabla);
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
