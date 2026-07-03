import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendNewOrderPushNotification } from "@/lib/fcm.server";

const addressSchema = z.string().trim().min(10, "Add a complete delivery address").max(500);
const latitudeSchema = z.number().min(-90).max(90).optional().nullable();
const longitudeSchema = z.number().min(-180).max(180).optional().nullable();
const paymentMethodSchema = z.enum(["cod", "online"]).default("cod");

const ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;
const CUSTOMER_CANCELLABLE_STATUSES = ["pending", "accepted"] as const;

async function getAdmin(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

async function canManageStore(userId: string, storeId: string | null) {
  if (!storeId) return false;
  const supabaseAdmin = await getAdmin();
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if ((roles ?? []).some((r) => r.role === "admin" || r.role === "super_admin")) {
    return true;
  }
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("owner_id")
    .eq("id", storeId)
    .maybeSingle();
  return store?.owner_id === userId;
}

export const secureCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        address: addressSchema,
        deliveryLatitude: latitudeSchema,
        deliveryLongitude: longitudeSchema,
        deliveryLocationAccuracy: z.number().min(0).max(100000).optional().nullable(),
        paymentMethod: paymentMethodSchema,
        paymentReference: z.string().trim().max(120).optional().nullable(),
        couponCode: z.string().trim().max(40).optional(),
        idempotencyKey: z.string().trim().min(10).max(120),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await getAdmin();
    const userId = context.userId;

    const { data: existing } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("customer_id", userId)
      .like("idempotency_key", `${data.idempotencyKey}:%`)
      .limit(1);
    if (existing?.length) return { orderIds: existing.map((o) => o.id), duplicate: true };

    const { data: rows, error } = await supabaseAdmin
      .from("cart_items")
      .select(
        "id, quantity, product_id, selected_unit, unit_price, products(id, name, price, discount_price, is_available, stock_quantity, store_id, stores(id, name, delivery_fee, min_order, is_active))",
      )
      .eq("user_id", userId);
    if (error) throw new Error("Could not load cart.");
    if (!rows?.length) throw new Error("Your cart is empty.");

    const { data: paymentRow } = await (supabaseAdmin as any)
      .from("marketplace_settings")
      .select("value")
      .eq("key", "payment")
      .maybeSingle();
    const { data: orderSettingsRow } = await (supabaseAdmin as any)
      .from("marketplace_settings")
      .select("value")
      .eq("key", "store_orders")
      .maybeSingle();
    const orderSettings = orderSettingsRow?.value ?? {
      orders_enabled: true,
      closed_message: "Store is closed right now. Please order again tomorrow.",
    };
    if (orderSettings.orders_enabled === false) {
      throw new Error(
        orderSettings.closed_message || "Store is closed right now. Please order again tomorrow.",
      );
    }
    const paymentSettings = paymentRow?.value ?? { cod_enabled: true, online_enabled: false };
    if (data.paymentMethod === "cod" && paymentSettings.cod_enabled === false) {
      throw new Error("Cash on delivery is currently disabled.");
    }
    if (data.paymentMethod === "online" && paymentSettings.online_enabled !== true) {
      throw new Error("Online payment is currently disabled.");
    }
    if (data.paymentMethod === "online" && !data.paymentReference) {
      throw new Error("Add your online payment reference/UTR number.");
    }

    const groups = new Map<string, typeof rows>();
    for (const row of rows) {
      const product = row.products;
      if (!product || !product.is_available || product.stock_quantity < row.quantity) {
        throw new Error(`${product?.name ?? "An item"} is unavailable or out of stock.`);
      }
      const store = product.stores;
      if (!store?.is_active)
        throw new Error(`${store?.name ?? "A store"} is not accepting orders.`);
      const key = product.store_id;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    await supabaseAdmin.from("profiles").update({ address: data.address }).eq("id", userId);

    const orderIds: string[] = [];
    for (const [storeId, items] of groups) {
      const orderIdempotencyKey = `${data.idempotencyKey}:${storeId}`;
      const firstProduct = items[0].products!;
      const store = firstProduct.stores!;
      const subtotal = items.reduce((sum, item) => {
        const p = item.products!;
        return sum + Number(item.unit_price ?? p.discount_price ?? p.price) * item.quantity;
      }, 0);
      if (subtotal < Number(store.min_order ?? 0)) {
        throw new Error(`${store.name} has a minimum order of Rs ${store.min_order}.`);
      }
      const deliveryFee = Number(store.delivery_fee ?? 25);
      const total = subtotal + deliveryFee;

      const { data: order, error: orderErr } = await supabaseAdmin
        .from("orders")
        .insert({
          customer_id: userId,
          store_id: storeId,
          store_name: store.name,
          status: "pending",
          subtotal,
          delivery_fee: deliveryFee,
          total,
          address: data.address,
          delivery_latitude: data.deliveryLatitude ?? null,
          delivery_longitude: data.deliveryLongitude ?? null,
          delivery_location_accuracy: data.deliveryLocationAccuracy ?? null,
          payment_method: data.paymentMethod === "online" ? "Online payment" : "Cash on delivery",
          payment_status: data.paymentMethod === "online" ? "pending_verification" : "pending",
          payment_reference: data.paymentReference ?? null,
          idempotency_key: orderIdempotencyKey,
          tracking_code: `KZ${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        })
        .select("id")
        .single();
      if (orderErr || !order) throw new Error("Could not place order.");

      const orderItems = items.map((item) => {
        const p = item.products!;
        return {
          order_id: order.id,
          product_id: item.product_id,
          name: item.selected_unit ? `${p.name} (${item.selected_unit})` : p.name,
          quantity: item.quantity,
          unit_price: Number(item.unit_price ?? p.discount_price ?? p.price),
        };
      });
      const { error: itemErr } = await supabaseAdmin.from("order_items").insert(orderItems);
      if (itemErr) throw new Error("Could not save order items.");

      for (const item of items) {
        await supabaseAdmin
          .from("products")
          .update({ stock_quantity: item.products!.stock_quantity - item.quantity })
          .eq("id", item.product_id);
      }

      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        title: "Order placed",
        body: `${store.name} received your order.`,
        type: "order",
      });

      await sendNewOrderPushNotification({
        orderId: order.id,
        storeId,
        storeName: store.name,
        total,
      }).catch((error) => {
        console.warn("Could not send FCM order notification", error);
      });

      orderIds.push(order.id);
    }

    await supabaseAdmin.from("cart_items").delete().eq("user_id", userId);
    return { orderIds, duplicate: false };
  });

export const listOperationalOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabaseAdmin = await getAdmin();
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roleList = (roles ?? []).map((r) => r.role);

    let query = supabaseAdmin
      .from("orders")
      .select(
        "*, order_items(id, product_id, name, quantity, unit_price, products(id, name, unit, price, discount_price, is_available, store_id))",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (roleList.includes("store_manager") || roleList.includes("vendor")) {
      const { data: stores } = await supabaseAdmin
        .from("stores")
        .select("id")
        .eq("owner_id", context.userId);
      query = query.in(
        "store_id",
        (stores ?? []).map((s) => s.id),
      );
    } else if (roleList.includes("rider") || roleList.includes("delivery_partner")) {
      query = query.eq("delivery_partner_id", context.userId);
    } else if (!roleList.includes("admin") && !roleList.includes("super_admin")) {
      throw new Error("Forbidden.");
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyOrderDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await getAdmin();
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(product_id, name, quantity, unit_price)")
      .eq("id", data.orderId)
      .eq("customer_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found.");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", context.userId)
      .maybeSingle();
    return { ...order, profiles: profile };
  });

export const cancelMyOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        reason: z.string().trim().min(5, "Please tell us why you want to cancel.").max(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await getAdmin();
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, customer_id, status, payment_status, order_items(product_id, quantity)")
      .eq("id", data.orderId)
      .eq("customer_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found.");
    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status as any)) {
      throw new Error(
        "This order can no longer be cancelled from the app. Please contact support.",
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "cancelled",
        cancellation_reason: data.reason,
        cancelled_by: context.userId,
        cancelled_at: new Date().toISOString(),
        payment_status:
          order.payment_status === "paid" || order.payment_status === "pending_verification"
            ? "refund_required"
            : order.payment_status,
      })
      .eq("id", data.orderId)
      .in("status", [...CUSTOMER_CANCELLABLE_STATUSES]);
    if (updateError) throw new Error(updateError.message);

    for (const item of order.order_items ?? []) {
      if (!item.product_id) continue;
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("stock_quantity")
        .eq("id", item.product_id)
        .maybeSingle();
      if (!product) continue;
      await supabaseAdmin
        .from("products")
        .update({
          stock_quantity: Number(product.stock_quantity ?? 0) + Number(item.quantity ?? 0),
        })
        .eq("id", item.product_id);
    }

    await (supabaseAdmin as any).from("order_status_history").insert({
      order_id: data.orderId,
      status: "cancelled",
      changed_by: context.userId,
      notes: `Customer cancelled: ${data.reason}`,
    });

    return { ok: true };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        status: z.enum(ORDER_STATUSES),
        deliveryPartnerId: z.string().uuid().nullable().optional(),
        notes: z.string().trim().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await getAdmin();
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, store_id, customer_id")
      .eq("id", data.orderId)
      .single();
    if (!order) throw new Error("Order not found.");
    if (!(await canManageStore(context.userId, order.store_id))) {
      throw new Error("Forbidden.");
    }

    const update: Record<string, unknown> = { status: data.status };
    if (data.deliveryPartnerId !== undefined) {
      update.delivery_partner_id = data.deliveryPartnerId;
    }

    const { error } = await supabaseAdmin.from("orders").update(update).eq("id", data.orderId);
    if (error) throw new Error(error.message);

    await (supabaseAdmin as any).from("order_status_history").insert({
      order_id: data.orderId,
      status: data.status,
      changed_by: context.userId,
      notes: data.notes ?? null,
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: order.customer_id,
      title: "Order update",
      body: `Your order is now ${data.status.replaceAll("_", " ")}.`,
      type: "order",
    });
    return { ok: true };
  });
