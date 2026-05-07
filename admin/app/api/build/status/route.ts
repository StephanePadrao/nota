import { buildState } from "@/lib/build";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send() {
        const payload = JSON.stringify({
          status: buildState.status,
          logs: buildState.logs,
        });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      }

      send();

      if (buildState.status !== "building") {
        controller.close();
        return;
      }

      const interval = setInterval(() => {
        send();
        if (buildState.status !== "building") {
          clearInterval(interval);
          controller.close();
        }
      }, 500);
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
