import { b as createSsrRpc } from "./router-B7ppZeuD.mjs";
import { c as createServerFn } from "./server-CR4UkH38.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-v_CxfV_5.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
const phoneSchema = stringType().trim().regex(/^\+?[0-9\s-]{8,18}$/, "Enter a valid phone number");
const sendOtp = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: phoneSchema
}).parse(d)).handler(createSsrRpc("3d5e698f221dd29c57219887dc5962cf2d5363d4eb2f301862ec416ee612548b"));
const syncGoogleLoginProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  phone: stringType().trim().max(30).optional().nullable()
}).parse(d)).handler(createSsrRpc("c05004e446f280126d135d931e049376e5a231e2d791f440b3d0fb9f35ba2ce2"));
const verifyOtp = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: phoneSchema,
  code: stringType().regex(/^\d{6}$/, "Enter the 6-digit code"),
  fullName: stringType().trim().max(80).optional()
}).parse(d)).handler(createSsrRpc("9a8e9c246ad5eb913400de7bc2aa33f95e62ce293d5c7fcf0d4a8f2148dd7943"));
export {
  sendOtp as a,
  syncGoogleLoginProfile as s,
  verifyOtp as v
};
