CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE CHECK (key ~ '^[a-z0-9_-]+$'),
  label TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subcategories_category_order
  ON public.subcategories(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_subcategory
  ON public.products(subcategory_id) WHERE subcategory_id IS NOT NULL;

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.subcategories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subcategories TO authenticated;
GRANT ALL ON public.subcategories TO service_role;

DROP POLICY IF EXISTS "Public reads enabled subcategories" ON public.subcategories;
CREATE POLICY "Public reads enabled subcategories" ON public.subcategories
FOR SELECT USING (is_enabled = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins create subcategories" ON public.subcategories;
CREATE POLICY "Admins create subcategories" ON public.subcategories
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update subcategories" ON public.subcategories;
CREATE POLICY "Admins update subcategories" ON public.subcategories
FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete subcategories" ON public.subcategories;
CREATE POLICY "Admins delete subcategories" ON public.subcategories
FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

