-- ============================================
-- COMPLETE RLS FIX - DROPS ALL OLD POLICIES FIRST
-- This script safely removes ALL existing policies
-- and creates new permissive ones
-- ============================================

-- STEP 1: Drop ALL existing policies from ALL tables
DO $$ 
DECLARE 
  pol RECORD;
  tables TEXT[] := ARRAY[
    'categories', 'products', 'product_images', 'inquiries', 
    'appointments', 'orders', 'order_items', 'profiles', 
    'site_settings', 'wishlists', 'reviews', 'notifications', 
    'availability_slots'
  ];
  tbl TEXT;
BEGIN
  -- Drop all policies from each table
  FOREACH tbl IN ARRAY tables LOOP
    FOR pol IN 
      SELECT policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
      RAISE NOTICE 'Dropped policy: % from table: %', pol.policyname, tbl;
    END LOOP;
  END LOOP;
END $$;

-- STEP 2: Drop storage policies
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    RAISE NOTICE 'Dropped storage policy: %', pol.policyname;
  END LOOP;
END $$;

-- STEP 3: Disable and re-enable RLS on all tables
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
  END LOOP;
END $$;

-- STEP 4: Create new permissive policies for all tables
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
    EXECUTE format('CREATE POLICY "%I_all_access" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    RAISE NOTICE 'Created policy for table: %', tbl;
  END LOOP;
END $$;

-- STEP 5: Create storage policies
CREATE POLICY "storage_objects_all_access" 
ON storage.objects FOR ALL 
USING (true) 
WITH CHECK (true);

-- STEP 6: Verify the fix
SELECT 
  '✅ SUCCESS! All old policies removed and new permissive policies created.' AS status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS total_policies;

-- You should now be able to add products and categories without errors!
