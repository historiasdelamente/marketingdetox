import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fs before importing module
vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    ...actual,
    readFileSync: vi.fn((filePath: string) => {
      if (typeof filePath === "string" && filePath.includes("01_orquestador")) {
        return "Eres el orquestador. {{BASE_CONOCIMIENTO_PATH}} es la base.";
      }
      if (typeof filePath === "string" && filePath.includes("nonexistent")) {
        throw new Error("ENOENT: no such file or directory");
      }
      return "prompt content";
    }),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

// Mock child_process
vi.mock("child_process", () => ({
  spawn: vi.fn(),
}));

describe("loadPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should load and replace BASE_CONOCIMIENTO_PATH placeholder", async () => {
    const { loadPrompt } = await import("@/lib/agents/base-agent");
    const result = loadPrompt("tiktok", "01_orquestador");

    expect(result).toContain("Eres el orquestador");
    expect(result).not.toContain("{{BASE_CONOCIMIENTO_PATH}}");
    expect(result).toContain("base_conocimiento");
  });

  it("should return cached prompt on second call", async () => {
    const { readFileSync } = await import("fs");
    const { loadPrompt } = await import("@/lib/agents/base-agent");

    loadPrompt("tiktok", "01_orquestador");
    loadPrompt("tiktok", "01_orquestador");

    // readFileSync called once for the prompt (cached second time)
    expect(readFileSync).toHaveBeenCalledTimes(1);
  });

  it("should throw on missing prompt file", async () => {
    const { loadPrompt } = await import("@/lib/agents/base-agent");
    expect(() => loadPrompt("nonexistent", "nonexistent")).toThrow();
  });
});
