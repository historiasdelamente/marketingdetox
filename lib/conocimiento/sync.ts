import { readdirSync, statSync, copyFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { getDb } from "@/lib/db";

const LOCAL_KB = path.join(process.cwd(), "base_conocimiento");

type SyncResult = {
  added: number;
  updated: number;
  unchanged: number;
};

export async function syncKnowledgeBase(): Promise<SyncResult> {
  const sourcePath = process.env.KNOWLEDGE_BASE_SOURCE;
  if (!sourcePath) {
    throw new Error("KNOWLEDGE_BASE_SOURCE not configured in .env.local");
  }

  if (!existsSync(sourcePath)) {
    throw new Error(`Source path does not exist: ${sourcePath}`);
  }

  const result: SyncResult = { added: 0, updated: 0, unchanged: 0 };
  const db = getDb();

  // Walk source directory
  const categories = readdirSync(sourcePath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const category of categories) {
    const categorySource = path.join(sourcePath, category);
    const categoryLocal = path.join(LOCAL_KB, category);
    mkdirSync(categoryLocal, { recursive: true });

    const files = readdirSync(categorySource, { withFileTypes: true })
      .filter((f) => f.isFile())
      .map((f) => f.name);

    for (const filename of files) {
      const sourceFile = path.join(categorySource, filename);
      const localFile = path.join(categoryLocal, filename);
      const sourceStat = statSync(sourceFile);
      const sourceModified = sourceStat.mtime.toISOString();

      // Check if exists locally and compare dates
      const existing = db
        .prepare(
          `SELECT * FROM knowledge_docs WHERE category = ? AND filename = ?`
        )
        .get(category, filename) as { source_modified: string } | undefined;

      if (!existing) {
        // New file
        copyFileSync(sourceFile, localFile);
        db.prepare(
          `INSERT INTO knowledge_docs (category, filename, file_path, file_size, last_synced, source_modified)
           VALUES (?, ?, ?, ?, datetime('now'), ?)`
        ).run(category, filename, localFile, sourceStat.size, sourceModified);
        result.added++;
      } else if (existing.source_modified !== sourceModified) {
        // Updated file
        copyFileSync(sourceFile, localFile);
        db.prepare(
          `UPDATE knowledge_docs SET file_size = ?, last_synced = datetime('now'), source_modified = ?
           WHERE category = ? AND filename = ?`
        ).run(sourceStat.size, sourceModified, category, filename);
        result.updated++;
      } else {
        result.unchanged++;
      }
    }
  }

  return result;
}
