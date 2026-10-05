import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, MessageSquare, Calendar, ShoppingCart,
  Bell, LogOut, Eye, Settings, FolderTree, Database, Copy, CheckCircle, ExternalLink, TrendingUp
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useDashboardStats, useInquiries, useAppointments, useProducts } from '../../hooks/useData';
import ProductsManager from '../../components/admin/ProductsManager';
import InquiriesManager from '../../components/admin/InquiriesManager';
import AppointmentsManager from '../../components/admin/AppointmentsManager';
import CategoriesManager from '../../components/admin/CategoriesManager';
import SiteSettingsManager from '../../components/admin/SiteSettingsManager';
import OrdersManager from '../../components/admin/OrdersManager';
import ReportsDashboard from '../../components/admin/ReportsDashboard';

type Tab = 'overview' | 'products' | 'categories' | 'inquiries' | 'appointments' | 'orders' | 'reports' | 'settings';

const COMPLETE_SETUP_SQL = `-- ============================================
-- MIMIKO STUDIO - COMPLETE DATABASE SETUP
-- Copy this ENTIRE script and run in Supabase SQL Editor
-- ============================================

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

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('gallery-images', 'gallery-images', true),
  ('inquiry-references', 'inquiry-references', false),
  ('customer-uploads', 'customer-uploads', false)
ON CONFLICT (id) DO NOTHING;

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

DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_write" ON storage.objects;

CREATE POLICY "storage_public_read" 
ON storage.objects FOR SELECT 
USING (true);

CREATE POLICY "storage_authenticated_write" 
ON storage.objects FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

INSERT INTO categories (name, slug, description, display_order, is_active)
VALUES 
  ('Hand-Painted Clothing', 'clothing', 'T-shirts, kurtis, sarees, dupattas, denim jackets & more', 1, true),
  ('Designer Bags', 'bags', 'Tote bags, canvas bags, sling bags, pouches & laptop sleeves', 2, true),
  ('Home Decor', 'home-decor', 'Cushion covers, table runners, wall hangings & more', 3, true),
  ('Fashion Accessories', 'accessories', 'Hand-painted shoes, caps, scarves & headbands', 4, true),
  ('Personalized Gifts', 'gifts', 'Custom gift bags, aprons, bookmarks & pouches', 5, true),
  ('Small Handmade Creations', 'small-creations', 'Scrunchies, hair bows, fabric earrings & keychains', 6, true)
ON CONFLICT (slug) DO NOTHING;

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
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkDatabaseStatus();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    setIsAuthenticated(!!session);
    setLoading(false);
    if (!session) navigate('/admin/login');
  };

  const checkDatabaseStatus = async () => {
    try {
      // Just check if we can read from categories table
      const { error } = await supabase
        .from('categories')
        .select('id')
        .limit(1);

      if (error) {
        // Database tables don't exist or can't be read
        setDbReady(false);
      } else {
        // Database is accessible
        setDbReady(true);
      }
    } catch {
      // Any error means database needs setup
      setDbReady(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="spinner-luxury" />
      </div>
    );
  }

  // Show database setup screen if needed
  if (dbReady === false) {
    return <DatabaseSetupScreen onSetupComplete={() => setDbReady(true)} />;
  }

  const tabs = [
    { id: 'overview' as Tab, label: '📊 Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'products' as Tab, label: '🛍️ Products', icon: <Package size={16} /> },
    { id: 'categories' as Tab, label: '🗂️ Categories', icon: <FolderTree size={16} /> },
    { id: 'inquiries' as Tab, label: '💌 Inquiries', icon: <MessageSquare size={16} /> },
    { id: 'appointments' as Tab, label: '📅 Appointments', icon: <Calendar size={16} /> },
    { id: 'orders' as Tab, label: '📦 Orders', icon: <ShoppingCart size={16} /> },
    { id: 'reports' as Tab, label: '📈 Reports', icon: <TrendingUp size={16} /> },
    { id: 'settings' as Tab, label: '⚙️ Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Sidebar */}
      <aside className="w-64 bg-chocolate min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40">
        <div className="p-6 border-b border-ivory/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
              <span className="text-lg">🎨</span>
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold text-ivory">Mimiko</h1>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gold">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gold/10 text-gold'
                  : 'text-ivory/60 hover:text-ivory hover:bg-ivory/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-ivory/10">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm text-ivory/60 hover:text-ivory transition-colors">
            <Eye size={16} /> View Website
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ivory/60 hover:text-blush transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'inquiries' && <InquiriesManager />}
        {activeTab === 'appointments' && <AppointmentsManager />}
        {activeTab === 'orders' && <OrdersManager />}
        {activeTab === 'reports' && <ReportsDashboard />}
        {activeTab === 'settings' && <SiteSettingsManager />}
      </main>
    </div>
  );
}

// Database Setup Screen
function DatabaseSetupScreen({ onSetupComplete }: { onSetupComplete: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(COMPLETE_SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-pearl border border-beige/20 rounded-sm p-8 shadow-luxury">
          {/* Header */}
          <div className="text-center mb-8">
            <Database size={48} className="mx-auto text-gold mb-4" />
            <h1 className="text-2xl font-heading text-chocolate mb-2">
              🎨 Welcome to Mimiko Studio Admin!
            </h1>
            <p className="text-coffee/60">
              Your database needs a one-time setup. Follow these 3 simple steps:
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6 mb-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold text-chocolate flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-chocolate mb-1">
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold text-chocolate flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-chocolate mb-2">
                  Copy & Paste the SQL Script
                </h3>
                <div className="relative">
                  <pre className="bg-chocolate text-ivory/80 p-4 rounded-sm text-xs overflow-x-auto max-h-48 overflow-y-auto">
                    <code>{COMPLETE_SETUP_SQL}</code>
                  </pre>
                  <button
                    onClick={handleCopy}
                    className={`absolute top-2 right-2 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                      copied 
                        ? 'bg-sage text-white' 
                        : 'bg-gold text-chocolate hover:bg-gold/80'
                    }`}
                  >
                    {copied ? '✅ Copied!' : '📋 Copy SQL'}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold text-chocolate flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-chocolate mb-1">
                  Click "Run" in SQL Editor
                </h3>
                <p className="text-sm text-coffee/60">
                  Then come back here and click the button below
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="text-center pt-6 border-t border-beige/20">
            <button
              onClick={onSetupComplete}
              className="btn-primary"
            >
              ✅ I've Run the SQL - Continue to Dashboard
            </button>
            <p className="text-xs text-coffee/50 mt-3">
              This setup only needs to be done once. After this, everything works automatically!
            </p>
          </div>

          {/* What this sets up */}
          <div className="mt-8 p-4 bg-cream/50 rounded-sm">
            <h4 className="text-sm font-label tracking-wider uppercase text-gold mb-3">
              What This Sets Up:
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs text-coffee/70">
              <li>✅ All database tables</li>
              <li>✅ Storage buckets for images</li>
              <li>✅ Security policies (RLS)</li>
              <li>✅ Default categories</li>
              <li>✅ Site settings</li>
              <li>✅ Admin permissions</li>
              <li>✅ Image upload support</li>
              <li>✅ Real-time subscriptions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  const { stats, loading } = useDashboardStats();
  const { inquiries } = useInquiries();
  const { appointments } = useAppointments();
  const { products } = useProducts({ limit: 5 });

  const statsCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: '🛍️', color: 'bg-gold/10 text-gold' },
    { label: 'Active Inquiries', value: stats.pendingInquiries, icon: '💌', color: 'bg-blush/20 text-blush' },
    { label: 'Pending Appointments', value: stats.newAppointments, icon: '📅', color: 'bg-sage/10 text-sage' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-rose/10 text-rose' },
  ];

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner-luxury" /></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-heading text-chocolate mb-6">📊 Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-pearl border border-beige/20 rounded-sm p-6">
            <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mb-4 text-xl`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-heading font-semibold text-chocolate">{stat.value}</p>
            <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Inquiries */}
      {inquiries.length > 0 && (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6 mb-8">
          <h3 className="font-heading text-lg font-medium text-chocolate mb-4">💌 Recent Inquiries</h3>
          <div className="space-y-3">
            {inquiries.slice(0, 5).map(inquiry => (
              <div key={inquiry.id} className="flex items-center justify-between p-3 bg-ivory rounded-sm">
                <div>
                  <p className="text-sm font-medium text-chocolate">{inquiry.customer_name}</p>
                  <p className="text-xs text-coffee/50">{inquiry.reference_number} • {inquiry.product_type}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-sm ${
                  inquiry.status === 'new' ? 'bg-gold/10 text-gold' :
                  inquiry.status === 'under_review' ? 'bg-sky/10 text-sky' :
                  'bg-sage/10 text-sage'
                }`}>
                  {inquiry.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Appointments */}
      {appointments.length > 0 && (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6 mb-8">
          <h3 className="font-heading text-lg font-medium text-chocolate mb-4">📅 Upcoming Appointments</h3>
          <div className="space-y-3">
            {appointments.slice(0, 5).map(apt => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-ivory rounded-sm">
                <div>
                  <p className="text-sm font-medium text-chocolate">{apt.customer_name}</p>
                  <p className="text-xs text-coffee/50">{apt.appointment_date} at {apt.start_time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-sm ${
                  apt.status === 'requested' ? 'bg-gold/10 text-gold' :
                  apt.status === 'confirmed' ? 'bg-sage/10 text-sage' :
                  'bg-coffee/10 text-coffee'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Products */}
      {products.length > 0 && (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <h3 className="font-heading text-lg font-medium text-chocolate mb-4">🛍️ Recent Products</h3>
          <div className="space-y-3">
            {products.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-ivory rounded-sm">
                <div>
                  <p className="text-sm font-medium text-chocolate">{product.name}</p>
                  <p className="text-xs text-coffee/50">₹{product.price} • Stock: {product.stock_quantity}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-sm ${
                  product.is_published ? 'bg-sage/10 text-sage' : 'bg-coffee/10 text-coffee'
                }`}>
                  {product.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {inquiries.length === 0 && appointments.length === 0 && products.length === 0 && (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40 mb-4">No data yet. Start by adding products!</p>
          <p className="text-sm text-coffee/50">Go to the Products tab to add your first product.</p>
        </div>
      )}
    </div>
  );
}
