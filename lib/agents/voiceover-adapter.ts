import { callClaudeCli, loadPrompt } from "./base-agent";
import { registerRunner } from "@/lib/jobs/runner";

const TOPIC_BANK: Record<string, string> = {
  "1": "Cómo Detectar a un Narcisista",
  "2": "El Vínculo Traumático",
  "3": "Apego Ansioso y Narcisismo",
  "4": "TEPT Complejo",
  "5": "La Niña Interior Herida",
  "6": "Contacto Cero",
  "7": "Gaslighting",
  "8": "Love Bombing",
  "9": "Hoovering",
  "10": "Triangulación",
  "11": "Refuerzo Intermitente",
  "12": "Codependencia",
  "13": "Culpa y Verg\üenza",
  "14": "Límites Saludables",
  "15": "El Duelo Narcisista",
};

async function generatePart(
  partNum: number,
  tema: string,
  skillPrompt: string,
  styleGuide: string,
  structure: string,
  techniques: string,
  previousParts: string,
  onProgress: (step: string, percentage: number) => void,
  basePercentage: number
): Promise<string> {
  const partLabel = `Parte ${partNum}`;
  const stepBase = basePercentage;

  // Generate content
  onProgress(`${partLabel}: Generando contenido`, stepBase);
  const content = await callClaudeCli(
    `TEMA: ${tema}\nPARTE: ${partNum} de 3\n${previousParts ? `PARTES ANTERIORES:\n${previousParts}` : ""}\n\nGUÍA DE ESTILO:\n${styleGuide}\n\nESTRUCTURA:\n${structure}\n\nTÉCNICAS EMOCIONALES:\n${techniques}\n\nGenera la Parte ${partNum} del voiceover (~12,500 caracteres). Fusión Marian Rojas Estapé (60%) + Walter Riso (40%).`,
    { systemPrompt: skillPrompt, model: "opus" }
  );

  // Quality agent: orthography
  onProgress(`${partLabel}: Agente ortográfico`, stepBase + 5);
  const ortografia = await callClaudeCli(
    `Revisa la ortografía, tildes, puntuación y concordancia de este texto. Corrige y devuelve el texto completo corregido:\n\n${content}`,
    { systemPrompt: "Eres un agente ortográfico experto en español. Corrige errores sin cambiar el estilo ni el contenido. Devuelve el texto completo corregido.", model: "haiku" }
  );

  // Quality agent: character count
  onProgress(`${partLabel}: Verificando caracteres`, stepBase + 8);
  const verificado = await callClaudeCli(
    `Verifica que este texto tenga entre 12,000 y 13,000 caracteres. Si está fuera de rango, ajusta (expandiendo o condensando) sin perder calidad. Devuelve el texto final:\n\n${ortografia}`,
    { systemPrompt: "Eres un agente verificador de caracteres. Cuenta los caracteres y ajusta el texto al rango 12,000-13,000. Devuelve el texto completo.", model: "haiku" }
  );

  return verificado;
}

async function runVoiceover(
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) {
  const { tema: temaKey, tema_custom } = params;

  const tema = temaKey === "custom" && tema_custom
    ? tema_custom
    : TOPIC_BANK[temaKey] || temaKey;

  // Load reference materials
  const skillPrompt = loadPrompt("voiceover", "SKILL");
  let styleGuide = "", structure = "", techniques = "";
  try { styleGuide = loadPrompt("voiceover/references", "style-guide"); } catch { styleGuide = ""; }
  try { structure = loadPrompt("voiceover/references", "voiceover-structure"); } catch { structure = ""; }
  try { techniques = loadPrompt("voiceover/references", "emotional-techniques"); } catch { techniques = ""; }

  // Generate 3 parts
  const part1 = await generatePart(1, tema, skillPrompt, styleGuide, structure, techniques, "", onProgress, 5);
  const part2 = await generatePart(2, tema, skillPrompt, styleGuide, structure, techniques, `PARTE 1:\n${part1}`, onProgress, 35);
  const part3 = await generatePart(3, tema, skillPrompt, styleGuide, structure, techniques, `PARTE 1:\n${part1}\n\nPARTE 2:\n${part2}`, onProgress, 65);

  onProgress("Ensamblando voiceover final", 95);

  const finalContent = `# Voiceover: ${tema}
## 3 Partes (~37,500 caracteres)

---

# PARTE 1

${part1}

---

# PARTE 2

${part2}

---

# PARTE 3

${part3}
`;

  onProgress("Completado", 100);

  return {
    content: finalContent,
    title: tema.substring(0, 60),
    fileType: "md",
  };
}

registerRunner("voiceover", runVoiceover);
