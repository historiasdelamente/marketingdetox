import { NextRequest, NextResponse } from "next/server";
import { sendEmail, sendBulkEmail } from "@/lib/email/ses-client";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, subject, html, bulk } = await req.json();

  if (!to || !subject || !html) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, html" },
      { status: 400 }
    );
  }

  try {
    if (bulk && Array.isArray(to)) {
      const result = await sendBulkEmail(to, subject, html);
      return NextResponse.json({ success: true, ...result });
    }

    const messageId = await sendEmail({ to, subject, html });
    return NextResponse.json({ success: true, messageId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
