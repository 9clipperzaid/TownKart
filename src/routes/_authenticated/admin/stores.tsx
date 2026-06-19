import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import {
  adminListStores,
  adminSaveStore,
  adminDeleteStore,
  adminSetStoreStatus,
  adminListCategories,
} from "@/lib/admin.functions";
import { geocodeAddress } from "@/lib/maps.functions";
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

export const Route = createFileRoute("/_authenticated/admin/stores")({
  component: StoresPage,
});

type StoreRow = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  address: string | null;
  phone: string | null;
  opening_hours: string | null;
  latitude: number | null;
  longitude: number | null;
  delivery_minutes: number;
  min_order: number;
  rating: number;
  delivery_available: boolean;
  is_active: boolean;
  status: string;
};

type FormState = {
  id?: string;
  name: string;
  category: string;
  description: string;
  logo_url: string;
  banner_url: string;
  address: string;
  phone: string;
  opening_hours: string;
  latitude: string;
  longitude: string;
  delivery_minutes: number;
  min_order: number;
  rating: number;
  delivery_available: boolean;
  status: "active" | "pending" | "suspended";
};

const EMPTY: FormState = {
  name: "",
  category: "grocery",
  description: "",
  logo_url: "",
  banner_url: "",
  address: "",
  phone: "",
  opening_hours: "",
  latitude: "",
  longitude: "",
  delivery_minutes: 30,
  min_order: 0,
  rating: 4.5,
  delivery_available: true,
  status: "active",
};

const STATUS_TONE: Record<string, string> = {
  active: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  suspended: "bg-destructive/15 text-destructive",
};

function StoresPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListStores);
  const listCats = useServerFn(adminListCategories);
  const save = useServerFn(adminSaveStore);
  const remove = useServerFn(adminDeleteStore);
  const setStatus = useServerFn(adminSetStoreStatus);
  const geocode = useServerFn(geocodeAddress);

  const [form, setForm] = useState<FormState | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: () => list() as Promise<StoreRow[]>,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCats() as Promise<{ key: string; label: string; emoji: string | null }[]>,
  });

  const saveMut = useMutation({
    mutationFn: (f: FormState) =>
      save({
        data: {
          id: f.id,
          name: f.name,
          category: f.category,
          description: f.description || null,
          logo_url: f.logo_url || null,
          banner_url: f.banner_url || null,
          address: f.address || null,
          phone: f.phone || null,
          opening_hours: f.opening_hours || null,
          latitude: f.latitude ? Number(f.latitude) : null,
          longitude: f.longitude ? Number(f.longitude) : null,
          delivery_minutes: Number(f.delivery_minutes) || 30,
          min_order: Number(f.min_order) || 0,
          rating: Number(f.rating) || 0,
          delivery_available: f.delivery_available,
          is_active: f.status === "active",
          status: f.status,
        },
      }),
    onSuccess: () => {
      toast.success("Store saved");
      qc.invalidateQueries({ queryKey: ["admin-stores"] });
      qc.invalidateQueries({ queryKey: ["stores"] });
      setForm(null);
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Store deleted");
      qc.invalidateQueries({ queryKey: ["admin-stores"] });
      qc.invalidateQueries({ queryKey: ["stores"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "active" | "pending" | "suspended" }) =>
      setStatus({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-stores"] });
      qc.invalidateQueries({ queryKey: ["stores"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  async function runGeocode() {
    if (!form?.address) return;
    setGeocoding(true);
    try {
      const r = await geocode({ data: { address: form.address } });
      setForm({
        ...form,
        latitude: String(r.latitude),
        longitude: String(r.longitude),
      });
      toast.success("Coordinates set from address");
    } catch (e) {
      toast.error(userErrorMessage(e));
    } finally {
      setGeocoding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="text-sm text-muted-foreground">
            Add, verify, suspend or remove marketplace stores.
          </p>
        </div>
        <Button onClick={() => setForm({ ...EMPTY })}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stores.map((s) => (
            <div
              key={s.id}
              className="flex flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-bold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.category}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    STATUS_TONE[s.status] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {s.address && (
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {s.address}
                  </p>
                )}
                <p className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> {s.rating}
                  </span>
                  <span>{s.delivery_minutes} min</span>
                  <span>{s.delivery_available ? "Delivers" : "No delivery"}</span>
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      id: s.id,
                      name: s.name,
                      category: s.category,
                      description: s.description ?? "",
                      logo_url: s.logo_url ?? "",
                      banner_url: s.banner_url ?? "",
                      address: s.address ?? "",
                      phone: s.phone ?? "",
                      opening_hours: s.opening_hours ?? "",
                      latitude: s.latitude != null ? String(s.latitude) : "",
                      longitude: s.longitude != null ? String(s.longitude) : "",
                      delivery_minutes: s.delivery_minutes,
                      min_order: s.min_order,
                      rating: s.rating,
                      delivery_available: s.delivery_available,
                      status: (s.status as FormState["status"]) ?? "active",
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                {s.status !== "active" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => statusMut.mutate({ id: s.id, status: "active" })}
                  >
                    Verify
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => statusMut.mutate({ id: s.id, status: "suspended" })}
                  >
                    Suspend
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Delete "${s.name}"?`)) delMut.mutate(s.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {stores.length === 0 && (
            <p className="col-span-full py-10 text-center text-muted-foreground">No stores yet.</p>
          )}
        </div>
      )}

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit store" : "New store"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Store name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.emoji} {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ImageUpload
                  label="Store Logo Upload"
                  bucket="store-logos"
                  value={form.logo_url}
                  onChange={(logo_url) => setForm({ ...form, logo_url })}
                />
                <ImageUpload
                  label="Store Banner Upload"
                  bucket="store-banners"
                  value={form.banner_url}
                  onChange={(banner_url) => setForm({ ...form, banner_url })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Address</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 Market Rd, City"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={geocoding || !form.address}
                    onClick={runGeocode}
                  >
                    {geocoding ? "…" : "Locate"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Latitude</Label>
                  <Input
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Longitude</Label>
                  <Input
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Contact phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Opening hours</Label>
                  <Input
                    value={form.opening_hours}
                    onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
                    placeholder="9am – 9pm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Delivery (min)</Label>
                  <Input
                    type="number"
                    value={form.delivery_minutes}
                    onChange={(e) => setForm({ ...form, delivery_minutes: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Min order</Label>
                  <Input
                    type="number"
                    value={form.min_order}
                    onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
                  <span className="text-sm font-medium">Delivery</span>
                  <Switch
                    checked={form.delivery_available}
                    onCheckedChange={(v) => setForm({ ...form, delivery_available: v })}
                  />
                </div>
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button
              disabled={saveMut.isPending || !form?.name}
              onClick={() => form && saveMut.mutate(form)}
            >
              {saveMut.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
