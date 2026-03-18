import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";

async function runCursos(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { tema, fase = "completo" } = params;

  // Load prompts
  const directorPrompt = loadPrompt("cursos", "director");
  const investigadorPrompt = loadPrompt("cursos", "investigador");
  const profesorPrompt = loadPrompt("cursos", "profesor");
  const emocionalPrompt = loadPrompt("cursos", "emocional");
  const escritorPrompt = loadPrompt("cursos", "escritor");
  const organizadorPrompt = loadPrompt("cursos", "organizador");
  const calidadPrompt = loadPrompt("cursos", "calidad");

  const results: Record<string, string> = {};

  // Step 1: Director coordinates
  onProgress("Director: coordinando", 5);
  results.director = await callClaudeCli(
    `TEMA DEL CURSO: ${tema}\n\nAnaliza el tema y crea un brief con la estructura del curso, objetivos de aprendizaje, y flujo pedagógico.`,
    { systemPrompt: directorPrompt, model: "haiku" }
  );
  if (fase === "investigacion" || fase === "completo") {

    // Step 2: Investigador researches
    onProgress("Investigador: analizando tema", 15);
    results.investigacion = await callClaudeCli(
      `BRIEF DEL DIRECTOR:\n${results.director}\n\nTEMA: ${tema}\n\nInvestiga a profundidad el tema. Consulta la base de conocimiento y proporciona fundamento clínico.`,
      { systemPrompt: investigadorPrompt, model: "opus" }
    );
  }

  if (fase === "investigacion") {
    onProgress("Completado", 100);
    return { content: `# Investigación: ${tema}\n\n${results.investigacion}`, title: `curso-${tema.substring(0, 30)}-investigacion`, fileType: "md" };
  }

  // Step 3: Profesor designs educational content
  onProgress("Profesor: diseñando contenido educativo", 28);
  results.profesor = await callClaudeCli(
    `BRIEF:\n${results.director}\n\nINVESTIGACIÓN:\n${results.investigacion}\n\nDiseña el contenido educativo del curso con módulos, lecciones y actividades.`,
    { systemPrompt: profesorPrompt, model: "opus" }
  );

  // Step 4: Emocional adds emotional layer
  onProgress("Emocional: agregando capa emocional", 40);
  results.emocional = await callClaudeCli(
    `CONTENIDO EDUCATIVO:\n${results.profesor}\n\nTEMA: ${tema}\n\nAgrega la capa emocional al contenido: historias, metáforas, momentos de reflexión, ejercicios vivenciales.`,
    { systemPrompt: emocionalPrompt, model: "opus" }
  );

  if (fase === "escritura" || fase === "completo") {
    // Step 5: Escritor writes
    onProgress("Escritor: redactando contenido", 55);
    results.escritor = await callClaudeCli(
      `CONTENIDO EDUCATIVO:\n${results.profesor}\n\nCAPA EMOCIONAL:\n${results.emocional}\n\nRedacta el contenido completo del curso, integrando lo educativo con lo emocional.`,
      { systemPrompt: escritorPrompt, model: "opus" }
    );
  }

  // Step 6: Organizador structures
  onProgress("Organizador: estructurando", 70);
  results.organizador = await callClaudeCli(
    `CONTENIDO REDACTADO:\n${results.escritor}\n\nOrganiza el contenido en una estructura final clara con módulos, secciones y flujo lógico.`,
    { systemPrompt: organizadorPrompt, model: "haiku" }
  );

  // Step 7: Calidad validates
  onProgress("Calidad: validando", 85);
  results.calidad = await callClaudeCli(
    `CONTENIDO ORGANIZADO:\n${results.organizador}\n\nBRIEF ORIGINAL:\n${results.director}\n\nValida la calidad del curso: coherencia, profundidad, impacto emocional, precisión clínica.`,
    { systemPrompt: calidadPrompt, model: "sonnet" }
  );

  onProgress("Completado", 100);

  const finalContent = `# Curso: ${tema}

---

## ESTRUCTURA Y BRIEF

${results.director}

---

## CONTENIDO COMPLETO

${results.organizador}

---

## VALIDACIÓN DE CALIDAD

${results.calidad}
`;

  return {
    content: finalContent,
    title: `curso-${tema.substring(0, 40)}`,
    fileType: "md",
  };
}

registerRunner("cursos", runCursos);
