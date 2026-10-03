import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CheckCircle, AlertCircle, Database, Copy, ExternalLink } from 'lucide-react';

const SQL_MIGRATION = `-- Mimiko Studio Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  material TEXT DEFAULT '',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  customization_available BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  product_category TEXT NOT NULL,
  product_type TEXT NOT NULL,
  fabric_preference TEXT DEFAULT '',
  preferred_colors TEXT DEFAULT '',
  design_style TEXT DEFAULT '',
  custom_text TEXT DEFAULT '',
  size TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  budget TEXT DEFAULT '',
  preferred_date DATE,
  reference_image_urls TEXT[] DEFAULT '{}',
  instructions TEXT DEFAULT '',
  quotation_amount DECIMAL(10,2),
  status TEXT DEFAULT 'new',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  appointment_type TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  project_description TEXT DEFAULT '',
  reference_image_urls TEXT[] DEFAULT '{}',
  communication_method TEXT DEFAULT 'whatsapp',
  status TEXT DEFAULT 'requested',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  shipping_address TEXT DEFAULT '',
  subtotal DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'pending',
  payment_reference TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (for auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view published products" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Anyone can create inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Seed categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Hand-Painted Clothing', 'clothing', 'T-shirts, kurtis, sarees, dupattas, denim jackets & more', 1),
  ('Designer Bags', 'bags', 'Tote bags, canvas bags, sling bags, pouches & laptop sleeves', 2),
  ('Home Decor', 'home-decor', 'Cushion covers, table runners, wall hangings & more', 3),
  ('Fashion Accessories', 'accessories', 'Hand-painted shoes, caps, scarves & headbands', 4),
  ('Personalized Gifts', 'gifts', 'Custom gift bags, aprons, bookmarks & pouches', 5),
  ('Small Handmade Creations', 'small-creations', 'Scrunchies, hair bows, fabric earrings & keychains', 6)
ON CONFLICT (slug) DO NOTHING;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE inquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;`;

export default function DatabaseSetup() {
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Test by trying to fetch categories
      const { data, error } = await supabase.from('categories').select('count').limit(1);
      
      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          setTestResult({
            success: false,
            message: '⚠️ Connected to Supabase, but tables don\'t exist yet. Please run the SQL migration below.'
          });
        } else {
          setTestResult({
            success: false,
            message: `❌ Error: ${error.message}`
          });
        }
      } else {
        setTestResult({
          success: true,
          message: '✅ Successfully connected to Supabase! Database is ready.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `❌ Connection failed: ${err.message}`
      });
    }
    
    setTesting(false);
  };

  return (
    <div className="pt-20 min-h-screen bg-ivory">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Database size={48} className="mx-auto text-gold mb-4" />
          <h1 className="font-heading text-4xl font-light text-chocolate mb-4">Database Setup</h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-coffee/60">
            Set up your Supabase database to make the website fully dynamic.
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-6 mb-8 shadow-luxury">
          <h2 className="font-heading text-xl text-chocolate mb-4 flex items-center gap-2">
            🔌 Connection Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-ivory rounded-sm">
              <span className="text-sm text-coffee">Supabase URL</span>
              <span className="text-xs text-sage font-medium">
                {isSupabaseConfigured ? '✅ Configured' : '❌ Not configured'}
              </span>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-primary w-full disabled:opacity-50"
            >
              {testing ? '⏳ Testing...' : '🔍 Test Connection'}
            </button>
            {testResult && (
              <div className={`p-4 rounded-sm ${testResult.success ? 'bg-sage/10 border border-sage/20' : 'bg-blush/10 border border-blush/20'}`}>
                <p className={`text-sm ${testResult.success ? 'text-sage' : 'text-coffee'}`}>
                  {testResult.message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-6 mb-8 shadow-luxury">
          <h2 className="font-heading text-xl text-chocolate mb-4 flex items-center gap-2">
            📋 Setup Instructions
          </h2>
          <ol className="space-y-4 text-sm text-coffee/70">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>
                Go to your{' '}
                <a
                  href="https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold underline inline-flex items-center gap-1"
                >
                  Supabase SQL Editor <ExternalLink size={12} />
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Click "New Query"</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>Copy the SQL migration below and paste it into the editor</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>Click "Run" to execute the migration</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center text-xs font-bold">5</span>
              <span>Verify tables were created in the Table Editor</span>
            </li>
          </ol>
        </div>

        {/* SQL Migration */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-6 shadow-luxury">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl text-chocolate flex items-center gap-2">
              🗄️ SQL Migration
            </h2>
            <button
              onClick={handleCopy}
              className="btn-outline flex items-center gap-2"
            >
              <Copy size={14} />
              {copied ? '✅ Copied!' : 'Copy SQL'}
            </button>
          </div>
          <pre className="bg-chocolate text-ivory/80 p-4 rounded-sm text-xs overflow-x-auto max-h-96 overflow-y-auto">
            <code>{SQL_MIGRATION}</code>
          </pre>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gradient-to-br from-chocolate to-coffee rounded-sm p-8 text-center">
          <CheckCircle size={32} className="text-gold mx-auto mb-4" />
          <h2 className="font-heading text-2xl text-ivory mb-2">You're All Set!</h2>
          <p className="text-ivory/60 text-sm mb-6">
            Once the migration is complete, your website will be fully dynamic with real-time data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" className="btn-secondary !border-ivory/30 !text-ivory">View Website</a>
            <a href="#/admin" className="btn-primary">Admin Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
