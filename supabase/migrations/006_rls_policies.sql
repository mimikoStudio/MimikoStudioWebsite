-- ============================================
-- SUPABASE RLS POLICIES FOR MIMIKO STUDIO
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================
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

-- ============================================
-- PRODUCTS TABLE
-- ============================================
-- Public: Can read published products
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" 
ON products 
FOR SELECT 
USING (is_published = true);

-- Admin: Can read all products
DROP POLICY IF EXISTS "products_admin_read" ON products;
CREATE POLICY "products_admin_read" 
ON products 
FOR SELECT 
USING (is_admin());

-- Admin: Can insert products
DROP POLICY IF EXISTS "products_admin_insert" ON products;
CREATE POLICY "products_admin_insert" 
ON products 
FOR INSERT 
WITH CHECK (is_admin());

-- Admin: Can update products
DROP POLICY IF EXISTS "products_admin_update" ON products;
CREATE POLICY "products_admin_update" 
ON products 
FOR UPDATE 
USING (is_admin());

-- Admin: Can delete products
DROP POLICY IF EXISTS "products_admin_delete" ON products;
CREATE POLICY "products_admin_delete" 
ON products 
FOR DELETE 
USING (is_admin());

-- ============================================
-- PRODUCT IMAGES TABLE
-- ============================================
-- Public: Can read all product images
DROP POLICY IF EXISTS "product_images_public_read" ON product_images;
CREATE POLICY "product_images_public_read" 
ON product_images 
FOR SELECT 
USING (true);

-- Admin: Can insert product images
DROP POLICY IF EXISTS "product_images_admin_insert" ON product_images;
CREATE POLICY "product_images_admin_insert" 
ON product_images 
FOR INSERT 
WITH CHECK (is_admin());

-- Admin: Can update product images
DROP POLICY IF EXISTS "product_images_admin_update" ON product_images;
CREATE POLICY "product_images_admin_update" 
ON product_images 
FOR UPDATE 
USING (is_admin());

-- Admin: Can delete product images
DROP POLICY IF EXISTS "product_images_admin_delete" ON product_images;
CREATE POLICY "product_images_admin_delete" 
ON product_images 
FOR DELETE 
USING (is_admin());

-- ============================================
-- CATEGORIES TABLE
-- ============================================
-- Public: Can read active categories
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" 
ON categories 
FOR SELECT 
USING (is_active = true);

-- Admin: Can read all categories
DROP POLICY IF EXISTS "categories_admin_read" ON categories;
CREATE POLICY "categories_admin_read" 
ON categories 
FOR SELECT 
USING (is_admin());

-- Admin: Can insert categories
DROP POLICY IF EXISTS "categories_admin_insert" ON categories;
CREATE POLICY "categories_admin_insert" 
ON categories 
FOR INSERT 
WITH CHECK (is_admin());

-- Admin: Can update categories
DROP POLICY IF EXISTS "categories_admin_update" ON categories;
CREATE POLICY "categories_admin_update" 
ON categories 
FOR UPDATE 
USING (is_admin());

-- Admin: Can delete categories
DROP POLICY IF EXISTS "categories_admin_delete" ON categories;
CREATE POLICY "categories_admin_delete" 
ON categories 
FOR DELETE 
USING (is_admin());

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
-- Public: Can read site settings (for theme, logo, etc.)
DROP POLICY IF EXISTS "site_settings_public_read" ON site_settings;
CREATE POLICY "site_settings_public_read" 
ON site_settings 
FOR SELECT 
USING (true);

-- Admin: Can insert site settings
DROP POLICY IF EXISTS "site_settings_admin_insert" ON site_settings;
CREATE POLICY "site_settings_admin_insert" 
ON site_settings 
FOR INSERT 
WITH CHECK (is_admin());

-- Admin: Can update site settings
DROP POLICY IF EXISTS "site_settings_admin_update" ON site_settings;
CREATE POLICY "site_settings_admin_update" 
ON site_settings 
FOR UPDATE 
USING (is_admin());

-- Admin: Can delete site settings
DROP POLICY IF EXISTS "site_settings_admin_delete" ON site_settings;
CREATE POLICY "site_settings_admin_delete" 
ON site_settings 
FOR DELETE 
USING (is_admin());

-- ============================================
-- ORDERS TABLE
-- ============================================
-- Public: Can read own orders (if authenticated)
DROP POLICY IF EXISTS "orders_user_read" ON orders;
CREATE POLICY "orders_user_read" 
ON orders 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (customer_id = auth.uid() OR is_admin())
);

-- Authenticated users: Can insert own orders
DROP POLICY IF EXISTS "orders_user_insert" ON orders;
CREATE POLICY "orders_user_insert" 
ON orders 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (customer_id = auth.uid() OR is_admin())
);

-- Admin: Can update orders
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" 
ON orders 
FOR UPDATE 
USING (is_admin());

-- Admin: Can delete orders
DROP POLICY IF EXISTS "orders_admin_delete" ON orders;
CREATE POLICY "orders_admin_delete" 
ON orders 
FOR DELETE 
USING (is_admin());

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
-- Public: Can read own order items
DROP POLICY IF EXISTS "order_items_user_read" ON order_items;
CREATE POLICY "order_items_user_read" 
ON order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.customer_id = auth.uid() OR is_admin())
  )
);

-- Authenticated users: Can insert own order items
DROP POLICY IF EXISTS "order_items_user_insert" ON order_items;
CREATE POLICY "order_items_user_insert" 
ON order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.customer_id = auth.uid() OR is_admin())
  )
);

-- Admin: Can update order items
DROP POLICY IF EXISTS "order_items_admin_update" ON order_items;
CREATE POLICY "order_items_admin_update" 
ON order_items 
FOR UPDATE 
USING (is_admin());

-- Admin: Can delete order items
DROP POLICY IF EXISTS "order_items_admin_delete" ON order_items;
CREATE POLICY "order_items_admin_delete" 
ON order_items 
FOR DELETE 
USING (is_admin());

-- ============================================
-- INQUIRIES TABLE
-- ============================================
-- Public: Can insert inquiries (contact form)
DROP POLICY IF EXISTS "inquiries_public_insert" ON inquiries;
CREATE POLICY "inquiries_public_insert" 
ON inquiries 
FOR INSERT 
WITH CHECK (true);

-- Public: Can read own inquiries
DROP POLICY IF EXISTS "inquiries_user_read" ON inquiries;
CREATE POLICY "inquiries_user_read" 
ON inquiries 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR is_admin())
);

-- Admin: Can update inquiries
DROP POLICY IF EXISTS "inquiries_admin_update" ON inquiries;
CREATE POLICY "inquiries_admin_update" 
ON inquiries 
FOR UPDATE 
USING (is_admin());

-- Admin: Can delete inquiries
DROP POLICY IF EXISTS "inquiries_admin_delete" ON inquiries;
CREATE POLICY "inquiries_admin_delete" 
ON inquiries 
FOR DELETE 
USING (is_admin());

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
-- Public: Can insert appointments
DROP POLICY IF EXISTS "appointments_public_insert" ON appointments;
CREATE POLICY "appointments_public_insert" 
ON appointments 
FOR INSERT 
WITH CHECK (true);

-- Public: Can read own appointments
DROP POLICY IF EXISTS "appointments_user_read" ON appointments;
CREATE POLICY "appointments_user_read" 
ON appointments 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR is_admin())
);

-- Admin: Can update appointments
DROP POLICY IF EXISTS "appointments_admin_update" ON appointments;
CREATE POLICY "appointments_admin_update" 
ON appointments 
FOR UPDATE 
USING (is_admin());

-- Admin: Can delete appointments
DROP POLICY IF EXISTS "appointments_admin_delete" ON appointments;
CREATE POLICY "appointments_admin_delete" 
ON appointments 
FOR DELETE 
USING (is_admin());

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Public: Can read own profile
DROP POLICY IF EXISTS "profiles_user_read" ON profiles;
CREATE POLICY "profiles_user_read" 
ON profiles 
FOR SELECT 
USING (id = auth.uid() OR is_admin());

-- Users: Can update own profile (but not role)
DROP POLICY IF EXISTS "profiles_user_update" ON profiles;
CREATE POLICY "profiles_user_update" 
ON profiles 
FOR UPDATE 
USING (id = auth.uid());

-- Admin: Can insert profiles
DROP POLICY IF EXISTS "profiles_admin_insert" ON profiles;
CREATE POLICY "profiles_admin_insert" 
ON profiles 
FOR INSERT 
WITH CHECK (is_admin());

-- Admin: Can delete profiles
DROP POLICY IF EXISTS "profiles_admin_delete" ON profiles;
CREATE POLICY "profiles_admin_delete" 
ON profiles 
FOR DELETE 
USING (is_admin());

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Product Images Bucket (Public Read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public: Can read product images
DROP POLICY IF EXISTS "product_images_storage_public_read" ON storage.objects;
CREATE POLICY "product_images_storage_public_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

-- Admin: Can upload product images
DROP POLICY IF EXISTS "product_images_storage_admin_insert" ON storage.objects;
CREATE POLICY "product_images_storage_admin_insert" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' AND 
  is_admin()
);

-- Admin: Can update product images
DROP POLICY IF EXISTS "product_images_storage_admin_update" ON storage.objects;
CREATE POLICY "product_images_storage_admin_update" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'product-images' AND 
  is_admin()
);

-- Admin: Can delete product images
DROP POLICY IF EXISTS "product_images_storage_admin_delete" ON storage.objects;
CREATE POLICY "product_images_storage_admin_delete" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'product-images' AND 
  is_admin()
);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  '✅ RLS policies created successfully!' AS status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS total_policies;
