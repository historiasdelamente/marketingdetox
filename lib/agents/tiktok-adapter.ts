import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";

async function runTikTok(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { tema, categoria, tipo } = params;

  // Load prompts
  const orquestadorPrompt = loadPrompt("tiktok", "01_orquestador");
  const investigadorPrompt = loadPrompt("tiktok", "02_investigador");
  const viralPrompt = loadPrompt("tiktok", "03_viral_tiktok");
  const depuradorPrompt = loadPrompt("tiktok", "04_depurador");
  const descripcionesPrompt = loadPrompt("tiktok", "05_descripciones");
  const voiceoverPrompt = loadPrompt("tiktok", "06_voiceover");
  const contadorPrompt = loadPrompt("tiktok", "10_contador_calidad");

  const isSerie = tipo === "serie";

  // Step 1: Orquestador plans the content
  onProgress("Orquestador: planificando contenido", 5);
  const plan = await callClaudeCli(
    `Tema: ${tema}\nCategoría: ${categoria}\nTipo: ${isSerie ? "Serie de 3-7 partes" : "Video individual"}\n\nPlanifica el contenido según las instrucciones.`,
    { systemPrompt: orquestadorPrompt, model: "haiku" }
  );

  // Step 2: Investigador consults knowledge base
  onProgress("Investigador: consultando base de conocimiento", 20);
  const investigacion = await callClaudeCli(
    `PLAN DEL ORQUESTADOR:\n${plan}\n\nTEMA: ${tema}\nCATEGORÍA: ${categoria}\n\nInvestiga y proporciona el fundamento clínico y científico.`,
    { systemPrompt: investigadorPrompt, model: "sonnet" }
  );

  // Step 3: Viral TikTok optimizes for virality
  onProgress("Viral TikTok: optimizando para viralidad", 40);
  const viralContent = await callClaudeCli(
    `PLAN:\n${plan}\n\nINVESTIGACIÓN:\n${investigacion}\n\nTEMA: ${tema}\n\nCrea el script viral con la estructura: gancho devastador + ancla de retención + desarrollo + cierre con CTA.`,
    { systemPrompt: viralPrompt, model: "opus" }
  );

  // Step 4: Depurador cleans format
  onProgress("Depurador: limpiando formato", 55);
  const depurado = await callClaudeCli(
    `Limpia el siguiente contenido eliminando títulos, emojis, marcas de tiempo, y cualquier formato que no sea texto puro para lectura en voz alta:\n\n${viralContent}`,
    { systemPrompt: depuradorPrompt, model: "haiku" }
  );

  // Step 5: Descripciones generates caption + hashtags
  onProgress("Descripciones: generando caption + hashtags", 70);
  const descripcion = await callClaudeCli(
    `CONTENIDO DEL VIDEO:\n${depurado}\n\nTEMA: ${tema}\n\nGenera la descripción/caption + 5 hashtags (el primero siempre #historiasdelamente).`,
    { systemPrompt: descripcionesPrompt, model: "haiku" }
  );

  // Step 6: Voiceover adapts for reading
  onProgress("Voiceover: adaptando para lectura en voz alta", 82);
  const voiceover = await callClaudeCli(
    `CONTENIDO DEPURADO:\n${depurado}\n\nAdapta este contenido para que sea leído como voiceover de manera natural y fluida.`,
    { systemPrompt: voiceoverPrompt, model: "sonnet" }
  );

  // Step 7: Contador verifies word count and duration
  onProgress("Contador: verificando palabras y duración", 92);
  const calidad = await callClaudeCli(
    `VOICEOVER FINAL:\n${voiceover}\n\nVerifica que el contenido tenga entre 350-700 palabras y una duración estimada de 2-4 minutos a 120-130 ppm. Si necesita ajustes, indícalos.`,
    { systemPrompt: contadorPrompt, model: "haiku" }
  );

  onProgress("Completado", 100);

  const finalContent = `# TikTok: ${tema}
## Categoría: ${categoria}

---

## VOICEOVER FINAL

${voiceover}

---

## DESCRIPCIÓN + HASHTAGS

${descripcion}

---

## VERIFICACIÓN DE CALIDAD

${calidad}
`;

  return {
    content: finalContent,
    title: tema.substring(0, 60),
    fileType: "md",
  };
}

// Register on import
registerRunner("tiktok", runTikTok);
