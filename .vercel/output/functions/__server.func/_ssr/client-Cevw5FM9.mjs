import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
function isMissingSupabaseValue(value, placeholders) {
  if (!value) return true;
  return placeholders.some((placeholder) => value.includes(placeholder));
}
function createSupabaseClient() {
  const isBrowser = typeof window !== "undefined";
  const SUPABASE_URL = isBrowser ? "https://jyznyfixflldxoxpcvof.supabase.co" : process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = isBrowser ? "sb_publishable_PsJNWzuKuO9clXHkuRPoGw_UbbGrRhE" : process.env.SUPABASE_PUBLISHABLE_KEY;
  const missingUrl = isMissingSupabaseValue(SUPABASE_URL, ["your-project.supabase.co"]);
  const missingPublishableKey = isMissingSupabaseValue(SUPABASE_PUBLISHABLE_KEY, [
    "your-publishable-key"
  ]);
  if (missingUrl || missingPublishableKey) {
    const missing = [
      ...isBrowser && missingUrl ? ["VITE_SUPABASE_URL"] : [],
      ...isBrowser && missingPublishableKey ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : [],
      ...!isBrowser && missingUrl ? ["SUPABASE_URL"] : [],
      ...!isBrowser && missingPublishableKey ? ["SUPABASE_PUBLISHABLE_KEY"] : []
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Set your real Supabase URL and publishable key.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
export {
  supabase as s
};
