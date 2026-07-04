ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_batch_id uuid,
  ADD COLUMN IF NOT EXISTS deleted_previous_status text,
  ADD COLUMN IF NOT EXISTS deleted_previous_available boolean;

CREATE INDEX IF NOT EXISTS idx_products_deleted_at
  ON public.products(deleted_at);

CREATE INDEX IF NOT EXISTS idx_products_deletion_batch
  ON public.products(deletion_batch_id)
  WHERE deletion_batch_id IS NOT NULL;
