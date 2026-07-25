import { z } from "zod";

export const openWaPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{8,18}$/, "Enter a valid phone number");

export const openWaVerifySchema = z.object({
  phone: openWaPhoneSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export function normalizeOpenWaPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function buildOpenWaOtpMessage(code: string): string {
  const template =
    process.env.OPENWA_OTP_MESSAGE_TEMPLATE ??
    "Your TownKart verification code is {{code}}. It expires in {{minutes}} minutes. Do not share this code with anyone.";

  if (!template.includes("{{code}}")) {
    throw new Error("OPENWA_OTP_MESSAGE_TEMPLATE must contain {{code}}.");
  }

  return template
    .replaceAll("{{code}}", code)
    .replaceAll("{{minutes}}", "5");
}

async function sendThroughOpenWa(phone: string, code: string): Promise<void> {
  const baseUrl = process.env.OPENWA_BASE_URL?.replace(/\/+$/, "");
  const apiKey = process.env.OPENWA_API_KEY;
  const sessionId = process.env.OPENWA_SESSION_ID;

  if (!baseUrl || !apiKey || !sessionId) {
    throw new Error("WhatsApp OTP service is not configured.");
  }

  const response = await fetch(
    `${baseUrl}/api/sessions/${encodeURIComponent(sessionId)}/messages/send-text`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        chatId: `${phone}@c.us`,
        text: buildOpenWaOtpMessage(code),
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    console.error("[OpenWA] OTP send failed", response.status, await response.text());
    throw new Error("Could not send the WhatsApp OTP. Please try again.");
  }
}

export async function requestOpenWaOtp(rawPhone: string) {
  const phone = normalizeOpenWaPhone(openWaPhoneSchema.parse(rawPhone));
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("otp_codes")
    .select("*", { count: "exact", head: true })
    .eq("phone", phone)
    .gte("created_at", since);
  if ((count ?? 0) >= 5) {
    throw new Error("Too many requests. Please try again later.");
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await sha256(`${phone}:${code}`);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin
    .from("otp_codes")
    .insert({ phone, code_hash: codeHash, expires_at: expiresAt });
  if (error) throw new Error("Could not start phone verification.");

  try {
    await sendThroughOpenWa(phone, code);
  } catch (error) {
    await supabaseAdmin
      .from("otp_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("phone", phone)
      .eq("code_hash", codeHash);
    throw error;
  }

  return { sent: true as const };
}

export async function verifyOpenWaOtp(rawPhone: string, code: string) {
  const parsed = openWaVerifySchema.parse({ phone: rawPhone, code });
  const phone = normalizeOpenWaPhone(parsed.phone);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rows } = await supabaseAdmin
    .from("otp_codes")
    .select("*")
    .eq("phone", phone)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  const otp = rows?.[0];

  if (!otp) throw new Error("No active code. Please request a new one.");
  if (new Date(otp.expires_at).getTime() < Date.now()) {
    throw new Error("Code expired. Please request a new one.");
  }
  if (otp.attempts >= 5) {
    throw new Error("Too many attempts. Please request a new code.");
  }

  const hash = await sha256(`${phone}:${parsed.code}`);
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

  const email = `${phone}@phone.kazba.app`;
  const password = `${crypto.randomUUID()}Aa1!`;
  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  let userId: string;
  if (existing) {
    userId = existing.id;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
    if (error) throw new Error("Could not sign you in. Try again.");
  } else {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone },
    });
    if (error || !created.user) {
      throw new Error(error?.message ?? "Could not create your account.");
    }
    userId = created.user.id;
  }

  await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      phone,
      email,
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
}
