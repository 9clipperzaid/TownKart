import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bike, IndianRupee, MapPin, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/delivery")({
  beforeLoad: async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .in("role", ["delivery_partner", "rider", "admin", "super_admin"]);
    if (!data?.length) throw redirect({ to: "/home" });
  },
  component: DeliveryDashboard,
});

function DeliveryDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["delivery-dashboard"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data: partner } = await (supabase as any)
        .from("delivery_partners")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      const { data: orders } = await supabase
        .from("orders")
        .select("id, store_name, status, total, address, created_at")
        .eq("delivery_partner_id", user.id)
        .order("created_at", { ascending: false });
      return { partner, orders: orders ?? [] };
    },
  });

  const delivered = data?.orders.filter((o) => o.status === "delivered").length ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pt-4">
      <div>
        <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Assigned orders, route navigation and earnings.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Bike} label="Assigned" value={data?.orders.length ?? 0} />
        <Stat icon={Navigation} label="Delivered" value={delivered} />
        <Stat
          icon={IndianRupee}
          label="Earnings"
          value={formatINR(Number(data?.partner?.total_earnings ?? 0))}
        />
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="font-bold">Assigned orders</h2>
        <div className="mt-4 space-y-3">
          {isLoading && <div className="h-24 animate-pulse rounded-xl bg-muted" />}
          {data?.orders.map((order) => (
            <div key={order.id} className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.store_name}</p>
                  <p className="text-xs font-medium text-primary">{order.status}</p>
                </div>
                <span className="font-bold">{formatINR(order.total)}</span>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {order.address}
              </p>
              <Button asChild size="sm" className="mt-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation className="h-4 w-4" />
                  Navigate
                </a>
              </Button>
            </div>
          ))}
          {!isLoading && data?.orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No assigned orders yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bike;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
