import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";

async function runBlog(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { tema, keywords, audiencia } = params;

  const escritorPrompt = loadPrompt("blog", "01_escritor_blog_seo");

  // Step 1: Generate SEO blog post
  onProgress("Escritor SEO: generando artículo optimizado", 10);
  const articulo = await callClaudeCli(
    `TEMA: ${tema}\nKEYWORDS: ${keywords || tema}\nAUDIENCIA: ${audiencia || "Mujeres hispanohablantes 25-65 años en relaciones con narcisistas"}\n\nGenera un artículo SEO completo con headers H2/H3, meta description, y estructura optimizada para búsqueda orgánica.`,
    { systemPrompt: escritorPrompt, model: "opus" }
  );

  onProgress("Completado", 100);

  return {
    content: articulo,
    title: `blog-${tema.substring(0, 50)}`,
    fileType: "md",
  };
}

registerRunner("blog", runBlog);
