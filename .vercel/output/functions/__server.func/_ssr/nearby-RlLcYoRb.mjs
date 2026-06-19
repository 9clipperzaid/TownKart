import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { d as distanceKm, l as loadGoogleMaps } from "./google-maps-BhI5Tk1E.mjs";
import { c as categoryLabel } from "./categories-DO686Z4O.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CNZ703ex.mjs";
import { k as LocateFixed, b as MapPin, N as Navigation, l as Star, c as Clock } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-7zHHmOyJ.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
const DEFAULT_CENTER = {
  lat: 19.076,
  lng: 72.8777
};
function NearbyPage() {
  const [coords, setCoords] = reactExports.useState(null);
  const [locating, setLocating] = reactExports.useState(false);
  const [maxKm, setMaxKm] = reactExports.useState("all");
  const [cat, setCat] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("distance");
  const [onlyDelivery, setOnlyDelivery] = reactExports.useState(false);
  const mapRef = reactExports.useRef(null);
  const mapObj = reactExports.useRef(null);
  const markers = reactExports.useRef([]);
  const [mapsReady, setMapsReady] = reactExports.useState(false);
  const [mapsError, setMapsError] = reactExports.useState(false);
  const {
    data: stores = []
  } = useQuery({
    queryKey: ["nearby-stores"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("stores").select("id, name, category, rating, delivery_minutes, delivery_available, address, latitude, longitude").eq("is_active", true);
      if (error) throw error;
      return data;
    }
  });
  const {
    data: categories = []
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("categories").select("key, label").eq("is_enabled", true).order("sort_order");
      return data ?? [];
    }
  });
  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      setLocating(false);
    }, () => setLocating(false), {
      enableHighAccuracy: true,
      timeout: 8e3
    });
  }
  reactExports.useEffect(() => {
    locate();
  }, []);
  const center = coords ?? DEFAULT_CENTER;
  const ranked = reactExports.useMemo(() => {
    let list = stores.filter((s) => s.latitude != null && s.longitude != null).map((s) => ({
      ...s,
      distance: distanceKm(center.lat, center.lng, s.latitude, s.longitude)
    }));
    if (cat !== "all") list = list.filter((s) => s.category === cat);
    if (onlyDelivery) list = list.filter((s) => s.delivery_available);
    if (maxKm !== "all") list = list.filter((s) => s.distance <= Number(maxKm));
    list.sort((a, b) => sort === "distance" ? a.distance - b.distance : b.rating - a.rating);
    return list;
  }, [stores, center.lat, center.lng, cat, onlyDelivery, maxKm, sort]);
  reactExports.useEffect(() => {
    loadGoogleMaps().then((maps) => {
      if (!mapRef.current) return;
      mapObj.current = new maps.Map(mapRef.current, {
        center,
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true
      });
      setMapsReady(true);
    }).catch(() => setMapsError(true));
  }, []);
  reactExports.useEffect(() => {
    if (!mapsReady || !mapObj.current || !window.google) return;
    const maps = window.google.maps;
    mapObj.current.setCenter(center);
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];
    markers.current.push(new maps.Marker({
      position: center,
      map: mapObj.current,
      title: "You",
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#2563eb",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2
      }
    }));
    ranked.forEach((s) => {
      markers.current.push(new maps.Marker({
        position: {
          lat: s.latitude,
          lng: s.longitude
        },
        map: mapObj.current,
        title: `${s.name} · ${s.distance.toFixed(1)} km`
      }));
    });
  }, [mapsReady, ranked, center.lat, center.lng]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 px-4 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Stores near you" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: coords ? "Sorted by distance from your location" : "Using a default area" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: locate, disabled: locating, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LocateFixed, { className: "h-4 w-4" }),
        locating ? "Locating…" : "My location"
      ] })
    ] }),
    !mapsError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapRef, className: "h-56 w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-card" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cat, onValueChange: setCat, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Category" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All categories" }),
          categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.key, children: c.label }, c.key))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: maxKm, onValueChange: setMaxKm, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Distance" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Any distance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "Within 2 km" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "5", children: "Within 5 km" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "10", children: "Within 10 km" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sort, onValueChange: (v) => setSort(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "distance", children: "Nearest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rating", children: "Top rated" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: onlyDelivery ? "default" : "outline", size: "sm", className: "h-9", onClick: () => setOnlyDelivery((v) => !v), children: "Delivers now" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pb-6", children: [
      ranked.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-10 text-center text-sm text-muted-foreground", children: "No stores match these filters. Add coordinates to stores in the admin panel to see them here." }),
      ranked.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/store/$storeId", params: {
        storeId: s.id
      }, className: "flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card transition-transform active:scale-[0.99]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate font-bold", children: s.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex shrink-0 items-center gap-1 text-xs font-bold text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-3 w-3" }),
              s.distance.toFixed(1),
              " km"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }),
              " ",
              s.rating
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              " ",
              s.delivery_minutes,
              " min"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground", children: categoryLabel(s.category) })
          ] })
        ] })
      ] }, s.id))
    ] })
  ] });
}
export {
  NearbyPage as component
};
