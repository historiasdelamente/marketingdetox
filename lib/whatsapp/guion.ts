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
const OBJECIONES: Array<{ clave: string; patron: RegExp }> = [
  // "está MUY caro", "me sale carito": la queja del precio viene con adverbios
  // y diminutivos, casi nunca pelada.
  { clave: 'dinero', patron: /no tengo (plata|dinero|c[óo]mo)|\bcar[oa]\b|carit[oa]|no me alcanza|sin trabajo|no puedo pagar|no me da (para|el presupuesto)/i },
  { clave: 'duda de que le sirva', patron: /no s[ée] si (me )?(sirva|funcione|vaya a servir)|y si no me funciona|ya intent[ée]|no me sirvi[óo]/i },
  { clave: 'tiempo', patron: /no tengo tiempo|no me da el tiempo|trabajo todo el d[íi]a/i },
  { clave: 'lo va a pensar', patron: /lo voy a pensar|lo pienso|d[ée]jame pensarlo|despu[ée]s te (digo|escribo)/i },
  { clave: 'miedo a que él se entere', patron: /se entere|que no sepa|revisa mi (celular|tel[ée]fono)|me lo revisa/i },
  { clave: 'no tiene tarjeta', patron: /no tengo tarjeta|sin tarjeta|no manejo tarjeta/i },
  { clave: 'vergüenza del grupo', patron: /pena|verg[üu]enza|hablar delante|no quiero contar/i },
];

export function analizarConversacion(historial: Turno[]): EstadoVenta {
  const dePaula = historial.filter((m) => m.role === 'assistant').map((m) => m.content);
  const deElla = historial.filter((m) => m.role === 'user').map((m) => m.content);
  const todoPaula = dePaula.join('\n');

  return {
    turnos: dePaula.length,
    sabeQueEs: SABE_QUE_ES.test(todoPaula),
    tieneLink: TIENE_LINK.test(todoPaula),
    sabePrecio: SABE_PRECIO.test(todoPaula),
    sabeGarantia: SABE_GARANTIA.test(todoPaula),
    sabeQueEsHoy: ES_HOY.test(todoPaula),
    objeciones: OBJECIONES.filter((o) => deElla.some((m) => o.patron.test(m))).map((o) => o.clave),
  };
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
export function bloqueGuion(historial: Turno[]): string {
  const e = analizarConversacion(historial);

  // Primer turno: manda el bloque de entrada, aquí no hay guion que dar.
  if (e.turnos === 0) return '';

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

  if (!e.sabeQueEs) {
    paso = `**CONTARLE QUÉ ES.** Todavía no sabe qué está mirando. Qué hay adentro y qué va a lograr, en una o dos frases, y el link en su propio globo.`;
  } else if (!e.tieneLink) {
    paso = `**DARLE EL LINK.** Ya sabe qué es; lo que falta es la puerta. Una frase corta que la empuje y el link en su propio globo.`;
  } else if (e.objeciones.length > 0) {
    paso = `**TRABAJAR SU OBJECIÓN: ${e.objeciones[e.objeciones.length - 1]}.** Es lo único que la separa de entrar. Validas en una frase, reencuadras con un ángulo que NO hayas usado, y cierras. Si ya rebatiste esa misma, no la repitas: pregúntale qué más la frena.`;
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
