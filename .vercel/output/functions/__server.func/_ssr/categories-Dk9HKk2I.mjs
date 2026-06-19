import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, r as adminListCategories, K as adminSaveCategory, L as adminDeleteCategory } from "./router-B7ppZeuD.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { I as Input } from "./input-BJtaFeMi.mjs";
import { L as Label } from "./label-BDTFhyHh.mjs";
import { T as Textarea } from "./textarea-BkQV2irW.mjs";
import { S as Switch } from "./switch-Cfwr8GBY.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-ExHJkZ2L.mjs";
import "../_libs/seroval.mjs";
import { s as Plus, O as Pencil, r as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./server-CR4UkH38.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-v_CxfV_5.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./client-Cevw5FM9.mjs";
import "../_libs/zod.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
const EMPTY = {
  key: "",
  label: "",
  emoji: "",
  image_url: "",
  description: "",
  sort_order: 0,
  is_enabled: true
};
function CategoriesPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListCategories);
  const save = useServerFn(adminSaveCategory);
  const remove = useServerFn(adminDeleteCategory);
  const [form, setForm] = reactExports.useState(null);
  const {
    data: categories = [],
    isLoading
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => list()
  });
  const saveMut = useMutation({
    mutationFn: (f) => save({
      data: {
        id: f.id,
        key: f.key,
        label: f.label,
        emoji: f.emoji || null,
        image_url: f.image_url || null,
        description: f.description || null,
        sort_order: Number(f.sort_order) || 0,
        is_enabled: f.is_enabled
      }
    }),
    onSuccess: () => {
      toast.success("Category saved");
      qc.invalidateQueries({
        queryKey: ["admin-categories"]
      });
      qc.invalidateQueries({
        queryKey: ["categories"]
      });
      setForm(null);
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  const delMut = useMutation({
    mutationFn: (id) => remove({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Category deleted");
      qc.invalidateQueries({
        queryKey: ["admin-categories"]
      });
      qc.invalidateQueries({
        queryKey: ["categories"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Categories" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Shown to customers across the marketplace." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setForm({
        ...EMPTY
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 animate-pulse rounded-xl bg-muted" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-border/60 bg-muted/40 text-left text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "hidden px-4 py-3 sm:table-cell", children: "Slug" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "hidden px-4 py-3 sm:table-cell", children: "Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/40 last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.emoji }),
              c.label
            ] }),
            c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 max-w-xs truncate text-xs text-muted-foreground", children: c.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "hidden px-4 py-3 text-muted-foreground sm:table-cell", children: c.key }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "hidden px-4 py-3 sm:table-cell", children: c.sort_order }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: c.is_enabled ? "rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success" : "rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground", children: c.is_enabled ? "Enabled" : "Disabled" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setForm({
              id: c.id,
              key: c.key,
              label: c.label,
              emoji: c.emoji ?? "",
              image_url: c.image_url ?? "",
              description: c.description ?? "",
              sort_order: c.sort_order,
              is_enabled: c.is_enabled
            }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
              if (confirm(`Delete "${c.label}"?`)) delMut.mutate(c.id);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, c.id)),
        categories.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-10 text-center text-muted-foreground", children: "No categories yet." }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!form, onOpenChange: (o) => !o && setForm(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: form?.id ? "Edit category" : "New category" }) }),
      form && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.label, onChange: (e) => setForm({
              ...form,
              label: e.target.value
            }), placeholder: "Grocery" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Slug" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.key, onChange: (e) => setForm({
              ...form,
              key: e.target.value.toLowerCase()
            }), placeholder: "grocery" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Emoji / Icon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.emoji, onChange: (e) => setForm({
              ...form,
              emoji: e.target.value
            }), placeholder: "🥦" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sort order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sort_order, onChange: (e) => setForm({
              ...form,
              sort_order: Number(e.target.value)
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Image URL (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.image_url, onChange: (e) => setForm({
            ...form,
            image_url: e.target.value
          }), placeholder: "https://…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.description, onChange: (e) => setForm({
            ...form,
            description: e.target.value
          }), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Enabled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.is_enabled, onCheckedChange: (v) => setForm({
            ...form,
            is_enabled: v
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setForm(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saveMut.isPending || !form?.label || !form?.key, onClick: () => form && saveMut.mutate(form), children: saveMut.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
export {
  CategoriesPage as component
};
