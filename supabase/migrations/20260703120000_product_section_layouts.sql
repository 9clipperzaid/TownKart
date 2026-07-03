ALTER TABLE public.product_sections
  ADD COLUMN IF NOT EXISTS layout_mode text NOT NULL DEFAULT 'horizontal'
  CHECK (layout_mode IN ('horizontal', 'grid_1x4', 'grid_2x4'));

COMMENT ON COLUMN public.product_sections.layout_mode IS
  'horizontal = scrolling row, grid_1x4 = fixed four-item row, grid_2x4 = fixed eight-item two-row grid';
