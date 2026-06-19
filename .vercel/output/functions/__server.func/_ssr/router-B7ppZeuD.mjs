import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { S as redirect, m as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-CR4UkH38.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-v_CxfV_5.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { P as Phone, M as MessageCircle, a as Mail } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, e as enumType, n as numberType, b as booleanType, a as arrayType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function useServerFn(serverFn) {
  const router2 = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router2.stores.location.get();
        return router2.navigate(router2.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router2, serverFn]);
}
const appCss = "/assets/styles-BokbPHMV.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const adminDashboard = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9ff7ac682d569ace29ac9f4c109dfff01a123caf2fc3a87d7b131f0a854906ad"));
const callOrderSchema = objectType({
  primary_phone: stringType().trim().max(30),
  secondary_phone: stringType().trim().max(30).optional().nullable(),
  whatsapp_number: stringType().trim().max(30).optional().nullable(),
  is_enabled: booleanType().default(true),
  available_from: stringType().trim().max(20).default("09:00"),
  available_to: stringType().trim().max(20).default("21:00"),
  instructions: stringType().trim().max(500).optional().nullable()
});
const getCallOrderSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("197ac4a219c48bd25e8d4b6469a18487dcd6c9bb95344d3713eea8ac4461e78f"));
const adminSaveCallOrderSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => callOrderSchema.parse(d)).handler(createSsrRpc("114ea6e68af36fdc9d56c7521d6b3b2e5abc09645bf37526a0b739b7061a608a"));
const adminGetOrderDetail = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  orderId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("5022e5ccca5be62ca4871af80ca2da60d8becadf303e0414742b723133ed1a2c"));
const adminGetUserDetail = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  range: enumType(["7", "30", "90", "all"]).optional()
}).parse(d)).handler(createSsrRpc("c6aebd0cde54dfb0c41e0efbdc86e4a6d2f069048797740c2c9bb8e8a44c16fd"));
const adminListCategories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("16adcae68f7f6ee62a1f2c605455af763ee11cf325960f90579e35d6bc275907"));
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
const adminSaveCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => categorySchema.parse(d)).handler(createSsrRpc("35f84d67dda2de6df81b7a43c7acdb0df007930bc74b903bb0d1784b68ab2349"));
const adminDeleteCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("950328abc056627e7020b8ee4af15de2c8185c6b4f0fa341cec497db75a14951"));
const adminListStores = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("adf61c7212b1948e5c9e6ed11636e3e5882e1956e31fa4c98543fa951ead7c93"));
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
const adminSaveStore = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => storeSchema.parse(d)).handler(createSsrRpc("9b9f86beb9624c57909087a6163aa04fd8cc1e635f6c99193e012043d9ae6ac3"));
const adminSetStoreStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["active", "pending", "suspended"])
}).parse(d)).handler(createSsrRpc("067dedd5ce790eefee9c0e98254709a349ceaed18c3439eb32d0d588dc1c29e8"));
const adminDeleteStore = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("cba90266c9a7758c97eb8361bbee0e080b445247010a30e61a622d12457b64f7"));
const adminListProducts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  storeId: stringType().uuid().optional()
}).parse(d ?? {})).handler(createSsrRpc("9932f7d91182148199cbc8b49e99aa83ab2855e0f2166e0d0e38e6c091b587df"));
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
const adminSaveProduct = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => productSchema.parse(d)).handler(createSsrRpc("0aba47d27a6b467234d5b8b494d16bb446b7ca53f463ecbbd00e9a33a19ef0f3"));
const adminDeleteProduct = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("0ddf57ac23192120a1e98e48f57343c6fe83e8a1ddcf5df54be83354a1f768ad"));
const adminUpdatePrice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  productId: stringType().uuid(),
  newPrice: numberType().min(0).max(1e6),
  reason: stringType().trim().max(120).optional(),
  notify: booleanType().optional()
}).parse(d)).handler(createSsrRpc("bf03c9692c8986b0d44bfec034d5fc6cfca624ab9263b61cfb0c4fd43bc7cd9b"));
const adminBulkPriceUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["all", "category", "store"]),
  categoryKey: stringType().trim().max(40).optional(),
  storeId: stringType().uuid().optional(),
  direction: enumType(["increase", "decrease"]),
  percent: numberType().min(0.1).max(100)
}).parse(d)).handler(createSsrRpc("0a131f04c1634cbae2b223a0e370a611fe2d32b75e7d95748deaebbf6006221d"));
const adminPriceHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  productId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("7bbe482ab07671a2c301289bd7e15c3282819f8c8e7a5182c08c56c8f343a5c1"));
const adminListUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("35cf6cc28f61c798a570ec39672552de8ed250f60706565e25b34a66f0c5b240"));
const adminSetUserBlocked = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  blocked: booleanType()
}).parse(d)).handler(createSsrRpc("95b6aa2b4978dfa32791d4aec5b5df227e7607e3a64ad55178ad66bc334781df"));
const ROLE_VALUES = ["customer", "store_manager", "admin", "super_admin", "seller", "rider"];
const adminSetUserRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  role: enumType(ROLE_VALUES)
}).parse(d)).handler(createSsrRpc("91a135e4d78e750cc628d4feed26d426cf052f854224132c36d2e82238cebb15"));
const adminListAuditLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("19b61697a30ea0ed27854ab6a9e0511b6d21993f1a70cdfc01272dd52485a772"));
const adminSendNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  audience: enumType(["all", "user"]),
  userId: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(120),
  body: stringType().trim().max(500).optional(),
  type: stringType().trim().max(30).optional()
}).parse(d)).handler(createSsrRpc("2ce335996f2b07a5db45e1394010b15094588b453097d464a8e3d8f8b1ac8a00"));
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
const getSupportSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("e283fdf50646b07175f274f8e8ea6222273344f27debab41ac321d8ef6aa9d52"));
const adminSaveSupportSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => supportSettingsSchema.parse(d)).handler(createSsrRpc("39b6ba3a70e04d10eb1ad7bf6b1f79b7f6e93e2fcfa7a04324d6e520309faa88"));
const getPaymentSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("2cc06b53a22ecdecb46145ee4eea022678a334a82d1b0ed1c81a00fc462da707"));
const adminSavePaymentSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => paymentSettingsSchema.parse(d)).handler(createSsrRpc("e8f5caf1e1838a8223f44c8fb473b27f87c239cf57e23027637a83cb352a2668"));
const getHomeBanners = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d35217098f5260fead9f3f352794e07b159e64f1589ad882d639fc3869e711fe"));
const adminSaveHomeBanners = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => homeBannersSchema.parse(d)).handler(createSsrRpc("2fa60d5bc3bfb7cef54efb7c4bd6ce5b0de2390fe79e7a45b33c9bb3c338ba1a"));
function FloatingContact() {
  const getSettings = useServerFn(getSupportSettings);
  const { data } = useQuery({
    queryKey: ["support-settings"],
    queryFn: () => getSettings(),
    staleTime: 5 * 60 * 1e3
  });
  const phone = data?.phone ?? "+919999999999";
  const whatsapp = data?.whatsapp ?? phone;
  const email = data?.email ?? "support@townkart.app";
  const whatsappDigits = whatsapp.replace(/\D/g, "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-24 right-3 z-40 flex flex-col gap-2 lg:bottom-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: `tel:${phone}`,
        "aria-label": "Call support",
        title: "Call support",
        className: "flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop transition-transform hover:scale-105",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: `https://wa.me/${whatsappDigits}`,
        target: "_blank",
        rel: "noreferrer",
        "aria-label": "WhatsApp support",
        title: "WhatsApp support",
        className: "flex h-11 w-11 items-center justify-center rounded-full bg-success text-success-foreground shadow-pop transition-transform hover:scale-105",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: `mailto:${email}`,
        "aria-label": "Email support",
        title: "Email support",
        className: "flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-pop ring-1 ring-border transition-transform hover:scale-105",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-5 w-5" })
      }
    )
  ] });
}
const PENDING_GOOGLE_PHONE_KEY = "townkart:pendingGooglePhone";
function safeStorageGet(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function safeStorageSet(storage, key, value) {
  try {
    storage?.setItem(key, value);
  } catch {
  }
}
function safeStorageRemove(storage, key) {
  try {
    storage?.removeItem(key);
  } catch {
  }
}
function normalizePhoneNumber(raw) {
  return raw.replace(/\D/g, "");
}
function isValidPhoneNumber(raw) {
  const digits = normalizePhoneNumber(raw);
  return digits.length >= 8 && digits.length <= 18;
}
function storePendingGooglePhone(raw) {
  const phone = normalizePhoneNumber(raw);
  if (typeof window === "undefined") return;
  safeStorageSet(window.localStorage, PENDING_GOOGLE_PHONE_KEY, phone);
  safeStorageSet(window.sessionStorage, PENDING_GOOGLE_PHONE_KEY, phone);
}
function getPendingGooglePhone() {
  if (typeof window === "undefined") return null;
  return safeStorageGet(window.localStorage, PENDING_GOOGLE_PHONE_KEY) ?? safeStorageGet(window.sessionStorage, PENDING_GOOGLE_PHONE_KEY);
}
function clearPendingGooglePhone() {
  if (typeof window === "undefined") return;
  safeStorageRemove(window.localStorage, PENDING_GOOGLE_PHONE_KEY);
  safeStorageRemove(window.sessionStorage, PENDING_GOOGLE_PHONE_KEY);
}
function googleProfileFromUser(user) {
  const metadata = user.user_metadata ?? {};
  return {
    fullName: typeof metadata.full_name === "string" ? metadata.full_name : typeof metadata.name === "string" ? metadata.name : null,
    email: user.email ?? null,
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : typeof metadata.picture === "string" ? metadata.picture : null
  };
}
async function syncGoogleProfile(user) {
  const { fullName, email, avatarUrl } = googleProfileFromUser(user);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const pendingPhone = getPendingGooglePhone();
  const phone = pendingPhone && isValidPhoneNumber(pendingPhone) ? normalizePhoneNumber(pendingPhone) : null;
  const { data: existing, error: existingError } = await supabase.from("profiles").select("id, phone, is_verified, provider").eq("id", user.id).maybeSingle();
  if (existingError) throw existingError;
  if (existing) {
    const updateData = {
      last_login_at: now,
      email
    };
    if (phone) {
      updateData.phone = phone;
      updateData.is_verified = false;
    }
    if (existing.provider !== "google") updateData.provider = "google";
    const { error: error2 } = await supabase.from("profiles").update(updateData).eq("id", user.id);
    if (error2) throw error2;
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
    last_login_at: now
  });
  if (error) throw error;
  clearPendingGooglePhone();
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$r = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "TownKart - Hyperlocal Delivery" },
      {
        name: "description",
        content: "TownKart delivers groceries, food, medicines and more from your neighbourhood stores in minutes."
      },
      { name: "author", content: "TownKart" },
      { property: "og:title", content: "TownKart - Hyperlocal Delivery" },
      {
        property: "og:description",
        content: "Order from local stores and get it delivered in minutes."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@TownKart" }
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/townkart-logo.png" },
      { rel: "apple-touch-icon", href: "/townkart-logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      },
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$r.useRouteContext();
  const router2 = useRouter();
  reactExports.useEffect(() => {
    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          const provider = session?.user.app_metadata.provider;
          const hasGoogleIdentity = session?.user.identities?.some(
            (identity) => identity.provider === "google"
          );
          if ((provider === "google" || hasGoogleIdentity) && session?.user) {
            void syncGoogleProfile(session.user).catch((error) => {
              console.error("[Auth] Failed to sync Google profile", error);
            }).finally(() => {
              router2.invalidate();
              queryClient.invalidateQueries();
            });
          }
        }
        if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED")
          return;
        router2.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      return () => data.subscription.unsubscribe();
    } catch (error) {
      console.error("[Auth] Supabase auth listener failed to start", error);
      return void 0;
    }
  }, [router2, queryClient]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingContact, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true })
  ] });
}
const BASE_URL = "";
const Route$q = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", changefreq: "weekly", priority: "1.0" }
        ];
        const urls = entries.map(
          (e) => [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`
          ].filter(Boolean).join("\n")
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$p = () => import("./route-CX4kFUdR.mjs");
const Route$p = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/auth/login"
      });
    }
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
async function signOutClean(queryClient, navigate) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
  navigate({
    to: "/auth/login",
    replace: true
  });
}
const $$splitComponentImporter$o = () => import("./index-SH27OeBw.mjs");
const Route$o = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "TownKart - Hyperlocal Delivery from Local Shops"
    }, {
      name: "description",
      content: "Order groceries, food, medicines and more from neighbourhood stores. Fast hyperlocal delivery in minutes with TownKart."
    }, {
      property: "og:title",
      content: "TownKart - Hyperlocal Delivery"
    }, {
      property: "og:description",
      content: "Order from local stores and get it delivered in minutes with TownKart."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./verify-C8kX9MH3.mjs");
const searchSchema = objectType({
  phone: stringType(),
  name: stringType().optional(),
  dev: stringType().optional()
});
const Route$n = createFileRoute("/auth/verify")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [{
      title: "Verify - TownKart"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./login-BysZrpcG.mjs");
const Route$m = createFileRoute("/auth/login")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data
    } = await supabase.auth.getUser();
    if (data.user) {
      throw redirect({
        to: "/home"
      });
    }
  },
  head: () => ({
    meta: [{
      title: "Log in - TownKart"
    }, {
      name: "description",
      content: "Sign in to TownKart with Google."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./vendor-0l4HhN1k.mjs");
const Route$l = createFileRoute("/_authenticated/vendor")({
  beforeLoad: async () => {
    const {
      data
    } = await supabase.from("user_roles").select("role").in("role", ["vendor", "store_manager", "admin", "super_admin"]);
    if (!data?.length) throw redirect({
      to: "/home"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./profile-BT7dU6J-.mjs");
const Route$k = createFileRoute("/_authenticated/profile")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./orders-C5w5YVnq.mjs");
const Route$j = createFileRoute("/_authenticated/orders")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./nearby-RlLcYoRb.mjs");
const Route$i = createFileRoute("/_authenticated/nearby")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./home-mFpm-uav.mjs");
const Route$h = createFileRoute("/_authenticated/home")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./delivery-CkwW_DzZ.mjs");
const Route$g = createFileRoute("/_authenticated/delivery")({
  beforeLoad: async () => {
    const {
      data
    } = await supabase.from("user_roles").select("role").in("role", ["delivery_partner", "rider", "admin", "super_admin"]);
    if (!data?.length) throw redirect({
      to: "/home"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./cart-B2ufsK1B.mjs");
const Route$f = createFileRoute("/_authenticated/cart")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./route-Dl20LNBu.mjs");
const Route$e = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const {
      data,
      error
    } = await supabase.from("user_roles").select("role").in("role", ["admin", "super_admin"]);
    if (error || !data || data.length === 0) {
      throw redirect({
        to: "/home"
      });
    }
    return {
      adminRoles: data.map((r) => r.role)
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./index-DifNOo01.mjs");
const Route$d = createFileRoute("/_authenticated/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./store._storeId-B-FthQKW.mjs");
const Route$c = createFileRoute("/_authenticated/store/$storeId")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./orders._orderId-CGSnpupj.mjs");
const Route$b = createFileRoute("/_authenticated/orders/$orderId")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./users-CZkWSe1W.mjs");
const Route$a = createFileRoute("/_authenticated/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./stores-B7mmqLhG.mjs");
const Route$9 = createFileRoute("/_authenticated/admin/stores")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./settings-Ci0DwsHE.mjs");
const Route$8 = createFileRoute("/_authenticated/admin/settings")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./products-CVqrjcvr.mjs");
const Route$7 = createFileRoute("/_authenticated/admin/products")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./pricing-Cb9oybus.mjs");
const Route$6 = createFileRoute("/_authenticated/admin/pricing")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./orders-B_up80ks.mjs");
const Route$5 = createFileRoute("/_authenticated/admin/orders")({
  validateSearch: (search) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./notifications-SYu2nmmK.mjs");
const Route$4 = createFileRoute("/_authenticated/admin/notifications")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./categories-Dk9HKk2I.mjs");
const Route$3 = createFileRoute("/_authenticated/admin/categories")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./call-orders-DaRwSC1j.mjs");
const Route$2 = createFileRoute("/_authenticated/admin/call-orders")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./audit-CYYXlSe6.mjs");
const Route$1 = createFileRoute("/_authenticated/admin/audit")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./users._userId-VV9tS-Cb.mjs");
const Route = createFileRoute("/_authenticated/admin/users/$userId")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SitemapDotxmlRoute = Route$q.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$r
});
const AuthenticatedRouteRoute = Route$p.update({
  id: "/_authenticated",
  getParentRoute: () => Route$r
});
const IndexRoute = Route$o.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$r
});
const AuthVerifyRoute = Route$n.update({
  id: "/auth/verify",
  path: "/auth/verify",
  getParentRoute: () => Route$r
});
const AuthLoginRoute = Route$m.update({
  id: "/auth/login",
  path: "/auth/login",
  getParentRoute: () => Route$r
});
const AuthenticatedVendorRoute = Route$l.update({
  id: "/vendor",
  path: "/vendor",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedProfileRoute = Route$k.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedOrdersRoute = Route$j.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedNearbyRoute = Route$i.update({
  id: "/nearby",
  path: "/nearby",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedHomeRoute = Route$h.update({
  id: "/home",
  path: "/home",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDeliveryRoute = Route$g.update({
  id: "/delivery",
  path: "/delivery",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCartRoute = Route$f.update({
  id: "/cart",
  path: "/cart",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAdminRouteRoute = Route$e.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAdminIndexRoute = Route$d.update({
  id: "/",
  path: "/",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedStoreStoreIdRoute = Route$c.update({
  id: "/store/$storeId",
  path: "/store/$storeId",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedOrdersOrderIdRoute = Route$b.update({
  id: "/$orderId",
  path: "/$orderId",
  getParentRoute: () => AuthenticatedOrdersRoute
});
const AuthenticatedAdminUsersRoute = Route$a.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminStoresRoute = Route$9.update({
  id: "/stores",
  path: "/stores",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminSettingsRoute = Route$8.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminProductsRoute = Route$7.update({
  id: "/products",
  path: "/products",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminPricingRoute = Route$6.update({
  id: "/pricing",
  path: "/pricing",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminOrdersRoute = Route$5.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminNotificationsRoute = Route$4.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminCategoriesRoute = Route$3.update({
  id: "/categories",
  path: "/categories",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminCallOrdersRoute = Route$2.update({
  id: "/call-orders",
  path: "/call-orders",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminAuditRoute = Route$1.update({
  id: "/audit",
  path: "/audit",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminUsersUserIdRoute = Route.update({
  id: "/$userId",
  path: "/$userId",
  getParentRoute: () => AuthenticatedAdminUsersRoute
});
const AuthenticatedAdminUsersRouteChildren = {
  AuthenticatedAdminUsersUserIdRoute
};
const AuthenticatedAdminUsersRouteWithChildren = AuthenticatedAdminUsersRoute._addFileChildren(
  AuthenticatedAdminUsersRouteChildren
);
const AuthenticatedAdminRouteRouteChildren = {
  AuthenticatedAdminAuditRoute,
  AuthenticatedAdminCallOrdersRoute,
  AuthenticatedAdminCategoriesRoute,
  AuthenticatedAdminNotificationsRoute,
  AuthenticatedAdminOrdersRoute,
  AuthenticatedAdminPricingRoute,
  AuthenticatedAdminProductsRoute,
  AuthenticatedAdminSettingsRoute,
  AuthenticatedAdminStoresRoute,
  AuthenticatedAdminUsersRoute: AuthenticatedAdminUsersRouteWithChildren,
  AuthenticatedAdminIndexRoute
};
const AuthenticatedAdminRouteRouteWithChildren = AuthenticatedAdminRouteRoute._addFileChildren(
  AuthenticatedAdminRouteRouteChildren
);
const AuthenticatedOrdersRouteChildren = {
  AuthenticatedOrdersOrderIdRoute
};
const AuthenticatedOrdersRouteWithChildren = AuthenticatedOrdersRoute._addFileChildren(AuthenticatedOrdersRouteChildren);
const AuthenticatedRouteRouteChildren = {
  AuthenticatedAdminRouteRoute: AuthenticatedAdminRouteRouteWithChildren,
  AuthenticatedCartRoute,
  AuthenticatedDeliveryRoute,
  AuthenticatedHomeRoute,
  AuthenticatedNearbyRoute,
  AuthenticatedOrdersRoute: AuthenticatedOrdersRouteWithChildren,
  AuthenticatedProfileRoute,
  AuthenticatedVendorRoute,
  AuthenticatedStoreStoreIdRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  SitemapDotxmlRoute,
  AuthLoginRoute,
  AuthVerifyRoute
};
const routeTree = Route$r._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  adminSavePaymentSettings as A,
  adminListProducts as B,
  adminSaveProduct as C,
  adminDeleteProduct as D,
  adminPriceHistory as E,
  adminBulkPriceUpdate as F,
  adminUpdatePrice as G,
  Route$5 as H,
  adminGetOrderDetail as I,
  adminSendNotification as J,
  adminSaveCategory as K,
  adminDeleteCategory as L,
  adminSaveCallOrderSettings as M,
  adminListAuditLogs as N,
  Route as O,
  adminGetUserDetail as P,
  router as Q,
  Route$p as R,
  Route$n as a,
  createSsrRpc as b,
  clearPendingGooglePhone as c,
  signOutClean as d,
  getHomeBanners as e,
  getPaymentSettings as f,
  getPendingGooglePhone as g,
  adminDashboard as h,
  isValidPhoneNumber as i,
  Route$c as j,
  getCallOrderSettings as k,
  Route$b as l,
  adminListUsers as m,
  normalizePhoneNumber as n,
  adminSetUserBlocked as o,
  adminSetUserRole as p,
  adminListStores as q,
  adminListCategories as r,
  storePendingGooglePhone as s,
  adminSaveStore as t,
  useServerFn as u,
  adminDeleteStore as v,
  adminSetStoreStatus as w,
  getSupportSettings as x,
  adminSaveSupportSettings as y,
  adminSaveHomeBanners as z
};
