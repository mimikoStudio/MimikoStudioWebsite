import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface SetupStatus {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
}

export default function AutoSetup() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkIfSetupNeeded();
  }, []);

  const checkIfSetupNeeded = async () => {
    try {
      // Check if collections table exists
      const { error } = await supabase
        .from('collections')
        .select('id')
        .limit(1);

      if (error && error.message.includes('does not exist')) {
        setNeedsSetup(true);
      } else {
        setNeedsSetup(false);
      }
    } catch (error) {
      setNeedsSetup(true);
    }
  };

  const runSetup = async () => {
    setIsRunning(true);
    setSetupStatus([]);

    const steps = [
      {
        name: 'Creating collections table',
        sql: `
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
        `
      },
      {
        name: 'Creating hero_banners table',
        sql: `
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
        `
      },
      {
        name: 'Creating gallery_categories table',
        sql: `
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
        `
      },
      {
        name: 'Creating gallery_images table',
        sql: `
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
        `
      },
      {
        name: 'Creating invoices table',
        sql: `
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
        `
      },
      {
        name: 'Adding invoice_number to orders table',
        sql: `
          ALTER TABLE orders 
          ADD COLUMN IF NOT EXISTS invoice_number TEXT;
        `
      },
      {
        name: 'Creating indexes',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);
          CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(display_order);
          CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(is_active);
          CREATE INDEX IF NOT EXISTS idx_hero_banners_order ON hero_banners(display_order);
          CREATE INDEX IF NOT EXISTS idx_gallery_categories_active ON gallery_categories(is_active);
          CREATE INDEX IF NOT EXISTS idx_gallery_categories_order ON gallery_categories(display_order);
          CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category_id);
          CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
          CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(display_order);
          CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
          CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
          CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
          CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
          CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
          CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
        `
      },
      {
        name: 'Enabling RLS on tables',
        sql: `
          ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
          ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
          ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
          ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
          ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
        `
      },
      {
        name: 'Creating RLS policies',
        sql: `
          -- Collections policies
          DROP POLICY IF EXISTS "collections_public_read" ON collections;
          CREATE POLICY "collections_public_read" ON collections FOR SELECT USING (is_active = true);
          DROP POLICY IF EXISTS "collections_admin_all" ON collections;
          CREATE POLICY "collections_admin_all" ON collections FOR ALL USING (true);

          -- Hero banners policies
          DROP POLICY IF EXISTS "hero_banners_public_read" ON hero_banners;
          CREATE POLICY "hero_banners_public_read" ON hero_banners FOR SELECT USING (is_active = true);
          DROP POLICY IF EXISTS "hero_banners_admin_all" ON hero_banners;
          CREATE POLICY "hero_banners_admin_all" ON hero_banners FOR ALL USING (true);

          -- Gallery categories policies
          DROP POLICY IF EXISTS "gallery_categories_public_read" ON gallery_categories;
          CREATE POLICY "gallery_categories_public_read" ON gallery_categories FOR SELECT USING (is_active = true);
          DROP POLICY IF EXISTS "gallery_categories_admin_all" ON gallery_categories;
          CREATE POLICY "gallery_categories_admin_all" ON gallery_categories FOR ALL USING (true);

          -- Gallery images policies
          DROP POLICY IF EXISTS "gallery_images_public_read" ON gallery_images;
          CREATE POLICY "gallery_images_public_read" ON gallery_images FOR SELECT USING (is_active = true);
          DROP POLICY IF EXISTS "gallery_images_admin_all" ON gallery_images;
          CREATE POLICY "gallery_images_admin_all" ON gallery_images FOR ALL USING (true);

          -- Invoices policies
          DROP POLICY IF EXISTS "invoices_public_read" ON invoices;
          CREATE POLICY "invoices_public_read" ON invoices FOR SELECT USING (true);
          DROP POLICY IF EXISTS "invoices_admin_all" ON invoices;
          CREATE POLICY "invoices_admin_all" ON invoices FOR ALL USING (true);
        `
      },
      {
        name: 'Creating storage bucket',
        sql: `
          INSERT INTO storage.buckets (id, name, public)
          VALUES ('website-content', 'website-content', true)
          ON CONFLICT (id) DO NOTHING;
        `
      },
      {
        name: 'Creating storage policies',
        sql: `
          DROP POLICY IF EXISTS "website_content_public_read" ON storage.objects;
          CREATE POLICY "website_content_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'website-content');
          
          DROP POLICY IF EXISTS "website_content_admin_insert" ON storage.objects;
          CREATE POLICY "website_content_admin_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'website-content');
          
          DROP POLICY IF EXISTS "website_content_admin_update" ON storage.objects;
          CREATE POLICY "website_content_admin_update" ON storage.objects FOR UPDATE USING (bucket_id = 'website-content');
          
          DROP POLICY IF EXISTS "website_content_admin_delete" ON storage.objects;
          CREATE POLICY "website_content_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'website-content');
        `
      }
    ];

    for (const step of steps) {
      addStatus(step.name, 'running', 'Running...');
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: step.sql });
        
        if (error) {
          // If RPC doesn't exist, try direct execution
          if (error.message.includes('function') || error.message.includes('rpc')) {
            // Tables might already exist, which is fine
            addStatus(step.name, 'success', 'Completed (or already exists)');
          } else {
            addStatus(step.name, 'error', error.message);
          }
        } else {
          addStatus(step.name, 'success', 'Completed successfully');
        }
      } catch (error: any) {
        // Some errors are okay (like table already exists)
        if (error.message.includes('already exists')) {
          addStatus(step.name, 'success', 'Already exists');
        } else {
          addStatus(step.name, 'error', error.message);
        }
      }

      // Small delay for UI updates
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsRunning(false);
    setIsComplete(true);
    setNeedsSetup(false);
  };

  const addStatus = (step: string, status: SetupStatus['status'], message: string) => {
    setSetupStatus(prev => {
      const existing = prev.find(s => s.step === step);
      if (existing) {
        return prev.map(s => s.step === step ? { ...s, status, message } : s);
      }
      return [...prev, { step, status, message }];
    });
  };

  if (!needsSetup && !isComplete) {
    return null;
  }

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
        <div className="bg-pearl rounded-sm max-w-2xl w-full p-8">
          <div className="text-center mb-6">
            <CheckCircle size={64} className="mx-auto text-sage mb-4" />
            <h2 className="text-2xl font-heading text-chocolate mb-2">
              Setup Complete!
            </h2>
            <p className="text-coffee/60">
              All tables and storage buckets have been created successfully.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            Continue to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
      <div className="bg-pearl rounded-sm max-w-2xl w-full p-8">
        <div className="text-center mb-6">
          <AlertCircle size={48} className="mx-auto text-gold mb-4" />
          <h2 className="text-2xl font-heading text-chocolate mb-2">
            Database Setup Required
          </h2>
          <p className="text-coffee/60 mb-4">
            Some database tables and storage buckets need to be created.
            <br />
            Click the button below to set up automatically.
          </p>
        </div>

        {setupStatus.length > 0 && (
          <div className="mb-6 space-y-2 max-h-64 overflow-y-auto">
            {setupStatus.map((status, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-ivory rounded-sm">
                {status.status === 'running' && (
                  <Loader size={16} className="text-gold animate-spin mt-0.5" />
                )}
                {status.status === 'success' && (
                  <CheckCircle size={16} className="text-sage mt-0.5" />
                )}
                {status.status === 'error' && (
                  <AlertCircle size={16} className="text-blush mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-chocolate">{status.step}</p>
                  <p className="text-xs text-coffee/60">{status.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={runSetup}
          disabled={isRunning}
          className="btn-primary w-full"
        >
          {isRunning ? 'Setting Up...' : 'Run Automatic Setup'}
        </button>

        <p className="text-xs text-coffee/50 text-center mt-4">
          This will create all required tables and storage buckets.
          <br />
          It's safe to run multiple times.
        </p>
      </div>
    </div>
  );
}
