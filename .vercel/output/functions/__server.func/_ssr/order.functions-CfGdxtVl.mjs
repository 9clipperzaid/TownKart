import { b as createSsrRpc } from "./router-B7ppZeuD.mjs";
import { c as createServerFn } from "./server-CR4UkH38.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-v_CxfV_5.mjs";
import { o as objectType, s as stringType, e as enumType, n as numberType } from "../_libs/zod.mjs";
const addressSchema = stringType().trim().min(10, "Add a complete delivery address").max(500);
const latitudeSchema = numberType().min(-90).max(90).optional().nullable();
const longitudeSchema = numberType().min(-180).max(180).optional().nullable();
const paymentMethodSchema = enumType(["cod", "online"]).default("cod");
const ORDER_STATUSES = ["pending", "accepted", "preparing", "out_for_delivery", "delivered", "cancelled"];
const secureCheckout = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  address: addressSchema,
  deliveryLatitude: latitudeSchema,
  deliveryLongitude: longitudeSchema,
  deliveryLocationAccuracy: numberType().min(0).max(1e5).optional().nullable(),
  paymentMethod: paymentMethodSchema,
  paymentReference: stringType().trim().max(120).optional().nullable(),
  couponCode: stringType().trim().max(40).optional(),
  idempotencyKey: stringType().trim().min(10).max(120)
}).parse(d)).handler(createSsrRpc("ee75e13f51a68c12c81d3d4bc9591c4ebe736c79b69574518fc8c168f81522d1"));
const listOperationalOrders = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("317e964440d715a570ccfeed7b0f162cdf09ebe3f7bfe9bee8501ce9a7de583c"));
const getMyOrderDetail = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  orderId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("27c8462e9d1bbee675be230aedd550e5ff3015b84a3180fc2260078d1380e072"));
const cancelMyOrder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  orderId: stringType().uuid(),
  reason: stringType().trim().min(5, "Please tell us why you want to cancel.").max(500)
}).parse(d)).handler(createSsrRpc("43fa2bfdbe36916f98bc4f12d16f732989767a8f115ce3464154d96421364102"));
const updateOrderStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  orderId: stringType().uuid(),
  status: enumType(ORDER_STATUSES),
  deliveryPartnerId: stringType().uuid().nullable().optional(),
  notes: stringType().trim().max(500).optional()
}).parse(d)).handler(createSsrRpc("f9a35b2de66abfcb15ca7b3cd14f1d1b7929aec992662edc8b3bf598c32b4bb3"));
export {
  cancelMyOrder as c,
  getMyOrderDetail as g,
  listOperationalOrders as l,
  secureCheckout as s,
  updateOrderStatus as u
};
