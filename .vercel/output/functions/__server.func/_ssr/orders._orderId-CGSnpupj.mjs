import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as Route$b, u as useServerFn } from "./router-B7ppZeuD.mjs";
import { g as getMyOrderDetail } from "./order.functions-CfGdxtVl.mjs";
import { f as formatINR } from "./format-BiGzNIcJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { A as ArrowLeft, c as Clock, E as PackageCheck, T as Truck, F as CircleCheck, G as CircleX } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-7zHHmOyJ.mjs";
import "../_libs/tailwind-merge.mjs";
const STEPS = [{
  key: "pending",
  label: "Pending",
  icon: Clock
}, {
  key: "accepted",
  label: "Accepted",
  icon: PackageCheck
}, {
  key: "preparing",
  label: "Preparing",
  icon: PackageCheck
}, {
  key: "out_for_delivery",
  label: "Out for Delivery",
  icon: Truck
}, {
  key: "delivered",
  label: "Delivered",
  icon: CircleCheck
}];
function OrderDetailPage() {
  const {
    orderId
  } = Route$b.useParams();
  const getDetail = useServerFn(getMyOrderDetail);
  const {
    data: order,
    isLoading
  } = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => getDetail({
      data: {
        orderId
      }
    })
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-4 mt-4 h-96 animate-pulse rounded-2xl bg-muted" });
  }
  if (!order) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/orders", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Orders"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-sm text-muted-foreground", children: "Order not found." })
    ] });
  }
  const status = String(order.status);
  const activeIndex = status === "cancelled" ? -1 : Math.max(0, STEPS.findIndex((s) => s.key === status));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 px-4 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/orders", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      "Back"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl bg-card p-4 shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Order ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-lg font-extrabold", children: order.tracking_code ?? order.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: new Date(order.created_at).toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary", children: status.replaceAll("_", " ") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-card p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Order Timeline" }),
      status === "cancelled" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Cancelled" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: STEPS.map((step, index) => {
        const Icon = step.icon;
        const done = index <= activeIndex;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-8 w-8 items-center justify-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: done ? "font-semibold" : "text-muted-foreground", children: step.label })
        ] }, step.key);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-card p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Items" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: order.order_items?.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          item.quantity,
          "x ",
          item.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: formatINR(Number(item.unit_price) * Number(item.quantity)) })
      ] }, item.name)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { title: "Delivery Address", value: order.address }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { title: "Store", value: order.store_name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { title: "Customer", value: order.profiles?.full_name ?? "Customer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { title: "Phone", value: order.profiles?.phone ?? "Not available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { title: "Payment Method", value: order.payment_method ?? "Cash on delivery" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { title: "Total Amount", value: formatINR(Number(order.total)) })
    ] })
  ] });
}
function InfoCard({
  title,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card p-4 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-semibold", children: value })
  ] });
}
export {
  OrderDetailPage as component
};
