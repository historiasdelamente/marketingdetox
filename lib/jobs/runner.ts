import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import {
  updateJobStatus,
  emitProgress,
  emitComplete,
  emitError,
} from "./queue";

const OUTPUT_DIR = path.join(process.cwd(), "data", "outputs");

export type AgentRunner = (
  params: Record<string, string>,
  onProgress: (step: string, percentage: number) => void
) => Promise<{ content: string; title: string; fileType: string }>;

// Registry of agent runners
const runners = new Map<string, AgentRunner>();

export function registerRunner(agentType: string, runner: AgentRunner) {
  runners.set(agentType, runner);
}

export function getRunner(agentType: string): AgentRunner | undefined {
  return runners.get(agentType);
}

/**
 * Execute a job: runs the agent, saves output, emits SSE updates
 */
export async function executeJob(
  jobId: string,
  agentType: string,
  params: Record<string, string>
) {
  const runner = runners.get(agentType);
  if (!runner) {
    updateJobStatus(jobId, "failed", {
      error_message: `No runner registered for agent type: ${agentType}`,
    });
    emitError(jobId, `Agente "${agentType}" no disponible`);
    return;
  }

  updateJobStatus(jobId, "running");

  try {
    const result = await runner(params, (step, percentage) => {
      emitProgress(jobId, step, percentage);
    });

    // Save output file
    const today = new Date().toISOString().split("T")[0];
    const outputDir = path.join(OUTPUT_DIR, today);
    mkdirSync(outputDir, { recursive: true });

    const safeTitle = result.title
      .replace(/[^a-zA-Z0-9_\-\à-\ɏ]/g, "_")
      .substring(0, 80);
    const filename = `${agentType}-${safeTitle}.${result.fileType}`;
    const filePath = path.join(outputDir, filename);

    writeFileSync(filePath, result.content, "utf-8");

    // Save to database
    const outputId = uuidv4();
    const db = getDb();
    db.prepare(
      `INSERT INTO outputs (id, job_id, agent_type, title, file_type, file_path, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      outputId,
      jobId,
      agentType,
      result.title,
      result.fileType,
      filePath,
      Buffer.byteLength(result.content, "utf-8")
    );

    updateJobStatus(jobId, "completed", {
      output_files: [filePath],
      completed_at: new Date().toISOString(),
    });

    emitComplete(jobId, result.content);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    updateJobStatus(jobId, "failed", { error_message: message });
    emitError(jobId, message);
  }
}
