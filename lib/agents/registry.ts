// Import all adapters so they self-register via registerRunner()
import "./tiktok-adapter";
import "./emails-adapter";
import "./voiceover-adapter";
import "./talleres-adapter";
import "./clases-adapter";
import "./cursos-adapter";
import "./libros-adapter";

// This file exists solely to trigger adapter registration.
// Import it in API routes before using getRunner().
export const AGENT_TYPES = [
  "tiktok",
  "emails",
  "voiceover",
  "talleres",
  "clases",
  "cursos",
  "libros",
] as const;

export type AgentType = (typeof AGENT_TYPES)[number];
