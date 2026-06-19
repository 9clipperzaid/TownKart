import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Package, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cancelMyOrder } from "@/lib/order.functions";
import { formatINR, timeAgo, ORDER_STATUS } from "@/lib/format";
import { cn, userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersPage,
});

type Order = {
  id: string;
  store_name: string;
  status: string;
  total: number;
  address: string;
  created_at: string;
  order_items: { name: string; quantity: number }[];
};

function OrdersPage() {
  const queryClient = useQueryClient();
  const cancelOrder = useServerFn(cancelMyOrder);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(name, quantity)")
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
                      {order.order_items
                        .map((item) => `${item.quantity}x ${item.name}`)
                        .join(", ")}
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
    </div>
  );
}
