import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  adminListStores,
  adminListProducts,
  adminListCategories,
  adminBulkPriceUpdate,
  adminUpdatePrice,
} from "@/lib/admin.functions";
import { formatINR, timeAgo } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/pricing")({
  component: PricingPage,
});

type ProductRow = {
  id: string;
  name: string;
  price: number;
  price_updated_at: string;
  stores: { name: string } | null;
};

function PricingPage() {
  const qc = useQueryClient();
  const listStores = useServerFn(adminListStores);
  const listCats = useServerFn(adminListCategories);
  const listProducts = useServerFn(adminListProducts);
  const bulk = useServerFn(adminBulkPriceUpdate);
  const updatePrice = useServerFn(adminUpdatePrice);

  const [scope, setScope] = useState<"all" | "category" | "store">("all");
  const [categoryKey, setCategoryKey] = useState("");
  const [storeId, setStoreId] = useState("");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [percent, setPercent] = useState(5);

  const [editing, setEditing] = useState<Record<string, string>>({});
  const [notify, setNotify] = useState(true);

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: () => listStores() as Promise<{ id: string; name: string }[]>,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCats() as Promise<{ key: string; label: string }[]>,
  });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products", "all"],
    queryFn: () => listProducts({ data: {} }) as Promise<ProductRow[]>,
  });

  const bulkMut = useMutation({
    mutationFn: () =>
      bulk({
        data: {
          scope,
          categoryKey: scope === "category" ? categoryKey : undefined,
          storeId: scope === "store" ? storeId : undefined,
          direction,
          percent: Number(percent),
        },
      }),
    onSuccess: (r) => {
      toast.success(`Updated ${r.updated} product${r.updated === 1 ? "" : "s"}`);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const quickMut = useMutation({
    mutationFn: (v: { productId: string; newPrice: number }) =>
      updatePrice({ data: { ...v, notify, reason: "quick update" } }),
    onSuccess: (_r, v) => {
      toast.success("Price updated");
      setEditing((e) => {
        const next = { ...e };
        delete next[v.productId];
        return next;
      });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const canBulk =
    (scope === "all" ||
      (scope === "category" && categoryKey) ||
      (scope === "store" && storeId)) &&
    percent > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dynamic pricing</h1>
        <p className="text-sm text-muted-foreground">
          Update market prices instantly — changes reflect across the app live.
        </p>
      </div>

      {/* Bulk update */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-bold">
          <Zap className="h-4 w-4 text-primary" /> Bulk price update
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Apply a percentage change across a scope. Every change is recorded in
          price history.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="category">By category</SelectItem>
                <SelectItem value="store">By store</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scope === "category" && (
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryKey} onValueChange={setCategoryKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scope === "store" && (
            <div className="space-y-1.5">
              <Label>Store</Label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Direction</Label>
            <Select
              value={direction}
              onValueChange={(v) => setDirection(v as typeof direction)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Increase</SelectItem>
                <SelectItem value="decrease">Decrease</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Percentage</Label>
            <Input
              type="number"
              value={percent}
              min={0.1}
              step={0.5}
              onChange={(e) => setPercent(Number(e.target.value))}
            />
          </div>
        </div>

        <Button
          className="mt-4"
          disabled={!canBulk || bulkMut.isPending}
          onClick={() => bulkMut.mutate()}
        >
          {direction === "increase" ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {bulkMut.isPending ? "Applying…" : `Apply ${direction} ${percent}%`}
        </Button>
      </div>

      {/* Quick per-product */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 p-5">
          <h2 className="font-bold">Quick price edits</h2>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Notify customers</span>
            <Switch checked={notify} onCheckedChange={setNotify} />
          </label>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {products.map((p) => {
              const value = editing[p.id] ?? String(p.price);
              const changed = Number(value) !== Number(p.price);
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.stores?.name ?? "—"} · updated {timeAgo(p.price_updated_at)}
                    </div>
                  </div>
                  <Input
                    type="number"
                    className="w-28"
                    value={value}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, [p.id]: e.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    disabled={!changed || quickMut.isPending}
                    onClick={() =>
                      quickMut.mutate({
                        productId: p.id,
                        newPrice: Number(value),
                      })
                    }
                  >
                    Save
                  </Button>
                </div>
              );
            })}
            {products.length === 0 && (
              <p className="px-5 py-10 text-center text-muted-foreground">
                No products yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
