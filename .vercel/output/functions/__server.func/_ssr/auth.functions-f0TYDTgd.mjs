import { c as createServerRpc } from "./createServerRpc-BXSVlsDi.mjs";
import { c as createServerFn } from "./server-CR4UkH38.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-v_CxfV_5.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { s as stringType, o as objectType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const phoneSchema = stringType().trim().regex(/^\+?[0-9\s-]{8,18}$/, "Enter a valid phone number");
function normalizePhone(raw) {
  return raw.replace(/\D/g, "");
}
function googleProfileFromMetadata(user) {
  const metadata = user.user_metadata ?? {};
  return {
    fullName: typeof metadata.full_name === "string" ? metadata.full_name : typeof metadata.name === "string" ? metadata.name : null,
    email: user.email ?? null,
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : typeof metadata.picture === "string" ? metadata.picture : null
  };
}
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const sendOtp_createServerFn_handler = createServerRpc({
  id: "3d5e698f221dd29c57219887dc5962cf2d5363d4eb2f301862ec416ee612548b",
  name: "sendOtp",
  filename: "src/lib/auth.functions.ts"
}, (opts) => sendOtp.__executeServer(opts));
const sendOtp = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: phoneSchema
}).parse(d)).handler(sendOtp_createServerFn_handler, async ({
  data
}) => {
  const digits = normalizePhone(data.phone);
  if (digits.length < 8) throw new Error("Enter a valid phone number");
  const {
    supabaseAdmin
  } = await import("./client.server-CjUexK5y.mjs");
  const since = new Date(Date.now() - 60 * 60 * 1e3).toISOString();
  const {
    count
  } = await supabaseAdmin.from("otp_codes").select("*", {
    count: "exact",
    head: true
  }).eq("phone", digits).gte("created_at", since);
  if ((count ?? 0) >= 5) {
    throw new Error("Too many requests. Please try again later.");
  }
  const code = String(Math.floor(1e5 + Math.random() * 9e5));
  const code_hash = await sha256(`${digits}:${code}`);
  const expires_at = new Date(Date.now() + 5 * 60 * 1e3).toISOString();
  const {
    error
  } = await supabaseAdmin.from("otp_codes").insert({
    phone: digits,
    code_hash,
    expires_at
  });
  if (error) {
    console.error("[Auth] Failed to insert OTP code", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw new Error("Could not start verification. Check Supabase OTP table and service role key.");
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
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: `+${digits}`,
        From: fromNumber,
        Body: `Your TownKart verification code is ${code}. It expires in 5 minutes.`
      })
    });
    if (!res.ok) {
      console.error("[Twilio] send failed", res.status, await res.text());
      throw new Error("Could not send the SMS. Please try again.");
    }
    return {
      sent: true,
      devMode: false
    };
  }
  console.log(`[OTP dev] ${digits} -> ${code}`);
  return {
    sent: true,
    devMode: true,
    devCode: code
  };
});
const syncGoogleLoginProfile_createServerFn_handler = createServerRpc({
  id: "c05004e446f280126d135d931e049376e5a231e2d791f440b3d0fb9f35ba2ce2",
  name: "syncGoogleLoginProfile",
  filename: "src/lib/auth.functions.ts"
}, (opts) => syncGoogleLoginProfile.__executeServer(opts));
const syncGoogleLoginProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  phone: stringType().trim().max(30).optional().nullable()
}).parse(d)).handler(syncGoogleLoginProfile_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-CjUexK5y.mjs");
  const {
    data: authUser,
    error: userError
  } = await supabaseAdmin.auth.admin.getUserById(context.userId);
  if (userError || !authUser.user) {
    throw new Error(userError?.message ?? "Could not load signed-in user.");
  }
  const {
    fullName,
    email,
    avatarUrl
  } = googleProfileFromMetadata(authUser.user);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const phone = data.phone && phoneSchema.safeParse(data.phone).success ? normalizePhone(data.phone) : null;
  const {
    data: existing
  } = await supabaseAdmin.from("profiles").select("id, full_name, phone").eq("id", context.userId).maybeSingle();
  const profileBase = {
    id: context.userId,
    full_name: fullName ?? existing?.full_name ?? null,
    email,
    avatar_url: avatarUrl,
    provider: "google",
    last_login_at: now
  };
  const {
    error: upsertError
  } = await supabaseAdmin.from("profiles").upsert(profileBase, {
    onConflict: "id"
  });
  if (upsertError) throw new Error(upsertError.message);
  if (!phone) return {
    ok: true,
    phoneSaved: false,
    reason: "missing_phone"
  };
  const {
    data: phoneOwner
  } = await supabaseAdmin.from("profiles").select("id").eq("phone", phone).maybeSingle();
  if (phoneOwner && phoneOwner.id !== context.userId) {
    return {
      ok: true,
      phoneSaved: false,
      reason: "phone_in_use"
    };
  }
  const {
    error: phoneError
  } = await supabaseAdmin.from("profiles").update({
    phone,
    is_verified: false
  }).eq("id", context.userId);
  if (phoneError) throw new Error(phoneError.message);
  return {
    ok: true,
    phoneSaved: true,
    reason: null
  };
});
const verifyOtp_createServerFn_handler = createServerRpc({
  id: "9a8e9c246ad5eb913400de7bc2aa33f95e62ce293d5c7fcf0d4a8f2148dd7943",
  name: "verifyOtp",
  filename: "src/lib/auth.functions.ts"
}, (opts) => verifyOtp.__executeServer(opts));
const verifyOtp = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: phoneSchema,
  code: stringType().regex(/^\d{6}$/, "Enter the 6-digit code"),
  fullName: stringType().trim().max(80).optional()
}).parse(d)).handler(verifyOtp_createServerFn_handler, async ({
  data
}) => {
  const digits = normalizePhone(data.phone);
  const {
    supabaseAdmin
  } = await import("./client.server-CjUexK5y.mjs");
  const {
    data: rows
  } = await supabaseAdmin.from("otp_codes").select("*").eq("phone", digits).is("consumed_at", null).order("created_at", {
    ascending: false
  }).limit(1);
  const otp = rows?.[0];
  if (!otp) throw new Error("No active code. Please request a new one.");
  if (new Date(otp.expires_at).getTime() < Date.now()) throw new Error("Code expired. Please request a new one.");
  if (otp.attempts >= 5) throw new Error("Too many attempts. Please request a new code.");
  const hash = await sha256(`${digits}:${data.code}`);
  if (hash !== otp.code_hash) {
    await supabaseAdmin.from("otp_codes").update({
      attempts: otp.attempts + 1
    }).eq("id", otp.id);
    throw new Error("Incorrect code. Please try again.");
  }
  await supabaseAdmin.from("otp_codes").update({
    consumed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", otp.id);
  const email = `${digits}@phone.kazba.app`;
  const password = `${crypto.randomUUID()}Aa1!`;
  const {
    data: existing
  } = await supabaseAdmin.from("profiles").select("id, full_name").eq("phone", digits).maybeSingle();
  let userId;
  if (existing) {
    userId = existing.id;
    const {
      error
    } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password
    });
    if (error) throw new Error("Could not sign you in. Try again.");
  } else {
    const {
      data: created,
      error
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        phone: digits,
        full_name: data.fullName ?? null
      }
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create your account.");
    userId = created.user.id;
  }
  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    phone: digits,
    email,
    full_name: data.fullName ?? existing?.full_name ?? null,
    provider: "phone",
    is_verified: true,
    last_login_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "id"
  });
  await supabaseAdmin.from("user_roles").upsert({
    user_id: userId,
    role: "customer"
  }, {
    onConflict: "user_id,role"
  });
  return {
    email,
    password
  };
});
export {
  sendOtp_createServerFn_handler,
  syncGoogleLoginProfile_createServerFn_handler,
  verifyOtp_createServerFn_handler
};
