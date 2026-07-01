ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_popular boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS popular_sort_order integer NOT NULL DEFAULT 100;

CREATE INDEX IF NOT EXISTS idx_products_popular
  ON public.products(is_popular, popular_sort_order, created_at);

WITH ranked_products AS (
  SELECT id, row_number() OVER (ORDER BY created_at DESC) AS rank
  FROM public.products
  WHERE is_available = true
  LIMIT 12
)
UPDATE public.products p
SET
  is_popular = true,
  popular_sort_order = ranked_products.rank
FROM ranked_products
WHERE p.id = ranked_products.id
  AND p.is_popular = false;
