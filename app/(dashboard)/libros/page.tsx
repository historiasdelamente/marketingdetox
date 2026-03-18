import { AgentPageShell } from "@/components/agents/agent-page-shell";

export default function LibrosPage() {
  return (
    <AgentPageShell
      title="Libros Amazon & Hotmart"
      icon="LI"
      description="Genera libros completos de 30,000+ palabras para autopublicación"
      agentCount={8}
      outputType="Manuscritos .md/.pdf"
      agentType="libros"
      fields={[
        {
          name: "tema",
          label: "Tema del libro",
          type: "textarea",
          placeholder: "Ej: Dependencia emocional: cómo liberarte del apego ansioso...",
          required: true,
        },
        {
          name: "titulo",
          label: "Título propuesto (opcional)",
          type: "text",
          placeholder: "Si lo tienes claro, escríbelo aquí",
        },
        {
          name: "fase",
          label: "Fase de ejecución",
          type: "select",
          options: [
            { value: "full", label: "Pipeline completo" },
            { value: "investigation", label: "Solo investigación" },
            { value: "architecture", label: "Solo arquitectura" },
            { value: "writing", label: "Solo escritura" },
            { value: "editing", label: "Solo edición" },
          ],
        },
        {
          name: "plataforma",
          label: "Plataforma de publicación",
          type: "select",
          options: [
            { value: "kdp", label: "Amazon KDP" },
            { value: "hotmart", label: "Hotmart" },
            { value: "ambas", label: "Ambas" },
          ],
        },
      ]}
      steps={[
        "Investigador: analizando fuentes",
        "Arquitecto: diseñando estructura",
        "Escritor: redactando capítulos",
        "Editor: revisando y editando",
        "KDP Expert: optimizando para Amazon",
        "Fact Checker: verificando datos",
        "Generando manuscrito final",
        "Exportando PDF",
      ]}
    />
  );
}
