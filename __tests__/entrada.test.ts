import { describe, expect, it, vi } from 'vitest';

// El transcriptor se simula: estos tests son de ruteo, no de Whisper.
vi.mock('@/lib/whatsapp/audio', () => ({
  transcripcionDisponible: vi.fn(() => false),
  transcribirAudio: vi.fn(async () => null),
}));

import { EVENTO_AUDIO_MUDO, EVENTO_IMAGEN, higienizarEntrada } from '@/lib/whatsapp/entrada';
import { transcribirAudio, transcripcionDisponible } from '@/lib/whatsapp/audio';

// ============================================================================
// HIGIENE DE ENTRADA — los tres casos reales que la motivaron (agosto 2026):
// el placeholder de Mayra, la nota de voz de Magda que llegó como URL dentro
// del texto y recibió el folleto por respuesta, y la imagen ignorada de Sandra.
// ============================================================================

describe('higiene — placeholder de ManyChat', () => {
  it('«{{last_input_text}}» se trata como saludo, nunca entra literal', async () => {
    expect(await higienizarEntrada('{{last_input_text}}')).toBe('Hola');
    expect(await higienizarEntrada('  {{cuf_11111}}  ')).toBe('Hola');
  });

  it('llaves DENTRO de un texto real no disparan nada', async () => {
    const t = 'me dijo {{textual}} que estaba loca';
    expect(await higienizarEntrada(t)).toBe(t);
  });
});

describe('higiene — audio como URL dentro del texto (caso Magda)', () => {
  const OGG = 'https://manybot-files.s3.eu-central-1.amazonaws.com/x/wa/original_abc.ogg';

  it('sin transcriptor: la URL desaparece y queda el evento nombrable', async () => {
    const out = await higienizarEntrada(OGG);
    expect(out).toBe(EVENTO_AUDIO_MUDO);
    expect(out).not.toContain('http');
  });

  it('con transcriptor: entra TRANSCRITO, sin mentirle que no se pudo oír', async () => {
    vi.mocked(transcripcionDisponible).mockReturnValueOnce(true);
    vi.mocked(transcribirAudio).mockResolvedValueOnce('ya lo dejé pero él me busca');
    const out = await higienizarEntrada(OGG);
    expect(out).toBe('ya lo dejé pero él me busca');
    expect(out).not.toContain(EVENTO_AUDIO_MUDO);
  });

  it('texto + audio: el texto de ella se conserva delante', async () => {
    const out = await higienizarEntrada(`les cuento ${OGG}`);
    expect(out).toContain('les cuento');
    expect(out).toContain(EVENTO_AUDIO_MUDO);
  });
});

describe('higiene — imagen (caso Sandra)', () => {
  it('la URL de imagen se vuelve [IMAGEN], nunca S3 crudo al historial', async () => {
    const out = await higienizarEntrada(
      'https://manybot-files.s3.eu-central-1.amazonaws.com/x/wa/original_a1.webp',
    );
    expect(out).toBe(EVENTO_IMAGEN);
    expect(out).not.toContain('http');
  });
});

describe('higiene — texto normal pasa intacto', () => {
  it.each([
    'Hola vengo de TikTok',
    'Ya lo dejé y quiero recuperarme',
    'Marthamonica730@gmail.com',
    '🙏🙏',
  ])('«%s» no se toca', async (t) => {
    expect(await higienizarEntrada(t)).toBe(t);
  });
});
