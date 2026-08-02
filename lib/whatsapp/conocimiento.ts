// ============================================================================
// EL CONOCIMIENTO DE PAULA — content/PAULA-CONOCIMIENTO.md
//
// Fuente ÚNICA de lo que Paula puede afirmar. Lo escribió Javier; nadie lo
// parchea desde el código. Sustituye a los 7 MD de agents-source/prompts/whatsapp,
// de los que solo se cargaban 2 y que había que anular a mano desde el prompt
// ("más abajo dice 15 módulos: ANULADO"). Si hay que anular algo, es que el
// documento está mal — se arregla el documento.
//
// Se sirve por escalón: en la clase del jueves no se le mete encima todo el
// material de venta de Apego Detox, porque lo repite aunque no venga al caso.
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
 * Qué bloques recibe cada escalón, y EN QUÉ ORDEN los va a leer.
 *
 * En la clase entra el bloque 1 (qué es Apego Detox) solo para reconocerlo si
 * ella pregunta — sin su precio, sin sus links y sin sus objeciones. El bloque 8
 * es veneno ahí: sus respuestas hablan de "$20 al mes" y el blindaje marcaría
 * `mensualidad_en_clase` en cada mensaje.
 *
 * Los universales (7 el método, 9 las prohibiciones, 10 el handoff) van en los dos.
 */
const ORDEN: Record<Escalon, number[]> = {
  clase: [11, 1, 7, 9, 10],
  apego: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

/**
 * Lo que Paula puede leer en ESTE turno.
 *
 * En el escalón de la clase no se le entrega el material de venta de Apego
 * Detox: con él delante lo nombra aunque nadie se lo haya preguntado, y eso
 * rompe el orden. Lo que sí lleva siempre es qué es Apego Detox (bloque 1),
 * para reconocerlo cuando ella pregunte y poder subir de escalón.
 */
export function conocimientoPara(escalon: Escalon, texto = cargarConocimiento()): string {
  const todos = bloques(texto);
  const permitidos = ORDEN[escalon];

  return todos
    .filter((b) => permitidos.includes(b.n))
    .sort((a, b) => permitidos.indexOf(a.n) - permitidos.indexOf(b.n))
    .map((b) => b.cuerpo)
    .join('\n\n---\n\n');
}
