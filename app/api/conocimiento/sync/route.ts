import { NextResponse } from "next/server";
import { syncKnowledgeBase } from "@/lib/conocimiento/sync";

export async function POST() {
  try {
    const result = await syncKnowledgeBase();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
