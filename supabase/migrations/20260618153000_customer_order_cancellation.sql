-- Customer cancellation details for orders.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at
  ON public.orders(cancelled_at DESC)
  WHERE cancelled_at IS NOT NULL;
