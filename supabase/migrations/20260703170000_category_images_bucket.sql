INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('category-images', 'category-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public reads category images" ON storage.objects;
CREATE POLICY "Public reads category images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Admins upload category images" ON storage.objects;
CREATE POLICY "Admins upload category images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'category-images' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update category images" ON storage.objects;
CREATE POLICY "Admins update category images" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'category-images' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'category-images' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete category images" ON storage.objects;
CREATE POLICY "Admins delete category images" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'category-images' AND public.is_admin(auth.uid()));
