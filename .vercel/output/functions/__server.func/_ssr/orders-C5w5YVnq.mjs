import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./router-B7ppZeuD.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { c as cancelMyOrder } from "./order.functions-CfGdxtVl.mjs";
import { O as ORDER_STATUS, t as timeAgo, f as formatINR } from "./format-BiGzNIcJ.mjs";
import { c as cn, u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { T as Textarea } from "./textarea-BkQV2irW.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-ExHJkZ2L.mjs";
import "../_libs/seroval.mjs";
import { g as Package, b as MapPin } from "../_libs/lucide-react.mjs";
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
import "../_libs/zod.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
function OrdersPage() {
  const queryClient = useQueryClient();
  const cancelOrder = useServerFn(cancelMyOrder);
  const [cancelTarget, setCancelTarget] = reactExports.useState(null);
  const [cancelReason, setCancelReason] = reactExports.useState("");
  const {
    data: orders = [],
    isLoading
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("orders").select("*, order_items(name, quantity)").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder({
      data: {
        orderId: cancelTarget.id,
        reason: cancelReason.trim()
      }
    }),
    onSuccess: () => {
      toast.success("Order cancelled");
      setCancelTarget(null);
      setCancelReason("");
      queryClient.invalidateQueries({
        queryKey: ["orders"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e, "Could not cancel order"))
  });
  if (!isLoading && orders.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center px-6 pt-24 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-full bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-9 w-9 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-xl font-bold", children: "No orders yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Your past and active orders will appear here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/home", children: "Start shopping" }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-extrabold", children: "Your orders" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: isLoading ? [0, 1].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 animate-pulse rounded-2xl bg-muted" }, i)) : orders.map((order) => {
      const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.placed;
      const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
      const canCancel = ["pending", "accepted"].includes(order.status);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card p-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/orders/$orderId", params: {
          orderId: order.id
        }, className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: order.store_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                timeAgo(order.created_at),
                " · ",
                itemCount,
                " item",
                itemCount > 1 ? "s" : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", status.tone === "success" && "bg-success/15 text-success", status.tone === "primary" && "bg-primary/15 text-primary", status.tone === "warning" && "bg-warning/20 text-warning-foreground"), children: status.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-1 text-sm text-muted-foreground", children: order.order_items.map((item) => `${item.quantity}x ${item.name}`).join(", ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-start gap-1.5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: order.address })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between border-t border-border pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            canCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => setCancelTarget(order), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold", children: formatINR(order.total) })
          ] })
        ] })
      ] }, order.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!cancelTarget, onOpenChange: (open) => {
      if (!open) {
        setCancelTarget(null);
        setCancelReason("");
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Cancel this order?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Tell us why you want to cancel. The product stock will be restored after cancellation." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: cancelReason, onChange: (e) => setCancelReason(e.target.value), placeholder: "Example: Ordered by mistake", rows: 4 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setCancelTarget(null);
          setCancelReason("");
        }, children: "Keep order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: cancelMutation.isPending || cancelReason.trim().length < 5, onClick: () => cancelMutation.mutate(), children: cancelMutation.isPending ? "Cancelling..." : "Cancel order" })
      ] })
    ] }) })
  ] });
}
export {
  OrdersPage as component
};
