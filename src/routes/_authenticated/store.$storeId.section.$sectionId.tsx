import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStoreProductSections } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { ProductQuickAdd } from "@/components/ProductQuickAdd";

export const Route = createFileRoute("/_authenticated/store/$storeId/section/$sectionId")({
  component: StoreSectionProductsPage,
});

type Product = {
  id: string;
  store_id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  is_available: boolean;
  has_unit_options: boolean;
  unit_options: { label: string; unitPrice: number }[] | null;
  stores: { name: string } | null;
};

type StoreSection = {
  id: string;
  title: string;
  display_order: number;
  product_ids: string[];
};

function StoreSectionProductsPage() {
  const { storeId, sectionId } = Route.useParams();
  const [search, setSearch] = useState("");
  const listSections = useServerFn(getStoreProductSections);

  const { data: section, isLoading: sectionLoading } = useQuery({
    queryKey: ["store-product-section", storeId, sectionId],
    queryFn: async () => {
      const sections = (await listSections({ data: { storeId } })) as StoreSection[];
      return sections.find((item) => item.id === sectionId) ?? null;
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["store-product-section-products", storeId, sectionId, section?.product_ids],
    enabled: !!section?.product_ids.length,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, store_id, name, price, unit, image_url, is_available, has_unit_options, unit_options, stores(name)",
        )
        .eq("store_id", storeId)
        .in("id", section?.product_ids ?? []);
      if (error) throw error;
      const rows = (data ?? []) as unknown as Product[];
      const productMap = new Map(rows.map((product) => [product.id, product]));
      return (section?.product_ids ?? [])
        .map((id) => productMap.get(id))
        .filter((product): product is Product => Boolean(product));
    },
  });

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, search]);

  const isLoading = sectionLoading || productsLoading;

  return (
    <main className="px-4 py-5">
      <div className="mb-5 flex items-center gap-3">
        <Link
          to="/store/$storeId"
          params={{ storeId }}
          aria-label="Back to store"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs font-semibold text-primary">Store Page Section</p>
          <h1 className="text-2xl font-extrabold">{section?.title ?? "Products"}</h1>
          <p className="text-sm text-muted-foreground">All products selected for this section.</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search in this section"
          className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm shadow-card outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">{section?.title ?? "Products"}</h2>
        <span className="text-xs font-semibold text-primary">{visibleProducts.length} items</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !section ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          This store section is not available.
        </p>
      ) : !visibleProducts.length ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No products found in this section.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-border/70 bg-card p-2 shadow-card"
            >
              <Link to="/product/$productId" params={{ productId: product.id }} className="block">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="aspect-square w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-lg bg-secondary font-extrabold text-primary">
                    TK
                  </div>
                )}
                <p className="mt-1.5 text-[10px] text-muted-foreground">{product.unit}</p>
                <h3 className="line-clamp-2 min-h-8 text-xs font-semibold leading-tight">
                  {product.name}
                </h3>
              </Link>
              <div className="mt-1 flex items-center justify-between gap-1">
                <p className="text-xs font-extrabold">{formatINR(Number(product.price))}</p>
                {product.is_available ? (
                  <ProductQuickAdd product={product} />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground">Sold out</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
