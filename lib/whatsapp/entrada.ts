// ============================================================================
// HIGIENE DE ENTRADA — lo que ManyChat manda no siempre es lo que ella escribió
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  📌 POR QUÉ EXISTE. Tres casos reales del corpus de agosto de 2026:        ║
// ║                                                                           ║
// ║  · A Mayra le entró al historial, literal, «{{last_input_text}}»: la      ║
// ║    variable del panel sin resolver. Paula le contestó al placeholder.     ║
// ║  · Magda (1529749994, 2026-08-14) mandó una NOTA DE VOZ contando lo suyo. ║
// ║    ManyChat la puso como URL de S3 dentro de `user_message` — no en       ║
// ║    `audio_url`, que es el único campo que el webhook transcribía—, así    ║
// ║    que el modelo recibió un link .ogg como si fuera su historia, lo       ║
// ║    ignoró, y le contestó con el folleto del programa.                     ║
// ║  · Sandra mandó una imagen (posible comprobante de pago) y fue ignorada.  ║
// ║                                                                           ║
// ║  El modelo trata como texto TODO lo que le llegue. Aquí se limpia ANTES   ║
// ║  del modelo y ANTES del historial: nunca URLs crudas de S3 en ninguno.    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// ============================================================================

import { transcribirAudio, transcripcionDisponible } from './audio';

const PLACEHOLDER_RE = /^\s*\{\{[^}]*\}\}\s*$/;
const URL_AUDIO_RE = /https?:\/\/\S+\.(?:ogg|opus|mp3|m4a|aac|wav)(?:\?\S*)?/i;
const URL_IMAGEN_RE = /https?:\/\/\S+\.(?:webp|jpe?g|png|gif)(?:\?\S*)?/gi;

/**
 * El texto que el prompt reconoce como "audio que no pude escuchar".
 * Se emite SOLO si la transcripción falló o no está disponible: a la mujer
 * que sí fue transcrita se le contesta a lo que dijo, no se le miente con
 * un "no pude escucharte".
 */
export const EVENTO_AUDIO_MUDO = '[AUDIO que no pudiste escuchar]';

/** El texto que el prompt reconoce como "me mandó una imagen". */
export const EVENTO_IMAGEN = '[IMAGEN]';

/**
 * Limpia el mensaje crudo de ManyChat. Devuelve '' si no quedó nada usable
 * (el webhook lo trata como saludo). Nunca lanza: ante cualquier fallo del
 * transcriptor, degrada al evento nombrable.
 */
export async function higienizarEntrada(crudo: string): Promise<string> {
  const texto = String(crudo ?? '');

  // Placeholder sin resolver → se trata como un saludo. Ella SÍ escribió algo
  // (ManyChat disparó la petición), pero la variable llegó rota y su texto se
  // perdió: abrir con la entrada de saludo es lo único honesto que se puede
  // hacer. Guardar «{{last_input_text}}» en el historial —lo que pasaba— deja
  // al modelo contestándole a un placeholder.
  if (PLACEHOLDER_RE.test(texto)) return 'Hola';

  // Audio como URL dentro del texto → al transcriptor que ya existía para
  // `audio_url`. El camino es el mismo; lo nuevo es encontrar la URL aquí.
  const audio = texto.match(URL_AUDIO_RE);
  if (audio) {
    const resto = texto.replace(URL_AUDIO_RE, ' ').replace(/\s+/g, ' ').trim();
    if (transcripcionDisponible()) {
      try {
        const transcrito = await transcribirAudio(audio[0]);
        if (transcrito) return [resto, transcrito].filter(Boolean).join('\n');
      } catch {
        // cae al evento mudo
      }
    }
    return [resto, EVENTO_AUDIO_MUDO].filter(Boolean).join('\n');
  }

  // Imagen → un evento nombrable.
  if (URL_IMAGEN_RE.test(texto)) {
    URL_IMAGEN_RE.lastIndex = 0;
    const resto = texto.replace(URL_IMAGEN_RE, ' ').replace(/\s+/g, ' ').trim();
    return [resto, EVENTO_IMAGEN].filter(Boolean).join('\n');
  }

  return texto;
}
