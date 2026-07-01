import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{8,18}$/, "Enter a valid phone number");

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

function googleProfileFromMetadata(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  return {
    fullName:
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : null,
    email: user.email ?? null,
    avatarUrl:
      typeof metadata.avatar_url === "string"
        ? metadata.avatar_url
        : typeof metadata.picture === "string"
          ? metadata.picture
          : null,
  };
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Step 1 — request an OTP for a phone number.
 * Sends via Twilio when configured, otherwise runs in dev mode and returns the
 * code so the flow is testable before an SMS provider is connected.
 */
export const sendOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string }) => z.object({ phone: phoneSchema }).parse(d))
  .handler(async ({ data }) => {
    const digits = normalizePhone(data.phone);
    if (digits.length < 8) throw new Error("Enter a valid phone number");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Basic rate limiting: max 5 codes per phone per hour.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("phone", digits)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) {
      throw new Error("Too many requests. Please try again later.");
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const code_hash = await sha256(`${digits}:${code}`);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from("otp_codes")
      .insert({ phone: digits, code_hash, expires_at });
    if (error) {
      console.error("[Auth] Failed to insert OTP code", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(
        "Could not start verification. Check Supabase OTP table and service role key.",
      );
    }

    const twilioKey = process.env.TWILIO_API_KEY;
    const lovableKey = process.env.LOVABLE_API_KEY;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (twilioKey && lovableKey && fromNumber) {
      const res = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": twilioKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `+${digits}`,
          From: fromNumber,
          Body: `Your TownKart verification code is ${code}. It expires in 5 minutes.`,
        }),
      });
      if (!res.ok) {
        console.error("[Twilio] send failed", res.status, await res.text());
        throw new Error("Could not send the SMS. Please try again.");
      }
      return { sent: true as const, devMode: false as const };
    }

    console.log(`[OTP dev] ${digits} -> ${code}`);
    return { sent: true as const, devMode: true as const, devCode: code };
  });

/**
 * Reliable Google profile sync after OAuth login.
 * Runs server-side with the authenticated user context so profile/email writes
 * are not dependent on client-side RLS timing after the redirect.
 */
export const syncGoogleLoginProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { phone?: string | null }) =>
    z.object({ phone: z.string().trim().max(30).optional().nullable() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: authUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      context.userId,
    );
    if (userError || !authUser.user) {
      throw new Error(userError?.message ?? "Could not load signed-in user.");
    }

    const { fullName, email, avatarUrl } = googleProfileFromMetadata(authUser.user);
    const now = new Date().toISOString();
    const phone =
      data.phone && phoneSchema.safeParse(data.phone).success ? normalizePhone(data.phone) : null;

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone")
      .eq("id", context.userId)
      .maybeSingle();

    const profileBase = {
      id: context.userId,
      full_name: fullName ?? existing?.full_name ?? null,
      email,
      avatar_url: avatarUrl,
      provider: "google",
      last_login_at: now,
    };

    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(profileBase, { onConflict: "id" });
    if (upsertError) throw new Error(upsertError.message);

    if (!phone) return { ok: true, phoneSaved: false, reason: "missing_phone" as const };

    const { data: phoneOwner } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (phoneOwner && phoneOwner.id !== context.userId) {
      return { ok: true, phoneSaved: false, reason: "phone_in_use" as const };
    }

    const { error: phoneError } = await supabaseAdmin
      .from("profiles")
      .update({ phone, is_verified: false })
      .eq("id", context.userId);
    if (phoneError?.code === "23505") {
      return { ok: true, phoneSaved: false, reason: "phone_in_use" as const };
    }
    if (phoneError) throw new Error(phoneError.message);

    return { ok: true, phoneSaved: true, reason: null };
  });

/**
 * Step 2 — verify the OTP and mint a session.
 * Creates/looks up the account, ensures the customer role and profile, then
 * returns single-use credentials the client uses to sign in immediately.
 */
export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; code: string; fullName?: string }) =>
    z
      .object({
        phone: phoneSchema,
        code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
        fullName: z.string().trim().max(80).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const digits = normalizePhone(data.phone);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("phone", digits)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    const otp = rows?.[0];
    if (!otp) throw new Error("No active code. Please request a new one.");
    if (new Date(otp.expires_at).getTime() < Date.now())
      throw new Error("Code expired. Please request a new one.");
    if (otp.attempts >= 5) throw new Error("Too many attempts. Please request a new code.");

    const hash = await sha256(`${digits}:${data.code}`);
    if (hash !== otp.code_hash) {
      await supabaseAdmin
        .from("otp_codes")
        .update({ attempts: otp.attempts + 1 })
        .eq("id", otp.id);
      throw new Error("Incorrect code. Please try again.");
    }

    await supabaseAdmin
      .from("otp_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", otp.id);

    const email = `${digits}@phone.kazba.app`;
    const password = `${crypto.randomUUID()}Aa1!`;

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("phone", digits)
      .maybeSingle();

    let userId: string;
    if (existing) {
      userId = existing.id;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
      });
      if (error) throw new Error("Could not sign you in. Try again.");
    } else {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone: digits, full_name: data.fullName ?? null },
      });
      if (error || !created.user)
        throw new Error(error?.message ?? "Could not create your account.");
      userId = created.user.id;
    }

    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        phone: digits,
        email,
        full_name: data.fullName ?? existing?.full_name ?? null,
        provider: "phone",
        is_verified: true,
        last_login_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "customer" }, { onConflict: "user_id,role" });

    return { email, password };
  });
