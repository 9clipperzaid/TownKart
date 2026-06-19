import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, q as adminListStores, r as adminListCategories, t as adminSaveStore, v as adminDeleteStore, w as adminSetStoreStatus, b as createSsrRpc } from "./router-B7ppZeuD.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as createServerFn } from "./server-CR4UkH38.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-v_CxfV_5.mjs";
import { u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { I as Input } from "./input-BJtaFeMi.mjs";
import { L as Label } from "./label-BDTFhyHh.mjs";
import { T as Textarea } from "./textarea-BkQV2irW.mjs";
import { S as Switch } from "./switch-Cfwr8GBY.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CNZ703ex.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-ExHJkZ2L.mjs";
import { I as ImageUpload } from "./ImageUpload-WFA-txI8.mjs";
import "../_libs/seroval.mjs";
import { s as Plus, b as MapPin, l as Star, O as Pencil, r as Trash2 } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
import "./client-Cevw5FM9.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
const geocodeAddress = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  address: stringType().trim().min(3).max(300)
}).parse(d)).handler(createSsrRpc("1fa8cd42fb8cf91e966958a3ac686fb89d31e677c59670df4559bc460717c1df"));
const EMPTY = {
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
  status: "active"
};
const STATUS_TONE = {
  active: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  suspended: "bg-destructive/15 text-destructive"
};
function StoresPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListStores);
  const listCats = useServerFn(adminListCategories);
  const save = useServerFn(adminSaveStore);
  const remove = useServerFn(adminDeleteStore);
  const setStatus = useServerFn(adminSetStoreStatus);
  const geocode = useServerFn(geocodeAddress);
  const [form, setForm] = reactExports.useState(null);
  const [geocoding, setGeocoding] = reactExports.useState(false);
  const {
    data: stores = [],
    isLoading
  } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: () => list()
  });
  const {
    data: categories = []
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCats()
  });
  const saveMut = useMutation({
    mutationFn: (f) => save({
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
        status: f.status
      }
    }),
    onSuccess: () => {
      toast.success("Store saved");
      qc.invalidateQueries({
        queryKey: ["admin-stores"]
      });
      qc.invalidateQueries({
        queryKey: ["stores"]
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
      toast.success("Store deleted");
      qc.invalidateQueries({
        queryKey: ["admin-stores"]
      });
      qc.invalidateQueries({
        queryKey: ["stores"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  const statusMut = useMutation({
    mutationFn: (v) => setStatus({
      data: v
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin-stores"]
      });
      qc.invalidateQueries({
        queryKey: ["stores"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  async function runGeocode() {
    if (!form?.address) return;
    setGeocoding(true);
    try {
      const r = await geocode({
        data: {
          address: form.address
        }
      });
      setForm({
        ...form,
        latitude: String(r.latitude),
        longitude: String(r.longitude)
      });
      toast.success("Coordinates set from address");
    } catch (e) {
      toast.error(userErrorMessage(e));
    } finally {
      setGeocoding(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Stores" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Add, verify, suspend or remove marketplace stores." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setForm({
        ...EMPTY
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 animate-pulse rounded-2xl bg-muted" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3", children: [
      stores.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate font-bold", children: s.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: s.category })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_TONE[s.status] ?? "bg-muted text-muted-foreground"}`, children: s.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-1 text-xs text-muted-foreground", children: [
          s.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
            " ",
            s.address
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }),
              " ",
              s.rating
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              s.delivery_minutes,
              " min"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.delivery_available ? "Delivers" : "No delivery" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setForm({
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
            status: s.status ?? "active"
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
            " Edit"
          ] }),
          s.status !== "active" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => statusMut.mutate({
            id: s.id,
            status: "active"
          }), children: "Verify" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => statusMut.mutate({
            id: s.id,
            status: "suspended"
          }), children: "Suspend" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
            if (confirm(`Delete "${s.name}"?`)) delMut.mutate(s.id);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
        ] })
      ] }, s.id)),
      stores.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-full py-10 text-center text-muted-foreground", children: "No stores yet." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!form, onOpenChange: (o) => !o && setForm(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: form?.id ? "Edit store" : "New store" }) }),
      form && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({
              ...form,
              name: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.category, onValueChange: (v) => setForm({
              ...form,
              category: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.key, children: [
                c.emoji,
                " ",
                c.label
              ] }, c.key)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.description, onChange: (e) => setForm({
            ...form,
            description: e.target.value
          }), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ImageUpload, { label: "Store Logo Upload", bucket: "store-logos", value: form.logo_url, onChange: (logo_url) => setForm({
            ...form,
            logo_url
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ImageUpload, { label: "Store Banner Upload", bucket: "store-banners", value: form.banner_url, onChange: (banner_url) => setForm({
            ...form,
            banner_url
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.address, onChange: (e) => setForm({
              ...form,
              address: e.target.value
            }), placeholder: "123 Market Rd, City" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", disabled: geocoding || !form.address, onClick: runGeocode, children: geocoding ? "…" : "Locate" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Latitude" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.latitude, onChange: (e) => setForm({
              ...form,
              latitude: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Longitude" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.longitude, onChange: (e) => setForm({
              ...form,
              longitude: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.phone, onChange: (e) => setForm({
              ...form,
              phone: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Opening hours" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.opening_hours, onChange: (e) => setForm({
              ...form,
              opening_hours: e.target.value
            }), placeholder: "9am – 9pm" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery (min)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.delivery_minutes, onChange: (e) => setForm({
              ...form,
              delivery_minutes: Number(e.target.value)
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Min order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.min_order, onChange: (e) => setForm({
              ...form,
              min_order: Number(e.target.value)
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rating" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.rating, onChange: (e) => setForm({
              ...form,
              rating: Number(e.target.value)
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.delivery_available, onCheckedChange: (v) => setForm({
              ...form,
              delivery_available: v
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm({
              ...form,
              status: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suspended", children: "Suspended" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setForm(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saveMut.isPending || !form?.name, onClick: () => form && saveMut.mutate(form), children: saveMut.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
export {
  StoresPage as component
};
