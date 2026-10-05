-- ============================================
-- INVOICE AND REPORTING SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Add invoice_number column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- STEP 2: Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
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

-- STEP 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- STEP 4: Enable RLS on invoices table
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create RLS policies for invoices
-- Public: Can read invoices (for customers to view their invoices)
DROP POLICY IF EXISTS "invoices_public_read" ON invoices;
CREATE POLICY "invoices_public_read" 
ON invoices 
FOR SELECT 
USING (true);

-- Admin: Can insert invoices
DROP POLICY IF EXISTS "invoices_admin_insert" ON invoices;
CREATE POLICY "invoices_admin_insert" 
ON invoices 
FOR INSERT 
WITH CHECK (true);

-- Admin: Can update invoices
DROP POLICY IF EXISTS "invoices_admin_update" ON invoices;
CREATE POLICY "invoices_admin_update" 
ON invoices 
FOR UPDATE 
USING (true);

-- Admin: Can delete invoices
DROP POLICY IF EXISTS "invoices_admin_delete" ON invoices;
CREATE POLICY "invoices_admin_delete" 
ON invoices 
FOR DELETE 
USING (true);

-- STEP 6: Create function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number INTEGER;
  invoice_prefix TEXT := 'INV';
  year TEXT := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
BEGIN
  -- Get the next number
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '...$') AS INTEGER)), 0) + 1
  INTO new_number
  FROM invoices
  WHERE invoice_number LIKE invoice_prefix || '-' || year || '-%';
  
  RETURN invoice_prefix || '-' || year || '-' || LPAD(new_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Create function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 8: Create trigger for invoice updates
DROP TRIGGER IF EXISTS trigger_update_invoice ON invoices;
CREATE TRIGGER trigger_update_invoice
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();

-- STEP 9: Verify the migration
SELECT 
  '✅ Invoice and reporting system migration complete!' AS status,
  (SELECT COUNT(*) FROM invoices) AS total_invoices,
  (SELECT COUNT(*) FROM orders WHERE invoice_number IS NOT NULL) AS orders_with_invoices;

-- STEP 10: Create sample invoice settings
INSERT INTO site_settings (setting_key, setting_value)
VALUES (
  'invoice_settings',
  '{"invoice_prefix":"INV","invoice_starting_number":1,"invoice_footer":"Thank you for your business!","invoice_terms":"Payment is due within 30 days of invoice date.","invoice_thank_you":"Thank you for choosing our jewellery collection.","show_gst":false,"show_tax":false,"show_discount":true,"show_shipping":true,"invoice_accent_color":"#D5AA64","gst_number":"","pan_number":"","registration_number":""}'
)
ON CONFLICT (setting_key) DO NOTHING;

SELECT '✅ Invoice settings created!' AS status;
