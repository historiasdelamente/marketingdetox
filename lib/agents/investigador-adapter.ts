import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";

async function runInvestigador(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { tema, area } = params;

  // Step 1: Search for updates
  const buscadorPrompt = loadPrompt("investigador-cientifico", "01_buscador_actualizaciones");
  onProgress("Buscador: rastreando actualizaciones científicas", 10);
  const hallazgos = await callClaudeCli(
    `TEMA: ${tema}\nÁREA: ${area || "psicología clínica, apego, narcisismo, trauma"}\n\nBusca las últimas actualizaciones científicas relevantes.`,
    { systemPrompt: buscadorPrompt, model: "sonnet", webSearch: true }
  );

  // Step 2: Synthesize findings
  const sintetizadorPrompt = loadPrompt("investigador-cientifico", "02_sintetizador");
  onProgress("Sintetizador: organizando hallazgos", 45);
  const sintesis = await callClaudeCli(
    `HALLAZGOS DEL BUSCADOR:\n${hallazgos}\n\nTEMA: ${tema}\n\nSintetiza los hallazgos en formato estructurado para la base de conocimiento.`,
    { systemPrompt: sintetizadorPrompt, model: "sonnet" }
  );

  // Step 3: Integrate into knowledge base
  const integradorPrompt = loadPrompt("investigador-cientifico", "03_integrador_base");
  onProgress("Integrador: preparando para base de conocimiento", 80);
  const integracion = await callClaudeCli(
    `SÍNTESIS:\n${sintesis}\n\nTEMA: ${tema}\n\nPrepara la integración de estos hallazgos en la base de conocimiento existente. Indica qué documentos actualizar y qué técnicas nuevas agregar.`,
    { systemPrompt: integradorPrompt, model: "sonnet" }
  );

  onProgress("Completado", 100);

  const finalContent = `# Investigación Científica: ${tema}\n\n---\n\n## HALLAZGOS\n${hallazgos}\n\n---\n\n## SÍNTESIS\n${sintesis}\n\n---\n\n## PLAN DE INTEGRACIÓN\n${integracion}`;

  return {
    content: finalContent,
    title: `research-${tema.substring(0, 50)}`,
    fileType: "md",
  };
}

registerRunner("investigador", runInvestigador);
