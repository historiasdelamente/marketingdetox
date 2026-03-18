import { AgentPageShell } from "@/components/agents/agent-page-shell";

export default function TalleresPage() {
  return (
    <AgentPageShell
      title="Talleres Vivenciales"
      icon="TA"
      description="Genera talleres de 90 minutos con metáforas y dinámicas transformacionales"
      agentCount={7}
      outputType="Guión + Mapa + Material"
      agentType="talleres"
      fields={[
        {
          name: "tema",
          label: "Tema del taller",
          type: "textarea",
          placeholder: "Ej: Refuerzo intermitente y cómo romper el ciclo...",
          required: true,
        },
        {
          name: "version",
          label: "Versión de agentes",
          type: "select",
          options: [
            { value: "v2", label: "V2 - Optimizada (7 agentes)" },
            { value: "v1", label: "V1 - Completa (16 agentes)" },
          ],
        },
        {
          name: "categoria_metafora",
          label: "Tipo de metáfora central",
          type: "select",
          options: [
            { value: "auto", label: "Automático (recomendado)" },
            { value: "naturaleza", label: "Parábola de naturaleza" },
            { value: "humana", label: "Parábola humana" },
            { value: "arquitectonica", label: "Parábola arquitectónica" },
            { value: "cuento", label: "Cuento oscuro / Fábula invertida" },
          ],
        },
      ]}
      steps={[
        "Orquestador: analizando tema",
        "Investigador: consultando base de conocimiento",
        "Metáfora: creando historia central (800-1500 palabras)",
        "Estructura: diseñando los 5 bloques del taller",
        "Escritor: redactando guión del instructor",
        "Calidad: validando contenido",
        "Generando mapa del taller",
        "Generando material de participante",
        "Exportando PDFs",
      ]}
    />
  );
}
