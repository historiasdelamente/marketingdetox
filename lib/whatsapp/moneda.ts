// ============================================================================
// MONEDA — CUÁNTO LE QUEDA A ELLA, EN LO QUE ELLA USA
//
// POR QUÉ EXISTE. Skool cobra en dólares y hasta hoy Paula tenía prohibido
// traducirlos: el material decía "si pregunta cuánto es en su moneda, se lo
// muestra Skool al pagar". En el chat real eso es un frenazo. Una mujer de
// Bogotá no sabe si 20 dólares son 40.000 o 400.000 pesos, y ante la duda no
// abre el link: la incertidumbre sobre el precio se siente como riesgo, y ella
// ya viene con dos decepciones encima. Decirle "son unos 80.000 al mes" es lo
// que convierte un número abstracto en una decisión que puede tomar.
//
// LAS DOS REGLAS QUE HACEN QUE ESTO NO MIENTA:
//
//   1. SIEMPRE "UNOS". La cifra local es aproximada y punto. Lo que su banco le
//      cobra depende de la tasa del día y del recargo de su tarjeta, que no
//      controlamos. Dar una cifra exacta que después no cuadra en el extracto
//      es exactamente el tipo de sorpresa que hace pedir la devolución.
//   2. EL DÓLAR MANDA. Los $20 USD son el dato duro; la conversión es el favor
//      que se le hace para que se lo pueda imaginar. Si alguna vez chocan, gana
//      el dólar — es lo que ella va a ver en la pantalla de Skool.
//
// DE DÓNDE SALE LA TASA. Se intenta en vivo (open.er-api.com, gratis y sin
// clave) y se guarda en memoria 12 horas. Si la red falla, si la API cambia o
// si el contenedor no tiene salida, se usa la tabla de abajo y nadie se entera:
// esto NUNCA puede tumbar una respuesta de Paula por una divisa.
// ============================================================================

/**
 * TASAS DE RESPALDO — cuántas unidades locales vale 1 USD.
 *
 * ⚠️ Son un PARACAÍDAS, no la fuente. En marcha normal se sobrescriben con la
 * tasa viva cada 12 horas. Están para que, sin internet, Paula diga una cifra
 * del orden correcto en vez de quedarse muda o inventarse una.
 *
 * Por eso no hace falta mantenerlas al día con precisión: lo que importa es que
 * el ORDEN DE MAGNITUD sea el bueno. Que a una colombiana se le diga "unos
 * 80.000" y no "unos 8.000" es la diferencia entre una aproximación y un
 * engaño; que sean 79.400 o 81.200 no cambia ninguna decisión.
 */
const TASAS_RESPALDO: Record<string, number> = {
  USD: 1,
  COP: 4000,
  MXN: 18,
  PEN: 3.7,
  CLP: 950,
  ARS: 1050,
  EUR: 0.92,
  GTQ: 7.8,
  HNL: 25,
  NIO: 36.8,
  CRC: 510,
  BOB: 6.9,
  PYG: 7500,
  UYU: 40,
  DOP: 60,
  BRL: 5.5,
};

/** 12 h: la tasa no se mueve tanto en un día como para justificar más tráfico. */
const TTL_MS = 12 * 60 * 60 * 1000;

/** Corto a propósito: antes que una cifra fresca, va que Paula conteste. */
const TIMEOUT_MS = 4000;

let cache: { tasas: Record<string, number>; ts: number } | null = null;
/** Evita que diez mensajes a la vez disparen diez llamadas a la API. */
let enVuelo: Promise<Record<string, number>> | null = null;

/**
 * Trae las tasas vivas. Ante cualquier problema devuelve las de respaldo.
 *
 * No lanza NUNCA: quien la llama está en el camino de una respuesta a una
 * mujer que está esperando en el chat, y ninguna divisa vale una caída.
 */
export async function tasas(ahora = Date.now()): Promise<Record<string, number>> {
  if (cache && ahora - cache.ts < TTL_MS) return cache.tasas;
  if (enVuelo) return enVuelo;

  enVuelo = (async () => {
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/USD', {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      const data = (await r.json()) as { result?: string; rates?: Record<string, number> };
      if (data.result !== 'success' || !data.rates) throw new Error('respuesta sin tasas');

      // Solo se pisan las monedas que ya conocemos, y solo con números sanos.
      // Si la API devolviera basura para una divisa, se queda la de respaldo.
      const frescas: Record<string, number> = { ...TASAS_RESPALDO };
      for (const codigo of Object.keys(TASAS_RESPALDO)) {
        const v = data.rates[codigo];
        if (typeof v === 'number' && Number.isFinite(v) && v > 0) frescas[codigo] = v;
      }

      cache = { tasas: frescas, ts: ahora };
      return frescas;
    } catch (e) {
      console.warn('[Paula moneda] tasa viva no disponible, usando respaldo:', (e as Error).message);
      // Se cachea el fallo también: si no hay salida a internet, no tiene
      // sentido reintentarlo en cada mensaje durante las próximas 12 horas.
      cache = { tasas: TASAS_RESPALDO, ts: ahora };
      return TASAS_RESPALDO;
    } finally {
      enVuelo = null;
    }
  })();

  return enVuelo;
}

/** Solo para los tests: olvida lo cacheado. */
export function limpiarCacheTasas(): void {
  cache = null;
  enVuelo = null;
}

/**
 * Redondea a algo que una persona diría en voz alta.
 *
 * "unos 80.000 pesos" se lee como una estimación honesta; "unos 79.412 pesos"
 * se lee como una cifra exacta — y en cuanto el banco le cobre otra cosa, ella
 * siente que le mintieron. La precisión falsa hace más daño que el redondeo.
 */
export function redondearBonito(valor: number): number {
  if (!Number.isFinite(valor) || valor <= 0) return 0;
  if (valor >= 10000) return Math.round(valor / 5000) * 5000;
  if (valor >= 1000) return Math.round(valor / 500) * 500;
  if (valor >= 100) return Math.round(valor / 10) * 10;
  if (valor >= 20) return Math.round(valor / 5) * 5;
  return Math.round(valor);
}

/**
 * Separador de miles con punto, como se escribe en Latinoamérica.
 *
 * SIEMPRE sin decimales: `redondearBonito` ya devuelve enteros, así que pedir
 * dos decimales solo producía cosas como "unos 17,00 EUR" — que es lo contrario
 * de lo que busca el redondeo, porque los ceros se leen como precisión exacta.
 */
function formatear(valor: number): string {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(valor);
}

export type PrecioLocal = {
  /** Código ISO de su moneda: 'COP', 'MXN'… */
  codigo: string;
  /** true cuando su país ya usa dólares: no hay nada que convertir. */
  esDolar: boolean;
  /** "unos 80.000 COP" — o "" si su moneda es el dólar. */
  frase: string;
};

/**
 * Cuánto le queda a ELLA, listo para decirlo.
 *
 * Devuelve `frase` vacía cuando su país usa dólar (Ecuador, Panamá, Puerto
 * Rico, El Salvador, Estados Unidos): ahí "unos 20 dólares" además de "$20 USD"
 * es ruido, y repetir el mismo número dos veces suena a bot.
 */
export function precioLocal(
  usd: number,
  codigoMoneda: string,
  tabla: Record<string, number>,
): PrecioLocal {
  const codigo = (codigoMoneda || 'USD').toUpperCase();
  if (codigo === 'USD') return { codigo, esDolar: true, frase: '' };

  const tasa = tabla[codigo];
  if (!Number.isFinite(tasa) || tasa <= 0) return { codigo, esDolar: false, frase: '' };

  const monto = redondearBonito(usd * tasa);
  if (monto <= 0) return { codigo, esDolar: false, frase: '' };

  return { codigo, esDolar: false, frase: `unos ${formatear(monto)} ${codigo}` };
}
