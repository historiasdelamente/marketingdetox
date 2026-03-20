import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "outputs");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_type, title, content, file_type = "md" } = body;

    if (!agent_type || !title || !content) {
      return NextResponse.json(
        { error: "Faltan campos: agent_type, title, content" },
        { status: 400 }
      );
    }

    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const id = randomUUID();
    const safeName = title.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "-");
    const fileName = `${agent_type}-${safeName}-${Date.now()}.${file_type}`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    writeFileSync(filePath, content, "utf-8");
    const fileSize = Buffer.byteLength(content, "utf-8");

    const db = getDb();
    db.prepare(
      `INSERT INTO outputs (id, agent_type, title, file_type, file_path, file_size) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, agent_type, title, file_type, filePath, fileSize);

    return NextResponse.json({ id, fileName });
  } catch (err) {
    return NextResponse.json(
      { error: "Error guardando output" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const agentType = req.nextUrl.searchParams.get("agent_type");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

  const db = getDb();

  let outputs;
  if (agentType) {
    outputs = db
      .prepare(
        `SELECT * FROM outputs WHERE agent_type = ? ORDER BY created_at DESC LIMIT ?`
      )
      .all(agentType, limit);
  } else {
    outputs = db
      .prepare(`SELECT * FROM outputs ORDER BY created_at DESC LIMIT ?`)
      .all(limit);
  }

  return NextResponse.json({ outputs });
}
