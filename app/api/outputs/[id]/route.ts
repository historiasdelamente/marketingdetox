import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { readFileSync, existsSync } from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const output = db
    .prepare("SELECT * FROM outputs WHERE id = ?")
    .get(id) as { file_path: string; title: string; file_type: string } | undefined;

  if (!output) {
    return NextResponse.json({ error: "Output no encontrado" }, { status: 404 });
  }

  if (!existsSync(output.file_path)) {
    return NextResponse.json({ error: "Archivo no encontrado en disco" }, { status: 404 });
  }

  const content = readFileSync(output.file_path);
  const filename = `${output.title.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim()}.${output.file_type}`;

  const mimeTypes: Record<string, string> = {
    md: "text/markdown",
    html: "text/html",
    pdf: "application/pdf",
    txt: "text/plain",
  };

  return new NextResponse(content, {
    headers: {
      "Content-Type": mimeTypes[output.file_type] || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
