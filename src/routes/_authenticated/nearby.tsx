import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Search, Star, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryImage, categoryLabel } from "@/lib/categories";

export const Route = createFileRoute("/_authenticated/nearby")({
  component: StoresPage,
});

type StoreRow = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  rating: number;
  delivery_minutes: number;
  delivery_available: boolean;
  delivery_fee: number | null;
  banner_url: string | null;
  logo_url: string | null;
  status: string;
};

function StoresPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select(
          "id, name, description, category, rating, delivery_minutes, delivery_available, delivery_fee, banner_url, logo_url, status",
        )
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as StoreRow[];
    },
  });

  const categories = useMemo(
    () => Array.from(new Set(stores.map((store) => store.category))).sort(),
    [stores],
  );
  const visibleStores = useMemo(() => {
    const value = query.trim().toLowerCase();
    return stores.filter(
      (store) =>
        (category === "all" || store.category === category) &&
        (!value ||
          store.name.toLowerCase().includes(value) ||
          store.category.toLowerCase().includes(value) ||
          (store.description ?? "").toLowerCase().includes(value)),
    );
  }, [category, query, stores]);

  return (
    <main className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold">All stores</h1>
        <p className="text-sm text-muted-foreground">Browse every active store on TownKart.</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stores"
          className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm shadow-card outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterChip label="All" active={category === "all"} onClick={() => setCategory("all")} />
        {categories.map((value) => (
          <FilterChip
            key={value}
            label={categoryLabel(value)}
            active={category === value}
            onClick={() => setCategory(value)}
          />
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">Stores</h2>
        <span className="text-xs font-semibold text-primary">{visibleStores.length} available</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : visibleStores.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No stores found.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {visibleStores.map((store) => (
            <Link
              key={store.id}
              to="/store/$storeId"
              params={{ storeId: store.id }}
              className="group overflow-hidden rounded-xl bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                <img
                  src={store.banner_url || store.logo_url || categoryImage(store.category)}
                  alt={store.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-xs font-bold shadow-card">
                  {store.status === "suspended" ? "Closed" : "Open"}
                </span>
              </div>
              <div className="p-2.5">
                <div className="flex flex-col gap-1">
                  <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5">
                    {store.name}
                  </h3>
                  <span className="flex shrink-0 items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-xs font-bold text-success">
                    <Star className="h-3 w-3 fill-current" />
                    {Number(store.rating).toFixed(1)}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {store.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {store.delivery_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    {store.delivery_available
                      ? store.delivery_fee
                        ? `₹${store.delivery_fee}`
                        : "Free"
                      : "Pickup"}
                  </span>
                  <span className="rounded-md bg-secondary px-2 py-1 font-medium text-secondary-foreground">
                    {categoryLabel(store.category)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-secondary-foreground"}`}
    >
      {label}
    </button>
  );
}
