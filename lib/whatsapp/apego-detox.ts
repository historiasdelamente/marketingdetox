// ============================================================================
// PUENTE — este archivo ya NO es fuente de verdad.
//
// Todo lo de Apego Detox (precio, links, encuentros) vive ahora en
// `programa.ts`, junto con la clase del jueves y la escalera que las ordena.
// Esto se queda solo para que lo que todavía importa `apego-detox` —los
// recordatorios y el estado del webhook— coma de los datos nuevos y no de los
// viejos. Cuando esos dos se migren, este archivo se borra.
//
// ⚠️ El precio es un GETTER a propósito: cambia solo el 15 de agosto. Si fuera
// una constante, un contenedor que lleve días levantado seguiría diciendo el
// precio de lanzamiento después de que subió.
// ============================================================================

import type { Escalon } from './escalera';
import { APEGO_DETOX, bloqueContexto, precioApego, proximoEncuentro } from './programa';

export { proximoEncuentro };
export type { Ocurrencia as Encuentro } from './programa';

export const APEGO = {
  ...APEGO_DETOX,

  /** "$20 USD" — el precio vigente HOY. */
  get precio(): string {
    return `$${precioApego(new Date()).monto} USD`;
  },
  periodicidad: 'al mes',
  /** "$20 USD al mes" — frase completa, para no armarla mal en cada sitio. */
  get precioFrase(): string {
    return precioApego(new Date()).frase;
  },

  /** Testimonios en video de alumnas reales (los mismos de la página). */
  testimoniosHost: 'd3734kf5tip0j0.cloudfront.net',
};

/** Reloj y datos duros de Apego Detox. Delega en el bloque por escalón. */
export function bloqueContextoApego(ahora: Date, telefono?: string | null): string {
  return bloqueContexto(ahora, telefono, 'apego' as Escalon);
}
