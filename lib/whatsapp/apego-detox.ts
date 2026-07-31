// ============================================================================
// APEGO DETOX — FUENTE ÚNICA DE VERDAD DEL PROGRAMA
//
// El equivalente de `contexto-clase.ts`, pero para el producto de siempre.
// Aquí vive TODO dato duro que Paula puede afirmar: precio, links, garantía,
// cuándo son los encuentros en vivo con Javier y qué incluye la comunidad.
// Si un dato no está en este archivo, Paula no lo dice.
//
// POR QUÉ EXISTE: el modelo no sabe qué día es hoy ni de dónde escribe ella.
// Sin esto contestaba "la próxima clase es el miércoles" (no existe) o daba
// la hora de Colombia a una mujer que escribe desde España. Todo lo que se
// pueda calcular, se calcula acá y se le entrega resuelto: el modelo lee y
// repite, no deduce.
//
// Contrastado con la página de ventas real
// (desing_web/src/components/apegodetox/copy.ts) el 2026-07-31.
// ============================================================================

import {
  TZ_COLOMBIA,
  detectarPais,
  diasDeCalendario,
  fechaISO,
  fechaLarga,
  hora12,
} from './contexto-clase';

// ---------------------------------------------------------------------------
// 1. EL PROGRAMA — lo único que se edita si cambia la oferta
// ---------------------------------------------------------------------------

export const APEGO = {
  nombre: 'Apego Detox',

  /** Suscripción mensual. NO es pago único: decirlo sería mentirle. */
  precio: '$37.97 USD',
  periodicidad: 'al mes',
  /** Frase completa, para no armarla mal en cada sitio. */
  precioFrase: '$37.97 USD al mes',

  garantiaDias: 7,

  /** Donde ella ve todo por dentro antes de decidir. */
  landing: 'https://historiasdelamente.com/apegodetox',
  /** Link de pago (Hotmart). Acceso inmediato al correo con el que paga. */
  checkout: 'https://pay.hotmart.com/W102751360L?bid=1771690985611',

  /**
   * Los DOS encuentros en vivo con Javier cada semana. Este es el corazón de
   * la venta: no es un curso grabado, es un acompañamiento con el psicólogo.
   */
  encuentros: {
    /** Días en hora Colombia. 2 = martes, 4 = jueves. */
    dias: [2, 4] as const,
    diasTexto: 'martes y jueves',
    hora24: 20,
    horaTexto: '8:00 PM',
    duracionHoras: 2,
    plataforma: 'Google Meet',
  },

  /** WhatsApp directo de Javier, ya clicable y con el mensaje precargado. */
  whatsappJavier:
    'https://wa.me/573001681053?text=Hola%20Javier%2C%20quiero%20informaci%C3%B3n%20sobre%20Apego%20Detox%20o%20una%20cita%20contigo',
  /** El mismo número, en crudo — para detectarlo y convertirlo en link. */
  numeroJavier: '3001681053',

  /** Testimonios en video de alumnas reales (los mismos de la página). */
  testimoniosHost: 'd3734kf5tip0j0.cloudfront.net',
} as const;

/** Colombia no tiene horario de verano: -05:00 vale todo el año. */
const OFFSET_COLOMBIA = '-05:00';

// ---------------------------------------------------------------------------
// 2. EL PRÓXIMO ENCUENTRO EN VIVO CON JAVIER
// ---------------------------------------------------------------------------

export type Encuentro = {
  /** Instante exacto de inicio. */
  inicio: Date;
  /** true mientras está ocurriendo. */
  enVivo: boolean;
  /** "martes 4 de agosto" — en hora Colombia. */
  fecha: string;
  /** La frase exacta que Paula debe usar: "es HOY", "es MAÑANA", "es el martes". */
  frase: string;
};

/** El día de la semana (0 = domingo) de una fecha ISO leída en Colombia. */
function diaSemanaEnColombia(iso: string): number {
  return new Date(`${iso}T12:00:00${OFFSET_COLOMBIA}`).getUTCDay();
}

/**
 * El próximo encuentro en vivo que ELLA todavía alcanza.
 *
 * Se recorren los próximos 8 días de calendario en Colombia y se devuelve el
 * primer martes o jueves cuyo encuentro no haya terminado. Si está ocurriendo
 * ahora mismo, ese es el que se devuelve (con `enVivo: true`) — es el mejor
 * momento para cerrar.
 */
export function proximoEncuentro(ahora: Date): Encuentro {
  const { dias, hora24, duracionHoras } = APEGO.encuentros;
  const horaISO = String(hora24).padStart(2, '0');

  for (let i = 0; i <= 8; i++) {
    const iso = fechaISO(new Date(ahora.getTime() + i * 86_400_000), TZ_COLOMBIA);
    if (!(dias as readonly number[]).includes(diaSemanaEnColombia(iso))) continue;

    const inicio = new Date(`${iso}T${horaISO}:00:00${OFFSET_COLOMBIA}`);
    const fin = new Date(inicio.getTime() + duracionHoras * 3_600_000);
    if (ahora >= fin) continue; // ese ya terminó, sigue el siguiente

    const enVivo = ahora >= inicio;
    const dias_ = diasDeCalendario(ahora, inicio, TZ_COLOMBIA);
    const fecha = fechaLarga(inicio, TZ_COLOMBIA);

    const frase = enVivo
      ? 'está EN VIVO ahora mismo'
      : dias_ === 0
        ? 'es HOY'
        : dias_ === 1
          ? 'es MAÑANA'
          : `es el ${fecha}`;

    return { inicio, enVivo, fecha, frase };
  }

  // Inalcanzable con martes y jueves en una ventana de 8 días. Está aquí para
  // que la función nunca devuelva undefined si algún día se cambian los días.
  const inicio = new Date(ahora.getTime() + 86_400_000);
  return { inicio, enVivo: false, fecha: fechaLarga(inicio, TZ_COLOMBIA), frase: 'es esta semana' };
}

// ---------------------------------------------------------------------------
// 3. EL BLOQUE QUE SE LE INYECTA AL PROMPT EN CADA MENSAJE
// ---------------------------------------------------------------------------

function bloqueSuPais(telefono: string | null | undefined, encuentro: Encuentro, ahora: Date): string {
  const pais = detectarPais(telefono);

  if (!pais) {
    return `## 📱 NO SABES DE QUÉ PAÍS TE ESCRIBE
No llegó su número (pasa en Instagram), así que NO sabes dónde está.
- NUNCA asumas Colombia ni des una hora "local" que no puedes calcular.
- Si hablas del encuentro en vivo, di la hora así: "${APEGO.encuentros.horaTexto} hora Colombia" — explícito, siempre.
- Solo le preguntas el país si ELLA pregunta a qué hora le queda a ella.`;
  }

  return `## 📱 ELLA TE ESCRIBE DESDE: ${pais.nombre}
- Su hora local en este momento: ${hora12(ahora, pais.tz)}.
- El próximo encuentro EN SU HORA: ${fechaLarga(encuentro.inicio, pais.tz)}, ${hora12(encuentro.inicio, pais.tz)} (hora de ${pais.ciudad}).
- Cuando hables de la hora del encuentro, usa ESTA, no la de Colombia. Su país no se lo preguntas: ya lo sabes.`;
}

/**
 * Reloj y datos duros de Apego Detox, recalculados en CADA mensaje.
 * Va PRIMERO en el prompt, para que el modelo lo lea antes que nada.
 */
export function bloqueContextoApego(ahora: Date, telefono?: string | null): string {
  const encuentro = proximoEncuentro(ahora);
  const { diasTexto, horaTexto, duracionHoras, plataforma } = APEGO.encuentros;
  const anio = new Intl.DateTimeFormat('es-CO', { timeZone: TZ_COLOMBIA, year: 'numeric' }).format(ahora);

  return `# ⏰ RELOJ Y DATOS DUROS — CALCULADO POR EL SISTEMA, ES LA VERDAD
Esto NO lo adivines ni lo calcules tú: ya viene resuelto. Léelo y úsalo tal cual.

- Hoy es ${fechaLarga(ahora, TZ_COLOMBIA)} de ${anio}. En Colombia son las ${hora12(ahora, TZ_COLOMBIA)}.
- 👉 EL PRÓXIMO ENCUENTRO EN VIVO CON JAVIER ${encuentro.frase.toUpperCase()} (${encuentro.fecha}), ${horaTexto} hora Colombia.
- Los encuentros son SIEMPRE ${diasTexto}, ${horaTexto} hora Colombia, ${duracionHoras} horas cada uno, por ${plataforma}. Dos por semana, todas las semanas. NUNCA nombres otro día.
- Precio: ${APEGO.precioFrase}. Es SUSCRIPCIÓN mensual y cancela cuando quiera. NO es pago único, no lo digas.
- Si pregunta cuánto es en su moneda: Hotmart se lo muestra en su moneda al pagar. Tú solo afirmas los ${APEGO.precio}.
- Garantía: ${APEGO.garantiaDias} días, devolución total y sin preguntas.

${bloqueSuPais(telefono, encuentro, ahora)}
`;
}
