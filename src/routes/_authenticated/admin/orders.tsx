import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  MapPin,
  Navigation,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { adminGetOrderDetail, adminListOrdersReport } from "@/lib/admin.functions";
import { updateOrderStatus } from "@/lib/order.functions";
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : undefined,
  }),
  component: AdminOrdersPage,
});

const STATUSES = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "accepted", label: "Accepted", icon: PackageCheck },
  { key: "preparing", label: "Preparing", icon: PackageCheck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  { key: "cancelled", label: "Cancelled", icon: XCircle },
] as const;

type Status = (typeof STATUSES)[number]["key"];

type OrderDetail = OrderRow & {
  delivery_partner_id?: string | null;
  status_history?: { status: string; created_at: string; notes?: string | null }[];
};

type OrderRow = {
  id: string;
  store_name: string;
  status: Status;
  total: number;
  subtotal: number;
  delivery_fee: number;
  address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_location_accuracy?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  payment_reference?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  tracking_code: string | null;
  customer_id?: string;
  profiles?: { full_name: string | null; phone: string | null; email: string | null } | null;
  order_items: { name: string; quantity: number; unit_price: number }[];
};

function AdminOrdersPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const list = useServerFn(adminListOrdersReport);
  const updateStatus = useServerFn(updateOrderStatus);
  const getDetail = useServerFn(adminGetOrderDetail);
  const [q, setQ] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.orderId ?? null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["operational-orders", fromDate, toDate],
    queryFn: () =>
      list({ data: { from: fromDate || undefined, to: toDate || undefined } }) as Promise<
        OrderRow[]
      >,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (searchParams.orderId) setSelectedId(searchParams.orderId);
  }, [searchParams.orderId]);

  const { data: selectedOrder } = useQuery({
    queryKey: ["admin-order-detail", selectedId],
    queryFn: () => getDetail({ data: { orderId: selectedId! } }) as Promise<OrderDetail>,
    enabled: !!selectedId,
  });

  const mut = useMutation({
    mutationFn: (input: { orderId: string; status: Status; notes?: string }) =>
      updateStatus({ data: input }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["operational-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const filteredOrders = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((o) => {
      const haystack = [
        o.id,
        o.tracking_code,
        o.store_name,
        o.address,
        o.profiles?.full_name,
        o.profiles?.phone,
        o.profiles?.email,
        ...(o.order_items ?? []).map((item) => item.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [orders, q]);

  const grouped = STATUSES.map((status) => ({
    ...status,
    orders: filteredOrders.filter((o) => o.status === status.key),
  }));

  const rangeRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const deliveredRevenue = filteredOrders
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + Number(order.total), 0);

  function setMonth(offset: number) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    const localDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    setFromDate(localDate(start));
    setToDate(localDate(end));
  }

  function exportCsv() {
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = filteredOrders.map((order) => [
      order.tracking_code ?? order.id,
      new Date(order.created_at).toLocaleString("en-IN"),
      order.profiles?.full_name ?? "Customer",
      order.profiles?.phone ?? "",
      order.profiles?.email ?? "",
      order.store_name,
      order.status,
      order.payment_method ?? "",
      order.payment_status ?? "",
      order.order_items.map((item) => `${item.quantity}x ${item.name}`).join("; "),
      order.address,
      order.total,
    ]);
    const header = [
      "Order ID",
      "Date",
      "Customer",
      "Phone",
      "Email",
      "Store",
      "Status",
      "Payment Method",
      "Payment Status",
      "Items",
      "Address",
      "Total",
    ];
    const csv = [header, ...rows].map((row) => row.map(quote).join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    link.download = `townkart-orders-${fromDate || "all"}-to-${toDate || "today"}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Live fulfillment board for order acceptance, preparation, delivery and cancellation.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
          >
            All time
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(0)}>
            This month
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(-1)}>
            Previous month
          </Button>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            From
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            To
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9"
            />
          </label>
          <Button size="sm" onClick={exportCsv} disabled={!filteredOrders.length}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Orders in range</p>
            <p className="text-xl font-bold">{filteredOrders.length}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Order value</p>
            <p className="text-xl font-bold">{formatINR(rangeRevenue)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Delivered revenue</p>
            <p className="text-xl font-bold">{formatINR(deliveredRevenue)}</p>
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order, customer, phone or address"
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
          {grouped.map((group) => {
            const Icon = group.icon;
            return (
              <section
                key={group.key}
                className="min-h-64 rounded-2xl border border-border/60 bg-card p-3 shadow-card"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold">
                    <Icon className="h-4 w-4 text-primary" />
                    {group.label}
                  </h2>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold">
                    {group.orders.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {group.orders.map((order) => (
                    <article
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      className="cursor-pointer rounded-xl border border-border/50 bg-background p-3 transition hover:-translate-y-0.5 hover:shadow-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold">{order.store_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {order.tracking_code ?? order.id.slice(0, 8)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-extrabold">
                          {formatINR(order.total)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {order.order_items
                          ?.map((item) => `${item.quantity}x ${item.name}`)
                          .join(", ")}
                      </p>
                      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                        {order.address}
                      </p>
                      {order.delivery_latitude != null && order.delivery_longitude != null && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
                          <MapPin className="h-3 w-3" />
                          Pin selected
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(status) =>
                            mut.mutate({ orderId: order.id, status: status as Status })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s.key} value={s.key}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => mut.mutate({ orderId: order.id, status: "accepted" })}
                          >
                            Accept
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(order.id);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </div>
                    </article>
                  ))}
                  {group.orders.length === 0 && (
                    <p className="rounded-xl bg-muted/50 px-3 py-8 text-center text-xs text-muted-foreground">
                      No orders
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setNotes("");
            navigate({ to: "/admin/orders", search: { orderId: undefined } });
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {!selectedOrder ? (
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 rounded-xl bg-secondary p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-extrabold">
                    {selectedOrder.tracking_code ?? selectedOrder.id}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {String(selectedOrder.status).replaceAll("_", " ")}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Customer" value={selectedOrder.profiles?.full_name ?? "Customer"} />
                <Detail label="Phone" value={selectedOrder.profiles?.phone ?? "Not available"} />
                <Detail label="Full Address" value={selectedOrder.address} />
                {selectedOrder.delivery_latitude != null &&
                  selectedOrder.delivery_longitude != null && (
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Map Location</p>
                      <p className="mt-1 text-sm font-semibold">
                        {Number(selectedOrder.delivery_latitude).toFixed(6)},{" "}
                        {Number(selectedOrder.delivery_longitude).toFixed(6)}
                      </p>
                      {selectedOrder.delivery_location_accuracy != null && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Accuracy about{" "}
                          {Math.round(Number(selectedOrder.delivery_location_accuracy))}m
                        </p>
                      )}
                      <Button asChild size="sm" variant="outline" className="mt-3 h-8">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.delivery_latitude},${selectedOrder.delivery_longitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          Open map
                        </a>
                      </Button>
                    </div>
                  )}
                <Detail label="Store" value={selectedOrder.store_name} />
                <Detail
                  label="Payment Details"
                  value={`${selectedOrder.payment_method ?? "Cash on delivery"} - ${
                    selectedOrder.payment_status ?? "pending"
                  }`}
                />
                <Detail
                  label="Payment Reference"
                  value={selectedOrder.payment_reference ?? "Not provided"}
                />
                <Detail
                  label="Delivery Partner"
                  value={selectedOrder.delivery_partner_id ?? "Not assigned"}
                />
                {selectedOrder.cancellation_reason && (
                  <Detail label="Cancellation Reason" value={selectedOrder.cancellation_reason} />
                )}
              </div>

              <div className="rounded-xl border border-border/60 p-4">
                <h3 className="font-bold">Ordered Products</h3>
                <div className="mt-3 space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.name} className="flex justify-between gap-3 text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold">
                        {formatINR(Number(item.quantity) * Number(item.unit_price))}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Products subtotal</span>
                    <span className="font-semibold">
                      {formatINR(Number(selectedOrder.subtotal))}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Delivery fee</span>
                    <span className="font-semibold">
                      {formatINR(Number(selectedOrder.delivery_fee))}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-border pt-2 text-base font-extrabold">
                    <span>Total</span>
                    <span>{formatINR(Number(selectedOrder.total))}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 p-4">
                <h3 className="font-bold">Status History</h3>
                <div className="mt-3 space-y-2">
                  {(selectedOrder.status_history?.length
                    ? selectedOrder.status_history
                    : [{ status: selectedOrder.status, created_at: selectedOrder.created_at }]
                  ).map((h, index: number) => (
                    <div key={`${h.status}-${index}`} className="text-sm">
                      <span className="font-semibold">{String(h.status).replaceAll("_", " ")}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                      {h.notes && <p className="text-xs text-muted-foreground">{h.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for this status update"
                />
                <Select
                  value={selectedOrder.status}
                  onValueChange={(status) =>
                    mut.mutate({
                      orderId: selectedOrder.id,
                      status: status as Status,
                      notes: notes.trim() || undefined,
                    })
                  }
                >
                  <SelectTrigger className="sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
