import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListAuditLogs } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AuditPage,
});

type Log = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

const ACTION_TONE: Record<string, string> = {
  delete: "bg-destructive/15 text-destructive",
  block_user: "bg-destructive/15 text-destructive",
  create: "bg-success/15 text-success",
  price_update: "bg-primary/15 text-primary",
  bulk_price_update: "bg-primary/15 text-primary",
};

function AuditPage() {
  const list = useServerFn(adminListAuditLogs);
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => list() as Promise<Log[]>,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          Every administrative action, newest first.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <ul className="divide-y divide-border/40">
            {logs.map((l) => (
              <li key={l.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    ACTION_TONE[l.action] ?? "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {l.action}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{l.entity_type ?? "—"}</span>
                  {l.details && (
                    <span className="ml-2 break-all text-xs text-muted-foreground">
                      {JSON.stringify(l.details)}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleString()}
                </span>
              </li>
            ))}
            {logs.length === 0 && (
              <li className="px-4 py-10 text-center text-muted-foreground">
                No activity yet.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
