import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, k as getCallOrderSettings } from "./router-B7ppZeuD.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-ExHJkZ2L.mjs";
import { P as Phone, M as MessageCircle } from "../_libs/lucide-react.mjs";
function onlyDigits(value) {
  return value.replace(/\D/g, "");
}
function indianPhone(value) {
  const digits = onlyDigits(value);
  if (digits.length === 10) return `91${digits}`;
  return digits;
}
function CallToOrder({
  className,
  variant = "default"
}) {
  const fetchSettings = useServerFn(getCallOrderSettings);
  const [open, setOpen] = reactExports.useState(false);
  const { data } = useQuery({
    queryKey: ["call-order-settings"],
    queryFn: () => fetchSettings()
  });
  if (!data?.is_enabled) return null;
  const primary = data.primary_phone || data.secondary_phone || data.whatsapp_number;
  if (!primary) return null;
  const callNumber = indianPhone(primary);
  const whatsAppNumber = indianPhone(data.whatsapp_number || primary);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant, className, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
      "Call to Order"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Call to Order" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-secondary p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Phone number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-extrabold", children: primary }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
            data.available_from,
            " - ",
            data.available_to
          ] })
        ] }),
        data.instructions && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: data.instructions }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:+${callNumber}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
            "Call Now"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `https://wa.me/${whatsAppNumber}`, target: "_blank", rel: "noreferrer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
            "WhatsApp Order"
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  CallToOrder as C
};
