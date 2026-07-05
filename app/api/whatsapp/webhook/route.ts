import { NextRequest, NextResponse } from 'next/server';
import { processPaulaMessage } from '@/lib/whatsapp/paula';

/**
 * POST /api/whatsapp/webhook
 *
 * Recibe mensajes de ManyChat (External Request) y devuelve la respuesta de
 * Paula. El MISMO webhook sirve para las automatizaciones de WhatsApp y de
 * Instagram: cada automatización de ManyChat muestra el bot_response en su
 * propio canal.
 *
 * ManyChat envía:
 * {
 *   "user_id": "123456",           // ManyChat subscriber ID
 *   "user_message": "Hola",        // Último mensaje de la usuaria
 *   "origen": "tiktok_live",       // (opcional) de dónde viene: tiktok_live | instagram | anuncio...
 *   "canal": "whatsapp"            // (opcional) transporte: whatsapp | instagram
 * }
 *
 * Devuelve:
 * {
 *   "bot_response": "Respuesta de Paula..."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract fields from ManyChat payload
    const userId = body.user_id || body.subscriber_id;
    const userMessage = body.user_message || body.last_input_text || body.message;
    const origen = body.origen || body.source || body.utm_source || '';
    const canal = body.canal || body.channel || '';

    if (!userId || !userMessage) {
      return NextResponse.json(
        { error: 'Faltan campos: user_id y user_message son requeridos' },
        { status: 400 }
      );
    }

    // Process message through Paula
    const paulaResponse = await processPaulaMessage(
      String(userId),
      String(userMessage),
      String(origen),
      String(canal),
    );

    // ManyChat expects bot_response in the JSON response
    return NextResponse.json({
      bot_response: paulaResponse,
    });

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
  return NextResponse.json({
    status: 'ok',
    agent: 'Paula - Historias de la Mente',
    objetivo: 'venta Apego Detox',
    timestamp: new Date().toISOString(),
  });
}
