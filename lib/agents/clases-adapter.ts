import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";

async function runClases(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { clase_num = "1", comando = "completo", brief = "" } = params;

  // Load prompts from the clases folder
  const dolorPrompt = loadPrompt("clases", "dolor");
  const storytellingPrompt = loadPrompt("clases", "storytelling");
  const productoPrompt = loadPrompt("clases", "producto");
  const ctaPrompt = loadPrompt("clases", "cta-conversion");
  const estructuraPrompt = loadPrompt("clases", "estructura-guion");

  const claseContext = `CLASE NÚMERO: ${clase_num}\n${brief ? `BRIEF: ${brief}` : ""}`;

  const results: Record<string, string> = {};

  const runStep = async (
    name: string,
    prompt: string,
    message: string,
    model: "sonnet" | "opus",
    pct: number,
    label: string
  ) => {
    onProgress(label, pct);
    results[name] = await callClaudeCli(message, { systemPrompt: prompt, model });
  };

  if (comando === "completo" || comando === "dolor") {
    await runStep("dolor", dolorPrompt,
      `${claseContext}\n\nMapea los puntos de dolor emocional de la audiencia para la Clase ${clase_num}. Incluye la curva de intensidad emocional.`,
      "opus", 5, "DOLOR: mapeando puntos emocionales"
    );
    if (comando === "dolor") {
      onProgress("Completado", 100);
      return { content: results.dolor, title: `clase${clase_num}-dolor`, fileType: "md" };
    }
  }

  if (comando === "completo" || comando === "storytelling") {
    await runStep("storytelling", storytellingPrompt,
      `${claseContext}\n\nMAPAS DE DOLOR:\n${results.dolor || "(no disponible)"}\n\nGenera las historias, metáforas y narrativas para la Clase ${clase_num}.`,
      "opus", 20, "STORYTELLING: generando historias y metáforas"
    );
    if (comando === "storytelling") {
      onProgress("Completado", 100);
      return { content: results.storytelling, title: `clase${clase_num}-storytelling`, fileType: "md" };
    }
  }

  if (comando === "completo" || comando === "producto") {
    await runStep("producto", productoPrompt,
      `${claseContext}\n\nDefine los beneficios reales del programa Apego Detox para la Clase ${clase_num}.`,
      "sonnet", 35, "PRODUCTO: definiendo beneficios"
    );
    if (comando === "producto") {
      onProgress("Completado", 100);
      return { content: results.producto, title: `clase${clase_num}-producto`, fileType: "md" };
    }
  }

  if (comando === "completo" || comando === "cta") {
    await runStep("cta", ctaPrompt,
      `${claseContext}\n\nDOLOR:\n${results.dolor || ""}\n\nSTORYTELLING:\n${results.storytelling || ""}\n\nPRODUCTO:\n${results.producto || ""}\n\nCrea los momentos de llamado a acción emocionales para la Clase ${clase_num}.`,
      "sonnet", 50, "CTA: creando llamados a acción"
    );
    if (comando === "cta") {
      onProgress("Completado", 100);
      return { content: results.cta, title: `clase${clase_num}-cta`, fileType: "md" };
    }
  }

  if (comando === "completo" || comando === "guion") {
    await runStep("guion", estructuraPrompt,
      `${claseContext}\n\nDOLOR:\n${results.dolor || ""}\n\nSTORYTELLING:\n${results.storytelling || ""}\n\nPRODUCTO:\n${results.producto || ""}\n\nCTA:\n${results.cta || ""}\n\nEnsambla el guión final completo para la Clase ${clase_num}, palabra por palabra.`,
      "opus", 65, "ESTRUCTURA: ensamblando guión"
    );
    if (comando === "guion") {
      onProgress("Completado", 100);
      return { content: results.guion, title: `clase${clase_num}-guion`, fileType: "md" };
    }
  }

  onProgress("Completado", 100);

  const finalContent = `# Guión Clase ${clase_num} - Apego Detox

---

## MAPA DE DOLOR

${results.dolor || "(no generado)"}

---

## STORYTELLING

${results.storytelling || "(no generado)"}

---

## PRODUCTO

${results.producto || "(no generado)"}

---

## CTA / CONVERSIÓN

${results.cta || "(no generado)"}

---

## GUIÓN FINAL

${results.guion || "(no generado)"}
`;

  return {
    content: finalContent,
    title: `clase${clase_num}-completo`,
    fileType: "md",
  };
}

registerRunner("clases", runClases);
