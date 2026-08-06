// ============================================================================
// QUÉ ESTÁ HACIENDO ELLA EN ESTE MENSAJE
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  📌 POR QUÉ EXISTE. Javier, 2026-08-06, viendo las conversaciones de Yeny  ║
// ║  y Analia: *"necesitas leer y pensar sí o sí antes de responder; siempre   ║
// ║  antes de responder debes leer la intención, sin hacer terapia"*.          ║
// ║                                                                           ║
// ║  Lo que pasaba sin esto, TEXTUAL de producción:                           ║
// ║                                                                           ║
// ║   · Yeny escribió «No tengo 9 años» CUATRO VECES —corrigiendo un dato que  ║
// ║     Paula se había inventado— y las cuatro recibió el mismo párrafo con    ║
// ║     el mismo horario y el mismo link. Nadie sigue escribiendo después de   ║
// ║     eso.                                                                   ║
// ║   · Analia contó que en febrero lo echó de su casa y que cada recuerdo la  ║
// ║     tumba tres días. Paula contestó la fórmula de siempre y remató con     ║
// ║     «¿qué te está haciendo dudar?» — ella no había dudado de nada.         ║
// ║   · Analia dijo «Dale» a que le mandara el link. Paula anunció el link y   ║
// ║     no lo mandó: el candado no reconoció «Dale» como un sí.                ║
// ║                                                                           ║
// ║  Los tres son el MISMO fallo: nadie miraba qué estaba haciendo ella. El    ║
// ║  prompt se lo pedía al modelo y el modelo, con 34.000 caracteres delante,  ║
// ║  seguía la receta en vez de leer los tres palabras que ella escribió.      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
//
// Regla de oro del proyecto, otra vez: el prompt lo pide, el código lo hace
// cierto. Aquí se decide qué está haciendo ella y se le entrega resuelto.
// ============================================================================

export type Intencion =
  /** Te está diciendo que te equivocaste con un dato suyo. Manda sobre todo. */
  | 'corrige'
  /** Dijo que sí a lo que le acabas de ofrecer. */
  | 'acepta'
  /** Está cerrando: te da las gracias, se despide. */
  | 'se_despide'
  /** Te está preguntando algo concreto. */
  | 'pregunta'
  /** Te está contando lo suyo, con detalle. Es lo más valioso que puede pasar. */
  | 'cuenta'
  /** Contestó, pero casi sin información: «ok», «no he salido», «hola». */
  | 'responde_corto';

/** Un salto de línea, como constante para no pelear con los escapes. */
const SALTO = String.fromCharCode(10);

// ⚠️ TODOS ESTOS PATRONES SE APLICAN SOBRE EL TEXTO YA NORMALIZADO (sin tildes
// y en minúscula). El `\b` de JavaScript es ASCII: detrás de una vocal
// acentuada NO hay frontera de palabra, así que `/\bs[íi]\b/` NO casa con «sí»
// y `/\bno s[ée]\b/` NO casa con «no sé». Se perdían dos de las palabras más
// frecuentes que escribe una mujer. Por eso se normaliza primero y aquí se
// escribe todo sin tildes.
// ⚠️ NI «ya» NI «va» SUELTOS. Parecen afirmaciones y casi nunca lo son:
// «Ya lo dejé» es la RESPUESTA a la pregunta de entrada, y leerla como un sí
// hacía que Paula creyera que le estaban pidiendo el link. Visto probando el
// 2026-08-06.
const AFIRMA =
  /^(dale|si|sip|ok|okey|okay|bueno|claro|listo|de una|hagale|hazlo|por favor|porfa|mandal[oa]|mandamel[oa]|pasamel[oa]|obvio|perfecto|correcto|asi es|acepto|quiero)\b/;

/**
 * LO QUE ELLA CONTESTA A LA PREGUNTA DE ENTRADA. Nunca es un «sí» a nada.
 *
 * «Ya lo dejé», «sigo con él», «no he salido» son respuestas, y tratarlas como
 * aceptaciones desvía toda la conversación en el segundo mensaje.
 */
const RESPUESTA_DE_ENTRADA =
  /\b(ya lo dej|lo dej[ée]|sigo con|todavia estoy|no he salido|no lo he dejado|me separ|nos separamos|estoy saliendo|acabo de dejar|sigue conmigo|volvimos|segui|estoy con el)/;

const DESPIDE =
  /\b(gracias|te agradezco|bendiciones|que estes bien|buenas noches|hasta luego|nos hablamos|chao|bye|dios te bendiga)\b/;

const NIEGA_AL_INICIO = /^\s*(no\b|eso no\b|yo no\b|nunca\b|jamas\b|para nada\b|te equivocas?\b|nada que ver\b)/;

/**
 * CORRECCIONES EXPLÍCITAS — no necesitan chocar con nada.
 *
 * «yo no dije eso» o «no es así» son afirmaciones SOBRE lo que ella dijo: no
 * hay que adivinar si contradicen algo, ya declaran que lo hacen. Hacen falta
 * porque el choque de palabras no siempre existe: «eso no es así, nunca lo
 * dejé» contra «ya lo dejaste» no comparte ningún token —«dejé» y «dejaste» son
 * la misma palabra para una persona y dos distintas para una máquina— y sin
 * esta lista se escapaba.
 */
const CORRIGE_EXPLICITO =
  /\b(yo no dije|nunca dije|no dije|no te dije|no he dicho|te equivocas|no es asi|no fue asi|nada que ver|estas equivocad|no era eso|no me refiero)/;

/** Palabras vacías: si el choque es solo por estas, no es una corrección. */
const VACIAS = new Set([
  'para','pero','como','cuando','donde','porque','tambien','todavia','siempre','nunca','entonces',
  'aunque','desde','hasta','sobre','entre','entra','tiene','tienes','tengo','estar','estoy','estas',
  'puede','puedes','puedo','quiere','quieres','quiero','hacer','haces','hago','decir','dice','dices',
  'mismo','misma','mucho','mucha','poco','poca','entrar','adentro','entra','vivo','vivos','entre',
]);

/** Los números escritos, para que «9» choque con «nueve». */
const NUMEROS: Record<string, string> = {
  uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5', seis: '6', siete: '7',
  ocho: '8', nueve: '9', diez: '10', once: '11', doce: '12', quince: '15', veinte: '20',
};

function normalizar(t: string): string {
  return (t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

/** Palabras con carga (>4 letras o números), con los números escritos en cifra. */
function tokens(t: string): Set<string> {
  const out = new Set<string>();
  for (const p of normalizar(t).split(/\s+/)) {
    if (!p) continue;
    const num = NUMEROS[p];
    if (num) out.add(num);
    if (/^\d+$/.test(p)) out.add(p);
    else if (p.length > 4 && !VACIAS.has(p)) out.add(p);
  }
  return out;
}

/**
 * ¿ELLA ESTÁ CORRIGIENDO ALGO QUE PAULA DIJO?
 *
 * No basta con que empiece por "no": «No he salido» es una RESPUESTA a la
 * pregunta de entrada, no una corrección. Lo que la distingue es que la negación
 * choca con algo que Paula acaba de afirmar.
 *
 * El caso real: Paula dijo «nueve años pidiendo perdón» y ella contestó «No
 * tengo 9 años». El token que choca es «años» —y además «nueve» se normaliza a
 * «9», así que también choca el número—. En cambio «No he salido» no comparte
 * ninguna palabra con carga con «¿sigues con el narcisista o ya saliste?».
 */
export function estaCorrigiendo(mensaje: string, ultimaDePaula: string): boolean {
  const m = normalizar(mensaje).trim();

  // Vía 1: lo declara ella misma. No hace falta que choque con nada.
  if (CORRIGE_EXPLICITO.test(m)) return true;

  // Vía 2: niega al principio Y choca con algo que Paula acaba de afirmar.
  if (!NIEGA_AL_INICIO.test(m)) return false;
  if (!ultimaDePaula) return false;

  const suyos = tokens(mensaje);
  const dePaula = tokens(ultimaDePaula);
  for (const t of suyos) if (dePaula.has(t)) return true;
  return false;
}

/**
 * ¿PAULA LE ACABA DE OFRECER ALGO QUE SE CONTESTA CON UN SÍ?
 *
 * «Dale» solo significa «mándamelo» si antes hubo un ofrecimiento. Sin esta
 * puerta, cualquier «ok» de cortesía se leería como que pide el link.
 */
// ⚠️ SIN EL "?" SUELTO. Antes valía cualquier pregunta, y la pregunta de
// ENTRADA también es una pregunta: así, un «ok» o un «ya lo dejé» detrás se
// leían como que ella estaba diciendo que sí a algo que nadie le ofreció. Aquí
// solo entran los ofrecimientos de verdad, los que se contestan con «dale».
const OFRECIO =
  /\b(quieres que|te (lo )?(mando|paso|env[íi]o|vuelvo a mandar)|te (lo )?dejo|aqu[íi] (lo )?tienes|te sirve|te parece|te lo comparto|quieres el link|te interesa)\b/i;

export function leerIntencion(mensaje: string, ultimaDePaula = ''): Intencion {
  const m = (mensaje || '').trim();
  const largo = m.replace(/\s+/g, ' ').length;
  /** Sin tildes: ver la nota de arriba sobre `\b` y las vocales acentuadas. */
  const plano = normalizar(m).trim();

  // 1. LA CORRECCIÓN MANDA SOBRE TODO. Si le estás diciendo que se equivocó y
  //    ella sigue con su discurso, se acabó la conversación.
  if (estaCorrigiendo(m, ultimaDePaula)) return 'corrige';

  // 2. UN SÍ CORTO A UN OFRECIMIENTO. Va antes que la despedida porque «bueno»
  //    y «listo» son las dos cosas según lo que Paula acabe de decir.
  if (largo <= 30 && AFIRMA.test(plano) && !RESPUESTA_DE_ENTRADA.test(plano) && OFRECIO.test(ultimaDePaula))
    return 'acepta';

  // 3. SE ESTÁ DESPIDIENDO. Aquí no se vende ni se pregunta por dudas: se
  //    cierra con calidez. A Analia se le preguntó «¿qué te está haciendo
  //    dudar?» justo después de un «Muchísimas gracias!!».
  if (DESPIDE.test(plano) && largo <= 80) return 'se_despide';

  // 4. PREGUNTA CONCRETA. Con signo y sin ser un desahogo largo.
  if (/[?¿]/.test(m) && largo <= 200) return 'pregunta';

  // 5. TE ESTÁ CONTANDO LO SUYO. Es lo más valioso que puede pasar en esta
  //    conversación y es justo donde Paula soltaba la fórmula enlatada.
  if (largo >= 100) return 'cuenta';
  if (/[?¿]/.test(m)) return 'pregunta';

  // 6. CONTESTÓ, PERO CASI SIN NADA. Aquí NO se le inventa un dolor: se
  //    pregunta. Es el fallo que costó la conversación de Yeny.
  return 'responde_corto';
}

/**
 * LO QUE TIENE QUE HACER PAULA CON ESA INTENCIÓN.
 *
 * Va arriba del todo en el prompt, antes que el guion de venta. Es una sola
 * orden, corta y sin alternativas: con 34.000 caracteres delante, lo que no sea
 * tajante se pierde.
 */
export function bloqueIntencion(intencion: Intencion, ultimaDePaula = '', preguntaSugerida = ''): string {
  const cabecera = '# 👂 LO PRIMERO: QUÉ ACABA DE HACER ELLA';

  switch (intencion) {
    case 'corrige':
      return `${cabecera}

**TE ESTÁ CORRIGIENDO. Te equivocaste con un dato suyo.**

Esto es lo único que importa en este mensaje:
1. Reconócelo en la primera frase, sin excusas y sin disculparte de más. Un «tienes razón, me adelanté» basta.
2. **Borra de tu cabeza el dato que ella acaba de negar.** No lo repitas ni reformulado.
3. Pregúntale a ELLA cómo es. Una pregunta, corta.

⛔ En este mensaje NO va: el link, el precio, el horario, ni nada del programa. Ella no está hablando del programa, está diciéndote que no la escuchaste.

⚠️ Una mujer llegó a escribir CUATRO VECES la misma corrección y recibió cuatro veces el mismo párrafo. Si vuelves a pasarle por encima, deja de escribir.`;

    case 'acepta':
      return `${cabecera}

**TE DIJO QUE SÍ a lo que le acabas de ofrecer.**

Dáselo, en este mensaje, sin condiciones y sin volver a preguntar. Si le ofreciste el link, el link va COMPLETO y en su propio globo.

⛔ Prohibido anunciar algo y no mandarlo («aquí tienes el link» sin el link), volver a preguntarle si lo quiere, o aprovechar para vender otra cosa.`;

    case 'se_despide':
      return `${cabecera}

**SE ESTÁ DESPIDIENDO O DÁNDOTE LAS GRACIAS.**

Cierras con calidez y en UNA frase. Le dejas la puerta abierta.

⛔ Aquí NO se vende. Nada de link, nada de precio, y sobre todo **ninguna pregunta sobre qué la frena o qué la hace dudar**: no está dudando, se está despidiendo.`;

    case 'pregunta':
      return `${cabecera}

**TE ESTÁ PREGUNTANDO ALGO CONCRETO.**

Contéstale eso, primero y claro. Solo lo que preguntó. Después, si hace falta, una frase que la acerque.

⛔ No contestes con otra pregunta. No cambies de tema hacia lo que tú querías decir.`;

    case 'cuenta':
      return `${cabecera}

**TE ESTÁ CONTANDO LO SUYO. Esto es lo más valioso que puede pasar en esta conversación.**

Tu respuesta empieza recogiendo **algo concreto que ELLA acaba de escribir** — un hecho, una fecha, una palabra suya. No una frase que sirva para cualquiera: una que solo sirva para ella. Si no puedes señalar en su mensaje la palabra que estás recogiendo, tu respuesta no vale.

Después, UNA sola frase que conecte eso con lo que va a cambiar en ella.

⛔ Prohibido responder con la fórmula genérica de siempre. Si tu mensaje se le podría mandar igual a otra mujer, está mal.
⛔ Prohibido explicarle por qué él hace lo que hace. La escuchaste, no la analices.`;

    case 'responde_corto':
      return `${cabecera}

**CONTESTÓ, PERO CASI NO TE DIJO NADA TODAVÍA.**

**No sabes lo que le pasa. No te lo inventes.** Le haces UNA pregunta corta y humana para que te lo cuente, y te callas.${
        preguntaSugerida ? `

Si no se te ocurre otra mejor, esta: *"${preguntaSugerida}"*` : ''
      }

⛔ Prohibido afirmarle un dolor que ella no ha dicho —cuántos años lleva, que no duerme, que pide perdón—. Si se lo inventas y fallas, la pierdes: ya pasó.
⛔ Este mensaje va en UN globo. No le sueltes el programa entero a alguien que aún no te ha contado nada.`;
  }
}

/**
 * ¿HAY ALGUNA SEÑAL DE QUE ELLA DUDE?
 *
 * Sirve para no preguntarle qué la frena a quien no ha frenado nada. A Analia
 * se lo preguntaron después de abrir su historia y otra vez después de darle
 * las gracias.
 */
export function haySenalDeDuda(mensajesDeElla: string[]): boolean {
  // ⚠️ NI «pero», NI «luego», NI «después» SUELTOS. Parecen duda y casi nunca
  // lo son cuando ella está contando lo suyo: Analia escribió *"en febrero lo
  // eché de mi casa PERO cuando recuerdo todavía me hace sentir mal"* — eso es
  // su historia, no una duda sobre entrar. Con «pero» en la lista, Paula creía
  // que había un freno y volvía a preguntarle qué la frenaba. Visto probando el
  // 2026-08-06.
  //
  // Aquí solo entra lo que frena LA COMPRA, no lo que le duele de él.
  //
  // Sin tildes, por lo mismo que arriba: `/\bno s[ée]\b/` no casa con «no sé».
  const DUDA =
    /\bno se si\b|\bno estoy segura\b|lo pienso|lo voy a pensar|\bdejame pensar|mas adelante|\bcar[oa]\b|carit[oa]|no tengo (plata|dinero|tarjeta|como|para)|no me alcanza|no puedo pagar|sera que|y si no (me )?(sirve|funciona)|\bdudo\b|\bdudas?\b|\bmas adelante\b|otro dia|otro mes|cuando (cobre|pueda|tenga)/;
  return mensajesDeElla.some((m) => DUDA.test(normalizar(m || '')));
}

/** Une el bloque de intención con lo que venga después. */
export function pegar(...bloques: string[]): string {
  return bloques.filter((b) => b && b.trim()).join(SALTO + SALTO + '---' + SALTO + SALTO);
}
