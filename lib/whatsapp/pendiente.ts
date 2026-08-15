// ============================================================================
// LO PENDIENTE — lo que Paula pidió y ella todavía no contestó
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  📌 POR QUÉ EXISTE. Alejandra (1273511096, 2026-08-14):                   ║
// ║                                                                           ║
// ║     PAULA:     «…¿a qué correo te la mando?»                              ║
// ║     ALEJANDRA: «Alejandra campos»          ← su APELLIDO, no un correo    ║
// ║     PAULA:     [folleto del programa + link]                              ║
// ║                                                                           ║
// ║  El sistema sabía que eso no era un correo (`correoEn()` devolvía null)   ║
// ║  pero NADIE CONSUMÍA ESE HECHO: el estado del guion se calculaba sobre lo ║
// ║  que PAULA había dicho («ya ofrecí la cartilla»), no sobre lo que ELLA    ║
// ║  contestó. No existía el concepto de «pregunté algo y lo que llegó no lo  ║
// ║  responde». Este módulo es ese concepto.                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
//
// ⚠️ SOLO EL CORREO, A PROPÓSITO. Es el único pedido cuya respuesta se valida
// por código sin ambigüedad (`correoEn()`: regex, no modelo). El nombre y el
// carril se rigen por la regla nueva de la conversación — «si ella ignora tu
// pregunta y sigue contando, eso ES la respuesta: la pregunta muere» — así que
// marcarlos como pendientes sería fabricar re-preguntas, que es exactamente lo
// que este sistema vino a matar. Si algún día se añade un pedido aquí, tiene
// que pasar la misma vara: validable por código, y con una conversación real
// perdida como evidencia.
//
// Es la pieza 📮 del estado v2: un HECHO que se le entrega al modelo («le
// pediste el correo y contestó otra cosa»), nunca una orden sobre qué escribir.
// ============================================================================

import { correoEn } from './crm';
import type { Turno } from './guion';

/** «¿a qué correo…?», «tu correo», «me dejas tu email» — lo escribió Paula. */
const PIDIO_CORREO = /a qu[ée] correo|tu correo|tu email|tu e-mail|me dejas (el|tu) correo/i;

/** ¿El último mensaje de Paula le pidió el correo? */
export function pidioCorreo(ultimaDePaula: string): boolean {
  return PIDIO_CORREO.test(ultimaDePaula || '');
}

export type Pendiente = {
  pedido: 'correo';
  /** Cuántas veces lo ha pedido Paula en toda la conversación. */
  vecesPedido: number;
};

/**
 * EL HECHO: Paula pidió el correo y lo que ella mandó no lo trae.
 *
 * Devuelve null si no hay nada pendiente o si ya se pidió 2 veces — a partir
 * de ahí retomarlo es acoso, no memoria, y el dato se da por imposible.
 */
export function hayPedidoSinContestar(historial: Turno[], mensajeDeElla: string): Pendiente | null {
  const ultimaDePaula = [...historial].reverse().find((m) => m.role === 'assistant')?.content ?? '';
  if (!pidioCorreo(ultimaDePaula)) return null;
  if (correoEn(mensajeDeElla) !== null) return null;

  const vecesPedido = historial.filter(
    (m) => m.role === 'assistant' && PIDIO_CORREO.test(m.content || ''),
  ).length;

  if (vecesPedido >= 2) return null;
  return { pedido: 'correo', vecesPedido };
}

/**
 * El bloque 📮 para el prompt v2. Hechos, no órdenes: dice QUÉ pasó y deja el
 * CÓMO al modelo, con una sola restricción (no fingir que el dato llegó).
 */
export function bloquePendiente(historial: Turno[], mensajeDeElla: string): string {
  const p = hayPedidoSinContestar(historial, mensajeDeElla);
  if (!p) return '';

  return `# 📮 PENDIENTE
Le pediste su correo para la cartilla y lo que contestó NO es un correo — no des por hecho que llegó ni confirmes ningún envío. Atiende primero lo que ella acaba de decir; si cabe con naturalidad, acláralo y pídeselo una vez más. Ya lo pediste ${p.vecesPedido === 1 ? 'una vez' : `${p.vecesPedido} veces`}: si tampoco sale ahora, suéltalo y sigue sin él.`;
}
