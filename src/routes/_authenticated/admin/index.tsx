import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Store, Tags, Package, Users, IndianRupee, TrendingUp, ShoppingBag } from "lucide-react";
import { adminDashboard } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const fetchDashboard = useServerFn(adminDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchDashboard(),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const { totals, salesByDay, topProducts, popularCategories, topStores, recentPriceChanges } =
    data;
  const maxSale = Math.max(1, ...salesByDay.map((d) => d.total));

  const cards = [
    { label: "Total Stores", value: totals.stores, icon: Store },
    { label: "Total Categories", value: totals.categories, icon: Tags },
    { label: "Total Products", value: totals.products, icon: Package },
    { label: "Total Users", value: totals.users, icon: Users },
    { label: "Total Orders", value: totals.orders, icon: ShoppingBag },
    { label: "Pending Orders", value: totals.pendingOrders, icon: ShoppingBag },
    { label: "Delivered Orders", value: totals.deliveredOrders, icon: ShoppingBag },
    { label: "Revenue Today", value: formatINR(totals.revenueToday), icon: IndianRupee },
    { label: "Revenue This Month", value: formatINR(totals.revenueThisMonth), icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Marketplace overview and live performance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-2xl border border-border/60 bg-card p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold">{c.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="font-bold">Sales — last 14 days</h2>
          <div className="mt-5 flex h-44 items-end gap-1.5">
            {salesByDay.map((d) => (
              <div
                key={d.date}
                className="group flex flex-1 flex-col items-center justify-end gap-1"
                title={`${d.date}: ${formatINR(d.total)} (${d.orders} orders)`}
              >
                <div
                  className="w-full rounded-t bg-primary/80 transition-all group-hover:bg-primary"
                  style={{ height: `${(d.total / maxSale) * 100}%`, minHeight: 2 }}
                />
                <span className="text-[9px] text-muted-foreground">{d.date.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-bold">Popular categories</h2>
          <ul className="mt-4 space-y-3">
            {popularCategories.length === 0 && (
              <li className="text-sm text-muted-foreground">No data yet.</li>
            )}
            {popularCategories.map((c) => (
              <li key={c.category} className="flex items-center justify-between text-sm">
                <span className="font-medium">{categoryLabel(c.category)}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">
                  {c.count} {c.count === 1 ? "store" : "stores"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-bold">Most popular products</h2>
          <ul className="mt-4 space-y-3">
            {topProducts.length === 0 && (
              <li className="text-sm text-muted-foreground">No orders yet.</li>
            )}
            {topProducts.map((p) => (
              <li key={p.name} className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{p.name}</span>
                <span className="ml-3 shrink-0 text-muted-foreground">
                  {p.qty} sold · {formatINR(p.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-bold">Top performing stores</h2>
          <ul className="mt-4 space-y-3">
            {topStores.length === 0 && (
              <li className="text-sm text-muted-foreground">No orders yet.</li>
            )}
            {topStores.map((store) => (
              <li key={store.store} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{store.store}</span>
                <span className="shrink-0 text-muted-foreground">
                  {store.orders} orders - {formatINR(store.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-bold">Recent price changes</h2>
          <ul className="mt-4 space-y-3">
            {recentPriceChanges.length === 0 && (
              <li className="text-sm text-muted-foreground">No changes yet.</li>
            )}
            {recentPriceChanges.slice(0, 8).map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
                <span className="font-medium">
                  {c.old_price != null ? formatINR(Number(c.old_price)) : "—"} →{" "}
                  {formatINR(Number(c.new_price))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
