import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Minus, Trash2, ShoppingBag, MapPin, LocateFixed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { secureCheckout } from "@/lib/order.functions";
import { reverseGeocodeCoordinates } from "@/lib/maps.functions";
import { formatINR } from "@/lib/format";
import { userErrorMessage } from "@/lib/utils";
import {
  getLocalCart,
  getSavedDeliveryLocation,
  saveDeliveryLocation,
  setLocalCart,
} from "@/lib/local-cart";
import { CallToOrder } from "@/components/CallToOrder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/cart")({
  component: CartPage,
});

type CartRow = {
  id: string;
  quantity: number;
  product_id: string;
  selected_unit: string;
  unit_price: number | null;
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
  const reverseGeocode = useServerFn(reverseGeocodeCoordinates);
  const [address, setAddress] = useState("");
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationPromptOpen, setLocationPromptOpen] = useState(false);
  const [locationPromptShown, setLocationPromptShown] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart-detail"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        return Object.values(getLocalCart()).map((item) => ({
          id: `${item.productId}::${item.selectedUnit}`,
          quantity: item.quantity,
          product_id: item.productId,
          selected_unit: item.selectedUnit,
          unit_price: item.unitPrice,
          products: {
            name: item.name,
            price: item.unitPrice,
            unit: item.unit,
            store_id: item.storeId,
            stores: { name: item.storeName },
          },
        })) as CartRow[];
      }
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          "id, quantity, product_id, selected_unit, unit_price, products(name, price, unit, store_id, stores(name))",
        );
      if (error) throw error;
      return data as unknown as CartRow[];
    },
  });

  useEffect(() => {
    if (addressLoaded) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        const savedLocation = getSavedDeliveryLocation();
        if (savedLocation?.address) {
          setAddress(savedLocation.address);
          if (savedLocation.latitude && savedLocation.longitude) {
            setDeliveryLocation({
              latitude: savedLocation.latitude,
              longitude: savedLocation.longitude,
              accuracy: savedLocation.accuracy ?? null,
            });
          }
        }
        setAddressLoaded(true);
        return;
      }
      supabase
        .from("profiles")
        .select("address")
        .maybeSingle()
        .then(({ data }) => {
          if (data?.address) setAddress(data.address);
          const savedLocation = getSavedDeliveryLocation();
          if (savedLocation?.latitude && savedLocation.longitude) {
            setDeliveryLocation({
              latitude: savedLocation.latitude,
              longitude: savedLocation.longitude,
              accuracy: savedLocation.accuracy ?? null,
            });
          }
          setAddressLoaded(true);
        });
    });
  }, [addressLoaded]);

  useEffect(() => {
    if (
      !addressLoaded ||
      isLoading ||
      items.length === 0 ||
      deliveryLocation ||
      locationPromptShown
    )
      return;
    setLocationPromptShown(true);
    setLocationPromptOpen(true);
  }, [addressLoaded, deliveryLocation, isLoading, items.length, locationPromptShown]);

  const setQty = useMutation({
    scope: { id: "cart-quantity-updates" },
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        const cart = getLocalCart();
        const item = cart[id];
        if (!item) return;
        if (quantity <= 0) delete cart[id];
        else cart[id] = { ...item, quantity };
        setLocalCart(cart);
        return;
      }
      if (quantity <= 0) {
        const { error } = await supabase.from("cart_items").delete().eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", id);
        if (error) throw error;
      }
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart-detail"] });
      const previous = queryClient.getQueryData<CartRow[]>(["cart-detail"]);
      queryClient.setQueryData<CartRow[]>(["cart-detail"], (current = []) =>
        quantity <= 0
          ? current.filter((item) => item.id !== id)
          : current.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart-detail"], context.previous);
      }
      toast.error(userErrorMessage(error, "Could not update cart"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["cart-map"] });
    },
  });

  const subtotal = items.reduce(
    (sum, r) => sum + Number(r.unit_price ?? r.products?.price ?? 0) * r.quantity,
    0,
  );
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
        async (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          };
          setDeliveryLocation(nextLocation);
          let readableAddress = address.trim();
          try {
            const result = await reverseGeocode({
              data: {
                latitude: nextLocation.latitude,
                longitude: nextLocation.longitude,
              },
            });
            readableAddress = result.formatted;
            setAddress(readableAddress);
            const {
              data: { session },
            } = await supabase.auth.getSession();
            const user = session?.user;
            if (user) {
              await supabase
                .from("profiles")
                .update({ address: readableAddress })
                .eq("id", user.id);
              queryClient.invalidateQueries({ queryKey: ["my-address"] });
              queryClient.invalidateQueries({ queryKey: ["profile"] });
            }
          } catch (error) {
            console.error("[Location] Reverse geocoding failed", error);
          }
          saveDeliveryLocation({
            address: readableAddress || "Current location",
            latitude: nextLocation.latitude,
            longitude: nextLocation.longitude,
            accuracy: nextLocation.accuracy,
          });
          setLocating(false);
          toast.success("Delivery location added");
          resolve(nextLocation);
        },
        (error) => {
          setLocating(false);
          toast.error(
            error.code === error.PERMISSION_DENIED
              ? "Location permission is blocked. Please allow location access in your browser settings and try again."
              : "Could not detect your location. Turn on GPS and try again, or enter your address manually.",
          );
          resolve(null);
        },
        { enableHighAccuracy: true, maximumAge: 300_000, timeout: 25_000 },
      );
    });

  const checkout = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (address.trim()) saveDeliveryLocation({ address: address.trim() });
        navigate({ to: "/auth/login", search: { redirectTo: "/cart" } });
        throw new Error("Please login to place your order.");
      }
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
              <p className="text-xs text-muted-foreground">
                {r.products?.stores?.name} · {r.selected_unit || r.products?.unit}
              </p>
              <p className="mt-1 text-sm font-bold">
                {formatINR(Number(r.unit_price ?? r.products?.price ?? 0) * r.quantity)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-secondary px-1.5 py-1">
              <button
                type="button"
                aria-label={
                  r.quantity === 1
                    ? `Remove ${r.products?.name ?? "item"} from cart`
                    : `Decrease ${r.products?.name ?? "item"} quantity`
                }
                className="flex h-7 w-7 items-center justify-center text-primary"
                onClick={() => setQty.mutate({ id: r.id, quantity: r.quantity - 1 })}
              >
                {r.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </button>
              <span className="min-w-5 text-center text-sm font-bold">{r.quantity}</span>
              <button
                type="button"
                aria-label={`Increase ${r.products?.name ?? "item"} quantity`}
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

      <Dialog open={locationPromptOpen} onOpenChange={setLocationPromptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LocateFixed className="h-5 w-5 text-primary" />
              Allow delivery location
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">
            TownKart needs your location to save the correct delivery address and help the store
            find you easily. Your coordinates will be converted into a readable address.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setLocationPromptOpen(false)}>
              Not now
            </Button>
            <Button
              type="button"
              disabled={locating}
              onClick={() => {
                setLocationPromptOpen(false);
                void fetchDeliveryLocation();
              }}
            >
              <LocateFixed className="h-4 w-4" />
              {locating ? "Detecting..." : "Allow location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
