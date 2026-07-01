import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Home, ClipboardList, ShoppingCart, User, MapPin, LocateFixed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { syncGoogleLoginProfile } from "@/lib/auth.functions";
import { clearPendingGooglePhone, getPendingGooglePhone } from "@/lib/auth-profile";
import {
  getSavedDeliveryLocation,
  localCartCount,
  saveDeliveryLocation,
  syncLocalCartToSupabase,
} from "@/lib/local-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    return { user: data.user ?? null };
  },
  component: CustomerShell,
});

const TABS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/nearby", label: "Nearby", icon: MapPin },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/profile", label: "Account", icon: User },
] as const;

function CustomerShell() {
  const { user } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();
  const syncProfile = useServerFn(syncGoogleLoginProfile);
  const isAdminArea = pathname.startsWith("/admin");
  const [locationOpen, setLocationOpen] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [guestCartCount, setGuestCartCount] = useState(() => localCartCount());
  const [guestAddress, setGuestAddress] = useState(() => getSavedDeliveryLocation()?.address ?? "");

  useEffect(() => {
    if (!user) return;
    const provider = user.app_metadata.provider;
    const hasGoogleIdentity = user.identities?.some((identity) => identity.provider === "google");
    if (provider !== "google" && !hasGoogleIdentity) return;

    const pendingPhone = getPendingGooglePhone();
    void syncProfile({ data: { phone: pendingPhone } })
      .then((result) => {
        if (result.phoneSaved || result.reason !== "phone_in_use") {
          clearPendingGooglePhone();
        }
      })
      .catch((error) => {
        console.error("[Auth] Failed to sync authenticated profile", error);
      })
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      });
  }, [queryClient, syncProfile, user]);

  useEffect(() => {
    if (!user) return;
    const savedLocation = getSavedDeliveryLocation();
    if (savedLocation?.address) {
      void supabase
        .from("profiles")
        .update({ address: savedLocation.address })
        .eq("id", user.id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["my-address"] });
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        });
    }
    void syncLocalCartToSupabase(user.id).finally(() => {
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["cart-map"] });
      queryClient.invalidateQueries({ queryKey: ["cart-detail"] });
      setGuestCartCount(0);
    });
  }, [queryClient, user]);

  useEffect(() => {
    const refresh = () => {
      setGuestCartCount(localCartCount());
      setGuestAddress(getSavedDeliveryLocation()?.address ?? "");
    };
    window.addEventListener("townkart-local-cart", refresh);
    window.addEventListener("townkart-location", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("townkart-local-cart", refresh);
      window.removeEventListener("townkart-location", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart-count"],
    enabled: !isAdminArea && Boolean(user),
    queryFn: async () => {
      const { count } = await supabase
        .from("cart_items")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: address } = useQuery({
    queryKey: ["my-address"],
    enabled: !isAdminArea && Boolean(user),
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("address").maybeSingle();
      return data?.address ?? null;
    },
  });

  const visibleCartCount = user ? cartCount : guestCartCount;
  const visibleAddress = address || guestAddress;

  async function saveManualAddress() {
    const nextAddress = manualAddress.trim();
    if (nextAddress.length < 4) return;
    saveDeliveryLocation({ address: nextAddress });
    setGuestAddress(nextAddress);
    if (user) {
      await supabase.from("profiles").update({ address: nextAddress }).eq("id", user.id);
      queryClient.invalidateQueries({ queryKey: ["my-address"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
    setLocationOpen(false);
  }

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const addressLabel = `Current location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
        saveDeliveryLocation({
          address: addressLabel,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
        });
        setGuestAddress(addressLabel);
        if (user) {
          await supabase.from("profiles").update({ address: addressLabel }).eq("id", user.id);
          queryClient.invalidateQueries({ queryKey: ["my-address"] });
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
        setLocating(false);
        setLocationOpen(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 15_000 },
    );
  }

  // Admin area provides its own full-screen layout (hooks run unconditionally above).
  if (isAdminArea) {
    return <Outlet />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background lg:max-w-5xl">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4 lg:max-w-5xl">
          <Logo />
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {TABS.map((tab) => {
              const active = pathname === tab.to || pathname.startsWith(tab.to + "/");
              const Icon = tab.icon;
              const needsLogin = !user && (tab.to === "/orders" || tab.to === "/profile");
              return (
                <Link
                  key={tab.to}
                  to={needsLogin ? "/auth/login" : tab.to}
                  search={needsLogin ? { redirectTo: tab.to } : undefined}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="relative">
                    <Icon className="h-4 w-4" />
                    {tab.to === "/cart" && visibleCartCount > 0 && (
                      <span className="bg-accent-gradient absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-accent-foreground">
                        {visibleCartCount}
                      </span>
                    )}
                  </span>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => {
              setManualAddress(visibleAddress ?? "");
              setLocationOpen(true);
            }}
            className="flex max-w-[55%] items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground lg:max-w-[220px]"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">
              {visibleAddress ? visibleAddress : "Set delivery address"}
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border/60 bg-background/95 backdrop-blur-md lg:hidden">
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => {
            const active = pathname === tab.to || pathname.startsWith(tab.to + "/");
            const Icon = tab.icon;
            const needsLogin = !user && (tab.to === "/orders" || tab.to === "/profile");
            return (
              <li key={tab.to}>
                <Link
                  to={needsLogin ? "/auth/login" : tab.to}
                  search={needsLogin ? { redirectTo: tab.to } : undefined}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" />
                    {tab.to === "/cart" && visibleCartCount > 0 && (
                      <span className="bg-accent-gradient absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-accent-foreground">
                        {visibleCartCount}
                      </span>
                    )}
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Dialog open={locationOpen} onOpenChange={setLocationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Location</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-center">
            <Button type="button" disabled={locating} onClick={detectLocation}>
              <LocateFixed className="h-4 w-4" />
              {locating ? "Detecting..." : "Detect my location"}
            </Button>
            <span className="text-center text-xs font-bold text-muted-foreground">OR</span>
            <Input
              value={manualAddress}
              onChange={(event) => setManualAddress(event.target.value)}
              placeholder="search delivery location"
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveManualAddress();
              }}
            />
          </div>
          <Button type="button" variant="secondary" onClick={() => void saveManualAddress()}>
            Save location
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Shared sign-out helper used by the profile page.
export async function signOutClean(
  queryClient: ReturnType<typeof useQueryClient>,
  navigate: ReturnType<typeof useNavigate>,
) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
  navigate({ to: "/auth/login", replace: true });
}
