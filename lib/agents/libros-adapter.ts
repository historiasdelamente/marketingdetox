import { registerRunner } from "@/lib/jobs/runner";
import { callClaudeCli } from "./base-agent";

async function runLibros(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { tema, titulo, fase = "full", plataforma = "kdp" } = params;

  // Step 1: Investigation (sonnet - research doesn't need opus)
  onProgress("Investigador: analizando fuentes", 10);
  const investigacion = await callClaudeCli(
    `TEMA DEL LIBRO: ${tema}\nPLATAFORMA: ${plataforma}\n\nInvestiga a profundidad sobre este tema para crear un libro de 30,000+ palabras. Analiza la base de conocimiento disponible.`,
    { systemPrompt: "Eres un investigador experto en psicología del apego, narcisismo y trauma relacional. Tu trabajo es investigar y proporcionar toda la información necesaria para escribir un libro completo.", model: "sonnet" }
  );

  if (fase === "investigation") {
    onProgress("Completado", 100);
    return { content: investigacion, title: `libro-investigacion-${tema.substring(0, 30)}`, fileType: "md" };
  }

  // Step 2: Architecture (sonnet - structural work)
  onProgress("Arquitecto: diseñando estructura", 25);
  const arquitectura = await callClaudeCli(
    `INVESTIGACIÓN:\n${investigacion}\n\nTEMA: ${tema}\n\nDiseña la estructura completa del libro: capítulos, secciones, flujo narrativo, extensión estimada por capítulo. Presenta 3 propuestas de estructura.`,
    { systemPrompt: "Eres un arquitecto editorial experto. Diseñas estructuras de libros de no-ficción psicológica que sean accesibles, profundas y transformadoras.", model: "sonnet" }
  );

  if (fase === "architecture") {
    onProgress("Completado", 100);
    return { content: arquitectura, title: `libro-arquitectura-${tema.substring(0, 30)}`, fileType: "md" };
  }

  // Step 3: Writing (opus - creative writing needs the best model)
  onProgress("Escritor: redactando capítulos", 40);
  const manuscrito = await callClaudeCli(
    `INVESTIGACIÓN:\n${investigacion}\n\nESTRUCTURA:\n${arquitectura}\n\nTEMA: ${tema}\nTÍTULO: ${titulo || "(sin título definido)"}\n\nRedacta el manuscrito completo siguiendo la estructura. Cada capítulo debe ser profundo, con ejemplos reales, metáforas y ejercicios prácticos. Fusión Marian Rojas Estapé + Walter Riso.`,
    { systemPrompt: "Eres un escritor experto en libros de psicología del apego y relaciones. Escribes con profundidad clínica pero accesibilidad emocional. Tu estilo fusiona Marian Rojas Estapé (neurociencia accesible) y Walter Riso (confrontación empática).", model: "opus" }
  );

  if (fase === "writing") {
    onProgress("Completado", 100);
    return { content: manuscrito, title: titulo || `libro-${tema.substring(0, 40)}`, fileType: "md" };
  }

  // Step 4: Editing (sonnet - editing/review doesn't need opus)
  onProgress("Editor: revisando y editando", 75);
  const editado = await callClaudeCli(
    `MANUSCRITO A EDITAR:\n${manuscrito}\n\nRevisa y edita este manuscrito. Verifica: coherencia narrativa, precisión clínica, fluidez de lectura, impacto emocional. Corrige errores y mejora donde sea necesario.`,
    { systemPrompt: "Eres un editor profesional especializado en libros de psicología. Editas manteniendo la voz del autor mientras mejoras claridad, fluidez y precisión.", model: "sonnet" }
  );

  onProgress("Completado", 100);

  const finalContent = `# ${titulo || tema}

---

${editado}

---

## METADATA

- Tema: ${tema}
- Plataforma: ${plataforma}
- Fase: ${fase}
`;

  return {
    content: finalContent,
    title: titulo || `libro-${tema.substring(0, 40)}`,
    fileType: "md",
  };
}

registerRunner("libros", runLibros);
