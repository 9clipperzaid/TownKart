import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  Tags,
  Store,
  Package,
  TrendingUp,
  Users,
  Bell,
  Rows3,
  Grid2X2,
  ScrollText,
  ClipboardList,
  Settings,
  PhoneCall,
  Menu,
  X,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { registerFcmToken } from "@/lib/fcm.functions";
import { setupFcmClient } from "@/lib/firebase";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      throw redirect({ to: "/auth/login", search: { redirectTo: "/admin" } });
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .in("role", ["admin", "super_admin"]);
    if (error || !data || data.length === 0) {
      throw redirect({ to: "/home" });
    }
    return { adminRoles: data.map((r) => r.role) };
  },
  component: AdminShell,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/call-orders", label: "Call Orders", icon: PhoneCall },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/subcategories", label: "Subcategories", icon: Grid2X2 },
  { to: "/admin/stores", label: "Stores", icon: Store },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/popular-products", label: "Product Sections", icon: Rows3 },
  { to: "/admin/category-sections", label: "Category Sections", icon: Grid2X2 },
  { to: "/admin/store-sections", label: "Store Sections", icon: Store },
  { to: "/admin/pricing", label: "Pricing", icon: TrendingUp },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

let orderAudioContext: AudioContext | null = null;
let orderAlertInterval: number | null = null;

function getOrderAudioContext() {
  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  orderAudioContext ??= new AudioContextCtor();
  return orderAudioContext;
}

function unlockOrderAlertSound() {
  const ctx = getOrderAudioContext();
  if (ctx?.state === "suspended") {
    ctx.resume().catch(() => undefined);
  }
}

function playOrderAlertSound() {
  const ctx = getOrderAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => undefined);
    return;
  }

  const now = ctx.currentTime;
  const notes = [
    { frequency: 880, start: 0, duration: 0.16 },
    { frequency: 1174.66, start: 0.18, duration: 0.2 },
  ];

  notes.forEach((note) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note.frequency, now + note.start);
    gain.gain.setValueAtTime(0.0001, now + note.start);
    gain.gain.exponentialRampToValueAtTime(0.18, now + note.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const registerFcm = useServerFn(registerFcmToken);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth/login", replace: true });
  }

  useEffect(() => {
    window.addEventListener("pointerdown", unlockOrderAlertSound, { once: true });
    window.addEventListener("keydown", unlockOrderAlertSound, { once: true });

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }

    const channel = supabase
      .channel("admin-new-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const order = payload.new as {
          id?: string;
          store_name?: string | null;
          total?: number | string | null;
        };
        const total = order.total ? ` - Rs ${Number(order.total).toFixed(0)}` : "";
        const message = `${order.store_name ?? "TownKart"}${total}`;

        startOrderAlertSound();

        toast.success("New order received", {
          description: message,
          duration: Number.POSITIVE_INFINITY,
          action: order.id
            ? {
                label: "View",
                onClick: () => {
                  stopOrderAlertSound();
                  navigate({
                    to: "/admin/orders",
                    search: { orderId: order.id },
                  });
                },
              }
            : undefined,
        });

        queryClient.invalidateQueries({ queryKey: ["operational-orders"] });
      })
      .subscribe();

    return () => {
      window.removeEventListener("pointerdown", unlockOrderAlertSound);
      window.removeEventListener("keydown", unlockOrderAlertSound);
      stopOrderAlertSound();
      supabase.removeChannel(channel);
    };
  }, [navigate, queryClient]);

  useEffect(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    async function setupPushNotifications() {
      try {
        const result = await setupFcmClient(() => undefined);
        if (!result?.token || disposed) return;

        unsubscribe = result.unsubscribe;
        await registerFcm({
          data: {
            token: result.token,
            userAgent: navigator.userAgent,
          },
        });
      } catch (error) {
        console.warn("Could not register FCM notifications", error);
      }
    }

    void setupPushNotifications();

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, [navigate, registerFcm]);

  const navList = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.to, "exact" in item ? item.exact : false);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-card"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold">Admin</span>
        <Link
          to="/home"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"
          aria-label="Back to store"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-dvh w-72 flex-col gap-4 overflow-hidden bg-background p-4 shadow-xl">
            <div className="flex shrink-0 items-center justify-between">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-2">
              {navList}
            </div>
            <button
              onClick={signOut}
              className="flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign out
            </button>
          </aside>
        </div>
      )}

      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-4 overflow-hidden border-r border-border/60 bg-background p-4 lg:flex">
          <div className="flex items-center justify-between">
            <Logo />
          </div>
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Marketplace Admin
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-2">
            {navList}
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <Link
              to="/home"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              Back to store
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
