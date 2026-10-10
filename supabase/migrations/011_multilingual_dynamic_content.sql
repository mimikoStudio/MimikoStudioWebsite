-- ============================================
-- MULTILINGUAL PRODUCT & CATEGORY SUPPORT
-- Phase 3: Dynamic Content Management
-- ============================================

-- STEP 1: Add multilingual fields to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS name_hi TEXT,
ADD COLUMN IF NOT EXISTS name_gu TEXT,
ADD COLUMN IF NOT EXISTS description_hi TEXT,
ADD COLUMN IF NOT EXISTS description_gu TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- STEP 2: Add multilingual fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS name_hi TEXT,
ADD COLUMN IF NOT EXISTS name_gu TEXT,
ADD COLUMN IF NOT EXISTS description_hi TEXT,
ADD COLUMN IF NOT EXISTS description_gu TEXT,
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS fabric_type TEXT,
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS pattern TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS share_url TEXT;

-- STEP 3: Add multilingual fields to collections table
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS name_hi TEXT,
ADD COLUMN IF NOT EXISTS name_gu TEXT,
ADD COLUMN IF NOT EXISTS short_description_hi TEXT,
ADD COLUMN IF NOT EXISTS short_description_gu TEXT,
ADD COLUMN IF NOT EXISTS long_description_hi TEXT,
ADD COLUMN IF NOT EXISTS long_description_gu TEXT;

-- STEP 4: Create product_collection_assignments table (if not exists)
CREATE TABLE IF NOT EXISTS product_collection_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, collection_id)
);

-- STEP 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_collection_product ON product_collection_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collection_collection ON product_collection_assignments(collection_id);

-- STEP 6: Enable RLS on new table
ALTER TABLE product_collection_assignments ENABLE ROW LEVEL SECURITY;

-- STEP 7: Create RLS policies
DROP POLICY IF EXISTS "product_collection_assignments_public_read" ON product_collection_assignments;
CREATE POLICY "product_collection_assignments_public_read" 
ON product_collection_assignments 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "product_collection_assignments_admin_all" ON product_collection_assignments;
CREATE POLICY "product_collection_assignments_admin_all" 
ON product_collection_assignments 
FOR ALL 
USING (true);

-- STEP 8: Create website_content_sections table for dynamic UI
CREATE TABLE IF NOT EXISTS website_content_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT NOT NULL UNIQUE,
  section_name TEXT NOT NULL,
  section_type TEXT NOT NULL, -- 'hero', 'banner', 'notification', 'button', 'textbox'
  content_en TEXT,
  content_hi TEXT,
  content_gu TEXT,
  image_url TEXT,
  button_label_en TEXT,
  button_label_hi TEXT,
  button_label_gu TEXT,
  button_url TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 9: Create indexes for website content
CREATE INDEX IF NOT EXISTS idx_website_content_type ON website_content_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_website_content_visible ON website_content_sections(is_visible);
CREATE INDEX IF NOT EXISTS idx_website_content_order ON website_content_sections(display_order);

-- STEP 10: Enable RLS
ALTER TABLE website_content_sections ENABLE ROW LEVEL SECURITY;

-- STEP 11: Create RLS policies
DROP POLICY IF EXISTS "website_content_public_read" ON website_content_sections;
CREATE POLICY "website_content_public_read" 
ON website_content_sections 
FOR SELECT 
USING (is_visible = true);

DROP POLICY IF EXISTS "website_content_admin_all" ON website_content_sections;
CREATE POLICY "website_content_admin_all" 
ON website_content_sections 
FOR ALL 
USING (true);

-- STEP 12: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_type TEXT NOT NULL, -- 'success', 'error', 'warning', 'info', 'promo'
  title_en TEXT NOT NULL,
  title_hi TEXT,
  title_gu TEXT,
  message_en TEXT NOT NULL,
  message_hi TEXT,
  message_gu TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  target_audience TEXT DEFAULT 'all', -- 'all', 'customers', 'admins'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 13: Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at);

-- STEP 14: Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- STEP 15: Create RLS policies
DROP POLICY IF EXISTS "notifications_public_read" ON notifications;
CREATE POLICY "notifications_public_read" 
ON notifications 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

DROP POLICY IF EXISTS "notifications_admin_all" ON notifications;
CREATE POLICY "notifications_admin_all" 
ON notifications 
FOR ALL 
USING (true);

-- STEP 16: Create business_profile table (if not exists)
CREATE TABLE IF NOT EXISTS business_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  tax_registration TEXT,
  invoice_footer_en TEXT,
  invoice_footer_hi TEXT,
  invoice_footer_gu TEXT,
  business_terms_en TEXT,
  business_terms_hi TEXT,
  business_terms_gu TEXT,
  default_currency TEXT DEFAULT 'INR',
  default_language TEXT DEFAULT 'en',
  social_links JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 17: Enable RLS
ALTER TABLE business_profile ENABLE ROW LEVEL SECURITY;

-- STEP 18: Create RLS policies
DROP POLICY IF EXISTS "business_profile_public_read" ON business_profile;
CREATE POLICY "business_profile_public_read" 
ON business_profile 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "business_profile_admin_all" ON business_profile;
CREATE POLICY "business_profile_admin_all" 
ON business_profile 
FOR ALL 
USING (true);

-- STEP 19: Insert default business profile
INSERT INTO business_profile (studio_name, default_currency, default_language)
VALUES ('Mimiko Studio', 'INR', 'en')
ON CONFLICT DO NOTHING;

-- STEP 20: Create invoice_snapshots table for immutable invoice records
CREATE TABLE IF NOT EXISTS invoice_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id),
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_finalized BOOLEAN NOT NULL DEFAULT false
);

-- STEP 21: Create indexes for invoice snapshots
CREATE INDEX IF NOT EXISTS idx_invoice_snapshots_invoice ON invoice_snapshots(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_snapshots_order ON invoice_snapshots(order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_snapshots_finalized ON invoice_snapshots(is_finalized);

-- STEP 22: Enable RLS
ALTER TABLE invoice_snapshots ENABLE ROW LEVEL SECURITY;

-- STEP 23: Create RLS policies
DROP POLICY IF EXISTS "invoice_snapshots_owner_read" ON invoice_snapshots;
CREATE POLICY "invoice_snapshots_owner_read" 
ON invoice_snapshots 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = invoice_snapshots.order_id 
    AND (orders.customer_id = auth.uid() OR auth.jwt()->>'role' = 'admin')
  )
);

DROP POLICY IF EXISTS "invoice_snapshots_admin_all" ON invoice_snapshots;
CREATE POLICY "invoice_snapshots_admin_all" 
ON invoice_snapshots 
FOR ALL 
USING (auth.jwt()->>'role' = 'admin');

-- STEP 24: Create sharing_audit table
CREATE TABLE IF NOT EXISTS sharing_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- 'product', 'invoice', 'collection'
  entity_id UUID NOT NULL,
  share_type TEXT NOT NULL, -- 'link', 'pdf', 'whatsapp', 'email', 'native'
  shared_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 25: Create indexes for sharing audit
CREATE INDEX IF NOT EXISTS idx_sharing_audit_entity ON sharing_audit(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sharing_audit_user ON sharing_audit(shared_by);
CREATE INDEX IF NOT EXISTS idx_sharing_audit_created ON sharing_audit(created_at);

-- STEP 26: Enable RLS
ALTER TABLE sharing_audit ENABLE ROW LEVEL SECURITY;

-- STEP 27: Create RLS policies
DROP POLICY IF EXISTS "sharing_audit_user_read" ON sharing_audit;
CREATE POLICY "sharing_audit_user_read" 
ON sharing_audit 
FOR SELECT 
USING (shared_by = auth.uid() OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "sharing_audit_insert" ON sharing_audit;
CREATE POLICY "sharing_audit_insert" 
ON sharing_audit 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- STEP 28: Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_website_content_updated_at ON website_content_sections;
CREATE TRIGGER update_website_content_updated_at
BEFORE UPDATE ON website_content_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_profile_updated_at ON business_profile;
CREATE TRIGGER update_business_profile_updated_at
BEFORE UPDATE ON business_profile
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- STEP 29: Verify migration
SELECT 
  '✅ Multilingual and dynamic content migration complete!' AS status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'categories' AND column_name LIKE '%_hi') AS category_hi_fields,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'products' AND column_name LIKE '%_hi') AS product_hi_fields,
  (SELECT COUNT(*) FROM website_content_sections) AS content_sections,
  (SELECT COUNT(*) FROM notifications) AS notifications,
  (SELECT COUNT(*) FROM business_profile) AS business_profiles;
