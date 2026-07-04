import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Download, History, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  adminBulkAssignProductCategory,
  adminBulkImportProducts,
  adminListStores,
  adminListProducts,
  adminSaveProduct,
  adminDeleteProduct,
  adminListCategories,
  adminListSubcategories,
  adminPriceHistory,
} from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsPage,
});

type ProductRow = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory_id: string | null;
  image_url: string | null;
  price: number;
  discount_price: number | null;
  unit: string;
  stock_quantity: number;
  sku: string | null;
  status: string;
  is_available: boolean;
  is_popular: boolean;
  popular_sort_order: number;
  has_unit_options: boolean;
  unit_options: { label: string; unitPrice: number }[];
  price_updated_at: string;
  stores: { name: string } | null;
};

type FormState = {
  id?: string;
  store_id: string;
  name: string;
  description: string;
  category: string;
  subcategory_id: string;
  image_url: string;
  price: number;
  discount_price: string;
  unit: string;
  stock_quantity: number;
  sku: string;
  status: "active" | "inactive";
  is_available: boolean;
  is_popular: boolean;
  popular_sort_order: number;
  has_unit_options: boolean;
  unit_options: { label: string; unitPrice: number }[];
};

type BulkImportProduct = {
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
  status: "active" | "inactive";
  is_available: boolean;
  is_popular: boolean;
  popular_sort_order: number;
  has_unit_options: boolean;
  unit_options: { label: string; unitPrice: number }[];
};

function emptyForm(storeId: string): FormState {
  return {
    store_id: storeId,
    name: "",
    description: "",
    category: "",
    subcategory_id: "",
    image_url: "",
    price: 0,
    discount_price: "",
    unit: "1 unit",
    stock_quantity: 0,
    sku: "",
    status: "active",
    is_available: true,
    is_popular: false,
    popular_sort_order: 100,
    has_unit_options: false,
    unit_options: [],
  };
}

function ProductsPage() {
  const qc = useQueryClient();
  const listStores = useServerFn(adminListStores);
  const listProducts = useServerFn(adminListProducts);
  const listCats = useServerFn(adminListCategories);
  const listSubcategories = useServerFn(adminListSubcategories);
  const save = useServerFn(adminSaveProduct);
  const bulkImport = useServerFn(adminBulkImportProducts);
  const bulkAssignCategory = useServerFn(adminBulkAssignProductCategory);
  const remove = useServerFn(adminDeleteProduct);
  const history = useServerFn(adminPriceHistory);

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const [subcategoryQuery, setSubcategoryQuery] = useState("");
  const [importStoreId, setImportStoreId] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [historyFor, setHistoryFor] = useState<ProductRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkSubcategory, setBulkSubcategory] = useState("");

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: () => listStores() as Promise<{ id: string; name: string }[]>,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCats() as Promise<{ id: string; key: string; label: string }[]>,
  });
  const { data: subcategories = [] } = useQuery({
    queryKey: ["admin-subcategories"],
    queryFn: () =>
      listSubcategories() as Promise<{ id: string; category_id: string; label: string }[]>,
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
          subcategory_id: f.subcategory_id || null,
          image_url: f.image_url || null,
          price: Number(f.price) || 0,
          discount_price: f.discount_price ? Number(f.discount_price) : null,
          unit: f.unit || "1 unit",
          stock_quantity: Number(f.stock_quantity) || 0,
          sku: f.sku || null,
          status: f.status,
          is_available: f.is_available,
          is_popular: f.is_popular,
          popular_sort_order: Number(f.popular_sort_order) || 100,
          has_unit_options: f.has_unit_options,
          unit_options: f.has_unit_options
            ? f.unit_options
                .filter((option) => option.label.trim() && Number(option.unitPrice) >= 0)
                .map((option) => ({
                  label: option.label.trim(),
                  unitPrice: Number(option.unitPrice),
                }))
            : [],
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

  const importMut = useMutation({
    mutationFn: (products: BulkImportProduct[]) => bulkImport({ data: { products } }),
    onSuccess: (result) => {
      toast.success(`Import complete: ${result.created} created, ${result.updated} updated`);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setImportOpen(false);
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const bulkCategoryMut = useMutation({
    mutationFn: () =>
      bulkAssignCategory({
        data: {
          product_ids: selectedIds,
          category: bulkCategory,
          subcategory_id: bulkSubcategory || null,
        },
      }),
    onSuccess: (result) => {
      toast.success(`${result.updated} products updated`);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setSelectedIds([]);
      setBulkCategory("");
      setBulkSubcategory("");
    },
    onError: (e: Error) => toast.error(userErrorMessage(e, "Could not update products")),
  });

  const filtered = products.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((product) => selectedIds.includes(product.id));
  const bulkSubcategories = subcategories.filter((subcategory) => {
    const parent = categories.find((category) => category.id === subcategory.category_id);
    return parent?.key === bulkCategory;
  });
  const matchingSubcategories = subcategories.filter((subcategory) => {
    const parent = categories.find((category) => category.id === subcategory.category_id);
    return `${subcategory.label} ${parent?.label ?? ""}`
      .toLowerCase()
      .includes(subcategoryQuery.trim().toLowerCase());
  });

  const canCreate = stores.length > 0;
  const selectedImportStore =
    importStoreId || (storeFilter !== "all" ? storeFilter : stores[0]?.id);

  function parseCsv(text: string) {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"' && quoted && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(cell);
        if (row.some((value) => value.trim())) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
    return rows;
  }

  function toBool(value: string | undefined, fallback: boolean) {
    const normalized = (value ?? "").trim().toLowerCase();
    if (!normalized) return fallback;
    return ["1", "true", "yes", "y", "live", "active"].includes(normalized);
  }

  async function handleImportFile(file: File) {
    if (!selectedImportStore) {
      toast.error("Choose a store before importing.");
      return;
    }
    const rows = parseCsv(await file.text());
    if (rows.length < 2) {
      toast.error("CSV needs a header row and at least one product.");
      return;
    }
    const headers = rows[0].map((header) => header.trim().toLowerCase());
    const indexOf = (name: string) => headers.indexOf(name);
    const required = ["name", "price"];
    const missing = required.filter((name) => indexOf(name) === -1);
    if (missing.length) {
      toast.error(`Missing CSV columns: ${missing.join(", ")}`);
      return;
    }
    const valueAt = (row: string[], name: string) => {
      const index = indexOf(name);
      return index >= 0 ? (row[index]?.trim() ?? "") : "";
    };

    const imported: BulkImportProduct[] = rows.slice(1).map((row, rowIndex) => {
      const name = valueAt(row, "name");
      const price = Number(valueAt(row, "price"));
      if (!name || !Number.isFinite(price)) {
        throw new Error(`Row ${rowIndex + 2}: name and numeric price are required.`);
      }
      const discountText = valueAt(row, "discount_price");
      const discountPrice = discountText ? Number(discountText) : null;
      if (discountPrice != null && !Number.isFinite(discountPrice)) {
        throw new Error(`Row ${rowIndex + 2}: discount_price must be numeric.`);
      }
      const stockText = valueAt(row, "stock_quantity") || valueAt(row, "stock");
      const stockQuantity = stockText ? Number(stockText) : 0;
      if (!Number.isFinite(stockQuantity)) {
        throw new Error(`Row ${rowIndex + 2}: stock_quantity must be numeric.`);
      }
      const status = valueAt(row, "status").toLowerCase() === "inactive" ? "inactive" : "active";
      return {
        store_id: selectedImportStore,
        name,
        description: valueAt(row, "description") || null,
        category: valueAt(row, "category") || null,
        image_url: valueAt(row, "image_url") || null,
        price,
        discount_price: discountPrice,
        unit: valueAt(row, "unit") || "1 unit",
        stock_quantity: Math.max(0, Math.floor(stockQuantity)),
        sku: valueAt(row, "sku") || null,
        status,
        is_available: status === "active" && toBool(valueAt(row, "is_available"), true),
        is_popular: false,
        popular_sort_order: 100,
        has_unit_options: false,
        unit_options: [],
      };
    });

    importMut.mutate(imported);
  }

  function downloadTemplate() {
    const csv = [
      "name,price,stock_quantity,unit,sku,category,description,discount_price,image_url,status,is_available",
      "Red bull,140,100,1 unit,RB-001,confectionery,Energy drink,,https://example.com/red-bull.jpg,active,true",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "townkart-products-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage inventory and pricing for every store.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            disabled={!canCreate}
            onClick={() => {
              setImportStoreId(storeFilter === "all" ? (stores[0]?.id ?? "") : storeFilter);
              setImportOpen(true);
            }}
          >
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button
            disabled={!canCreate}
            onClick={() =>
              setForm(emptyForm(storeFilter === "all" ? (stores[0]?.id ?? "") : storeFilter))
            }
          >
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
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

      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 lg:flex-row lg:items-end">
          <div className="min-w-40">
            <p className="font-bold">{selectedIds.length} products selected</p>
            <p className="text-xs text-muted-foreground">Assign all of them together.</p>
          </div>
          <div className="space-y-1 lg:w-56">
            <Label>Category</Label>
            <Select
              value={bulkCategory}
              onValueChange={(value) => {
                setBulkCategory(value);
                setBulkSubcategory("");
              }}
            >
              <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.key}>{category.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 lg:w-64">
            <Label>Subcategory (optional)</Label>
            <Select
              value={bulkSubcategory || "none"}
              onValueChange={(value) => setBulkSubcategory(value === "none" ? "" : value)}
              disabled={!bulkCategory}
            >
              <SelectTrigger><SelectValue placeholder="Choose subcategory" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {bulkSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={!bulkCategory || bulkCategoryMut.isPending}
            onClick={() => bulkCategoryMut.mutate()}
          >
            Apply to {selectedIds.length} products
          </Button>
          <Button variant="ghost" onClick={() => setSelectedIds([])}>Clear</Button>
        </div>
      )}

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
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    aria-label="Select all visible products"
                    checked={allFilteredSelected}
                    onCheckedChange={(checked) =>
                      setSelectedIds((current) =>
                        checked
                          ? Array.from(new Set([...current, ...filtered.map((product) => product.id)]))
                          : current.filter((id) => !filtered.some((product) => product.id === id)),
                      )
                    }
                  />
                </th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Popular</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3">
                    <Checkbox
                      aria-label={`Select ${p.name}`}
                      checked={selectedIds.includes(p.id)}
                      onCheckedChange={(checked) =>
                        setSelectedIds((current) =>
                          checked
                            ? [...current, p.id]
                            : current.filter((id) => id !== p.id),
                        )
                      }
                    />
                  </td>
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
                    {p.is_popular ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        #{p.popular_sort_order}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </td>
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
                            subcategory_id: p.subcategory_id ?? "",
                            image_url: p.image_url ?? "",
                            price: Number(p.price),
                            discount_price:
                              p.discount_price != null ? String(p.discount_price) : "",
                            unit: p.unit,
                            stock_quantity: p.stock_quantity,
                            sku: p.sku ?? "",
                            status: (p.status as FormState["status"]) ?? "active",
                            is_available: p.is_available,
                            is_popular: Boolean(p.is_popular),
                            popular_sort_order: Number(p.popular_sort_order ?? 100),
                            has_unit_options: Boolean(p.has_unit_options),
                            unit_options: Array.isArray(p.unit_options) ? p.unit_options : [],
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
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
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
                <Label>Subcategory</Label>
                <Popover
                  open={subcategoryOpen}
                  onOpenChange={(open) => {
                    setSubcategoryOpen(open);
                    if (open) setSubcategoryQuery("");
                  }}
                >
                  <PopoverAnchor asChild>
                    <div className="relative">
                      <Input
                        value={
                          subcategoryOpen
                            ? subcategoryQuery
                            : (subcategories.find((item) => item.id === form.subcategory_id)
                                ?.label ?? "")
                        }
                        onFocus={() => setSubcategoryOpen(true)}
                        onClick={() => setSubcategoryOpen(true)}
                        onChange={(event) => {
                          setSubcategoryQuery(event.target.value);
                          setSubcategoryOpen(true);
                        }}
                        placeholder="None — type to search"
                        autoComplete="off"
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        aria-label="Show subcategories"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setSubcategoryOpen(true)}
                        className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-muted-foreground"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </PopoverAnchor>
                  <PopoverContent
                    align="start"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    onWheel={(event) => event.stopPropagation()}
                    onTouchMove={(event) => event.stopPropagation()}
                    className="w-[calc(100vw-2rem)] max-w-[35rem] p-1"
                  >
                    <div className="max-h-[min(16rem,50vh)] touch-pan-y overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, subcategory_id: "" });
                          setSubcategoryOpen(false);
                        }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        None
                      </button>
                      {matchingSubcategories.map((subcategory) => {
                        const parent = categories.find(
                          (category) => category.id === subcategory.category_id,
                        );
                        return (
                          <button
                            type="button"
                            key={subcategory.id}
                            onClick={() => {
                              setForm({ ...form, subcategory_id: subcategory.id });
                              setSubcategoryOpen(false);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                          >
                            {subcategory.label}
                            {parent ? ` — ${parent.label}` : ""}
                          </button>
                        );
                      })}
                      {matchingSubcategories.length === 0 && (
                        <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                          No matching subcategory
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Choose the home tile where this product should appear.
                </p>
              </div>

              <div className="space-y-3 rounded-xl border border-border/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>Show in popular products</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Turn on to show this product on the home page popular section.
                    </p>
                  </div>
                  <Switch
                    checked={form.is_popular}
                    onCheckedChange={(value) => setForm({ ...form, is_popular: value })}
                  />
                </div>
                {form.is_popular && (
                  <div className="space-y-1.5">
                    <Label>Popular order</Label>
                    <Input
                      type="number"
                      value={form.popular_sort_order}
                      onChange={(event) =>
                        setForm({ ...form, popular_sort_order: Number(event.target.value) })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-border/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>Unit/price options</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enable only for products that need choices like half kg / full kg.
                    </p>
                  </div>
                  <Switch
                    checked={form.has_unit_options}
                    onCheckedChange={(value) =>
                      setForm({
                        ...form,
                        has_unit_options: value,
                        unit_options:
                          value && form.unit_options.length === 0
                            ? [
                                {
                                  label: "0.5 kg",
                                  unitPrice: Math.round(Number(form.price) * 0.5),
                                },
                                { label: "1 kg", unitPrice: Number(form.price) },
                              ]
                            : form.unit_options,
                      })
                    }
                  />
                </div>

                {form.has_unit_options && (
                  <div className="space-y-2">
                    {form.unit_options.map((option, index) => (
                      <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <Input
                          value={option.label}
                          placeholder="0.5 kg"
                          onChange={(event) => {
                            const next = [...form.unit_options];
                            next[index] = { ...option, label: event.target.value };
                            setForm({ ...form, unit_options: next });
                          }}
                        />
                        <Input
                          type="number"
                          value={option.unitPrice}
                          placeholder="Price"
                          onChange={(event) => {
                            const next = [...form.unit_options];
                            next[index] = { ...option, unitPrice: Number(event.target.value) };
                            setForm({ ...form, unit_options: next });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setForm({
                              ...form,
                              unit_options: form.unit_options.filter(
                                (_, current) => current !== index,
                              ),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setForm({
                          ...form,
                          unit_options: [
                            ...form.unit_options,
                            { label: form.unit || "1 unit", unitPrice: Number(form.price) || 0 },
                          ],
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add option
                    </Button>
                  </div>
                )}
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

      {/* Bulk import */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import products from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Store</Label>
              <Select value={selectedImportStore ?? ""} onValueChange={setImportStoreId}>
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

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
              CSV columns: name, price, stock_quantity, unit, sku, category, description,
              discount_price, image_url, status, is_available. Use image_url for product photos.
            </div>

            <input
              ref={importInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportFile(file).catch((error: Error) =>
                    toast.error(userErrorMessage(error, "Could not import CSV")),
                  );
                }
                e.currentTarget.value = "";
              }}
            />

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4" /> Download template
              </Button>
              <Button
                type="button"
                disabled={!selectedImportStore || importMut.isPending}
                onClick={() => importInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {importMut.isPending ? "Importing..." : "Choose CSV"}
              </Button>
            </div>
          </div>
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
