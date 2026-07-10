import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ListTree, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminDeleteSubcategory,
  adminListCategories,
  adminListSubcategories,
  adminSaveSubcategory,
  adminDeleteSubcategoryProductSection,
  adminListSubcategoryProductSections,
  adminSaveSubcategoryProductSection,
} from "@/lib/admin.functions";
import { userErrorMessage } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/subcategories")({
  component: SubcategoriesPage,
});

type Category = { id: string; key: string; label: string };
type Subcategory = {
  id: string;
  category_id: string;
  key: string;
  label: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  is_enabled: boolean;
  categories: Category | null;
};
type Draft = {
  id?: string;
  category_id: string;
  key: string;
  label: string;
  image_url: string;
  description: string;
  sort_order: number;
  is_enabled: boolean;
};
type ProductSection = {
  id: string;
  subcategory_id: string;
  name: string;
  sort_order: number;
  is_enabled: boolean;
};
type SectionDraft = Omit<ProductSection, "id"> & { id?: string };

function SubcategoriesPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListSubcategories);
  const listCategories = useServerFn(adminListCategories);
  const save = useServerFn(adminSaveSubcategory);
  const remove = useServerFn(adminDeleteSubcategory);
  const listSections = useServerFn(adminListSubcategoryProductSections);
  const saveSection = useServerFn(adminSaveSubcategoryProductSection);
  const removeSection = useServerFn(adminDeleteSubcategoryProductSection);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [sectionOwner, setSectionOwner] = useState<Subcategory | null>(null);
  const [sectionDraft, setSectionDraft] = useState<SectionDraft | null>(null);
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCategories() as Promise<Category[]>,
  });
  const { data: subcategories = [], isLoading } = useQuery({
    queryKey: ["admin-subcategories"],
    queryFn: () => list() as Promise<Subcategory[]>,
  });
  const { data: productSections = [] } = useQuery({
    queryKey: ["admin-subcategory-product-sections"],
    queryFn: () => listSections() as Promise<ProductSection[]>,
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-subcategories"] });
    qc.invalidateQueries({ queryKey: ["subcategories"] });
  };
  const saveMut = useMutation({
    mutationFn: (value: Draft) => save({ data: value }),
    onSuccess: () => {
      refresh();
      setDraft(null);
      toast.success("Subcategory saved");
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not save subcategory")),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast.success("Subcategory deleted");
    },
  });
  const refreshSections = () =>
    qc.invalidateQueries({ queryKey: ["admin-subcategory-product-sections"] });
  const saveSectionMut = useMutation({
    mutationFn: (value: SectionDraft) => saveSection({ data: value }),
    onSuccess: () => {
      refreshSections();
      setSectionDraft(null);
      toast.success("Section saved");
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not save section")),
  });
  const deleteSectionMut = useMutation({
    mutationFn: (id: string) => removeSection({ data: { id } }),
    onSuccess: () => {
      refreshSections();
      toast.success("Section deleted");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Subcategories</h1>
          <p className="text-sm text-muted-foreground">
            Create tiles like Atta, Rice & Dal or Drinks & Juices.
          </p>
        </div>
        <Button
          disabled={!categories.length}
          onClick={() =>
            setDraft({
              category_id: categories[0]?.id ?? "",
              key: "",
              label: "",
              image_url: "",
              description: "",
              sort_order: subcategories.length,
              is_enabled: true,
            })
          }
        >
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {subcategories.map((subcategory) => (
          <article
            key={subcategory.id}
            className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-card"
          >
            {subcategory.image_url ? (
              <img
                src={subcategory.image_url}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs">
                No image
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-bold">{subcategory.label}</h2>
              <p className="truncate text-xs text-muted-foreground">
                {subcategory.categories?.label} · {subcategory.key}
              </p>
              <p className="mt-1 text-xs">{subcategory.is_enabled ? "Visible" : "Hidden"}</p>
            </div>
            <div className="flex shrink-0 flex-col">
              <Button
                size="icon"
                variant="ghost"
                title="Manage product sections"
                onClick={() => setSectionOwner(subcategory)}
              >
                <ListTree className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  setDraft({
                    id: subcategory.id,
                    category_id: subcategory.category_id,
                    key: subcategory.key,
                    label: subcategory.label,
                    image_url: subcategory.image_url ?? "",
                    description: subcategory.description ?? "",
                    sort_order: subcategory.sort_order,
                    is_enabled: subcategory.is_enabled,
                  })
                }
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  confirm(`Delete ${subcategory.label}?`) && deleteMut.mutate(subcategory.id)
                }
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </article>
        ))}
        {!isLoading && !subcategories.length && (
          <p className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
            No subcategories yet. Tap New to create the first one.
          </p>
        )}
      </div>

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit" : "New"} subcategory</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Parent category</Label>
                <Select
                  value={draft.category_id}
                  onValueChange={(category_id) => setDraft({ ...draft, category_id })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={draft.label}
                    onChange={(event) => setDraft({ ...draft, label: event.target.value })}
                    placeholder="Atta, Rice & Dal"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input
                    value={draft.key}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        key: event.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                    placeholder="atta-rice-dal"
                  />
                </div>
              </div>
              <ImageUpload
                label="Subcategory image"
                bucket="category-images"
                value={draft.image_url}
                onChange={(image_url) => setDraft({ ...draft, image_url })}
              />
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={draft.sort_order}
                    onChange={(event) =>
                      setDraft({ ...draft, sort_order: Number(event.target.value) })
                    }
                  />
                </div>
                <label className="flex items-center justify-between rounded-xl border px-3">
                  <span>Visible</span>
                  <Switch
                    checked={draft.is_enabled}
                    onCheckedChange={(is_enabled) => setDraft({ ...draft, is_enabled })}
                  />
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              disabled={!draft?.label.trim() || !draft?.key.trim() || saveMut.isPending}
              onClick={() => draft && saveMut.mutate(draft)}
            >
              {saveMut.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sectionOwner} onOpenChange={(open) => !open && setSectionOwner(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{sectionOwner?.label}: product sections</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Add headings such as Vegetables and Fruits. Their order controls the customer page.
          </p>
          <div className="space-y-2">
            {productSections
              .filter((section) => section.subcategory_id === sectionOwner?.id)
              .map((section) => (
                <div key={section.id} className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{section.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Order {section.sort_order} · {section.is_enabled ? "Visible" : "Hidden"}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setSectionDraft(section)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      confirm(`Delete ${section.name}? Products will remain in the subcategory.`) &&
                      deleteSectionMut.mutate(section.id)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
          </div>
          {sectionDraft ? (
            <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
              <div className="space-y-1.5">
                <Label>Section name</Label>
                <Input
                  value={sectionDraft.name}
                  onChange={(event) =>
                    setSectionDraft({ ...sectionDraft, name: event.target.value })
                  }
                  placeholder="Vegetables"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    min={0}
                    value={sectionDraft.sort_order}
                    onChange={(event) =>
                      setSectionDraft({ ...sectionDraft, sort_order: Number(event.target.value) })
                    }
                  />
                </div>
                <label className="flex items-center justify-between rounded-xl border px-3">
                  <span>Visible</span>
                  <Switch
                    checked={sectionDraft.is_enabled}
                    onCheckedChange={(is_enabled) =>
                      setSectionDraft({ ...sectionDraft, is_enabled })
                    }
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSectionDraft(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={!sectionDraft.name.trim() || saveSectionMut.isPending}
                  onClick={() => saveSectionMut.mutate(sectionDraft)}
                >
                  Save section
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                if (!sectionOwner) return;
                const count = productSections.filter(
                  (s) => s.subcategory_id === sectionOwner.id,
                ).length;
                setSectionDraft({
                  subcategory_id: sectionOwner.id,
                  name: "",
                  sort_order: count,
                  is_enabled: true,
                });
              }}
            >
              <Plus className="h-4 w-4" /> Add section
            </Button>
          )}
          <DialogFooter>
            <Button onClick={() => setSectionOwner(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
