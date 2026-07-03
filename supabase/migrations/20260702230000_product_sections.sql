CREATE TABLE public.product_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 120),
  display_order integer NOT NULL DEFAULT 100 CHECK (display_order >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.product_sections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 100 CHECK (display_order >= 0),
  UNIQUE (section_id, product_id)
);

CREATE INDEX idx_product_sections_active_order
  ON public.product_sections(is_active, display_order);
CREATE INDEX idx_product_section_items_section_order
  ON public.product_section_items(section_id, display_order);

GRANT SELECT ON public.product_sections, public.product_section_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_sections, public.product_section_items TO authenticated;
GRANT ALL ON public.product_sections, public.product_section_items TO service_role;

ALTER TABLE public.product_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_section_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active product sections"
  ON public.product_sections FOR SELECT
  USING (is_active OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage product sections"
  ON public.product_sections FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public reads items from active product sections"
  ON public.product_section_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.product_sections section
      WHERE section.id = section_id
        AND (section.is_active OR public.is_admin(auth.uid()))
    )
  );

CREATE POLICY "Admins manage product section items"
  ON public.product_section_items FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Preserve the existing Popular products selection and ordering.
INSERT INTO public.product_sections (title, display_order, is_active)
SELECT 'Popular products', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.product_sections);

INSERT INTO public.product_section_items (section_id, product_id, display_order)
SELECT section.id, product.id, product.popular_sort_order
FROM public.product_sections section
CROSS JOIN public.products product
WHERE section.title = 'Popular products'
  AND product.is_popular = true
ON CONFLICT (section_id, product_id) DO NOTHING;
