import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as Route$n, u as useServerFn } from "./router-B7ppZeuD.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { v as verifyOtp, a as sendOtp } from "./auth.functions-DWe_uasj.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { c as cn, u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { L as Logo } from "./Logo-DRVZe_Sz.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { L as Lt, j as jt } from "../_libs/input-otp.mjs";
import "../_libs/seroval.mjs";
import { A as ArrowLeft, e as Minus } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
const InputOTP = reactExports.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Lt,
  {
    ref,
    containerClassName: cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    ),
    className: cn("disabled:cursor-not-allowed", className),
    ...props
  }
));
InputOTP.displayName = "InputOTP";
const InputOTPGroup = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex items-center", className), ...props }));
InputOTPGroup.displayName = "InputOTPGroup";
const InputOTPSlot = reactExports.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = reactExports.useContext(jt);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref,
      className: cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      ),
      ...props,
      children: [
        char,
        hasFakeCaret && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" }) })
      ]
    }
  );
});
InputOTPSlot.displayName = "InputOTPSlot";
const InputOTPSeparator = reactExports.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, role: "separator", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, {}) }));
InputOTPSeparator.displayName = "InputOTPSeparator";
function VerifyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    phone,
    name,
    dev
  } = Route$n.useSearch();
  const verify = useServerFn(verifyOtp);
  const resend = useServerFn(sendOtp);
  const [code, setCode] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function submit(value) {
    setLoading(true);
    try {
      const {
        email,
        password
      } = await verify({
        data: {
          phone,
          code: value,
          fullName: name
        }
      });
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw new Error(error.message);
      await queryClient.invalidateQueries();
      toast.success("You're in!");
      navigate({
        to: "/home",
        replace: true
      });
    } catch (err) {
      toast.error(userErrorMessage(err, "Verification failed"));
      setCode("");
    } finally {
      setLoading(false);
    }
  }
  async function handleResend() {
    try {
      const res = await resend({
        data: {
          phone
        }
      });
      toast.success("New code sent");
      if (res.devMode) {
        navigate({
          to: "/auth/verify",
          search: {
            phone,
            name,
            dev: res.devCode
          }
        });
      }
    } catch (err) {
      toast.error(userErrorMessage(err, "Could not resend"));
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex min-h-screen max-w-md flex-col bg-background px-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", className: "rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth/login", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { showText: false })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col justify-center pb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-extrabold", children: "Enter code" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-muted-foreground", children: [
        "We sent a 6-digit code to",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: phone })
      ] }),
      dev && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl border border-dashed border-accent bg-accent/10 p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-accent-foreground", children: "Dev mode:" }),
        " ",
        "no SMS provider connected yet — your code is",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold", children: dev })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTP, { maxLength: 6, value: code, onChange: (v) => {
        setCode(v);
        if (v.length === 6) submit(v);
      }, disabled: loading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPGroup, { children: [0, 1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: i, className: "h-12 w-11 text-lg" }, i)) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "mt-8 h-13 w-full text-base", disabled: code.length !== 6 || loading, onClick: () => submit(code), children: loading ? "Verifying…" : "Verify & continue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleResend, className: "mt-5 text-center text-sm font-medium text-primary", children: "Didn't get it? Resend code" })
    ] })
  ] });
}
export {
  VerifyPage as component
};
