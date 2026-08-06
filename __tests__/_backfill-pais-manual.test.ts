/**
 * REPARACION DE FICHAS VIEJAS — no corre en la suite normal.
 *
 *   BACKFILL=1 npx vitest run __tests__/_backfill-pais-manual.test.ts            # solo mira e informa
 *   BACKFILL=1 APLICAR=1 npx vitest run __tests__/_backfill-pais-manual.test.ts  # escribe en la base
 *
 * POR QUE EXISTE. Visto en produccion el 2026-08-06: de 878 mujeres en
 * `wa_users`, **877 tenian `pais` en null** — y 565 de ellas SI tenian un
 * telefono bueno guardado, con su indicativo delante. El pais se derivaba del
 * telefono para hablarle en el turno, pero no se persistia nunca (arreglado en
 * `paisDeElla`). Ademas 313 filas tenian el texto literal `{{phone}}` en vez
 * del numero, porque la Solicitud externa de ManyChat manda `{{phone}}`, que
 * en un contacto de WhatsApp viene vacio: el numero vive en `whatsapp_phone`.
 *
 * El arreglo en codigo cura a cada mujer cuando VUELVE a escribir. Esto cura a
 * las que no vuelvan a escribir, que son justo las que hay que recordar.
 *
 * Dos pasadas:
 *   A. Telefono bueno guardado -> pais por indicativo. Gratis, sin red.
 *   B. Telefono roto -> se le pregunta a la API de ManyChat por su
 *      `whatsapp_phone` (mismo token que ya se usa para enviar), y de ahi el
 *      pais. Va despacio a proposito: ManyChat limita a 10 llamadas/segundo.
 *
 * No pisa nada escrito a mano: solo rellena `pais` cuando esta vacio y solo
 * reemplaza `phone` cuando lo que hay no es un telefono.
 *
 * LO QUE SE APRENDIO AL CORRERLO (2026-08-06). De 878 fichas solo se pudieron
 * reparar 12 — y estan bien las 12: son TODAS las conversaciones vivas. Las
 * otras 866 devuelven `"status":"deleted"` en ManyChat, o sea que el contacto
 * ya no existe y su numero no esta en ninguna parte. Da igual: a un contacto
 * borrado tampoco se le puede escribir. Si esto se vuelve a correr y sale un
 * numero bajo, no es que falle: es que la lista vieja esta muerta.
 */
import fs from 'fs';
import path from 'path';
import { describe, it } from 'vitest';

import { detectarPais, esTelefonoReal, paisDeElla } from '@/lib/whatsapp/paises';

// .env.local a mano: un script de vitest no pasa por Next.
const rutaEnv = path.join(process.cwd(), '.env.local');
const env = fs.existsSync(rutaEnv) ? fs.readFileSync(rutaEnv, 'utf-8') : '';
for (const linea of env.split('\n')) {
  const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY as string;
const MANYCHAT_TOKEN = process.env.MANYCHAT_API_TOKEN as string;
const APLICAR = process.env.APLICAR === '1';

/** ManyChat permite 10 llamadas/segundo. Se va a la mitad y no se discute. */
const PAUSA_MS = 200;
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Ficha = {
  manychat_id: string;
  name: string | null;
  phone: string | null;
  pais: string | null;
};

const cabeceras = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

/** Todas las fichas, de mil en mil: el REST de Supabase corta a las 1.000. */
async function traerFichas(): Promise<Ficha[]> {
  const todas: Ficha[] = [];
  for (let desde = 0; ; desde += 1000) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/wa_users?select=manychat_id,name,phone,pais&order=manychat_id.asc&limit=1000&offset=${desde}`,
      { headers: cabeceras },
    );
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
    const lote = (await r.json()) as Ficha[];
    todas.push(...lote);
    if (lote.length < 1000) return todas;
  }
}

async function guardar(manychatId: string, campos: Partial<Ficha>): Promise<boolean> {
  if (!APLICAR) return true;
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/wa_users?manychat_id=eq.${encodeURIComponent(manychatId)}`,
    { method: 'PATCH', headers: cabeceras, body: JSON.stringify(campos) },
  );
  if (!r.ok) di(`   ⚠️  ${manychatId}: Supabase ${r.status} ${await r.text()}`);
  return r.ok;
}

/** El numero de ella segun ManyChat. En WhatsApp vive en `whatsapp_phone`. */
async function telefonoDeManyChat(subscriberId: string): Promise<string | null> {
  try {
    const r = await fetch(
      `https://api.manychat.com/fb/subscriber/getInfo?subscriber_id=${encodeURIComponent(subscriberId)}`,
      { headers: { Authorization: `Bearer ${MANYCHAT_TOKEN}` }, signal: AbortSignal.timeout(10_000) },
    );
    if (!r.ok) return null;
    const data = (await r.json()) as { status?: string; data?: Record<string, unknown> };
    if (data.status !== 'success' || !data.data) return null;
    for (const campo of ['whatsapp_phone', 'phone', 'wa_id']) {
      const v = data.data[campo];
      if (typeof v === 'string' && esTelefonoReal(v)) return v;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Vitest se traga los console.log de una prueba larga, asi que el informe se
 * escribe tambien en `backfill-pais.txt` — como `auditoria-paula.txt`.
 */
const lineas: string[] = [];
function di(texto: string) {
  console.log(texto);
  lineas.push(texto);
}

describe('reparar el país de las fichas viejas', () => {
  it.skipIf(!process.env.BACKFILL)('rellena país y rescata teléfonos', { timeout: 1_800_000 }, async () => {
    di(APLICAR ? '\n🔴 MODO ESCRITURA\n' : '\n🔵 SOLO MIRANDO (pon APLICAR=1 para escribir)\n');

    const fichas = await traerFichas();
    const conPais = fichas.filter((f) => f.pais).length;
    di(`${fichas.length} mujeres · ${conPais} con país · ${fichas.length - conPais} sin país`);

    // --- PASADA A: el indicativo que ya teníamos guardado -------------------
    const conNumero = fichas.filter((f) => !f.pais && esTelefonoReal(f.phone));
    di(`\nA. ${conNumero.length} con teléfono bueno y sin país`);

    const porPais: Record<string, number> = {};
    let curadasA = 0;
    for (const f of conNumero) {
      const iso = paisDeElla(null, f.phone);
      if (!iso) continue;
      if (await guardar(f.manychat_id, { pais: iso })) {
        porPais[iso] = (porPais[iso] ?? 0) + 1;
        curadasA++;
      }
    }
    di(`   ${curadasA} con país deducido del indicativo`);

    // --- PASADA B: preguntarle el número a ManyChat -------------------------
    const rotas = fichas.filter((f) => !esTelefonoReal(f.phone));
    di(`\nB. ${rotas.length} sin teléfono válido — se le pregunta a ManyChat`);

    let rescatados = 0;
    let sinNumero = 0;
    for (const [i, f] of rotas.entries()) {
      const tel = await telefonoDeManyChat(f.manychat_id);
      await dormir(PAUSA_MS);
      if (!tel) {
        sinNumero++;
        continue;
      }
      const iso = detectarPais(tel)?.iso ?? null;
      const campos: Partial<Ficha> = { phone: tel };
      if (iso && !f.pais) campos.pais = iso;
      if (await guardar(f.manychat_id, campos)) {
        rescatados++;
        if (iso) porPais[iso] = (porPais[iso] ?? 0) + 1;
      }
      if ((i + 1) % 50 === 0) di(`   ...${i + 1}/${rotas.length}`);
    }
    di(`   ${rescatados} teléfonos rescatados · ${sinNumero} sin número en ManyChat`);

    // --- El mapa que sale de todo esto -------------------------------------
    di('\n🌎 DE DÓNDE SON (fichas tocadas en esta pasada)');
    for (const [iso, n] of Object.entries(porPais).sort((a, b) => b[1] - a[1])) {
      di(`   ${iso}  ${String(n).padStart(4)}`);
    }
    di(
      APLICAR
        ? '\n✅ Escrito en la base.\n'
        : '\n🔵 No se escribió nada. Repite con APLICAR=1.\n',
    );

    // El informe a disco. Vitest se traga los console.log de una prueba de seis
    // minutos, y la primera pasada se corrió a ciegas justo por esto.
    fs.writeFileSync(path.join(process.cwd(), 'backfill-pais.txt'), lineas.join('\n'), 'utf-8');
  });
});
