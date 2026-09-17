import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Lightweight endpoint for platform health checks. It must not redirect or
 * depend on authentication, external services, or application data.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () => Response.json({ status: "ok" }),
    },
  },
});
