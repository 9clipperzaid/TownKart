import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star, Clock, Search, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryImage, categoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { CallToOrder } from "@/components/CallToOrder";
import { getHomeBanners } from "@/lib/admin.functions";
import townKartHeroWatermark from "@/assets/townkart-hero-watermark.png";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

type Store = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  rating: number;
  delivery_minutes: number;
  min_order: number;
  delivery_available?: boolean;
  delivery_fee?: number;
  banner_url?: string | null;
  logo_url?: string | null;
  status?: string;
};

type ProductSearchRow = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  unit: string;
  image_url: string | null;
};

type Category = {
  key: string;
  label: string;
  emoji: string | null;
};

type HomeBanner = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  is_enabled: boolean;
  sort_order: number;
};

function HomePage() {
  const queryClient = useQueryClient();
  const loadHomeBanners = useServerFn(getHomeBanners);
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [bannerIndex, setBannerIndex] = useState(0);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });
      if (error) throw error;
      return data as Store[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("key, label, emoji")
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["product-search"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, store_id, name, description, category, price, unit, image_url")
        .eq("is_available", true);
      if (error) throw error;
      return data as ProductSearchRow[];
    },
  });

  const { data: adminBanners = [] } = useQuery({
    queryKey: ["home-banners"],
    queryFn: () => loadHomeBanners(),
  });

  const heroBanners = useMemo<HomeBanner[]>(
    () =>
      adminBanners
        .filter((banner) => banner.is_enabled)
        .sort((a, b) => a.sort_order - b.sort_order),
    [adminBanners],
  );

  // Live updates: when an admin changes stores/products/categories, refresh.
  useEffect(() => {
    const channel = supabase
      .channel("marketplace-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "stores" }, () =>
        queryClient.invalidateQueries({ queryKey: ["stores"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () =>
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () =>
        queryClient.invalidateQueries({ queryKey: ["product-search"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    const channel = supabase
      .channel("home-banners-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "marketplace_settings",
          filter: "key=eq.home_banners",
        },
        () => queryClient.invalidateQueries({ queryKey: ["home-banners"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    if (bannerIndex >= heroBanners.length) setBannerIndex(0);
  }, [bannerIndex, heroBanners.length]);

  useEffect(() => {
    if (heroBanners.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % heroBanners.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [heroBanners.length]);

  const query = q.trim().toLowerCase();
  const matchingProductStoreIds = new Set(
    query
      ? products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              (p.description ?? "").toLowerCase().includes(query) ||
              (p.category ?? "").toLowerCase().includes(query),
          )
          .map((p) => p.store_id)
      : [],
  );

  const filtered = stores.filter((s) => {
    const matchesCat = !active || s.category === active;
    const matchesQ =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      (s.description ?? "").toLowerCase().includes(query) ||
      matchingProductStoreIds.has(s.id);
    return matchesCat && matchesQ;
  });

  return (
    <div>
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-brand-gradient text-primary-foreground shadow-card">
          <div className="relative min-h-[260px] p-5">
            {heroBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  index === bannerIndex ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                {banner.image_url && (
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                )}
              </div>
            ))}
            <div className="relative z-10 flex min-h-[220px] flex-col justify-between">
              {!heroBanners[bannerIndex]?.image_url && (
                <>
                  <img
                    src={townKartHeroWatermark}
                    alt=""
                    className="pointer-events-none absolute -right-10 top-1/2 hidden w-[70%] max-w-4xl -translate-y-1/2 scale-105 opacity-45 mix-blend-soft-light drop-shadow-[0_28px_60px_rgba(0,0,0,0.35)] md:block"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    {/* <p className="text-sm font-semibold opacity-90">TownKart quick commerce</p> */}
                    <p className="mt-2 text-sm font-bold text-white/90">
                      {heroBanners[bannerIndex]?.subtitle ?? "Nehtaur's First Online Kart"}
                    </p>
                    <h1 className="mt-2 max-w-lg text-2xl font-extrabold">
                      {heroBanners[bannerIndex]?.title}
                    </h1>
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {["Fresh fruits", "Daily grocery", "Medicines", "Bakery", "Pet supplies"].map(
                        (offer) => (
                          <span
                            key={offer}
                            className="shrink-0 rounded-full bg-white/18 px-3 py-1.5 text-xs font-bold"
                          >
                            {offer}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </>
              )}
              {heroBanners[bannerIndex]?.image_url && <div />}
              <div>
                <CallToOrder className="mt-4 bg-white text-primary hover:bg-white/90" />
                {heroBanners.length > 1 && (
                  <div className="mt-4 flex gap-1.5">
                    {heroBanners.map((banner, index) => (
                      <button
                        key={banner.id}
                        type="button"
                        aria-label={`Show banner ${index + 1}`}
                        onClick={() => setBannerIndex(index)}
                        className={cn(
                          "h-1.5 rounded-full bg-white/55 transition-all",
                          index === bannerIndex ? "w-6 bg-white" : "w-2.5",
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search TownKart stores & products"
            className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm shadow-card outline-none ring-primary/30 focus:ring-2"
          />
        </div>
      </div>

      <section className="px-4 pt-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Categories</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip label="All" active={!active} onClick={() => setActive(null)} />
          {categories.map((c) => (
            <Chip
              key={c.key}
              label={`${c.emoji ?? ""} ${c.label}`.trim()}
              active={active === c.key}
              onClick={() => setActive(active === c.key ? null : c.key)}
            />
          ))}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Popular products</h2>
          <span className="text-xs font-semibold text-primary">{products.length} items</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {products.slice(0, 12).map((product) => (
            <Link
              key={product.id}
              to="/store/$storeId"
              params={{ storeId: product.store_id }}
              className="rounded-2xl border border-border/70 bg-card p-2.5 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="aspect-square w-full rounded-xl object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-secondary text-2xl font-extrabold text-primary">
                  {categories.find((category) => category.key === product.category)?.emoji ?? "TK"}
                </div>
              )}
              <p className="mt-2 text-[11px] font-medium text-muted-foreground">{product.unit}</p>
              <h3 className="line-clamp-2 min-h-9 text-sm font-semibold leading-snug">
                {product.name}
              </h3>
              <p className="mt-1 text-sm font-extrabold">Rs {Number(product.price).toFixed(0)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pb-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{active ? categoryLabel(active) : "Popular stores"}</h2>
          <span className="text-xs font-semibold text-primary">{filtered.length} available</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No stores found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filtered.map((store) => (
              <Link
                key={store.id}
                to="/store/$storeId"
                params={{ storeId: store.id }}
                className="group overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-pop active:scale-[0.99]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={store.banner_url || store.logo_url || categoryImage(store.category)}
                    alt={store.name}
                    loading="lazy"
                    width={768}
                    height={512}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-xs font-bold text-foreground shadow-card">
                    {store.status === "suspended" ? "Closed" : "Open"}
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-bold">{store.name}</h3>
                    <span className="flex shrink-0 items-center gap-1 rounded-lg bg-success/15 px-1.5 py-0.5 text-xs font-bold text-success">
                      <Star className="h-3 w-3 fill-current" />
                      {Number(store.rating).toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {store.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {store.delivery_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" />
                      {formatDelivery(store.delivery_fee)}
                    </span>
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
                      {categoryLabel(store.category)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDelivery(value?: number) {
  if (!value) return "Free";
  return `Rs ${value}`;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-card"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      {label}
    </button>
  );
}
