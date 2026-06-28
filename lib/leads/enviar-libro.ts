// Motor de entrega del libro para Paula (WhatsApp).
// En vez de Resend/Airtable locales (que viven en desing_web), Paula registra el
// lead y dispara el correo del libro + la secuencia C1–C4 llamando al endpoint
// público de la web: historiasdelamente.com/api/leads/capture.
// Así este repo NO necesita resend/airtable ni env vars de correo, y la mujer
// que llega por WhatsApp entra al MISMO embudo de correos que la de la web.

/** URL del libro gratuito "Cómo Dejar al Narcisista" (PDF hospedado). */
export const URL_LIBRO =
  'https://historiasdelamente.com/libros/como-dejar-al-narcisista.pdf';

/** Valida un email completo (string entero). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Encuentra un email DENTRO de un texto libre (no anclado). */
export const EMAIL_FIND_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;

/** Endpoint de captura de leads (vive en desing_web / Vercel). Override con env. */
const CAPTURE_URL =
  process.env.LEADS_CAPTURE_URL ||
  'https://historiasdelamente.com/api/leads/capture';

export interface EnviarLibroResult {
  airtableOk: boolean;
  resendOk: boolean;
  warnings: string[];
}

/**
 * Registra el lead y le envía el libro gratis + la secuencia C1–C4, llamando al
 * endpoint de la web (que ya maneja Resend + Airtable + Meta CAPI).
 *
 * No lanza excepción: devuelve qué funcionó para que quien llama decida.
 */
export async function enviarLibroGratis(params: {
  email: string;
  nombre: string;
  fuente: string;
}): Promise<EnviarLibroResult> {
  const email = params.email.trim().toLowerCase();
  const nombre = params.nombre.trim();
  const warnings: string[] = [];

  try {
    const res = await fetch(CAPTURE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        nombre,
        utmSource: 'whatsapp',
        utmMedium: 'paula',
        referer: params.fuente,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      warnings.push(`capture ${res.status}: ${txt.slice(0, 120)}`);
      return { airtableOk: false, resendOk: false, warnings };
    }

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      resendEmailOk?: boolean;
      warnings?: string[];
    };
    if (Array.isArray(data.warnings)) warnings.push(...data.warnings);

    // El endpoint es fail-soft: success=true aunque algún paso secundario falle.
    // resendEmailOk refleja si el correo del libro (C1) salió.
    const resendOk = data.resendEmailOk !== false;
    const airtableOk = data.success === true;
    return { airtableOk, resendOk, warnings };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[enviarLibroGratis] capture falló:', msg);
    warnings.push(`capture: ${msg.slice(0, 120)}`);
    return { airtableOk: false, resendOk: false, warnings };
  }
}
