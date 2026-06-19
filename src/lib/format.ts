export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const ORDER_STATUS: Record<
  string,
  { label: string; tone: "warning" | "primary" | "success" }
> = {
  placed: { label: "Order placed", tone: "warning" },
  accepted: { label: "Preparing", tone: "primary" },
  out_for_delivery: { label: "Out for delivery", tone: "primary" },
  delivered: { label: "Delivered", tone: "success" },
};
