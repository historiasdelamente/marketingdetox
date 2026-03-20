import { AgentPageShell } from "@/components/agents/agent-page-shell";

export default function SoraPage() {
  return (
    <AgentPageShell
      title="Sora Prompts"
      icon="SR"
      description="Genera prompts cinematográficos de 15s para crear videos con Sora (OpenAI) — @historiasdelamente"
      agentCount={5}
      outputType="Prompts .md"
      agentType="sora"
      fields={[
        {
          name: "modo",
          label: "¿Dolor o Invitación a clase?",
          type: "select",
          options: [
            { value: "dolor", label: "DOLOR — Contenido emocional puro (ella cuenta tragedia, él responde)" },
            { value: "invitacion", label: "INVITACIÓN — Promoción de clase (diálogo + CTA)" },
          ],
          required: true,
        },
        {
          name: "concepto",
          label: "Concepto / Situación del video",
          type: "textarea",
          placeholder: "Ej: ¿Por qué no puedo dejarlo si sé que me hace daño? Ella lleva 3 años volviendo con él...",
          required: true,
        },
        {
          name: "tono",
          label: "Tono emocional",
          type: "select",
          options: [
            { value: "explosivo_raw", label: "Explosivo/Raw — rabia controlada, verdad sin filtro" },
            { value: "demoledor", label: "Demoledor — destruye creencia sin piedad" },
            { value: "grito_silencioso", label: "Grito silencioso — intensidad brutal sin gritar" },
            { value: "despertador", label: "Despertador — sacude: ¡despierta!" },
            { value: "incendiario", label: "Incendiario — verdades encadenadas sin parar" },
            { value: "implosion", label: "Implosión — calmado hasta explotar al final" },
            { value: "ironico_provocador", label: "Irónico/Provocador — sarcasmo inteligente" },
            { value: "empatico_sanador", label: "Empático/Sanador — voz suave, cercanía" },
            { value: "complice_oscuro", label: "Cómplice oscuro — secreto en voz baja" },
            { value: "maestro_callejero", label: "Maestro callejero — sabiduría con jerga" },
            { value: "hielo", label: "Hielo — frialdad calculada, sin emoción" },
            { value: "poetico_crudo", label: "Poético crudo — metáforas + realidad brutal" },
          ],
          required: true,
        },
        {
          name: "formato",
          label: "Formato / Aspect ratio",
          type: "select",
          options: [
            { value: "9:16 vertical", label: "9:16 Vertical (TikTok / Reels)" },
            { value: "16:9 horizontal", label: "16:9 Horizontal (YouTube)" },
            { value: "1:1 cuadrado", label: "1:1 Cuadrado (Instagram)" },
          ],
        },
      ]}
      steps={[
        "Analizador: descomponiendo concepto visual",
        "Director Visual: creando dirección cinematográfica",
        "Compositor: escribiendo prompt principal para Sora",
        "Optimizador: refinando y validando prompt",
        "Variaciones: generando 3 alternativas creativas",
      ]}
    />
  );
}
