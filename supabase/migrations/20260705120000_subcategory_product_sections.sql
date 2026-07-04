CREATE TABLE IF NOT EXISTS public.subcategory_product_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 80),
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory_section_id UUID
  REFERENCES public.subcategory_product_sections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subcategory_product_sections_order
  ON public.subcategory_product_sections(subcategory_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_section
  ON public.products(subcategory_section_id) WHERE subcategory_section_id IS NOT NULL;

ALTER TABLE public.subcategory_product_sections ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.subcategory_product_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subcategory_product_sections TO authenticated;
GRANT ALL ON public.subcategory_product_sections TO service_role;

DROP POLICY IF EXISTS "Public reads enabled subcategory product sections" ON public.subcategory_product_sections;
CREATE POLICY "Public reads enabled subcategory product sections"
ON public.subcategory_product_sections FOR SELECT
USING (is_enabled = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins create subcategory product sections" ON public.subcategory_product_sections;
CREATE POLICY "Admins create subcategory product sections"
ON public.subcategory_product_sections FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update subcategory product sections" ON public.subcategory_product_sections;
CREATE POLICY "Admins update subcategory product sections"
ON public.subcategory_product_sections FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete subcategory product sections" ON public.subcategory_product_sections;
CREATE POLICY "Admins delete subcategory product sections"
ON public.subcategory_product_sections FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));
