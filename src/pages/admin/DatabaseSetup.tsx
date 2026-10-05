import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertCircle, Loader, Database, ExternalLink, Copy, Zap } from 'lucide-react';

export default function DatabaseSetup() {
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoResult, setAutoResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setChecking(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: '__setup_test__', slug: '__setup_test__', is_active: false }]);

      if (error) {
        setNeedsSetup(true);
      } else {
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

  const runAutoSetup = async () => {
    setAutoRunning(true);
    setAutoResult(null);

    try {
      // Call the auto-setup Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-setup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const result = await response.json();
      setAutoResult(result);

      if (result.success && !result.rlsNeedsFix) {
        setSetupComplete(true);
        setNeedsSetup(false);
      }
    } catch (error: any) {
      setAutoResult({
        success: false,
        error: error.message,
        message: 'Auto-setup failed. Please use manual setup.'
      });
    } finally {
      setAutoRunning(false);
    }
  };

  const testSetup = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const { error: catError } = await supabase
        .from('categories')
        .insert([{ name: '__test__', slug: '__test__', is_active: false }]);

      if (catError) {
        setTestResult({ success: false, message: '❌ Categories table not configured' });
        setTesting(false);
        return;
      }

      await supabase.from('categories').delete().eq('slug', '__test__');

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
        setTestResult({ success: false, message: '❌ Products table not configured - RLS fix needed' });
        setTesting(false);
        return;
      }

      await supabase.from('products').delete().eq('slug', '__test__');

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
    navigator.clipboard.writeText(SETUP_SQL);
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
            onClick={() => window.location.hash = '/admin'}
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
              🔧 Database Setup
            </h1>
            <p className="text-coffee/60">
              Choose how you want to set up your database
            </p>
          </div>

          {/* Mode Selection */}
          <div className="mb-8 p-4 bg-cream/50 rounded-sm">
            <p className="text-sm font-medium text-chocolate mb-3">Setup method:</p>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('auto')}
                className={`flex-1 p-4 rounded-sm border-2 transition-all ${
                  mode === 'auto'
                    ? 'border-gold bg-gold/10'
                    : 'border-beige hover:border-gold/50'
                }`}
              >
                <Zap size={24} className="mx-auto mb-2 text-gold" />
                <p className="font-medium text-chocolate text-sm">⚡ Automatic Setup</p>
                <p className="text-xs text-coffee/60 mt-1">One-click, no SQL needed</p>
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 p-4 rounded-sm border-2 transition-all ${
                  mode === 'manual'
                    ? 'border-gold bg-gold/10'
                    : 'border-beige hover:border-gold/50'
                }`}
              >
                <Database size={24} className="mx-auto mb-2 text-gold" />
                <p className="font-medium text-chocolate text-sm">🔧 Manual Setup</p>
                <p className="text-xs text-coffee/60 mt-1">Copy & paste SQL</p>
              </button>
            </div>
          </div>

          {/* Automatic Setup Mode */}
          {mode === 'auto' && (
            <div className="space-y-6">
              <div className="bg-sage/10 border border-sage/20 rounded-sm p-4">
                <p className="text-sm text-sage">
                  <strong>✨ Automatic Setup:</strong> Click the button below and we'll configure everything automatically. No SQL knowledge required!
                </p>
              </div>

              {!autoRunning && !autoResult && (
                <div className="text-center">
                  <button
                    onClick={runAutoSetup}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    <Zap size={20} className="inline mr-2" />
                    Run Automatic Setup
                  </button>
                  <p className="text-xs text-coffee/50 mt-3">
                    This will configure all tables, permissions, and default data
                  </p>
                </div>
              )}

              {autoRunning && (
                <div className="text-center py-8">
                  <Loader size={48} className="mx-auto text-gold animate-spin mb-4" />
                  <p className="text-coffee/70">Setting up your database...</p>
                  <p className="text-xs text-coffee/50 mt-2">This may take a few seconds</p>
                </div>
              )}

              {autoResult && (
                <div className={`p-6 rounded-sm ${
                  autoResult.success && !autoResult.rlsNeedsFix
                    ? 'bg-sage/10 border border-sage/20'
                    : 'bg-blush/10 border border-blush/20'
                }`}>
                  <h3 className="font-heading text-lg text-chocolate mb-3">
                    {autoResult.success && !autoResult.rlsNeedsFix ? '✅ Setup Complete!' : '⚠️ Setup Partially Complete'}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {autoResult.results?.map((result: string, index: number) => (
                      <p key={index} className="text-sm text-chocolate">{result}</p>
                    ))}
                  </div>

                  {autoResult.rlsNeedsFix && (
                    <div className="mt-4 p-4 bg-white/50 rounded-sm">
                      <p className="text-sm text-chocolate mb-2">
                        <strong>RLS Fix Required:</strong> The automatic setup couldn't fix RLS policies. Please switch to Manual Setup mode and run the SQL script.
                      </p>
                      <button
                        onClick={() => setMode('manual')}
                        className="btn-outline mt-2"
                      >
                        Switch to Manual Setup
                      </button>
                    </div>
                  )}

                  {autoResult.success && !autoResult.rlsNeedsFix && (
                    <button
                      onClick={() => window.location.reload()}
                      className="btn-primary mt-4"
                    >
                      Continue to Dashboard
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Setup Mode */}
          {mode === 'manual' && (
            <div className="space-y-6">
              <div className="bg-blush/10 border border-blush/20 rounded-sm p-4">
                <p className="text-sm text-blush">
                  <strong>⚠️ Manual Setup:</strong> You'll need to copy and run SQL in Supabase. Use this if automatic setup doesn't work.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4">
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

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-chocolate flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg text-chocolate mb-2">
                      Copy the SQL Script
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
                        <code>{SETUP_SQL}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-chocolate flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg text-chocolate mb-2">
                      Paste and Click "Run"
                    </h3>
                    <p className="text-sm text-coffee/60">
                      Paste the SQL in the editor and click the "Run" button
                    </p>
                  </div>
                </div>

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SETUP_SQL = `-- ============================================
-- COMPLETE RLS FIX - DROPS ALL OLD POLICIES FIRST
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
  FOREACH tbl IN ARRAY tables LOOP
    FOR pol IN 
      SELECT policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
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
  END LOOP;
END $$;

-- STEP 5: Create storage policies
CREATE POLICY "storage_objects_all_access" 
ON storage.objects FOR ALL 
USING (true) 
WITH CHECK (true);

-- STEP 6: Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('gallery-images', 'gallery-images', true),
  ('inquiry-references', 'inquiry-references', false),
  ('customer-uploads', 'customer-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- STEP 7: Seed default categories
INSERT INTO categories (name, slug, description, display_order, is_active)
VALUES 
  ('Hand-Painted Clothing', 'clothing', 'T-shirts, kurtis, sarees, dupattas & more', 1, true),
  ('Designer Bags', 'bags', 'Tote bags, canvas bags, sling bags & more', 2, true),
  ('Home Decor', 'home-decor', 'Cushion covers, table runners & more', 3, true),
  ('Fashion Accessories', 'accessories', 'Shoes, caps, scarves & headbands', 4, true),
  ('Personalized Gifts', 'gifts', 'Custom gift bags, aprons & more', 5, true),
  ('Small Handmade Creations', 'small-creations', 'Scrunchies, bows, earrings & keychains', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- STEP 8: Seed default settings
INSERT INTO site_settings (setting_key, setting_value)
VALUES 
  ('site_name', 'Mimiko Studio'),
  ('site_tagline', 'Paint ♥ Create ♥ Be You'),
  ('whatsapp_number', '+917874291924'),
  ('instagram_handle', '@mimiko.studio24'),
  ('instagram_url', 'https://www.instagram.com/mimiko.studio24/'),
  ('currency', 'INR')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

SELECT '✅ Database setup complete!' AS status;`;
