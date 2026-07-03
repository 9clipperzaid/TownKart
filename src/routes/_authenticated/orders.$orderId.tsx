import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  PackageCheck,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getMyOrderDetail } from "@/lib/order.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth/login", search: { redirectTo: "/orders" } });
  },
  component: OrderDetailPage,
});

const STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "accepted", label: "Accepted", icon: PackageCheck },
  { key: "preparing", label: "Preparing", icon: PackageCheck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const getDetail = useServerFn(getMyOrderDetail);
  const queryClient = useQueryClient();
  const [reorderOpen, setReorderOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { data: order, isLoading } = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => getDetail({ data: { orderId } }) as Promise<any>,
  });

  useEffect(() => {
    if (!order?.order_items) return;
    setSelected(
      Object.fromEntries(
        order.order_items.map((item: any) => [item.id, Boolean(item.products?.is_available)]),
      ),
    );
  }, [order]);

  const reorderMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");
      const chosen = (order.order_items ?? []).filter(
        (item: any) => selected[item.id] && item.products?.is_available,
      );
      for (const item of chosen) {
        const product = item.products;
        const selectedUnit = product.unit || "1 unit";
        const { data: existing } = await supabase
          .from("cart_items")
          .select("quantity")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .eq("selected_unit", selectedUnit)
          .maybeSingle();
        const { error } = await supabase.from("cart_items").upsert(
          {
            user_id: user.id,
            product_id: product.id,
            selected_unit: selectedUnit,
            unit_price: Number(product.discount_price ?? product.price),
            quantity: Number(existing?.quantity ?? 0) + Number(item.quantity),
          } as never,
          { onConflict: "user_id,product_id,selected_unit" },
        );
        if (error) throw error;
      }
      return chosen.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} product${count === 1 ? "" : "s"} added to cart`);
      setReorderOpen(false);
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not reorder")),
  });

  if (isLoading) {
    return <div className="mx-4 mt-4 h-96 animate-pulse rounded-2xl bg-muted" />;
  }

  if (!order) {
    return (
      <div className="px-4 pt-6">
        <Button asChild variant="outline">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4" />
            Orders
          </Link>
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  const status = String(order.status);
  const activeIndex =
    status === "cancelled"
      ? -1
      : Math.max(
          0,
          STEPS.findIndex((s) => s.key === status),
        );

  return (
    <div className="space-y-5 px-4 pt-4">
      <Button asChild variant="outline" size="sm">
        <Link to="/orders">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <Button size="sm" onClick={() => setReorderOpen(true)}>
        <RotateCcw className="h-4 w-4" />
        Reorder
      </Button>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Order ID</p>
            <h1 className="mt-1 text-lg font-extrabold">{order.tracking_code ?? order.id}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {status.replaceAll("_", " ")}
          </span>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <h2 className="font-bold">Order Timeline</h2>
        {status === "cancelled" ? (
          <div className="mt-4 flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">Cancelled</span>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const done = index <= activeIndex;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className={done ? "font-semibold" : "text-muted-foreground"}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <h2 className="font-bold">Items</h2>
        <div className="mt-3 space-y-2">
          {order.order_items?.map((item: any) => (
            <div key={item.name} className="flex justify-between gap-3 text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="font-semibold">
                {formatINR(Number(item.unit_price) * Number(item.quantity))}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <InfoCard title="Delivery Address" value={order.address} />
        <InfoCard title="Store" value={order.store_name} />
        <InfoCard title="Customer" value={order.profiles?.full_name ?? "Customer"} />
        <InfoCard title="Phone" value={order.profiles?.phone ?? "Not available"} />
        <InfoCard title="Payment Method" value={order.payment_method ?? "Cash on delivery"} />
        <InfoCard title="Total Amount" value={formatINR(Number(order.total))} />
      </section>

      <Dialog open={reorderOpen} onOpenChange={setReorderOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose products to reorder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Select the products you want to add to cart.
          </p>
          <div className="space-y-2">
            {order.order_items?.map((item: any) => {
              const available = Boolean(item.products?.is_available);
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${available ? "" : "opacity-55"}`}
                >
                  <Checkbox
                    disabled={!available}
                    checked={Boolean(selected[item.id])}
                    onCheckedChange={(checked) =>
                      setSelected((current) => ({ ...current, [item.id]: checked === true }))
                    }
                  />
                  <span className="flex-1 text-sm font-semibold">
                    {item.quantity}× {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {available ? "Available" : "Unavailable"}
                  </span>
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReorderOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={reorderMutation.isPending || !Object.values(selected).some(Boolean)}
              onClick={() => reorderMutation.mutate()}
            >
              {reorderMutation.isPending ? "Adding..." : "Add selected to cart"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
