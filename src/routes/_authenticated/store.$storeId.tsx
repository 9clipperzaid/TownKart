import { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingCart, Search, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryImage, categoryLabel, CATEGORIES } from "@/lib/categories";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, userErrorMessage } from "@/lib/utils";
import { CallToOrder } from "@/components/CallToOrder";
import { getLocalCart, getUnitOptions, updateLocalCartItem } from "@/lib/local-cart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/store/$storeId")({
  component: StorePage,
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  unit: string;
  has_unit_options: boolean;
  unit_options:
    | { label: string; unitPrice: number; imageUrl?: string | null; description?: string | null }[]
    | null;
  is_available: boolean;
};

const TILE_GRADIENTS = [
  "from-primary/20 to-primary/5",
  "from-success/20 to-success/5",
  "from-secondary/40 to-secondary/10",
  "from-accent/30 to-accent/5",
];

function StorePage() {
  const { storeId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const { data: store } = useQuery({
    queryKey: ["store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at");
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: cart = {} } = useQuery({
    queryKey: ["cart-map"],
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

  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: ["cart-map"] });
    window.addEventListener("townkart-local-cart", refresh);
    return () => window.removeEventListener("townkart-local-cart", refresh);
  }, [queryClient]);

  const setQty = useMutation({
    mutationFn: async ({
      product,
      selectedUnit,
      unitPrice,
      quantity,
    }: {
      product: Product;
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
            storeId,
            storeName: store?.name ?? "TownKart store",
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
      queryClient.invalidateQueries({ queryKey: ["cart-map"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
    onError: (e) => toast.error(userErrorMessage(e, "Could not update cart")),
  });

  const emoji = store ? (CATEGORIES[store.category]?.emoji ?? "🛍️") : "🛍️";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (availableOnly && !p.is_available) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q);
    });
  }, [products, search, availableOnly]);

  const availableCount = products.filter((p) => p.is_available).length;
  const cartTotal = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="pb-28">
      <div className="relative">
        {store ? (
          <img
            src={categoryImage(store.category)}
            alt={store.name}
            className="h-44 w-full object-cover"
          />
        ) : (
          <div className="h-44 w-full animate-pulse bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <Button
          asChild
          variant="secondary"
          size="icon"
          className="absolute left-4 top-4 rounded-full shadow-card"
        >
          <Link to="/nearby" aria-label="Back to stores">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="-mt-8 px-4">
        <div className="rounded-2xl bg-card p-8 shadow-card">
          <h1 className="text-xl font-extrabold">{store?.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{store?.description}</p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            {store && (
              <>
                <span className="flex items-center gap-1 rounded-lg bg-success/15 px-2 py-1 font-bold text-success">
                  <Star className="h-3 w-3 fill-current" />
                  {store.rating}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {store.delivery_minutes} min
                </span>
                <span className="rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
                  {categoryLabel(store.category)}
                </span>
              </>
            )}
          </div>
          <CallToOrder className="mt-4" />
        </div>
      </div>

      <section className="px-4 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Browse products</h2>
          <span className="text-xs font-medium text-muted-foreground">
            {availableCount} of {products.length} in stock
          </span>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search this store…"
            className="h-11 rounded-xl pl-9"
          />
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setAvailableOnly(false)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              !availableOnly
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-muted text-muted-foreground",
            )}
          >
            All items
          </button>
          <button
            onClick={() => setAvailableOnly(true)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              availableOnly
                ? "bg-success text-success-foreground shadow-card"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Check className="h-3.5 w-3.5" /> Available now
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-card">
            <p className="text-3xl">🔍</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              No products match your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-9">
            {filtered.map((p, idx) => {
              const unitOptions = getUnitOptions(p);
              const selectedUnit = selectedUnits[p.id] ?? unitOptions[0]?.label ?? p.unit;
              const selectedOption =
                unitOptions.find((option) => option.label === selectedUnit) ?? unitOptions[0];
              const unitPrice = selectedOption?.unitPrice ?? Number(p.price);
              const cartKey = `${p.id}::${selectedUnit}`;
              const qty = cart[cartKey] ?? 0;
              const soldOut = !p.is_available;
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailProduct(p)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setDetailProduct(p);
                  }}
                  className={cn(
                    "group flex cursor-pointer flex-col rounded-lg border border-border/70 bg-card p-1.5 transition",
                    soldOut ? "opacity-70" : "hover:-translate-y-0.5 hover:shadow-pop",
                  )}
                >
                  <div className="relative mb-3">
                    {selectedOption?.imageUrl || p.image_url ? (
                      <img
                        src={selectedOption?.imageUrl || p.image_url || ""}
                        alt={p.name}
                        className="aspect-square w-full rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-md bg-gradient-to-br text-3xl",
                          TILE_GRADIENTS[idx % TILE_GRADIENTS.length],
                        )}
                      >
                        <span aria-hidden>{emoji}</span>
                      </div>
                    )}

                    {store && !soldOut && (
                      <span className="absolute left-1 top-1 flex items-center gap-1 rounded-md bg-background/85 px-1.5 py-0.5 text-[9px] font-bold text-foreground backdrop-blur">
                        <Clock className="h-3 w-3 text-primary" />
                        {store.delivery_minutes} min
                      </span>
                    )}
                    {soldOut && (
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-foreground/80 px-1.5 py-0.5 text-[10px] font-bold text-background">
                        Sold out
                      </span>
                    )}

                    <div className="absolute -bottom-3 right-1">
                      {soldOut ? (
                        <span className="inline-flex h-8 items-center rounded-lg border border-border bg-muted px-3 text-xs font-bold text-muted-foreground">
                          N/A
                        </span>
                      ) : qty === 0 ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setQty.mutate({
                              product: p,
                              selectedUnit,
                              unitPrice,
                              quantity: 1,
                            });
                          }}
                          className="inline-flex h-7 items-center rounded-lg border-2 border-primary bg-background px-3 text-[11px] font-extrabold uppercase tracking-wide text-primary shadow-card transition active:scale-95"
                        >
                          Add
                        </button>
                      ) : (
                        <div className="flex h-8 items-center gap-1 rounded-lg bg-primary px-1 text-primary-foreground shadow-card">
                          <button
                            type="button"
                            className="flex h-7 w-6 items-center justify-center"
                            onClick={(event) => {
                              event.stopPropagation();
                              setQty.mutate({
                                product: p,
                                selectedUnit,
                                unitPrice,
                                quantity: qty - 1,
                              });
                            }}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-4 text-center text-xs font-bold">{qty}</span>
                          <button
                            type="button"
                            className="flex h-7 w-6 items-center justify-center"
                            onClick={(event) => {
                              event.stopPropagation();
                              setQty.mutate({
                                product: p,
                                selectedUnit,
                                unitPrice,
                                quantity: qty + 1,
                              });
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[9px] font-medium text-muted-foreground">{selectedUnit}</p>
                  <h3 className="line-clamp-2 min-h-7 text-[11px] font-semibold leading-tight">
                    {p.name}
                  </h3>
                  {unitOptions.length > 1 && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {unitOptions.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedUnits((current) => ({ ...current, [p.id]: option.label }));
                          }}
                          className={cn(
                            "rounded-lg border px-2 py-1 text-[10px] font-bold transition",
                            option.label === selectedUnit
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-muted/40 text-muted-foreground",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="mt-auto pt-1 text-xs font-extrabold">{formatINR(unitPrice)}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {cartTotal > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-md px-4 lg:bottom-6 lg:max-w-md">
          <Button
            size="lg"
            className="h-13 w-full justify-between text-base shadow-pop"
            onClick={() => navigate({ to: "/cart" })}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {cartTotal} item{cartTotal > 1 ? "s" : ""} in cart
            </span>
            <span>View cart →</span>
          </Button>
        </div>
      )}

      <Dialog open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          {detailProduct &&
            (() => {
              const unitOptions = getUnitOptions(detailProduct);
              const selectedUnit =
                selectedUnits[detailProduct.id] ?? unitOptions[0]?.label ?? detailProduct.unit;
              const selectedOption =
                unitOptions.find((option) => option.label === selectedUnit) ?? unitOptions[0];
              const unitPrice = Number(selectedOption?.unitPrice ?? detailProduct.price);
              const qty = cart[`${detailProduct.id}::${selectedUnit}`] ?? 0;
              const soldOut = !detailProduct.is_available;

              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{detailProduct.name}</DialogTitle>
                  </DialogHeader>
                  {selectedOption?.imageUrl || detailProduct.image_url ? (
                    <img
                      src={selectedOption?.imageUrl || detailProduct.image_url || ""}
                      alt={detailProduct.name}
                      className="aspect-video w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-secondary text-5xl">
                      <span aria-hidden>{emoji}</span>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">{selectedUnit}</p>
                      <p className="text-xl font-extrabold">{formatINR(unitPrice)}</p>
                    </div>

                    {unitOptions.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-sm font-bold">Select unit</p>
                        <div className="grid grid-cols-2 gap-2">
                          {unitOptions.map((option) => (
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
                      {selectedOption?.description ||
                        detailProduct.description ||
                        "No description added yet."}
                    </p>

                    {soldOut ? (
                      <Button disabled className="w-full">
                        Sold out
                      </Button>
                    ) : qty === 0 ? (
                      <Button
                        className="w-full"
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
                      <div className="flex items-center justify-between rounded-xl bg-primary px-2 py-1 text-primary-foreground">
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
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
