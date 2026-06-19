import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-Cevw5FM9.mjs";
import { n as normalizePhoneNumber, i as isValidPhoneNumber, d as signOutClean } from "./router-B7ppZeuD.mjs";
import { u as userErrorMessage } from "./utils-7zHHmOyJ.mjs";
import { B as Button } from "./button-DpLzXnPs.mjs";
import { I as Input } from "./input-BJtaFeMi.mjs";
import { T as Textarea } from "./textarea-BkQV2irW.mjs";
import { L as Label } from "./label-BDTFhyHh.mjs";
import "../_libs/seroval.mjs";
import { P as Phone, a as Mail, d as ShieldCheck, h as ShieldX, U as User, b as MapPin, i as LayoutDashboard, f as Store, B as Bike, j as LogOut } from "../_libs/lucide-react.mjs";
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
import "./server-CR4UkH38.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-v_CxfV_5.mjs";
import "../_libs/zod.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [address, setAddress] = reactExports.useState("");
  const [loaded, setLoaded] = reactExports.useState(false);
  const {
    data: profile
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("profiles").select("full_name, phone, email, address, is_verified, provider").maybeSingle();
      return data;
    }
  });
  const {
    data: roles = []
  } = useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("user_roles").select("role");
      return (data ?? []).map((r) => r.role);
    }
  });
  const isAdmin = roles.some((r) => r === "admin" || r === "super_admin");
  const isVendor = roles.some((r) => r === "vendor" || r === "store_manager");
  const isDelivery = roles.some((r) => r === "delivery_partner" || r === "rider");
  const displayPhone = profile?.phone ? `+${profile.phone}` : "Not added";
  const displayEmail = profile?.email || "Not added";
  const isPhoneVerified = Boolean(profile?.is_verified);
  reactExports.useEffect(() => {
    if (profile && !loaded) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ? `+${profile.phone}` : "");
      setAddress(profile.address ?? "");
      setLoaded(true);
    }
  }, [profile, loaded]);
  const save = useMutation({
    mutationFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const normalizedPhone = phone.trim() ? normalizePhoneNumber(phone) : null;
      if (phone.trim() && !isValidPhoneNumber(phone)) {
        throw new Error("Enter a valid phone number");
      }
      const phoneChanged = normalizedPhone !== (profile?.phone ?? null);
      const {
        error
      } = await supabase.from("profiles").update({
        full_name: fullName.trim() || null,
        phone: normalizedPhone,
        address: address.trim() || null,
        is_verified: phoneChanged ? false : profile?.is_verified
      }).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"]
      });
      queryClient.invalidateQueries({
        queryKey: ["my-address"]
      });
      toast.success("Profile saved");
    },
    onError: (e) => toast.error(userErrorMessage(e, "Could not save"))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-brand-gradient flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-primary-foreground shadow-card", children: (fullName || "K").charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-extrabold", children: fullName || "TownKart Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: displayPhone })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: displayEmail })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: isPhoneVerified ? "mt-5 flex items-center gap-2 rounded-2xl bg-success/10 p-3 text-sm text-success" : "mt-5 flex items-center gap-2 rounded-2xl bg-warning/15 p-3 text-sm text-warning-foreground", children: [
      isPhoneVerified ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldX, { className: "h-5 w-5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
        isPhoneVerified ? "Phone verified" : "Phone not verified",
        " - Customer account"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "name", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "mr-1 inline h-3.5 w-3.5" }),
          " Full name"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Your name", className: "h-12" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "phone", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "mr-1 inline h-3.5 w-3.5" }),
          " Phone number"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "phone", type: "tel", inputMode: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "98765 43210", className: "h-12" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "email", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "mr-1 inline h-3.5 w-3.5" }),
          " Email"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", value: displayEmail, className: "h-12", readOnly: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "addr", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mr-1 inline h-3.5 w-3.5" }),
          " Default address"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "addr", value: address, onChange: (e) => setAddress(e.target.value), placeholder: "Flat / house no, street, area...", rows: 3 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-12 w-full", disabled: save.isPending, onClick: () => save.mutate(), children: save.isPending ? "Saving..." : "Save changes" })
    ] }),
    isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "mt-6 h-12 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "mr-2 h-4 w-4" }),
      " Open Admin Panel"
    ] }) }),
    isVendor && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "mt-3 h-12 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/vendor", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Store, { className: "mr-2 h-4 w-4" }),
      " Open Vendor Dashboard"
    ] }) }),
    isDelivery && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "mt-3 h-12 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/delivery", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "mr-2 h-4 w-4" }),
      " Open Delivery Dashboard"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "mt-8 h-12 w-full text-destructive hover:bg-destructive/10 hover:text-destructive", onClick: () => signOutClean(queryClient, navigate), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-2 h-4 w-4" }),
      " Sign out"
    ] })
  ] });
}
export {
  ProfilePage as component
};
