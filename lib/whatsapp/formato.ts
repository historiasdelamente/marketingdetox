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

/**
 * Una línea de lista: "• Pides perdón…", "- No duermes…", "1. Te despiertas…".
 *
 * ⚠️ SIN «—» NI «–» DESDE EL 2026-08-14. La prosa en español usa la raya para
 * incisos y diálogos («— eso llega aquí todas las semanas»), y Gemini la abre
 * a principio de línea con frecuencia. Con las rayas en el set, esa prosa se
 * leía como lista: `desvinetar` la trituraba y `limitarVinetas` le ponía «• »
 * delante. El guion corto (-) se queda: en WhatsApp nadie abre un inciso con
 * guion pegado a espacio, pero las listas hechas a mano sí lo usan.
 */
const LINEA_VINETA = /^\s*(?:[•·▪◦‣*\-]|\d{1,2}[.)])\s+(\S.*)$/;

/** Una línea que abre una lista: "…algo de esto:", "…si te pasa esto:". */
const ABRE_LISTA = /:\s*$/;

/** Cuenta caracteres de texto real: el link no es texto, es una tarjeta. */
export function largoSinLinks(texto: string): number {
  return (texto || '').replace(URL_RE, '').replace(/\s+/g, ' ').trim().length;
}

/** ¿Esta línea concreta es una viñeta? La usa `manychat.ts` para no partirlas. */
export function esLineaVineta(linea: string): boolean {
  return LINEA_VINETA.test(linea || '');
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
/** ¿La línea carga un dato que no se puede tirar? Link, cifra u hora. */
const CARGA_DATO = /https?:\/\/|\d/;

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

    // De la segunda viñeta en adelante: fuera — SALVO que cargue un dato.
    // ⚠️ 2026-08-14: tirar viñetas «de más» estaba tirando líneas con el link,
    // el precio o la hora del taller. Una viñeta de relleno se puede perder;
    // un dato no. La que carga dato se promueve a frase suelta.
    if (yaUse) {
      if (CARGA_DATO.test(m[1])) out.push(`${m[1].trim().replace(/[.;,]+$/, '')}.`);
      continue;
    }
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
 * ¿Este globo es una lista ya cosida (varias viñetas en renglones)?
 *
 * Se trata como un link a la hora de fusionar: **no se toca**. Fusionar une con
 * un espacio, así que pegarle otro globo a una lista deja la última viñeta y la
 * frase siguiente en el mismo renglón — o peor, si se fusiona por delante, las
 * tres viñetas en una sola línea. Que es exactamente el chorrero del que
 * veníamos.
 */
const esLista = (globo: string) => (globo || '').split('\n').filter((l) => LINEA_VINETA.test(l)).length >= 2;

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
      if (esLista(out[i]) || esLista(out[i + 1])) continue;
      const largo = out[i].length + out[i + 1].length;
      if (largo < mejorLargo) {
        mejorLargo = largo;
        mejor = i;
      }
    }
    if (mejor === -1) break;

    out = [...out.slice(0, mejor), `${out[mejor]} ${out[mejor + 1]}`, ...out.slice(mejor + 2)];
  }

  // 2) Ya no hay texto seguido: el texto de prosa en un globo, y los links
  //    detrás. ⚠️ LAS LISTAS NO ENTRAN AL JOIN (2026-08-14): pegarle la lista
  //    a la prosa con un espacio fabricaba un ladrillo de 433 caracteres —
  //    apertura + tres viñetas + cierre soldados en un solo globo, el peor
  //    mensaje del sistema medido en producción. La lista viaja en su globo.
  const textos = out.filter((g) => !esLink(g) && !esLista(g));
  const listas = out.filter((g) => !esLink(g) && esLista(g));
  const links = out.filter(esLink);
  const prosa = textos.length > 0 ? [textos.join(' ')] : [];
  const juntos = [...prosa, ...listas, ...links];
  if (juntos.length <= max) return juntos;
  // 3) Aún sobra: se sueltan los últimos links. El primero es el que importa
  //    (la página o el WhatsApp de Javier, según el momento).
  const fijos = [...prosa, ...listas];
  if (fijos.length >= max) return fijos.slice(0, max);
  return [...fijos, ...links.slice(0, max - fijos.length)];
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
/**
 * LAS TRES VIÑETAS QUE SÍ SE PERMITEN.
 *
 * ⚠️ ESTO ES UNA EXCEPCIÓN ESTRECHA Y A PROPÓSITO. La regla sigue siendo prosa:
 * Javier cortó las listas en su día porque *"le estás haciendo como si fuera un
 * flyer a las personas"*, y eso vale para el dolor de ella y para todo lo demás.
 *
 * Pero el 2026-08-06 pidió recuperarlas **en un solo sitio**: cuando ella
 * pregunta qué hay adentro. Ahí una lista de tres líneas se lee de un vistazo y
 * un párrafo de corrido no, y no suena a folleto porque lo pidió ella.
 *
 * Se recortan a tres y se acortan a 90 caracteres: cuatro viñetas ya es una
 * columna, y una viñeta larga es un párrafo con un punto delante.
 */
const MAX_VINETAS = 3;
/**
 * Se exporta porque es el número que de verdad manda sobre lo largas que
 * pueden ser las viñetas de `programa.ts`: una que se pase no se rechaza, llega
 * recortada con puntos suspensivos. Hay un test que las mide contra esto.
 */
export const MAX_CHARS_VINETA = 105;

export function limitarVinetas(texto: string): string {
  let vistas = 0;
  return (texto || '')
    .split('\n')
    .filter((linea) => {
      if (!LINEA_VINETA.test(linea)) return true;
      vistas += 1;
      return vistas <= MAX_VINETAS;
    })
    .map((linea) => {
      const m = linea.match(LINEA_VINETA);
      if (!m) return linea;
      const cuerpo = m[1].trim();
      const corto =
        cuerpo.length <= MAX_CHARS_VINETA ? cuerpo : cuerpo.slice(0, MAX_CHARS_VINETA).replace(/\s+\S*$/, '') + '…';
      return `• ${corto}`;
    })
    .join('\n');
}

/**
 * LA LISTA VIAJA EN UN SOLO GLOBO.
 *
 * `limitarGlobos` parte por cada salto de línea, así que una lista de tres
 * viñetas se convertía en TRES globos y el tope de tres se comía la frase que
 * las abría. Una lista partida en globos sueltos es exactamente el folleto que
 * había que evitar, con la agravante de llegar en tres notificaciones.
 *
 * Aquí una tirada de viñetas —con la línea que la abre, si termina en dos
 * puntos— cuenta como UN globo.
 */
function globosConListas(texto: string, max = MAX_GLOBOS): string {
  const lineas = (texto || '').split('\n').map((l) => l.trim());
  const bloques: string[] = [];

  for (const linea of lineas) {
    if (!linea) continue;
    const esVineta = LINEA_VINETA.test(linea);
    const ultimo = bloques[bloques.length - 1];
    const ultimoEsLista = ultimo != null && LINEA_VINETA.test(ultimo.split('\n').pop() ?? '');

    if (esVineta && ultimo != null && (ultimoEsLista || ABRE_LISTA.test(ultimo))) {
      bloques[bloques.length - 1] = `${ultimo}\n${linea}`;
    } else {
      bloques.push(linea);
    }
  }

  return comprimirGlobos(bloques, max).join('\n\n');
}

/**
 * @param permitirVinetas solo cuando ELLA preguntó qué incluye el programa.
 *   En cualquier otro caso las listas se matan, que es la regla de la casa.
 */
export function aplicarFormato(texto: string, permitirVinetas = false): string {
  const t = texto || '';
  return permitirVinetas ? globosConListas(limitarVinetas(t)) : limitarGlobos(desvinetar(t));
}
