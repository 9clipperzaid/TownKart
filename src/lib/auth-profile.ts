import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const PENDING_GOOGLE_PHONE_KEY = "townkart:pendingGooglePhone";

function safeStorageGet(storage: Storage | undefined, key: string) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeStorageSet(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Ignore storage failures; the user can still complete Google auth.
  }
}

function safeStorageRemove(storage: Storage | undefined, key: string) {
  try {
    storage?.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

export function normalizePhoneNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function isValidPhoneNumber(raw: string): boolean {
  const digits = normalizePhoneNumber(raw);
  return digits.length >= 8 && digits.length <= 18;
}

export function storePendingGooglePhone(raw: string) {
  const phone = normalizePhoneNumber(raw);
  if (typeof window === "undefined") return;
  safeStorageSet(window.localStorage, PENDING_GOOGLE_PHONE_KEY, phone);
  safeStorageSet(window.sessionStorage, PENDING_GOOGLE_PHONE_KEY, phone);
}

export function getPendingGooglePhone() {
  if (typeof window === "undefined") return null;
  return (
    safeStorageGet(window.localStorage, PENDING_GOOGLE_PHONE_KEY) ??
    safeStorageGet(window.sessionStorage, PENDING_GOOGLE_PHONE_KEY)
  );
}

export function clearPendingGooglePhone() {
  if (typeof window === "undefined") return;
  safeStorageRemove(window.localStorage, PENDING_GOOGLE_PHONE_KEY);
  safeStorageRemove(window.sessionStorage, PENDING_GOOGLE_PHONE_KEY);
}

function googleProfileFromUser(user: User) {
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

/**
 * Keeps the public profile table in sync after Google OAuth completes.
 * Future OTP re-enable point: keep this helper for Google and add a parallel
 * phone profile sync when the commented OTP login flow is turned back on.
 */
export async function syncGoogleProfile(user: User) {
  const { fullName, email, avatarUrl } = googleProfileFromUser(user);
  const now = new Date().toISOString();
  const pendingPhone = getPendingGooglePhone();
  const phone =
    pendingPhone && isValidPhoneNumber(pendingPhone) ? normalizePhoneNumber(pendingPhone) : null;

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id, phone, is_verified, provider")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const updateData: {
      last_login_at: string;
      email: string | null;
      phone?: string;
      is_verified?: boolean;
      provider?: string;
    } = {
      last_login_at: now,
      email,
    };
    if (phone) {
      updateData.phone = phone;
      updateData.is_verified = false;
    }
    if (existing.provider !== "google") updateData.provider = "google";

    const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id);
    if (error) throw error;
    clearPendingGooglePhone();
    return;
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName,
    phone,
    email,
    avatar_url: avatarUrl,
    provider: "google",
    is_verified: false,
    created_at: now,
    last_login_at: now,
  });

  if (error) throw error;
  clearPendingGooglePhone();
}
