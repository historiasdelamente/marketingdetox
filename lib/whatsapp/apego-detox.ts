// ============================================================================
// PUENTE — este archivo ya NO es fuente de verdad.
//
// Todo lo de Apego Detox (precio, links, talleres en vivo) vive ahora en
// `programa.ts`. Esto se queda solo para que lo que todavía importa
// `apego-detox` —el cron de recordatorios— coma de los datos nuevos y no de los
// viejos. Cuando ese se migre, este archivo se borra.
//
// ⚠️ El precio es un GETTER a propósito: lo decide la fecha, no una constante.
// una constante, un contenedor que lleve días levantado seguiría diciendo el
// precio de lanzamiento después de que subió.
// ============================================================================

import { APEGO_DETOX, bloqueContexto, precioApego, proximoEncuentro } from './programa';

export { proximoEncuentro };
export type { Ocurrencia as Encuentro } from './programa';

export const APEGO = {
  ...APEGO_DETOX,

  /** "$40 USD" — el precio vigente HOY. */
  get precio(): string {
    return `$${precioApego(new Date()).monto} USD`;
  },
  periodicidad: 'al mes',
  /** "$40 USD al mes" — frase completa, para no armarla mal en cada sitio. */
  get precioFrase(): string {
    return precioApego(new Date()).frase;
  },

  /** Testimonios en video de alumnas reales (los mismos de la página). */
  testimoniosHost: 'd3734kf5tip0j0.cloudfront.net',
};

/** Reloj y datos duros de Apego Detox. */
export function bloqueContextoApego(ahora: Date, telefono?: string | null): string {
  return bloqueContexto(ahora, telefono);
}
