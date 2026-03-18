import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";
import { readFileSync, existsSync } from "fs";
import path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "agents-source", "templates");

async function runEmails(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { tipo_email, audiencia, tema, fecha_clase, link_cta } = params;

  const directorPrompt = loadPrompt("emails", "01_director");
  const redactorPrompt = loadPrompt("emails", "02_redactor");
  const correctorPrompt = loadPrompt("emails", "03_corrector");
  const disenadorPrompt = loadPrompt("emails", "04_disenador_html");

  // Load HTML template if available
  let htmlTemplate = "";
  const templateMap: Record<string, string> = {
    bienvenida: "plantilla_bienvenida_clientas.html",
    invitacion: "plantilla_invitacion_clase_v2_refinada.html",
  };
  const templateFile = templateMap[tipo_email];
  if (templateFile) {
    const templatePath = path.join(TEMPLATES_DIR, templateFile);
    if (existsSync(templatePath)) {
      htmlTemplate = readFileSync(templatePath, "utf-8");
    }
  }

  // Step 1: Director creates creative brief
  onProgress("Director: creando brief creativo", 10);
  const brief = await callClaudeCli(
    `TIPO DE EMAIL: ${tipo_email}\nAUDIENCIA: ${audiencia}\nTEMA: ${tema}\n${fecha_clase ? `FECHA: ${fecha_clase}` : ""}\n${link_cta ? `LINK CTA: ${link_cta}` : ""}\n\nCrea el brief creativo estratégico para este email.`,
    { systemPrompt: directorPrompt, model: "sonnet" }
  );

  // Step 2: Redactor writes the copy
  onProgress("Redactor: escribiendo el email", 35);
  const copy = await callClaudeCli(
    `BRIEF CREATIVO:\n${brief}\n\nTEMA: ${tema}\nAUDIENCIA: ${audiencia}\n\nRedacta el email completo siguiendo el brief.`,
    { systemPrompt: redactorPrompt, model: "opus" }
  );

  // Step 3: Corrector reviews quality
  onProgress("Corrector: revisión de calidad", 60);
  const corregido = await callClaudeCli(
    `EMAIL A REVISAR:\n${copy}\n\nBRIEF ORIGINAL:\n${brief}\n\nRevisa y corrige este email según los estándares de calidad.`,
    { systemPrompt: correctorPrompt, model: "haiku" }
  );

  // Step 4: Diseñador creates HTML
  onProgress("Diseñador HTML: formateando", 85);
  const templateContext = htmlTemplate
    ? `\n\nPLANTILLA HTML DE REFERENCIA:\n${htmlTemplate}`
    : "";
  const html = await callClaudeCli(
    `EMAIL CORREGIDO:\n${corregido}${templateContext}\n\nConvierte este email en HTML listo para enviar. Usa colores dorados (#C9A84C) y oscuros de la marca Historias de la Mente.`,
    { systemPrompt: disenadorPrompt, model: "sonnet" }
  );

  onProgress("Completado", 100);

  return {
    content: html,
    title: `${tipo_email}-${tema.substring(0, 40)}`,
    fileType: "html",
  };
}

registerRunner("emails", runEmails);
