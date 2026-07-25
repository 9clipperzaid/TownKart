import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ZodError } from "zod";

export const Route = createFileRoute("/api/mobile/openwa-otp/request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { requestOpenWaOtp } = await import("@/lib/openwa-otp.server");
          const body = (await request.json()) as { phone?: unknown };
          const result = await requestOpenWaOtp(String(body.phone ?? ""));
          return Response.json(result);
        } catch (error) {
          const message =
            error instanceof ZodError
              ? error.issues[0]?.message ?? "Invalid phone number."
              : error instanceof Error
                ? error.message
                : "Could not send OTP.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
