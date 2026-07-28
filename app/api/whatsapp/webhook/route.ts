import { NextRequest, NextResponse } from 'next/server';
import { processPaulaMessage } from '@/lib/whatsapp/paula';
import { encolarMensaje, estadoBuffer } from '@/lib/whatsapp/buffer';
import { SIN_OIDO, transcribirAudio, transcripcionDisponible } from '@/lib/whatsapp/audio';
import { CLASE, cuentaRegresiva } from '@/lib/whatsapp/contexto-clase';

/**
 * POST /api/whatsapp/webhook
 *
 * Recibe mensajes de ManyChat (External Request) y los pasa a Paula.
 * El MISMO webhook sirve para WhatsApp y para Instagram.
 *
 * ── DOS MODOS ──────────────────────────────────────────────────────────────
 *
 * MODO HUMANO (por defecto, requiere MANYCHAT_API_TOKEN)
 *   El webhook contesta 200 vacío en milisegundos y Paula responde después,
 *   por su cuenta, vía la API de ManyChat. Esto es lo que permite:
 *     · esperar 10 segundos a que ella termine de escribir (buffer),
 *     · juntar sus mensajitos en un solo turno,
 *     · responder en 2-3 globos con pausas de tecleo reales.
 *   Necesario porque la "Solicitud externa" de ManyChat se cae a los 10 s y
 *   esperar 10 s + pensar la respuesta no cabe ahí ni de lejos.
 *   → En ManyChat: dejar SOLO el nodo de Solicitud externa. Quitar el nodo
 *     que enviaba {{bot_response}}, porque ahora el mensaje lo manda Paula.
 *
 * MODO CLÁSICO (fallback automático si no hay MANYCHAT_API_TOKEN, o con
 * PAULA_MODO=sync)
 *   Responde en la misma petición con {"bot_response": "..."} como siempre.
 *   Sin espera de 10 s (no cabe en el timeout de ManyChat).
 *
 * ── PAYLOAD ────────────────────────────────────────────────────────────────
 * {
 *   "user_id": "123456",           // ManyChat subscriber ID
 *   "user_message": "Hola",        // Último mensaje de la usuaria
 *   "phone": "+521234567890",      // (opcional) su número internacional
 *   "audio_url": "https://...",    // (opcional) nota de voz
 *   "origen": "tiktok_live",       // (opcional) de dónde viene
 *   "canal": "whatsapp"            // (opcional) whatsapp | instagram
 * }
 *
 * ⚠️ `phone` es lo que le permite a Paula saber de qué país escribe ella, y con
 * eso darle la hora de la clase en SU zona horaria y el precio en SU moneda.
 * Si ManyChat no lo manda ({{phone}} en la External Request), Paula no asume
 * Colombia: da dólares y dice "hora Colombia" explícito, sin preguntarle nada.
 * Instagram no trae número, y ahí es normal.
 */

function modoHumano(): boolean {
  if (process.env.PAULA_MODO === 'sync') return false;
  return Boolean(process.env.MANYCHAT_API_TOKEN);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userId = body.user_id || body.subscriber_id;
    let userMessage = body.user_message || body.last_input_text || body.message || '';
    const audioUrl = body.audio_url || body.audio || body.attachment_url || '';
    const origen = body.origen || body.source || body.utm_source || '';
    const canal = body.canal || body.channel || '';
    const telefono = body.phone || body.whatsapp_phone || body.telefono || '';

    if (!userId) {
      return NextResponse.json({ error: 'Falta user_id' }, { status: 400 });
    }

    // Nota de voz: se transcribe y entra al flujo como si lo hubiera escrito.
    if (audioUrl && String(audioUrl).startsWith('http')) {
      if (!transcripcionDisponible()) {
        return NextResponse.json({ bot_response: SIN_OIDO });
      }
      const texto = await transcribirAudio(String(audioUrl));
      if (!texto) {
        return NextResponse.json({ bot_response: SIN_OIDO });
      }
      userMessage = [String(userMessage).trim(), texto].filter(Boolean).join('\n');
    }

    if (!String(userMessage).trim()) {
      return NextResponse.json(
        { error: 'Faltan campos: user_message o audio_url son requeridos' },
        { status: 400 }
      );
    }

    // --- MODO HUMANO: contestar ya, pensar después ---
    if (modoHumano()) {
      encolarMensaje({
        manychatId: String(userId),
        texto: String(userMessage),
        origen: String(origen),
        canal: String(canal),
        telefono: String(telefono),
      });
      // bot_response vacío a propósito: el mensaje lo manda Paula por la API.
      return NextResponse.json({ bot_response: '', encolado: true });
    }

    // --- MODO CLÁSICO: respuesta en la misma petición ---
    const paulaResponse = await processPaulaMessage(
      String(userId),
      String(userMessage),
      String(origen),
      String(canal),
      String(telefono),
    );

    return NextResponse.json({ bot_response: paulaResponse });

  } catch (error) {
    console.error('[Paula Webhook Error]', error);
    return NextResponse.json(
      {
        bot_response: 'En este momento no puedo responder. Escríbeme de nuevo en unos minutos 💛',
      },
      { status: 200 } // Return 200 even on error so ManyChat sends the fallback
    );
  }
}

// GET for health check / verification
export async function GET() {
  const cuenta = cuentaRegresiva(new Date());
  return NextResponse.json({
    status: 'ok',
    agent: 'Paula - Historias de la Mente',
    modo: modoHumano() ? 'humano (buffer + globos)' : 'clasico (respuesta sincrona)',
    modelo: process.env.PAULA_MODEL || 'openai/gpt-4.1 (por defecto)',
    oido: transcripcionDisponible() ? 'audios activos' : 'audios sin transcriptor',
    clase: { nombre: CLASE.nombre, activa: CLASE.activa, estado: cuenta.estado, cuenta: cuenta.frase },
    buffer: estadoBuffer(),
    timestamp: new Date().toISOString(),
  });
}
