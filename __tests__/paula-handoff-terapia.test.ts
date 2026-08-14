import { describe, expect, it } from 'vitest';
import { motivoHandoff } from '../lib/whatsapp/blindaje';

// ============================================================================
// CUÁNDO SE LE PASA A JAVIER — 2026-08-14
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  📌 POR QUÉ EXISTE. Javier lo pidió dos veces: *"si necesita terapia la    ║
// ║  rediriges conmigo"* y *"solo cuando veas algo crítico, con el link de     ║
// ║  WhatsApp"*. La primera mitad NO ESTABA IMPLEMENTADA: la única puerta era  ║
// ║  `(cita|consulta|sesión|terapia) + (privada|individual|personal|con        ║
// ║  javier|con el psicólogo)`, o sea la frase de un folleto. Medido contra    ║
// ║  18 formas verosímiles de pedir terapia, pasaban CINCO.                    ║
// ║                                                                           ║
// ║  Y no era teórico. Alejandra (`1273511096`) escribió el 2026-08-14         ║
// ║  **«Es posible recibir terapia con el?»** y `motivoHandoff` devolvió null. ║
// ║  Recibió el WhatsApp de Javier igual, pero por casualidad —el modelo lo    ║
// ║  leyó por su cuenta del bloque 10 de PAULA-CONOCIMIENTO.md— y con el peor  ║
// ║  efecto posible: sin handoff registrado, ningún candado se activa, así que ║
// ║  ese mensaje podía llevar la venta encima de una petición de terapia.      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
//
// Este archivo cubre las DOS mitades del encargo, y la segunda importa tanto
// como la primera: escalar de más le quita ventas. Apego Detox se describe a sí
// mismo como "17 módulos de terapia en video", así que sin un guarda explícito
// cada mujer preguntando por el programa acabaría en el WhatsApp de Javier.
// ============================================================================

describe('handoff — ella pide terapia o pide hablar con Javier', () => {
  // Escritas como escribe una mujer de verdad: sin tildes, en preguntas cortas,
  // minimizando. Ninguna dice "terapia individual", que era lo único que valía.
  const PIDE_TERAPIA = [
    'Es posible recibir terapia con el?', // ← textual, producción 2026-08-14
    'quiero terapia',
    'necesito terapia',
    'me gustaría tomar terapia',
    'el da terapia?',
    'hace consultas?',
    'cuanto cuesta una consulta con el',
    'quiero una cita con el doctor',
    'necesito hablar con alguien de verdad',
    'yo creo que necesito ayuda profesional',
    'puedo tener una sesion con javier',
    'atiende pacientes?',
    'quisiera que me atendiera a mi personalmente',
    // Las de siempre, que ya funcionaban y no se pueden romper.
    'quiero terapia individual',
    'quiero hablar con una persona',
    'me das el whatsapp de javier',
    'una consulta con el psicologo',
  ];

  it.each(PIDE_TERAPIA)('«%s» se le pasa a Javier', (frase) => {
    expect(motivoHandoff(frase)).toBe('pide_humano');
  });
});

describe('handoff — preguntar por el programa NO es pedir terapia', () => {
  // ⚠️ El guarda `(?!en video|del programa|grupal|de los módulos)` vive aquí.
  // Sin él, "quiero la terapia en video" —que es el producto— escalaría.
  const PREGUNTA_POR_EL_PROGRAMA = [
    'quiero la terapia en video',
    'cuanto cuesta la terapia del programa',
    'los modulos son terapia en video?',
    'quiero entrar al programa',
    'cuanto vale apego detox',
    'como me uno a la comunidad',
    'a que hora son los talleres',
    'quiero saber que incluye',
    'sigo con el y quiero salir',
    'ya lo deje y quiero recuperarme',
  ];

  it.each(PREGUNTA_POR_EL_PROGRAMA)('«%s» NO escala', (frase) => {
    expect(motivoHandoff(frase)).toBeNull();
  });
});

describe('handoff — la clase retirada, sin llevarse por delante a las compradoras', () => {
  // ⚠️ EL FALSO POSITIVO QUE COSTABA VENTAS. `PREGUNTA_CLASE_RE` tenía una
  // alternativa `la clase (de|del|que)` que no nombraba el producto retirado:
  // cazaba cualquier «la clase de X». Con ella, la pregunta de una mujer con la
  // tarjeta en la mano se leía como un problema del producto viejo y se la
  // escalaba. Está registrado en docs/PAULA-ESTADO-2026-08-06.md como *"la mandó
  // con Javier cuando estaba comprando"*.
  it.each([
    'como entro a la clase de mañana',
    'la clase de hoy a que hora es',
    'las clases en vivo son todas las semanas?',
  ])('«%s» NO escala — es intención de compra', (frase) => {
    expect(motivoHandoff(frase)).toBeNull();
  });

  // Lo que SÍ es del producto retirado sigue llegándole a él: hay dinero pagado
  // por algo que ya no existe, y eso solo lo resuelve Javier.
  it.each([
    'compre la clase del jueves y no me llega nada',
    'pague la clase y no tengo acceso',
    'me inscribi a recuperando mi ser',
  ])('«%s» sí se le pasa a Javier', (frase) => {
    expect(motivoHandoff(frase)).not.toBeNull();
  });
});
