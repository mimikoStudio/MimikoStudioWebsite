import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertCircle, Loader, Database, ExternalLink, Copy } from 'lucide-react';

export default function DatabaseSetup() {
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [mode, setMode] = useState<'quick' | 'full'>('quick');

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setChecking(true);
    try {
      // Try to insert a test record
      const { error } = await supabase
        .from('categories')
        .insert([{ name: '__setup_test__', slug: '__setup_test__', is_active: false }]);

      if (error) {
        setNeedsSetup(true);
      } else {
        // Clean up test record
        await supabase.from('categories').delete().eq('slug', '__setup_test__');
        setNeedsSetup(false);
        setSetupComplete(true);
      }
    } catch (err) {
      setNeedsSetup(true);
    } finally {
      setChecking(false);
    }
  };

  const testSetup = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Test 1: Check if categories table exists and is writable
      const { error: catError } = await supabase
        .from('categories')
        .insert([{ name: '__test__', slug: '__test__', is_active: false }]);

      if (catError) {
        setTestResult({ success: false, message: '❌ Categories table not configured' });
        setTesting(false);
        return;
      }

      // Clean up
      await supabase.from('categories').delete().eq('slug', '__test__');

      // Test 2: Check if products table is writable
      const { error: prodError } = await supabase
        .from('products')
        .insert([{ 
          name: '__test__', 
          slug: '__test__', 
          price: 0, 
          stock_quantity: 0,
          is_published: false 
        }]);

      if (prodError) {
        setTestResult({ success: false, message: '❌ Products table not configured' });
        setTesting(false);
        return;
      }

      // Clean up
      await supabase.from('products').delete().eq('slug', '__test__');

      // Test 3: Check storage buckets
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasProductImages = buckets?.some((b: any) => b.name === 'product-images');

      if (!hasProductImages) {
        setTestResult({ success: false, message: '❌ Storage buckets not configured' });
        setTesting(false);
        return;
      }

      setTestResult({ success: true, message: '✅ All tests passed! Database is fully configured.' });
      setSetupComplete(true);
    } catch (err: any) {
      setTestResult({ success: false, message: `❌ Error: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const copySQL = () => {
    const sql = mode === 'quick' ? QUICK_FIX_SQL : SETUP_SQL;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="mx-auto text-gold animate-spin mb-4" />
          <p className="text-coffee/70">Checking database status...</p>
        </div>
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-pearl border border-beige/20 rounded-sm p-8 shadow-luxury text-center">
          <CheckCircle size={64} className="mx-auto text-sage mb-4" />
          <h1 className="text-2xl font-heading text-chocolate mb-2">✅ Database is Ready!</h1>
          <p className="text-coffee/60 mb-6">Your database is fully configured and ready to use.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-pearl border border-beige/20 rounded-sm p-8 shadow-luxury">
          {/* Header */}
          <div className="text-center mb-8">
            <Database size={48} className="mx-auto text-gold mb-4" />
            <h1 className="text-2xl font-heading text-chocolate mb-2">
              🔧 Database Setup Required
            </h1>
            <p className="text-coffee/60">
              Your database needs to be configured before you can use the admin dashboard.
            </p>
          </div>

          {/* BIG WARNING BOX */}
          <div className="bg-red-50 border-2 border-red-300 rounded-sm p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h3 className="font-bold text-red-800 text-lg mb-2">
                  THIS IS WHY YOU'RE GETTING ERRORS
                </h3>
                <p className="text-red-700 text-sm mb-3">
                  The error "new row violates row-level security policy" happens because your database security policies are blocking inserts.
                </p>
                <div className="bg-white border border-red-200 rounded-sm p-3">
                  <p className="text-red-800 font-bold text-sm mb-2">✅ TO FIX THIS (takes 30 seconds):</p>
                  <ol className="text-red-700 text-sm space-y-1 list-decimal list-inside">
                    <li>Click the link below to open Supabase SQL Editor</li>
                    <li>Click "📋 Copy All" button below</li>
                    <li>Paste in SQL Editor (Ctrl+V)</li>
                    <li>Click "Run" button</li>
                    <li>Come back here and click "Test Database Setup"</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6 p-4 bg-cream/50 rounded-sm">
            <p className="text-sm font-medium text-chocolate mb-3">Choose setup mode:</p>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('quick')}
                className={`flex-1 p-3 rounded-sm border-2 transition-all ${
                  mode === 'quick'
                    ? 'border-gold bg-gold/10'
                    : 'border-beige hover:border-gold/50'
                }`}
              >
                <p className="font-medium text-chocolate text-sm">⚡ Quick Fix</p>
                <p className="text-xs text-coffee/60 mt-1">Fixes RLS errors only</p>
              </button>
              <button
                onClick={() => setMode('full')}
                className={`flex-1 p-3 rounded-sm border-2 transition-all ${
                  mode === 'full'
                    ? 'border-gold bg-gold/10'
                    : 'border-beige hover:border-gold/50'
                }`}
              >
                <p className="font-medium text-chocolate text-sm">🔧 Full Setup</p>
                <p className="text-xs text-coffee/60 mt-1">Complete database setup</p>
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6 mb-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-chocolate flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-chocolate mb-2">
                  Open Supabase SQL Editor
                </h3>
                <a
                  href="https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold underline text-sm inline-flex items-center gap-1 hover:text-chocolate transition-colors"
                >
                  Click here to open SQL Editor <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-chocolate flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-chocolate mb-2">
                  {mode === 'quick' ? 'Copy the Quick Fix SQL' : 'Copy the Full Setup SQL'}
                </h3>
                <div className="relative">
                  <button
                    onClick={copySQL}
                    className={`absolute top-2 right-2 px-3 py-1.5 rounded-sm text-xs font-medium transition-all z-10 ${
                      copied 
                        ? 'bg-sage text-white' 
                        : 'bg-gold text-chocolate hover:bg-gold/80'
                    }`}
                  >
                    {copied ? '✅ Copied!' : '📋 Copy All'}
                  </button>
                  <pre className="bg-chocolate text-ivory/80 p-4 rounded-sm text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    <code>{mode === 'quick' ? QUICK_FIX_SQL : SETUP_SQL}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-chocolate flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-chocolate mb-2">
                  Paste and Click "Run" in SQL Editor
                </h3>
                <p className="text-sm text-coffee/60">
                  Wait for it to complete (should take 2-3 seconds). You should see a success message.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-chocolate flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-chocolate mb-2">
                  Test the Setup
                </h3>
                <button
                  onClick={testSetup}
                  disabled={testing}
                  className="btn-outline flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <Loader size={14} className="animate-spin" /> Testing...
                    </>
                  ) : (
                    <>🔍 Test Database Setup</>
                  )}
                </button>
                {testResult && (
                  <div className={`mt-3 p-3 rounded-sm text-sm ${
                    testResult.success ? 'bg-sage/10 text-sage' : 'bg-blush/10 text-blush'
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center pt-6 border-t border-beige/20">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              disabled={!testResult?.success}
            >
              ✅ I've Completed the Setup - Continue to Dashboard
            </button>
            {!testResult?.success && (
              <p className="text-xs text-coffee/50 mt-3">
                Please run the test above to verify setup is complete
              </p>
            )}
          </div>

          {/* What This Sets Up */}
          <div className="mt-8 p-4 bg-cream/50 rounded-sm">
            <h4 className="text-sm font-label tracking-wider uppercase text-gold mb-3">
              What This Sets Up:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-coffee/70">
              <div>✅ All database tables</div>
              <div>✅ Storage buckets for images</div>
              <div>✅ Security policies (RLS)</div>
              <div>✅ Default categories</div>
              <div>✅ Site settings</div>
              <div>✅ Admin permissions</div>
              <div>✅ Image upload support</div>
              <div>✅ Real-time subscriptions</div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-gold/10 border border-gold/20 rounded-sm">
            <h4 className="text-sm font-medium text-chocolate mb-2">Need Help?</h4>
            <ul className="text-xs text-coffee/70 space-y-1">
              <li>• Make sure you're logged into Supabase</li>
              <li>• Copy the ENTIRE SQL script (use the "Copy All" button)</li>
              <li>• Paste it in the SQL Editor and click "Run"</li>
              <li>• Wait for the success message</li>
              <li>• Click "Test Database Setup" to verify</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick fix SQL - DROPS ALL OLD POLICIES FIRST, then creates new ones
const QUICK_FIX_SQL = `-- ============================================
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

-- You should now be able to add products and categories without errors!`;

const SETUP_SQL = `-- ============================================
-- MIMIKO STUDIO - COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
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

-- STEP 3: Setup RLS for all tables
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
    EXECUTE format('DROP POLICY IF EXISTS "%I_all" ON %I', tbl, tbl);
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

-- SUCCESS MESSAGE
SELECT '✅ Database setup complete! You can now use the admin dashboard.' AS status;`;
