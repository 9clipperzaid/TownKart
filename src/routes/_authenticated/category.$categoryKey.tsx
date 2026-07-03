import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/category/$categoryKey")({
  component: CategoryProductsPage,
});
type Product = {
  id: string;
  store_id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  category: string | null;
  stores: { name: string; category: string } | null;
};
function CategoryProductsPage() {
  const { categoryKey } = Route.useParams();
  const [q, setQ] = useState("");
  const { data: category } = useQuery({
    queryKey: ["category", categoryKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("label,emoji")
        .eq("key", categoryKey)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["category-products", categoryKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,store_id,name,price,unit,image_url,category,stores(name,category)")
        .eq("is_available", true);
      if (error) throw error;
      return (data as Product[]).filter(
        (p) =>
          p.category?.toLowerCase() === categoryKey.toLowerCase() ||
          p.stores?.category?.toLowerCase() === categoryKey.toLowerCase(),
      );
    },
  });
  const visible = useMemo(
    () =>
      products.filter(
        (p) =>
          !q.trim() ||
          p.name.toLowerCase().includes(q.trim().toLowerCase()) ||
          (p.stores?.name ?? "").toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [products, q],
  );
  return (
    <main className="px-4 py-5">
      <div className="mb-5 flex items-center gap-3">
        <Link
          to="/home"
          aria-label="Back to home"
          className="flex h-10 w-10 items-center justify-center rounded-full border bg-card shadow-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold">
            {category?.emoji} {category?.label ?? categoryKey}
          </h1>
          <p className="text-sm text-muted-foreground">Products from this category.</p>
        </div>
      </div>
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search in this category"
          className="h-12 w-full rounded-2xl border bg-card pl-10 pr-4 shadow-card outline-none"
        />
      </div>
      <div className="mb-3 flex justify-between">
        <h2 className="font-bold">Products</h2>
        <span className="text-xs font-semibold text-primary">{visible.length} items</span>
      </div>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No products found in this category.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {visible.map((p) => (
            <Link
              key={p.id}
              to="/store/$storeId"
              params={{ storeId: p.store_id }}
              className="rounded-xl border bg-card p-2 shadow-card"
            >
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg bg-secondary font-bold text-primary">
                  TK
                </div>
              )}
              <p className="mt-1 text-[10px] text-muted-foreground">{p.unit}</p>
              <h3 className="line-clamp-2 min-h-8 text-xs font-semibold">{p.name}</h3>
              <p className="truncate text-[10px] text-muted-foreground">{p.stores?.name}</p>
              <p className="text-xs font-extrabold">{formatINR(Number(p.price))}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
