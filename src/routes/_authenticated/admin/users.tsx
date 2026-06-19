import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, Search, ShieldBan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { adminListUsers, adminSetUserBlocked, adminSetUserRole } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

type UserRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
  roles: string[];
  stats: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpend: number;
    lastOrderDate: string | null;
  };
};

const ROLE_OPTIONS = [
  { value: "customer", label: "Customer" },
  { value: "store_manager", label: "Store Manager" },
  { value: "seller", label: "Seller" },
  { value: "rider", label: "Rider" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
] as const;

function UsersPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListUsers);
  const setBlocked = useServerFn(adminSetUserBlocked);
  const setRole = useServerFn(adminSetUserRole);
  const [q, setQ] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => list() as Promise<UserRow[]>,
  });

  const blockMut = useMutation({
    mutationFn: (v: { userId: string; blocked: boolean }) => setBlocked({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const roleMut = useMutation({
    mutationFn: (v: { userId: string; role: (typeof ROLE_OPTIONS)[number]["value"] }) =>
      setRole({ data: v }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const filtered = users.filter(
    (u) =>
      !q ||
      (u.full_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (u.phone ?? "").includes(q) ||
      (u.email ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage accounts, roles and access.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone or email"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Cancelled</th>
                <th className="px-4 py-3">Spend</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const primaryRole = u.roles[0] ?? "customer";
                return (
                  <tr key={u.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{u.full_name || "Unnamed"}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.phone ? `+${u.phone}` : "No phone"}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email || "No email"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={primaryRole}
                        onValueChange={(v) =>
                          roleMut.mutate({
                            userId: u.id,
                            role: v as (typeof ROLE_OPTIONS)[number]["value"],
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{u.stats.totalOrders}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.stats.completedOrders} delivered
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          u.stats.cancelledOrders > 0
                            ? "font-semibold text-destructive"
                            : "font-semibold text-muted-foreground"
                        }
                      >
                        {u.stats.cancelledOrders}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{formatINR(u.stats.totalSpend)}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.stats.lastOrderDate
                          ? new Date(u.stats.lastOrderDate).toLocaleDateString()
                          : "No orders"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          u.is_blocked
                            ? "rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive"
                            : "rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"
                        }
                      >
                        {u.is_blocked ? "Blocked" : "Active"}
                      </span>
                      <span
                        className={
                          u.is_verified
                            ? "ml-2 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"
                            : "ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning-foreground"
                        }
                      >
                        {u.is_verified ? "Verified" : "Not verified"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/admin/users/$userId" params={{ userId: u.id }}>
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            blockMut.mutate({
                              userId: u.id,
                              blocked: !u.is_blocked,
                            })
                          }
                        >
                          {u.is_blocked ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5" /> Unblock
                            </>
                          ) : (
                            <>
                              <ShieldBan className="h-3.5 w-3.5" /> Block
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
