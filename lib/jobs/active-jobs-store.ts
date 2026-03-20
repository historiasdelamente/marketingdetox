/**
 * Global client-side store for tracking active jobs across page navigation.
 * This is a singleton that persists in memory as long as the browser tab is open.
 * It also syncs to sessionStorage so it survives Next.js soft navigations.
 */

export type ActiveJob = {
  jobId: string;
  agentType: string;
  status: "running" | "completed" | "failed";
  progress: number;
  step: string;
  output?: string;
  error?: string;
  startedAt: number;
};

type Listener = () => void;

const STORAGE_KEY = "marketingdetox-active-jobs";

class ActiveJobsStore {
  private jobs: Map<string, ActiveJob> = new Map();
  private listeners: Set<Listener> = new Set();
  private eventSources: Map<string, EventSource> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ActiveJob[] = JSON.parse(stored);
        for (const job of parsed) {
          this.jobs.set(job.jobId, job);
          // Reconnect to running jobs
          if (job.status === "running") {
            this.connectToJob(job.jobId);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    try {
      const arr = Array.from(this.jobs.values());
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.saveToStorage();
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Start tracking a new job and connect to its SSE stream.
   */
  startJob(jobId: string, agentType: string) {
    const job: ActiveJob = {
      jobId,
      agentType,
      status: "running",
      progress: 0,
      step: "Iniciando...",
      startedAt: Date.now(),
    };
    this.jobs.set(jobId, job);
    this.notify();
    this.connectToJob(jobId);
  }

  /**
   * Connect (or reconnect) to a job's SSE stream.
   */
  private connectToJob(jobId: string) {
    // Don't double-connect
    if (this.eventSources.has(jobId)) return;

    const es = new EventSource(`/api/stream/${jobId}`);
    this.eventSources.set(jobId, es);

    es.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const job = this.jobs.get(jobId);
      if (!job) return;

      if (msg.type === "progress") {
        job.progress = msg.percentage;
        job.step = msg.step;
        this.notify();
      } else if (msg.type === "complete") {
        job.status = "completed";
        job.progress = 100;
        job.step = "Completado";
        job.output = msg.output;
        this.notify();
        this.cleanupConnection(jobId);
      } else if (msg.type === "error") {
        job.status = "failed";
        job.error = msg.message;
        this.notify();
        this.cleanupConnection(jobId);
      }
    };

    es.onerror = () => {
      const job = this.jobs.get(jobId);
      if (job && job.status === "running") {
        job.status = "failed";
        job.error = "Conexión perdida";
        this.notify();
      }
      this.cleanupConnection(jobId);
    };
  }

  private cleanupConnection(jobId: string) {
    const es = this.eventSources.get(jobId);
    if (es) {
      es.close();
      this.eventSources.delete(jobId);
    }
  }

  /**
   * Get all active jobs.
   */
  getAll(): ActiveJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get running jobs only.
   */
  getRunning(): ActiveJob[] {
    return this.getAll().filter((j) => j.status === "running");
  }

  /**
   * Get the latest job for a specific agent type.
   */
  getByAgent(agentType: string): ActiveJob | undefined {
    const jobs = this.getAll()
      .filter((j) => j.agentType === agentType)
      .sort((a, b) => b.startedAt - a.startedAt);
    return jobs[0];
  }

  /**
   * Get a completed job and consume it (remove from store).
   */
  consumeCompleted(jobId: string): ActiveJob | undefined {
    const job = this.jobs.get(jobId);
    if (job && job.status !== "running") {
      this.jobs.delete(jobId);
      this.notify();
      return job;
    }
    return undefined;
  }

  /**
   * Clear a specific job from the store.
   */
  clearJob(jobId: string) {
    this.cleanupConnection(jobId);
    this.jobs.delete(jobId);
    this.notify();
  }

  /**
   * Subscribe to changes. Returns unsubscribe function.
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// Singleton
let store: ActiveJobsStore | null = null;

export function getActiveJobsStore(): ActiveJobsStore {
  if (!store) {
    store = new ActiveJobsStore();
  }
  return store;
}
