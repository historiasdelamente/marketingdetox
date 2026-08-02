// ============================================================================
// LA ESCALERA — QUÉ LE OFRECE PAULA EN ESTE TURNO
//
// Escalón 1: LA CLASE DEL JUEVES. Aquí entra todo el mundo, siempre.
// Escalón 2: APEGO DETOX. Solo se sube cuando ELLA lo pide.
//
// POR QUÉ NO SUBE SOLA: si Paula ofrece las dos cosas a la vez, se contradice
// (dos precios, dos plataformas, dos links en el mismo mensaje) y ella se queda
// sin saber a cuál darle. La versión anterior resolvía esto con un interruptor
// excluyente —o clase o Apego, nunca los dos— y eso obligaba a apagar un
// producto para vender el otro. La escalera los deja convivir en orden.
//
// UNA VEZ ARRIBA, NO SE BAJA. Si ella ya preguntó por Apego Detox, volver a
// ofrecerle la clase es retroceder la venta.
// ============================================================================

export type Escalon = 'clase' | 'apego';

/**
 * Ella pidió el escalón 2. Son las cuatro puertas que dictó Javier:
 * pregunta por Apego Detox, pide un programa, pregunta por los talleres,
 * o pregunta por terapia.
 *
 * OJO con "terapia": pedir terapia INDIVIDUAL con Javier no es esto — eso lo
 * detecta `motivoHandoff` y va directo a su WhatsApp. Aquí cae la mujer que
 * pregunta por terapia en general, y a esa le sirve Apego Detox.
 */
const PIDE_ESCALON_2 =
  /apego\s*detox|\bprogramas?\b|\btalleres?\b|\bterapias?\b|acompa[ñn]amiento|membres[íi]a|suscripci[óo]n|\bcomunidad\b|algo\s+m[áa]s\s+(?:largo|profundo|completo|serio)|qu[ée]\s+m[áa]s\s+(?:tienes|tienen|hay|ofreces)/i;

export type EntradaEscalera = {
  /** Lo que ella acaba de escribir (todos sus mensajitos del turno, juntos). */
  mensaje: string;
  /** El escalón guardado de turnos anteriores. */
  guardado?: string | null;
  /** wa_users.funnel_stage — 'compradora' = ya pagó algo. */
  etapa?: string | null;
};

/**
 * En qué escalón está esta conversación AHORA.
 * Determinista: no depende de que el modelo se acuerde de nada.
 */
export function escalonDe({ mensaje, guardado, etapa }: EntradaEscalera): Escalon {
  // 1. Una vez arriba, no se baja.
  if (guardado === 'apego') return 'apego';

  // 2. Ya compró: la clase no se le vuelve a vender. Lo que sigue es el programa.
  if (etapa === 'compradora') return 'apego';

  // 3. Ella abrió la puerta.
  if (PIDE_ESCALON_2.test(mensaje)) return 'apego';

  // 4. Por defecto, siempre la clase.
  return 'clase';
}

/** ¿Este turno es el que subió de escalón? Sirve para no repetir el pitch. */
export function acabaDeSubir(anterior: string | null | undefined, ahora: Escalon): boolean {
  return ahora === 'apego' && anterior !== 'apego';
}

/**
 * El bloque de orden que va arriba del prompt. Es corto a propósito: la escalera
 * se decide en código, no se le pide al modelo que la razone.
 */
export function instruccionEscalon(escalon: Escalon): string {
  if (escalon === 'clase') {
    return `# 🪜 EN ESTE MENSAJE OFRECES: LA CLASE DEL JUEVES — EL PASO NÚMERO UNO
Es lo único que ofreces. **La mayoría llega de TikTok y no conoce a Javier**: no des por hecho que sabe quién es, ni qué es Apego Detox, ni que existe un programa. Lo único que necesita saber hoy es que hay una clase el jueves.

**Ella escribe porque quiere venir a esta clase.** No tienes que convencerla, ni descubrir su caso, ni ganarte el derecho a contarle. Trátala como a alguien que ya casi está adentro: despiértale la curiosidad de lo que va a pasar esa noche y ábrele la puerta. Nada de interrogatorio.
- No nombres Apego Detox, ni su precio, ni su link, salvo que ELLA pregunte por el programa, los talleres o la terapia. Si lo hace, en ese momento cambias de escalón.
- ⛔ NO nombres los encuentros en vivo de los martes y jueves: esos son de las que YA están dentro del programa. Aquí solo existe la clase del jueves.
- ⛔ **El link que mandas es la página de la clase, nunca un link de pago.** Ahí ella ve todo y aparta su lugar. Skool NO se nombra aquí.
- Si pregunta "¿y después qué sigue?", le dices que sí hay un programa completo después y se lo cuentas. Ahí sí subes.`;
  }

  return `# 🪜 EN ESTE MENSAJE OFRECES: APEGO DETOX
Ella ya pidió el programa, así que aquí no vuelves a la clase del jueves — eso sería retroceder. Si ella la nombra, se la confirmas en una línea y sigues con el programa.
- **Apego Detox y la clase del jueves son dos cosas distintas.** La clase es una noche, pago único, por Hotmart. Apego Detox es el programa completo, suscripción, por Skool. Nunca las mezcles ni digas que una incluye a la otra.
- El pago de Apego Detox es por Skool, y SOLO por Skool. Hotmart no se nombra aquí.`;
}
