import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, q as adminListStores, r as adminListCategories, B as adminListProducts, F as adminBulkPriceUpdate, G as adminUpdatePrice } from "./router-B7ppZeuD.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as timeAgo } from "./format-BiGzNIcJ.mjs";
import { u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { I as Input } from "./input-BJtaFeMi.mjs";
import { L as Label } from "./label-BDTFhyHh.mjs";
import { S as Switch } from "./switch-Cfwr8GBY.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CNZ703ex.mjs";
import "../_libs/seroval.mjs";
import { Z as Zap, v as TrendingUp, W as TrendingDown } from "../_libs/lucide-react.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
function PricingPage() {
  const qc = useQueryClient();
  const listStores = useServerFn(adminListStores);
  const listCats = useServerFn(adminListCategories);
  const listProducts = useServerFn(adminListProducts);
  const bulk = useServerFn(adminBulkPriceUpdate);
  const updatePrice = useServerFn(adminUpdatePrice);
  const [scope, setScope] = reactExports.useState("all");
  const [categoryKey, setCategoryKey] = reactExports.useState("");
  const [storeId, setStoreId] = reactExports.useState("");
  const [direction, setDirection] = reactExports.useState("increase");
  const [percent, setPercent] = reactExports.useState(5);
  const [editing, setEditing] = reactExports.useState({});
  const [notify, setNotify] = reactExports.useState(true);
  const {
    data: stores = []
  } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: () => listStores()
  });
  const {
    data: categories = []
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCats()
  });
  const {
    data: products = [],
    isLoading
  } = useQuery({
    queryKey: ["admin-products", "all"],
    queryFn: () => listProducts({
      data: {}
    })
  });
  const bulkMut = useMutation({
    mutationFn: () => bulk({
      data: {
        scope,
        categoryKey: scope === "category" ? categoryKey : void 0,
        storeId: scope === "store" ? storeId : void 0,
        direction,
        percent: Number(percent)
      }
    }),
    onSuccess: (r) => {
      toast.success(`Updated ${r.updated} product${r.updated === 1 ? "" : "s"}`);
      qc.invalidateQueries({
        queryKey: ["admin-products"]
      });
      qc.invalidateQueries({
        queryKey: ["admin-dashboard"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  const quickMut = useMutation({
    mutationFn: (v) => updatePrice({
      data: {
        ...v,
        notify,
        reason: "quick update"
      }
    }),
    onSuccess: (_r, v) => {
      toast.success("Price updated");
      setEditing((e) => {
        const next = {
          ...e
        };
        delete next[v.productId];
        return next;
      });
      qc.invalidateQueries({
        queryKey: ["admin-products"]
      });
      qc.invalidateQueries({
        queryKey: ["admin-dashboard"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  const canBulk = (scope === "all" || scope === "category" && categoryKey || scope === "store" && storeId) && percent > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Dynamic pricing" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Update market prices instantly — changes reflect across the app live." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-primary" }),
        " Bulk price update"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Apply a percentage change across a scope. Every change is recorded in price history." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: scope, onValueChange: (v) => setScope(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All products" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "category", children: "By category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "store", children: "By store" })
            ] })
          ] })
        ] }),
        scope === "category" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: categoryKey, onValueChange: setCategoryKey, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.key, children: c.label }, c.key)) })
          ] })
        ] }),
        scope === "store" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: storeId, onValueChange: setStoreId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: stores.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: s.name }, s.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: direction, onValueChange: (v) => setDirection(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "increase", children: "Increase" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "decrease", children: "Decrease" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Percentage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: percent, min: 0.1, step: 0.5, onChange: (e) => setPercent(Number(e.target.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4", disabled: !canBulk || bulkMut.isPending, onClick: () => bulkMut.mutate(), children: [
        direction === "increase" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4" }),
        bulkMut.isPending ? "Applying…" : `Apply ${direction} ${percent}%`
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-border/60 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Quick price edits" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notify customers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: notify, onCheckedChange: setNotify })
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 p-5", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 animate-pulse rounded-lg bg-muted" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-border/40", children: [
        products.map((p) => {
          const value = editing[p.id] ?? String(p.price);
          const changed = Number(value) !== Number(p.price);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 px-5 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-semibold", children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                p.stores?.name ?? "—",
                " · updated ",
                timeAgo(p.price_updated_at)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "w-28", value, onChange: (e) => setEditing((s) => ({
              ...s,
              [p.id]: e.target.value
            })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: !changed || quickMut.isPending, onClick: () => quickMut.mutate({
              productId: p.id,
              newPrice: Number(value)
            }), children: "Save" })
          ] }, p.id);
        }),
        products.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-5 py-10 text-center text-muted-foreground", children: "No products yet." })
      ] })
    ] })
  ] });
}
export {
  PricingPage as component
};
