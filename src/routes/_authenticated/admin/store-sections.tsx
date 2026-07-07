import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminDeleteStoreSection,
  adminListStores,
  adminListStoreSections,
  adminSaveStoreSection,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/store-sections")({
  component: StoreSectionsPage,
});

type Store = { id: string; name: string; logo_url: string | null; status: string };
type Section = {
  id: string;
  title: string;
  display_order: number;
  is_active: boolean;
  store_ids: string[];
};
type Draft = Omit<Section, "id"> & { id?: string };

function StoreSectionsPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListStoreSections);
  const listStores = useServerFn(adminListStores);
  const save = useServerFn(adminSaveStoreSection);
  const remove = useServerFn(adminDeleteStoreSection);
  const [draft, setDraft] = useState<Draft | null>(null);
  const { data: sections = [] } = useQuery({
    queryKey: ["admin-store-sections"],
    queryFn: () => list() as Promise<Section[]>,
  });
  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores", "store-sections"],
    queryFn: () => listStores() as Promise<Store[]>,
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-store-sections"] });
    qc.invalidateQueries({ queryKey: ["home-store-sections"] });
  };
  const saveMut = useMutation({
    mutationFn: (data: Draft) => save({ data }),
    onSuccess: () => {
      refresh();
      setDraft(null);
      toast.success("Store section saved");
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast.success("Store section deleted");
    },
  });
  const move = (index: number, direction: -1 | 1) => {
    if (!draft) return;
    const storeIds = [...draft.store_ids];
    const target = index + direction;
    if (target < 0 || target >= storeIds.length) return;
    [storeIds[index], storeIds[target]] = [storeIds[target], storeIds[index]];
    setDraft({ ...draft, store_ids: storeIds });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Home page</p>
          <h1 className="text-2xl font-extrabold">Store sections</h1>
          <p className="text-sm text-muted-foreground">
            Create custom sections containing stores only.
          </p>
        </div>
        <Button
          onClick={() =>
            setDraft({
              title: "",
              display_order: (sections.at(-1)?.display_order ?? 0) + 1,
              is_active: true,
              store_ids: [],
            })
          }
        >
          <Plus className="h-4 w-4" /> New section
        </Button>
      </div>

      {draft && (
        <section className="space-y-4 rounded-2xl border border-primary/25 bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{draft.id ? "Edit" : "New"} store section</h2>
            <Button size="icon" variant="ghost" onClick={() => setDraft(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-sm font-medium">
              <span>Section title</span>
              <Input
                placeholder="Featured stores"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
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
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm font-medium">
              <Switch
                checked={draft.is_active}
                onCheckedChange={(is_active) => setDraft({ ...draft, is_active })}
              />
              Visible on home
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold">Selected stores ({draft.store_ids.length}/20)</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {draft.store_ids.map((id, index) => {
                const store = stores.find((item) => item.id === id);
                if (!store) return null;
                return (
                  <div key={id} className="flex items-center gap-2 rounded-xl border p-2">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-secondary">
                      {store.logo_url && (
                        <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{store.name}</span>
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
                      disabled={index === draft.store_ids.length - 1}
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
                          store_ids: draft.store_ids.filter((item) => item !== id),
                        })
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold">Add stores</p>
            <div className="flex flex-wrap gap-2">
              {stores
                .filter((store) => store.status === "active" && !draft.store_ids.includes(store.id))
                .map((store) => (
                  <Button
                    key={store.id}
                    size="sm"
                    variant="outline"
                    disabled={draft.store_ids.length >= 20}
                    onClick={() =>
                      setDraft({ ...draft, store_ids: [...draft.store_ids, store.id] })
                    }
                  >
                    <Plus className="h-3 w-3" /> {store.name}
                  </Button>
                ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              disabled={!draft.title.trim() || !draft.store_ids.length || saveMut.isPending}
              onClick={() => saveMut.mutate(draft)}
            >
              Save section
            </Button>
          </div>
        </section>
      )}

      <div className="space-y-3">
        {sections.map((section) => (
          <section
            key={section.id}
            className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-card"
          >
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-bold">{section.title}</h2>
              <p className="text-xs text-muted-foreground">
                {section.store_ids.length} stores · position {section.display_order} ·{" "}
                {section.is_active ? "Visible" : "Hidden"}
              </p>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setDraft({ ...section, store_ids: [...section.store_ids] })}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => confirm(`Delete ${section.title}?`) && deleteMut.mutate(section.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </section>
        ))}
      </div>
    </div>
  );
}
