import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, e as getHomeBanners } from "./router-B7ppZeuD.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { c as categoryLabel, a as categoryImage } from "./categories-DO686Z4O.mjs";
import { c as cn } from "./utils-7zHHmOyJ.mjs";
import { C as CallToOrder } from "./CallToOrder-CJnrcNeZ.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { p as Search, l as Star, c as Clock, T as Truck } from "../_libs/lucide-react.mjs";
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
import "./button-DpLzXnPs.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "./dialog-ExHJkZ2L.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
const townKartHeroWatermark = "/assets/townkart-hero-watermark-Bo5oflUP.png";
function HomePage() {
  const queryClient = useQueryClient();
  const loadHomeBanners = useServerFn(getHomeBanners);
  const [active, setActive] = reactExports.useState(null);
  const [q, setQ] = reactExports.useState("");
  const [bannerIndex, setBannerIndex] = reactExports.useState(0);
  const {
    data: stores = [],
    isLoading
  } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("stores").select("*").eq("is_active", true).order("rating", {
        ascending: false
      });
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
        data,
        error
      } = await supabase.from("categories").select("key, label, emoji").eq("is_enabled", true).order("sort_order", {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });
  const {
    data: products = []
  } = useQuery({
    queryKey: ["product-search"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("products").select("store_id, name, description, category").eq("is_available", true);
      if (error) throw error;
      return data;
    }
  });
  const {
    data: adminBanners = []
  } = useQuery({
    queryKey: ["home-banners"],
    queryFn: () => loadHomeBanners()
  });
  const heroBanners = reactExports.useMemo(() => [{
    id: "default-townkart",
    title: "Groceries, food, medicines and local essentials delivered fast.",
    subtitle: "Nehtaur's First Online Kart",
    image_url: null,
    is_enabled: true,
    sort_order: 0
  }, ...adminBanners.filter((banner) => banner.is_enabled).sort((a, b) => a.sort_order - b.sort_order)], [adminBanners]);
  reactExports.useEffect(() => {
    const channel = supabase.channel("marketplace-live").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "stores"
    }, () => queryClient.invalidateQueries({
      queryKey: ["stores"]
    })).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "categories"
    }, () => queryClient.invalidateQueries({
      queryKey: ["categories"]
    })).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "products"
    }, () => queryClient.invalidateQueries({
      queryKey: ["product-search"]
    })).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  reactExports.useEffect(() => {
    const channel = supabase.channel("home-banners-live").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "marketplace_settings",
      filter: "key=eq.home_banners"
    }, () => queryClient.invalidateQueries({
      queryKey: ["home-banners"]
    })).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  reactExports.useEffect(() => {
    if (bannerIndex >= heroBanners.length) setBannerIndex(0);
  }, [bannerIndex, heroBanners.length]);
  reactExports.useEffect(() => {
    if (heroBanners.length <= 1) return void 0;
    const timer = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % heroBanners.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [heroBanners.length]);
  const query = q.trim().toLowerCase();
  const matchingProductStoreIds = new Set(query ? products.filter((p) => p.name.toLowerCase().includes(query) || (p.description ?? "").toLowerCase().includes(query) || (p.category ?? "").toLowerCase().includes(query)).map((p) => p.store_id) : []);
  const filtered = stores.filter((s) => {
    const matchesCat = !active || s.category === active;
    const matchesQ = !query || s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query) || (s.description ?? "").toLowerCase().includes(query) || matchingProductStoreIds.has(s.id);
    return matchesCat && matchesQ;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative overflow-hidden rounded-2xl bg-brand-gradient text-primary-foreground shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-[260px] p-5", children: [
      heroBanners.map((banner, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute inset-0 transition-opacity duration-700", index === bannerIndex ? "opacity-100" : "pointer-events-none opacity-0"), children: banner.image_url && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: banner.image_url, alt: banner.title, className: "h-full w-full object-cover", loading: index === 0 ? "eager" : "lazy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/45" })
      ] }) }, banner.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex min-h-[220px] flex-col justify-between", children: [
        !heroBanners[bannerIndex]?.image_url && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: townKartHeroWatermark, alt: "", className: "pointer-events-none absolute -right-10 top-1/2 hidden w-[70%] max-w-4xl -translate-y-1/2 scale-105 opacity-45 mix-blend-soft-light drop-shadow-[0_28px_60px_rgba(0,0,0,0.35)] md:block", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-bold text-white/90", children: heroBanners[bannerIndex]?.subtitle ?? "Nehtaur's First Online Kart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 max-w-lg text-2xl font-extrabold", children: heroBanners[bannerIndex]?.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: ["Fresh fruits", "Daily grocery", "Medicines", "Bakery", "Pet supplies"].map((offer) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-full bg-white/18 px-3 py-1.5 text-xs font-bold", children: offer }, offer)) })
          ] })
        ] }),
        heroBanners[bannerIndex]?.image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CallToOrder, { className: "mt-4 bg-white text-primary hover:bg-white/90" }),
          heroBanners.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex gap-1.5", children: heroBanners.map((banner, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": `Show banner ${index + 1}`, onClick: () => setBannerIndex(index), className: cn("h-1.5 rounded-full bg-white/55 transition-all", index === bannerIndex ? "w-6 bg-white" : "w-2.5") }, banner.id)) })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search TownKart stores & products", className: "h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm shadow-card outline-none ring-primary/30 focus:ring-2" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-4 pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-muted-foreground", children: "Categories" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "All", active: !active, onClick: () => setActive(null) }),
        categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `${c.emoji ?? ""} ${c.label}`.trim(), active: active === c.key, onClick: () => setActive(active === c.key ? null : c.key) }, c.key))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-4 pb-4 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: active ? categoryLabel(active) : "Popular stores" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-primary", children: [
          filtered.length,
          " available"
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 animate-pulse rounded-2xl bg-muted" }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-10 text-center text-sm text-muted-foreground", children: "No stores found." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: filtered.map((store) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/store/$storeId", params: {
        storeId: store.id
      }, className: "group overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-pop active:scale-[0.99]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: store.banner_url || store.logo_url || categoryImage(store.category), alt: store.name, loading: "lazy", width: 768, height: 512, className: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-xs font-bold text-foreground shadow-card", children: store.status === "suspended" ? "Closed" : "Open" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "line-clamp-1 font-bold", children: store.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex shrink-0 items-center gap-1 rounded-lg bg-success/15 px-1.5 py-0.5 text-xs font-bold text-success", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-current" }),
              Number(store.rating).toFixed(1)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-2 min-h-10 text-sm text-muted-foreground", children: store.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
              store.delivery_minutes,
              " min"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3.5 w-3.5" }),
              formatDelivery(store.delivery_fee)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground", children: categoryLabel(store.category) })
          ] })
        ] })
      ] }, store.id)) })
    ] })
  ] });
}
function formatDelivery(value) {
  if (!value) return "Free";
  return `Rs ${value}`;
}
function Chip({
  label,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: cn("shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-secondary-foreground"), children: label });
}
export {
  HomePage as component
};
