import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Store, Package, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/vendor")({
  beforeLoad: async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .in("role", ["vendor", "store_manager", "admin", "super_admin"]);
    if (!data?.length) throw redirect({ to: "/home" });
  },
  component: VendorDashboard,
});

function VendorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-dashboard"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data: stores } = await supabase
        .from("stores")
        .select("id, name, status, rating")
        .eq("owner_id", user.id);
      const storeIds = (stores ?? []).map((s) => s.id);
      const { data: products } = storeIds.length
        ? await supabase.from("products").select("id").in("store_id", storeIds)
        : { data: [] };
      const { data: orders } = storeIds.length
        ? await supabase
            .from("orders")
            .select("id, status, total, store_name, created_at")
            .in("store_id", storeIds)
            .order("created_at", { ascending: false })
            .limit(20)
        : { data: [] };
      return { stores: stores ?? [], products: products ?? [], orders: orders ?? [] };
    },
  });

  const revenue = (data?.orders ?? []).reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your stores, products and active orders.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/home">Storefront</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat icon={Store} label="Stores" value={data?.stores.length ?? 0} />
        <Stat icon={Package} label="Products" value={data?.products.length ?? 0} />
        <Stat icon={ClipboardList} label="Orders" value={data?.orders.length ?? 0} />
        <Stat icon={ClipboardList} label="Revenue" value={formatINR(revenue)} />
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="font-bold">Recent orders</h2>
        <div className="mt-4 space-y-3">
          {isLoading && <div className="h-24 animate-pulse rounded-xl bg-muted" />}
          {(data?.orders ?? []).map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
              <div>
                <p className="font-semibold">{order.store_name}</p>
                <p className="text-xs text-muted-foreground">{order.status}</p>
              </div>
              <span className="font-bold">{formatINR(order.total)}</span>
            </div>
          ))}
          {!isLoading && data?.orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
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
  icon: typeof Store;
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
