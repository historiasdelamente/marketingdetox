import { AgentPageShell } from "@/components/agents/agent-page-shell";

const TEMAS = [
  { value: "1", label: "1. Cómo Detectar a un Narcisista" },
  { value: "2", label: "2. El Vínculo Traumático" },
  { value: "3", label: "3. Apego Ansioso y Narcisismo" },
  { value: "4", label: "4. TEPT Complejo" },
  { value: "5", label: "5. La Niña Interior Herida" },
  { value: "6", label: "6. Contacto Cero" },
  { value: "7", label: "7. Gaslighting" },
  { value: "8", label: "8. Love Bombing" },
  { value: "9", label: "9. Hoovering" },
  { value: "10", label: "10. Triangulación" },
  { value: "11", label: "11. Refuerzo Intermitente" },
  { value: "12", label: "12. Codependencia" },
  { value: "13", label: "13. Culpa y Verg\üenza" },
  { value: "14", label: "14. Límites Saludables" },
  { value: "15", label: "15. El Duelo Narcisista" },
  { value: "custom", label: "Tema personalizado" },
];

export default function VoiceoverPage() {
  return (
    <AgentPageShell
      title="Voiceover Psicológico"
      icon="VO"
      description="Genera voiceovers de 3 partes (~37,500 caracteres) para lives diarios"
      agentCount={3}
      outputType="Voiceovers .md/.pdf"
      agentType="voiceover"
      fields={[
        {
          name: "tema",
          label: "Tema del voiceover",
          type: "select",
          options: TEMAS,
          required: true,
        },
        {
          name: "tema_custom",
          label: "Tema personalizado (si seleccionaste 'Tema personalizado')",
          type: "textarea",
          placeholder: "Describe el tema específico que quieres abordar...",
        },
      ]}
      steps={[
        "Parte 1: Generando contenido",
        "Parte 1: Agente ortográfico",
        "Parte 1: Verificando caracteres",
        "Parte 1: Revisor emocional",
        "Parte 2: Generando contenido",
        "Parte 2: Agente ortográfico",
        "Parte 2: Verificando caracteres",
        "Parte 2: Revisor emocional",
        "Parte 3: Generando contenido",
        "Parte 3: Agente ortográfico",
        "Parte 3: Verificando caracteres",
        "Parte 3: Revisor emocional",
        "Generando PDF final",
      ]}
    />
  );
}
