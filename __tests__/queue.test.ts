import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database
vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({
    prepare: vi.fn(() => ({
      run: vi.fn(),
      get: vi.fn(() => ({
        id: "job-1",
        agent_type: "tiktok",
        status: "pending",
        input_params: "{}",
        created_at: "2026-04-01",
      })),
      all: vi.fn(() => []),
    })),
    pragma: vi.fn(),
    exec: vi.fn(),
  })),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-uuid-1234"),
}));

describe("queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("createJob", () => {
    it("should create a job and return an id", async () => {
      const { createJob } = await import("@/lib/jobs/queue");
      const id = createJob("tiktok", { tema: "narcisismo" });

      expect(id).toBe("mock-uuid-1234");
    });
  });

  describe("SSE events", () => {
    it("should emit progress to listeners", async () => {
      const { createJob, addListener, emitProgress } = await import(
        "@/lib/jobs/queue"
      );

      const jobId = createJob("tiktok", {});
      const received: string[] = [];

      addListener(jobId, (data) => received.push(data));
      emitProgress(jobId, "Investigando", 50);

      expect(received).toHaveLength(1);
      const parsed = JSON.parse(received[0]);
      expect(parsed.type).toBe("progress");
      expect(parsed.step).toBe("Investigando");
      expect(parsed.percentage).toBe(50);
    });

    it("should emit complete to listeners", async () => {
      const { createJob, addListener, emitComplete } = await import(
        "@/lib/jobs/queue"
      );

      const jobId = createJob("emails", {});
      const received: string[] = [];

      addListener(jobId, (data) => received.push(data));
      emitComplete(jobId, "<html>email</html>");

      const parsed = JSON.parse(received[0]);
      expect(parsed.type).toBe("complete");
      expect(parsed.output).toContain("email");
    });

    it("should emit error to listeners", async () => {
      const { createJob, addListener, emitError } = await import(
        "@/lib/jobs/queue"
      );

      const jobId = createJob("sora", {});
      const received: string[] = [];

      addListener(jobId, (data) => received.push(data));
      emitError(jobId, "Agent timeout");

      const parsed = JSON.parse(received[0]);
      expect(parsed.type).toBe("error");
      expect(parsed.message).toBe("Agent timeout");
    });

    it("should handle removeListener", async () => {
      const { createJob, addListener, removeListener, emitProgress } =
        await import("@/lib/jobs/queue");

      const jobId = createJob("tiktok", {});
      const received: string[] = [];
      const listener = (data: string) => received.push(data);

      addListener(jobId, listener);
      emitProgress(jobId, "Step 1", 25);
      removeListener(jobId, listener);
      emitProgress(jobId, "Step 2", 50);

      // Should only have received first event
      expect(received).toHaveLength(1);
    });
  });

  describe("getJob / listJobs", () => {
    it("should retrieve a job by id", async () => {
      const { getJob } = await import("@/lib/jobs/queue");
      const job = getJob("job-1");
      expect(job).toBeDefined();
      expect(job?.agent_type).toBe("tiktok");
    });

    it("should list jobs", async () => {
      const { listJobs } = await import("@/lib/jobs/queue");
      const jobs = listJobs();
      expect(Array.isArray(jobs)).toBe(true);
    });
  });
});
