// ============================================================================
// OÍDO — transcripción de notas de voz
//
// Muchas mujeres no escriben: mandan un audio de 40 segundos contando todo.
// Hoy Paula no lo oye y responde cualquier cosa. Con esto, el audio se
// transcribe y entra al mismo flujo que un mensaje escrito.
//
// Funciona con cualquier API compatible con OpenAI Whisper. Se elige sola:
//   1. GROQ_API_KEY   → whisper-large-v3-turbo (la más barata y rápida)
//   2. OPENAI_API_KEY → whisper-1
// Si no hay ninguna, devuelve null y Paula responde con elegancia que por
// ahora prefiere leerla (nunca finge que escuchó).
// ============================================================================

type ProveedorAudio = { url: string; key: string; model: string };

function proveedor(): ProveedorAudio | null {
  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    return {
      url: 'https://api.groq.com/openai/v1/audio/transcriptions',
      key: groq,
      model: process.env.TRANSCRIPCION_MODELO || 'whisper-large-v3-turbo',
    };
  }
  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    return {
      url: 'https://api.openai.com/v1/audio/transcriptions',
      key: openai,
      model: process.env.TRANSCRIPCION_MODELO || 'whisper-1',
    };
  }
  return null;
}

export function transcripcionDisponible(): boolean {
  return proveedor() !== null;
}

/** Mensaje que ve ella cuando manda un audio y no hay transcriptor configurado. */
export const SIN_OIDO =
  'Perdona, los audios no me están llegando bien 💛 ¿Me lo escribes? Aunque sea en corto, te leo.';

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB — una nota de voz nunca pesa tanto

/**
 * Descarga la nota de voz y la transcribe.
 * Devuelve el texto, o null si no se pudo (nunca lanza: el turno debe seguir).
 */
export async function transcribirAudio(audioUrl: string): Promise<string | null> {
  const prov = proveedor();
  if (!prov || !audioUrl) return null;

  try {
    const descarga = await fetch(audioUrl, { signal: AbortSignal.timeout(20000) });
    if (!descarga.ok) {
      console.error('[Paula audio] no se pudo descargar:', descarga.status);
      return null;
    }

    const buffer = await descarga.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) return null;

    const tipo = descarga.headers.get('content-type') || 'audio/ogg';
    const ext = tipo.includes('mp4') || tipo.includes('m4a') ? 'm4a'
      : tipo.includes('mpeg') || tipo.includes('mp3') ? 'mp3'
      : tipo.includes('wav') ? 'wav'
      : 'ogg';

    const form = new FormData();
    form.append('file', new Blob([buffer], { type: tipo }), `nota.${ext}`);
    form.append('model', prov.model);
    form.append('language', 'es');
    form.append('response_format', 'json');

    const resp = await fetch(prov.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${prov.key}` },
      body: form,
      signal: AbortSignal.timeout(45000),
    });

    if (!resp.ok) {
      console.error('[Paula audio] transcripción falló:', resp.status, (await resp.text()).slice(0, 200));
      return null;
    }

    const data = await resp.json();
    const texto = String(data?.text || '').trim();
    return texto.length >= 2 ? texto : null;
  } catch (err) {
    console.error('[Paula audio] error:', (err as Error).message);
    return null;
  }
}
