import { supabase } from './supabase';

/**
 * SQL to create all required tables
 */
const CREATE_TABLES_SQL = `
-- Create hero_banners table
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_url TEXT,
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  tablet_image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 5000,
  transition_type TEXT DEFAULT 'fade',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create gallery_categories table
CREATE TABLE IF NOT EXISTS gallery_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES gallery_categories(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  long_description TEXT,
  cover_image_url TEXT,
  background_image_url TEXT,
  button_text TEXT,
  button_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add invoice_number to orders if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_banners_order ON hero_banners(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_active ON gallery_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_order ON gallery_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(display_order);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(display_order);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Enable RLS
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "hero_banners_public_read" ON hero_banners;
CREATE POLICY "hero_banners_public_read" ON hero_banners FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "hero_banners_admin_all" ON hero_banners;
CREATE POLICY "hero_banners_admin_all" ON hero_banners FOR ALL USING (true);

DROP POLICY IF EXISTS "gallery_categories_public_read" ON gallery_categories;
CREATE POLICY "gallery_categories_public_read" ON gallery_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "gallery_categories_admin_all" ON gallery_categories;
CREATE POLICY "gallery_categories_admin_all" ON gallery_categories FOR ALL USING (true);

DROP POLICY IF EXISTS "gallery_images_public_read" ON gallery_images;
CREATE POLICY "gallery_images_public_read" ON gallery_images FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "gallery_images_admin_all" ON gallery_images;
CREATE POLICY "gallery_images_admin_all" ON gallery_images FOR ALL USING (true);

DROP POLICY IF EXISTS "collections_public_read" ON collections;
CREATE POLICY "collections_public_read" ON collections FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "collections_admin_all" ON collections;
CREATE POLICY "collections_admin_all" ON collections FOR ALL USING (true);

DROP POLICY IF EXISTS "invoices_public_read" ON invoices;
CREATE POLICY "invoices_public_read" ON invoices FOR SELECT USING (true);

DROP POLICY IF EXISTS "invoices_admin_all" ON invoices;
CREATE POLICY "invoices_admin_all" ON invoices FOR ALL USING (true);

-- Create website-content storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-content',
  'website-content',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "website_content_public_read" ON storage.objects;
CREATE POLICY "website_content_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'website-content');

DROP POLICY IF EXISTS "website_content_auth_insert" ON storage.objects;
CREATE POLICY "website_content_auth_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'website-content' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "website_content_auth_update" ON storage.objects;
CREATE POLICY "website_content_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'website-content' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "website_content_auth_delete" ON storage.objects;
CREATE POLICY "website_content_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'website-content' AND auth.role() = 'authenticated');
`;

/**
 * Check if a table exists
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    // If no error or error is not "relation does not exist", table exists
    return !error || !error.message.includes('does not exist');
  } catch {
    return false;
  }
}

/**
 * Check if all required tables exist
 */
export async function checkRequiredTables(): Promise<{
  allExist: boolean;
  missing: string[];
}> {
  const requiredTables = [
    'hero_banners',
    'gallery_categories',
    'gallery_images',
    'collections',
    'invoices',
  ];

  const missing: string[] = [];

  for (const table of requiredTables) {
    const exists = await tableExists(table);
    if (!exists) {
      missing.push(table);
    }
  }

  return {
    allExist: missing.length === 0,
    missing,
  };
}

/**
 * Create all required tables
 */
export async function createRequiredTables(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Try to execute the SQL via RPC (if function exists)
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      sql_query: CREATE_TABLES_SQL,
    });

    if (!rpcError) {
      return { success: true };
    }

    // If RPC doesn't exist, we need to inform the user
    if (rpcError?.message.includes('function') || rpcError?.message.includes('rpc')) {
      return {
        success: false,
        error: 'Database setup required. Please run the SQL migration manually.',
      };
    }

    return {
      success: false,
      error: rpcError?.message || 'Failed to create tables',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create tables',
    };
  }
}

/**
 * Ensure all required tables exist, create them if they don't
 */
export async function ensureTablesExist(): Promise<{
  success: boolean;
  created: boolean;
  error?: string;
}> {
  try {
    // Check if tables exist
    const { allExist, missing } = await checkRequiredTables();

    if (allExist) {
      return { success: true, created: false };
    }

    console.log(`⚠️ Missing tables: ${missing.join(', ')}`);
    console.log('🔧 Creating missing tables...');

    // Try to create tables
    const result = await createRequiredTables();

    if (result.success) {
      console.log('✅ Tables created successfully');
      return { success: true, created: true };
    }

    // If automatic creation failed, provide manual instructions
    return {
      success: false,
      created: false,
      error: result.error,
    };
  } catch (error: any) {
    return {
      success: false,
      created: false,
      error: error.message || 'Failed to ensure tables exist',
    };
  }
}

/**
 * Get the SQL for manual execution
 */
export function getSetupSQL(): string {
  return CREATE_TABLES_SQL;
}
