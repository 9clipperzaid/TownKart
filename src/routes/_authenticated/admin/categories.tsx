import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminListCategories, adminSaveCategory, adminDeleteCategory } from "@/lib/admin.functions";
import { cn, userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

type Category = {
  id: string;
  key: string;
  label: string;
  emoji: string | null;
  icon: string | null;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  is_enabled: boolean;
};

type FormState = {
  id?: string;
  key: string;
  label: string;
  emoji: string;
  image_url: string;
  description: string;
  sort_order: number;
  is_enabled: boolean;
};

const EMPTY: FormState = {
  key: "",
  label: "",
  emoji: "",
  image_url: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

function CategoriesPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListCategories);
  const save = useServerFn(adminSaveCategory);
  const remove = useServerFn(adminDeleteCategory);

  const [form, setForm] = useState<FormState | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => list() as Promise<Category[]>,
  });

  const saveMut = useMutation({
    mutationFn: (f: FormState) =>
      save({
        data: {
          id: f.id,
          key: f.key,
          label: f.label,
          emoji: f.emoji || null,
          image_url: f.image_url || null,
          description: f.description || null,
          sort_order: Number(f.sort_order) || 0,
          is_enabled: f.is_enabled,
        },
      }),
    onSuccess: () => {
      toast.success("Category saved");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setForm(null);
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Shown to customers across the marketplace.
          </p>
        </div>
        <Button onClick={() => setForm({ ...EMPTY })}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <div className="divide-y divide-border/40 sm:hidden">
            {categories.map((c) => (
              <div key={c.id} className="p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
                      {c.emoji}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{c.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.key}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      c.is_enabled
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {c.is_enabled ? "Enabled" : "Disabled"}
                  </span>
                  <div className="flex shrink-0 items-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${c.label}`}
                      onClick={() =>
                        setForm({
                          id: c.id,
                          key: c.key,
                          label: c.label,
                          emoji: c.emoji ?? "",
                          image_url: c.image_url ?? "",
                          description: c.description ?? "",
                          sort_order: c.sort_order,
                          is_enabled: c.is_enabled,
                        })
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${c.label}`}
                      onClick={() => {
                        if (confirm(`Delete "${c.label}"?`)) delMut.mutate(c.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {c.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No categories yet.
              </p>
            )}
          </div>

          <table className="hidden w-full text-sm sm:table">
            <thead className="border-b border-border/60 bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="hidden px-4 py-3 sm:table-cell">Slug</th>
                <th className="hidden px-4 py-3 sm:table-cell">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                          {c.emoji}
                        </span>
                      )}
                      {c.label}
                    </div>
                    {c.description && (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                        {c.description}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{c.key}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.is_enabled
                          ? "rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"
                          : "rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {c.is_enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setForm({
                            id: c.id,
                            key: c.key,
                            label: c.label,
                            emoji: c.emoji ?? "",
                            image_url: c.image_url ?? "",
                            description: c.description ?? "",
                            sort_order: c.sort_order,
                            is_enabled: c.is_enabled,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Delete "${c.label}"?`)) delMut.mutate(c.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Grocery"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase() })}
                    placeholder="grocery"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Emoji / Icon</Label>
                  <Input
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    placeholder="🥦"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="hidden">
                <Label>Image URL (optional)</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <ImageUpload
                label="Category image (optional)"
                bucket="category-images"
                value={form.image_url}
                onChange={(image_url) => setForm({ ...form, image_url })}
              />
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
                <span className="text-sm font-medium">Enabled</span>
                <Switch
                  checked={form.is_enabled}
                  onCheckedChange={(v) => setForm({ ...form, is_enabled: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button
              disabled={saveMut.isPending || !form?.label || !form?.key}
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
