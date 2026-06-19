import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, N as adminListAuditLogs } from "./router-B7ppZeuD.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "./client-Cevw5FM9.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/zod.mjs";
const ACTION_TONE = {
  delete: "bg-destructive/15 text-destructive",
  block_user: "bg-destructive/15 text-destructive",
  create: "bg-success/15 text-success",
  price_update: "bg-primary/15 text-primary",
  bulk_price_update: "bg-primary/15 text-primary"
};
function AuditPage() {
  const list = useServerFn(adminListAuditLogs);
  const {
    data: logs = [],
    isLoading
  } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => list()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Audit log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Every administrative action, newest first." })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 animate-pulse rounded-lg bg-muted" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "divide-y divide-border/40", children: [
      logs.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 px-4 py-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_TONE[l.action] ?? "bg-secondary text-secondary-foreground"}`, children: l.action }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: l.entity_type ?? "—" }),
          l.details && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 break-all text-xs text-muted-foreground", children: JSON.stringify(l.details) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: new Date(l.created_at).toLocaleString() })
      ] }, l.id)),
      logs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-4 py-10 text-center text-muted-foreground", children: "No activity yet." })
    ] }) })
  ] });
}
export {
  AuditPage as component
};
