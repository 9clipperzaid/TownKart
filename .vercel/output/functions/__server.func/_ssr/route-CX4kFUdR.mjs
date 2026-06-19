import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useRouterState, O as Outlet, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { R as Route$p, u as useServerFn, g as getPendingGooglePhone, c as clearPendingGooglePhone } from "./router-B7ppZeuD.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { L as Logo } from "./Logo-DRVZe_Sz.mjs";
import { c as cn } from "./utils-7zHHmOyJ.mjs";
import { s as syncGoogleLoginProfile } from "./auth.functions-DWe_uasj.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { H as House, b as MapPin, C as ClipboardList, S as ShoppingCart, U as User } from "../_libs/lucide-react.mjs";
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
const TABS = [{
  to: "/home",
  label: "Home",
  icon: House
}, {
  to: "/nearby",
  label: "Nearby",
  icon: MapPin
}, {
  to: "/orders",
  label: "Orders",
  icon: ClipboardList
}, {
  to: "/cart",
  label: "Cart",
  icon: ShoppingCart
}, {
  to: "/profile",
  label: "Account",
  icon: User
}];
function CustomerShell() {
  const {
    user
  } = Route$p.useRouteContext();
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const queryClient = useQueryClient();
  const syncProfile = useServerFn(syncGoogleLoginProfile);
  const isAdminArea = pathname.startsWith("/admin");
  reactExports.useEffect(() => {
    const provider = user.app_metadata.provider;
    const hasGoogleIdentity = user.identities?.some((identity) => identity.provider === "google");
    if (provider !== "google" && !hasGoogleIdentity) return;
    const pendingPhone = getPendingGooglePhone();
    void syncProfile({
      data: {
        phone: pendingPhone
      }
    }).then((result) => {
      if (result.phoneSaved || result.reason !== "phone_in_use") {
        clearPendingGooglePhone();
      }
    }).catch((error) => {
      console.error("[Auth] Failed to sync authenticated profile", error);
    }).finally(() => {
      queryClient.invalidateQueries({
        queryKey: ["profile"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-users"]
      });
    });
  }, [queryClient, syncProfile, user]);
  const {
    data: cartCount = 0
  } = useQuery({
    queryKey: ["cart-count"],
    enabled: !isAdminArea,
    queryFn: async () => {
      const {
        count
      } = await supabase.from("cart_items").select("*", {
        count: "exact",
        head: true
      });
      return count ?? 0;
    }
  });
  const {
    data: address
  } = useQuery({
    queryKey: ["my-address"],
    enabled: !isAdminArea,
    queryFn: async () => {
      const {
        data
      } = await supabase.from("profiles").select("address").maybeSingle();
      return data?.address ?? null;
    }
  });
  if (isAdminArea) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex min-h-screen max-w-md flex-col bg-background lg:max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-20 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-md items-center justify-between gap-4 lg:max-w-5xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden flex-1 items-center justify-center gap-1 lg:flex", children: TABS.map((tab) => {
        const active = pathname === tab.to || pathname.startsWith(tab.to + "/");
        const Icon = tab.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: tab.to, className: cn("relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
            tab.to === "/cart" && cartCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-accent-gradient absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-accent-foreground", children: cartCount })
          ] }),
          tab.label
        ] }, tab.to);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/profile", className: "flex max-w-[55%] items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground lg:max-w-[220px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 shrink-0 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: address ? address : "Set delivery address" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border/60 bg-background/95 backdrop-blur-md lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid grid-cols-5", children: TABS.map((tab) => {
      const active = pathname === tab.to || pathname.startsWith(tab.to + "/");
      const Icon = tab.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: tab.to, className: cn("relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }),
          tab.to === "/cart" && cartCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-accent-gradient absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-accent-foreground", children: cartCount })
        ] }),
        tab.label
      ] }) }, tab.to);
    }) }) })
  ] });
}
async function signOutClean(queryClient, navigate) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
  navigate({
    to: "/auth/login",
    replace: true
  });
}
export {
  CustomerShell as component,
  signOutClean
};
