import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, ShieldCheck, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TownKart - Nehtaur Online Grocery, Food & Medicine Delivery" },
      {
        name: "description",
        content:
          "Order groceries, food, medicines, gifts and daily essentials from Nehtaur neighbourhood stores. Fast local delivery in minutes with TownKart.",
      },
      { property: "og:title", content: "TownKart - Nehtaur Hyperlocal Delivery" },
      {
        property: "og:description",
        content:
          "Order groceries, food, medicines and essentials from local Nehtaur stores with TownKart.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.townkart.store/" }],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const splashStartedAt = Date.now();
    const minSplashMs = 1400;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const finishSplash = (after: () => void) => {
      const remaining = Math.max(0, minSplashMs - (Date.now() - splashStartedAt));
      timeoutId = setTimeout(() => {
        if (!cancelled) after();
      }, remaining);
    };

    try {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (data.session) finishSplash(() => navigate({ to: "/home", replace: true }));
          else finishSplash(() => setChecking(false));
        })
        .catch((error) => {
          console.error("[Auth] Could not read Supabase session", error);
          finishSplash(() => setChecking(false));
        });
    } catch (error) {
      console.error("[Auth] Could not start Supabase session check", error);
      finishSplash(() => setChecking(false));
    }

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-card ring-1 ring-border">
          <img src="/townkart-logo.png" alt="" className="h-full w-full object-cover" />
        </span>
        <span className="font-display text-4xl font-extrabold tracking-tight">
          Town<span className="text-primary">Kart</span>
        </span>
        <p className="rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm">
          Nehtaur's First Online Cart
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <div className="flex items-center justify-between px-5 pt-5">
        <Logo />
        <Link to="/auth/login" className="text-sm font-semibold text-primary">
          Log in
        </Link>
      </div>

      <section className="px-5 pt-6">
        <div className="overflow-hidden rounded-3xl shadow-card">
          <img
            src={heroImg}
            alt="TownKart delivery rider speeding through a neighbourhood with local shops"
            width={1280}
            height={896}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <h1 className="mt-7 text-4xl font-extrabold leading-tight">
          Your <span className="text-gradient">neighbourhood</span>, delivered.
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Groceries, fresh food, medicines and gifts from local shops - at your door in minutes.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "In minutes" },
            { icon: MapPin, label: "Local shops" },
            { icon: ShieldCheck, label: "Secure OTP" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 text-center shadow-card"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="px-5 pb-10 pt-8">
        <Button asChild size="lg" className="h-13 w-full text-base">
          <Link to="/auth/login">Get started</Link>
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Sign in with your phone number - no password needed.
        </p>
      </div>
    </div>
  );
}
