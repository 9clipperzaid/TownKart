import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { ProductQuickAdd } from "@/components/ProductQuickAdd";

export const Route = createFileRoute("/_authenticated/product-sections/$sectionId")({
  component: ProductSectionPage,
});

type Product = {
  id: string;
  store_id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  has_unit_options: boolean;
  unit_options: { label: string; unitPrice: number }[] | null;
  stores: { name: string } | null;
};

type Section = {
  id: string;
  title: string;
  product_section_items: {
    display_order: number;
    products: Product | null;
  }[];
};

function ProductSectionPage() {
  const { sectionId } = Route.useParams();
  const [query, setQuery] = useState("");
  const { data: section, isLoading } = useQuery({
    queryKey: ["product-section", sectionId],
    queryFn: async () => {
      const db = supabase as any;
      const { data, error } = await db
        .from("product_sections")
        .select(
          "id, title, product_section_items(display_order, products(id, store_id, name, price, unit, image_url, is_available, has_unit_options, unit_options, stores(name)))",
        )
        .eq("id", sectionId)
        .eq("is_active", true)
        .order("display_order", { referencedTable: "product_section_items", ascending: true })
        .maybeSingle();
      if (error) throw error;
      return data as Section | null;
    },
  });

  const products = useMemo(
    () =>
      (section?.product_section_items ?? [])
        .map((item) => item.products)
        .filter((product): product is Product => Boolean(product)),
    [section],
  );
  const visibleProducts = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        (product.stores?.name ?? "").toLowerCase().includes(value),
    );
  }, [products, query]);

  return (
    <main className="px-4 py-5">
      <div className="mb-5 flex items-center gap-3">
        <Link
          to="/home"
          aria-label="Back to home"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold">{section?.title ?? "Products"}</h1>
          <p className="text-sm text-muted-foreground">Products selected for this section.</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !section ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          This product section is not available.
        </p>
      ) : visibleProducts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No products found in this section.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-border/70 bg-card p-2 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
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
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-secondary text-xl font-extrabold text-primary">
                    TK
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
              </Link>
              <div className="mt-1 flex items-center justify-between gap-1">
                <p className="text-xs font-extrabold">{formatINR(Number(product.price))}</p>
                <ProductQuickAdd product={product} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
