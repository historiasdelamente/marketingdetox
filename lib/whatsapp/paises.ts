// ============================================================================
// PAÍSES Y RELOJ — de qué país te escribe ELLA, y cómo se escribe una fecha.
//
// ⚠️ ESTO NO ES LA FUENTE DE NINGÚN PRODUCTO. Nombre, precio y links viven en
// `programa.ts` (APEGO_DETOX), las fechas se calculan solas allí, y la
// conversión a moneda local vive en `moneda.ts`. Aquí hay dos cosas, y las dos
// son estables: la tabla de países (indicativo telefónico → zona horaria +
// código de moneda) y las funciones que dan formato a fechas y horas.
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
   * Código ISO 4217 de la moneda con la que ELLA piensa el dinero.
   *
   * ⚠️ Aquí NO hay ningún precio. Antes sí lo había —una cifra por país,
   * escrita a mano— y era una segunda fuente de verdad que se quedaba vieja
   * sola. Ahora solo se dice CUÁL es su moneda; cuánto vale el programa en ella
   * lo calcula `moneda.ts` con la tasa del día, a partir del único precio que
   * existe: los dólares que cobra Skool.
   *
   * 'USD' en Ecuador, Panamá, El Salvador, Puerto Rico, Venezuela y Cuba no es
   * un descuido: ahí se piensa y se cobra en dólares, así que no hay nada que
   * convertir.
   */
  moneda: string;
  /** Países con más de una zona horaria. */
  zonasExtra?: Array<{ etiqueta: string; tz: string }>;
  /**
   * NO se puede afirmar una hora local sin saber su ciudad.
   *
   * Solo para países donde la población está REPARTIDA de verdad entre husos.
   * México también tiene tres, pero la enorme mayoría vive en la hora de Ciudad
   * de México, así que ahí se afirma y se corrige si ella nombra Cancún o
   * Tijuana; preguntarle la ciudad a cada mexicana sería fricción en el mercado
   * más grande. En Estados Unidos no hay zona dominante: Phoenix, Los Ángeles,
   * Miami y Chicago son cuatro horas distintas y todas son comunes.
   *
   * Nació de un fallo real: a Vanesa, desde Phoenix, Paula le dijo las 9 PM
   * (hora de Nueva York) cuando para ella eran las 6.
   */
  zonaAmbigua?: boolean;
};

export const PAISES: Pais[] = [
  { iso: 'CO', nombre: 'Colombia', prefijos: ['57'], tz: 'America/Bogota', ciudad: 'Colombia', moneda: 'COP' },
  { iso: 'MX', nombre: 'México', prefijos: ['52'], tz: 'America/Mexico_City', ciudad: 'Ciudad de México', moneda: 'MXN',
    zonasExtra: [{ etiqueta: 'Cancún', tz: 'America/Cancun' }, { etiqueta: 'Tijuana', tz: 'America/Tijuana' }] },
  // +1 = Estados Unidos y Canadá. No se puede separar por el indicativo, así
  // que se dan las cuatro zonas y Paula pregunta la ciudad si necesita precisión.
  { iso: 'US', nombre: 'Estados Unidos o Canadá', prefijos: ['1'], tz: 'America/New_York', ciudad: 'Miami / Nueva York', moneda: 'USD', zonaAmbigua: true,
    zonasExtra: [
      { etiqueta: 'Chicago / Houston', tz: 'America/Chicago' },
      { etiqueta: 'Denver', tz: 'America/Denver' },
      { etiqueta: 'Los Ángeles', tz: 'America/Los_Angeles' },
    ] },
  { iso: 'PE', nombre: 'Perú', prefijos: ['51'], tz: 'America/Lima', ciudad: 'Lima', moneda: 'PEN' },
  { iso: 'EC', nombre: 'Ecuador', prefijos: ['593'], tz: 'America/Guayaquil', ciudad: 'Ecuador', moneda: 'USD' },
  { iso: 'CL', nombre: 'Chile', prefijos: ['56'], tz: 'America/Santiago', ciudad: 'Santiago', moneda: 'CLP' },
  { iso: 'AR', nombre: 'Argentina', prefijos: ['54'], tz: 'America/Argentina/Buenos_Aires', ciudad: 'Buenos Aires', moneda: 'ARS' },
  { iso: 'VE', nombre: 'Venezuela', prefijos: ['58'], tz: 'America/Caracas', ciudad: 'Caracas', moneda: 'USD' },
  { iso: 'ES', nombre: 'España', prefijos: ['34'], tz: 'Europe/Madrid', ciudad: 'España', moneda: 'EUR' },
  { iso: 'GT', nombre: 'Guatemala', prefijos: ['502'], tz: 'America/Guatemala', ciudad: 'Guatemala', moneda: 'GTQ' },
  { iso: 'SV', nombre: 'El Salvador', prefijos: ['503'], tz: 'America/El_Salvador', ciudad: 'El Salvador', moneda: 'USD' },
  { iso: 'HN', nombre: 'Honduras', prefijos: ['504'], tz: 'America/Tegucigalpa', ciudad: 'Honduras', moneda: 'HNL' },
  { iso: 'NI', nombre: 'Nicaragua', prefijos: ['505'], tz: 'America/Managua', ciudad: 'Nicaragua', moneda: 'NIO' },
  { iso: 'CR', nombre: 'Costa Rica', prefijos: ['506'], tz: 'America/Costa_Rica', ciudad: 'Costa Rica', moneda: 'CRC' },
  { iso: 'PA', nombre: 'Panamá', prefijos: ['507'], tz: 'America/Panama', ciudad: 'Panamá', moneda: 'USD' },
  { iso: 'BO', nombre: 'Bolivia', prefijos: ['591'], tz: 'America/La_Paz', ciudad: 'Bolivia', moneda: 'BOB' },
  { iso: 'PY', nombre: 'Paraguay', prefijos: ['595'], tz: 'America/Asuncion', ciudad: 'Paraguay', moneda: 'PYG' },
  { iso: 'UY', nombre: 'Uruguay', prefijos: ['598'], tz: 'America/Montevideo', ciudad: 'Uruguay', moneda: 'UYU' },
  { iso: 'DO', nombre: 'República Dominicana', prefijos: ['1809', '1829', '1849'], tz: 'America/Santo_Domingo', ciudad: 'Santo Domingo', moneda: 'DOP' },
  { iso: 'PR', nombre: 'Puerto Rico', prefijos: ['1787', '1939'], tz: 'America/Puerto_Rico', ciudad: 'Puerto Rico', moneda: 'USD' },
  { iso: 'CU', nombre: 'Cuba', prefijos: ['53'], tz: 'America/Havana', ciudad: 'Cuba', moneda: 'USD' },
  { iso: 'BR', nombre: 'Brasil', prefijos: ['55'], tz: 'America/Sao_Paulo', ciudad: 'São Paulo', moneda: 'BRL' },
];

/** Busca por código ISO ('CO'), para cuando ELLA dice de dónde es. */
export function paisPorIso(iso?: string | null): Pais | null {
  if (!iso) return null;
  const buscado = String(iso).trim().toUpperCase();
  return PAISES.find((p) => p.iso === buscado) ?? null;
}

/** Se prueba del prefijo más largo al más corto: 1809 (RD) antes que 1 (USA). */
const PREFIJOS_ORDENADOS: Array<{ prefijo: string; pais: Pais }> = PAISES
  .flatMap((pais) => pais.prefijos.map((prefijo) => ({ prefijo, pais })))
  .sort((a, b) => b.prefijo.length - a.prefijo.length);

/**
 * ¿Esto es un teléfono de verdad?
 *
 * ⚠️ NACIÓ DE UN FALLO EN PRODUCCIÓN (2026-08-06). En `wa_users.phone` había
 * guardadas decenas de filas con el texto literal **"{{phone}}"**: ManyChat
 * estaba enviando el marcador sin resolver en vez del número. `detectarPais`
 * ya lo trataba bien —no tiene dígitos, así que devuelve null y Paula no
 * inventa un país—, pero el valor se guardaba igual y ensuciaba la base.
 *
 * Se exigen 8 dígitos: por debajo de eso no hay indicativo + número posible, y
 * cualquier resto de plantilla ("{{phone}}", "null", "-") se cae solo.
 */
export function esTelefonoReal(telefono?: string | null): boolean {
  return String(telefono ?? '').replace(/\D/g, '').length >= 8;
}

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
  // ⛔ PRIMERO, ¿ES UN TELÉFONO? Sin esta puerta, "123" devolvía **Estados
  // Unidos** —porque empieza por 1, que es su indicativo— y a esa mujer se le
  // daba el precio en dólares y la hora de Miami. Cualquier valor corto o
  // malformado caía en el país con el indicativo más corto. Se vio al blindar
  // el "{{phone}}" que ManyChat mandaba sin resolver.
  if (!esTelefonoReal(telefono)) return null;
  // Deja solo dígitos y quita el prefijo internacional de marcación (00).
  let n = String(telefono).replace(/\D/g, '');
  if (n.startsWith('00')) n = n.slice(2);
  if (!n) return null;
  const hit = PREFIJOS_ORDENADOS.find(({ prefijo }) => n.startsWith(prefijo));
  return hit ? hit.pais : null;
}

/**
 * DE QUE PAIS ES ELLA — el ISO que se guarda en `wa_users.pais`.
 *
 * POR QUE EXISTE. El pais se derivaba del telefono para hablarle en el turno,
 * pero solo se GUARDABA cuando ella lo decia en voz alta. Resultado en
 * produccion el 2026-08-06: 877 de 878 filas con `pais` en null, teniendo 565
 * de ellas un telefono bueno. Todo lo que no fuera la conversacion en vivo
 * —recordatorios, difusiones, cualquier consulta a la base— se quedaba sin
 * saber su moneda y sin saber su hora.
 *
 * EL ORDEN IMPORTA. Lo que ella dice manda sobre su indicativo: una mexicana
 * con numero de Estados Unidos es mexicana, y el numero solo habla cuando no
 * hay nadie que la contradiga. Basura como "{{phone}}" no dice nada: eso ya lo
 * corta `detectarPais`.
 */
export function paisDeElla(dicho?: string | null, telefono?: string | null): string | null {
  const validado = paisPorIso(dicho)?.iso;
  if (validado) return validado;
  return detectarPais(telefono)?.iso ?? null;
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
