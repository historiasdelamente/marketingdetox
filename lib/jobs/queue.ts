import { v4 as uuidv4 } from "uuid";
import { getDb, type Job } from "@/lib/db";

export type JobStatus = "pending" | "running" | "completed" | "failed";

export type ProgressUpdate = {
  step: string;
  percentage: number;
};

// In-memory state for active jobs (SSE listeners + progress)
const activeJobs = new Map<
  string,
  {
    listeners: Set<(data: string) => void>;
    progress: ProgressUpdate;
  }
>();

export function createJob(
  agentType: string,
  inputParams: Record<string, unknown>
): string {
  const id = uuidv4();
  const db = getDb();

  db.prepare(
    `INSERT INTO jobs (id, agent_type, input_params, status) VALUES (?, ?, ?, 'pending')`
  ).run(id, agentType, JSON.stringify(inputParams));

  activeJobs.set(id, {
    listeners: new Set(),
    progress: { step: "En cola...", percentage: 0 },
  });

  return id;
}

export function updateJobStatus(
  jobId: string,
  status: JobStatus,
  extra?: { error_message?: string; output_files?: string[]; completed_at?: string }
) {
  const db = getDb();
  const sets: string[] = [`status = ?`];
  const vals: unknown[] = [status];

  if (extra?.error_message) {
    sets.push(`error_message = ?`);
    vals.push(extra.error_message);
  }
  if (extra?.output_files) {
    sets.push(`output_files = ?`);
    vals.push(JSON.stringify(extra.output_files));
  }
  if (extra?.completed_at) {
    sets.push(`completed_at = ?`);
    vals.push(extra.completed_at);
  }

  vals.push(jobId);
  db.prepare(`UPDATE jobs SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
}

export function emitProgress(jobId: string, step: string, percentage: number) {
  const job = activeJobs.get(jobId);
  if (!job) return;

  job.progress = { step, percentage };
  const data = JSON.stringify({ type: "progress", step, percentage });

  for (const listener of job.listeners) {
    listener(data);
  }
}

export function emitComplete(jobId: string, output: string) {
  const job = activeJobs.get(jobId);
  if (!job) return;

  const data = JSON.stringify({ type: "complete", output });
  for (const listener of job.listeners) {
    listener(data);
  }

  // Cleanup after a short delay
  setTimeout(() => activeJobs.delete(jobId), 5000);
}

export function emitError(jobId: string, message: string) {
  const job = activeJobs.get(jobId);
  if (!job) return;

  const data = JSON.stringify({ type: "error", message });
  for (const listener of job.listeners) {
    listener(data);
  }

  setTimeout(() => activeJobs.delete(jobId), 5000);
}

export function addListener(jobId: string, listener: (data: string) => void) {
  const job = activeJobs.get(jobId);
  if (!job) return;
  job.listeners.add(listener);
}

export function removeListener(
  jobId: string,
  listener: (data: string) => void
) {
  const job = activeJobs.get(jobId);
  if (!job) return;
  job.listeners.delete(listener);
}

export function getJob(jobId: string): Job | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM jobs WHERE id = ?`).get(jobId) as
    | Job
    | undefined;
}

export function listJobs(agentType?: string, limit = 20): Job[] {
  const db = getDb();
  if (agentType) {
    return db
      .prepare(
        `SELECT * FROM jobs WHERE agent_type = ? ORDER BY created_at DESC LIMIT ?`
      )
      .all(agentType, limit) as Job[];
  }
  return db
    .prepare(`SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as Job[];
}
