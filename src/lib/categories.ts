import grocery from "@/assets/cat-grocery.jpg";
import restaurant from "@/assets/cat-restaurant.jpg";
import bakery from "@/assets/cat-bakery.jpg";
import pharmacy from "@/assets/cat-pharmacy.jpg";
import flowers from "@/assets/cat-flowers.jpg";
import electronics from "@/assets/cat-electronics.jpg";

export type CategoryKey =
  | "grocery"
  | "restaurant"
  | "bakery"
  | "pharmacy"
  | "flowers"
  | "electronics";

export const CATEGORIES: Record<
  string,
  { label: string; emoji: string; image: string }
> = {
  grocery: { label: "Grocery", emoji: "🥦", image: grocery },
  restaurant: { label: "Food", emoji: "🍛", image: restaurant },
  bakery: { label: "Bakery", emoji: "🥐", image: bakery },
  pharmacy: { label: "Pharmacy", emoji: "💊", image: pharmacy },
  flowers: { label: "Flowers", emoji: "💐", image: flowers },
  electronics: { label: "Gadgets", emoji: "🎧", image: electronics },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "grocery",
  "restaurant",
  "bakery",
  "pharmacy",
  "flowers",
  "electronics",
];

export function categoryImage(category: string): string {
  return CATEGORIES[category]?.image ?? grocery;
}

export function categoryLabel(category: string): string {
  return CATEGORIES[category]?.label ?? category;
}
