import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, k as getCallOrderSettings, M as adminSaveCallOrderSettings } from "./router-B7ppZeuD.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { I as Input } from "./input-BJtaFeMi.mjs";
import { L as Label } from "./label-BDTFhyHh.mjs";
import { T as Textarea } from "./textarea-BkQV2irW.mjs";
import { S as Switch } from "./switch-Cfwr8GBY.mjs";
import "../_libs/seroval.mjs";
import { $ as Save, P as Phone } from "../_libs/lucide-react.mjs";
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
const EMPTY = {
  primary_phone: "",
  secondary_phone: "",
  whatsapp_number: "",
  is_enabled: true,
  available_from: "09:00",
  available_to: "21:00",
  instructions: ""
};
function CallOrdersPage() {
  const qc = useQueryClient();
  const getSettings = useServerFn(getCallOrderSettings);
  const saveSettings = useServerFn(adminSaveCallOrderSettings);
  const [form, setForm] = reactExports.useState(EMPTY);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["call-order-settings"],
    queryFn: () => getSettings()
  });
  reactExports.useEffect(() => {
    if (!data) return;
    setForm({
      primary_phone: data.primary_phone ?? "",
      secondary_phone: data.secondary_phone ?? "",
      whatsapp_number: data.whatsapp_number ?? "",
      is_enabled: data.is_enabled,
      available_from: data.available_from ?? "09:00",
      available_to: data.available_to ?? "21:00",
      instructions: data.instructions ?? ""
    });
  }, [data]);
  const save = useMutation({
    mutationFn: () => saveSettings({
      data: form
    }),
    onSuccess: () => {
      toast.success("Call order settings saved");
      qc.invalidateQueries({
        queryKey: ["call-order-settings"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Call Orders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage phone and WhatsApp ordering availability." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-80 animate-pulse rounded-xl bg-muted" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border/60 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Enable Call Ordering" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Show Call to Order buttons in the customer app." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.is_enabled, onCheckedChange: (is_enabled) => setForm({
          ...form,
          is_enabled
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Primary phone", value: form.primary_phone, onChange: (primary_phone) => setForm({
          ...form,
          primary_phone
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Secondary phone", value: form.secondary_phone, onChange: (secondary_phone) => setForm({
          ...form,
          secondary_phone
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "WhatsApp number", value: form.whatsapp_number, onChange: (whatsapp_number) => setForm({
          ...form,
          whatsapp_number
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Available from", value: form.available_from, onChange: (available_from) => setForm({
            ...form,
            available_from
          }), type: "time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Available to", value: form.available_to, onChange: (available_to) => setForm({
            ...form,
            available_to
          }), type: "time" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Call order instructions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.instructions, onChange: (e) => setForm({
          ...form,
          instructions: e.target.value
        }), rows: 4, placeholder: "Ask customers for items, quantities, address and payment preference." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending || !form.primary_phone, onClick: () => save.mutate(), children: save.isPending ? "Saving..." : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
        "Save settings"
      ] }) })
    ] }) })
  ] });
}
function Field({
  label,
  value,
  onChange,
  type = "text"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      type === "text" && /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type, value, onChange: (e) => onChange(e.target.value), className: type === "text" ? "pl-9" : "" })
    ] })
  ] });
}
export {
  CallOrdersPage as component
};
