-- Home carousel banners and upload bucket.

INSERT INTO public.marketplace_settings(key, value)
VALUES (
  'home_banners',
  '{"banners":[]}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
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

DROP POLICY IF EXISTS "Public reads marketplace banner images" ON storage.objects;
CREATE POLICY "Public reads marketplace banner images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'marketplace-banners');

DROP POLICY IF EXISTS "Admins upload marketplace banner images" ON storage.objects;
CREATE POLICY "Admins upload marketplace banner images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marketplace-banners'
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins update marketplace banner images" ON storage.objects;
CREATE POLICY "Admins update marketplace banner images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'marketplace-banners'
  AND public.is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'marketplace-banners'
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins delete marketplace banner images" ON storage.objects;
CREATE POLICY "Admins delete marketplace banner images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'marketplace-banners'
  AND public.is_admin(auth.uid())
);
