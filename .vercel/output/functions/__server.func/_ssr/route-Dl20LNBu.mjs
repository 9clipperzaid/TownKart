import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useRouterState, e as useNavigate, L as Link, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { L as Logo } from "./Logo-DRVZe_Sz.mjs";
import { c as cn } from "./utils-7zHHmOyJ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { i as LayoutDashboard, C as ClipboardList, t as PhoneCall, u as Tags, f as Store, g as Package, v as TrendingUp, w as Users, x as Bell, y as ScrollText, z as Settings, D as Menu, A as ArrowLeft, X, j as LogOut } from "../_libs/lucide-react.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const NAV = [{
  to: "/admin",
  label: "Dashboard",
  icon: LayoutDashboard,
  exact: true
}, {
  to: "/admin/orders",
  label: "Orders",
  icon: ClipboardList
}, {
  to: "/admin/call-orders",
  label: "Call Orders",
  icon: PhoneCall
}, {
  to: "/admin/categories",
  label: "Categories",
  icon: Tags
}, {
  to: "/admin/stores",
  label: "Stores",
  icon: Store
}, {
  to: "/admin/products",
  label: "Products",
  icon: Package
}, {
  to: "/admin/pricing",
  label: "Pricing",
  icon: TrendingUp
}, {
  to: "/admin/users",
  label: "Users",
  icon: Users
}, {
  to: "/admin/notifications",
  label: "Notifications",
  icon: Bell
}, {
  to: "/admin/audit",
  label: "Audit Log",
  icon: ScrollText
}, {
  to: "/admin/settings",
  label: "Settings",
  icon: Settings
}];
let orderAudioContext = null;
let orderAlertInterval = null;
function getOrderAudioContext() {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  orderAudioContext ??= new AudioContextCtor();
  return orderAudioContext;
}
function unlockOrderAlertSound() {
  const ctx = getOrderAudioContext();
  if (ctx?.state === "suspended") {
    ctx.resume().catch(() => void 0);
  }
}
function playOrderAlertSound() {
  const ctx = getOrderAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => void 0);
    return;
  }
  const now = ctx.currentTime;
  const notes = [{
    frequency: 880,
    start: 0,
    duration: 0.16
  }, {
    frequency: 1174.66,
    start: 0.18,
    duration: 0.2
  }];
  notes.forEach((note) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note.frequency, now + note.start);
    gain.gain.setValueAtTime(1e-4, now + note.start);
    gain.gain.exponentialRampToValueAtTime(0.18, now + note.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(1e-4, now + note.start + note.duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now + note.start);
    oscillator.stop(now + note.start + note.duration + 0.03);
  });
}
function startOrderAlertSound() {
  playOrderAlertSound();
  if (orderAlertInterval !== null) return;
  orderAlertInterval = window.setInterval(() => {
    playOrderAlertSound();
  }, 1200);
}
function stopOrderAlertSound() {
  if (orderAlertInterval === null) return;
  window.clearInterval(orderAlertInterval);
  orderAlertInterval = null;
}
function AdminShell() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const [open, setOpen] = reactExports.useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isActive = (to, exact) => exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({
      to: "/auth/login",
      replace: true
    });
  }
  reactExports.useEffect(() => {
    window.addEventListener("pointerdown", unlockOrderAlertSound, {
      once: true
    });
    window.addEventListener("keydown", unlockOrderAlertSound, {
      once: true
    });
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => void 0);
    }
    const channel = supabase.channel("admin-new-orders").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "orders"
    }, (payload) => {
      const order = payload.new;
      const total = order.total ? ` - Rs ${Number(order.total).toFixed(0)}` : "";
      const message = `${order.store_name ?? "TownKart"}${total}`;
      startOrderAlertSound();
      toast.success("New order received", {
        description: message,
        duration: Number.POSITIVE_INFINITY,
        action: order.id ? {
          label: "View",
          onClick: () => {
            stopOrderAlertSound();
            navigate({
              to: "/admin/orders",
              search: {
                orderId: order.id
              }
            });
          }
        } : void 0
      });
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New TownKart order", {
          body: message,
          icon: "/townkart-logo.png"
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["operational-orders"]
      });
    }).subscribe();
    return () => {
      window.removeEventListener("pointerdown", unlockOrderAlertSound);
      window.removeEventListener("keydown", unlockOrderAlertSound);
      stopOrderAlertSound();
      supabase.removeChannel(channel);
    };
  }, [navigate, queryClient]);
  const navList = /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col gap-1", children: NAV.map((item) => {
    const Icon = item.icon;
    const active = isActive(item.to, "exact" in item ? item.exact : false);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: item.to, onClick: () => setOpen(false), className: cn("flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors", active ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-secondary hover:text-foreground"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4.5 w-4.5" }),
      item.label
    ] }, item.to);
  }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md lg:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen(true), className: "flex h-9 w-9 items-center justify-center rounded-lg border border-border", "aria-label": "Open menu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold", children: "Admin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/home", className: "flex h-9 w-9 items-center justify-center rounded-lg border border-border", "aria-label": "Back to store", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-40 lg:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/40", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "absolute left-0 top-0 flex h-full w-72 flex-col gap-6 bg-background p-4 shadow-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen(false), className: "flex h-9 w-9 items-center justify-center rounded-lg border border-border", "aria-label": "Close menu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
        ] }),
        navList,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: signOut, className: "mt-auto flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4.5 w-4.5" }),
          "Sign out"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1400px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-border/60 bg-background p-4 lg:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-wide text-muted-foreground", children: "Marketplace Admin" }),
        navList,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/home", className: "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4.5 w-4.5" }),
            "Back to store"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: signOut, className: "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4.5 w-4.5" }),
            "Sign out"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-w-0 flex-1 p-4 lg:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] })
  ] });
}
export {
  AdminShell as component
};
