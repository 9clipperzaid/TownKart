-- Call ordering, upload buckets, detail pages, and relationship/index hardening.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'Cash on delivery',
  ADD COLUMN IF NOT EXISTS notes text;

CREATE TABLE IF NOT EXISTS public.call_order_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_phone text NOT NULL,
  secondary_phone text,
  whatsapp_number text,
  is_enabled boolean NOT NULL DEFAULT true,
  available_from text NOT NULL DEFAULT '09:00',
  available_to text NOT NULL DEFAULT '21:00',
  instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.call_order_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.call_order_settings TO authenticated;
GRANT ALL ON public.call_order_settings TO service_role;
ALTER TABLE public.call_order_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads call order settings" ON public.call_order_settings;
CREATE POLICY "Anyone reads call order settings" ON public.call_order_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage call order settings" ON public.call_order_settings;
CREATE POLICY "Admins manage call order settings" ON public.call_order_settings
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_call_order_settings_updated ON public.call_order_settings;
CREATE TRIGGER trg_call_order_settings_updated
  BEFORE UPDATE ON public.call_order_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.call_order_settings (
  primary_phone,
  secondary_phone,
  whatsapp_number,
  is_enabled,
  available_from,
  available_to,
  instructions
) VALUES (
  '+919999999999',
  null,
  '+919999999999',
  true,
  '09:00',
  '21:00',
  'Call us with your items, quantity, delivery address and preferred payment method.'
) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order
  ON public.order_status_history(order_id, created_at);

GRANT SELECT, INSERT ON public.order_status_history TO authenticated;
GRANT ALL ON public.order_status_history TO service_role;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and admins read status history" ON public.order_status_history;
CREATE POLICY "Users and admins read status history" ON public.order_status_history
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
        AND orders.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins write status history" ON public.order_status_history;
CREATE POLICY "Admins write status history" ON public.order_status_history
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON public.orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_store_category ON public.products(store_id, category);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_stores_name_search ON public.stores USING gin (to_tsvector('simple', name));

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('store-logos', 'store-logos', true),
  ('store-banners', 'store-banners', true),
  ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public reads marketplace images" ON storage.objects;
CREATE POLICY "Public reads marketplace images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('store-logos', 'store-banners', 'product-images'));

DROP POLICY IF EXISTS "Admins upload marketplace images" ON storage.objects;
CREATE POLICY "Admins upload marketplace images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('store-logos', 'store-banners', 'product-images')
    AND public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins update marketplace images" ON storage.objects;
CREATE POLICY "Admins update marketplace images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('store-logos', 'store-banners', 'product-images')
    AND public.is_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id IN ('store-logos', 'store-banners', 'product-images')
    AND public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins delete marketplace images" ON storage.objects;
CREATE POLICY "Admins delete marketplace images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('store-logos', 'store-banners', 'product-images')
    AND public.is_admin(auth.uid())
  );
