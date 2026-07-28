// ============================================================================
// BUFFER DE MENSAJES — "espera 10 segundos antes de contestar"
//
// El problema real: las mujeres escriben como se habla, en ráfaga.
//   "hola"  ·  "vi el video"  ·  "es este jueves?"  ·  "cuánto vale"
// Un bot normal contesta CUATRO veces, una por mensaje, y se nota que es un
// bot. Paula ahora espera a que ella termine (10 s de silencio), junta todo y
// responde UNA sola vez, entendiendo las cuatro cosas.
//
// Cómo funciona:
//   - Cada mensaje reinicia un temporizador de 10 s (debounce).
//   - Si ella sigue escribiendo, la espera se alarga hasta un tope de 30 s
//     (para que nunca se quede esperando indefinidamente).
//   - Al vencer, se juntan los fragmentos y se procesan como un solo turno.
//   - Si ella escribe MIENTRAS Paula está pensando, ese mensaje no se pierde:
//     queda encolado y arranca un turno nuevo al terminar el actual.
//
// El estado vive en memoria del proceso: el bot corre en UN contenedor
// (EasyPanel/Hostinger, `next start`). Si el contenedor se reinicia justo en
// esos segundos, se pierde a lo sumo un turno pendiente. Si algún día se
// escala a varias réplicas, esto hay que mover a Supabase o Redis.
// ============================================================================

import { processPaulaMessage } from './paula';
import { normalizarCanal, responderComoHumana, type Canal } from './manychat';

const ESPERA_MS = Number(process.env.PAULA_ESPERA_MS || 10000);
const MAX_ESPERA_MS = Number(process.env.PAULA_MAX_ESPERA_MS || 30000);
const MAX_FRAGMENTOS = 15;

type Turno = {
  fragmentos: string[];
  origen: string;
  canal: Canal;
  /** Su número internacional: de ahí sale su país, su hora y su moneda. */
  telefono: string;
  primerMs: number;
  procesando: boolean;
  timer: ReturnType<typeof setTimeout> | null;
};

// globalThis: en `next dev` el módulo se recarga en caliente y se perderían
// los turnos a medio camino.
const store = globalThis as unknown as { __paulaTurnos?: Map<string, Turno> };
const turnos: Map<string, Turno> = store.__paulaTurnos ?? (store.__paulaTurnos = new Map());

export type MensajeEntrante = {
  manychatId: string;
  texto: string;
  origen?: string;
  canal?: string;
  telefono?: string;
};

/**
 * Punto de entrada del webhook. NO espera: registra el fragmento y devuelve
 * el control de inmediato para que ManyChat cierre la petición en milisegundos.
 */
export function encolarMensaje({ manychatId, texto, origen = '', canal = '', telefono = '' }: MensajeEntrante): void {
  const limpio = (texto || '').trim();
  if (!limpio) return;

  const existente = turnos.get(manychatId);

  if (existente) {
    if (existente.fragmentos.length < MAX_FRAGMENTOS) existente.fragmentos.push(limpio);
    if (origen && !existente.origen) existente.origen = origen;
    if (telefono && !existente.telefono) existente.telefono = telefono;
    if (canal) existente.canal = normalizarCanal(canal);
    // Si Paula ya está pensando, este fragmento arranca el siguiente turno
    // cuando termine (lo reprograma el `finally` de `disparar`).
    if (!existente.procesando) programar(manychatId);
    return;
  }

  turnos.set(manychatId, {
    fragmentos: [limpio],
    origen,
    canal: normalizarCanal(canal),
    telefono,
    primerMs: Date.now(),
    procesando: false,
    timer: null,
  });
  programar(manychatId);
}

function programar(manychatId: string): void {
  const turno = turnos.get(manychatId);
  if (!turno) return;

  if (turno.timer) clearTimeout(turno.timer);

  // La espera se reinicia con cada mensaje, pero nunca pasa del tope.
  const transcurrido = Date.now() - turno.primerMs;
  const espera = Math.max(0, Math.min(ESPERA_MS, MAX_ESPERA_MS - transcurrido));

  turno.timer = setTimeout(() => {
    void disparar(manychatId);
  }, espera);

  // No mantengas vivo el proceso solo por este temporizador.
  turno.timer.unref?.();
}

async function disparar(manychatId: string): Promise<void> {
  const turno = turnos.get(manychatId);
  if (!turno || turno.procesando) return;

  turno.procesando = true;
  turno.timer = null;

  // Se vacía el array: lo que llegue durante el proceso se acumula acá mismo.
  const fragmentos = turno.fragmentos.splice(0);
  const mensaje = fragmentos.join('\n');

  try {
    const respuesta = await processPaulaMessage(
      manychatId,
      mensaje,
      turno.origen,
      turno.canal,
      turno.telefono,
    );
    if (respuesta) {
      await responderComoHumana(manychatId, respuesta, turno.canal);
    }
  } catch (err) {
    console.error('[Paula buffer] fallo procesando turno', manychatId, (err as Error).message);
    try {
      await responderComoHumana(
        manychatId,
        'Se me enredó la conexión un momento 💛 ¿Me repites lo último?',
        turno.canal,
      );
    } catch {
      /* si ni el fallback sale, no hay más que hacer */
    }
  } finally {
    turno.procesando = false;
    if (turno.fragmentos.length > 0) {
      // Ella escribió mientras Paula respondía → turno nuevo.
      turno.primerMs = Date.now();
      programar(manychatId);
    } else {
      turnos.delete(manychatId);
    }
  }
}

/** Diagnóstico (health check). */
export function estadoBuffer() {
  return {
    espera_ms: ESPERA_MS,
    max_espera_ms: MAX_ESPERA_MS,
    conversaciones_en_espera: turnos.size,
  };
}
