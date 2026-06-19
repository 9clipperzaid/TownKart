import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { H as Route$5, u as useServerFn, I as adminGetOrderDetail } from "./router-B7ppZeuD.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as listOperationalOrders, u as updateOrderStatus } from "./order.functions-CfGdxtVl.mjs";
import { f as formatINR } from "./format-BiGzNIcJ.mjs";
import { u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { I as Input } from "./input-BJtaFeMi.mjs";
import { T as Textarea } from "./textarea-BkQV2irW.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CNZ703ex.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-ExHJkZ2L.mjs";
import "../_libs/seroval.mjs";
import { c as Clock, E as PackageCheck, T as Truck, F as CircleCheck, G as CircleX, p as Search, b as MapPin, J as Eye, N as Navigation } from "../_libs/lucide-react.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
const STATUSES = [{
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
}, {
  key: "cancelled",
  label: "Cancelled",
  icon: CircleX
}];
function AdminOrdersPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const searchParams = Route$5.useSearch();
  const list = useServerFn(listOperationalOrders);
  const updateStatus = useServerFn(updateOrderStatus);
  const getDetail = useServerFn(adminGetOrderDetail);
  const [q, setQ] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [selectedId, setSelectedId] = reactExports.useState(searchParams.orderId ?? null);
  const {
    data: orders = [],
    isLoading
  } = useQuery({
    queryKey: ["operational-orders"],
    queryFn: () => list(),
    refetchInterval: 15e3
  });
  reactExports.useEffect(() => {
    if (searchParams.orderId) setSelectedId(searchParams.orderId);
  }, [searchParams.orderId]);
  const {
    data: selectedOrder
  } = useQuery({
    queryKey: ["admin-order-detail", selectedId],
    queryFn: () => getDetail({
      data: {
        orderId: selectedId
      }
    }),
    enabled: !!selectedId
  });
  const mut = useMutation({
    mutationFn: (input) => updateStatus({
      data: input
    }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({
        queryKey: ["operational-orders"]
      });
      qc.invalidateQueries({
        queryKey: ["admin-dashboard"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  const filteredOrders = reactExports.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((o) => {
      const haystack = [o.id, o.tracking_code, o.store_name, o.address, ...(o.order_items ?? []).map((item) => item.name)].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [orders, q]);
  const grouped = STATUSES.map((status) => ({
    ...status,
    orders: filteredOrders.filter((o) => o.status === status.key)
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Orders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Live fulfillment board for order acceptance, preparation, delivery and cancellation." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search order ID, customer, phone or address", className: "pl-9" })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 lg:grid-cols-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56 animate-pulse rounded-2xl bg-muted" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 xl:grid-cols-3 2xl:grid-cols-6", children: grouped.map((group) => {
      const Icon = group.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "min-h-64 rounded-2xl border border-border/60 bg-card p-3 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-sm font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-primary" }),
            group.label
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-secondary px-2 py-0.5 text-xs font-bold", children: group.orders.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5", children: [
          group.orders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { onClick: () => setSelectedId(order.id), className: "cursor-pointer rounded-xl border border-border/50 bg-background p-3 transition hover:-translate-y-0.5 hover:shadow-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-sm font-bold", children: order.store_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: order.tracking_code ?? order.id.slice(0, 8) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-sm font-extrabold", children: formatINR(order.total) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-2 text-xs text-muted-foreground", children: order.order_items?.map((item) => `${item.quantity}x ${item.name}`).join(", ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-1 text-xs text-muted-foreground", children: order.address }),
            order.delivery_latitude != null && order.delivery_longitude != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs font-semibold text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
              "Pin selected"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: order.status, onValueChange: (status) => mut.mutate({
                orderId: order.id,
                status
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.key, children: s.label }, s.key)) })
              ] }),
              order.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-8", onClick: () => mut.mutate({
                orderId: order.id,
                status: "accepted"
              }), children: "Accept" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-8", onClick: (e) => {
                e.stopPropagation();
                setSelectedId(order.id);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
                "View"
              ] })
            ] })
          ] }, order.id)),
          group.orders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl bg-muted/50 px-3 py-8 text-center text-xs text-muted-foreground", children: "No orders" })
        ] })
      ] }, group.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!selectedId, onOpenChange: (open) => {
      if (!open) {
        setSelectedId(null);
        setNotes("");
        navigate({
          to: "/admin/orders",
          search: {}
        });
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Order Details" }) }),
      !selectedOrder ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 animate-pulse rounded-xl bg-muted" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 rounded-xl bg-secondary p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Order ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-extrabold", children: selectedOrder.tracking_code ?? selectedOrder.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: new Date(selectedOrder.created_at).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary", children: String(selectedOrder.status).replaceAll("_", " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Customer", value: selectedOrder.profiles?.full_name ?? "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Phone", value: selectedOrder.profiles?.phone ?? "Not available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Full Address", value: selectedOrder.address }),
          selectedOrder.delivery_latitude != null && selectedOrder.delivery_longitude != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/40 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Map Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm font-semibold", children: [
              Number(selectedOrder.delivery_latitude).toFixed(6),
              ",",
              " ",
              Number(selectedOrder.delivery_longitude).toFixed(6)
            ] }),
            selectedOrder.delivery_location_accuracy != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Accuracy about ",
              Math.round(Number(selectedOrder.delivery_location_accuracy)),
              "m"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", className: "mt-3 h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `https://www.google.com/maps/search/?api=1&query=${selectedOrder.delivery_latitude},${selectedOrder.delivery_longitude}`, target: "_blank", rel: "noreferrer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-3.5 w-3.5" }),
              "Open map"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Store", value: selectedOrder.store_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Payment Details", value: `${selectedOrder.payment_method ?? "Cash on delivery"} - ${selectedOrder.payment_status ?? "pending"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Payment Reference", value: selectedOrder.payment_reference ?? "Not provided" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Delivery Partner", value: selectedOrder.delivery_partner_id ?? "Not assigned" }),
          selectedOrder.cancellation_reason && /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Cancellation Reason", value: selectedOrder.cancellation_reason })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "Ordered Products" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: selectedOrder.order_items?.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              item.quantity,
              "x ",
              item.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: formatINR(Number(item.quantity) * Number(item.unit_price)) })
          ] }, item.name)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 border-t border-border pt-3 text-right font-extrabold", children: [
            "Total ",
            formatINR(Number(selectedOrder.total))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "Status History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: (selectedOrder.status_history?.length ? selectedOrder.status_history : [{
            status: selectedOrder.status,
            created_at: selectedOrder.created_at
          }]).map((h, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: String(h.status).replaceAll("_", " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: new Date(h.created_at).toLocaleString() }),
            h.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: h.notes })
          ] }, `${h.status}-${index}`)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-[1fr_auto]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Add notes for this status update" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedOrder.status, onValueChange: (status) => mut.mutate({
            orderId: selectedOrder.id,
            status,
            notes: notes.trim() || void 0
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "sm:w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.key, children: s.label }, s.key)) })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
function Detail({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/40 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-semibold", children: value })
  ] });
}
export {
  AdminOrdersPage as component
};
