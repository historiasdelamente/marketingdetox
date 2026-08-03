// ============================================================================
// FORMATO — LA FORMA DEL MENSAJE, GARANTIZADA POR CÓDIGO
//
// POR QUÉ EXISTE ESTE ARCHIVO. El formato de Paula se intentó arreglar muchas
// veces por prompt —"no mandes viñetas", "sé breve", "máximo 3 globos"— y
// ninguna aguantó. Con gpt-4.1-mini, una prohibición es una sugerencia: lo que
// el modelo tiene delante, lo usa. La única forma de que una regla de forma se
// cumpla el 100% de las veces es que la cumpla el código después de que el
// modelo escriba, no el modelo mientras escribe.
//
// Es el mismo patrón que ya usa `quitarVentaEnCrisis`: el prompt lo pide, esto
// lo hace cierto.
//
// AQUÍ SOLO VIVE LA FORMA. Ni un dato, ni un precio, ni una fecha: eso es de
// `programa.ts`, y lo que se puede afirmar es de PAULA-CONOCIMIENTO.md. Este
// archivo no sabe qué dice el mensaje, solo cómo se ve.
// ============================================================================

/**
 * EL LARGO DE UN GLOBO. 160 caracteres, sin contar el link.
 *
 * De dónde sale el número: es el largo de un SMS y, en la práctica, lo que cabe
 * en la burbuja de WhatsApp sin que el ojo la lea como un bloque. Por encima de
 * ~180 el mensaje deja de parecer alguien escribiendo desde el celular y empieza
 * a parecer un texto pegado — que es exactamente la queja.
 *
 * El rango bueno de verdad es 90-160: por debajo de 60 suena cortante y obliga
 * a mandar más globos para decir lo mismo, que es el otro extremo del problema.
 */
export const MAX_CHARS_GLOBO = 160;

/**
 * EL TEXTO TOTAL DE UN TURNO. 320 caracteres = dos globos llenos.
 *
 * El link no cuenta: en WhatsApp se ve como una tarjeta, no como texto.
 */
export const MAX_CHARS_TURNO = 320;

/**
 * CUÁNTOS MENSAJES SEGUIDOS. Tres, y el link es uno de los tres.
 *
 * O sea: dos globos de texto y el link. Ese es el techo, no el objetivo — la
 * mayoría de los turnos son DOS globos, y muchos son uno solo.
 *
 * Cuatro mensajes seguidos ya no se leen como una persona contestando; se leen
 * como un sistema descargando información encima de alguien.
 */
export const MAX_GLOBOS = 3;

const URL_RE = /https?:\/\/\S+/g;

/** Una línea de lista: "• Pides perdón…", "- No duermes…", "1. Te despiertas…". */
const LINEA_VINETA = /^\s*(?:[•·▪◦‣*\-–—]|\d{1,2}[.)])\s+(\S.*)$/;

/** Una línea que abre una lista: "…algo de esto:", "…si te pasa esto:". */
const ABRE_LISTA = /:\s*$/;

/** Cuenta caracteres de texto real: el link no es texto, es una tarjeta. */
export function largoSinLinks(texto: string): number {
  return (texto || '').replace(URL_RE, '').replace(/\s+/g, ' ').trim().length;
}

/** ¿Quedó alguna línea con forma de lista? */
export function tieneVinetas(texto: string): boolean {
  return (texto || '').split('\n').some((l) => LINEA_VINETA.test(l));
}

/**
 * MATA LAS VIÑETAS. Deja UNA, convertida en frase; tira las demás.
 *
 * Por qué se tiran y no se pegan todas: una lista de cuatro dolores convertida
 * en un párrafo son 240 caracteres de corrido, o sea el folleto otra vez con
 * otra ropa. Lo que hace que ella se reconozca no es la cantidad —es que UNA
 * frase le describa su martes por la noche—. La segunda y la tercera solo
 * diluyen a la primera.
 *
 * Nunca se pierde un dato con esto: las viñetas solo cargan dolores. El día, la
 * hora, el precio y el link viven en globos de texto normal y no pasan por acá.
 *
 * Si arriba de la lista había una línea que la abría ("…si te pasa algo de
 * esto:"), la viñeta se le cose detrás para que no quede un dos puntos huérfano.
 */
export function desvinetar(texto: string): string {
  const lineas = (texto || '').split('\n');
  const out: string[] = [];
  let yaUse = false;

  for (const linea of lineas) {
    const m = linea.match(LINEA_VINETA);
    if (!m) {
      out.push(linea);
      continue;
    }

    // De la segunda viñeta en adelante: fuera.
    if (yaUse) continue;
    yaUse = true;

    const contenido = m[1].trim().replace(/[.;,]+$/, '');
    const previa = out.length > 0 ? out[out.length - 1].trim() : '';

    if (previa && ABRE_LISTA.test(previa)) {
      // "Esta clase es para ti si te pasa esto:" + "Pides perdón…"
      //   → "Esta clase es para ti si te pasa esto: pides perdón…"
      const minuscula = contenido.charAt(0).toLowerCase() + contenido.slice(1);
      out[out.length - 1] = `${previa} ${minuscula}.`;
      continue;
    }

    out.push(`${contenido}.`);
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const esLink = (globo: string) => /https?:\/\//.test(globo);

/**
 * Baja una lista de globos hasta `max` FUSIONANDO, nunca tirando.
 *
 * ⚠️ POR QUÉ NO SE RECORTA POR EL FINAL, que es lo que hacía antes. En la
 * auditoría contra el modelo real del 2026-08-03 se vio el daño: el cierre por
 * Nequi de una mujer de Colombia salía con el número de la cuenta, el link del
 * WhatsApp de Javier… y sin la frase que explica por qué son dos números
 * distintos. Esa frase es justo la que evita que ella lea "estafa" y cierre el
 * chat. Recortar por el final se come lo último que escribió el modelo, y lo
 * último no es siempre el relleno.
 *
 * El orden en que se fusiona:
 *   1. Los dos globos de texto seguidos más cortos se juntan en uno. Se repite
 *      hasta llegar al tope. Un link nunca se fusiona: perdería su tarjeta.
 *   2. Si aún sobran globos (pasa cuando hay varios links), todo el texto se
 *      junta en el primer globo y los links van detrás, cada uno en el suyo.
 *   3. Solo si ni así cabe —más links que globos— se sueltan los links de más.
 * Así el número de mensajes baja sin que se pierda una sola frase.
 */
export function comprimirGlobos(globos: string[], max = MAX_GLOBOS): string[] {
  let out = globos.filter(Boolean);
  if (out.length <= max) return out;

  // 1) Fusionar el par de texto seguido más barato, tantas veces como haga falta.
  for (;;) {
    if (out.length <= max) return out;

    let mejor = -1;
    let mejorLargo = Infinity;
    for (let i = 0; i < out.length - 1; i++) {
      if (esLink(out[i]) || esLink(out[i + 1])) continue;
      const largo = out[i].length + out[i + 1].length;
      if (largo < mejorLargo) {
        mejorLargo = largo;
        mejor = i;
      }
    }
    if (mejor === -1) break;

    out = [...out.slice(0, mejor), `${out[mejor]} ${out[mejor + 1]}`, ...out.slice(mejor + 2)];
  }

  // 2) Ya no hay texto seguido: todo el texto en un globo, y los links detrás.
  const textos = out.filter((g) => !esLink(g));
  const links = out.filter(esLink);
  if (textos.length > 0) {
    const juntos = [textos.join(' '), ...links];
    if (juntos.length <= max) return juntos;
    // 3) Más links que globos: se sueltan los últimos. El primero es el que
    //    importa (la página o el WhatsApp de Javier, según el momento).
    return [textos.join(' '), ...links.slice(0, Math.max(0, max - 1))];
  }

  return links.slice(0, max);
}

/** Deja como mucho `max` bloques, sin perder ni una frase ni un link. */
export function limitarGlobos(texto: string, max = MAX_GLOBOS): string {
  const bloques = (texto || '')
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return comprimirGlobos(bloques, max).join('\n\n');
}

/**
 * EL GARANTE. Lo último que toca el texto antes de que ella lo lea.
 *
 * Corre SIEMPRE, pase o no pase el blindaje, se haya reintentado o no. Si el
 * modelo mandó viñetas, aquí se quedan; si mandó cinco globos, salen tres.
 */
export function aplicarFormato(texto: string): string {
  return limitarGlobos(desvinetar(texto || ''));
}
