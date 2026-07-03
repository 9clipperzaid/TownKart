import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Package, MapPin, Minus, Plus, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cancelMyOrder } from "@/lib/order.functions";
import { formatINR, timeAgo, ORDER_STATUS } from "@/lib/format";
import { cn, userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/orders")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user)
      throw redirect({ to: "/auth/login", search: { redirectTo: "/orders" } });
  },
  pendingMs: 0,
  pendingMinMs: 250,
  pendingComponent: OrdersPageLoading,
  component: OrdersPage,
});

function OrdersPageLoading() {
  return (
    <div className="px-4 pt-4">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="mt-4 space-y-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

type Order = {
  id: string;
  store_name: string;
  status: string;
  total: number;
  address: string;
  created_at: string;
  order_items: {
    id: string;
    product_id: string | null;
    name: string;
    quantity: number;
    unit_price: number;
    products: {
      id: string;
      name: string;
      unit: string;
      price: number;
      discount_price: number | null;
      is_available: boolean;
      store_id: string;
    } | null;
  }[];
};

function OrdersPage() {
  const queryClient = useQueryClient();
  const cancelOrder = useServerFn(cancelMyOrder);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [reorderTarget, setReorderTarget] = useState<Order | null>(null);
  const [reorderItems, setReorderItems] = useState<
    Record<string, { selected: boolean; quantity: number }>
  >({});

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "*, order_items(id, product_id, name, quantity, unit_price, products(id, name, unit, price, discount_price, is_available, store_id))",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelOrder({
        data: {
          orderId: cancelTarget!.id,
          reason: cancelReason.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Order cancelled");
      setCancelTarget(null);
      setCancelReason("");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e) => toast.error(userErrorMessage(e, "Could not cancel order")),
  });

  const openReorder = (order: Order) => {
    setReorderTarget(order);
    setReorderItems(
      Object.fromEntries(
        order.order_items.map((item) => [
          item.id,
          { selected: Boolean(item.products?.is_available), quantity: item.quantity },
        ]),
      ),
    );
  };

  const reorderMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !reorderTarget) throw new Error("Please sign in again.");
      const chosen = reorderTarget.order_items.filter(
        (item) => item.products && reorderItems[item.id]?.selected,
      );
      for (const item of chosen) {
        const product = item.products!;
        const selectedUnit = product.unit || "1 unit";
        const quantity = reorderItems[item.id].quantity;
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
            quantity: Number(existing?.quantity ?? 0) + quantity,
          } as never,
          { onConflict: "user_id,product_id,selected_unit" },
        );
        if (error) throw error;
      }
      return chosen.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} product${count === 1 ? "" : "s"} added to cart`);
      setReorderTarget(null);
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["cart-detail"] });
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not reorder")),
  });

  if (!isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Package className="h-9 w-9 text-primary" />
        </div>
        <h1 className="mt-5 text-xl font-bold">No orders yet</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your past and active orders will appear here.
        </p>
        <Button asChild className="mt-6">
          <Link to="/home">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="text-2xl font-extrabold">Your orders</h1>

      <div className="mt-4 space-y-3">
        {isLoading
          ? [0, 1].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)
          : orders.map((order) => {
              const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.placed;
              const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
              const canCancel = ["pending", "accepted"].includes(order.status);

              return (
                <div key={order.id} className="rounded-2xl bg-card p-4 shadow-card">
                  <Link to="/orders/$orderId" params={{ orderId: order.id }} className="block">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold">{order.store_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(order.created_at)} · {itemCount} item
                          {itemCount > 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                          status.tone === "success" && "bg-success/15 text-success",
                          status.tone === "primary" && "bg-primary/15 text-primary",
                          status.tone === "warning" && "bg-warning/20 text-warning-foreground",
                        )}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                      {order.order_items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                    </p>

                    <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-1">{order.address}</span>
                    </div>
                  </Link>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <div className="flex items-center gap-2">
                      {canCancel && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setCancelTarget(order)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="button" size="sm" onClick={() => openReorder(order)}>
                        <RotateCcw className="h-3.5 w-3.5" /> Reorder
                      </Button>
                      <span className="font-extrabold">{formatINR(order.total)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Tell us why you want to cancel. The product stock will be restored after cancellation.
            </p>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Example: Ordered by mistake"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelTarget(null);
                setCancelReason("");
              }}
            >
              Keep order
            </Button>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending || cancelReason.trim().length < 5}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reorderTarget} onOpenChange={(open) => !open && setReorderTarget(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose products to reorder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Select only the products you want to add to your cart.
          </p>
          <div className="space-y-2">
            {reorderTarget?.order_items.map((item) => {
              const available = Boolean(item.products?.is_available);
              const state = reorderItems[item.id] ?? { selected: false, quantity: item.quantity };
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3",
                    !available && "opacity-55",
                  )}
                >
                  <Checkbox
                    disabled={!available}
                    checked={state.selected}
                    onCheckedChange={(checked) =>
                      setReorderItems((current) => ({
                        ...current,
                        [item.id]: { ...state, selected: checked === true },
                      }))
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {available
                        ? formatINR(
                            Number(
                              item.products?.discount_price ??
                                item.products?.price ??
                                item.unit_price,
                            ),
                          )
                        : "Product unavailable"}
                    </p>
                  </div>
                  <div className="flex items-center rounded-lg border">
                    <button
                      type="button"
                      className="p-2"
                      disabled={!available || state.quantity <= 1}
                      onClick={() =>
                        setReorderItems((current) => ({
                          ...current,
                          [item.id]: { ...state, quantity: Math.max(1, state.quantity - 1) },
                        }))
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">{state.quantity}</span>
                    <button
                      type="button"
                      className="p-2"
                      disabled={!available}
                      onClick={() =>
                        setReorderItems((current) => ({
                          ...current,
                          [item.id]: { ...state, quantity: state.quantity + 1 },
                        }))
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReorderTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={
                reorderMutation.isPending ||
                !Object.values(reorderItems).some((item) => item.selected)
              }
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
