CREATE TABLE public.category_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 120),
  display_order integer NOT NULL DEFAULT 100 CHECK (display_order >= 0),
  rows integer NOT NULL DEFAULT 2 CHECK (rows IN (1, 2)),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.category_section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.category_sections(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 100 CHECK (display_order >= 0),
  UNIQUE(section_id, category_id)
);

GRANT SELECT ON public.category_sections, public.category_section_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.category_sections, public.category_section_items TO authenticated;
GRANT ALL ON public.category_sections, public.category_section_items TO service_role;
ALTER TABLE public.category_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_section_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active category sections" ON public.category_sections
  FOR SELECT USING (is_active OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage category sections" ON public.category_sections
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Public reads active category section items" ON public.category_section_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.category_sections s WHERE s.id = section_id AND (s.is_active OR public.is_admin(auth.uid()))));
CREATE POLICY "Admins manage category section items" ON public.category_section_items
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.category_sections(title, display_order, rows, is_active)
VALUES ('Grocery & Kitchen', 1, 2, true);

INSERT INTO public.category_section_items(section_id, category_id, display_order)
SELECT section.id, category.id, row_number() OVER (ORDER BY category.sort_order, category.label)
FROM public.category_sections section
JOIN public.categories category ON category.key IN ('grocery','bakery','fruits','vegetables','juice','pharmacy','food','gadgets')
WHERE section.title = 'Grocery & Kitchen'
ON CONFLICT(section_id, category_id) DO NOTHING;
