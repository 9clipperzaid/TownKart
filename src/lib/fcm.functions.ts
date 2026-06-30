import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function getAdmin(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

export const registerFcmToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        token: z.string().trim().min(20).max(4096),
        userAgent: z.string().trim().max(500).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await getAdmin();
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin.from("fcm_push_tokens").upsert(
      {
        user_id: context.userId,
        token: data.token,
        user_agent: data.userAgent ?? null,
        updated_at: now,
        last_seen_at: now,
      },
      { onConflict: "token" },
    );

    if (error) throw new Error(error.message);
    return { ok: true };
  });
