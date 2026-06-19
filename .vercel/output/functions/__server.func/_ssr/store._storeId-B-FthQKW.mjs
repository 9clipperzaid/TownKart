import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { C as CATEGORIES, a as categoryImage, c as categoryLabel } from "./categories-DO686Z4O.mjs";
import { f as formatINR } from "./format-BiGzNIcJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { I as Input } from "./input-BJtaFeMi.mjs";
import { u as userErrorMessage, c as cn } from "./utils-7zHHmOyJ.mjs";
import { C as CallToOrder } from "./CallToOrder-CJnrcNeZ.mjs";
import { j as Route$c } from "./router-B7ppZeuD.mjs";
import "../_libs/seroval.mjs";
import { A as ArrowLeft, l as Star, c as Clock, p as Search, n as Check, e as Minus, s as Plus, S as ShoppingCart } from "../_libs/lucide-react.mjs";
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
import "../_libs/tailwind-merge.mjs";
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
import "./server-CR4UkH38.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-v_CxfV_5.mjs";
import "../_libs/zod.mjs";
const TILE_GRADIENTS = ["from-primary/20 to-primary/5", "from-success/20 to-success/5", "from-secondary/40 to-secondary/10", "from-accent/30 to-accent/5"];
function StorePage() {
  const {
    storeId
  } = Route$c.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [availableOnly, setAvailableOnly] = reactExports.useState(false);
  const {
    data: store
  } = useQuery({
    queryKey: ["store", storeId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("stores").select("*").eq("id", storeId).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: products = [],
    isLoading
  } = useQuery({
    queryKey: ["products", storeId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("products").select("*").eq("store_id", storeId).order("created_at");
      if (error) throw error;
      return data;
    }
  });
  const {
    data: cart = {}
  } = useQuery({
    queryKey: ["cart-map"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("cart_items").select("product_id, quantity");
      const map = {};
      (data ?? []).forEach((r) => map[r.product_id] = r.quantity);
      return map;
    }
  });
  const setQty = useMutation({
    mutationFn: async ({
      productId,
      quantity
    }) => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      if (quantity <= 0) {
        await supabase.from("cart_items").delete().eq("product_id", productId).eq("user_id", user.id);
      } else {
        await supabase.from("cart_items").upsert({
          user_id: user.id,
          product_id: productId,
          quantity
        }, {
          onConflict: "user_id,product_id"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart-map"]
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count"]
      });
    },
    onError: (e) => toast.error(userErrorMessage(e, "Could not update cart"))
  });
  const emoji = store ? CATEGORIES[store.category]?.emoji ?? "🛍️" : "🛍️";
  const filtered = reactExports.useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (availableOnly && !p.is_available) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q);
    });
  }, [products, search, availableOnly]);
  const availableCount = products.filter((p) => p.is_available).length;
  const cartTotal = Object.values(cart).reduce((a, b) => a + b, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      store ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: categoryImage(store.category), alt: store.name, className: "h-44 w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-44 w-full animate-pulse bg-muted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "secondary", size: "icon", className: "absolute left-4 top-4 rounded-full shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/home", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mt-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card p-8 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-extrabold", children: store?.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: store?.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex items-center gap-3 text-xs", children: store && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 rounded-lg bg-success/15 px-2 py-1 font-bold text-success", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-current" }),
          store.rating
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
          store.delivery_minutes,
          " min"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground", children: categoryLabel(store.category) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CallToOrder, { className: "mt-4" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-4 pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Browse products" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: [
          availableCount,
          " of ",
          products.length,
          " in stock"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search this store…", className: "h-11 rounded-xl pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAvailableOnly(false), className: cn("rounded-full px-3.5 py-1.5 text-xs font-semibold transition", !availableOnly ? "bg-primary text-primary-foreground shadow-card" : "bg-muted text-muted-foreground"), children: "All items" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setAvailableOnly(true), className: cn("flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition", availableOnly ? "bg-success text-success-foreground shadow-card" : "bg-muted text-muted-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
          " Available now"
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52 animate-pulse rounded-2xl bg-muted" }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card p-8 text-center shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl", children: "🔍" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium text-muted-foreground", children: "No products match your search." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", children: filtered.map((p, idx) => {
        const qty = cart[p.id] ?? 0;
        const soldOut = !p.is_available;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("group flex flex-col rounded-2xl border border-border/70 bg-card p-2.5 transition", soldOut ? "opacity-70" : "hover:-translate-y-0.5 hover:shadow-pop"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-4", children: [
            p.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.image_url, alt: p.name, className: "aspect-square w-full rounded-xl object-cover", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br text-5xl", TILE_GRADIENTS[idx % TILE_GRADIENTS.length]), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: emoji }) }),
            store && !soldOut && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-background/85 px-1.5 py-0.5 text-[10px] font-bold text-foreground backdrop-blur", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 text-primary" }),
              store.delivery_minutes,
              " min"
            ] }),
            soldOut && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-1.5 top-1.5 rounded-md bg-foreground/80 px-1.5 py-0.5 text-[10px] font-bold text-background", children: "Sold out" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-3 right-1.5", children: soldOut ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-8 items-center rounded-lg border border-border bg-muted px-3 text-xs font-bold text-muted-foreground", children: "N/A" }) : qty === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQty.mutate({
              productId: p.id,
              quantity: 1
            }), className: "inline-flex h-8 items-center rounded-lg border-2 border-primary bg-background px-4 text-xs font-extrabold uppercase tracking-wide text-primary shadow-card transition active:scale-95", children: "Add" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-8 items-center gap-1 rounded-lg bg-primary px-1 text-primary-foreground shadow-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex h-7 w-6 items-center justify-center", onClick: () => setQty.mutate({
                productId: p.id,
                quantity: qty - 1
              }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-4 text-center text-xs font-bold", children: qty }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex h-7 w-6 items-center justify-center", onClick: () => setQty.mutate({
                productId: p.id,
                quantity: qty + 1
              }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground", children: p.unit }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "line-clamp-2 min-h-[2.25rem] text-sm font-semibold leading-snug", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-auto pt-1.5 text-sm font-extrabold", children: formatINR(p.price) })
        ] }, p.id);
      }) })
    ] }),
    cartTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 bottom-20 z-30 mx-auto max-w-md px-4 lg:bottom-6 lg:max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", className: "h-13 w-full justify-between text-base shadow-pop", onClick: () => navigate({
      to: "/cart"
    }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-5 w-5" }),
        cartTotal,
        " item",
        cartTotal > 1 ? "s" : "",
        " in cart"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View cart →" })
    ] }) })
  ] });
}
export {
  StorePage as component
};
