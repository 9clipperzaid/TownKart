import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminDeleteProductSection,
  adminListProductSections,
  adminListProducts,
  adminSaveProductSection,
} from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/popular-products")({
  component: ProductSectionsPage,
});

type Product = {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  unit: string;
  stores: { name: string } | null;
};
type LayoutMode = "horizontal" | "grid_1x4" | "grid_2x4";
type Section = {
  id: string;
  title: string;
  display_order: number;
  is_active: boolean;
  layout_mode: LayoutMode;
  product_section_items: { product_id: string; display_order: number }[];
};
type Draft = {
  id?: string;
  title: string;
  display_order: number;
  is_active: boolean;
  layout_mode: LayoutMode;
  product_ids: string[];
};

const emptyDraft = (order: number): Draft => ({
  title: "",
  display_order: order,
  is_active: true,
  layout_mode: "grid_2x4",
  product_ids: [],
});

function ProductSectionsPage() {
  const qc = useQueryClient();
  const listSections = useServerFn(adminListProductSections);
  const listProducts = useServerFn(adminListProducts);
  const saveSection = useServerFn(adminSaveProductSection);
  const deleteSection = useServerFn(adminDeleteProductSection);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [q, setQ] = useState("");

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["admin-product-sections"],
    queryFn: () => listSections() as Promise<Section[]>,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["admin-products", "sections"],
    queryFn: () => listProducts({ data: {} }) as Promise<Product[]>,
  });
  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products
      .filter(
        (product) =>
          !draft?.product_ids.includes(product.id) &&
          (!query ||
            product.name.toLowerCase().includes(query) ||
            (product.stores?.name ?? "").toLowerCase().includes(query)),
      )
      .slice(0, 50);
  }, [draft?.product_ids, products, q]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-product-sections"] });
    qc.invalidateQueries({ queryKey: ["home-product-sections"] });
  };
  const saveMut = useMutation({
    mutationFn: (value: Draft) => saveSection({ data: value }),
    onSuccess: () => {
      refresh();
      setDraft(null);
      toast.success("Product section saved");
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not save section")),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSection({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast.success("Product section deleted");
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not delete section")),
  });
  const quickSave = (section: Section, patch: Partial<Draft>) =>
    saveMut.mutate({
      id: section.id,
      title: section.title,
      display_order: section.display_order,
      is_active: section.is_active,
      layout_mode: section.layout_mode ?? "horizontal",
      product_ids: [...section.product_section_items]
        .sort((a, b) => a.display_order - b.display_order)
        .map((item) => item.product_id),
      ...patch,
    });

  const moveProduct = (index: number, direction: -1 | 1) =>
    setDraft((current) => {
      if (!current) return current;
      const next = [...current.product_ids];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, product_ids: next };
    });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Home page</p>
          <h1 className="text-2xl font-extrabold">Product sections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control every product row shown on the home page.
          </p>
        </div>
        <Button onClick={() => setDraft(emptyDraft((sections.at(-1)?.display_order ?? 0) + 1))}>
          <Plus className="h-4 w-4" />
          New section
        </Button>
      </div>

      {draft && (
        <section className="space-y-4 rounded-2xl border border-primary/25 bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{draft.id ? "Edit section" : "New section"}</h2>
            <Button size="icon" variant="ghost" onClick={() => setDraft(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
            <label className="space-y-1 text-sm font-medium">
              <span>Section title</span>
              <Input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Section title"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              <span>Home position</span>
              <Input
                type="number"
                min={0}
                value={draft.display_order}
                onChange={(event) =>
                  setDraft({ ...draft, display_order: Number(event.target.value) })
                }
              />
              <span className="block text-xs font-normal text-muted-foreground">
                Smaller number appears higher.
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch
                checked={draft.is_active}
                onCheckedChange={(checked) => setDraft({ ...draft, is_active: checked })}
              />
              Active
            </label>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-bold">Home layout</p>
            <Select
              value={draft.layout_mode}
              onValueChange={(value) => setDraft({ ...draft, layout_mode: value as LayoutMode })}
            >
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal scrolling row</SelectItem>
                <SelectItem value="grid_1x4">1 row × 4 products</SelectItem>
                <SelectItem value="grid_2x4">2 rows × 4 products</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Fixed grids do not scroll and show the first 4 or 8 products in selected order.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold">
              Selected products ({draft.product_ids.length})
            </h3>
            {draft.product_ids.length === 0 ? (
              <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                Search below to add products.
              </p>
            ) : (
              <div className="space-y-2">
                {draft.product_ids.map((id, index) => {
                  const product = productMap.get(id);
                  if (!product) return null;
                  return (
                    <ProductRow
                      key={id}
                      product={product}
                      actions={
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            disabled={index === 0}
                            onClick={() => moveProduct(index, -1)}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            disabled={index === draft.product_ids.length - 1}
                            onClick={() => moveProduct(index, 1)}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                product_ids: draft.product_ids.filter((value) => value !== id),
                              })
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                className="pl-9"
                placeholder="Search products across all stores"
              />
            </div>
            <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
              {results.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  actions={
                    <Button
                      size="sm"
                      onClick={() =>
                        setDraft({ ...draft, product_ids: [...draft.product_ids, product.id] })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              disabled={!draft.title.trim() || saveMut.isPending}
              onClick={() => saveMut.mutate(draft)}
            >
              Save section
            </Button>
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      ) : sections.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No product sections yet.
        </p>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <section
              key={section.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-card sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-bold">{section.title}</h2>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                    {section.product_section_items.length} products
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Display order {section.display_order} · {section.is_active ? "Visible" : "Hidden"}{" "}
                  ·{" "}
                  {section.layout_mode === "grid_1x4"
                    ? "1 × 4 grid"
                    : section.layout_mode === "grid_2x4"
                      ? "2 × 4 grid"
                      : "Horizontal row"}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={section.is_active}
                  onCheckedChange={(checked) => quickSave(section, { is_active: checked })}
                />
                Active
              </label>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={index === 0}
                  onClick={() =>
                    quickSave(section, {
                      display_order: Math.max(0, sections[index - 1].display_order - 1),
                    })
                  }
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={index === sections.length - 1}
                  onClick={() =>
                    quickSave(section, { display_order: sections[index + 1].display_order + 1 })
                  }
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setDraft({
                      id: section.id,
                      title: section.title,
                      display_order: section.display_order,
                      is_active: section.is_active,
                      layout_mode: section.layout_mode ?? "horizontal",
                      product_ids: [...section.product_section_items]
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((item) => item.product_id),
                    })
                  }
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm(`Delete “${section.title}”?`)) deleteMut.mutate(section.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, actions }: { product: Product; actions: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-2">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {product.image_url && (
          <img
            src={product.image_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{product.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {product.stores?.name ?? "TownKart store"} · {product.unit} ·{" "}
          {formatINR(Number(product.price))}
        </p>
      </div>
      <div className="flex gap-1">{actions}</div>
    </div>
  );
}
