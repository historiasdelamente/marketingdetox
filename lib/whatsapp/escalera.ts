// ============================================================================
// LA ESCALERA — QUÉ LE OFRECE PAULA EN ESTE TURNO
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  📌 2026-08-05 — LA ESCALERA SE ACABÓ. AHORA HAY UN SOLO ESCALÓN.         ║
// ║                                                                           ║
// ║  Hasta hoy esto tenía dos peldaños: todo el mundo entraba por LA CLASE    ║
// ║  DEL JUEVES y solo se subía a Apego Detox si ELLA lo pedía. Javier lo     ║
// ║  cortó: de ahora en adelante Paula ofrece SOLO Apego Detox (Skool).       ║
// ║                                                                           ║
// ║  POR QUÉ LA ESCALERA ERA PARTE DEL PROBLEMA, y no solo la clase:          ║
// ║  el escalón 2 únicamente se abría si ella pronunciaba una de cuatro       ║
// ║  palabras ("programa", "talleres", "terapia", "Apego Detox"). O sea que   ║
// ║  el producto de 20 dólares al mes —el que de verdad la sostiene— solo se  ║
// ║  le ofrecía a la mujer que ya sabía que existía y sabía cómo pedirlo. A   ║
// ║  la que llegaba de TikTok sin saber nada, jamás. El mejor producto        ║
// ║  estaba escondido detrás de una contraseña que casi nadie adivinaba.      ║
// ║                                                                           ║
// ║  EL TIPO `Escalon` SE QUEDA, con un solo valor. No es ceremonia: hace     ║
// ║  que TypeScript señale como error cualquier rama de código que todavía    ║
// ║  crea que existe la clase, en vez de dejarla viva y muerta a la vez.      ║
// ║  Cuando ya no quede ninguna, el tipo y este archivo se borran.            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// ============================================================================

export type Escalon = 'apego';

/**
 * En qué escalón está esta conversación. Siempre el mismo: solo hay uno.
 *
 * Se conserva la función (en vez de borrarla y poner la constante a mano en
 * cada sitio) porque es el punto donde se enchufaría un segundo producto el día
 * que exista. Y porque los tests de la escalera siguen valiendo como candado:
 * verifican que NINGUNA entrada —diga lo que diga ella— devuelve la clase.
 */
export function escalonDe(): Escalon {
  return 'apego';
}

/**
 * El bloque de orden que va arriba del prompt.
 *
 * Es corto a propósito: lo que Paula ofrece se decide en código, no se le pide
 * al modelo que lo razone.
 */
export function instruccionEscalon(): string {
  return `# 🪜 EN ESTE MENSAJE OFRECES: APEGO DETOX — Y NADA MÁS

Es lo único que vendes. **La mayoría llega de TikTok y no conoce a Javier Vieira**: no des por hecho que sabe quién es ni qué es esto.

**Ella escribe porque algo de lo que vio le tocó justo donde le duele.** No tienes que convencerla ni descubrirle el caso: tienes que dejarle claro, rápido, que eso que le pasa tiene un lugar donde se trabaja y que puede entrar HOY.

- ⛔ **Ya NO existe "la clase del jueves" como algo que tú ofrezcas.** No la nombres, no la vendas, no la uses de gancho, no mandes su página ni su link de Hotmart. Si ELLA pregunta por la clase, le dices la verdad en una línea: los talleres en vivo ahora son parte del programa, y son dos cada semana. Y sigues con el programa.
- ⛔ **Hotmart no se nombra nunca.** Apego Detox se paga SOLO en Skool. Un link de Hotmart la lleva a un sitio donde no puede entrar al programa: es el error más caro que puedes cometer.
- 💛 **Tu ventaja es que no hay que esperar a nada.** Entra hoy, desde el celular, a la hora que sea. Úsalo temprano: es lo que le resuelve el problema que tiene esta noche.`;
}
