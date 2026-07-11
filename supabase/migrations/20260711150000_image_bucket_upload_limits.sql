-- Keep every admin image bucket within the same predictable upload contract.
UPDATE storage.buckets
SET
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id IN (
  'store-logos',
  'store-banners',
  'product-images',
  'marketplace-banners',
  'category-images'
);
