import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminDeleteStoreProductSection,
  adminListProducts,
  adminListStores,
  adminListStoreProductSections,
  adminSaveStoreProductSection,
} from "@/lib/admin.functions";
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
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/store-product-sections")({
  component: StoreProductSectionsPage,
});

type Store = { id: string; name: string; status: string };
type Product = {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  unit: string;
};
type Section = {
  id: string;
  store_id: string;
  title: string;
  display_order: number;
  is_active: boolean;
  product_ids: string[];
};
type Draft = Omit<Section, "id"> & { id?: string };

function StoreProductSectionsPage() {
  const queryClient = useQueryClient();
  const listStores = useServerFn(adminListStores);
  const listProducts = useServerFn(adminListProducts);
  const listSections = useServerFn(adminListStoreProductSections);
  const saveSection = useServerFn(adminSaveStoreProductSection);
  const deleteSection = useServerFn(adminDeleteStoreProductSection);
  const [storeId, setStoreId] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [search, setSearch] = useState("");

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores", "store-product-sections"],
    queryFn: () => listStores() as Promise<Store[]>,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["admin-products", "store-product-sections", storeId],
    queryFn: () => listProducts({ data: { storeId } }) as Promise<Product[]>,
    enabled: !!storeId,
  });
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["admin-store-product-sections", storeId],
    queryFn: () => listSections({ data: { storeId } }) as Promise<Section[]>,
    enabled: !!storeId,
  });

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products
      .filter(
        (product) =>
          !draft?.product_ids.includes(product.id) &&
          (!query || product.name.toLowerCase().includes(query)),
      )
      .slice(0, 60);
  }, [draft?.product_ids, products, search]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-store-product-sections", storeId] });
    queryClient.invalidateQueries({ queryKey: ["store-product-sections", storeId] });
  };
  const saveMutation = useMutation({
    mutationFn: (value: Draft) => saveSection({ data: value }),
    onSuccess: () => {
      refresh();
      setDraft(null);
      setSearch("");
      toast.success("Store page product section saved");
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not save section")),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSection({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast.success("Store page product section deleted");
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not delete section")),
  });

  const moveProduct = (index: number, direction: -1 | 1) => {
    if (!draft) return;
    const productIds = [...draft.product_ids];
    const target = index + direction;
    if (target < 0 || target >= productIds.length) return;
    [productIds[index], productIds[target]] = [productIds[target], productIds[index]];
    setDraft({ ...draft, product_ids: productIds });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Store Page Section</p>
        <h1 className="text-2xl font-extrabold">Store Product Sections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a store, then create separate product groups shown inside that store.
        </p>
      </div>

      <label className="block max-w-xl space-y-1 text-sm font-medium">
        <span>Choose store</span>
        <Select
          value={storeId}
          onValueChange={(value) => {
            setStoreId(value);
            setDraft(null);
            setSearch("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a store to manage its sections" />
          </SelectTrigger>
          <SelectContent>
            {stores
              .filter((store) => store.status === "active")
              .map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </label>

      {storeId && (
        <>
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Editing store page</p>
              <p className="font-bold">{stores.find((store) => store.id === storeId)?.name}</p>
            </div>
            <Button
              onClick={() =>
                setDraft({
                  store_id: storeId,
                  title: "",
                  display_order: (sections.at(-1)?.display_order ?? 0) + 1,
                  is_active: true,
                  product_ids: [],
                })
              }
            >
              <Plus className="h-4 w-4" /> Add Store Page Section
            </Button>
          </div>

          {draft && (
            <section className="space-y-4 rounded-2xl border border-primary/25 bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{draft.id ? "Edit" : "New"} Store Page Section</h2>
                <Button size="icon" variant="ghost" onClick={() => setDraft(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
                <label className="space-y-1 text-sm font-medium">
                  <span>Section title</span>
                  <Input
                    value={draft.title}
                    placeholder="Example: Paneer, Pizza, Burgers"
                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  <span>Store page position</span>
                  <Input
                    type="number"
                    min={0}
                    value={draft.display_order}
                    onChange={(event) =>
                      setDraft({ ...draft, display_order: Number(event.target.value) })
                    }
                  />
                </label>
                <label className="flex items-center gap-2 pt-6 text-sm font-medium">
                  <Switch
                    checked={draft.is_active}
                    onCheckedChange={(is_active) => setDraft({ ...draft, is_active })}
                  />
                  Visible in store
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold">Selected products ({draft.product_ids.length})</p>
                {!draft.product_ids.length && (
                  <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Add products from this store below.
                  </p>
                )}
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

              <div className="space-y-2">
                <p className="text-sm font-bold">Add products from this store</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search store products"
                    className="pl-9"
                  />
                </div>
                <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                  {results.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      actions={
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              product_ids: [...draft.product_ids, product.id],
                            })
                          }
                        >
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  disabled={
                    !draft.title.trim() || !draft.product_ids.length || saveMutation.isPending
                  }
                  onClick={() => saveMutation.mutate(draft)}
                >
                  Save Store Page Section
                </Button>
              </div>
            </section>
          )}

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading store page sections...</p>
            ) : !sections.length ? (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No store page sections yet. Products will remain under All products.
              </p>
            ) : (
              sections.map((section) => (
                <section
                  key={section.id}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-primary">Store Page Section</p>
                    <h2 className="truncate font-bold">{section.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {section.product_ids.length} products · position {section.display_order} ·{" "}
                      {section.is_active ? "Visible" : "Hidden"}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setDraft({ ...section, product_ids: [...section.product_ids] })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() =>
                      window.confirm(`Delete store page section “${section.title}”?`) &&
                      deleteMutation.mutate(section.id)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </section>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ProductRow({ product, actions }: { product: Product; actions: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-2">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {product.image_url && (
          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          {product.unit} · {formatINR(Number(product.price))}
        </p>
      </div>
      <div className="flex gap-1">{actions}</div>
    </div>
  );
}
