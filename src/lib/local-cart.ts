import { supabase } from "@/integrations/supabase/client";

export type LocalCartItem = {
  productId: string;
  name: string;
  unit: string;
  selectedUnit: string;
  unitPrice: number;
  storeId: string;
  storeName: string;
  imageUrl?: string | null;
  quantity: number;
};

export type UnitOption = {
  label: string;
  unitPrice: number;
};

const CART_KEY = "townkart_local_cart";
const LOCATION_KEY = "townkart_delivery_location";

export type SavedDeliveryLocation = {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
};

function cartKey(productId: string, selectedUnit: string) {
  return `${productId}::${selectedUnit}`;
}

export function getUnitOptions(product: {
  price: number;
  unit?: string | null;
  has_unit_options?: boolean | null;
  unit_options?: UnitOption[] | null;
}): UnitOption[] {
  if (
    product.has_unit_options &&
    Array.isArray(product.unit_options) &&
    product.unit_options.length
  ) {
    return product.unit_options
      .filter((option) => option.label && Number.isFinite(Number(option.unitPrice)))
      .map((option) => ({ label: option.label, unitPrice: Number(option.unitPrice) }));
  }
  return [{ label: product.unit || "1 pc", unitPrice: Number(product.price) }];
}

export function getLocalCart(): Record<string, LocalCartItem> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setLocalCart(cart: Record<string, LocalCartItem>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("townkart-local-cart"));
}

export function clearLocalCart() {
  setLocalCart({});
}

export function updateLocalCartItem(item: Omit<LocalCartItem, "quantity">, quantity: number) {
  const cart = getLocalCart();
  const key = cartKey(item.productId, item.selectedUnit);
  if (quantity <= 0) {
    delete cart[key];
  } else {
    cart[key] = { ...item, quantity };
  }
  setLocalCart(cart);
}

export function localCartCount() {
  return Object.values(getLocalCart()).reduce((sum, item) => sum + item.quantity, 0);
}

export async function syncLocalCartToSupabase(userId: string) {
  const items = Object.values(getLocalCart());
  if (!items.length) return;

  for (const item of items) {
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", item.productId)
      .eq("selected_unit", item.selectedUnit)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({
          quantity: Number(existing.quantity ?? 0) + item.quantity,
          unit_price: item.unitPrice,
        } as never)
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: item.productId,
        quantity: item.quantity,
        selected_unit: item.selectedUnit,
        unit_price: item.unitPrice,
      } as never);
    }
  }

  clearLocalCart();
}

export function getSavedDeliveryLocation(): SavedDeliveryLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCATION_KEY) ?? "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDeliveryLocation(location: SavedDeliveryLocation) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  window.dispatchEvent(new Event("townkart-location"));
}
