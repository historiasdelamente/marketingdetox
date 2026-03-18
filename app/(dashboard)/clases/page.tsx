import { AgentPageShell } from "@/components/agents/agent-page-shell";

export default function ClasesPage() {
  return (
    <AgentPageShell
      title="Clases en Vivo"
      icon="CL"
      description="Genera guiones completos para clases del programa Apego Detox"
      agentCount={7}
      outputType="Guiones .md/.pdf"
      agentType="clases"
      fields={[
        {
          name: "clase_num",
          label: "Número de clase",
          type: "select",
          options: [
            { value: "1", label: "Clase 1" },
            { value: "2", label: "Clase 2" },
            { value: "3", label: "Clase 3" },
            { value: "custom", label: "Clase personalizada" },
          ],
          required: true,
        },
        {
          name: "comando",
          label: "Comando específico (o flujo completo)",
          type: "select",
          options: [
            { value: "completo", label: "Flujo completo (7 agentes)" },
            { value: "dolor", label: "/dolor - Mapa de dolor emocional" },
            { value: "storytelling", label: "/storytelling - Historias y metáforas" },
            { value: "producto", label: "/producto - Beneficios del programa" },
            { value: "cta", label: "/cta - Llamados a acción" },
            { value: "guion", label: "/guion - Ensamblar guión final" },
            { value: "slides", label: "/slides - Diapositivas" },
          ],
        },
        {
          name: "brief",
          label: "Brief / Contexto adicional",
          type: "textarea",
          placeholder: "Contexto específico para esta clase...",
        },
      ]}
      steps={[
        "DOLOR: mapeando puntos emocionales",
        "STORYTELLING: generando historias y metáforas",
        "PRODUCTO: definiendo beneficios",
        "CTA: creando llamados a acción",
        "ESTRUCTURA: ensamblando guión",
        "SLIDES: generando diapositivas",
        "VALIDACIÓN: control de calidad de voz",
      ]}
    />
  );
}
