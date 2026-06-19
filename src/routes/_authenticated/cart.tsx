import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Minus, Trash2, ShoppingBag, LocateFixed, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { secureCheckout } from "@/lib/order.functions";
import { getPaymentSettings } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { loadGoogleMaps } from "@/lib/google-maps";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CallToOrder } from "@/components/CallToOrder";

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
const DEFAULT_CENTER = { lat: 29.323, lng: 78.387 }; // Nehtaur fallback

function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkoutServer = useServerFn(secureCheckout);
  const loadPaymentSettings = useServerFn(getPaymentSettings);
  const [address, setAddress] = useState("");
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [paymentReference, setPaymentReference] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [mapsError, setMapsError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const markerObj = useRef<any>(null);

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

  const { data: paymentSettings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => loadPaymentSettings(),
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
  const upiLink =
    paymentSettings?.online_enabled && paymentSettings.upi_id
      ? `upi://pay?pa=${encodeURIComponent(paymentSettings.upi_id)}&pn=${encodeURIComponent(
          paymentSettings.payee_name || "TownKart",
        )}&am=${encodeURIComponent(String(total))}&cu=INR&tn=${encodeURIComponent(
          "TownKart order payment",
        )}`
      : null;

  const checkout = useMutation({
    mutationFn: async () => {
      await checkoutServer({
        data: {
          address: address.trim(),
          deliveryLatitude: location?.lat ?? null,
          deliveryLongitude: location?.lng ?? null,
          deliveryLocationAccuracy: location?.accuracy ?? null,
          paymentMethod,
          paymentReference: paymentReference.trim() || null,
          idempotencyKey: crypto.randomUUID(),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Order placed");
      navigate({ to: "/orders" });
    },
    onError: (e) => toast.error(userErrorMessage(e, "Checkout failed")),
  });

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setLocation(next);
        mapObj.current?.setCenter(next);
        markerObj.current?.setPosition(next);
        setLocating(false);
        toast.success("Delivery location selected");
      },
      () => {
        setLocating(false);
        toast.error("Could not fetch your location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  useEffect(() => {
    loadGoogleMaps()
      .then((maps) => {
        if (!mapRef.current) return;
        const center = location ?? DEFAULT_CENTER;
        mapObj.current = new maps.Map(mapRef.current, {
          center,
          zoom: location ? 16 : 13,
          disableDefaultUI: true,
          zoomControl: true,
        });
        markerObj.current = new maps.Marker({
          position: center,
          map: mapObj.current,
          draggable: true,
          title: "Delivery location",
        });
        mapObj.current.addListener("click", (event: any) => {
          const next = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          setLocation(next);
          markerObj.current?.setPosition(next);
        });
        markerObj.current.addListener("dragend", (event: any) => {
          setLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });
      })
      .catch(() => setMapsError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!location || !mapObj.current || !markerObj.current) return;
    mapObj.current.setCenter(location);
    markerObj.current.setPosition(location);
  }, [location]);

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
      <h1 className="text-2xl font-extrabold">Your cart</h1>

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
          placeholder="Flat / house no, street, landmark, area…"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />
      </div>

      <div className="mt-4 space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">Delivery location</h2>
            <p className="text-xs text-muted-foreground">
              Select your exact area so the admin and delivery team can find you.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={useCurrentLocation} disabled={locating}>
            <LocateFixed className="h-4 w-4" />
            {locating ? "Locating..." : "Use my location"}
          </Button>
        </div>

        {!mapsError && (
          <div
            ref={mapRef}
            className="h-56 w-full overflow-hidden rounded-xl border border-border/60 bg-muted"
          />
        )}

        {location ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs font-semibold text-primary">
            <MapPin className="h-4 w-4" />
            <span>
              Selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </span>
          </div>
        ) : (
          <p className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Use your current location or tap the map to set the delivery pin.
          </p>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-card p-4 shadow-card">
        <Row label="Subtotal" value={formatINR(subtotal)} />
        <Row label="Delivery fee" value={formatINR(DELIVERY_FEE)} />
        <div className="my-2 border-t border-border" />
        <Row label="Total" value={formatINR(total)} bold />
      </div>

      <div className="mt-5 space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <div>
          <h2 className="font-bold">Payment method</h2>
          <p className="text-xs text-muted-foreground">
            Choose how you want to pay for this order.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={paymentMethod === "cod" ? "default" : "outline"}
            disabled={paymentSettings?.cod_enabled === false}
            onClick={() => setPaymentMethod("cod")}
          >
            COD
          </Button>
          <Button
            type="button"
            variant={paymentMethod === "online" ? "default" : "outline"}
            disabled={!paymentSettings?.online_enabled}
            onClick={() => setPaymentMethod("online")}
          >
            Online
          </Button>
        </div>

        {paymentMethod === "online" && paymentSettings?.online_enabled && (
          <div className="space-y-3 rounded-xl bg-secondary/70 p-3">
            <div className="text-sm">
              <p className="font-bold">Pay to {paymentSettings.payee_name || "TownKart"}</p>
              <p className="text-muted-foreground">UPI ID: {paymentSettings.upi_id}</p>
              {paymentSettings.instructions && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {paymentSettings.instructions}
                </p>
              )}
            </div>
            {upiLink && (
              <Button asChild type="button" variant="outline" className="w-full bg-background">
                <a href={upiLink}>Open UPI app and pay {formatINR(total)}</a>
              </Button>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="payment-ref">UTR / payment reference</Label>
              <Textarea
                id="payment-ref"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Paste UPI transaction ID after payment"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="mt-4 h-13 w-full text-base"
        disabled={checkout.isPending}
        onClick={() => checkout.mutate()}
      >
        {checkout.isPending ? "Placing order…" : `Place order · ${formatINR(total)}`}
      </Button>
      <CallToOrder variant="outline" className="mt-3 w-full" />
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
