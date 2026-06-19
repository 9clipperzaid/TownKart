import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { f as formatINR } from "./format-BiGzNIcJ.mjs";
import { f as Store, g as Package, C as ClipboardList } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-7zHHmOyJ.mjs";
import "../_libs/tailwind-merge.mjs";
function VendorDashboard() {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["vendor-dashboard"],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const {
        data: stores
      } = await supabase.from("stores").select("id, name, status, rating").eq("owner_id", user.id);
      const storeIds = (stores ?? []).map((s) => s.id);
      const {
        data: products
      } = storeIds.length ? await supabase.from("products").select("id").in("store_id", storeIds) : {
        data: []
      };
      const {
        data: orders
      } = storeIds.length ? await supabase.from("orders").select("id, status, total, store_name, created_at").in("store_id", storeIds).order("created_at", {
        ascending: false
      }).limit(20) : {
        data: []
      };
      return {
        stores: stores ?? [],
        products: products ?? [],
        orders: orders ?? []
      };
    }
  });
  const revenue = (data?.orders ?? []).reduce((sum, order) => sum + Number(order.total), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl space-y-6 px-4 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Vendor Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your stores, products and active orders." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/home", children: "Storefront" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Store, label: "Stores", value: data?.stores.length ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Package, label: "Products", value: data?.products.length ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: ClipboardList, label: "Orders", value: data?.orders.length ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: ClipboardList, label: "Revenue", value: formatINR(revenue) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Recent orders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 animate-pulse rounded-xl bg-muted" }),
        (data?.orders ?? []).map((order) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl bg-muted/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: order.store_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: order.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: formatINR(order.total) })
        ] }, order.id)),
        !isLoading && data?.orders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No orders yet." })
      ] })
    ] })
  ] });
}
function Stat({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", children: value })
  ] });
}
export {
  VendorDashboard as component
};
