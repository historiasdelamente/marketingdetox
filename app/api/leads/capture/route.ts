import { NextRequest, NextResponse } from 'next/server';
import { enviarLibroGratis, EMAIL_RE } from '@/lib/leads/enviar-libro';

const FUENTE = 'Clase Gratis Y Libro';

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

  const { airtableOk, resendOk, warnings } = await enviarLibroGratis({
    email,
    nombre,
    fuente: FUENTE,
  });

  return NextResponse.json({
    success: airtableOk || resendOk,
    airtable: airtableOk,
    resend: resendOk,
    warnings: warnings.length > 0 ? warnings : undefined,
  });
}
