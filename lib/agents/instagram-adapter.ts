import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";

async function runInstagram(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { tema, formato, audiencia } = params;
  const tipo = formato || "carousel";

  // Step 1: Director plans the content
  const directorPrompt = loadPrompt("instagram", "01_director_instagram");
  onProgress("Director: planificando contenido Instagram", 10);
  const plan = await callClaudeCli(
    `TEMA: ${tema}\nFORMATO: ${tipo}\nAUDIENCIA: ${audiencia || "Mujeres hispanohablantes 25-65 años"}\n\nPlanifica el contenido de Instagram según el formato solicitado.`,
    { systemPrompt: directorPrompt, model: "sonnet" }
  );

  // Step 2: Generate specific format
  let content: string;
  const promptMap: Record<string, string> = {
    carousel: "02_carousels",
    reels: "03_reels",
    stories: "04_stories",
  };

  const promptFile = promptMap[tipo] || "02_carousels";
  const formatoPrompt = loadPrompt("instagram", promptFile);

  onProgress(`Generando ${tipo}`, 50);
  content = await callClaudeCli(
    `PLAN DEL DIRECTOR:\n${plan}\n\nTEMA: ${tema}\n\nGenera el contenido completo para ${tipo} de Instagram.`,
    { systemPrompt: formatoPrompt, model: "opus" }
  );

  onProgress("Completado", 100);

  const finalContent = `# Instagram ${tipo}: ${tema}\n\n---\n\n## PLAN\n${plan}\n\n---\n\n## CONTENIDO\n${content}`;

  return {
    content: finalContent,
    title: `instagram-${tipo}-${tema.substring(0, 40)}`,
    fileType: "md",
  };
}

registerRunner("instagram", runInstagram);
