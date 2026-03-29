import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'marketingdetox.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      agent_type TEXT NOT NULL,
      input_params TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      progress TEXT,
      output_files TEXT,
      error_message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS knowledge_docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      last_synced TEXT,
      source_modified TEXT
    );

    CREATE TABLE IF NOT EXISTS outputs (
      id TEXT PRIMARY KEY,
      job_id TEXT REFERENCES jobs(id),
      agent_type TEXT NOT NULL,
      title TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS wa_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manychat_id TEXT UNIQUE NOT NULL,
      name TEXT,
      funnel_stage TEXT DEFAULT 'new_lead',
      situacion_resumen TEXT,
      first_contact TEXT DEFAULT (datetime('now')),
      last_interaction TEXT DEFAULT (datetime('now')),
      conversation_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS wa_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES wa_users(manychat_id),
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      phase TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export type Job = {
  id: string;
  agent_type: string;
  input_params: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: string | null;
  output_files: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type Output = {
  id: string;
  job_id: string | null;
  agent_type: string;
  title: string;
  file_type: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  metadata: string | null;
};

export type WaUser = {
  id: number;
  manychat_id: string;
  name: string | null;
  funnel_stage: string;
  situacion_resumen: string | null;
  first_contact: string;
  last_interaction: string;
  conversation_count: number;
};

export type WaConversation = {
  id: number;
  user_id: string;
  role: 'user' | 'assistant';
  message: string;
  phase: string | null;
  created_at: string;
};
