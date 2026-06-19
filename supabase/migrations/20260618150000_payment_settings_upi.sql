-- Payment method support for COD and online UPI payment.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'Cash on delivery',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_reference text;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON public.orders(payment_status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.marketplace_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.marketplace_settings TO anon, authenticated;
GRANT ALL ON public.marketplace_settings TO service_role;

DROP POLICY IF EXISTS "Anyone reads marketplace settings" ON public.marketplace_settings;
CREATE POLICY "Anyone reads marketplace settings"
  ON public.marketplace_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage marketplace settings" ON public.marketplace_settings;
CREATE POLICY "Admins manage marketplace settings"
  ON public.marketplace_settings
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.marketplace_settings(key, value)
VALUES (
  'payment',
  jsonb_build_object(
    'cod_enabled', true,
    'online_enabled', false,
    'upi_id', '',
    'payee_name', 'TownKart',
    'instructions', 'Pay online and enter your UTR/reference number before placing the order.'
  )
)
ON CONFLICT (key) DO NOTHING;
