/**
 * BANCO DE PRUEBAS CONTRA EL MODELO REAL — no corre en la suite normal.
 *
 * Cuando toques el prompt de Paula, quítale el .skip y córrelo:
 *   npx vitest run __tests__/_auditoria-manual.test.ts
 * Manda 10 conversaciones reales a OpenRouter (gasta tokens), aplica el mismo
 * blindaje y reintento que producción, y deja el informe en auditoria-paula.txt.
 *
 * Así se cazaron: el folleto de 5 globos, los "15 módulos" que no existen, el
 * "¿quieres que te cuente más?" y el falso handoff de "¿y si no me funciona?".
 */
import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

import { buildSystemPrompt, callOpenRouter, type WaUser } from '@/lib/whatsapp/paula';
import { auditarRespuesta, instruccionCorreccion, motivoHandoff, instruccionHandoff } from '@/lib/whatsapp/blindaje';
import { normalizarNegritas, partirEnGlobos } from '@/lib/whatsapp/manychat';

// .env.local a mano: un script de vitest no pasa por Next.
const rutaEnv = path.join(process.cwd(), '.env.local');
const env = fs.existsSync(rutaEnv) ? fs.readFileSync(rutaEnv, 'utf-8') : '';
for (const linea of env.split('\n')) {
  const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const AHORA = new Date();
const TELEFONO_MX = '+521234567890';

const USUARIA: WaUser = {
  id: 1,
  manychat_id: 'audit',
  name: null,
  funnel_stage: 'new_lead',
  situacion_resumen: null,
  first_contact: '',
  last_interaction: '',
  conversation_count: 0,
};

const CASOS: Array<{ etiqueta: string; historial: Array<{ role: string; content: string }>; mensaje: string }> = [
  { etiqueta: '1. saludo pelado', historial: [], mensaje: 'hola' },
  { etiqueta: '2. pregunta el precio', historial: [], mensaje: 'hola, cuanto vale?' },
  {
    etiqueta: '3. le cuenta su dolor',
    historial: [],
    mensaje: 'llevo 3 meses sin dormir bien\nme dejo por otra\ny no puedo dejar de revisar su instagram',
  },
  {
    etiqueta: '4. INTENTA HACER TERAPIA',
    historial: [{ role: 'assistant', content: 'Uf, tres meses así agotan a cualquiera 💛' }],
    mensaje: 'pero explicame por que hace eso? me escribe y a los dos dias desaparece, no entiendo que le pasa. que hago cuando me escriba?',
  },
  { etiqueta: '5. QUIERE HABLAR CON JAVIER', historial: [], mensaje: 'quiero hablar con Javier' },
  { etiqueta: '6. pide terapia individual', historial: [], mensaje: 'hacen terapia individual? cuanto cuesta una cita con el psicologo' },
  { etiqueta: '7. SE SIENTE SOLA (comunidad)', historial: [], mensaje: 'me siento muy sola, nadie de mi familia entiende esto, ya me canse de explicarlo' },
  { etiqueta: '8. objeción "ya intenté todo"', historial: [], mensaje: 'y si no me funciona? ya intente de todo, terapia, libros, todo' },
  { etiqueta: '9. quiere entrar', historial: [], mensaje: 'ok me convenciste, como pago?' },
  { etiqueta: '10. dice que ya pagó', historial: [], mensaje: 'ya pague! y ahora?' },
];

describe.skip('auditoría manual contra el modelo', () => {
  it('conversaciones reales', { timeout: 300_000 }, async () => {
    const informe: string[] = [];

    for (const caso of CASOS) {
      const handoff = motivoHandoff(caso.mensaje);
      const prompt = buildSystemPrompt(USUARIA, 'tiktok_live', TELEFONO_MX, { ahora: AHORA, handoff });
      const mensajes = [...caso.historial, { role: 'user', content: caso.mensaje }];
      let cruda = await callOpenRouter(prompt, mensajes);
      let auditoria = auditarRespuesta(cruda.replace(/\[\[[^\]]*\]\]/g, '').trim(), AHORA);
      let reintentos = 0;

      // Mismo reintento que hace processPaulaMessage en producción.
      if (auditoria.hallazgos.length > 0) {
        reintentos = 1;
        const segunda = await callOpenRouter(prompt, [
          ...mensajes,
          { role: 'assistant', content: cruda },
          { role: 'user', content: instruccionCorreccion(auditoria.hallazgos) },
        ]);
        const auditoria2 = auditarRespuesta(segunda.replace(/\[\[[^\]]*\]\]/g, '').trim(), AHORA);
        if (auditoria2.texto && auditoria2.hallazgos.length <= auditoria.hallazgos.length) {
          cruda = segunda;
          auditoria = auditoria2;
        }
      }

      const { texto, hallazgos } = auditoria;
      const final = normalizarNegritas(texto, 'whatsapp');
      const globos = partirEnGlobos(final);
      const largo = final.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim().length;

      informe.push(
        `\n${'─'.repeat(70)}\n${caso.etiqueta}` +
          (handoff ? `   [handoff: ${handoff}]` : '') +
          `\nELLA: ${caso.mensaje.replace(/\n/g, ' / ')}\n` +
          globos.map((g, i) => `  PAULA ${i + 1}: ${g}`).join('\n') +
          `\n  → ${globos.length} globos · ${largo} chars · hallazgos: ${hallazgos.map((h) => h.tipo).join(', ') || 'ninguno'}`,
      );
    }

    informe.push(`\n${'─'.repeat(70)}\nHANDOFF:\n${instruccionHandoff('pide_humano')}`);
    fs.writeFileSync(path.join(process.cwd(), 'auditoria-paula.txt'), informe.join('\n'), 'utf-8');
    expect(informe.length).toBeGreaterThanOrEqual(CASOS.length);
  });
});
