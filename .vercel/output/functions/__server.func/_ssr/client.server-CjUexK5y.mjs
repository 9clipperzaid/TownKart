import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function readRequiredSupabaseEnv(name, placeholders) {
  const value = process.env[name];
  const isPlaceholder = placeholders.some((placeholder) => value?.includes(placeholder));
  if (!value || isPlaceholder) {
    const message = `Missing Supabase environment variable(s): ${name}. Set your real Supabase URL and service role key.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return value;
}
function createSupabaseAdminClient() {
  const supabaseUrl = readRequiredSupabaseEnv("SUPABASE_URL", ["your-project.supabase.co"]);
  const serviceRoleKey = readRequiredSupabaseEnv("SUPABASE_SERVICE_ROLE_KEY", [
    "your-service-role-key",
    "your-publishable-key"
  ]);
  if (serviceRoleKey === process.env.SUPABASE_PUBLISHABLE_KEY || serviceRoleKey.startsWith("sb_publishable_")) {
    const message = "SUPABASE_SERVICE_ROLE_KEY must be the secret service_role key, not the publishable/anon key.";
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
let _supabaseAdmin;
function getSupabaseAdmin() {
  _supabaseAdmin ??= createSupabaseAdminClient();
  return _supabaseAdmin;
}
const supabaseAdmin = new Proxy({}, {
  get(_, prop) {
    return getSupabaseAdmin()[prop];
  }
});
export {
  supabaseAdmin
};
