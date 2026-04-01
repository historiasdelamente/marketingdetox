import { NextRequest, NextResponse } from "next/server";
import { syncKnowledgeBase } from "@/lib/conocimiento/sync";
import { checkRateLimit } from "@/lib/middleware/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: max 5 syncs per minute
  const rateLimited = checkRateLimit(req, { maxRequests: 5, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  try {
    const result = await syncKnowledgeBase();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
