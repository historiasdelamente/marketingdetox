import { createLead, primerNombre } from '@/lib/leads/airtable';
import { sendEmail } from '@/lib/email/resend-client';
import {
  CORREO_1_SUBJECT,
  correo1BienvenidaHTML,
  correo1BienvenidaText,
} from '@/lib/email/templates/correo-1-bienvenida';

/** URL del libro gratuito "Cómo Dejar al Narcisista" (PDF hospedado, lleva a Apego Detox). */
export const URL_LIBRO =
  'https://historiasdelamente.com/libros/como-dejar-al-narcisista.pdf';

/** Valida un email completo (string entero). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Encuentra un email DENTRO de un texto libre (no anclado). */
export const EMAIL_FIND_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;

export interface EnviarLibroResult {
  airtableOk: boolean;
  resendOk: boolean;
  warnings: string[];
}

/**
 * Registra el lead en la lista maestra (Airtable) y le envía el libro gratis por correo (Resend).
 *
 * Es el "motor" único de entrega del libro. Lo reutilizan:
 *  - la landing `/clase-gratis-y-libro` (vía /api/leads/capture)
 *  - Paula en WhatsApp (cuando la usuaria deja su correo en el chat)
 *
 * No lanza excepción: devuelve qué pasos funcionaron para que quien llama decida.
 */
export async function enviarLibroGratis(params: {
  email: string;
  nombre: string;
  fuente: string;
}): Promise<EnviarLibroResult> {
  const email = params.email.trim().toLowerCase();
  const nombre = params.nombre.trim();
  const warnings: string[] = [];
  let airtableOk = false;
  let resendOk = false;

  try {
    await createLead({ email, nombre, fuente: params.fuente });
    airtableOk = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[enviarLibroGratis] Airtable falló:', msg);
    warnings.push(`airtable: ${msg.slice(0, 120)}`);
  }

  try {
    const pNombre = primerNombre(nombre);
    const tplParams = {
      primerNombre: pNombre,
      urlLibro: URL_LIBRO,
      unsubscribeUrl: `https://historiasdelamente.com/unsubscribe?email=${encodeURIComponent(email)}`,
    };
    await sendEmail({
      to: email,
      subject: CORREO_1_SUBJECT(pNombre),
      html: correo1BienvenidaHTML(tplParams),
      text: correo1BienvenidaText(tplParams),
      unsubscribeUrl: tplParams.unsubscribeUrl,
    });
    resendOk = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[enviarLibroGratis] Resend falló:', msg);
    warnings.push(`resend: ${msg.slice(0, 120)}`);
  }

  return { airtableOk, resendOk, warnings };
}
