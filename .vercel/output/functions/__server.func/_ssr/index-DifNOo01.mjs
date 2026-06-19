import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, h as adminDashboard } from "./router-B7ppZeuD.mjs";
import { f as formatINR } from "./format-BiGzNIcJ.mjs";
import { c as categoryLabel } from "./categories-DO686Z4O.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { f as Store, u as Tags, g as Package, w as Users, q as ShoppingBag, I as IndianRupee, v as TrendingUp } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./server-CR4UkH38.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-v_CxfV_5.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./client-Cevw5FM9.mjs";
import "../_libs/zod.mjs";
function DashboardPage() {
  const fetchDashboard = useServerFn(adminDashboard);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchDashboard()
  });
  if (isLoading || !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", children: Array.from({
        length: 8
      }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 animate-pulse rounded-2xl bg-muted" }, i)) })
    ] });
  }
  const {
    totals,
    salesByDay,
    topProducts,
    popularCategories,
    topStores,
    recentPriceChanges
  } = data;
  const maxSale = Math.max(1, ...salesByDay.map((d) => d.total));
  const cards = [{
    label: "Total Stores",
    value: totals.stores,
    icon: Store
  }, {
    label: "Total Categories",
    value: totals.categories,
    icon: Tags
  }, {
    label: "Total Products",
    value: totals.products,
    icon: Package
  }, {
    label: "Total Users",
    value: totals.users,
    icon: Users
  }, {
    label: "Total Orders",
    value: totals.orders,
    icon: ShoppingBag
  }, {
    label: "Pending Orders",
    value: totals.pendingOrders,
    icon: ShoppingBag
  }, {
    label: "Delivered Orders",
    value: totals.deliveredOrders,
    icon: ShoppingBag
  }, {
    label: "Revenue Today",
    value: formatINR(totals.revenueToday),
    icon: IndianRupee
  }, {
    label: "Revenue This Month",
    value: formatINR(totals.revenueThisMonth),
    icon: TrendingUp
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Marketplace overview and live performance." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", children: cards.map((c) => {
      const Icon = c.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: c.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-bold", children: c.value })
      ] }, c.label);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-card lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Sales — last 14 days" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex h-44 items-end gap-1.5", children: salesByDay.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-1 flex-col items-center justify-end gap-1", title: `${d.date}: ${formatINR(d.total)} (${d.orders} orders)`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-t bg-primary/80 transition-all group-hover:bg-primary", style: {
            height: `${d.total / maxSale * 100}%`,
            minHeight: 2
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground", children: d.date.slice(8) })
        ] }, d.date)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Popular categories" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-3", children: [
          popularCategories.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-muted-foreground", children: "No data yet." }),
          popularCategories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: categoryLabel(c.category) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold", children: [
              c.count,
              " ",
              c.count === 1 ? "store" : "stores"
            ] })
          ] }, c.category))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Most popular products" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-3", children: [
          topProducts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-muted-foreground", children: "No orders yet." }),
          topProducts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-3 shrink-0 text-muted-foreground", children: [
              p.qty,
              " sold · ",
              formatINR(p.revenue)
            ] })
          ] }, p.name))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Top performing stores" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-3", children: [
          topStores.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-muted-foreground", children: "No orders yet." }),
          topStores.map((store) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: store.store }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 text-muted-foreground", children: [
              store.orders,
              " orders - ",
              formatINR(store.revenue)
            ] })
          ] }, store.store))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 lg:grid-cols-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Recent price changes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-3", children: [
        recentPriceChanges.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-muted-foreground", children: "No changes yet." }),
        recentPriceChanges.slice(0, 8).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: new Date(c.created_at).toLocaleDateString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            c.old_price != null ? formatINR(Number(c.old_price)) : "—",
            " →",
            " ",
            formatINR(Number(c.new_price))
          ] })
        ] }, c.id))
      ] })
    ] }) })
  ] });
}
export {
  DashboardPage as component
};
