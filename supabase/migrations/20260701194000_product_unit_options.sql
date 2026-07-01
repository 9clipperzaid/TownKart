ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS has_unit_options boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unit_options jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_unit_options_array;

ALTER TABLE public.products
  ADD CONSTRAINT products_unit_options_array
  CHECK (jsonb_typeof(unit_options) = 'array');
