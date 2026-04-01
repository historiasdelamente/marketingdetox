import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";

async function runGuardian(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { enfoque } = params;

  const guardianPrompt = loadPrompt("guardian-conocimiento", "01_guardian");

  // Step 1: Audit knowledge base
  onProgress("Guardián: auditando base de conocimiento", 10);
  const auditoria = await callClaudeCli(
    `ENFOQUE: ${enfoque || "auditoría completa"}\n\nRealiza una auditoría completa de la base de conocimiento:\n1. Verifica coherencia entre prompts y base de conocimiento\n2. Identifica técnicas sobre-utilizadas y sub-utilizadas\n3. Detecta gaps en la cobertura temática\n4. Genera recomendaciones de rotación de técnicas\n5. Produce resumen ejecutivo del estado de la base`,
    { systemPrompt: guardianPrompt, model: "opus" }
  );

  onProgress("Completado", 100);

  return {
    content: auditoria,
    title: `auditoria-guardian-${new Date().toISOString().split("T")[0]}`,
    fileType: "md",
  };
}

registerRunner("guardian", runGuardian);
