import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Minus, Trash2, ShoppingBag, MapPin, LocateFixed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { secureCheckout } from "@/lib/order.functions";
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import { CallToOrder } from "@/components/CallToOrder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/cart")({
  component: CartPage,
});

type CartRow = {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    name: string;
    price: number;
    unit: string;
    store_id: string;
    stores: { name: string } | null;
  } | null;
};

const DELIVERY_FEE = 25;

type DeliveryLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkoutServer = useServerFn(secureCheckout);
  const [address, setAddress] = useState("");
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [locating, setLocating] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart-detail"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product_id, products(name, price, unit, store_id, stores(name))");
      if (error) throw error;
      return data as unknown as CartRow[];
    },
  });

  useEffect(() => {
    if (addressLoaded) return;
    supabase
      .from("profiles")
      .select("address")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.address) setAddress(data.address);
        setAddressLoaded(true);
      });
  }, [addressLoaded]);

  const setQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        await supabase.from("cart_items").delete().eq("id", id);
      } else {
        await supabase.from("cart_items").update({ quantity }).eq("id", id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-detail"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["cart-map"] });
    },
  });

  const subtotal = items.reduce((sum, r) => sum + (r.products?.price ?? 0) * r.quantity, 0);
  const total = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;

  const fetchDeliveryLocation = () =>
    new Promise<DeliveryLocation | null>((resolve) => {
      if (!navigator.geolocation) {
        toast.error("Location is not supported on this device.");
        resolve(null);
        return;
      }

      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          };
          setDeliveryLocation(nextLocation);
          setLocating(false);
          toast.success("Delivery location added");
          resolve(nextLocation);
        },
        () => {
          setLocating(false);
          toast.error(
            "Could not get your location. You can still place the order with your address.",
          );
          resolve(null);
        },
        { enableHighAccuracy: true, maximumAge: 60_000, timeout: 12_000 },
      );
    });

  const checkout = useMutation({
    mutationFn: async () => {
      if (address.trim().length < 10) {
        throw new Error("Please add a complete delivery address before placing your order.");
      }

      const currentLocation = deliveryLocation ?? (await fetchDeliveryLocation());
      await checkoutServer({
        data: {
          address: address.trim(),
          deliveryLatitude: currentLocation?.latitude ?? null,
          deliveryLongitude: currentLocation?.longitude ?? null,
          deliveryLocationAccuracy: currentLocation?.accuracy ?? null,
          idempotencyKey: crypto.randomUUID(),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Order placed");
      navigate({ to: "/orders" });
    },
    onError: (e) =>
      toast.error(userErrorMessage(e, "Could not place your order. Please try again.")),
  });

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
        <div className="bg-secondary flex h-20 w-20 items-center justify-center rounded-full">
          <ShoppingBag className="h-9 w-9 text-primary" />
        </div>
        <h1 className="mt-5 text-xl font-bold">Your cart is empty</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Browse local stores and add items to get started.
        </p>
        <Button asChild className="mt-6">
          <Link to="/home">Explore stores</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Your cart</h1>
        <CallToOrder variant="outline" className="h-9" />
      </div>

      <div className="mt-4 space-y-2.5">
        {items.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{r.products?.name}</h3>
              <p className="text-xs text-muted-foreground">{r.products?.stores?.name}</p>
              <p className="mt-1 text-sm font-bold">
                {formatINR((r.products?.price ?? 0) * r.quantity)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-secondary px-1.5 py-1">
              <button
                className="flex h-7 w-7 items-center justify-center text-primary"
                onClick={() => setQty.mutate({ id: r.id, quantity: r.quantity - 1 })}
              >
                {r.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </button>
              <span className="min-w-5 text-center text-sm font-bold">{r.quantity}</span>
              <button
                className="flex h-7 w-7 items-center justify-center text-primary"
                onClick={() => setQty.mutate({ id: r.id, quantity: r.quantity + 1 })}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="addr">Delivery address</Label>
        <Textarea
          id="addr"
          placeholder="Flat / house no, street, landmark, area..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />
        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">
                {deliveryLocation ? "Map location added" : "Add your map location"}
              </p>
              <p className="text-xs text-muted-foreground">
                {deliveryLocation
                  ? `Accuracy about ${Math.round(deliveryLocation.accuracy ?? 0)}m`
                  : "Share GPS location so the store can find you faster."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant={deliveryLocation ? "secondary" : "outline"}
            className="h-10 shrink-0"
            disabled={locating}
            onClick={() => void fetchDeliveryLocation()}
          >
            <LocateFixed className="h-4 w-4" />
            {locating
              ? "Getting location..."
              : deliveryLocation
                ? "Update location"
                : "Use current location"}
          </Button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-card p-4 shadow-card">
        <Row label="Subtotal" value={formatINR(subtotal)} />
        <Row label="Delivery fee" value={formatINR(DELIVERY_FEE)} />
        <div className="my-2 border-t border-border" />
        <Row label="Total" value={formatINR(total)} bold />
      </div>

      <Button
        size="lg"
        className="mt-4 h-13 w-full text-base"
        disabled={checkout.isPending}
        onClick={() => checkout.mutate()}
      >
        {checkout.isPending ? "Placing order..." : `Place order - ${formatINR(total)}`}
      </Button>
      <CallToOrder variant="secondary" className="mt-3 h-11 w-full" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-1 text-sm ${
        bold ? "font-extrabold" : "text-muted-foreground"
      }`}
    >
      <span>{label}</span>
      <span className={bold ? "text-base text-foreground" : ""}>{value}</span>
    </div>
  );
}
