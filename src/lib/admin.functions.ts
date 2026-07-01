import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Throws unless the caller holds an admin or super_admin role. Returns roles. */
async function assertAdmin(userId: string) {
  const supabaseAdmin = await getAdmin();
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error("Could not verify permissions.");
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    throw new Error("Forbidden: admin access required.");
  }
  return roles;
}

async function logAction(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details?: Record<string, unknown>,
) {
  try {
    const supabaseAdmin = await getAdmin();
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: (details ?? null) as never,
    });
  } catch (e) {
    console.error("[audit] failed to record", e);
  }
}

// ---------------------------------------------------------------------------
// Dashboard / analytics
// ---------------------------------------------------------------------------

export const adminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();

    const [storesCount, categoriesCount, productsCount, usersCount, orders, priceChanges, stores] =
      await Promise.all([
        supabaseAdmin.from("stores").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("categories").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
        supabaseAdmin
          .from("orders")
          .select("id, total, status, store_name, customer_id, created_at")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("price_history")
          .select("id, product_id, old_price, new_price, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        supabaseAdmin.from("stores").select("id, name, category"),
      ]);

    const orderRows = orders.data ?? [];
    const now = Date.now();
    const last30 = now - 30 * 24 * 60 * 60 * 1000;

    const revenue = orderRows.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    const todayKey = new Date(now).toISOString().slice(0, 10);
    const monthKey = new Date(now).toISOString().slice(0, 7);
    const revenueToday = orderRows
      .filter((o) => new Date(o.created_at).toISOString().slice(0, 10) === todayKey)
      .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    const revenueThisMonth = orderRows
      .filter((o) => new Date(o.created_at).toISOString().slice(0, 7) === monthKey)
      .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    const activeUsers = new Set(
      orderRows.filter((o) => new Date(o.created_at).getTime() >= last30).map((o) => o.customer_id),
    ).size;

    // Sales by day (last 14 days)
    const days: { date: string; total: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, total: 0, orders: 0 });
    }
    const byDay = new Map(days.map((d) => [d.date, d]));
    for (const o of orderRows) {
      const key = new Date(o.created_at).toISOString().slice(0, 10);
      const bucket = byDay.get(key);
      if (bucket) {
        bucket.total += Number(o.total ?? 0);
        bucket.orders += 1;
      }
    }

    // Top products by order volume
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("name, quantity, unit_price");
    const productAgg = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const it of items ?? []) {
      const cur = productAgg.get(it.name) ?? { name: it.name, qty: 0, revenue: 0 };
      cur.qty += Number(it.quantity ?? 0);
      cur.revenue += Number(it.quantity ?? 0) * Number(it.unit_price ?? 0);
      productAgg.set(it.name, cur);
    }
    const topProducts = [...productAgg.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);

    // Popular categories by store count
    const catAgg = new Map<string, number>();
    for (const s of stores.data ?? []) {
      catAgg.set(s.category, (catAgg.get(s.category) ?? 0) + 1);
    }
    const popularCategories = [...catAgg.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totals: {
        stores: storesCount.count ?? 0,
        categories: categoriesCount.count ?? 0,
        products: productsCount.count ?? 0,
        users: usersCount.count ?? 0,
        activeUsers,
        revenue,
        revenueToday,
        revenueThisMonth,
        orders: orderRows.length,
        pendingOrders: orderRows.filter((o) => ["pending", "placed"].includes(String(o.status)))
          .length,
        deliveredOrders: orderRows.filter((o) => o.status === "delivered").length,
      },
      salesByDay: days,
      topProducts,
      popularCategories,
      topStores: [
        ...orderRows
          .reduce((map, order) => {
            const key = order.store_name ?? "Store";
            const cur = map.get(key) ?? { store: key, orders: 0, revenue: 0 };
            cur.orders += 1;
            cur.revenue += Number(order.total ?? 0);
            map.set(key, cur);
            return map;
          }, new Map<string, { store: string; orders: number; revenue: number }>())
          .values(),
      ]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6),
      recentPriceChanges: priceChanges.data ?? [],
    };
  });

// ---------------------------------------------------------------------------
// Call ordering
// ---------------------------------------------------------------------------

const callOrderSchema = z.object({
  primary_phone: z.string().trim().max(30),
  secondary_phone: z.string().trim().max(30).optional().nullable(),
  whatsapp_number: z.string().trim().max(30).optional().nullable(),
  is_enabled: z.boolean().default(true),
  available_from: z.string().trim().max(20).default("09:00"),
  available_to: z.string().trim().max(20).default("21:00"),
  instructions: z.string().trim().max(500).optional().nullable(),
});

export const getCallOrderSettings = createServerFn({ method: "GET" }).handler(async () => {
  const fallback = {
    primary_phone: "+919999999999",
    secondary_phone: "",
    whatsapp_number: "+919999999999",
    is_enabled: true,
    available_from: "09:00",
    available_to: "21:00",
    instructions:
      "Call us with your items, quantity, delivery address and preferred payment method.",
  };

  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin as any;
  const { data, error } = await db
    .from("call_order_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[call-order] using fallback settings", error);
  }

  return (error ? fallback : (data ?? fallback)) as {
    id?: string;
    primary_phone: string;
    secondary_phone: string | null;
    whatsapp_number: string | null;
    is_enabled: boolean;
    available_from: string;
    available_to: string;
    instructions?: string | null;
  };
});

export const adminSaveCallOrderSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => callOrderSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const db = supabaseAdmin as any;
    const { data: existing } = await db
      .from("call_order_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    const payload = { ...data, updated_at: new Date().toISOString() };
    const query = existing?.id
      ? db.from("call_order_settings").update(payload).eq("id", existing.id)
      : db.from("call_order_settings").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    await logAction(context.userId, "update", "call_order_settings", existing?.id ?? null, data);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Order and user detail
// ---------------------------------------------------------------------------

export const adminGetOrderDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(name, quantity, unit_price), stores(name, phone, address)")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found.");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", order.customer_id)
      .maybeSingle();
    const { data: history } = await (supabaseAdmin as any)
      .from("order_status_history")
      .select("*")
      .eq("order_id", data.orderId)
      .order("created_at", { ascending: true });
    return { ...order, profiles: profile, status_history: history ?? [] };
  });

export const adminGetUserDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; range?: "7" | "30" | "90" | "all" }) =>
    z
      .object({ userId: z.string().uuid(), range: z.enum(["7", "30", "90", "all"]).optional() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone, email, address, is_verified, is_blocked, created_at")
        .eq("id", data.userId)
        .maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", data.userId),
    ]);
    if (!profile) throw new Error("User not found.");

    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(name, quantity, unit_price)")
      .eq("customer_id", data.userId)
      .order("created_at", { ascending: false });
    if (data.range && data.range !== "all") {
      const since = new Date(Date.now() - Number(data.range) * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since);
    }
    const { data: orders, error } = await query;
    if (error) throw new Error(error.message);
    const rows = orders ?? [];
    const completed = rows.filter((o) => o.status === "delivered");
    const cancelled = rows.filter((o) => ["cancelled", "canceled"].includes(String(o.status)));
    const totalSpend = completed.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    return {
      profile,
      roles: (roles ?? []).map((r) => r.role),
      stats: {
        totalOrders: rows.length,
        completedOrders: completed.length,
        cancelledOrders: cancelled.length,
        totalSpend,
        averageOrderValue: completed.length ? totalSpend / completed.length : 0,
        lastOrderDate: rows[0]?.created_at ?? null,
      },
      addresses: profile.address ? [profile.address] : [],
      orders: rows,
    };
  });

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  key: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, - or _"),
  label: z.string().trim().min(1).max(60),
  emoji: z.string().trim().max(8).optional().nullable(),
  icon: z.string().trim().max(60).optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().max(300).optional().nullable(),
  sort_order: z.number().int().min(0).max(9999).default(0),
  is_enabled: z.boolean().default(true),
});

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categorySchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const payload = {
      key: data.key,
      label: data.label,
      emoji: data.emoji ?? null,
      icon: data.icon ?? null,
      image_url: data.image_url ?? null,
      description: data.description ?? null,
      sort_order: data.sort_order,
      is_enabled: data.is_enabled,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("categories").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      await logAction(context.userId, "update", "category", data.id, payload);
      return { id: data.id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("categories")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAction(context.userId, "create", "category", row.id, payload);
    return { id: row.id };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, "delete", "category", data.id);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

export const adminListStores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { data, error } = await supabaseAdmin
      .from("stores")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

const storeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(40),
  description: z.string().trim().max(500).optional().nullable(),
  logo_url: z.string().trim().max(500).optional().nullable(),
  banner_url: z.string().trim().max(500).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  opening_hours: z.string().trim().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  delivery_minutes: z.number().int().min(1).max(600).default(30),
  min_order: z.number().min(0).max(100000).default(0),
  rating: z.number().min(0).max(5).default(4.5),
  delivery_available: z.boolean().default(true),
  is_active: z.boolean().default(true),
  status: z.enum(["active", "pending", "suspended"]).default("active"),
});

export const adminSaveStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => storeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { id, ...rest } = data;
    const payload = {
      ...rest,
      is_active: data.status === "active",
    };
    if (id) {
      const { error } = await supabaseAdmin.from("stores").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      await logAction(context.userId, "update", "store", id, { name: data.name });
      return { id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("stores")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAction(context.userId, "create", "store", row.id, { name: data.name });
    return { id: row.id };
  });

export const adminSetStoreStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "active" | "pending" | "suspended" }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["active", "pending", "suspended"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { error } = await supabaseAdmin
      .from("stores")
      .update({ status: data.status, is_active: data.status === "active" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, "status_change", "store", data.id, {
      status: data.status,
    });
    return { ok: true };
  });

export const adminDeleteStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { error } = await supabaseAdmin.from("stores").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, "delete", "store", data.id);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { storeId?: string }) =>
    z.object({ storeId: z.string().uuid().optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    let query = supabaseAdmin
      .from("products")
      .select("*, stores(name)")
      .order("created_at", { ascending: false });
    if (data.storeId) query = query.eq("store_id", data.storeId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows;
  });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  store_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  category: z.string().trim().max(40).optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
  price: z.number().min(0).max(1000000),
  discount_price: z.number().min(0).max(1000000).optional().nullable(),
  unit: z.string().trim().max(30).default("1 unit"),
  stock_quantity: z.number().int().min(0).max(1000000).default(0),
  sku: z.string().trim().max(60).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  is_available: z.boolean().default(true),
  is_popular: z.boolean().default(false),
  popular_sort_order: z.number().int().min(0).max(1000000).default(100),
  has_unit_options: z.boolean().default(false),
  unit_options: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        unitPrice: z.number().min(0).max(1000000),
      }),
    )
    .max(12)
    .default([]),
});

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { id, ...rest } = data;
    const payload = {
      ...rest,
      discount_price: data.discount_price ?? null,
      is_available: data.status === "active" && data.is_available,
      unit_options: data.has_unit_options ? data.unit_options : [],
    };

    if (id) {
      const { data: prev } = await supabaseAdmin
        .from("products")
        .select("price")
        .eq("id", id)
        .single();
      const priceChanged = prev && Number(prev.price) !== data.price;
      const update = priceChanged
        ? { ...payload, price_updated_at: new Date().toISOString() }
        : payload;
      const { error } = await supabaseAdmin.from("products").update(update).eq("id", id);
      if (error) throw new Error(error.message);
      if (priceChanged && prev) {
        await supabaseAdmin.from("price_history").insert({
          product_id: id,
          old_price: prev.price,
          new_price: data.price,
          changed_by: context.userId,
          reason: "manual edit",
        });
      }
      await logAction(context.userId, "update", "product", id, { name: data.name });
      return { id };
    }

    const { data: row, error } = await supabaseAdmin
      .from("products")
      .insert({ ...payload, price_updated_at: new Date().toISOString() })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("price_history").insert({
      product_id: row.id,
      old_price: null,
      new_price: data.price,
      changed_by: context.userId,
      reason: "created",
    });
    await logAction(context.userId, "create", "product", row.id, { name: data.name });
    return { id: row.id };
  });

const bulkProductSchema = z.object({
  products: z.array(productSchema.omit({ id: true })).min(1).max(500),
});

export const adminBulkImportProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bulkProductSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const now = new Date().toISOString();
    let created = 0;
    let updated = 0;

    for (const product of data.products) {
      const payload = {
        ...product,
        description: product.description ?? null,
        category: product.category ?? null,
        image_url: product.image_url ?? null,
        discount_price: product.discount_price ?? null,
        sku: product.sku ?? null,
        is_available: product.status === "active" && product.is_available,
      };

      let existing: { id: string; price: number } | null = null;
      if (product.sku) {
        const { data: match } = await supabaseAdmin
          .from("products")
          .select("id, price")
          .eq("store_id", product.store_id)
          .eq("sku", product.sku)
          .maybeSingle();
        existing = match;
      }

      if (!existing) {
        const { data: matches } = await supabaseAdmin
          .from("products")
          .select("id, price")
          .eq("store_id", product.store_id)
          .ilike("name", product.name)
          .limit(1);
        existing = matches?.[0] ?? null;
      }

      if (existing) {
        const priceChanged = Number(existing.price) !== Number(product.price);
        const { error } = await supabaseAdmin
          .from("products")
          .update(priceChanged ? { ...payload, price_updated_at: now } : payload)
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
        if (priceChanged) {
          await supabaseAdmin.from("price_history").insert({
            product_id: existing.id,
            old_price: existing.price,
            new_price: product.price,
            changed_by: context.userId,
            reason: "bulk import",
          });
        }
        updated += 1;
      } else {
        const { data: row, error } = await supabaseAdmin
          .from("products")
          .insert({ ...payload, price_updated_at: now })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        await supabaseAdmin.from("price_history").insert({
          product_id: row.id,
          old_price: null,
          new_price: product.price,
          changed_by: context.userId,
          reason: "bulk import",
        });
        created += 1;
      }
    }

    await logAction(context.userId, "bulk_import", "product", null, {
      created,
      updated,
      count: data.products.length,
    });
    return { created, updated };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, "delete", "product", data.id);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Dynamic pricing
// ---------------------------------------------------------------------------

export const adminUpdatePrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { productId: string; newPrice: number; reason?: string; notify?: boolean }) =>
    z
      .object({
        productId: z.string().uuid(),
        newPrice: z.number().min(0).max(1000000),
        reason: z.string().trim().max(120).optional(),
        notify: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { data: prev, error: getErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price")
      .eq("id", data.productId)
      .single();
    if (getErr || !prev) throw new Error("Product not found.");

    const { error } = await supabaseAdmin
      .from("products")
      .update({ price: data.newPrice, price_updated_at: new Date().toISOString() })
      .eq("id", data.productId);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("price_history").insert({
      product_id: data.productId,
      old_price: prev.price,
      new_price: data.newPrice,
      changed_by: context.userId,
      reason: data.reason ?? "price update",
    });
    await logAction(context.userId, "price_update", "product", data.productId, {
      old: prev.price,
      new: data.newPrice,
    });

    if (data.notify) {
      await supabaseAdmin.from("notifications").insert({
        user_id: null,
        title: "Price updated",
        body: `${prev.name} is now ₹${data.newPrice}.`,
        type: "price",
      });
    }
    return { ok: true };
  });

export const adminBulkPriceUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      scope: "all" | "category" | "store";
      categoryKey?: string;
      storeId?: string;
      direction: "increase" | "decrease";
      percent: number;
    }) =>
      z
        .object({
          scope: z.enum(["all", "category", "store"]),
          categoryKey: z.string().trim().max(40).optional(),
          storeId: z.string().uuid().optional(),
          direction: z.enum(["increase", "decrease"]),
          percent: z.number().min(0.1).max(100),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();

    let query = supabaseAdmin.from("products").select("id, name, price");
    if (data.scope === "category") {
      if (!data.categoryKey) throw new Error("Choose a category.");
      query = query.eq("category", data.categoryKey);
    } else if (data.scope === "store") {
      if (!data.storeId) throw new Error("Choose a store.");
      query = query.eq("store_id", data.storeId);
    }
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return { updated: 0 };

    const factor = data.direction === "increase" ? 1 + data.percent / 100 : 1 - data.percent / 100;
    const now = new Date().toISOString();

    const history: {
      product_id: string;
      old_price: number;
      new_price: number;
      changed_by: string;
      reason: string;
    }[] = [];

    for (const p of rows) {
      const newPrice = Math.max(0, Math.round(Number(p.price) * factor * 100) / 100);
      const { error: upErr } = await supabaseAdmin
        .from("products")
        .update({ price: newPrice, price_updated_at: now })
        .eq("id", p.id);
      if (upErr) continue;
      history.push({
        product_id: p.id,
        old_price: Number(p.price),
        new_price: newPrice,
        changed_by: context.userId,
        reason: `bulk ${data.direction} ${data.percent}%`,
      });
    }
    if (history.length) await supabaseAdmin.from("price_history").insert(history);
    await logAction(context.userId, "bulk_price_update", "product", null, {
      scope: data.scope,
      direction: data.direction,
      percent: data.percent,
      count: history.length,
    });

    return { updated: history.length };
  });

export const adminPriceHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { productId: string }) => z.object({ productId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { data: rows, error } = await supabaseAdmin
      .from("price_history")
      .select("*")
      .eq("product_id", data.productId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return rows;
  });

// ---------------------------------------------------------------------------
// Users & roles
// ---------------------------------------------------------------------------

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const [{ data: profiles }, { data: roles }, { data: orders }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone, email, address, is_verified, is_blocked, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("orders").select("customer_id, status, total, created_at"),
    ]);
    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }
    const orderStats = new Map<
      string,
      {
        totalOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalSpend: number;
        lastOrderDate: string | null;
      }
    >();
    for (const order of orders ?? []) {
      const stats = orderStats.get(order.customer_id) ?? {
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalSpend: 0,
        lastOrderDate: null,
      };
      stats.totalOrders += 1;
      if (order.status === "delivered") {
        stats.completedOrders += 1;
        stats.totalSpend += Number(order.total ?? 0);
      }
      if (["cancelled", "canceled"].includes(String(order.status))) {
        stats.cancelledOrders += 1;
      }
      if (
        !stats.lastOrderDate ||
        new Date(order.created_at).getTime() > new Date(stats.lastOrderDate).getTime()
      ) {
        stats.lastOrderDate = order.created_at;
      }
      orderStats.set(order.customer_id, stats);
    }
    return (profiles ?? []).map((p) => ({
      ...p,
      roles: roleMap.get(p.id) ?? [],
      stats: orderStats.get(p.id) ?? {
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalSpend: 0,
        lastOrderDate: null,
      },
    }));
  });

export const adminSetUserBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; blocked: boolean }) =>
    z.object({ userId: z.string().uuid(), blocked: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_blocked: data.blocked })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    await logAction(
      context.userId,
      data.blocked ? "block_user" : "unblock_user",
      "user",
      data.userId,
    );
    return { ok: true };
  });

const ROLE_VALUES = [
  "customer",
  "store_manager",
  "admin",
  "super_admin",
  "seller",
  "rider",
] as const;

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: (typeof ROLE_VALUES)[number] }) =>
    z.object({ userId: z.string().uuid(), role: z.enum(ROLE_VALUES) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const roles = await assertAdmin(context.userId);
    // Only super admins may grant admin / super_admin roles.
    if ((data.role === "admin" || data.role === "super_admin") && !roles.includes("super_admin")) {
      throw new Error("Only a Super Admin can grant admin roles.");
    }
    const supabaseAdmin = await getAdmin();
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    await logAction(context.userId, "set_role", "user", data.userId, { role: data.role });
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

export const adminListAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data;
  });

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const adminSendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      audience: "all" | "user";
      userId?: string;
      title: string;
      body?: string;
      type?: string;
    }) =>
      z
        .object({
          audience: z.enum(["all", "user"]),
          userId: z.string().uuid().optional(),
          title: z.string().trim().min(1).max(120),
          body: z.string().trim().max(500).optional(),
          type: z.string().trim().max(30).optional(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    if (data.audience === "user") {
      if (!data.userId) throw new Error("Choose a recipient.");
      const { error } = await supabaseAdmin.from("notifications").insert({
        user_id: data.userId,
        title: data.title,
        body: data.body ?? null,
        type: data.type ?? "info",
      });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("notifications").insert({
        user_id: null,
        title: data.title,
        body: data.body ?? null,
        type: data.type ?? "announcement",
      });
      if (error) throw new Error(error.message);
    }
    await logAction(context.userId, "send_notification", "notification", null, {
      audience: data.audience,
      title: data.title,
    });
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Marketplace settings
// ---------------------------------------------------------------------------

const supportSettingsSchema = z.object({
  phone: z.string().trim().max(30),
  whatsapp: z.string().trim().max(30),
  email: z.string().trim().email().max(120),
});

const paymentSettingsSchema = z.object({
  cod_enabled: z.boolean().default(true),
  online_enabled: z.boolean().default(false),
  upi_id: z.string().trim().max(120).optional().nullable(),
  payee_name: z.string().trim().max(120).optional().nullable(),
  instructions: z.string().trim().max(500).optional().nullable(),
});

const storeOrderSettingsSchema = z.object({
  orders_enabled: z.boolean().default(true),
  closed_message: z.string().trim().max(200).optional().nullable(),
});

const homeBannerSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(220).optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
  is_enabled: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

const homeBannersSchema = z.object({
  banners: z.array(homeBannerSchema).max(20),
  default_banner_enabled: z.boolean().optional(),
});

const defaultHomeBanner = {
  id: "default-townkart",
  title: "Groceries, food, medicines and local essentials delivered fast.",
  subtitle: "Nehtaur's First Online Kart",
  image_url: null,
  is_enabled: true,
  sort_order: 1,
};

export const getSupportSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin as any;
  const { data } = await db
    .from("marketplace_settings")
    .select("value")
    .eq("key", "support")
    .maybeSingle();
  return (data?.value ?? {
    phone: "+919999999999",
    whatsapp: "+919999999999",
    email: "support@townkart.app",
  }) as { phone: string; whatsapp: string; email: string };
});

export const adminSaveSupportSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => supportSettingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const db = supabaseAdmin as any;
    const { error } = await db.from("marketplace_settings").upsert({
      key: "support",
      value: data,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    await logAction(context.userId, "update", "marketplace_settings", "support", data);
    return { ok: true };
  });

export const getPaymentSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin as any;
  const { data } = await db
    .from("marketplace_settings")
    .select("value")
    .eq("key", "payment")
    .maybeSingle();
  const parsed = paymentSettingsSchema.safeParse(data?.value);
  return parsed.success
    ? parsed.data
    : {
        cod_enabled: true,
        online_enabled: false,
        upi_id: "",
        payee_name: "TownKart",
        instructions: "Pay online and enter your UTR/reference number before placing the order.",
      };
});

export const adminSavePaymentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => paymentSettingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (!data.cod_enabled && !data.online_enabled) {
      throw new Error("Enable at least one payment method.");
    }
    if (data.online_enabled && !data.upi_id) {
      throw new Error("Add a UPI ID before enabling online payment.");
    }
    const supabaseAdmin = await getAdmin();
    const db = supabaseAdmin as any;
    const { error } = await db.from("marketplace_settings").upsert({
      key: "payment",
      value: data,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    await logAction(context.userId, "update", "marketplace_settings", "payment", {
      cod_enabled: data.cod_enabled,
      online_enabled: data.online_enabled,
      upi_id: data.upi_id,
    });
    return { ok: true };
  });

export const getStoreOrderSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin as any;
  const { data } = await db
    .from("marketplace_settings")
    .select("value")
    .eq("key", "store_orders")
    .maybeSingle();
  const parsed = storeOrderSettingsSchema.safeParse(data?.value);
  return parsed.success
    ? parsed.data
    : {
        orders_enabled: true,
        closed_message: "Store is closed right now. Please order again tomorrow.",
      };
});

export const adminSaveStoreOrderSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => storeOrderSettingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const db = supabaseAdmin as any;
    const { error } = await db.from("marketplace_settings").upsert({
      key: "store_orders",
      value: data,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    await logAction(context.userId, "update", "marketplace_settings", "store_orders", data);
    return { ok: true };
  });

export const getHomeBanners = createServerFn({ method: "GET" }).handler(async () => {
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin as any;
  const { data } = await db
    .from("marketplace_settings")
    .select("value")
    .eq("key", "home_banners")
    .maybeSingle();
  const parsed = homeBannersSchema.safeParse(data?.value);
  if (!parsed.success) return [defaultHomeBanner];

  const banners = parsed.data.banners;
  const hasDefaultBanner = banners.some((banner) => banner.id === defaultHomeBanner.id);
  const isLegacyValue = parsed.data.default_banner_enabled === undefined;

  if (isLegacyValue && !hasDefaultBanner) {
    return [
      defaultHomeBanner,
      ...banners.map((banner) => ({ ...banner, sort_order: banner.sort_order + 1 })),
    ];
  }

  return banners;
});

export const adminSaveHomeBanners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => homeBannersSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdmin();
    const db = supabaseAdmin as any;
    const banners = data.banners
      .map((banner, index) => ({ ...banner, sort_order: banner.sort_order ?? index }))
      .sort((a, b) => a.sort_order - b.sort_order);
    const defaultBannerEnabled = banners.some((banner) => banner.id === defaultHomeBanner.id);
    const { error } = await db.from("marketplace_settings").upsert({
      key: "home_banners",
      value: { banners, default_banner_enabled: defaultBannerEnabled },
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    await logAction(context.userId, "update", "marketplace_settings", "home_banners", {
      count: banners.length,
    });
    return { ok: true };
  });
