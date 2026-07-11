import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Minus, Plus, ShoppingCart, Store } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { getLocalCart, getUnitOptions, updateLocalCartItem } from "@/lib/local-cart";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/product/$productId")({
  component: ProductDetailPage,
});

type Product = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  discount_price: number | null;
  unit: string;
  has_unit_options: boolean;
  unit_options:
    | { label: string; unitPrice: number; imageUrl?: string | null; description?: string | null }[]
    | null;
  stores: { name: string } | null;
};

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const queryClient = useQueryClient();
  const [selectedUnit, setSelectedUnit] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select(
          "id,store_id,name,description,image_url,price,discount_price,unit,has_unit_options,unit_options,stores(name)",
        )
        .eq("id", productId)
        .eq("is_available", true)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  const unitOptions = useMemo(() => (product ? getUnitOptions(product) : []), [product]);
  useEffect(() => {
    if (unitOptions.length && !selectedUnit) setSelectedUnit(unitOptions[0].label);
  }, [unitOptions, selectedUnit]);
  const selectedOption =
    unitOptions.find((option) => option.label === selectedUnit) ?? unitOptions[0];

  const { data: quantity = 0 } = useQuery({
    queryKey: ["product-cart-quantity", productId, selectedUnit],
    enabled: Boolean(selectedUnit),
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return getLocalCart()[`${productId}::${selectedUnit}`]?.quantity ?? 0;
      const { data } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("selected_unit", selectedUnit)
        .maybeSingle();
      return Number(data?.quantity ?? 0);
    },
  });

  const setQuantity = useMutation({
    mutationFn: async (nextQuantity: number) => {
      if (!product || !selectedOption) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        updateLocalCartItem(
          {
            productId: product.id,
            name: product.name,
            unit: product.unit,
            selectedUnit: selectedOption.label,
            unitPrice: selectedOption.unitPrice,
            storeId: product.store_id,
            storeName: product.stores?.name ?? "TownKart store",
            imageUrl: product.image_url,
          },
          nextQuantity,
        );
        return;
      }
      if (nextQuantity <= 0) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .eq("selected_unit", selectedOption.label);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").upsert(
          {
            user_id: user.id,
            product_id: product.id,
            quantity: nextQuantity,
            selected_unit: selectedOption.label,
            unit_price: selectedOption.unitPrice,
          } as never,
          { onConflict: "user_id,product_id,selected_unit" },
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-cart-quantity", productId] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["home-cart-map"] });
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not update cart")),
  });

  if (isLoading) return <div className="mx-4 mt-6 h-96 animate-pulse rounded-3xl bg-muted" />;
  if (!product)
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Product not available</h1>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/home">Back to home</Link>
        </Button>
      </div>
    );

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
      <button
        type="button"
        onClick={() =>
          window.history.length > 1 ? window.history.back() : (window.location.href = "/home")
        }
        aria-label="Go back"
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border bg-card shadow-card"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="grid gap-7 rounded-3xl border bg-card p-4 shadow-card sm:grid-cols-2 sm:p-7">
        <div className="overflow-hidden rounded-2xl bg-secondary/50">
          {selectedOption?.imageUrl || product.image_url ? (
            <img
              src={selectedOption?.imageUrl || product.image_url || ""}
              alt={product.name}
              className="aspect-square h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-5xl font-extrabold text-primary">
              TK
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-semibold text-primary">
            {selectedOption?.label ?? product.unit}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{product.name}</h1>
          <Link
            to="/store/$storeId"
            params={{ storeId: product.store_id }}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <Store className="h-4 w-4" /> {product.stores?.name ?? "TownKart store"}
          </Link>

          <div className="mt-5 flex items-end gap-2">
            <span className="text-2xl font-extrabold">
              {formatINR(selectedOption?.unitPrice ?? product.price)}
            </span>
            {product.discount_price && product.discount_price < product.price ? (
              <span className="pb-1 text-sm text-muted-foreground line-through">
                {formatINR(product.price)}
              </span>
            ) : null}
          </div>

          {unitOptions.length > 1 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold">Choose size</p>
              <div className="flex flex-wrap gap-2">
                {unitOptions.map((option) => (
                  <button
                    type="button"
                    key={option.label}
                    onClick={() => setSelectedUnit(option.label)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${selectedUnit === option.label ? "border-primary bg-primary/10 text-primary" : "bg-background"}`}
                  >
                    {option.label} · {formatINR(option.unitPrice)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 border-t pt-5">
            <h2 className="font-bold">Product description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {selectedOption?.description?.trim() ||
                product.description?.trim() ||
                "No description has been added for this product yet."}
            </p>
          </div>

          <div className="mt-auto pt-7">
            {quantity > 0 ? (
              <div className="flex h-12 items-center justify-between rounded-xl bg-primary px-2 text-primary-foreground">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center"
                  onClick={() => setQuantity.mutate(quantity - 1)}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="font-extrabold">{quantity} in cart</span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center"
                  onClick={() => setQuantity.mutate(quantity + 1)}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Button
                className="h-12 w-full rounded-xl text-base"
                onClick={() => setQuantity.mutate(1)}
                disabled={setQuantity.isPending}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to cart
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
