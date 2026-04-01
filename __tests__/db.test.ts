import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock better-sqlite3 with a constructor function
const mockExec = vi.fn();
const mockPragma = vi.fn();
const mockPrepare = vi.fn(() => ({
  run: vi.fn(),
  get: vi.fn(),
  all: vi.fn(() => []),
}));

vi.mock("better-sqlite3", () => {
  const MockDatabase = function () {
    return {
      exec: mockExec,
      pragma: mockPragma,
      prepare: mockPrepare,
    };
  };
  return { default: MockDatabase };
});

describe("db", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should initialize database with schema on first call", async () => {
    const { getDb } = await import("@/lib/db");
    const db = getDb();

    expect(db).toBeDefined();
    expect(mockPragma).toHaveBeenCalledWith("journal_mode = WAL");
    expect(mockPragma).toHaveBeenCalledWith("foreign_keys = ON");
    expect(mockExec).toHaveBeenCalledTimes(1);

    // Schema should create all tables
    const schema = mockExec.mock.calls[0][0] as string;
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS jobs");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS knowledge_docs");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS outputs");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS wa_users");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS wa_conversations");
  });

  it("should return same instance on subsequent calls (singleton)", async () => {
    const { getDb } = await import("@/lib/db");
    const db1 = getDb();
    const db2 = getDb();

    expect(db1).toBe(db2);
  });
});
