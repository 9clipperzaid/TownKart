-- Run this file in Supabase Dashboard -> SQL Editor.
-- It fixes:
-- 1) Missing public.call_order_settings table
-- 2) Missing image upload buckets: store-logos, store-banners, product-images
-- 3) Storage policies so admins can upload and everyone can view public images
-- 4) Home moving banner settings and banner image bucket
-- 5) Delivery map coordinates on orders
-- 6) COD / online UPI payment settings
-- 7) Customer order cancellation details
-- 8) Realtime new-order notifications for admin dashboard

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_latitude double precision,
  ADD COLUMN IF NOT EXISTS delivery_longitude double precision,
  ADD COLUMN IF NOT EXISTS delivery_location_accuracy double precision,
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'Cash on delivery',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_latitude_range'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_latitude_range
      CHECK (delivery_latitude IS NULL OR delivery_latitude BETWEEN -90 AND 90);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_longitude_range'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_longitude_range
      CHECK (delivery_longitude IS NULL OR delivery_longitude BETWEEN -180 AND 180);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_location_pair'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_location_pair
      CHECK (
        (delivery_latitude IS NULL AND delivery_longitude IS NULL)
        OR (delivery_latitude IS NOT NULL AND delivery_longitude IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_coordinates
  ON public.orders(delivery_latitude, delivery_longitude)
  WHERE delivery_latitude IS NOT NULL AND delivery_longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON public.orders(payment_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at
  ON public.orders(cancelled_at DESC)
  WHERE cancelled_at IS NOT NULL;

ALTER TABLE public.orders REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _uid
      AND role::text IN ('admin', 'super_admin')
  );
$$;

CREATE TABLE IF NOT EXISTS public.call_order_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_phone text NOT NULL DEFAULT '+919999999999',
  secondary_phone text,
  whatsapp_number text DEFAULT '+919999999999',
  is_enabled boolean NOT NULL DEFAULT true,
  available_from text NOT NULL DEFAULT '09:00',
  available_to text NOT NULL DEFAULT '21:00',
  instructions text DEFAULT 'Call us with your items, quantity, delivery address and preferred payment method.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.call_order_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.call_order_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.call_order_settings TO authenticated;
GRANT ALL ON public.call_order_settings TO service_role;

DROP POLICY IF EXISTS "Anyone reads call order settings" ON public.call_order_settings;
CREATE POLICY "Anyone reads call order settings"
ON public.call_order_settings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage call order settings" ON public.call_order_settings;
CREATE POLICY "Admins manage call order settings"
ON public.call_order_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_call_order_settings_updated ON public.call_order_settings;
CREATE TRIGGER trg_call_order_settings_updated
BEFORE UPDATE ON public.call_order_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.call_order_settings (
  primary_phone,
  secondary_phone,
  whatsapp_number,
  is_enabled,
  available_from,
  available_to,
  instructions
)
SELECT
  '+919999999999',
  NULL,
  '+919999999999',
  true,
  '09:00',
  '21:00',
  'Call us with your items, quantity, delivery address and preferred payment method.'
WHERE NOT EXISTS (SELECT 1 FROM public.call_order_settings);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'store-logos',
    'store-logos',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'store-banners',
    'store-banners',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'product-images',
    'product-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'marketplace-banners',
    'marketplace-banners',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public reads marketplace images" ON storage.objects;
CREATE POLICY "Public reads marketplace images"
ON storage.objects
FOR SELECT
USING (bucket_id IN ('store-logos', 'store-banners', 'product-images', 'marketplace-banners'));

DROP POLICY IF EXISTS "Admins upload marketplace images" ON storage.objects;
CREATE POLICY "Admins upload marketplace images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('store-logos', 'store-banners', 'product-images', 'marketplace-banners')
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins update marketplace images" ON storage.objects;
CREATE POLICY "Admins update marketplace images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('store-logos', 'store-banners', 'product-images', 'marketplace-banners')
  AND public.is_admin(auth.uid())
)
WITH CHECK (
  bucket_id IN ('store-logos', 'store-banners', 'product-images', 'marketplace-banners')
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins delete marketplace images" ON storage.objects;
CREATE POLICY "Admins delete marketplace images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('store-logos', 'store-banners', 'product-images', 'marketplace-banners')
  AND public.is_admin(auth.uid())
);

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
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.marketplace_settings(key, value)
VALUES (
  'home_banners',
  '{"banners":[]}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

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

-- After running this file, make sure your admin login user has an admin role.
-- Replace the UUID below with the user's auth.users.id, then run only this line if needed:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000000', 'admin') ON CONFLICT DO NOTHING;
