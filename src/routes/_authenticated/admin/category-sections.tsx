import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminDeleteCategorySection,
  adminListCategories,
  adminListCategorySections,
  adminSaveCategorySection,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/category-sections")({
  component: CategorySectionsPage,
});
type Category = { id: string; label: string; emoji: string | null; image_url: string | null };
type Section = {
  id: string;
  title: string;
  display_order: number;
  rows: 1 | 2;
  is_active: boolean;
  category_section_items: { category_id: string; display_order: number }[];
};
type Draft = {
  id?: string;
  title: string;
  display_order: number;
  rows: 1 | 2;
  is_active: boolean;
  category_ids: string[];
};

function CategorySectionsPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListCategorySections);
  const listCategories = useServerFn(adminListCategories);
  const save = useServerFn(adminSaveCategorySection);
  const remove = useServerFn(adminDeleteCategorySection);
  const [draft, setDraft] = useState<Draft | null>(null);
  const { data: sections = [] } = useQuery({
    queryKey: ["admin-category-sections"],
    queryFn: () => list() as Promise<Section[]>,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCategories() as Promise<Category[]>,
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-category-sections"] });
    qc.invalidateQueries({ queryKey: ["home-category-sections"] });
  };
  const saveMut = useMutation({
    mutationFn: (data: Draft) => save({ data }),
    onSuccess: () => {
      refresh();
      setDraft(null);
      toast.success("Category section saved");
    },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast.success("Category section deleted");
    },
  });
  const move = (index: number, dir: -1 | 1) =>
    setDraft((current) => {
      if (!current) return current;
      const ids = [...current.category_ids],
        to = index + dir;
      if (to < 0 || to >= ids.length) return current;
      [ids[index], ids[to]] = [ids[to], ids[index]];
      return { ...current, category_ids: ids };
    });
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Home page</p>
          <h1 className="text-2xl font-extrabold">Category sections</h1>
          <p className="text-sm text-muted-foreground">
            Build fixed 4-column category tile sections.
          </p>
        </div>
        <Button
          onClick={() =>
            setDraft({
              title: "",
              display_order: (sections.at(-1)?.display_order ?? 0) + 1,
              rows: 2,
              is_active: true,
              category_ids: [],
            })
          }
        >
          <Plus className="h-4 w-4" />
          New section
        </Button>
      </div>
      {draft && (
        <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-card">
          <div className="flex justify-between">
            <h2 className="font-bold">{draft.id ? "Edit" : "New"} category section</h2>
            <Button size="icon" variant="ghost" onClick={() => setDraft(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Section title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <Input
              type="number"
              value={draft.display_order}
              onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })}
            />
            <label className="flex items-center gap-2">
              <Switch
                checked={draft.is_active}
                onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
              />
              Active
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              variant={draft.rows === 1 ? "default" : "outline"}
              onClick={() =>
                setDraft({ ...draft, rows: 1, category_ids: draft.category_ids.slice(0, 4) })
              }
            >
              1 row × 4
            </Button>
            <Button
              variant={draft.rows === 2 ? "default" : "outline"}
              onClick={() => setDraft({ ...draft, rows: 2 })}
            >
              2 rows × 4
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {draft.category_ids.map((id, index) => {
              const c = categories.find((x) => x.id === id);
              return c ? (
                <div key={id} className="rounded-xl border p-2 text-center">
                  <div className="text-2xl">{c.emoji || "◻"}</div>
                  <p className="truncate text-xs font-bold">{c.label}</p>
                  <div className="mt-2 flex justify-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={!index}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={index === draft.category_ids.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          category_ids: draft.category_ids.filter((x) => x !== id),
                        })
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">
              Add categories ({draft.category_ids.length}/{draft.rows * 4})
            </p>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => !draft.category_ids.includes(c.id))
                .map((c) => (
                  <Button
                    key={c.id}
                    size="sm"
                    variant="outline"
                    disabled={draft.category_ids.length >= draft.rows * 4}
                    onClick={() =>
                      setDraft({ ...draft, category_ids: [...draft.category_ids, c.id] })
                    }
                  >
                    {c.emoji} {c.label}
                  </Button>
                ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              disabled={!draft.title.trim() || saveMut.isPending}
              onClick={() => saveMut.mutate(draft)}
            >
              Save section
            </Button>
          </div>
        </section>
      )}
      <div className="space-y-3">
        {sections.map((s) => (
          <section
            key={s.id}
            className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-card"
          >
            <div className="flex-1">
              <h2 className="font-bold">{s.title}</h2>
              <p className="text-xs text-muted-foreground">
                {s.rows} row · {s.category_section_items.length} categories ·{" "}
                {s.is_active ? "Visible" : "Hidden"}
              </p>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                setDraft({
                  id: s.id,
                  title: s.title,
                  display_order: s.display_order,
                  rows: s.rows,
                  is_active: s.is_active,
                  category_ids: [...s.category_section_items]
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((i) => i.category_id),
                })
              }
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => confirm(`Delete ${s.title}?`) && delMut.mutate(s.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </section>
        ))}
      </div>
    </div>
  );
}
