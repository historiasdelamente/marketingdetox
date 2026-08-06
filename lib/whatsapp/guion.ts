// ============================================================================
// EL GUION DE VENTA — POR DÓNDE VA ESTA CONVERSACIÓN
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  📌 POR QUÉ EXISTE. Javier, 2026-08-05, viendo la conversación de Milena:  ║
// ║  *"empieza a repetir… recuerda leer, decir cosas nuevas, hacer un guion    ║
// ║  coherente de ventas del producto; veo que parece dando el mismo guion"*.  ║
// ║                                                                           ║
// ║  Y tenía razón por una causa que no se ve leyendo el prompt: EL PROMPT ERA ║
// ║  IDÉNTICO EN EL TURNO 2 Y EN EL TURNO 9. Le llegaba la misma receta de     ║
// ║  tres globos, el mismo dolor (sembrado con su manychat_id, o sea fijo para ║
// ║  ella en TODA la conversación) y la misma orden de mandar el link. Con eso ║
// ║  delante, un modelo barato hace lo único razonable: repetirse.             ║
// ║                                                                           ║
// ║  Aquí se calcula, leyendo lo que Paula YA dijo, en qué punto de la venta   ║
// ║  está y qué toca ahora. No se le pide al modelo que lo recuerde: se le     ║
// ║  entrega resuelto, como el reloj y el precio.                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// ============================================================================

export type Turno = { role: 'user' | 'assistant'; content: string };

/** Lo que Paula ya cubrió. Se deduce de sus propios mensajes, no de memoria. */
export type EstadoVenta = {
  /** Cuántas veces ha hablado Paula en esta conversación. */
  turnos: number;
  /** Ya le contó qué hay adentro (talleres, comunidad, módulos…). */
  sabeQueEs: boolean;
  /** Ya recibió el link de Skool. */
  tieneLink: boolean;
  /** Ya le dio el precio. */
  sabePrecio: boolean;
  /** Ya le nombró la garantía. */
  sabeGarantia: boolean;
  /** Ya le dijo que se entra hoy, sin esperar. */
  sabeQueEsHoy: boolean;
  /** Objeciones que ELLA ha puesto, en el orden en que salieron. */
  objeciones: string[];
  /** Veces que Paula ya le preguntó qué la frena. A la tercera, es acoso. */
  vecesQuePregunto: number;
  /** Ella nombró un momento futuro ("el lunes", "cuando cobre"). Textual. */
  citaFutura: string | null;
  /** ¿Ya te contó algo suyo de verdad, o solo ha dicho «hola» y su nombre? */
  ellaYaConto: boolean;
};

const SABE_QUE_ES = /taller|comunidad|m[óo]dulo|meditaci|en vivo|acompa[ñn]am/i;
const TIENE_LINK = /skool\.com/i;
const SABE_PRECIO = /\$\s?\d|\d+\s*d[óo]lares|al mes/i;
const SABE_GARANTIA = /garant[íi]a|se te devuelve|devoluci[óo]n/i;
const ES_HOY = /hoy mismo|entras hoy|sin esperar|no hay que esperar|apenas entras/i;

/**
 * Las objeciones que importan, en el idioma de ella. Se detectan para que Paula
 * no vuelva a rebatir la misma dos veces con otras palabras — que es la forma
 * de repetirse que peor sienta: ella siente que no la están leyendo.
 */
// ⚠️ ESTOS PATRONES ERAN DEMASIADO LITERALES Y CAUSARON EL BUCLE. Ninguna
// mujer escribe "no tengo tarjeta"; escribe «tengo que recargar mi tarjeta solo
// tengo enefect8vo». Con cero objeciones detectadas, `bloqueGuion` caía siempre
// en la misma rama y le ordenaba a Paula preguntar «¿qué te está frenando?» —
// turno tras turno. **La repetición la fabricaba este archivo, no el modelo.**
// Al ampliarlos hay que asumir faltas de ortografía y frases a medias.
const OBJECIONES: Array<{ clave: string; patron: RegExp }> = [
  // "está MUY caro", "me sale carito": la queja del precio viene con adverbios
  // y diminutivos, casi nunca pelada.
  { clave: 'dinero', patron: /no tengo (plata|dinero|c[óo]mo)|\bcar[oa]\b|carit[oa]|no me alcanza|sin trabajo|estoy sin (trabajo|empleo)|no puedo pagar|no me da (para|el presupuesto)|no tengo (para|con qu[ée])|estoy mal (de|econ)|situaci[óo]n econ[óo]mica|inestabilidad econ[óo]mica/i },
  { clave: 'duda de que le sirva', patron: /no s[ée] si (me )?(sirva|funcione|vaya a servir|funcionar[áa])|y si no me funciona|ya intent[ée]|no me sirvi[óo]|ya prob[ée]|\bfuncionar[áa]\b|ser[áa] que (me )?(sirve|funciona)/i },
  { clave: 'tiempo', patron: /no tengo tiempo|no me da el tiempo|trabajo todo el d[íi]a|estoy muy ocupad|no voy a poder (conectarme|asistir)/i },
  { clave: 'lo va a pensar', patron: /lo (voy a |vo?y? )?pensar|lo pienso|d[ée]jame pensarlo|despu[ée]s te (digo|escribo|aviso)|te (digo|aviso|escribo) (luego|despu[ée]s|m[áa]s tarde)|ah[íi] te (digo|aviso)/i },
  { clave: 'miedo a que él se entere', patron: /se entere|que no sepa|revisa mi (celular|tel[ée]fono)|me lo revisa|me revisa el/i },
  // OJO: aquí solo va la duda; el "no puedo pagar" de logística es un handoff a
  // Javier (SIN_TARJETA_RE en blindaje.ts), no una objeción que Paula rebata.
  { clave: 'no tiene cómo pagar', patron: /no tengo tarjeta|sin tarjeta|no manejo tarjeta|solo tengo efectivo|no hay (banco|cajero)|recargar (la|mi) tarjeta|no puedo realizar (el )?pagos?|no hay (d[óo]nde|un lugar|forma|manera|c[óo]mo).{0,40}pag/i },
  { clave: 'vergüenza del grupo', patron: /pena|verg[üu]enza|hablar delante|no quiero contar|me da cosa|soy muy t[íi]mida/i },
  { clave: 'miedo a perderlo', patron: /perderlo|lo voy a perder|miedo a perder|si lo dejo|no quiero perderlo|volver[áa] conmigo/i },
  { clave: 'no quiere rehacer su vida', patron: /no quiero (tener )?otra pareja|a mi edad|no quiero volver a (conseguir|empezar)|pens[ée] (una|mi) vejez/i },
  { clave: 'los hijos', patron: /mi hijo|mis hijos|mi ni[ñn][oa]|le digo a mi hijo|por los ni[ñn]os/i },
  { clave: 'desesperación', patron: /desesperad|no aguanto m[áa]s|ya no puedo m[áa]s|estoy fatal|no s[ée] qu[ée] hacer/i },
];

/**
 * ¿PAULA YA LE PREGUNTÓ QUÉ LA FRENA?
 *
 * A Nedith se lo preguntó cuatro veces seguidas —«¿es solo eso lo que te
 * detiene?», «¿qué te está frenando?»— después de que ella ya hubiera contestado
 * dos veces que no tenía cómo pagar. Preguntar lo mismo que ya te contestaron es
 * la señal más clara de que no la estás leyendo.
 */
export const PREGUNTA_FRENO =
  /qu[ée] (m[áa]s )?te (est[áa] )?(frena|detiene|frenando|deteniendo|impide|impidiendo|hace dudar|est[áa] haciendo dudar)|es solo eso|solo eso lo que te|algo (m[áa]s )?que te est[ée] (frenando|haciendo dudar)|qu[ée] te detiene|hay algo (m[áa]s )?que te fren|algo m[áa]s que te frena/i;

/**
 * ELLA NOMBRÓ UN MOMENTO. Es lo más valioso que puede decir una mujer que no
 * compra hoy, y el sistema no lo veía: Nedith dijo «el día lunes estaré en mi
 * ciudad» y Paula siguió vendiendo ocho turnos más como si no lo hubiera leído.
 */
const CITA_FUTURA =
  /\b(el |este |pr[óo]ximo )?(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo)\b|\bma[ñn]ana\b|pasado ma[ñn]ana|la (otra|pr[óo]xima) semana|fin de semana|cuando (cobre|me paguen|reciba|llegue|est[ée]|pueda|tenga|vuelva|regrese)|\bel (d[íi]a )?\d{1,2}\b|a fin de mes|quincena/i;

export function analizarConversacion(historial: Turno[]): EstadoVenta {
  const dePaula = historial.filter((m) => m.role === 'assistant').map((m) => m.content);
  const deElla = historial.filter((m) => m.role === 'user').map((m) => m.content);
  const todoPaula = dePaula.join('\n');

  // La cita se busca de atrás hacia delante: vale la última que dijo.
  const conCita = [...deElla].reverse().find((m) => CITA_FUTURA.test(m)) ?? null;

  return {
    turnos: dePaula.length,
    sabeQueEs: SABE_QUE_ES.test(todoPaula),
    tieneLink: TIENE_LINK.test(todoPaula),
    sabePrecio: SABE_PRECIO.test(todoPaula),
    sabeGarantia: SABE_GARANTIA.test(todoPaula),
    sabeQueEsHoy: ES_HOY.test(todoPaula),
    objeciones: OBJECIONES.filter((o) => deElla.some((m) => o.patron.test(m))).map((o) => o.clave),
    vecesQuePregunto: dePaula.filter((m) => PREGUNTA_FRENO.test(m)).length,
    citaFutura: conCita ? conCita.trim().slice(0, 120) : null,
    ellaYaConto: deElla.some((m) => YA_CONTO(m)),
  };
}

/**
 * ¿ESTO ES CONTARME ALGO, O SOLO CONTESTARME?
 *
 * «Hola», «Chile», «Yeny lamdrid» y «ok» no son su historia: son trámite. Su
 * historia empieza cuando escribe una frase entera sobre lo suyo, o cuando
 * contesta la pregunta de entrada diciendo dónde está.
 *
 * De esto depende que Paula deje de vender demasiado pronto. Javier eligió el
 * 2026-08-06 que hubiera **2-3 mensajes de escucha antes del link**, y sin una
 * definición de "ya me contó" eso no se puede sostener por prompt: el modelo
 * suelta el programa en cuanto ella dice su nombre.
 */
const RESPUESTA_DE_ENTRADA =
  /ya lo dej[ée]|lo dej[ée]|sigo con [ée]l|todav[íi]a estoy|no he salido|no lo he dejado|me separ[ée]|nos separamos|estoy saliendo|acabo de dejar|sigue conmigo|volvimos/i;

function YA_CONTO(m: string): boolean {
  const t = (m || '').trim();
  if (RESPUESTA_DE_ENTRADA.test(t)) return true;
  // Una frase entera sobre lo suyo. 60 caracteres es más o menos donde deja de
  // ser un dato y empieza a ser algo contado.
  return t.replace(/\s+/g, ' ').length >= 60;
}

/**
 * LO QUE YA LE DIJO, TEXTUAL, PARA QUE NO LO REPITA.
 *
 * Sus dos últimos mensajes van completos al prompt con una orden encima. El
 * historial ya viaja en la conversación, pero ahí el modelo lo lee como
 * contexto; puesto aquí, con la prohibición pegada, lo lee como una regla.
 */
function yaDicho(historial: Turno[]): string {
  const ultimos = historial.filter((m) => m.role === 'assistant').slice(-2);
  if (ultimos.length === 0) return '';

  return `\n## 🔁 ESTO YA SE LO DIJISTE — NO LO VUELVAS A DECIR
${ultimos.map((m) => `— «${m.content.replace(/\s*\n+\s*/g, ' / ').slice(0, 240)}»`).join('\n')}
**Ni con las mismas palabras ni con sinónimos.** Si tu mensaje nuevo se parece a alguno de esos, bórralo y di otra cosa: ella nota al segundo que le estás dando el mismo discurso, y ahí deja de contestar.`;
}

/**
 * EL SIGUIENTE PASO, calculado. Es lo que sustituye a "manda tres globos y el
 * link" repetido hasta el infinito.
 */
export function bloqueGuion(historial: Turno[], hayHandoff = false): string {
  const e = analizarConversacion(historial);

  // Primer turno: manda el bloque de entrada, aquí no hay guion que dar.
  if (e.turnos === 0) return '';

  // UNA SOLA VOZ POR TURNO. Si hay handoff, ese bloque YA dice qué hacer, y es
  // lo contrario de vender: pasarla con Javier, parar por riesgo, felicitarla.
  // Añadirle encima "trabaja su objeción y cierra" son dos órdenes que se
  // pelean, y con `gpt-4.1-mini` gana la que esté más abajo. Con Nedith se vio
  // al revés —nunca saltó el handoff—, pero al ampliarlo ahora sí salta, y el
  // guion tiene que callarse.
  if (hayHandoff) return '';

  const cubierto = [
    e.sabeQueEs && 'qué hay adentro',
    e.tieneLink && 'el link',
    e.sabePrecio && 'el precio',
    e.sabeGarantia && 'la garantía',
    e.sabeQueEsHoy && 'que se entra hoy',
  ].filter(Boolean);

  // QUÉ TOCA AHORA. El orden no es caprichoso: es el de una venta que va
  // avanzando. Solo se le da UN paso — con dos, los mezcla y sale el ladrillo.
  let paso: string;

  // El tope de preguntas va ARRIBA de casi todo: da igual en qué punto de la
  // venta esté, si ya le preguntaste dos veces qué la frena, no se lo vuelves a
  // preguntar. A Nedith se lo preguntaron cuatro veces seguidas.
  const yaPregunteDemasiado = e.vecesQuePregunto >= 2;

  if (!e.ellaYaConto && e.turnos <= 3) {
    paso = `**ESCUCHAR. Todavía no te ha contado nada suyo — solo ha contestado.**

Aquí NO se vende. Le haces UNA pregunta corta que la invite a contarte dónde está, y te callas a esperar.

⛔ En este mensaje NO va: el link, el precio, los horarios, ni la lista de lo que hay adentro. Nada de eso significa algo para alguien que todavía no te ha dicho qué le pasa.
⛔ Y no le adivines el dolor para rellenar. Si no te lo ha contado, no lo sabes.

**Un solo globo.** Es una pregunta, no un mensaje con una pregunta al final.

⚠️ Vender aquí es el error más caro que hay: quien recibe el catálogo en el segundo mensaje sabe que le está escribiendo un robot, y deja de contestar. La conversación se gana escuchando dos o tres mensajes primero.`;
  } else if (!e.sabeQueEs) {
    paso = `**CONTARLE QUÉ ES.** Ya te contó algo suyo, así que ahora sí. Qué hay adentro y qué va a lograr, en una o dos frases —enganchado a lo que ELLA te dijo— y el link en su propio globo.`;
  } else if (!e.tieneLink) {
    paso = `**DARLE EL LINK.** Ya sabe qué es; lo que falta es la puerta. Una frase corta que la empuje y el link en su propio globo.`;
  } else if (e.citaFutura) {
    paso = `**ELLA YA TE DIO UNA FECHA — CIERRA CON ESA FECHA Y DEJA DE VENDER.**
Te dijo: «${e.citaFutura}». Eso no es un "no", es un **sí con fecha**, y es lo mejor que te ha dicho.

Lo que haces AHORA, en dos frases como mucho:
1. Se lo confirmas **con sus palabras**, para que vea que la leíste. Nada de "mientras tanto puedes ir preparándote": eso es relleno.
2. Le dices que ese día te escriba y entran juntas, y ahí te callas.

⚠️ NO le prometas que TÚ le escribes ese día. No hay nada que mande un mensaje en una fecha que ella dijo, y prometérselo es prometerle algo que no existe.

⛔ En este mensaje NO va: el precio otra vez, el link otra vez, ni una sola pregunta sobre qué la frena. Ya te lo dijo — la fecha ES la respuesta. Si sigues empujando después de que te dio fecha, la pierdes.`;
  } else if (yaPregunteDemasiado) {
    paso = `**DEJA DE PREGUNTARLE QUÉ LA FRENA. Ya se lo preguntaste ${e.vecesQuePregunto} veces y ya te contestó.**
Volver a preguntarlo le demuestra que no la estás leyendo, y es la forma más rápida de que deje de contestar.

Elige UNA de estas tres, la que encaje con lo último que ella dijo:
— Si lo que la frena tiene arreglo, se lo resuelves con algo concreto. Sin preguntas.
— Si es miedo o duda, le dices UNA cosa nueva —un ángulo que no hayas usado— y cierras.
— Si ya dijo que no puede o que no ahora, la sueltas con cariño, le dejas la puerta abierta y no vuelves a vender en este mensaje.

Tu mensaje NO puede terminar en «¿qué te frena?», «¿es solo eso?» ni ninguna variante.`;
  } else if (e.objeciones.length > 0) {
    paso = `**TRABAJAR SU OBJECIÓN: ${e.objeciones[e.objeciones.length - 1]}.** Es lo único que la separa de entrar. Validas en una frase, reencuadras con un ángulo que NO hayas usado, y cierras.

⛔ Si esa objeción es de logística —no tiene cómo pagar, no hay banco, solo efectivo— **no la rebatas y no le digas que "eso se trabaja adentro"**: no es una herida, es un banco. Eso se le pasa a Javier.`;
  } else if (!e.sabePrecio) {
    paso = `**ESPERAR SU PREGUNTA, NO EMPUJAR.** Ya tiene el link y sabe qué es. No le repitas la oferta: contéstale lo que te pregunte. Si no pregunta nada concreto, una sola pregunta corta que destape qué la frena — *"¿qué te está haciendo dudar?"* — y te callas.`;
  } else {
    paso = `**CERRAR O SOLTAR.** Ya sabe qué es, cuánto vale y por dónde entra. No hay nada más que contarle: repetir la oferta ahora la aleja. Una pregunta que destape lo que la frena, o si ya dijo que no dos veces, la sueltas con cariño y le dejas la puerta abierta.`;
  }

  return `# 🧭 POR DÓNDE VA ESTA CONVERSACIÓN — LÉELO ANTES DE ESCRIBIR

Llevas **${e.turnos} ${e.turnos === 1 ? 'mensaje' : 'mensajes'}** con ella.
${cubierto.length ? `YA LE DISTE: ${cubierto.join(', ')}. **Nada de eso se repite.**` : 'Todavía no le has dado nada del programa.'}
${e.objeciones.length ? `LO QUE ELLA HA PUESTO COMO FRENO: ${e.objeciones.join(', ')}.` : ''}

👉 LO QUE TOCA AHORA: ${paso}
${yaDicho(historial)}`;
}

/**
 * ¿ELLA pide el link en este turno?
 *
 * Sirve para el candado de `paula.ts`: si ya lo tiene y no lo está pidiendo, el
 * link se le quita a la respuesta. Es el mismo patrón que el resto del sistema
 * —el prompt lo pide, el código lo hace cierto—, y la repetición del link era la
 * única regla importante que seguía dependiendo solo del prompt.
 */
const PIDE_LINK = /link|enlace|p[áa]gina|d[óo]nde (entro|me inscribo|pago|compro)|c[óo]mo (entro|me inscribo|pago|compro|hago)|m[áa]ndamelo|p[áa]samelo|se me perdi[óo]|no lo encuentro|quiero entrar|me interesa|s[íi] quiero|c[óo]mo es el pago|cu[áa]nto (vale|cuesta)|precio/i;

export function pideElLink(mensaje: string): boolean {
  return PIDE_LINK.test(mensaje || '');
}

/**
 * ¿ELLA ESTÁ PREGUNTANDO QUÉ HAY ADENTRO?
 *
 * Es la única pregunta en la que Paula puede contestar con viñetas. Javier lo
 * pidió el 2026-08-06 —*"trata de poner algunas viñetas, no tantos globos
 * juntos"*— acotado a este caso: aquí ella está comparando, y tres líneas se
 * leen de un vistazo. En el resto de la conversación las listas siguen
 * prohibidas, que es la regla que él mismo puso.
 *
 * Ojo con lo que NO entra: «¿cuánto cuesta?» es precio, no contenido, y ahí una
 * lista sobra.
 */
const QUE_INCLUYE =
  /qu[ée] (incluye|trae|hay|contiene|tiene|es lo que|voy a|me llevo|lograr[íi]a|gano|obtengo)|en qu[ée] consiste|c[óo]mo (es|funciona|va) (el|lo)|de qu[ée] (se )?trata|qu[ée] es (el|lo|eso|esto|apego)|m[áa]s informaci[óo]n|cu[ée]ntame m[áa]s|explicame|expl[íi]came/i;

export function preguntaQueIncluye(mensaje: string): boolean {
  return QUE_INCLUYE.test(mensaje || '');
}
