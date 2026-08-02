// ============================================================================
// PAÍSES Y RELOJ — de qué país te escribe ELLA, y cómo se escribe una fecha.
//
// ⚠️ ESTO NO ES LA FUENTE DE LA CLASE NI DE NINGÚN PRODUCTO. Nombre, fecha,
// precio y links viven en `programa.ts` (CLASE_JUEVES, APEGO_DETOX), y ahí las
// fechas se calculan solas. Aquí hay dos cosas, y las dos son estables: la
// tabla de países (indicativo telefónico → zona horaria + moneda) y las
// funciones que dan formato a fechas y horas.
//
// POR QUÉ LA SEPARACIÓN: este archivo se llamaba `contexto-clase.ts` y tenía
// adentro una SEGUNDA copia de la clase, con su propio interruptor `activa` y
// una fecha fija de una sola edición. Esa copia se quedó vieja y el cron de
// recordatorios la leyó durante días: Paula conversaba vendiendo la clase del
// jueves y, cuatro horas después, el recordatorio le mandaba a la misma mujer
// otro producto. Un dato duro, un solo lugar.
//
// Las horas se calculan con zonas IANA reales (Intl), así que el horario de
// verano de Estados Unidos, Chile o España sale bien solo, sin tocar nada.
// ============================================================================

// ---------------------------------------------------------------------------
// 1. PAÍSES — indicativo telefónico → zona horaria + moneda
// ---------------------------------------------------------------------------

/**
 * Precio ancla en dólares: es lo que cobra la pasarela, y todo lo demás en la
 * tabla es su equivalencia local. Tiene que decir lo mismo que
 * `CLASE_JUEVES.precios.USD` en `programa.ts`.
 */
const PRECIO_USD = '7 USD';

export type Pais = {
  iso: string;
  nombre: string;
  /** Indicativos SIN el "+". El más largo gana (1809 antes que 1). */
  prefijos: string[];
  /** Zona IANA de referencia. */
  tz: string;
  /** Ciudad que se nombra al dar la hora. */
  ciudad: string;
  /**
   * Precio de la clase ya formateado para decirlo tal cual. Lo usa el cron de
   * recordatorios (`api/cron/recordatorios-apego`) para darle la cifra en SU
   * moneda; no lo borres creyendo que sobra.
   */
  precio: string;
  /**
   * true  = cifra oficial de la campaña o país que usa dólar (se dice exacta).
   * false = equivalencia aproximada de 7 USD (se dice "unos ...").
   */
  precioExacto: boolean;
  /** Países con más de una zona horaria. */
  zonasExtra?: Array<{ etiqueta: string; tz: string }>;
};

/**
 * Precios locales: Colombia y México son las cifras oficiales de la campaña.
 * El resto son equivalencias aproximadas de 7 USD — Paula las dice como "unos
 * X" y siempre puede apoyarse en los 7 USD, que es lo que realmente cobra la
 * pasarela. Para ajustar una moneda: cambiar el string y ya.
 */
export const PAISES: Pais[] = [
  { iso: 'CO', nombre: 'Colombia', prefijos: ['57'], tz: 'America/Bogota', ciudad: 'Colombia', precio: '25.000 COP', precioExacto: true },
  { iso: 'MX', nombre: 'México', prefijos: ['52'], tz: 'America/Mexico_City', ciudad: 'Ciudad de México', precio: '120 MXN', precioExacto: true,
    zonasExtra: [{ etiqueta: 'Cancún', tz: 'America/Cancun' }, { etiqueta: 'Tijuana', tz: 'America/Tijuana' }] },
  // +1 = Estados Unidos y Canadá. No se puede separar por el indicativo, así
  // que se dan las cuatro zonas y Paula pregunta la ciudad si necesita precisión.
  { iso: 'US', nombre: 'Estados Unidos o Canadá', prefijos: ['1'], tz: 'America/New_York', ciudad: 'Miami / Nueva York', precio: PRECIO_USD, precioExacto: true,
    zonasExtra: [
      { etiqueta: 'Chicago / Houston', tz: 'America/Chicago' },
      { etiqueta: 'Denver', tz: 'America/Denver' },
      { etiqueta: 'Los Ángeles', tz: 'America/Los_Angeles' },
    ] },
  { iso: 'PE', nombre: 'Perú', prefijos: ['51'], tz: 'America/Lima', ciudad: 'Lima', precio: '26 PEN', precioExacto: false },
  { iso: 'EC', nombre: 'Ecuador', prefijos: ['593'], tz: 'America/Guayaquil', ciudad: 'Ecuador', precio: PRECIO_USD, precioExacto: true },
  { iso: 'CL', nombre: 'Chile', prefijos: ['56'], tz: 'America/Santiago', ciudad: 'Santiago', precio: '6.500 CLP', precioExacto: false },
  { iso: 'AR', nombre: 'Argentina', prefijos: ['54'], tz: 'America/Argentina/Buenos_Aires', ciudad: 'Buenos Aires', precio: '9.000 ARS', precioExacto: false },
  { iso: 'VE', nombre: 'Venezuela', prefijos: ['58'], tz: 'America/Caracas', ciudad: 'Caracas', precio: PRECIO_USD, precioExacto: true },
  { iso: 'ES', nombre: 'España', prefijos: ['34'], tz: 'Europe/Madrid', ciudad: 'España', precio: '6,50 EUR', precioExacto: false },
  { iso: 'GT', nombre: 'Guatemala', prefijos: ['502'], tz: 'America/Guatemala', ciudad: 'Guatemala', precio: '54 GTQ', precioExacto: false },
  { iso: 'SV', nombre: 'El Salvador', prefijos: ['503'], tz: 'America/El_Salvador', ciudad: 'El Salvador', precio: PRECIO_USD, precioExacto: true },
  { iso: 'HN', nombre: 'Honduras', prefijos: ['504'], tz: 'America/Tegucigalpa', ciudad: 'Honduras', precio: '180 HNL', precioExacto: false },
  { iso: 'NI', nombre: 'Nicaragua', prefijos: ['505'], tz: 'America/Managua', ciudad: 'Nicaragua', precio: '260 NIO', precioExacto: false },
  { iso: 'CR', nombre: 'Costa Rica', prefijos: ['506'], tz: 'America/Costa_Rica', ciudad: 'Costa Rica', precio: '3.600 CRC', precioExacto: false },
  { iso: 'PA', nombre: 'Panamá', prefijos: ['507'], tz: 'America/Panama', ciudad: 'Panamá', precio: PRECIO_USD, precioExacto: true },
  { iso: 'BO', nombre: 'Bolivia', prefijos: ['591'], tz: 'America/La_Paz', ciudad: 'Bolivia', precio: '48 BOB', precioExacto: false },
  { iso: 'PY', nombre: 'Paraguay', prefijos: ['595'], tz: 'America/Asuncion', ciudad: 'Paraguay', precio: '52.000 PYG', precioExacto: false },
  { iso: 'UY', nombre: 'Uruguay', prefijos: ['598'], tz: 'America/Montevideo', ciudad: 'Uruguay', precio: '280 UYU', precioExacto: false },
  { iso: 'DO', nombre: 'República Dominicana', prefijos: ['1809', '1829', '1849'], tz: 'America/Santo_Domingo', ciudad: 'Santo Domingo', precio: '430 DOP', precioExacto: false },
  { iso: 'PR', nombre: 'Puerto Rico', prefijos: ['1787', '1939'], tz: 'America/Puerto_Rico', ciudad: 'Puerto Rico', precio: PRECIO_USD, precioExacto: true },
  { iso: 'CU', nombre: 'Cuba', prefijos: ['53'], tz: 'America/Havana', ciudad: 'Cuba', precio: PRECIO_USD, precioExacto: true },
  { iso: 'BR', nombre: 'Brasil', prefijos: ['55'], tz: 'America/Sao_Paulo', ciudad: 'São Paulo', precio: '38 BRL', precioExacto: false },
];

/** Se prueba del prefijo más largo al más corto: 1809 (RD) antes que 1 (USA). */
const PREFIJOS_ORDENADOS: Array<{ prefijo: string; pais: Pais }> = PAISES
  .flatMap((pais) => pais.prefijos.map((prefijo) => ({ prefijo, pais })))
  .sort((a, b) => b.prefijo.length - a.prefijo.length);

/**
 * Deduce el país por el indicativo del teléfono.
 *
 * ManyChat manda el número en formato internacional (WhatsApp siempre lo es),
 * así que basta con el prefijo. Si no hay número o no calza ningún indicativo
 * devuelve null: es MEJOR no saber que adivinar mal — un +1 de Miami tiene
 * indicativos de área que arrancan en 3 igual que un celular colombiano, y
 * confundirlos le daría a ella la hora y la moneda equivocadas.
 */
export function detectarPais(telefono?: string | null): Pais | null {
  if (!telefono) return null;
  // Deja solo dígitos y quita el prefijo internacional de marcación (00).
  let n = String(telefono).replace(/\D/g, '');
  if (n.startsWith('00')) n = n.slice(2);
  if (!n) return null;
  const hit = PREFIJOS_ORDENADOS.find(({ prefijo }) => n.startsWith(prefijo));
  return hit ? hit.pais : null;
}

// ---------------------------------------------------------------------------
// 2. FORMATO DE FECHAS Y HORAS
// ---------------------------------------------------------------------------

export const TZ_COLOMBIA = 'America/Bogota';

/** "8:00 PM" — ASCII, sin los "p. m." raros de es-CO. */
export function hora12(fecha: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(fecha);
}

/** "jueves 30 de julio" (Intl mete una coma que aquí sobra). */
export function fechaLarga(fecha: Date, tz: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: tz, weekday: 'long', day: 'numeric', month: 'long',
  }).format(fecha).replace(',', '');
}

/** "2026-07-24" en la zona pedida — para restar días de calendario. */
export function fechaISO(fecha: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(fecha);
}

/** Días de calendario entre dos fechas, contados en la zona indicada. */
export function diasDeCalendario(desde: Date, hasta: Date, tz: string): number {
  const a = Date.parse(`${fechaISO(desde, tz)}T00:00:00Z`);
  const b = Date.parse(`${fechaISO(hasta, tz)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}
