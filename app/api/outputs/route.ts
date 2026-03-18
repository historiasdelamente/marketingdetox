import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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
