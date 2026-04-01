import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, requireApiKey } from "@/lib/middleware/rate-limit";

/**
 * Paula Recommendation API
 *
 * Paula sends user profile → marketingdetox returns personalized content recommendations.
 * This is the bridge between the two systems.
 *
 * POST /api/paula/recommend
 * Body: { user_profile, conversation_summary, detected_topics }
 * Returns: { recommendations: [...] }
 */

interface UserProfile {
  manychat_id: string;
  name?: string;
  funnel_stage: string;
  conversation_count: number;
  situacion_resumen?: string;
  detected_topics: string[];
}

interface Recommendation {
  type: "tiktok" | "email" | "taller" | "voiceover" | "clase" | "blog";
  title: string;
  description: string;
  content_id?: string;
  url?: string;
  priority: "high" | "medium" | "low";
}

// Topic → content mapping based on the knowledge base
const TOPIC_CONTENT_MAP: Record<string, Recommendation[]> = {
  narcisismo: [
    { type: "clase", title: "Clase gratuita: Cómo reconocer a un narcisista", description: "Clase en vivo con Javier Vieira", url: "https://historiasdelamente.com/clase-gratuita", priority: "high" },
    { type: "taller", title: "Taller: Recaída Sagrada", description: "Para cuando sientes que quieres volver", priority: "medium" },
  ],
  apego: [
    { type: "taller", title: "Taller: Apego Ansioso", description: "Entender por qué te aferras", priority: "high" },
    { type: "voiceover", title: "Tu cuerpo sigue casado con él", description: "Voiceover sobre la adicción al regreso", priority: "medium" },
  ],
  trauma_bonding: [
    { type: "voiceover", title: "No te extraña, sobrevivir", description: "La verdad sobre lo que sientes", priority: "high" },
    { type: "blog", title: "Bioquímica de la adicción al trauma bond", description: "Artículo sobre dopamina y cortisol", priority: "medium" },
  ],
  crisis: [
    { type: "clase", title: "Clase gratuita urgente", description: "Habla con Javier en vivo", url: "https://historiasdelamente.com/clase-gratuita", priority: "high" },
  ],
  sanacion: [
    { type: "taller", title: "Programa Apego Detox", description: "Programa completo de sanación emocional - $25 USD", url: "https://hotmart.com/checkout/apego-detox", priority: "high" },
    { type: "voiceover", title: "El narcisista que vive dentro de ti", description: "Voiceover sobre la voz interna", priority: "medium" },
  ],
  nina_interior: [
    { type: "taller", title: "Taller: Niña Interior", description: "Reconectar con quien fuiste antes de él", priority: "high" },
  ],
  recuperacion: [
    { type: "blog", title: "Cómo reconstruir tu identidad", description: "Guía paso a paso para recuperarte", priority: "medium" },
    { type: "taller", title: "Programa Apego Detox", description: "$25 USD - Tu camino de sanación", url: "https://hotmart.com/checkout/apego-detox", priority: "high" },
  ],
};

export async function POST(req: NextRequest) {
  const rateLimited = checkRateLimit(req, { maxRequests: 30, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const authError = requireApiKey(req);
  if (authError) return authError;

  const body = await req.json() as {
    user_profile: UserProfile;
    conversation_summary?: string;
    detected_topics?: string[];
  };

  const { user_profile, detected_topics = [] } = body;

  // Build personalized recommendations
  const recommendations: Recommendation[] = [];
  const seenTypes = new Set<string>();

  // Match topics to content
  for (const topic of detected_topics) {
    const topicKey = topic.toLowerCase().replace(/[\s-]/g, "_");
    const matches = TOPIC_CONTENT_MAP[topicKey];
    if (matches) {
      for (const rec of matches) {
        const key = `${rec.type}:${rec.title}`;
        if (!seenTypes.has(key)) {
          recommendations.push(rec);
          seenTypes.add(key);
        }
      }
    }
  }

  // Always recommend the free class for new leads
  if (user_profile.funnel_stage === "new_lead" && user_profile.conversation_count < 5) {
    recommendations.unshift({
      type: "clase",
      title: "Clase gratuita con Javier",
      description: "El primer paso para entender lo que te pasa",
      url: "https://historiasdelamente.com/clase-gratuita",
      priority: "high",
    });
  }

  // Recommend Apego Detox if engaged enough
  if (user_profile.conversation_count > 10 && user_profile.funnel_stage !== "customer") {
    recommendations.push({
      type: "taller",
      title: "Apego Detox - Programa completo",
      description: "Programa de sanación emocional por $25 USD",
      url: "https://hotmart.com/checkout/apego-detox",
      priority: "high",
    });
  }

  // Limit to top 5 recommendations
  const top = recommendations
    .sort((a, b) => {
      const prio = { high: 0, medium: 1, low: 2 };
      return prio[a.priority] - prio[b.priority];
    })
    .slice(0, 5);

  return NextResponse.json({
    user: user_profile.manychat_id,
    recommendations: top,
    total_available: recommendations.length,
  });
}
