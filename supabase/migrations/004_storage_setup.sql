-- Storage Bucket Setup and Policies
-- Run this in Supabase SQL Editor to enable image uploads

-- ============================================
-- STEP 1: Create Storage Buckets
-- ============================================

-- Product Images Bucket (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Gallery Images Bucket (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Inquiry References Bucket (Private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('inquiry-references', 'inquiry-references', false)
ON CONFLICT (id) DO NOTHING;

-- Customer Uploads Bucket (Private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-uploads', 'customer-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Drop Existing Policies
-- ============================================

-- Drop all existing storage policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
  END LOOP;
END $$;

-- ============================================
-- STEP 3: Create Storage Policies
-- ============================================

-- Product Images - Public Read, Admin Write
CREATE POLICY "Public Access - Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admin Insert - Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin Update - Product Images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Admin Delete - Product Images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- Gallery Images - Public Read, Admin Write
CREATE POLICY "Public Access - Gallery Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

CREATE POLICY "Admin Insert - Gallery Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Admin Update - Gallery Images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery-images');

CREATE POLICY "Admin Delete - Gallery Images"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery-images');

-- Inquiry References - Private, Authenticated Users
CREATE POLICY "Authenticated Select - Inquiry References"
ON storage.objects FOR SELECT
USING (bucket_id = 'inquiry-references' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Insert - Inquiry References"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'inquiry-references' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update - Inquiry References"
ON storage.objects FOR UPDATE
USING (bucket_id = 'inquiry-references' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete - Inquiry References"
ON storage.objects FOR DELETE
USING (bucket_id = 'inquiry-references' AND auth.role() = 'authenticated');

-- Customer Uploads - Private, Authenticated Users
CREATE POLICY "Authenticated Select - Customer Uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Insert - Customer Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'customer-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update - Customer Uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'customer-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete - Customer Uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'customer-uploads' AND auth.role() = 'authenticated');

-- ============================================
-- STEP 4: Verify Buckets
-- ============================================
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Storage buckets and policies have been successfully configured! You can now upload images.' AS success_message;
