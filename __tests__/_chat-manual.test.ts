/**
 * BANCO DE PRUEBAS DE PAULA — conversación real contra el modelo real.
 *
 * NO es un test: es un simulador para hablar con Paula antes de desplegarla.
 * Corre el pipeline COMPLETO de `processPaulaMessage` (prompt → gpt-4.1-mini →
 * blindaje → reintento → formato → globos) con la única diferencia de que el
 * estado vive en un JSON local en vez de Supabase. Así se puede probar sin
 * tocar producción y sin ensuciar la base con conversaciones falsas.
 *
 * Uso:
 *   $env:MSG="hola"; npx vitest run __tests__/_chat-manual.test.ts
 *   $env:RESET="1"   → empieza una conversación nueva
 *   $env:PAIS="+52…" → simula que escribe desde otro país
 *
 * Lee la conversación de `chat-estado.json` y escribe lo que ella vería en
 * `chat-salida.txt`.
 */
import fs from 'fs';
import path from 'path';
import { describe, it } from 'vitest';

import {
  auditarRespuesta,
  dejarSoloJavier,
  instruccionCorreccion,
  motivoHandoff,
  quitarVentaEnCrisis,
} from '@/lib/whatsapp/blindaje';
import { escalonDe } from '@/lib/whatsapp/escalera';
import { aplicarFormato } from '@/lib/whatsapp/formato';
import { normalizarNegritas, partirEnGlobos } from '@/lib/whatsapp/manychat';
import { tasas } from '@/lib/whatsapp/moneda';
import { cifrasLocalesValidas, diasTallerPara, precioApego } from '@/lib/whatsapp/programa';
import { extraerDatosParaPrueba } from '@/lib/whatsapp/paula';
import { buildSystemPrompt, callOpenRouter, type WaUser } from '@/lib/whatsapp/paula';

// --- .env.local a mano: vitest no lo carga como sí hace Next ---
// Envuelto en un try porque `vitest.config.ts` incluye TODOS los archivos de
// __tests__: sin esto, una máquina sin .env.local (CI) reventaría al importar
// este archivo aunque su único test esté saltado.
try {
  for (const linea of fs.readFileSync('.env.local', 'utf-8').split('\n')) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
} catch {
  // sin .env.local no hay conversación posible; el test se salta igualmente
}

const ESTADO = path.join(process.cwd(), 'chat-estado.json');
const SALIDA = path.join(process.cwd(), 'chat-salida.txt');

type Estado = {
  historial: Array<{ role: 'user' | 'assistant'; content: string }>;
  usuaria: WaUser;
};

const nuevo = (): Estado => ({
  historial: [],
  usuaria: {
    id: 1,
    manychat_id: 'prueba-javier-001',
    name: null,
    funnel_stage: 'new_lead',
    situacion_resumen: null,
    first_contact: '',
    last_interaction: '',
    conversation_count: 0,
    pais: null,
  },
});

function cargar(): Estado {
  if (process.env.RESET === '1' || !fs.existsSync(ESTADO)) return nuevo();
  return JSON.parse(fs.readFileSync(ESTADO, 'utf-8')) as Estado;
}

/** Las marcas ocultas que emite el modelo y que ella nunca ve. */
const sinMarcas = (t: string) =>
  (t || '').replace(/\[\[\s*(COMPRA|NO_MOLESTAR|LEAD:[^\]]*)\s*\]\]/gi, '').replace(/\n{3,}/g, '\n\n').trim();

describe('conversación manual con Paula', () => {
  // Solo corre cuando se le pasa un mensaje a mano. En la suite normal se
  // salta: gasta tokens de verdad y depende de la red.
  it.skipIf(!process.env.MSG)('responde como en producción', async () => {
    const mensaje = process.env.MSG as string;

    const estado = cargar();
    const paisPrevio = estado.usuaria.pais;
    const telefono = process.env.PAIS || '+573001112233';
    const ahora = new Date();
    const out: string[] = [];

    const handoff = motivoHandoff(mensaje);
    const escalon = escalonDe();
    const esPrimerTurno = !estado.historial.some((m) => m.role === 'assistant');
    const tabla = await tasas();

    // MEMORIA — igual que en producción. Sin esto el simulador mentía: no sacaba
    // el país que ella dice por texto ni el resumen de su situación, así que
    // probaba un bot más tonto del que corre de verdad.
    const datos = await extraerDatosParaPrueba(estado.historial, mensaje, {
      nombre: estado.usuaria.name,
      pais: estado.usuaria.pais,
      resumen: estado.usuaria.situacion_resumen,
    });
    if (datos) {
      if (!estado.usuaria.name && datos.nombre) estado.usuaria.name = datos.nombre;
      if (datos.pais) estado.usuaria.pais = datos.pais;
      if (datos.resumen) estado.usuaria.situacion_resumen = datos.resumen;
      out.push(`🧠 MEMORIA: nombre=${estado.usuaria.name ?? '—'} · país=${estado.usuaria.pais ?? '—'}`);
      if (estado.usuaria.situacion_resumen) out.push(`   resumen: ${estado.usuaria.situacion_resumen}\n`);
    }

    const systemPrompt = buildSystemPrompt(estado.usuaria, 'tiktok', telefono, {
      ahora,
      handoff: handoff ?? undefined,
      escalon,
      esPrimerTurno,
      tasas: tabla,
    });

    const mensajes = [...estado.historial, { role: 'user', content: mensaje }];
    let respuesta = await callOpenRouter(systemPrompt, mensajes);

    // Blindaje + reintento, igual que en producción. Los días del taller van en
    // la zona de ELLA: sin esto el simulador audita con las reglas de Colombia y
    // marca como error el día que es correcto para una mujer de Madrid.
    const diasTaller = diasTallerPara(ahora, telefono, estado.usuaria.pais);
    const cifras = cifrasLocalesValidas(precioApego(ahora).monto, tabla);
    let auditoria = auditarRespuesta(sinMarcas(respuesta), ahora, escalon, diasTaller, cifras);
    if (auditoria.hallazgos.length > 0) {
      out.push(`⚠️  BLINDAJE: ${auditoria.hallazgos.map((h) => `${h.tipo} («${h.detalle}»)`).join(', ')}`);
      out.push('   → se le pidió reescribir\n');
      const reintento = await callOpenRouter(systemPrompt, [
        ...mensajes,
        { role: 'assistant', content: respuesta },
        { role: 'user', content: instruccionCorreccion(auditoria.hallazgos, escalon, ahora, diasTaller, cifras) },
      ]);
      const segunda = auditarRespuesta(sinMarcas(reintento), ahora, escalon, diasTaller, cifras);
      if (segunda.texto && segunda.hallazgos.length <= auditoria.hallazgos.length) {
        respuesta = reintento;
        auditoria = segunda;
      }
      if (auditoria.hallazgos.length > 0) {
        out.push(`⚠️  TRAS EL REINTENTO QUEDA: ${auditoria.hallazgos.map((h) => h.tipo).join(', ')}\n`);
      }
    }

    let final = aplicarFormato(normalizarNegritas(auditoria.texto, 'whatsapp'));
    if (handoff === 'pregunta_clase') final = aplicarFormato(dejarSoloJavier(final));
    if (handoff === 'crisis') final = quitarVentaEnCrisis(final);

    if (handoff) out.push(`🔀 HANDOFF detectado: ${handoff}\n`);

    out.push(`👩 ELLA: ${mensaje}\n`);
    partirEnGlobos(final).forEach((g, i) => out.push(`💛 PAULA [globo ${i + 1}]: ${g}`));

    estado.historial.push({ role: 'user', content: mensaje }, { role: 'assistant', content: final });
    fs.writeFileSync(ESTADO, JSON.stringify(estado, null, 2));
    fs.writeFileSync(SALIDA, out.join('\n'));
  }, 60_000);
});
