import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/jobs/queue";
import { executeJob, getRunner } from "@/lib/jobs/runner";
import { checkRateLimit } from "@/lib/middleware/rate-limit";
import "@/lib/agents/registry";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  // Rate limit: max 10 agent runs per minute per IP
  const rateLimited = checkRateLimit(req, { maxRequests: 10, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const { type: agentType } = await params;

  // Validate agent type
  const runner = getRunner(agentType);
  if (!runner) {
    return NextResponse.json(
      { error: `Agente "${agentType}" no encontrado` },
      { status: 404 }
    );
  }

  const body = await req.json();

  // Create job
  const jobId = createJob(agentType, body);

  // Execute job in background (don't await)
  executeJob(jobId, agentType, body);

  return NextResponse.json({ jobId, agentType, status: "started" });
}
