import { NextRequest, NextResponse } from 'next/server';
import { createLead, primerNombre } from '@/lib/leads/airtable';
import { sendEmail } from '@/lib/email/resend-client';
import {
  CORREO_1_SUBJECT,
  correo1BienvenidaHTML,
  correo1BienvenidaText,
} from '@/lib/email/templates/correo-1-bienvenida';

const URL_LIBRO =
  'https://drive.google.com/file/d/1_lI21koXBdoHqR8KaOfrk2uUTJnwrplT/view?usp=sharing';

const FUENTE = 'Clase Gratis Y Libro';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera un minuto.' },
      { status: 429 }
    );
  }

  let body: { email?: string; nombre?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const nombre = (body.nombre || '').trim();

  if (!email || !EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }
  if (!nombre || nombre.length < 2 || nombre.length > 80) {
    return NextResponse.json(
      { error: 'Nombre inválido (mínimo 2, máximo 80 caracteres)' },
      { status: 400 }
    );
  }

  let airtableOk = false;
  let resendOk = false;
  const warnings: string[] = [];

  try {
    await createLead({ email, nombre, fuente: FUENTE });
    airtableOk = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[leads/capture] Airtable falló:', msg);
    warnings.push(`airtable: ${msg.slice(0, 120)}`);
  }

  try {
    const pNombre = primerNombre(nombre);
    const params = {
      primerNombre: pNombre,
      urlLibro: URL_LIBRO,
      unsubscribeUrl: `https://historiasdelamente.com/unsubscribe?email=${encodeURIComponent(email)}`,
    };
    await sendEmail({
      to: email,
      subject: CORREO_1_SUBJECT(pNombre),
      html: correo1BienvenidaHTML(params),
      text: correo1BienvenidaText(params),
      unsubscribeUrl: params.unsubscribeUrl,
    });
    resendOk = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[leads/capture] Resend falló:', msg);
    warnings.push(`resend: ${msg.slice(0, 120)}`);
  }

  return NextResponse.json({
    success: airtableOk || resendOk,
    airtable: airtableOk,
    resend: resendOk,
    warnings: warnings.length > 0 ? warnings : undefined,
  });
}
