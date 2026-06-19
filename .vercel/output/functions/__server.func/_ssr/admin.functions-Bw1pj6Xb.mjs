import { c as createServerRpc } from "./createServerRpc-BXSVlsDi.mjs";
import { c as createServerFn } from "./server-CR4UkH38.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-v_CxfV_5.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, b as booleanType, e as enumType, n as numberType, a as arrayType } from "../_libs/zod.mjs";
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
async function getAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-CjUexK5y.mjs");
  return supabaseAdmin;
}
async function assertAdmin(userId) {
  const supabaseAdmin = await getAdmin();
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error("Could not verify permissions.");
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    throw new Error("Forbidden: admin access required.");
  }
  return roles;
}
async function logAction(actorId, action, entityType, entityId, details) {
  try {
    const supabaseAdmin = await getAdmin();
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details ?? null
    });
  } catch (e) {
    console.error("[audit] failed to record", e);
  }
}
const adminDashboard_createServerFn_handler = createServerRpc({
  id: "9ff7ac682d569ace29ac9f4c109dfff01a123caf2fc3a87d7b131f0a854906ad",
  name: "adminDashboard",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminDashboard.__executeServer(opts));
const adminDashboard = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminDashboard_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const [storesCount, categoriesCount, productsCount, usersCount, orders, priceChanges, stores] = await Promise.all([supabaseAdmin.from("stores").select("*", {
    count: "exact",
    head: true
  }), supabaseAdmin.from("categories").select("*", {
    count: "exact",
    head: true
  }), supabaseAdmin.from("products").select("*", {
    count: "exact",
    head: true
  }), supabaseAdmin.from("profiles").select("*", {
    count: "exact",
    head: true
  }), supabaseAdmin.from("orders").select("id, total, status, store_name, customer_id, created_at").order("created_at", {
    ascending: false
  }), supabaseAdmin.from("price_history").select("id, product_id, old_price, new_price, created_at").order("created_at", {
    ascending: false
  }).limit(50), supabaseAdmin.from("stores").select("id, name, category")]);
  const orderRows = orders.data ?? [];
  const now = Date.now();
  const last30 = now - 30 * 24 * 60 * 60 * 1e3;
  const revenue = orderRows.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const todayKey = new Date(now).toISOString().slice(0, 10);
  const monthKey = new Date(now).toISOString().slice(0, 7);
  const revenueToday = orderRows.filter((o) => new Date(o.created_at).toISOString().slice(0, 10) === todayKey).reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const revenueThisMonth = orderRows.filter((o) => new Date(o.created_at).toISOString().slice(0, 7) === monthKey).reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const activeUsers = new Set(orderRows.filter((o) => new Date(o.created_at).getTime() >= last30).map((o) => o.customer_id)).size;
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1e3);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: key,
      total: 0,
      orders: 0
    });
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
  const {
    data: items
  } = await supabaseAdmin.from("order_items").select("name, quantity, unit_price");
  const productAgg = /* @__PURE__ */ new Map();
  for (const it of items ?? []) {
    const cur = productAgg.get(it.name) ?? {
      name: it.name,
      qty: 0,
      revenue: 0
    };
    cur.qty += Number(it.quantity ?? 0);
    cur.revenue += Number(it.quantity ?? 0) * Number(it.unit_price ?? 0);
    productAgg.set(it.name, cur);
  }
  const topProducts = [...productAgg.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);
  const catAgg = /* @__PURE__ */ new Map();
  for (const s of stores.data ?? []) {
    catAgg.set(s.category, (catAgg.get(s.category) ?? 0) + 1);
  }
  const popularCategories = [...catAgg.entries()].map(([category, count]) => ({
    category,
    count
  })).sort((a, b) => b.count - a.count);
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
      pendingOrders: orderRows.filter((o) => ["pending", "placed"].includes(String(o.status))).length,
      deliveredOrders: orderRows.filter((o) => o.status === "delivered").length
    },
    salesByDay: days,
    topProducts,
    popularCategories,
    topStores: [...orderRows.reduce((map, order) => {
      const key = order.store_name ?? "Store";
      const cur = map.get(key) ?? {
        store: key,
        orders: 0,
        revenue: 0
      };
      cur.orders += 1;
      cur.revenue += Number(order.total ?? 0);
      map.set(key, cur);
      return map;
    }, /* @__PURE__ */ new Map()).values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6),
    recentPriceChanges: priceChanges.data ?? []
  };
});
const callOrderSchema = objectType({
  primary_phone: stringType().trim().max(30),
  secondary_phone: stringType().trim().max(30).optional().nullable(),
  whatsapp_number: stringType().trim().max(30).optional().nullable(),
  is_enabled: booleanType().default(true),
  available_from: stringType().trim().max(20).default("09:00"),
  available_to: stringType().trim().max(20).default("21:00"),
  instructions: stringType().trim().max(500).optional().nullable()
});
const getCallOrderSettings_createServerFn_handler = createServerRpc({
  id: "197ac4a219c48bd25e8d4b6469a18487dcd6c9bb95344d3713eea8ac4461e78f",
  name: "getCallOrderSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getCallOrderSettings.__executeServer(opts));
const getCallOrderSettings = createServerFn({
  method: "GET"
}).handler(getCallOrderSettings_createServerFn_handler, async () => {
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin;
  const {
    data
  } = await db.from("call_order_settings").select("*").order("updated_at", {
    ascending: false
  }).limit(1).maybeSingle();
  return data ?? {
    primary_phone: "+919999999999",
    secondary_phone: "",
    whatsapp_number: "+919999999999",
    is_enabled: true,
    available_from: "09:00",
    available_to: "21:00",
    instructions: "Call us with your items, quantity, delivery address and preferred payment method."
  };
});
const adminSaveCallOrderSettings_createServerFn_handler = createServerRpc({
  id: "114ea6e68af36fdc9d56c7521d6b3b2e5abc09645bf37526a0b739b7061a608a",
  name: "adminSaveCallOrderSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSaveCallOrderSettings.__executeServer(opts));
const adminSaveCallOrderSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => callOrderSchema.parse(d)).handler(adminSaveCallOrderSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin;
  const {
    data: existing
  } = await db.from("call_order_settings").select("id").limit(1).maybeSingle();
  const payload = {
    ...data,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const query = existing?.id ? db.from("call_order_settings").update(payload).eq("id", existing.id) : db.from("call_order_settings").insert(payload);
  const {
    error
  } = await query;
  if (error) throw new Error(error.message);
  await logAction(context.userId, "update", "call_order_settings", existing?.id ?? null, data);
  return {
    ok: true
  };
});
const adminGetOrderDetail_createServerFn_handler = createServerRpc({
  id: "5022e5ccca5be62ca4871af80ca2da60d8becadf303e0414742b723133ed1a2c",
  name: "adminGetOrderDetail",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetOrderDetail.__executeServer(opts));
const adminGetOrderDetail = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  orderId: stringType().uuid()
}).parse(d)).handler(adminGetOrderDetail_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    data: order,
    error
  } = await supabaseAdmin.from("orders").select("*, order_items(name, quantity, unit_price), stores(name, phone, address)").eq("id", data.orderId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) throw new Error("Order not found.");
  const {
    data: profile
  } = await supabaseAdmin.from("profiles").select("full_name, phone, email").eq("id", order.customer_id).maybeSingle();
  const {
    data: history
  } = await supabaseAdmin.from("order_status_history").select("*").eq("order_id", data.orderId).order("created_at", {
    ascending: true
  });
  return {
    ...order,
    profiles: profile,
    status_history: history ?? []
  };
});
const adminGetUserDetail_createServerFn_handler = createServerRpc({
  id: "c6aebd0cde54dfb0c41e0efbdc86e4a6d2f069048797740c2c9bb8e8a44c16fd",
  name: "adminGetUserDetail",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetUserDetail.__executeServer(opts));
const adminGetUserDetail = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  range: enumType(["7", "30", "90", "all"]).optional()
}).parse(d)).handler(adminGetUserDetail_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const [{
    data: profile
  }, {
    data: roles
  }] = await Promise.all([supabaseAdmin.from("profiles").select("id, full_name, phone, email, address, is_verified, is_blocked, created_at").eq("id", data.userId).maybeSingle(), supabaseAdmin.from("user_roles").select("role").eq("user_id", data.userId)]);
  if (!profile) throw new Error("User not found.");
  let query = supabaseAdmin.from("orders").select("*, order_items(name, quantity, unit_price)").eq("customer_id", data.userId).order("created_at", {
    ascending: false
  });
  if (data.range && data.range !== "all") {
    const since = new Date(Date.now() - Number(data.range) * 24 * 60 * 60 * 1e3).toISOString();
    query = query.gte("created_at", since);
  }
  const {
    data: orders,
    error
  } = await query;
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
      lastOrderDate: rows[0]?.created_at ?? null
    },
    addresses: profile.address ? [profile.address] : [],
    orders: rows
  };
});
const adminListCategories_createServerFn_handler = createServerRpc({
  id: "16adcae68f7f6ee62a1f2c605455af763ee11cf325960f90579e35d6bc275907",
  name: "adminListCategories",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListCategories.__executeServer(opts));
const adminListCategories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListCategories_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    data,
    error
  } = await supabaseAdmin.from("categories").select("*").order("sort_order", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data;
});
const categorySchema = objectType({
  id: stringType().uuid().optional(),
  key: stringType().trim().min(2).max(40).regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, - or _"),
  label: stringType().trim().min(1).max(60),
  emoji: stringType().trim().max(8).optional().nullable(),
  icon: stringType().trim().max(60).optional().nullable(),
  image_url: stringType().trim().max(500).optional().nullable(),
  description: stringType().trim().max(300).optional().nullable(),
  sort_order: numberType().int().min(0).max(9999).default(0),
  is_enabled: booleanType().default(true)
});
const adminSaveCategory_createServerFn_handler = createServerRpc({
  id: "35f84d67dda2de6df81b7a43c7acdb0df007930bc74b903bb0d1784b68ab2349",
  name: "adminSaveCategory",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSaveCategory.__executeServer(opts));
const adminSaveCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => categorySchema.parse(d)).handler(adminSaveCategory_createServerFn_handler, async ({
  data,
  context
}) => {
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
    is_enabled: data.is_enabled
  };
  if (data.id) {
    const {
      error: error2
    } = await supabaseAdmin.from("categories").update(payload).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    await logAction(context.userId, "update", "category", data.id, payload);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("categories").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  await logAction(context.userId, "create", "category", row.id, payload);
  return {
    id: row.id
  };
});
const adminDeleteCategory_createServerFn_handler = createServerRpc({
  id: "950328abc056627e7020b8ee4af15de2c8185c6b4f0fa341cec497db75a14951",
  name: "adminDeleteCategory",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminDeleteCategory.__executeServer(opts));
const adminDeleteCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(adminDeleteCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    error
  } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "delete", "category", data.id);
  return {
    ok: true
  };
});
const adminListStores_createServerFn_handler = createServerRpc({
  id: "adf61c7212b1948e5c9e6ed11636e3e5882e1956e31fa4c98543fa951ead7c93",
  name: "adminListStores",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListStores.__executeServer(opts));
const adminListStores = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListStores_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    data,
    error
  } = await supabaseAdmin.from("stores").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data;
});
const storeSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(120),
  category: stringType().trim().min(1).max(40),
  description: stringType().trim().max(500).optional().nullable(),
  logo_url: stringType().trim().max(500).optional().nullable(),
  banner_url: stringType().trim().max(500).optional().nullable(),
  address: stringType().trim().max(300).optional().nullable(),
  phone: stringType().trim().max(30).optional().nullable(),
  opening_hours: stringType().trim().max(200).optional().nullable(),
  latitude: numberType().min(-90).max(90).optional().nullable(),
  longitude: numberType().min(-180).max(180).optional().nullable(),
  delivery_minutes: numberType().int().min(1).max(600).default(30),
  min_order: numberType().min(0).max(1e5).default(0),
  rating: numberType().min(0).max(5).default(4.5),
  delivery_available: booleanType().default(true),
  is_active: booleanType().default(true),
  status: enumType(["active", "pending", "suspended"]).default("active")
});
const adminSaveStore_createServerFn_handler = createServerRpc({
  id: "9b9f86beb9624c57909087a6163aa04fd8cc1e635f6c99193e012043d9ae6ac3",
  name: "adminSaveStore",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSaveStore.__executeServer(opts));
const adminSaveStore = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => storeSchema.parse(d)).handler(adminSaveStore_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    id,
    ...rest
  } = data;
  const payload = {
    ...rest,
    is_active: data.status === "active"
  };
  if (id) {
    const {
      error: error2
    } = await supabaseAdmin.from("stores").update(payload).eq("id", id);
    if (error2) throw new Error(error2.message);
    await logAction(context.userId, "update", "store", id, {
      name: data.name
    });
    return {
      id
    };
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("stores").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  await logAction(context.userId, "create", "store", row.id, {
    name: data.name
  });
  return {
    id: row.id
  };
});
const adminSetStoreStatus_createServerFn_handler = createServerRpc({
  id: "067dedd5ce790eefee9c0e98254709a349ceaed18c3439eb32d0d588dc1c29e8",
  name: "adminSetStoreStatus",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetStoreStatus.__executeServer(opts));
const adminSetStoreStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["active", "pending", "suspended"])
}).parse(d)).handler(adminSetStoreStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    error
  } = await supabaseAdmin.from("stores").update({
    status: data.status,
    is_active: data.status === "active"
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "status_change", "store", data.id, {
    status: data.status
  });
  return {
    ok: true
  };
});
const adminDeleteStore_createServerFn_handler = createServerRpc({
  id: "cba90266c9a7758c97eb8361bbee0e080b445247010a30e61a622d12457b64f7",
  name: "adminDeleteStore",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminDeleteStore.__executeServer(opts));
const adminDeleteStore = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(adminDeleteStore_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    error
  } = await supabaseAdmin.from("stores").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "delete", "store", data.id);
  return {
    ok: true
  };
});
const adminListProducts_createServerFn_handler = createServerRpc({
  id: "9932f7d91182148199cbc8b49e99aa83ab2855e0f2166e0d0e38e6c091b587df",
  name: "adminListProducts",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListProducts.__executeServer(opts));
const adminListProducts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  storeId: stringType().uuid().optional()
}).parse(d ?? {})).handler(adminListProducts_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  let query = supabaseAdmin.from("products").select("*, stores(name)").order("created_at", {
    ascending: false
  });
  if (data.storeId) query = query.eq("store_id", data.storeId);
  const {
    data: rows,
    error
  } = await query;
  if (error) throw new Error(error.message);
  return rows;
});
const productSchema = objectType({
  id: stringType().uuid().optional(),
  store_id: stringType().uuid(),
  name: stringType().trim().min(1).max(120),
  description: stringType().trim().max(500).optional().nullable(),
  category: stringType().trim().max(40).optional().nullable(),
  image_url: stringType().trim().max(500).optional().nullable(),
  price: numberType().min(0).max(1e6),
  discount_price: numberType().min(0).max(1e6).optional().nullable(),
  unit: stringType().trim().max(30).default("1 unit"),
  stock_quantity: numberType().int().min(0).max(1e6).default(0),
  sku: stringType().trim().max(60).optional().nullable(),
  status: enumType(["active", "inactive"]).default("active"),
  is_available: booleanType().default(true)
});
const adminSaveProduct_createServerFn_handler = createServerRpc({
  id: "0aba47d27a6b467234d5b8b494d16bb446b7ca53f463ecbbd00e9a33a19ef0f3",
  name: "adminSaveProduct",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSaveProduct.__executeServer(opts));
const adminSaveProduct = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => productSchema.parse(d)).handler(adminSaveProduct_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    id,
    ...rest
  } = data;
  const payload = {
    ...rest,
    discount_price: data.discount_price ?? null,
    is_available: data.status === "active" && data.is_available
  };
  if (id) {
    const {
      data: prev
    } = await supabaseAdmin.from("products").select("price").eq("id", id).single();
    const priceChanged = prev && Number(prev.price) !== data.price;
    const update = priceChanged ? {
      ...payload,
      price_updated_at: (/* @__PURE__ */ new Date()).toISOString()
    } : payload;
    const {
      error: error2
    } = await supabaseAdmin.from("products").update(update).eq("id", id);
    if (error2) throw new Error(error2.message);
    if (priceChanged && prev) {
      await supabaseAdmin.from("price_history").insert({
        product_id: id,
        old_price: prev.price,
        new_price: data.price,
        changed_by: context.userId,
        reason: "manual edit"
      });
    }
    await logAction(context.userId, "update", "product", id, {
      name: data.name
    });
    return {
      id
    };
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("products").insert({
    ...payload,
    price_updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("price_history").insert({
    product_id: row.id,
    old_price: null,
    new_price: data.price,
    changed_by: context.userId,
    reason: "created"
  });
  await logAction(context.userId, "create", "product", row.id, {
    name: data.name
  });
  return {
    id: row.id
  };
});
const adminDeleteProduct_createServerFn_handler = createServerRpc({
  id: "0ddf57ac23192120a1e98e48f57343c6fe83e8a1ddcf5df54be83354a1f768ad",
  name: "adminDeleteProduct",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminDeleteProduct.__executeServer(opts));
const adminDeleteProduct = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(adminDeleteProduct_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    error
  } = await supabaseAdmin.from("products").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "delete", "product", data.id);
  return {
    ok: true
  };
});
const adminUpdatePrice_createServerFn_handler = createServerRpc({
  id: "bf03c9692c8986b0d44bfec034d5fc6cfca624ab9263b61cfb0c4fd43bc7cd9b",
  name: "adminUpdatePrice",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdatePrice.__executeServer(opts));
const adminUpdatePrice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  productId: stringType().uuid(),
  newPrice: numberType().min(0).max(1e6),
  reason: stringType().trim().max(120).optional(),
  notify: booleanType().optional()
}).parse(d)).handler(adminUpdatePrice_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    data: prev,
    error: getErr
  } = await supabaseAdmin.from("products").select("id, name, price").eq("id", data.productId).single();
  if (getErr || !prev) throw new Error("Product not found.");
  const {
    error
  } = await supabaseAdmin.from("products").update({
    price: data.newPrice,
    price_updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.productId);
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("price_history").insert({
    product_id: data.productId,
    old_price: prev.price,
    new_price: data.newPrice,
    changed_by: context.userId,
    reason: data.reason ?? "price update"
  });
  await logAction(context.userId, "price_update", "product", data.productId, {
    old: prev.price,
    new: data.newPrice
  });
  if (data.notify) {
    await supabaseAdmin.from("notifications").insert({
      user_id: null,
      title: "Price updated",
      body: `${prev.name} is now ₹${data.newPrice}.`,
      type: "price"
    });
  }
  return {
    ok: true
  };
});
const adminBulkPriceUpdate_createServerFn_handler = createServerRpc({
  id: "0a131f04c1634cbae2b223a0e370a611fe2d32b75e7d95748deaebbf6006221d",
  name: "adminBulkPriceUpdate",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminBulkPriceUpdate.__executeServer(opts));
const adminBulkPriceUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["all", "category", "store"]),
  categoryKey: stringType().trim().max(40).optional(),
  storeId: stringType().uuid().optional(),
  direction: enumType(["increase", "decrease"]),
  percent: numberType().min(0.1).max(100)
}).parse(d)).handler(adminBulkPriceUpdate_createServerFn_handler, async ({
  data,
  context
}) => {
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
  const {
    data: rows,
    error
  } = await query;
  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return {
    updated: 0
  };
  const factor = data.direction === "increase" ? 1 + data.percent / 100 : 1 - data.percent / 100;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const history = [];
  for (const p of rows) {
    const newPrice = Math.max(0, Math.round(Number(p.price) * factor * 100) / 100);
    const {
      error: upErr
    } = await supabaseAdmin.from("products").update({
      price: newPrice,
      price_updated_at: now
    }).eq("id", p.id);
    if (upErr) continue;
    history.push({
      product_id: p.id,
      old_price: Number(p.price),
      new_price: newPrice,
      changed_by: context.userId,
      reason: `bulk ${data.direction} ${data.percent}%`
    });
  }
  if (history.length) await supabaseAdmin.from("price_history").insert(history);
  await logAction(context.userId, "bulk_price_update", "product", null, {
    scope: data.scope,
    direction: data.direction,
    percent: data.percent,
    count: history.length
  });
  return {
    updated: history.length
  };
});
const adminPriceHistory_createServerFn_handler = createServerRpc({
  id: "7bbe482ab07671a2c301289bd7e15c3282819f8c8e7a5182c08c56c8f343a5c1",
  name: "adminPriceHistory",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminPriceHistory.__executeServer(opts));
const adminPriceHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  productId: stringType().uuid()
}).parse(d)).handler(adminPriceHistory_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("price_history").select("*").eq("product_id", data.productId).order("created_at", {
    ascending: false
  }).limit(100);
  if (error) throw new Error(error.message);
  return rows;
});
const adminListUsers_createServerFn_handler = createServerRpc({
  id: "35cf6cc28f61c798a570ec39672552de8ed250f60706565e25b34a66f0c5b240",
  name: "adminListUsers",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListUsers.__executeServer(opts));
const adminListUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListUsers_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const [{
    data: profiles
  }, {
    data: roles
  }, {
    data: orders
  }] = await Promise.all([supabaseAdmin.from("profiles").select("id, full_name, phone, email, address, is_verified, is_blocked, created_at").order("created_at", {
    ascending: false
  }), supabaseAdmin.from("user_roles").select("user_id, role"), supabaseAdmin.from("orders").select("customer_id, status, total, created_at")]);
  const roleMap = /* @__PURE__ */ new Map();
  for (const r of roles ?? []) {
    const arr = roleMap.get(r.user_id) ?? [];
    arr.push(r.role);
    roleMap.set(r.user_id, arr);
  }
  const orderStats = /* @__PURE__ */ new Map();
  for (const order of orders ?? []) {
    const stats = orderStats.get(order.customer_id) ?? {
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalSpend: 0,
      lastOrderDate: null
    };
    stats.totalOrders += 1;
    if (order.status === "delivered") {
      stats.completedOrders += 1;
      stats.totalSpend += Number(order.total ?? 0);
    }
    if (["cancelled", "canceled"].includes(String(order.status))) {
      stats.cancelledOrders += 1;
    }
    if (!stats.lastOrderDate || new Date(order.created_at).getTime() > new Date(stats.lastOrderDate).getTime()) {
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
      lastOrderDate: null
    }
  }));
});
const adminSetUserBlocked_createServerFn_handler = createServerRpc({
  id: "95b6aa2b4978dfa32791d4aec5b5df227e7607e3a64ad55178ad66bc334781df",
  name: "adminSetUserBlocked",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetUserBlocked.__executeServer(opts));
const adminSetUserBlocked = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  blocked: booleanType()
}).parse(d)).handler(adminSetUserBlocked_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    error
  } = await supabaseAdmin.from("profiles").update({
    is_blocked: data.blocked
  }).eq("id", data.userId);
  if (error) throw new Error(error.message);
  await logAction(context.userId, data.blocked ? "block_user" : "unblock_user", "user", data.userId);
  return {
    ok: true
  };
});
const ROLE_VALUES = ["customer", "store_manager", "admin", "super_admin", "seller", "rider"];
const adminSetUserRole_createServerFn_handler = createServerRpc({
  id: "91a135e4d78e750cc628d4feed26d426cf052f854224132c36d2e82238cebb15",
  name: "adminSetUserRole",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetUserRole.__executeServer(opts));
const adminSetUserRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  role: enumType(ROLE_VALUES)
}).parse(d)).handler(adminSetUserRole_createServerFn_handler, async ({
  data,
  context
}) => {
  const roles = await assertAdmin(context.userId);
  if ((data.role === "admin" || data.role === "super_admin") && !roles.includes("super_admin")) {
    throw new Error("Only a Super Admin can grant admin roles.");
  }
  const supabaseAdmin = await getAdmin();
  await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
  const {
    error
  } = await supabaseAdmin.from("user_roles").insert({
    user_id: data.userId,
    role: data.role
  });
  if (error) throw new Error(error.message);
  await logAction(context.userId, "set_role", "user", data.userId, {
    role: data.role
  });
  return {
    ok: true
  };
});
const adminListAuditLogs_createServerFn_handler = createServerRpc({
  id: "19b61697a30ea0ed27854ab6a9e0511b6d21993f1a70cdfc01272dd52485a772",
  name: "adminListAuditLogs",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListAuditLogs.__executeServer(opts));
const adminListAuditLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListAuditLogs_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const {
    data,
    error
  } = await supabaseAdmin.from("audit_logs").select("*").order("created_at", {
    ascending: false
  }).limit(200);
  if (error) throw new Error(error.message);
  return data;
});
const adminSendNotification_createServerFn_handler = createServerRpc({
  id: "2ce335996f2b07a5db45e1394010b15094588b453097d464a8e3d8f8b1ac8a00",
  name: "adminSendNotification",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSendNotification.__executeServer(opts));
const adminSendNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  audience: enumType(["all", "user"]),
  userId: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(120),
  body: stringType().trim().max(500).optional(),
  type: stringType().trim().max(30).optional()
}).parse(d)).handler(adminSendNotification_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  if (data.audience === "user") {
    if (!data.userId) throw new Error("Choose a recipient.");
    const {
      error
    } = await supabaseAdmin.from("notifications").insert({
      user_id: data.userId,
      title: data.title,
      body: data.body ?? null,
      type: data.type ?? "info"
    });
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabaseAdmin.from("notifications").insert({
      user_id: null,
      title: data.title,
      body: data.body ?? null,
      type: data.type ?? "announcement"
    });
    if (error) throw new Error(error.message);
  }
  await logAction(context.userId, "send_notification", "notification", null, {
    audience: data.audience,
    title: data.title
  });
  return {
    ok: true
  };
});
const supportSettingsSchema = objectType({
  phone: stringType().trim().max(30),
  whatsapp: stringType().trim().max(30),
  email: stringType().trim().email().max(120)
});
const paymentSettingsSchema = objectType({
  cod_enabled: booleanType().default(true),
  online_enabled: booleanType().default(false),
  upi_id: stringType().trim().max(120).optional().nullable(),
  payee_name: stringType().trim().max(120).optional().nullable(),
  instructions: stringType().trim().max(500).optional().nullable()
});
const homeBannerSchema = objectType({
  id: stringType().trim().min(1).max(80),
  title: stringType().trim().min(1).max(120),
  subtitle: stringType().trim().max(220).optional().nullable(),
  image_url: stringType().trim().max(500).optional().nullable(),
  is_enabled: booleanType().default(true),
  sort_order: numberType().int().min(0).max(9999).default(0)
});
const homeBannersSchema = objectType({
  banners: arrayType(homeBannerSchema).max(20)
});
const getSupportSettings_createServerFn_handler = createServerRpc({
  id: "e283fdf50646b07175f274f8e8ea6222273344f27debab41ac321d8ef6aa9d52",
  name: "getSupportSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getSupportSettings.__executeServer(opts));
const getSupportSettings = createServerFn({
  method: "GET"
}).handler(getSupportSettings_createServerFn_handler, async () => {
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin;
  const {
    data
  } = await db.from("marketplace_settings").select("value").eq("key", "support").maybeSingle();
  return data?.value ?? {
    phone: "+919999999999",
    whatsapp: "+919999999999",
    email: "support@townkart.app"
  };
});
const adminSaveSupportSettings_createServerFn_handler = createServerRpc({
  id: "39b6ba3a70e04d10eb1ad7bf6b1f79b7f6e93e2fcfa7a04324d6e520309faa88",
  name: "adminSaveSupportSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSaveSupportSettings.__executeServer(opts));
const adminSaveSupportSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => supportSettingsSchema.parse(d)).handler(adminSaveSupportSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin;
  const {
    error
  } = await db.from("marketplace_settings").upsert({
    key: "support",
    value: data,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (error) throw new Error(error.message);
  await logAction(context.userId, "update", "marketplace_settings", "support", data);
  return {
    ok: true
  };
});
const getPaymentSettings_createServerFn_handler = createServerRpc({
  id: "2cc06b53a22ecdecb46145ee4eea022678a334a82d1b0ed1c81a00fc462da707",
  name: "getPaymentSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getPaymentSettings.__executeServer(opts));
const getPaymentSettings = createServerFn({
  method: "GET"
}).handler(getPaymentSettings_createServerFn_handler, async () => {
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin;
  const {
    data
  } = await db.from("marketplace_settings").select("value").eq("key", "payment").maybeSingle();
  const parsed = paymentSettingsSchema.safeParse(data?.value);
  return parsed.success ? parsed.data : {
    cod_enabled: true,
    online_enabled: false,
    upi_id: "",
    payee_name: "TownKart",
    instructions: "Pay online and enter your UTR/reference number before placing the order."
  };
});
const adminSavePaymentSettings_createServerFn_handler = createServerRpc({
  id: "e8f5caf1e1838a8223f44c8fb473b27f87c239cf57e23027637a83cb352a2668",
  name: "adminSavePaymentSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSavePaymentSettings.__executeServer(opts));
const adminSavePaymentSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => paymentSettingsSchema.parse(d)).handler(adminSavePaymentSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  if (!data.cod_enabled && !data.online_enabled) {
    throw new Error("Enable at least one payment method.");
  }
  if (data.online_enabled && !data.upi_id) {
    throw new Error("Add a UPI ID before enabling online payment.");
  }
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin;
  const {
    error
  } = await db.from("marketplace_settings").upsert({
    key: "payment",
    value: data,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (error) throw new Error(error.message);
  await logAction(context.userId, "update", "marketplace_settings", "payment", {
    cod_enabled: data.cod_enabled,
    online_enabled: data.online_enabled,
    upi_id: data.upi_id
  });
  return {
    ok: true
  };
});
const getHomeBanners_createServerFn_handler = createServerRpc({
  id: "d35217098f5260fead9f3f352794e07b159e64f1589ad882d639fc3869e711fe",
  name: "getHomeBanners",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getHomeBanners.__executeServer(opts));
const getHomeBanners = createServerFn({
  method: "GET"
}).handler(getHomeBanners_createServerFn_handler, async () => {
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin;
  const {
    data
  } = await db.from("marketplace_settings").select("value").eq("key", "home_banners").maybeSingle();
  const parsed = homeBannersSchema.safeParse(data?.value);
  return parsed.success ? parsed.data.banners : [];
});
const adminSaveHomeBanners_createServerFn_handler = createServerRpc({
  id: "2fa60d5bc3bfb7cef54efb7c4bd6ce5b0de2390fe79e7a45b33c9bb3c338ba1a",
  name: "adminSaveHomeBanners",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSaveHomeBanners.__executeServer(opts));
const adminSaveHomeBanners = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => homeBannersSchema.parse(d)).handler(adminSaveHomeBanners_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin = await getAdmin();
  const db = supabaseAdmin;
  const banners = data.banners.map((banner, index) => ({
    ...banner,
    sort_order: banner.sort_order ?? index
  })).sort((a, b) => a.sort_order - b.sort_order);
  const {
    error
  } = await db.from("marketplace_settings").upsert({
    key: "home_banners",
    value: {
      banners
    },
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (error) throw new Error(error.message);
  await logAction(context.userId, "update", "marketplace_settings", "home_banners", {
    count: banners.length
  });
  return {
    ok: true
  };
});
export {
  adminBulkPriceUpdate_createServerFn_handler,
  adminDashboard_createServerFn_handler,
  adminDeleteCategory_createServerFn_handler,
  adminDeleteProduct_createServerFn_handler,
  adminDeleteStore_createServerFn_handler,
  adminGetOrderDetail_createServerFn_handler,
  adminGetUserDetail_createServerFn_handler,
  adminListAuditLogs_createServerFn_handler,
  adminListCategories_createServerFn_handler,
  adminListProducts_createServerFn_handler,
  adminListStores_createServerFn_handler,
  adminListUsers_createServerFn_handler,
  adminPriceHistory_createServerFn_handler,
  adminSaveCallOrderSettings_createServerFn_handler,
  adminSaveCategory_createServerFn_handler,
  adminSaveHomeBanners_createServerFn_handler,
  adminSavePaymentSettings_createServerFn_handler,
  adminSaveProduct_createServerFn_handler,
  adminSaveStore_createServerFn_handler,
  adminSaveSupportSettings_createServerFn_handler,
  adminSendNotification_createServerFn_handler,
  adminSetStoreStatus_createServerFn_handler,
  adminSetUserBlocked_createServerFn_handler,
  adminSetUserRole_createServerFn_handler,
  adminUpdatePrice_createServerFn_handler,
  getCallOrderSettings_createServerFn_handler,
  getHomeBanners_createServerFn_handler,
  getPaymentSettings_createServerFn_handler,
  getSupportSettings_createServerFn_handler
};
