import { AgentPageShell } from "@/components/agents/agent-page-shell";

export default function TikTokPage() {
  return (
    <AgentPageShell
      title="TikTok Textos"
      icon="TT"
      description="Genera scripts virales de TikTok de 2-4 minutos sobre narcisismo, apego y sanación"
      agentCount={10}
      outputType="Scripts .md"
      agentType="tiktok"
      fields={[
        {
          name: "tema",
          label: "Tema del TikTok",
          type: "textarea",
          placeholder: "Ej: Cómo detectar el trauma bonding en tu relación...",
          required: true,
        },
        {
          name: "categoria",
          label: "Categoría",
          type: "select",
          options: [
            { value: "narcisismo", label: "Narcisismo" },
            { value: "apego", label: "Apego" },
            { value: "nina_interior", label: "Niña Interior" },
            { value: "recuperacion", label: "Recuperación" },
            { value: "trauma_bonding", label: "Trauma Bonding" },
          ],
          required: true,
        },
        {
          name: "tipo",
          label: "Tipo de contenido",
          type: "select",
          options: [
            { value: "individual", label: "Video individual" },
            { value: "serie", label: "Serie (3-7 partes)" },
          ],
        },
      ]}
      steps={[
        "Orquestador: planificando",
        "Investigador: consultando base de conocimiento",
        "Viral TikTok: optimizando para viralidad",
        "Depurador: limpiando formato",
        "Descripciones: generando caption + hashtags",
        "Voiceover: adaptando para lectura en voz alta",
        "Contador: verificando palabras y duración",
      ]}
    />
  );
}
