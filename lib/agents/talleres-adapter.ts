import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";

async function runTalleres(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { tema, version = "v2", categoria_metafora = "auto" } = params;

  const promptFolder = version === "v1" ? "talleres" : "talleres";
  // Load the main orchestrator prompt
  let mainPrompt: string;
  try {
    mainPrompt = loadPrompt(promptFolder, "00_orquestador_talleres");
  } catch {
    try {
      mainPrompt = loadPrompt(promptFolder, "01_director");
    } catch {
      mainPrompt = "Eres un orquestador de talleres vivenciales de 90 minutos sobre psicología del apego y trauma relacional.";
    }
  }

  // Step 1: Analyze theme and plan
  onProgress("Orquestador: analizando tema", 5);
  const plan = await callClaudeCli(
    `TEMA DEL TALLER: ${tema}\nTIPO DE METÁFORA: ${categoria_metafora}\n\nAnaliza el tema y planifica la estructura del taller de 90 minutos con los 5 bloques: LA HISTORIA, EL ESPEJO, EL QUIEBRE, LA GRIETA, EL ANCLA.`,
    { systemPrompt: mainPrompt, model: "sonnet" }
  );

  // Step 2: Create central metaphor
  onProgress("Creando metáfora central (800-1500 palabras)", 15);
  let metaforaPrompt: string;
  try {
    metaforaPrompt = loadPrompt(promptFolder, "13_generador_metaforas");
  } catch {
    metaforaPrompt = mainPrompt;
  }
  const metafora = await callClaudeCli(
    `PLAN DEL TALLER:\n${plan}\nTEMA: ${tema}\nTIPO DE METÁFORA: ${categoria_metafora}\n\nCrea la metáfora/historia central del taller (800-1500 palabras). Debe ser una parábola poderosa que conecte emocionalmente.`,
    { systemPrompt: metaforaPrompt, model: "opus" }
  );

  // Step 3: Write the instructor script (6000+ words)
  onProgress("Redactando guión del instructor (6000+ palabras)", 30);
  const guion = await callClaudeCli(
    `PLAN:\n${plan}\n\nMETÁFORA CENTRAL:\n${metafora}\n\nTEMA: ${tema}\n\nRedacta el GUIÓN COMPLETO DEL INSTRUCTOR para los 90 minutos. Incluye:\n- Los 5 bloques completos (LA HISTORIA, EL ESPEJO, EL QUIEBRE, LA GRIETA, EL ANCLA)\n- Instrucciones de voz en cada bloque\n- 8+ frases de validación pre-escritas\n- 4+ micro-metáforas como anclas emocionales\n- Preguntas devastadoras\n- Notas para facilitador\n- Mínimo 6,000 palabras.`,
    { systemPrompt: mainPrompt, model: "opus" }
  );

  // Step 4: Quality validation
  onProgress("Validando calidad del contenido", 60);
  const validacion = await callClaudeCli(
    `GUIÓN A VALIDAR:\n${guion}\n\nValida que este guión cumple con:\n- Mínimo 6,000 palabras\n- 5 bloques completos\n- 8+ frases de validación\n- 4+ micro-metáforas\n- Instrucciones de voz\n- Preguntas devastadoras\n\nSi falta algo, señálalo claramente.`,
    { systemPrompt: mainPrompt, model: "haiku" }
  );

  // Step 5: Generate workshop map
  onProgress("Generando mapa del taller", 72);
  const mapa = await callClaudeCli(
    `GUIÓN COMPLETO:\n${guion}\n\nTEMA: ${tema}\n\nCrea el MAPA DEL TALLER (1-2 páginas): resumen ejecutivo con tiempos, objetivos de cada bloque, materiales necesarios, y checklist técnico para Google Meet.`,
    { systemPrompt: mainPrompt, model: "haiku" }
  );

  // Step 6: Generate participant material
  onProgress("Generando material de participante", 85);
  const material = await callClaudeCli(
    `GUIÓN COMPLETO:\n${guion}\n\nTEMA: ${tema}\n\nCrea el MATERIAL DE PARTICIPANTE (4 páginas): ejercicios prácticos, preguntas de reflexión, espacio para escritura, herramientas para llevar a casa.`,
    { systemPrompt: mainPrompt, model: "sonnet" }
  );

  onProgress("Completado", 100);

  const finalContent = `# Taller Vivencial: ${tema}
## Duración: 90 minutos

---

# DOCUMENTO 1: GUIÓN DEL INSTRUCTOR

${guion}

---

## VALIDACIÓN DE CALIDAD

${validacion}

---

# DOCUMENTO 2: MAPA DEL TALLER

${mapa}

---

# DOCUMENTO 3: MATERIAL DE PARTICIPANTE

${material}
`;

  return {
    content: finalContent,
    title: tema.substring(0, 60),
    fileType: "md",
  };
}

registerRunner("talleres", runTalleres);
