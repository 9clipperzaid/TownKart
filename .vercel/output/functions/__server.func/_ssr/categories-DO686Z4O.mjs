const grocery = "/assets/cat-grocery-DX9ZrgPv.jpg";
const restaurant = "/assets/cat-restaurant-IStrmNLA.jpg";
const bakery = "/assets/cat-bakery-CX43LF33.jpg";
const pharmacy = "/assets/cat-pharmacy-c3zOhozx.jpg";
const flowers = "/assets/cat-flowers-Do736yG4.jpg";
const electronics = "/assets/cat-electronics-D5oiUI2n.jpg";
const CATEGORIES = {
  grocery: { label: "Grocery", emoji: "🥦", image: grocery },
  restaurant: { label: "Food", emoji: "🍛", image: restaurant },
  bakery: { label: "Bakery", emoji: "🥐", image: bakery },
  pharmacy: { label: "Pharmacy", emoji: "💊", image: pharmacy },
  flowers: { label: "Flowers", emoji: "💐", image: flowers },
  electronics: { label: "Gadgets", emoji: "🎧", image: electronics }
};
function categoryImage(category) {
  return CATEGORIES[category]?.image ?? grocery;
}
function categoryLabel(category) {
  return CATEGORIES[category]?.label ?? category;
}
export {
  CATEGORIES as C,
  categoryImage as a,
  categoryLabel as c
};
