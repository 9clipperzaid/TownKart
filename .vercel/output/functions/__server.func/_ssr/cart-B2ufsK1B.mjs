import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, f as getPaymentSettings } from "./router-B7ppZeuD.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { s as secureCheckout } from "./order.functions-CfGdxtVl.mjs";
import { f as formatINR } from "./format-BiGzNIcJ.mjs";
import { l as loadGoogleMaps } from "./google-maps-BhI5Tk1E.mjs";
import { u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { T as Textarea } from "./textarea-BkQV2irW.mjs";
import { L as Label } from "./label-BDTFhyHh.mjs";
import { C as CallToOrder } from "./CallToOrder-CJnrcNeZ.mjs";
import "../_libs/seroval.mjs";
import { q as ShoppingBag, r as Trash2, e as Minus, s as Plus, k as LocateFixed, b as MapPin } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/zod.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "./dialog-ExHJkZ2L.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
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
const DELIVERY_FEE = 25;
const DEFAULT_CENTER = {
  lat: 29.323,
  lng: 78.387
};
function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkoutServer = useServerFn(secureCheckout);
  const loadPaymentSettings = useServerFn(getPaymentSettings);
  const [address, setAddress] = reactExports.useState("");
  const [addressLoaded, setAddressLoaded] = reactExports.useState(false);
  const [paymentMethod, setPaymentMethod] = reactExports.useState("cod");
  const [paymentReference, setPaymentReference] = reactExports.useState("");
  const [location, setLocation] = reactExports.useState(null);
  const [locating, setLocating] = reactExports.useState(false);
  const [mapsError, setMapsError] = reactExports.useState(false);
  const mapRef = reactExports.useRef(null);
  const mapObj = reactExports.useRef(null);
  const markerObj = reactExports.useRef(null);
  const {
    data: items = [],
    isLoading
  } = useQuery({
    queryKey: ["cart-detail"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("cart_items").select("id, quantity, product_id, products(name, price, unit, store_id, stores(name))");
      if (error) throw error;
      return data;
    }
  });
  const {
    data: paymentSettings
  } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => loadPaymentSettings()
  });
  reactExports.useEffect(() => {
    if (addressLoaded) return;
    supabase.from("profiles").select("address").maybeSingle().then(({
      data
    }) => {
      if (data?.address) setAddress(data.address);
      setAddressLoaded(true);
    });
  }, [addressLoaded]);
  const setQty = useMutation({
    mutationFn: async ({
      id,
      quantity
    }) => {
      if (quantity <= 0) {
        await supabase.from("cart_items").delete().eq("id", id);
      } else {
        await supabase.from("cart_items").update({
          quantity
        }).eq("id", id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart-detail"]
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count"]
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-map"]
      });
    }
  });
  const subtotal = items.reduce((sum, r) => sum + (r.products?.price ?? 0) * r.quantity, 0);
  const total = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;
  const upiLink = paymentSettings?.online_enabled && paymentSettings.upi_id ? `upi://pay?pa=${encodeURIComponent(paymentSettings.upi_id)}&pn=${encodeURIComponent(paymentSettings.payee_name || "TownKart")}&am=${encodeURIComponent(String(total))}&cu=INR&tn=${encodeURIComponent("TownKart order payment")}` : null;
  const checkout = useMutation({
    mutationFn: async () => {
      await checkoutServer({
        data: {
          address: address.trim(),
          deliveryLatitude: location?.lat ?? null,
          deliveryLongitude: location?.lng ?? null,
          deliveryLocationAccuracy: location?.accuracy ?? null,
          paymentMethod,
          paymentReference: paymentReference.trim() || null,
          idempotencyKey: crypto.randomUUID()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Order placed");
      navigate({
        to: "/orders"
      });
    },
    onError: (e) => toast.error(userErrorMessage(e, "Checkout failed"))
  });
  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const next = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      };
      setLocation(next);
      mapObj.current?.setCenter(next);
      markerObj.current?.setPosition(next);
      setLocating(false);
      toast.success("Delivery location selected");
    }, () => {
      setLocating(false);
      toast.error("Could not fetch your location. Please allow location access.");
    }, {
      enableHighAccuracy: true,
      timeout: 1e4
    });
  }
  reactExports.useEffect(() => {
    loadGoogleMaps().then((maps) => {
      if (!mapRef.current) return;
      const center = location ?? DEFAULT_CENTER;
      mapObj.current = new maps.Map(mapRef.current, {
        center,
        zoom: location ? 16 : 13,
        disableDefaultUI: true,
        zoomControl: true
      });
      markerObj.current = new maps.Marker({
        position: center,
        map: mapObj.current,
        draggable: true,
        title: "Delivery location"
      });
      mapObj.current.addListener("click", (event) => {
        const next = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        setLocation(next);
        markerObj.current?.setPosition(next);
      });
      markerObj.current.addListener("dragend", (event) => {
        setLocation({
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        });
      });
    }).catch(() => setMapsError(true));
  }, []);
  reactExports.useEffect(() => {
    if (!location || !mapObj.current || !markerObj.current) return;
    mapObj.current.setCenter(location);
    markerObj.current.setPosition(location);
  }, [location]);
  if (!isLoading && items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center px-6 pt-24 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-secondary flex h-20 w-20 items-center justify-center rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-9 w-9 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-xl font-bold", children: "Your cart is empty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Browse local stores and add items to get started." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/home", children: "Explore stores" }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-extrabold", children: "Your cart" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2.5", children: items.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate font-semibold", children: r.products?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: r.products?.stores?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-bold", children: formatINR((r.products?.price ?? 0) * r.quantity) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2 rounded-full bg-secondary px-1.5 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex h-7 w-7 items-center justify-center text-primary", onClick: () => setQty.mutate({
          id: r.id,
          quantity: r.quantity - 1
        }), children: r.quantity === 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-5 text-center text-sm font-bold", children: r.quantity }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex h-7 w-7 items-center justify-center text-primary", onClick: () => setQty.mutate({
          id: r.id,
          quantity: r.quantity + 1
        }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
      ] })
    ] }, r.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "addr", children: "Delivery address" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "addr", placeholder: "Flat / house no, street, landmark, area…", value: address, onChange: (e) => setAddress(e.target.value), rows: 3 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 rounded-2xl bg-card p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Delivery location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Select your exact area so the admin and delivery team can find you." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: useCurrentLocation, disabled: locating, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LocateFixed, { className: "h-4 w-4" }),
          locating ? "Locating..." : "Use my location"
        ] })
      ] }),
      !mapsError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapRef, className: "h-56 w-full overflow-hidden rounded-xl border border-border/60 bg-muted" }),
      location ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs font-semibold text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Selected: ",
          location.lat.toFixed(6),
          ", ",
          location.lng.toFixed(6)
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground", children: "Use your current location or tap the map to set the delivery pin." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl bg-card p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Subtotal", value: formatINR(subtotal) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Delivery fee", value: formatINR(DELIVERY_FEE) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-2 border-t border-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Total", value: formatINR(total), bold: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-3 rounded-2xl bg-card p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Payment method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Choose how you want to pay for this order." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: paymentMethod === "cod" ? "default" : "outline", disabled: paymentSettings?.cod_enabled === false, onClick: () => setPaymentMethod("cod"), children: "COD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: paymentMethod === "online" ? "default" : "outline", disabled: !paymentSettings?.online_enabled, onClick: () => setPaymentMethod("online"), children: "Online" })
      ] }),
      paymentMethod === "online" && paymentSettings?.online_enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl bg-secondary/70 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold", children: [
            "Pay to ",
            paymentSettings.payee_name || "TownKart"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
            "UPI ID: ",
            paymentSettings.upi_id
          ] }),
          paymentSettings.instructions && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: paymentSettings.instructions })
        ] }),
        upiLink && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, type: "button", variant: "outline", className: "w-full bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: upiLink, children: [
          "Open UPI app and pay ",
          formatINR(total)
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payment-ref", children: "UTR / payment reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "payment-ref", value: paymentReference, onChange: (e) => setPaymentReference(e.target.value), placeholder: "Paste UPI transaction ID after payment", rows: 2 })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "mt-4 h-13 w-full text-base", disabled: checkout.isPending, onClick: () => checkout.mutate(), children: checkout.isPending ? "Placing order…" : `Place order · ${formatINR(total)}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CallToOrder, { variant: "outline", className: "mt-3 w-full" })
  ] });
}
function Row({
  label,
  value,
  bold
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-between py-1 text-sm ${bold ? "font-extrabold" : "text-muted-foreground"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: bold ? "text-base text-foreground" : "", children: value })
  ] });
}
export {
  CartPage as component
};
