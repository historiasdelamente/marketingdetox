import { AgentPageShell } from "@/components/agents/agent-page-shell";

export default function CursosPage() {
  return (
    <AgentPageShell
      title="Cursos Educativos"
      icon="CU"
      description="Genera programas de aprendizaje estructurados sobre psicología relacional"
      agentCount={7}
      outputType="Programas HTML/PDF"
      agentType="cursos"
      fields={[
        {
          name: "tema",
          label: "Tema del curso",
          type: "textarea",
          placeholder: "Ej: Trauma bonding en relaciones de pareja...",
          required: true,
        },
        {
          name: "fase",
          label: "Fase de ejecución",
          type: "select",
          options: [
            { value: "completo", label: "Pipeline completo" },
            { value: "investigacion", label: "Solo investigación" },
            { value: "escritura", label: "Solo escritura" },
          ],
        },
      ]}
      steps={[
        "Director: coordinando",
        "Investigador: analizando tema",
        "Profesor: diseñando contenido educativo",
        "Emocional: agregando capa emocional",
        "Escritor: redactando contenido",
        "Organizador: estructurando",
        "Calidad: validando",
        "Generando HTML/PDF",
      ]}
    />
  );
}
