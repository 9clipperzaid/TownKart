import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, History, Search } from "lucide-react";
import { toast } from "sonner";
import {
  adminListStores,
  adminListProducts,
  adminSaveProduct,
  adminDeleteProduct,
  adminListCategories,
  adminPriceHistory,
} from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsPage,
});

type ProductRow = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  price: number;
  discount_price: number | null;
  unit: string;
  stock_quantity: number;
  sku: string | null;
  status: string;
  is_available: boolean;
  price_updated_at: string;
  stores: { name: string } | null;
};

type FormState = {
  id?: string;
  store_id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  price: number;
  discount_price: string;
  unit: string;
  stock_quantity: number;
  sku: string;
  status: "active" | "inactive";
  is_available: boolean;
};

function emptyForm(storeId: string): FormState {
  return {
    store_id: storeId,
    name: "",
    description: "",
    category: "",
    image_url: "",
    price: 0,
    discount_price: "",
    unit: "1 unit",
    stock_quantity: 0,
    sku: "",
    status: "active",
    is_available: true,
  };
}

function ProductsPage() {
  const qc = useQueryClient();
  const listStores = useServerFn(adminListStores);
  const listProducts = useServerFn(adminListProducts);
  const listCats = useServerFn(adminListCategories);
  const save = useServerFn(adminSaveProduct);
  const remove = useServerFn(adminDeleteProduct);
  const history = useServerFn(adminPriceHistory);

  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [historyFor, setHistoryFor] = useState<ProductRow | null>(null);

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: () => listStores() as Promise<{ id: string; name: string }[]>,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCats() as Promise<{ key: string; label: string }[]>,
  });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products", storeFilter],
    queryFn: () =>
      listProducts({
        data: storeFilter === "all" ? {} : { storeId: storeFilter },
      }) as Promise<ProductRow[]>,
  });

  const { data: historyRows = [] } = useQuery({
    queryKey: ["price-history", historyFor?.id],
    queryFn: () =>
      history({ data: { productId: historyFor!.id } }) as Promise<
        {
          id: string;
          old_price: number | null;
          new_price: number;
          reason: string | null;
          created_at: string;
        }[]
      >,
    enabled: !!historyFor,
  });

  const saveMut = useMutation({
    mutationFn: (f: FormState) =>
      save({
        data: {
          id: f.id,
          store_id: f.store_id,
          name: f.name,
          description: f.description || null,
          category: f.category || null,
          image_url: f.image_url || null,
          price: Number(f.price) || 0,
          discount_price: f.discount_price ? Number(f.discount_price) : null,
          unit: f.unit || "1 unit",
          stock_quantity: Number(f.stock_quantity) || 0,
          sku: f.sku || null,
          status: f.status,
          is_available: f.is_available,
        },
      }),
    onSuccess: () => {
      toast.success("Product saved");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setForm(null);
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const filtered = products.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  const canCreate = stores.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage inventory and pricing for every store.
          </p>
        </div>
        <Button
          disabled={!canCreate}
          onClick={() =>
            setForm(emptyForm(storeFilter === "all" ? (stores[0]?.id ?? "") : storeFilter))
          }
        >
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="pl-9"
          />
        </div>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="All stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stores</SelectItem>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.sku ? `SKU ${p.sku} · ` : ""}
                      {p.unit}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.stores?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{formatINR(Number(p.price))}</div>
                    {p.discount_price != null && (
                      <div className="text-xs text-success">
                        offer {formatINR(Number(p.discount_price))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.is_available && p.status === "active"
                          ? "rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"
                          : "rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {p.is_available && p.status === "active" ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setHistoryFor(p)}>
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setForm({
                            id: p.id,
                            store_id: p.store_id,
                            name: p.name,
                            description: p.description ?? "",
                            category: p.category ?? "",
                            image_url: p.image_url ?? "",
                            price: Number(p.price),
                            discount_price:
                              p.discount_price != null ? String(p.discount_price) : "",
                            unit: p.unit,
                            stock_quantity: p.stock_quantity,
                            sku: p.sku ?? "",
                            status: (p.status as FormState["status"]) ?? "active",
                            is_available: p.is_available,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"?`)) delMut.mutate(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor */}
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Store</Label>
                  <Select
                    value={form.store_id}
                    onValueChange={(v) => setForm({ ...form, store_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.category || "none"}
                    onValueChange={(v) => setForm({ ...form, category: v === "none" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>

              <ImageUpload
                label="Product Image Upload"
                bucket="product-images"
                value={form.image_url}
                onChange={(image_url) => setForm({ ...form, image_url })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Discount price (₹)</Label>
                  <Input
                    type="number"
                    value={form.discount_price}
                    onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>SKU</Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as FormState["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
                  <span className="text-sm font-medium">In stock</span>
                  <Switch
                    checked={form.is_available}
                    onCheckedChange={(v) => setForm({ ...form, is_available: v })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button
              disabled={saveMut.isPending || !form?.name || !form?.store_id}
              onClick={() => form && saveMut.mutate(form)}
            >
              {saveMut.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price history */}
      <Dialog open={!!historyFor} onOpenChange={(o) => !o && setHistoryFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Price history — {historyFor?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {historyRows.length === 0 && (
              <p className="text-sm text-muted-foreground">No changes recorded.</p>
            )}
            {historyRows.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">
                    {h.old_price != null ? formatINR(Number(h.old_price)) : "—"} →{" "}
                    {formatINR(Number(h.new_price))}
                  </div>
                  <div className="text-xs text-muted-foreground">{h.reason}</div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
