-- Fix RLS Policies for Admin Operations
-- Run this in Supabase SQL Editor to fix permission errors

-- ============================================
-- Helper function to check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CATEGORIES TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;

-- Create new policies
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin());

-- ============================================
-- PRODUCTS TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can view published products" ON products;

-- Create new policies
CREATE POLICY "Anyone can view published products"
  ON products FOR SELECT
  USING (is_published = true OR is_admin());

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (is_admin());

-- ============================================
-- PRODUCT IMAGES TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view product images" ON product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
DROP POLICY IF EXISTS "Anyone can view product images" ON products;

-- Create new policies
CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert product images"
  ON product_images FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product images"
  ON product_images FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete product images"
  ON product_images FOR DELETE
  USING (is_admin());

-- ============================================
-- INQUIRIES TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can manage inquiries" ON inquiries;

-- Create new policies
CREATE POLICY "Anyone can view own inquiries"
  ON inquiries FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Anyone can insert inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update inquiries"
  ON inquiries FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete inquiries"
  ON inquiries FOR DELETE
  USING (is_admin());

-- ============================================
-- APPOINTMENTS TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can manage appointments" ON appointments;

-- Create new policies
CREATE POLICY "Anyone can view own appointments"
  ON appointments FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Anyone can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update appointments"
  ON appointments FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  USING (is_admin());

-- ============================================
-- ORDERS TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;

-- Create new policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    customer_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR is_admin());

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  USING (is_admin());

-- ============================================
-- ORDER ITEMS TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;

-- Create new policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_items.order_id 
      AND (customer_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Authenticated users can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_items.order_id 
      AND (customer_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Admins can update order items"
  ON order_items FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE
  USING (is_admin());

-- ============================================
-- PROFILES TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Create new policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin());

-- ============================================
-- SITE SETTINGS TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON site_settings;

-- Create new policies
CREATE POLICY "Anyone can view settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert settings"
  ON site_settings FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update settings"
  ON site_settings FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete settings"
  ON site_settings FOR DELETE
  USING (is_admin());

-- ============================================
-- WISHLISTS TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlists;

-- Create new policies
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own wishlist"
  ON wishlists FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can delete own wishlist"
  ON wishlists FOR DELETE
  USING (customer_id = auth.uid());

-- ============================================
-- REVIEWS TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;

-- Create new policies
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true OR is_admin());

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (customer_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  USING (is_admin());

-- ============================================
-- NOTIFICATIONS TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;

-- Create new policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  USING (is_admin());

-- ============================================
-- AVAILABILITY SLOTS TABLE - Fix RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view available slots" ON availability_slots;
DROP POLICY IF EXISTS "Admins can manage slots" ON availability_slots;

-- Create new policies
CREATE POLICY "Anyone can view available slots"
  ON availability_slots FOR SELECT
  USING (is_available = true OR is_admin());

CREATE POLICY "Admins can insert slots"
  ON availability_slots FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update slots"
  ON availability_slots FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete slots"
  ON availability_slots FOR DELETE
  USING (is_admin());

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ All RLS policies have been updated successfully!' AS message;
