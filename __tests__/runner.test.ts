import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({
    prepare: vi.fn(() => ({
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(() => []),
    })),
    pragma: vi.fn(),
    exec: vi.fn(),
  })),
}));

vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    ...actual,
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

vi.mock("uuid", () => ({
  v4: vi.fn(() => "test-uuid-1234"),
}));

describe("runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("registerRunner / getRunner", () => {
    it("should register and retrieve a runner", async () => {
      const { registerRunner, getRunner } = await import(
        "@/lib/jobs/runner"
      );

      const mockRunner = vi.fn(async () => ({
        content: "test",
        title: "Test",
        fileType: "md",
      }));

      registerRunner("test-agent", mockRunner);
      const retrieved = getRunner("test-agent");

      expect(retrieved).toBe(mockRunner);
    });

    it("should return undefined for unregistered agent", async () => {
      const { getRunner } = await import("@/lib/jobs/runner");
      expect(getRunner("nonexistent")).toBeUndefined();
    });
  });

  describe("executeJob", () => {
    it("should call runner and save output on success", async () => {
      const { registerRunner, executeJob } = await import(
        "@/lib/jobs/runner"
      );

      const mockRunner = vi.fn(async (
        _params: Record<string, string>,
        onProgress: (step: string, pct: number) => void
      ) => {
        onProgress("Working", 50);
        onProgress("Done", 100);
        return { content: "Generated content", title: "Test Output", fileType: "md" };
      });

      registerRunner("test-exec", mockRunner);

      // Should not throw
      await executeJob("job-123", "test-exec", { tema: "test" });

      expect(mockRunner).toHaveBeenCalledTimes(1);
      expect(mockRunner).toHaveBeenCalledWith(
        { tema: "test" },
        expect.any(Function)
      );
    });

    it("should handle runner failure gracefully", async () => {
      const { registerRunner, executeJob } = await import(
        "@/lib/jobs/runner"
      );

      const failRunner = vi.fn(async () => {
        throw new Error("Agent crashed");
      });

      registerRunner("fail-agent", failRunner);

      // Should not throw (errors handled internally)
      await executeJob("job-fail", "fail-agent", {});
    });

    it("should handle missing agent type", async () => {
      const { executeJob } = await import("@/lib/jobs/runner");

      // Should not throw
      await executeJob("job-missing", "nonexistent-type", {});
    });
  });
});
