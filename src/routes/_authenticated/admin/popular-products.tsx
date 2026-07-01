import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminListProducts,
  adminListStores,
  adminUpdateProductPopularity,
} from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/popular-products")({
  component: PopularProductsPage,
});

type ProductRow = {
  id: string;
  store_id: string;
  name: string;
  image_url: string | null;
  price: number;
  unit: string;
  is_popular: boolean;
  popular_sort_order: number;
  stores: { name: string } | null;
};

function PopularProductsPage() {
  const qc = useQueryClient();
  const listProducts = useServerFn(adminListProducts);
  const listStores = useServerFn(adminListStores);
  const updatePopularity = useServerFn(adminUpdateProductPopularity);
  const [q, setQ] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: () => listStores() as Promise<{ id: string; name: string }[]>,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products", "popular-products"],
    queryFn: () => listProducts({ data: {} }) as Promise<ProductRow[]>,
  });

  const popularProducts = useMemo(
    () =>
      products
        .filter((product) => product.is_popular)
        .sort(
          (a, b) =>
            Number(a.popular_sort_order ?? 100) - Number(b.popular_sort_order ?? 100) ||
            a.name.localeCompare(b.name),
        ),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products
      .filter((product) => (storeFilter === "all" ? true : product.store_id === storeFilter))
      .filter(
        (product) =>
          !query ||
          product.name.toLowerCase().includes(query) ||
          (product.stores?.name ?? "").toLowerCase().includes(query),
      )
      .sort((a, b) => Number(b.is_popular) - Number(a.is_popular) || a.name.localeCompare(b.name));
  }, [products, q, storeFilter]);

  const nextOrder =
    popularProducts.reduce(
      (max, product) => Math.max(max, Number(product.popular_sort_order ?? 0)),
      0,
    ) + 1;

  const updateMut = useMutation({
    mutationFn: (data: { id: string; is_popular: boolean; popular_sort_order: number }) =>
      updatePopularity({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["product-search"] });
      toast.success("Popular products updated");
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not update product")),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Home page</p>
        <h1 className="text-2xl font-extrabold">Popular products</h1>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Selected products</h2>
          <span className="text-xs font-semibold text-primary">{popularProducts.length} active</span>
        </div>
        {popularProducts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No popular products selected yet.
          </p>
        ) : (
          <div className="space-y-2">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                className="grid gap-2 rounded-xl border border-border/60 p-2 sm:grid-cols-[56px_1fr_92px_auto]"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-primary">
                    TK
                  </div>
                )}
                <div className="min-w-0">
                  <p className="line-clamp-1 font-semibold">{product.name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {product.stores?.name ?? "TownKart store"} - {product.unit} -{" "}
                    {formatINR(Number(product.price))}
                  </p>
                </div>
                <Input
                  type="number"
                  defaultValue={product.popular_sort_order}
                  onBlur={(event) =>
                    updateMut.mutate({
                      id: product.id,
                      is_popular: true,
                      popular_sort_order: Number(event.target.value) || 100,
                    })
                  }
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    updateMut.mutate({
                      id: product.id,
                      is_popular: false,
                      popular_sort_order: Number(product.popular_sort_order ?? 100),
                    })
                  }
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search products or stores"
              className="pl-9"
            />
          </div>
          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-2 shadow-card"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-primary">
                    TK
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-bold">{product.name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {product.stores?.name ?? "TownKart store"}
                  </p>
                  <p className="text-xs font-semibold">{formatINR(Number(product.price))}</p>
                </div>
                {product.is_popular ? (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                    <Star className="h-3 w-3 fill-current" />
                    #{product.popular_sort_order}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() =>
                      updateMut.mutate({
                        id: product.id,
                        is_popular: true,
                        popular_sort_order: nextOrder,
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
