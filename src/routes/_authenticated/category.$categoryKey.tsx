import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { ProductQuickAdd } from "@/components/ProductQuickAdd";

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
  subcategory_id: string | null;
  subcategory_section_id: string | null;
  has_unit_options: boolean;
  unit_options: { label: string; unitPrice: number }[] | null;
  stores: { name: string; category: string } | null;
};
type ProductSection = { id: string; name: string; sort_order: number };
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
  const { data: subcategory, isLoading: isSubcategoryLoading } = useQuery({
    queryKey: ["subcategory", categoryKey],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subcategories")
        .select("id,label,image_url")
        .eq("key", categoryKey)
        .eq("is_enabled", true)
        .maybeSingle();
      if (error?.code === "42P01") return null;
      if (error) throw error;
      return data as { id: string; label: string; image_url: string | null } | null;
    },
  });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["category-products", categoryKey, subcategory?.id],
    enabled: !isSubcategoryLoading,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,store_id,name,price,unit,image_url,category,subcategory_id,subcategory_section_id,has_unit_options,unit_options,stores(name,category)",
        )
        .eq("is_available", true);
      if (error) throw error;
      return (data as Product[]).filter((p) =>
        subcategory
          ? p.subcategory_id === subcategory.id
          : p.category?.toLowerCase() === categoryKey.toLowerCase() ||
            p.stores?.category?.toLowerCase() === categoryKey.toLowerCase(),
      );
    },
  });
  const { data: sections = [] } = useQuery({
    queryKey: ["subcategory-product-sections", subcategory?.id],
    enabled: !!subcategory?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subcategory_product_sections")
        .select("id,name,sort_order")
        .eq("subcategory_id", subcategory!.id)
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true });
      if (error?.code === "42P01") return [];
      if (error) throw error;
      return (data ?? []) as ProductSection[];
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
  const groups = useMemo(() => {
    if (!subcategory || sections.length === 0) return [];
    const configured = sections
      .map((section) => ({
        ...section,
        products: visible.filter((product) => product.subcategory_section_id === section.id),
      }))
      .filter((section) => section.products.length > 0);
    const assignedIds = new Set(sections.map((section) => section.id));
    const unassigned = visible.filter(
      (product) =>
        !product.subcategory_section_id || !assignedIds.has(product.subcategory_section_id),
    );
    return unassigned.length
      ? [
          ...configured,
          { id: "other", name: "Other products", sort_order: 99999, products: unassigned },
        ]
      : configured;
  }, [sections, subcategory, visible]);

  const scrollToSection = (id: string) => {
    document.getElementById(`product-section-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
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
            {!subcategory && category?.emoji} {subcategory?.label ?? category?.label ?? categoryKey}
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
      {groups.length > 0 && (
        <nav aria-label="Product sections" className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => scrollToSection(group.id)}
              className="min-w-[7.5rem] shrink-0 rounded-xl border bg-card px-4 py-3 text-left shadow-card transition hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="block text-sm font-bold">{group.name}</span>
              <span className="text-xs text-muted-foreground">{group.products.length} items</span>
            </button>
          ))}
        </nav>
      )}
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
      ) : groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.id} id={`product-section-${group.id}`} className="scroll-mt-24">
              <div className="mb-3 flex items-end justify-between border-b pb-2">
                <h2 className="text-lg font-extrabold">{group.name}</h2>
                <span className="text-xs font-semibold text-primary">
                  {group.products.length} items
                </span>
              </div>
              <ProductGrid products={group.products} />
            </section>
          ))}
        </div>
      ) : (
        <ProductGrid products={visible} />
      )}
    </main>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {products.map((p) => (
        <div key={p.id} className="rounded-xl border bg-card p-2 shadow-card">
          <Link to="/product/$productId" params={{ productId: p.id }} className="block">
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
          </Link>
          <div className="mt-1 flex items-center justify-between gap-1">
            <p className="text-xs font-extrabold">{formatINR(Number(p.price))}</p>
            <ProductQuickAdd product={p} />
          </div>
        </div>
      ))}
    </div>
  );
}
