ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS selected_unit text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS unit_price numeric(10,2);

UPDATE public.cart_items ci
SET
  selected_unit = COALESCE(NULLIF(ci.selected_unit, ''), p.unit, ''),
  unit_price = COALESCE(ci.unit_price, p.discount_price, p.price)
FROM public.products p
WHERE p.id = ci.product_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_product_unit
  ON public.cart_items(user_id, product_id, selected_unit);
