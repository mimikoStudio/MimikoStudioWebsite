-- ============================================
-- MIMIKO STUDIO - COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
-- This sets up everything automatically!
-- ============================================

-- STEP 1: Create admin helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- STEP 2: Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('gallery-images', 'gallery-images', true),
  ('inquiry-references', 'inquiry-references', false),
  ('customer-uploads', 'customer-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- STEP 3: Setup RLS for all tables (disable then re-enable with permissive policies)
DO $$ 
DECLARE 
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'categories', 'products', 'product_images', 'inquiries', 
    'appointments', 'orders', 'order_items', 'profiles', 
    'site_settings', 'wishlists', 'reviews', 'notifications', 
    'availability_slots'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    
    -- Drop existing policies
    EXECUTE format('DROP POLICY IF EXISTS "%I_all" ON %I', tbl, tbl);
    
    -- Create permissive policy for all operations
    EXECUTE format('CREATE POLICY "%I_all" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;

-- STEP 4: Setup storage policies
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_write" ON storage.objects;

CREATE POLICY "storage_public_read" 
ON storage.objects FOR SELECT 
USING (true);

CREATE POLICY "storage_authenticated_write" 
ON storage.objects FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- STEP 5: Seed default categories
INSERT INTO categories (name, slug, description, display_order, is_active)
VALUES 
  ('Hand-Painted Clothing', 'clothing', 'T-shirts, kurtis, sarees, dupattas, denim jackets & more', 1, true),
  ('Designer Bags', 'bags', 'Tote bags, canvas bags, sling bags, pouches & laptop sleeves', 2, true),
  ('Home Decor', 'home-decor', 'Cushion covers, table runners, wall hangings & more', 3, true),
  ('Fashion Accessories', 'accessories', 'Hand-painted shoes, caps, scarves & headbands', 4, true),
  ('Personalized Gifts', 'gifts', 'Custom gift bags, aprons, bookmarks & pouches', 5, true),
  ('Small Handmade Creations', 'small-creations', 'Scrunchies, hair bows, fabric earrings & keychains', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- STEP 6: Seed default site settings
INSERT INTO site_settings (setting_key, setting_value)
VALUES 
  ('site_name', 'Mimiko Studio'),
  ('site_tagline', 'Paint ♥ Create ♥ Be You'),
  ('whatsapp_number', '+917874291924'),
  ('instagram_handle', '@mimiko.studio24'),
  ('instagram_url', 'https://www.instagram.com/mimiko.studio24/'),
  ('shipping_fee', '99'),
  ('free_shipping_minimum', '1999'),
  ('currency', 'INR')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- STEP 7: Verify setup
SELECT 
  '✅ Database setup complete!' AS status,
  (SELECT COUNT(*) FROM categories) AS categories_count,
  (SELECT COUNT(*) FROM site_settings) AS settings_count,
  (SELECT COUNT(*) FROM storage.buckets) AS storage_buckets_count;

-- ============================================
-- SUCCESS! Your database is now fully configured.
-- You can now:
-- ✅ Add products with images
-- ✅ Manage categories
-- ✅ Handle customer inquiries
-- ✅ Schedule appointments
-- ✅ Update site settings
-- ============================================
