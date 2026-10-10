-- ============================================
-- INVOICE SYSTEM MIGRATION
-- Phase 5: Billing & Invoice System
-- ============================================

-- STEP 1: Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  billing_address TEXT,
  shipping_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  invoice_status TEXT NOT NULL DEFAULT 'draft' CHECK (invoice_status IN ('draft', 'issued', 'paid', 'cancelled')),
  notes TEXT,
  terms TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'gu')),
  issued_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 2: Create invoice_settings table
CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_prefix TEXT NOT NULL DEFAULT 'INV',
  next_invoice_number INTEGER NOT NULL DEFAULT 1,
  default_tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  default_shipping_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
  default_payment_terms TEXT DEFAULT 'Net 7 days',
  default_notes TEXT,
  default_terms TEXT,
  default_language TEXT NOT NULL DEFAULT 'en' CHECK (default_language IN ('en', 'hi', 'gu')),
  company_name TEXT NOT NULL DEFAULT 'Mimiko Studio',
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  company_gst_number TEXT,
  company_logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 3: Create invoice_templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(invoice_status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_issued ON invoices(issued_date);
CREATE INDEX IF NOT EXISTS idx_invoices_language ON invoices(language);

-- STEP 5: Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS policies

-- Invoices: Customers can read their own, admins can read all
DROP POLICY IF EXISTS "invoices_customer_read" ON invoices;
CREATE POLICY "invoices_customer_read" 
ON invoices 
FOR SELECT 
USING (
  customer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Invoices: Only admins can insert/update/delete
DROP POLICY IF EXISTS "invoices_admin_insert" ON invoices;
CREATE POLICY "invoices_admin_insert" 
ON invoices 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "invoices_admin_update" ON invoices;
CREATE POLICY "invoices_admin_update" 
ON invoices 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "invoices_admin_delete" ON invoices;
CREATE POLICY "invoices_admin_delete" 
ON invoices 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Invoice Settings: Public read, admin write
DROP POLICY IF EXISTS "invoice_settings_public_read" ON invoice_settings;
CREATE POLICY "invoice_settings_public_read" 
ON invoice_settings 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "invoice_settings_admin_write" ON invoice_settings;
CREATE POLICY "invoice_settings_admin_write" 
ON invoice_settings 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Invoice Templates: Public read active, admin all
DROP POLICY IF EXISTS "invoice_templates_public_read" ON invoice_templates;
CREATE POLICY "invoice_templates_public_read" 
ON invoice_templates 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "invoice_templates_admin_all" ON invoice_templates;
CREATE POLICY "invoice_templates_admin_all" 
ON invoice_templates 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- STEP 7: Insert default invoice settings
INSERT INTO invoice_settings (
  invoice_prefix,
  next_invoice_number,
  default_tax_rate,
  default_shipping_charges,
  default_payment_terms,
  default_language,
  company_name
) VALUES (
  'INV',
  1,
  0,
  0,
  'Net 7 days',
  'en',
  'Mimiko Studio'
) ON CONFLICT DO NOTHING;

-- STEP 8: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_invoice ON invoices;
CREATE TRIGGER trigger_update_invoice
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_invoice_updated_at();

DROP TRIGGER IF EXISTS trigger_update_invoice_settings ON invoice_settings;
CREATE TRIGGER trigger_update_invoice_settings
BEFORE UPDATE ON invoice_settings
FOR EACH ROW
EXECUTE FUNCTION update_invoice_updated_at();

DROP TRIGGER IF EXISTS trigger_update_invoice_templates ON invoice_templates;
CREATE TRIGGER trigger_update_invoice_templates
BEFORE UPDATE ON invoice_templates
FOR EACH ROW
EXECUTE FUNCTION update_invoice_updated_at();

-- STEP 9: Verify migration
SELECT 
  '✅ Invoice system migration complete!' AS status,
  (SELECT COUNT(*) FROM invoices) AS invoices_count,
  (SELECT COUNT(*) FROM invoice_settings) AS settings_count,
  (SELECT COUNT(*) FROM invoice_templates) AS templates_count;
