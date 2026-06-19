import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, x as getSupportSettings, e as getHomeBanners, f as getPaymentSettings, y as adminSaveSupportSettings, z as adminSaveHomeBanners, A as adminSavePaymentSettings } from "./router-B7ppZeuD.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { I as ImageUpload } from "./ImageUpload-WFA-txI8.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { I as Input } from "./input-BJtaFeMi.mjs";
import { L as Label } from "./label-BDTFhyHh.mjs";
import { S as Switch } from "./switch-Cfwr8GBY.mjs";
import { T as Textarea } from "./textarea-BkQV2irW.mjs";
import "../_libs/seroval.mjs";
import { s as Plus, r as Trash2 } from "../_libs/lucide-react.mjs";
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
function SettingsPage() {
  const qc = useQueryClient();
  const getSettings = useServerFn(getSupportSettings);
  const getBanners = useServerFn(getHomeBanners);
  const getPayments = useServerFn(getPaymentSettings);
  const saveSettings = useServerFn(adminSaveSupportSettings);
  const saveBanners = useServerFn(adminSaveHomeBanners);
  const savePayments = useServerFn(adminSavePaymentSettings);
  const [phone, setPhone] = reactExports.useState("");
  const [whatsapp, setWhatsapp] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [codEnabled, setCodEnabled] = reactExports.useState(true);
  const [onlineEnabled, setOnlineEnabled] = reactExports.useState(false);
  const [upiId, setUpiId] = reactExports.useState("");
  const [payeeName, setPayeeName] = reactExports.useState("TownKart");
  const [paymentInstructions, setPaymentInstructions] = reactExports.useState("");
  const [banners, setBanners] = reactExports.useState([]);
  const {
    data
  } = useQuery({
    queryKey: ["support-settings"],
    queryFn: () => getSettings()
  });
  const {
    data: bannerData
  } = useQuery({
    queryKey: ["home-banners"],
    queryFn: () => getBanners()
  });
  const {
    data: paymentData
  } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => getPayments()
  });
  reactExports.useEffect(() => {
    if (!data) return;
    setPhone(data.phone);
    setWhatsapp(data.whatsapp);
    setEmail(data.email);
  }, [data]);
  reactExports.useEffect(() => {
    if (!bannerData) return;
    setBanners(bannerData.slice().sort((a, b) => a.sort_order - b.sort_order).map((banner, index) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      image_url: banner.image_url ?? "",
      is_enabled: banner.is_enabled,
      sort_order: banner.sort_order ?? index + 1
    })));
  }, [bannerData]);
  reactExports.useEffect(() => {
    if (!paymentData) return;
    setCodEnabled(paymentData.cod_enabled);
    setOnlineEnabled(paymentData.online_enabled);
    setUpiId(paymentData.upi_id ?? "");
    setPayeeName(paymentData.payee_name ?? "TownKart");
    setPaymentInstructions(paymentData.instructions ?? "");
  }, [paymentData]);
  const save = useMutation({
    mutationFn: () => saveSettings({
      data: {
        phone,
        whatsapp,
        email
      }
    }),
    onSuccess: () => {
      toast.success("Support settings saved");
      qc.invalidateQueries({
        queryKey: ["support-settings"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  const saveHomeBanners = useMutation({
    mutationFn: () => saveBanners({
      data: {
        banners: banners.map((banner, index) => ({
          ...banner,
          sort_order: index + 1,
          subtitle: banner.subtitle || null,
          image_url: banner.image_url || null
        }))
      }
    }),
    onSuccess: () => {
      toast.success("Home banners saved");
      qc.invalidateQueries({
        queryKey: ["home-banners"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  const savePaymentSettings = useMutation({
    mutationFn: () => savePayments({
      data: {
        cod_enabled: codEnabled,
        online_enabled: onlineEnabled,
        upi_id: upiId || null,
        payee_name: payeeName || "TownKart",
        instructions: paymentInstructions || null
      }
    }),
    onSuccess: () => {
      toast.success("Payment settings saved");
      qc.invalidateQueries({
        queryKey: ["payment-settings"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e))
  });
  function addBanner() {
    setBanners((current) => [...current, {
      id: crypto.randomUUID(),
      title: "Fresh offers from TownKart",
      subtitle: "Nehtaur's First Online Kart",
      image_url: "",
      is_enabled: true,
      sort_order: current.length + 1
    }]);
  }
  function updateBanner(index, patch) {
    setBanners((current) => current.map((banner, currentIndex) => currentIndex === index ? {
      ...banner,
      ...patch
    } : banner));
  }
  function removeBanner(index) {
    setBanners((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage inquiry contact details shown on every page." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Call number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "WhatsApp number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: whatsapp, onChange: (e) => setWhatsapp(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Support email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: email, onChange: (e) => setEmail(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending, onClick: () => save.mutate(), children: save.isPending ? "Saving..." : "Save settings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Payment settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enable COD or online UPI payment options shown on the cart page." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center justify-between gap-3 rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cash on delivery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: codEnabled, onCheckedChange: setCodEnabled })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center justify-between gap-3 rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Online payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: onlineEnabled, onCheckedChange: setOnlineEnabled })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UPI ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: upiId, onChange: (e) => setUpiId(e.target.value), placeholder: "townkart@upi" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payee name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: payeeName, onChange: (e) => setPayeeName(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer instructions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: paymentInstructions, onChange: (e) => setPaymentInstructions(e.target.value), placeholder: "Pay online and enter your UTR/reference number before placing the order.", rows: 3 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: savePaymentSettings.isPending, onClick: () => savePaymentSettings.mutate(), children: savePaymentSettings.isPending ? "Saving..." : "Save payment settings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Home moving banners" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Add image banners that rotate after the default TownKart banner." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: addBanner, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Add banner"
        ] })
      ] }),
      banners.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground", children: "No extra banners yet. The default TownKart banner will still show." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: banners.map((banner, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border border-border p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold", children: [
            "Banner ",
            index + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: banner.is_enabled, onCheckedChange: (is_enabled) => updateBanner(index, {
                is_enabled
              }) }),
              "Active"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "ghost", onClick: () => removeBanner(index), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
              "Delete"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr_1.2fr]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ImageUpload, { label: "Banner image", bucket: "marketplace-banners", value: banner.image_url, onChange: (image_url) => updateBanner(index, {
            image_url
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: banner.title, onChange: (e) => updateBanner(index, {
                title: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tagline" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: banner.subtitle, onChange: (e) => updateBanner(index, {
                subtitle: e.target.value
              }), placeholder: "Nehtaur's First Online Kart" })
            ] })
          ] })
        ] })
      ] }, banner.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saveHomeBanners.isPending, onClick: () => saveHomeBanners.mutate(), children: saveHomeBanners.isPending ? "Saving..." : "Save banners" })
    ] })
  ] });
}
export {
  SettingsPage as component
};
