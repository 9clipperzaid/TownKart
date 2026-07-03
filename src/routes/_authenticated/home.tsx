import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Search, Plus, Minus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { getLocalCart, getUnitOptions, updateLocalCartItem } from "@/lib/local-cart";
import { cn, userErrorMessage } from "@/lib/utils";
import { CallToOrder } from "@/components/CallToOrder";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCategorySections, getHomeBanners } from "@/lib/admin.functions";
import townKartHeroWatermark from "@/assets/townkart-hero-watermark.png";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

type ProductSearchRow = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  discount_price: number | null;
  unit: string;
  image_url: string | null;
  is_available: boolean;
  is_popular: boolean;
  popular_sort_order: number;
  has_unit_options: boolean;
  unit_options: { label: string; unitPrice: number }[] | null;
  stores: { name: string } | null;
};

type ProductSection = {
  id: string;
  title: string;
  display_order: number;
  layout_mode: "horizontal" | "grid_1x4" | "grid_2x4";
  product_section_items: {
    id: string;
    display_order: number;
    products: ProductSearchRow | null;
  }[];
};

type Category = {
  id: string;
  key: string;
  label: string;
  emoji: string | null;
  image_url: string | null;
};

type Subcategory = {
  id: string;
  category_id: string;
  key: string;
  label: string;
  image_url: string | null;
};

type CategorySection = {
  id: string;
  title: string;
  display_order: number;
  rows: 1 | 2;
  subcategory_section_items: { subcategory_id: string; display_order: number }[];
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
  const loadCategorySections = useServerFn(getCategorySections);
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [detailProduct, setDetailProduct] = useState<ProductSearchRow | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const bannerPointerRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const bannerDraggedRef = useRef(false);

  const { data: productSections = [], isLoading } = useQuery({
    queryKey: ["home-product-sections"],
    queryFn: async () => {
      const db = supabase as any;
      const { data, error } = await db
        .from("product_sections")
        .select(
          "id, title, display_order, layout_mode, product_section_items(id, display_order, products(*, stores(name)))",
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("display_order", { referencedTable: "product_section_items", ascending: true });
      if (error?.code === "42703") {
        const legacy = await db
          .from("product_sections")
          .select(
            "id, title, display_order, product_section_items(id, display_order, products(*, stores(name)))",
          )
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .order("display_order", { referencedTable: "product_section_items", ascending: true });
        if (legacy.error) throw legacy.error;
        return (legacy.data ?? []).map((section: Omit<ProductSection, "layout_mode">) => ({
          ...section,
          layout_mode: "horizontal" as const,
        }));
      }
      if (error) throw error;
      return data as ProductSection[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, key, label, emoji, image_url")
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: subcategories = [] } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const db = supabase as any;
      const { data, error } = await db
        .from("subcategories")
        .select("id, category_id, key, label, image_url")
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true });
      if (error?.code === "42P01") return [];
      if (error) throw error;
      return data as Subcategory[];
    },
  });

  const { data: cart = {} } = useQuery({
    queryKey: ["home-cart-map"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const map: Record<string, number> = {};
        Object.values(getLocalCart()).forEach((item) => {
          map[`${item.productId}::${item.selectedUnit}`] = item.quantity;
        });
        return map;
      }
      const { data } = await supabase
        .from("cart_items")
        .select("product_id, quantity, selected_unit");
      const map: Record<string, number> = {};
      (data ?? []).forEach((r) => (map[`${r.product_id}::${r.selected_unit || ""}`] = r.quantity));
      return map;
    },
  });

  const { data: adminBanners = [] } = useQuery({
    queryKey: ["home-banners"],
    queryFn: () => loadHomeBanners(),
  });

  const { data: categorySections = [] } = useQuery({
    queryKey: ["home-category-sections"],
    queryFn: () => loadCategorySections() as Promise<CategorySection[]>,
  });

  const heroBanners = useMemo<HomeBanner[]>(
    () =>
      adminBanners
        .filter((banner) => banner.is_enabled)
        .sort((a, b) => a.sort_order - b.sort_order),
    [adminBanners],
  );

  // Live updates: reflect admin section and product changes without a refresh.
  useEffect(() => {
    const channel = supabase
      .channel("marketplace-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () =>
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () =>
        queryClient.invalidateQueries({ queryKey: ["home-product-sections"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "product_sections" }, () =>
        queryClient.invalidateQueries({ queryKey: ["home-product-sections"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_section_items" },
        () => queryClient.invalidateQueries({ queryKey: ["home-product-sections"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: ["home-cart-map"] });
    window.addEventListener("townkart-local-cart", refresh);
    return () => window.removeEventListener("townkart-local-cart", refresh);
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
  const cartTotal = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const visibleSections = productSections
    .map((section) => ({
      ...section,
      products: section.product_section_items
        .map((item) => item.products)
        .filter((product): product is ProductSearchRow => Boolean(product?.is_available))
        .filter((product) => !active || product.category === active)
        .filter(
          (product) =>
            !query ||
            product.name.toLowerCase().includes(query) ||
            (product.description ?? "").toLowerCase().includes(query) ||
            (product.stores?.name ?? "").toLowerCase().includes(query),
        ),
    }))
    .filter((section) => section.products.length > 0 || (!query && !active));

  const setQty = useMutation({
    mutationFn: async ({
      product,
      selectedUnit,
      unitPrice,
      quantity,
    }: {
      product: ProductSearchRow;
      selectedUnit: string;
      unitPrice: number;
      quantity: number;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        updateLocalCartItem(
          {
            productId: product.id,
            name: product.name,
            unit: product.unit,
            selectedUnit,
            unitPrice,
            storeId: product.store_id,
            storeName: product.stores?.name ?? "TownKart store",
            imageUrl: product.image_url,
          },
          quantity,
        );
        return;
      }
      if (quantity <= 0) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("product_id", product.id)
          .eq("user_id", user.id)
          .eq("selected_unit", selectedUnit);
      } else {
        await supabase.from("cart_items").upsert(
          {
            user_id: user.id,
            product_id: product.id,
            quantity,
            selected_unit: selectedUnit,
            unit_price: unitPrice,
          } as never,
          { onConflict: "user_id,product_id,selected_unit" },
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-cart-map"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
    onError: (e) => toast.error(userErrorMessage(e, "Could not update cart")),
  });

  const addProductToCart = (product: ProductSearchRow) => {
    const option = getUnitOptions(product)[0];
    const selectedUnit = option?.label ?? product.unit;
    const unitPrice = Number(option?.unitPrice ?? product.price);
    const quantity = cart[`${product.id}::${selectedUnit}`] ?? 0;
    setQty.mutate({ product, selectedUnit, unitPrice, quantity: quantity + 1 });
  };

  const moveBanner = (direction: 1 | -1) => {
    if (heroBanners.length < 2) return;
    setBannerIndex((current) => (current + direction + heroBanners.length) % heroBanners.length);
  };

  return (
    <div className="flex flex-col">
      <section className="px-4 pt-4">
        <div
          className="relative cursor-grab touch-pan-y select-none overflow-hidden rounded-2xl bg-brand-gradient text-primary-foreground shadow-card active:cursor-grabbing"
          onPointerDown={(event) => {
            bannerPointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
            bannerDraggedRef.current = false;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const start = bannerPointerRef.current;
            if (!start || start.id !== event.pointerId) return;
            if (Math.abs(event.clientX - start.x) > 10) bannerDraggedRef.current = true;
          }}
          onPointerUp={(event) => {
            const start = bannerPointerRef.current;
            bannerPointerRef.current = null;
            if (!start || start.id !== event.pointerId) return;
            const deltaX = event.clientX - start.x;
            const deltaY = event.clientY - start.y;
            if (Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
              moveBanner(deltaX < 0 ? 1 : -1);
            }
          }}
          onPointerCancel={() => {
            bannerPointerRef.current = null;
            bannerDraggedRef.current = false;
          }}
          onClickCapture={(event) => {
            if (bannerDraggedRef.current) {
              event.preventDefault();
              event.stopPropagation();
              bannerDraggedRef.current = false;
            }
          }}
        >
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
            placeholder="Search products and stores"
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

      {categorySections.map((section) => {
        const tiles = [...section.subcategory_section_items]
          .sort((a, b) => a.display_order - b.display_order)
          .map((item) =>
            subcategories.find((subcategory) => subcategory.id === item.subcategory_id),
          )
          .filter((subcategory): subcategory is Subcategory => Boolean(subcategory))
          .slice(0, section.rows * 4);
        if (!tiles.length) return null;
        return (
          <section key={section.id} className="order-2 px-4 pb-4 pt-6">
            <h2 className="mb-3 text-lg font-bold">{section.title}</h2>
            <div className="grid grid-cols-4 gap-x-2.5 gap-y-5">
              {tiles.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  to="/category/$categoryKey"
                  params={{ categoryKey: subcategory.key }}
                  className="min-w-0 text-center"
                >
                  <div className="aspect-square overflow-hidden rounded-2xl bg-secondary/70">
                    {subcategory.image_url ? (
                      <img
                        src={subcategory.image_url}
                        alt={subcategory.label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl sm:text-5xl">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-bold leading-tight sm:text-sm">
                    {subcategory.label}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {isLoading ? (
        <div className="mx-4 mt-6 h-56 animate-pulse rounded-2xl bg-muted" />
      ) : visibleSections.length === 0 ? (
        <p className="mx-4 my-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No matching products found.
        </p>
      ) : (
        visibleSections.map((section) => (
          <section key={section.id} className="order-1 px-4 pb-4 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <Link
                to="/product-sections/$sectionId"
                params={{ sectionId: section.id }}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View all products
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {section.products.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No products assigned to this section yet.
              </p>
            ) : (
              <div
                className={cn(
                  "gap-2.5 pb-3",
                  section.layout_mode === "grid_1x4" || section.layout_mode === "grid_2x4"
                    ? "grid grid-cols-4 overflow-visible"
                    : "flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scroll-behavior:smooth] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                )}
              >
                {section.products
                  .slice(
                    0,
                    section.layout_mode === "grid_1x4"
                      ? 4
                      : section.layout_mode === "grid_2x4"
                        ? 8
                        : undefined,
                  )
                  .map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setDetailProduct(product)}
                      className={cn(
                        "min-w-0 rounded-xl border border-border/70 bg-card p-1.5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-pop sm:p-2",
                        section.layout_mode === "horizontal" && "w-36 shrink-0 snap-start sm:w-40",
                      )}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="aspect-square w-full rounded-lg object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-secondary text-xl font-extrabold text-primary">
                          {categories.find((category) => category.key === product.category)
                            ?.emoji ?? "TK"}
                        </div>
                      )}
                      <p className="mt-1.5 text-[10px] font-medium text-muted-foreground">
                        {product.unit}
                      </p>
                      <h3 className="line-clamp-2 min-h-8 text-xs font-semibold leading-tight">
                        {product.name}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                        {product.stores?.name ?? "TownKart store"}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <p className="text-xs font-extrabold">{formatINR(Number(product.price))}</p>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            addProductToCart(product);
                          }}
                          className="rounded-md border border-primary px-2 py-1 text-[10px] font-extrabold text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          {(cart[
                            `${product.id}::${getUnitOptions(product)[0]?.label ?? product.unit}`
                          ] ?? 0) > 0
                            ? `Add +`
                            : "Add"}
                        </button>
                      </div>
                    </div>
                  ))}
                {section.layout_mode === "horizontal" && (
                  <Link
                    to="/product-sections/$sectionId"
                    params={{ sectionId: section.id }}
                    className="flex min-h-56 w-36 shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-center text-primary shadow-card transition hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-pop sm:w-40"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold">View all products</span>
                  </Link>
                )}
              </div>
            )}
          </section>
        ))
      )}

      {cartTotal > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-md px-4 lg:bottom-6 lg:max-w-md">
          <Button asChild size="lg" className="h-13 w-full justify-between text-base shadow-pop">
            <Link to="/cart">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {cartTotal} item{cartTotal === 1 ? "" : "s"} in cart
              </span>
              <span>View cart →</span>
            </Link>
          </Button>
        </div>
      )}

      <Dialog open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          {detailProduct &&
            (() => {
              const options = getUnitOptions(detailProduct);
              const selectedUnit = selectedUnits[detailProduct.id] ?? options[0]?.label ?? "";
              const selectedOption =
                options.find((option) => option.label === selectedUnit) ?? options[0];
              const unitPrice = Number(selectedOption?.unitPrice ?? detailProduct.price);
              const qty = cart[`${detailProduct.id}::${selectedUnit}`] ?? 0;
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{detailProduct.name}</DialogTitle>
                  </DialogHeader>

                  {detailProduct.image_url ? (
                    <img
                      src={detailProduct.image_url}
                      alt={detailProduct.name}
                      className="aspect-video w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-secondary text-5xl font-extrabold text-primary">
                      {categories.find((category) => category.key === detailProduct.category)
                        ?.emoji ?? "TK"}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {detailProduct.stores?.name ?? "TownKart store"}
                      </p>
                      <p className="mt-1 text-2xl font-extrabold">{formatINR(unitPrice)}</p>
                    </div>

                    {options.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-sm font-bold">Select unit</p>
                        <div className="grid grid-cols-2 gap-2">
                          {options.map((option) => (
                            <button
                              key={option.label}
                              type="button"
                              onClick={() =>
                                setSelectedUnits((current) => ({
                                  ...current,
                                  [detailProduct.id]: option.label,
                                }))
                              }
                              className={cn(
                                "rounded-xl border px-3 py-2 text-left text-sm transition",
                                option.label === selectedUnit
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-background",
                              )}
                            >
                              <span className="block font-bold">{option.label}</span>
                              <span>{formatINR(Number(option.unitPrice))}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                      {detailProduct.description || "No description added yet."}
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      {qty === 0 ? (
                        <Button
                          className="flex-1"
                          onClick={() =>
                            setQty.mutate({
                              product: detailProduct,
                              selectedUnit,
                              unitPrice,
                              quantity: 1,
                            })
                          }
                        >
                          Add to cart
                        </Button>
                      ) : (
                        <div className="flex flex-1 items-center justify-between rounded-xl bg-primary px-2 py-1 text-primary-foreground">
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center"
                            onClick={() =>
                              setQty.mutate({
                                product: detailProduct,
                                selectedUnit,
                                unitPrice,
                                quantity: qty - 1,
                              })
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-extrabold">{qty} in cart</span>
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center"
                            onClick={() =>
                              setQty.mutate({
                                product: detailProduct,
                                selectedUnit,
                                unitPrice,
                                quantity: qty + 1,
                              })
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <Button asChild variant="outline" className="flex-1">
                        <Link to="/store/$storeId" params={{ storeId: detailProduct.store_id }}>
                          View store
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
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
