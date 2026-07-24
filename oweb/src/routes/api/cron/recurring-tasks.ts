import { createFileRoute } from "@tanstack/react-router";
import { getCronSecret } from "@/lib/env.server";
import { processRecurringTasks } from "@/lib/recurring.server";

export const Route = createFileRoute("/api/cron/recurring-tasks")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = getCronSecret();
        if (secret) {
          const auth = request.headers.get("authorization");
          if (auth !== `Bearer ${secret}`) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }
        }

        try {
          const result = await processRecurringTasks();
          return Response.json({ ok: true, ...result });
        } catch (error) {
          console.error(error);
          return Response.json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "Cron failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
