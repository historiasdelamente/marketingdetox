import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";
import * as fs from "fs";
import * as path from "path";

const SORA_OUTPUT_DIR = "C:\\Users\\jivca\\OneDrive\\Documentos\\documentos_hechos\\videospromp_sora";

async function runSora(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { concepto, modo, tono, formato } = params;

  // Load prompts
  const analizadorPrompt = loadPrompt("sora", "01_analizador");
  const directorPrompt = loadPrompt("sora", "02_director_visual");
  const compositorPrompt = loadPrompt("sora", "03_compositor_prompt");
  const optimizadorPrompt = loadPrompt("sora", "04_optimizador");
  const variacionesPrompt = loadPrompt("sora", "05_variaciones");

  const modoLabel = modo === "invitacion" ? "INVITACIÓN A CLASE" : "DOLOR";

  // Step 1: Analizador decomposes the concept
  onProgress("Analizador: descomponiendo concepto visual", 5);
  const briefVisual = await callClaudeCli(
    `CONCEPTO: ${concepto}\nMODO: ${modoLabel}\nTONO EMOCIONAL: ${tono || "explosivo/raw"}\nFORMATO: ${formato || "9:16 vertical (TikTok/Reels)"}\nDURACIÓN: 15 segundos\n\nAnaliza este concepto y genera el brief visual completo para el modo ${modoLabel}.`,
    { systemPrompt: analizadorPrompt, model: "haiku" }
  );

  // Step 2: Director Visual creates cinematographic direction
  onProgress("Director Visual: creando dirección cinematográfica", 22);
  const direccionVisual = await callClaudeCli(
    `BRIEF VISUAL DEL ANALIZADOR:\n${briefVisual}\n\nCONCEPTO: ${concepto}\nMODO: ${modoLabel}\nTONO: ${tono || "explosivo/raw"}\n\nCrea la dirección visual cinematográfica completa: composición, iluminación natural, cámara, atmósfera. Video de 15 segundos con @historiasdelamente y la mujer colombiana.`,
    { systemPrompt: directorPrompt, model: "opus" }
  );

  // Step 3: Compositor writes the main Sora prompt
  onProgress("Compositor: escribiendo prompt principal para Sora", 45);
  const promptPrincipal = await callClaudeCli(
    `DIRECCIÓN VISUAL:\n${direccionVisual}\n\nCONCEPTO: ${concepto}\nMODO: ${modoLabel}\nTONO: ${tono || "explosivo/raw"}\nFORMATO: ${formato || "9:16 vertical"}\nDURACIÓN: 15s\n\nCompón el prompt principal optimizado para Sora en inglés. Recuerda: @historiasdelamente es personaje registrado, solo describe ropa y accesorios.`,
    { systemPrompt: compositorPrompt, model: "opus" }
  );

  // Step 4: Optimizador refines the prompt
  onProgress("Optimizador: refinando y validando prompt", 68);
  const promptOptimizado = await callClaudeCli(
    `PROMPT PRINCIPAL:\n${promptPrincipal}\n\nCONCEPTO: ${concepto}\nMODO: ${modoLabel}\nFORMATO: ${formato || "9:16 vertical"}\n\nOptimiza este prompt: valida checklist técnico de Sora, mejora vocabulario, verifica 15s/1080p/luz natural/photorealistic.`,
    { systemPrompt: optimizadorPrompt, model: "sonnet" }
  );

  // Step 5: Variaciones generates 3 alternatives
  onProgress("Variaciones: generando 3 alternativas creativas", 85);
  const variaciones = await callClaudeCli(
    `PROMPT OPTIMIZADO:\n${promptOptimizado}\n\nCONCEPTO: ${concepto}\nMODO: ${modoLabel}\nTONO: ${tono || "explosivo/raw"}\nFORMATO: ${formato || "9:16 vertical"}\n\nGenera 3 variaciones: scroll-stopper, cinematográfica e íntima/close-up. Cada una con outfit diferente y ambiente diferente.`,
    { systemPrompt: variacionesPrompt, model: "sonnet" }
  );

  onProgress("Guardando prompts en carpeta Sora", 95);

  const finalContent = `# Prompts Sora: ${concepto}
## Modo: ${modoLabel} | Tono: ${tono || "explosivo/raw"} | Formato: ${formato || "9:16 vertical"} | 15 segundos | 1080p

---

## BRIEF VISUAL

${briefVisual}

---

## DIRECCIÓN VISUAL CINEMATOGRÁFICA

${direccionVisual}

---

## PROMPT PRINCIPAL PARA SORA

${promptPrincipal}

---

## PROMPT OPTIMIZADO

${promptOptimizado}

---

## VARIACIONES

${variaciones}
`;

  // Save to Sora output folder
  if (!fs.existsSync(SORA_OUTPUT_DIR)) {
    fs.mkdirSync(SORA_OUTPUT_DIR, { recursive: true });
  }
  const timestamp = new Date().toISOString().slice(0, 10);
  const safeTitle = concepto.substring(0, 50).replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s-]/g, "").replace(/\s+/g, "-");
  const soraFilePath = path.join(SORA_OUTPUT_DIR, `${timestamp}_sora-${modo}-${safeTitle}.md`);
  fs.writeFileSync(soraFilePath, finalContent, "utf-8");

  onProgress("Completado", 100);

  return {
    content: finalContent,
    title: concepto.substring(0, 60),
    fileType: "md",
  };
}

// Register on import
registerRunner("sora", runSora);
