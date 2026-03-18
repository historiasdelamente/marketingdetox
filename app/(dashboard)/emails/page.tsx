import { AgentPageShell } from "@/components/agents/agent-page-shell";

export default function EmailsPage() {
  return (
    <AgentPageShell
      title="Email Marketing"
      icon="EM"
      description="Genera emails HTML de alto impacto emocional para clientas y leads"
      agentCount={4}
      outputType="Emails .html"
      agentType="emails"
      fields={[
        {
          name: "tipo_email",
          label: "Tipo de email",
          type: "select",
          options: [
            { value: "bienvenida", label: "Bienvenida a clientas" },
            { value: "invitacion", label: "Invitación a clase gratuita" },
            { value: "recordatorio", label: "Recordatorio" },
            { value: "info", label: "Información importante" },
          ],
          required: true,
        },
        {
          name: "audiencia",
          label: "Audiencia",
          type: "select",
          options: [
            { value: "clientas", label: "Clientas actuales" },
            { value: "leads", label: "Leads / Prospectos" },
          ],
          required: true,
        },
        {
          name: "tema",
          label: "Tema / Asunto",
          type: "text",
          placeholder: "Ej: Taller gratuito sobre el narcisista invisible",
          required: true,
        },
        {
          name: "fecha_clase",
          label: "Fecha del evento (si aplica)",
          type: "text",
          placeholder: "Ej: 25 de marzo, 2026",
        },
        {
          name: "link_cta",
          label: "Link del CTA (si aplica)",
          type: "text",
          placeholder: "https://...",
        },
      ]}
      steps={[
        "Director: creando brief creativo",
        "Redactor: escribiendo el email",
        "Corrector: revisión de calidad",
        "Diseñador HTML: formateando en HTML",
      ]}
    />
  );
}
