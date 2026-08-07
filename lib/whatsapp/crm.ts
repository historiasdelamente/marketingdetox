// ============================================================================
// EL PUENTE DE PAULA AL CRM
//
// Cuando ella le da su correo por WhatsApp, ese correo tiene que acabar en el
// mismo sitio que los del blog: `personas`, en crm.historiasdelamente.com. De
// ahí sale sola la secuencia de tres correos (la cartilla, la abstinencia, las
// dos mujeres) — Paula no manda ningún correo, solo entrega el dato.
//
// ⚠️ ESTO NUNCA PUEDE TUMBAR UNA CONVERSACIÓN. Si el CRM está caído, lento o
// mal configurado, la función se rinde en silencio y devuelve el motivo para el
// log. Ella sigue hablando con Paula como si nada. Perder la copia es molesto;
// dejarla esperando un mensaje que no llega porque un POST se colgó es peor.
//
// El endpoint es idempotente por correo: si la misma mujer ya entró por el
// blog, no se duplica ni se le reinicia la secuencia.
// ============================================================================

export type LeadCRM = {
  email: string;
  nombre?: string | null;
  telefono?: string | null;
  pais?: string | null;
  /** Siempre 'paula' desde aquí: es lo que deja ver por qué puerta entró. */
  origen: string;
  extra?: Record<string, unknown>;
};

const TIMEOUT_MS = 4000;

/**
 * SACA EL CORREO DE UN MENSAJE DE WHATSAPP.
 *
 * Se hace con expresión regular y no con el extractor de datos del modelo, y es
 * a propósito: un correo mal leído no se nota hasta que el envío rebota, y un
 * modelo barato se come un punto o cambia una letra. La regla es la de siempre
 * en esta casa — lo que se puede calcular, se calcula.
 *
 * Tolera lo que la gente escribe de verdad: mayúsculas, un punto final pegado,
 * y espacios alrededor. No tolera dos correos en el mismo mensaje: se queda con
 * el primero.
 */
const CORREO = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

export function correoEn(mensaje: string): string | null {
  const m = (mensaje || '').match(CORREO);
  if (!m) return null;
  // Un punto final de frase pegado al dominio no es parte del correo.
  return m[0].replace(/\.$/, '').toLowerCase();
}

export async function enviarLeadAlCRM(lead: LeadCRM): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.CRM_CAPTURE_URL;
  const token = process.env.CRM_CAPTURE_TOKEN;
  if (!url || !token) return { ok: false, error: 'CRM no configurado' };

  const abortar = new AbortController();
  const reloj = setTimeout(() => abortar.abort(), TIMEOUT_MS);

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-crm-token': token },
      body: JSON.stringify(lead),
      signal: abortar.signal,
      cache: 'no-store',
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      return { ok: false, error: `HTTP ${r.status} ${t.slice(0, 120)}` };
    }
    return { ok: true };
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    return { ok: false, error: m.includes('abort') ? `sin respuesta en ${TIMEOUT_MS}ms` : m };
  } finally {
    clearTimeout(reloj);
  }
}
