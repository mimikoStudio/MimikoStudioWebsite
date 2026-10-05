import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertCircle, Loader, Copy } from 'lucide-react';
import { ensureTablesExist, getSetupSQL } from '../../lib/databaseSetup';

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
  const [showSQL, setShowSQL] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkIfSetupNeeded();
  }, []);

  const checkIfSetupNeeded = async () => {
    try {
      const result = await ensureTablesExist();
      
      if (!result.success && !result.created) {
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
        name: 'Checking required tables',
        action: async () => {
          const { allExist, missing } = await import('../../lib/databaseSetup').then(m => m.checkRequiredTables());
          if (allExist) {
            return { success: true, message: 'All tables exist' };
          }
          return { success: false, message: `Missing: ${missing.join(', ')}` };
        }
      },
      {
        name: 'Creating hero_banners table',
        action: async () => {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: `CREATE TABLE IF NOT EXISTS hero_banners (
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
            );`
          });
          if (error && !error.message.includes('already exists')) {
            return { success: false, message: error.message };
          }
          return { success: true, message: 'Table created' };
        }
      },
      {
        name: 'Creating gallery_categories table',
        action: async () => {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: `CREATE TABLE IF NOT EXISTS gallery_categories (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name TEXT NOT NULL,
              slug TEXT NOT NULL UNIQUE,
              description TEXT,
              cover_image_url TEXT,
              display_order INTEGER NOT NULL DEFAULT 0,
              is_active BOOLEAN NOT NULL DEFAULT true,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );`
          });
          if (error && !error.message.includes('already exists')) {
            return { success: false, message: error.message };
          }
          return { success: true, message: 'Table created' };
        }
      },
      {
        name: 'Creating gallery_images table',
        action: async () => {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: `CREATE TABLE IF NOT EXISTS gallery_images (
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
            );`
          });
          if (error && !error.message.includes('already exists')) {
            return { success: false, message: error.message };
          }
          return { success: true, message: 'Table created' };
        }
      },
      {
        name: 'Creating collections table',
        action: async () => {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: `CREATE TABLE IF NOT EXISTS collections (
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
            );`
          });
          if (error && !error.message.includes('already exists')) {
            return { success: false, message: error.message };
          }
          return { success: true, message: 'Table created' };
        }
      },
      {
        name: 'Creating invoices table',
        action: async () => {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: `CREATE TABLE IF NOT EXISTS invoices (
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
            );`
          });
          if (error && !error.message.includes('already exists')) {
            return { success: false, message: error.message };
          }
          return { success: true, message: 'Table created' };
        }
      },
      {
        name: 'Enabling RLS policies',
        action: async () => {
          const tables = ['hero_banners', 'gallery_categories', 'gallery_images', 'collections', 'invoices'];
          for (const table of tables) {
            await supabase.rpc('exec_sql', {
              sql_query: `
                ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
                DROP POLICY IF EXISTS "${table}_public_read" ON ${table};
                CREATE POLICY "${table}_public_read" ON ${table} FOR SELECT USING (true);
                DROP POLICY IF EXISTS "${table}_admin_all" ON ${table};
                CREATE POLICY "${table}_admin_all" ON ${table} FOR ALL USING (true);
              `
            });
          }
          return { success: true, message: 'RLS enabled' };
        }
      },
      {
        name: 'Creating storage bucket',
        action: async () => {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: `
              INSERT INTO storage.buckets (id, name, public)
              VALUES ('website-content', 'website-content', true)
              ON CONFLICT (id) DO NOTHING;
            `
          });
          if (error && !error.message.includes('already exists')) {
            return { success: false, message: error.message };
          }
          return { success: true, message: 'Bucket created' };
        }
      }
    ];

    let allSuccess = true;

    for (const step of steps) {
      addStatus(step.name, 'running', 'Running...');
      
      try {
        const result = await step.action();
        
        if (result.success) {
          addStatus(step.name, 'success', result.message);
        } else {
          addStatus(step.name, 'error', result.message);
          allSuccess = false;
        }
      } catch (error: any) {
        addStatus(step.name, 'error', error.message);
        allSuccess = false;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsRunning(false);
    setIsComplete(true);
    
    if (allSuccess) {
      setNeedsSetup(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
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

  const handleCopySQL = () => {
    navigator.clipboard.writeText(getSetupSQL());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Don't render anything if setup not needed or already complete
  if (!needsSetup && !isComplete) {
    return null;
  }

  // Show success message briefly, then auto-close
  if (isComplete) {
    return (
      <div className="fixed top-4 right-4 bg-sage/10 border border-sage/30 rounded-lg p-4 shadow-lg z-50 animate-fade-in">
        <div className="flex items-center gap-3">
          <CheckCircle size={24} className="text-sage" />
          <div>
            <p className="font-medium text-chocolate">Setup Complete!</p>
            <p className="text-sm text-coffee/60">Reloading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show non-blocking setup button in corner
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isRunning ? (
        <div className="bg-pearl border border-beige/30 rounded-lg p-4 shadow-lg min-w-[300px]">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle size={24} className="text-gold flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-chocolate mb-1">Database Setup Required</p>
              <p className="text-sm text-coffee/60 mb-3">
                Some tables need to be created. Choose an option:
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  'This will attempt to create all required tables automatically.\n\nNote: This requires admin access to the database.'
                );
                if (confirmed) {
                  runSetup();
                }
              }}
              className="w-full bg-gold text-chocolate px-4 py-2 rounded-lg hover:bg-gold/80 transition-all flex items-center justify-center gap-2"
            >
              <Loader size={16} />
              <span className="font-medium">Auto Setup</span>
            </button>
            
            <button
              onClick={() => setShowSQL(!showSQL)}
              className="w-full bg-ivory text-chocolate px-4 py-2 rounded-lg hover:bg-cream/50 transition-all flex items-center justify-center gap-2 border border-beige/30"
            >
              <Copy size={16} />
              <span className="font-medium">Manual SQL</span>
            </button>
          </div>

          {showSQL && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-coffee/60">
                Copy this SQL and run it in Supabase SQL Editor:
              </p>
              <div className="relative">
                <pre className="bg-chocolate text-ivory/80 p-3 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
                  <code>{getSetupSQL().substring(0, 500)}...</code>
                </pre>
                <button
                  onClick={handleCopySQL}
                  className="absolute top-2 right-2 bg-gold text-chocolate px-2 py-1 rounded text-xs"
                >
                  {copied ? '✓ Copied' : 'Copy All'}
                </button>
              </div>
              <a
                href="https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold hover:underline"
              >
                Open Supabase SQL Editor →
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-pearl border border-beige/30 rounded-lg p-4 shadow-lg min-w-[300px]">
          <div className="flex items-center gap-3 mb-3">
            <Loader size={20} className="text-gold animate-spin" />
            <p className="font-medium text-chocolate">Setting up database...</p>
          </div>
          
          {setupStatus.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {setupStatus.slice(-5).map((status, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  {status.status === 'running' && (
                    <Loader size={12} className="text-gold animate-spin mt-0.5" />
                  )}
                  {status.status === 'success' && (
                    <CheckCircle size={12} className="text-sage mt-0.5" />
                  )}
                  {status.status === 'error' && (
                    <AlertCircle size={12} className="text-blush mt-0.5" />
                  )}
                  <span className="text-coffee/70">{status.step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
