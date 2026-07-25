import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ZodError } from "zod";

export const Route = createFileRoute("/api/mobile/openwa-otp/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { verifyOpenWaOtp } = await import("@/lib/openwa-otp.server");
          const body = (await request.json()) as { phone?: unknown; code?: unknown };
          const result = await verifyOpenWaOtp(
            String(body.phone ?? ""),
            String(body.code ?? ""),
          );
          return Response.json(result);
        } catch (error) {
          const message =
            error instanceof ZodError
              ? error.issues[0]?.message ?? "Invalid verification code."
              : error instanceof Error
                ? error.message
                : "Could not verify OTP.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
