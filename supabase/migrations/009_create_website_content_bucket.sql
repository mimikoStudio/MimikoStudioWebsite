-- ============================================
-- CREATE WEBSITE-CONTENT STORAGE BUCKET
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the website-content bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-content',
  'website-content',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the bucket
-- Public read access
DROP POLICY IF EXISTS "website_content_public_read" ON storage.objects;
CREATE POLICY "website_content_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'website-content');

-- Authenticated users can upload
DROP POLICY IF EXISTS "website_content_auth_insert" ON storage.objects;
CREATE POLICY "website_content_auth_insert"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'website-content'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update
DROP POLICY IF EXISTS "website_content_auth_update" ON storage.objects;
CREATE POLICY "website_content_auth_update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'website-content'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete
DROP POLICY IF EXISTS "website_content_auth_delete" ON storage.objects;
CREATE POLICY "website_content_auth_delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'website-content'
  AND auth.role() = 'authenticated'
);

-- Verify
SELECT 
  '✅ website-content bucket created successfully!' AS status,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'website-content') AS bucket_exists;
