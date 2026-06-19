import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as cn } from "./utils-7zHHmOyJ.mjs";
const townKartLogo = "/assets/townkart-logo-BuFimDuo.png";
function Logo({
  className,
  showText = true
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex items-center gap-2", className), "aria-label": "TownKart", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-card ring-1 ring-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: townKartLogo, alt: "", className: "h-full w-full object-cover", loading: "eager" }) }),
    showText && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-xl font-extrabold tracking-tight", children: [
      "Town",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Kart" })
    ] })
  ] });
}
export {
  Logo as L
};
