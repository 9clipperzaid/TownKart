import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { L as Logo } from "./Logo-DRVZe_Sz.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { c as Clock, b as MapPin, d as ShieldCheck } from "../_libs/lucide-react.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./utils-7zHHmOyJ.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
const heroImg = "/assets/hero-u5AltX77.jpg";
function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const splashStartedAt = Date.now();
    const minSplashMs = 1400;
    let cancelled = false;
    let timeoutId = null;
    const finishSplash = (after) => {
      const remaining = Math.max(0, minSplashMs - (Date.now() - splashStartedAt));
      timeoutId = setTimeout(() => {
        if (!cancelled) after();
      }, remaining);
    };
    try {
      supabase.auth.getSession().then(({
        data
      }) => {
        if (data.session) finishSplash(() => navigate({
          to: "/home",
          replace: true
        }));
        else finishSplash(() => setChecking(false));
      }).catch((error) => {
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-card ring-1 ring-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/townkart-logo.png", alt: "", className: "h-full w-full object-cover" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-4xl font-extrabold tracking-tight", children: [
        "Town",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Kart" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm", children: "Nehtaur's First Online Cart" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto min-h-screen max-w-md bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth/login", className: "text-sm font-semibold text-primary", children: "Log in" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-5 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-3xl shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroImg, alt: "TownKart delivery rider speeding through a neighbourhood with local shops", width: 1280, height: 896, className: "aspect-[4/3] w-full object-cover" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-7 text-4xl font-extrabold leading-tight", children: [
        "Your ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient", children: "neighbourhood" }),
        ", delivered."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-base text-muted-foreground", children: "Groceries, fresh food, medicines and gifts from local shops — at your door in minutes." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-3 gap-3", children: [{
        icon: Clock,
        label: "In minutes"
      }, {
        icon: MapPin,
        label: "Local shops"
      }, {
        icon: ShieldCheck,
        label: "Secure OTP"
      }].map(({
        icon: Icon,
        label
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 text-center shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label })
      ] }, label)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-10 pt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", className: "h-13 w-full text-base", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth/login", children: "Get started" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-xs text-muted-foreground", children: "Sign in with your phone number — no password needed." })
    ] })
  ] });
}
export {
  Landing as component
};
