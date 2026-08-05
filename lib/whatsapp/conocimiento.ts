// ============================================================================
// EL CONOCIMIENTO DE PAULA — content/PAULA-CONOCIMIENTO.md
//
// Fuente ÚNICA de lo que Paula puede afirmar. Lo escribió Javier; nadie lo
// parchea desde el código. Sustituye a los 7 MD de agents-source/prompts/whatsapp,
// de los que solo se cargaban 2 y que había que anular a mano desde el prompt
// ("más abajo dice 15 módulos: ANULADO"). Si hay que anular algo, es que el
// documento está mal — se arregla el documento.
//
// Desde el 2026-08-05 se sirve entero: hay un solo producto (Apego Detox en
// Skool), así que ya no hay nada que esconderle.
//
// El caché tiene TTL para que el día que esto viva en Supabase, un cambio se
// vea sin redesplegar.
// ============================================================================

import fs from 'fs';
import path from 'path';

import type { Escalon } from './escalera';

const RUTA = path.join(process.cwd(), 'content', 'PAULA-CONOCIMIENTO.md');

/** 60 s: suficiente para no leer disco en cada mensaje, corto para ver un cambio. */
const TTL_MS = 60_000;

let cache: { texto: string; ts: number } | null = null;

/** Los comentarios HTML son notas internas (pendientes, decisiones). Fuera. */
const COMENTARIOS = /<!--[\s\S]*?-->/g;

export function cargarConocimiento(ahora = Date.now()): string {
  if (cache && ahora - cache.ts < TTL_MS) return cache.texto;
  const texto = fs.readFileSync(RUTA, 'utf-8').replace(COMENTARIOS, '').trim();
  cache = { texto, ts: ahora };
  return texto;
}

export function limpiarCacheConocimiento(): void {
  cache = null;
}

/**
 * Parte el documento por sus títulos de primer nivel (`# 1. ...`).
 * Devuelve pares [número, bloque completo con su título].
 */
export function bloques(texto = cargarConocimiento()): Array<{ n: number; titulo: string; cuerpo: string }> {
  const out: Array<{ n: number; titulo: string; cuerpo: string }> = [];
  const partes = texto.split(/^# (?=\d+\.)/m).slice(1);

  for (const parte of partes) {
    const titulo = parte.split('\n', 1)[0].trim();
    const n = Number(titulo.match(/^(\d+)\./)?.[1]);
    if (Number.isFinite(n)) out.push({ n, titulo, cuerpo: `# ${parte}`.trimEnd() });
  }
  return out;
}

/**
 * Qué bloques recibe Paula, y EN QUÉ ORDEN los va a leer.
 *
 * ⚠️ Desde el 2026-08-05 hay un solo producto, así que entran TODOS. Esto era
 * un `Record` con dos filas —la de la clase servía un subconjunto recortado
 * para que Paula no nombrara Apego Detox antes de tiempo—; con la escalera
 * retirada, ese recorte ya no tiene sentido y esconder material solo la deja
 * sin argumentos.
 *
 * El bloque 11 (qué contestar si ella pregunta por la clase del jueves) va al
 * FINAL a propósito: es una respuesta reactiva, no material de venta. Si fuera
 * arriba, el modelo lo leería como lo primero que tiene que decir y volvería a
 * nombrar la clase por su cuenta — que es exactamente lo que se quitó.
 */
const ORDEN: Record<Escalon, number[]> = {
  apego: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

/** Lo que Paula puede leer en ESTE turno. */
export function conocimientoPara(escalon: Escalon, texto = cargarConocimiento()): string {
  const todos = bloques(texto);
  const permitidos = ORDEN[escalon];

  return todos
    .filter((b) => permitidos.includes(b.n))
    .sort((a, b) => permitidos.indexOf(a.n) - permitidos.indexOf(b.n))
    .map((b) => b.cuerpo)
    .join('\n\n---\n\n');
}
