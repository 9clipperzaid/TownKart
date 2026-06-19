import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Eye } from "lucide-react";
import { adminGetUserDetail } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/users/$userId")({
  component: UserDetailPage,
});

type UserDetailProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
};

type UserDetailOrder = {
  id: string;
  tracking_code: string | null;
  created_at: string;
  store_name: string | null;
  total: number | string | null;
  status: string;
  payment_method: string | null;
};

type UserDetailData = {
  profile: UserDetailProfile;
  roles: string[];
  stats: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpend: number;
    averageOrderValue: number;
    lastOrderDate: string | null;
  };
  addresses: string[];
  orders: UserDetailOrder[];
};

function UserDetailPage() {
  const { userId } = Route.useParams();
  const getDetail = useServerFn(adminGetUserDetail);
  const [range, setRange] = useState<"7" | "30" | "90" | "all">("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user-detail", userId, range],
    queryFn: () => getDetail({ data: { userId, range } }) as Promise<UserDetailData>,
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            Users
          </Link>
        </Button>
        <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive">
          <h1 className="font-bold">Could not load user details</h1>
          <p className="mt-1 text-sm">
            {userErrorMessage(error, "Check admin permissions and order tables.")}
          </p>
        </section>
      </div>
    );
  }

  const user = data.profile;

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" size="sm">
        <Link to="/admin/users">
          <ArrowLeft className="h-4 w-4" />
          Users
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">{user.full_name || "Unnamed user"}</h1>
        <p className="text-sm text-muted-foreground">User details and order history.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-bold">Basic Information</h2>
          <Info label="Name" value={user.full_name || "Unnamed"} />
          <Info label="Phone Number" value={user.phone || "Not available"} />
          <Info label="Email" value={user.email || "Not available"} />
          <Info label="Phone Verification" value={user.is_verified ? "Verified" : "Not verified"} />
          <Info label="Registration Date" value={new Date(user.created_at).toLocaleDateString()} />
          <Info label="Account Status" value={user.is_blocked ? "Blocked" : "Active"} />
          <Info label="Role" value={data.roles?.[0] || "customer"} />
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="font-bold">Order Statistics</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Total Orders" value={data.stats.totalOrders} />
            <Stat label="Completed Orders" value={data.stats.completedOrders} />
            <Stat label="Cancelled Orders" value={data.stats.cancelledOrders} />
            <Stat label="Total Spend" value={formatINR(data.stats.totalSpend)} />
            <Stat label="Average Order Value" value={formatINR(data.stats.averageOrderValue)} />
            <Stat
              label="Last Order Date"
              value={
                data.stats.lastOrderDate
                  ? new Date(data.stats.lastOrderDate).toLocaleDateString()
                  : "No orders"
              }
            />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="font-bold">Addresses</h2>
        <div className="mt-3 space-y-2">
          {data.addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved addresses.</p>
          ) : (
            data.addresses.map((address: string) => (
              <p key={address} className="rounded-xl bg-muted/40 p-3 text-sm">
                {address}
              </p>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card shadow-card">
        <div className="flex items-center justify-between gap-3 p-5">
          <div>
            <h2 className="font-bold">Order History</h2>
            <p className="text-xs text-muted-foreground">Recent orders and payment details.</p>
          </div>
          <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-y border-border/60 bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment Method</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr key={order.id} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-3 font-semibold">
                    {order.tracking_code ?? order.id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">{order.store_name}</td>
                  <td className="px-5 py-3 font-semibold">{formatINR(Number(order.total))}</td>
                  <td className="px-5 py-3">{String(order.status).replaceAll("_", " ")}</td>
                  <td className="px-5 py-3">{order.payment_method ?? "Cash on delivery"}</td>
                  <td className="px-5 py-3 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/orders" search={{ orderId: order.id }}>
                        <Eye className="h-3.5 w-3.5" />
                        View Order
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {data.orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    No orders in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-extrabold">{value}</p>
    </div>
  );
}
