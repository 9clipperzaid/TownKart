import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getLocalCart, getUnitOptions, updateLocalCartItem } from "@/lib/local-cart";
import { userErrorMessage } from "@/lib/utils";

type QuickAddProduct = {
  id: string;
  store_id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  has_unit_options?: boolean | null;
  unit_options?: { label: string; unitPrice: number }[] | null;
  stores?: { name: string } | null;
};

export function ProductQuickAdd({ product }: { product: QuickAddProduct }) {
  const queryClient = useQueryClient();
  const add = useMutation({
    mutationFn: async () => {
      const option = getUnitOptions(product)[0];
      const selectedUnit = option?.label ?? product.unit;
      const unitPrice = Number(option?.unitPrice ?? product.price);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const current = getLocalCart()[`${product.id}::${selectedUnit}`]?.quantity ?? 0;
        updateLocalCartItem(
          {
            productId: product.id,
            name: product.name,
            unit: product.unit,
            selectedUnit,
            unitPrice,
            storeId: product.store_id,
            storeName: product.stores?.name ?? "TownKart store",
            imageUrl: product.image_url,
          },
          current + 1,
        );
        return;
      }

      const { data: existing, error: readError } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .eq("selected_unit", selectedUnit)
        .maybeSingle();
      if (readError) throw readError;
      const { error } = await supabase.from("cart_items").upsert(
        {
          user_id: user.id,
          product_id: product.id,
          quantity: Number(existing?.quantity ?? 0) + 1,
          selected_unit: selectedUnit,
          unit_price: unitPrice,
        } as never,
        { onConflict: "user_id,product_id,selected_unit" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["home-cart-map"] });
      toast.success("Added to cart");
    },
    onError: (error) => toast.error(userErrorMessage(error, "Could not add to cart")),
  });

  return (
    <button
      type="button"
      onClick={() => add.mutate()}
      disabled={add.isPending}
      aria-label={`Add ${product.name} to cart`}
      className="flex h-7 shrink-0 items-center gap-0.5 rounded-lg border border-primary px-2 text-[10px] font-extrabold text-primary transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
    >
      <Plus className="h-3 w-3" /> Add
    </button>
  );
}
