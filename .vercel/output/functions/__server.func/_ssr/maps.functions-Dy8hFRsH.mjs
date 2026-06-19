import { c as createServerRpc } from "./createServerRpc-BXSVlsDi.mjs";
import { c as createServerFn } from "./server-CR4UkH38.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-v_CxfV_5.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const geocodeAddress_createServerFn_handler = createServerRpc({
  id: "1fa8cd42fb8cf91e966958a3ac686fb89d31e677c59670df4559bc460717c1df",
  name: "geocodeAddress",
  filename: "src/lib/maps.functions.ts"
}, (opts) => geocodeAddress.__executeServer(opts));
const geocodeAddress = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  address: stringType().trim().min(3).max(300)
}).parse(d)).handler(geocodeAddress_createServerFn_handler, async ({
  data
}) => {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!lovableKey || !mapsKey) {
    throw new Error("Maps service is not configured.");
  }
  const res = await fetch(`${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(data.address)}`, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": mapsKey
    }
  });
  if (!res.ok) {
    console.error("[geocode] gateway error", res.status, await res.text());
    throw new Error("Could not look up that address.");
  }
  const json = await res.json();
  if (json.status !== "OK" || !json.results.length) {
    throw new Error("No location found for that address.");
  }
  const top = json.results[0];
  return {
    latitude: top.geometry.location.lat,
    longitude: top.geometry.location.lng,
    formatted: top.formatted_address
  };
});
export {
  geocodeAddress_createServerFn_handler
};
