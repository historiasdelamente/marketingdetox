import { NextRequest } from "next/server";
import { addListener, removeListener } from "@/lib/jobs/queue";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const listener = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        // Close stream on complete or error
        const parsed = JSON.parse(data);
        if (parsed.type === "complete" || parsed.type === "error") {
          setTimeout(() => {
            try {
              controller.close();
            } catch {
              // already closed
            }
          }, 100);
        }
      };

      addListener(jobId, listener);

      // Clean up on abort
      _req.signal.addEventListener("abort", () => {
        removeListener(jobId, listener);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
