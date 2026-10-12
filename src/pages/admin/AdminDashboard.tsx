import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, MessageSquare, Calendar, ShoppingCart,
  Bell, LogOut, Eye, Settings, FolderTree, Database, Copy, CheckCircle, ExternalLink, TrendingUp, Image as ImageIcon, Palette, FileText
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useDashboardStats, useInquiries, useAppointments, useProducts } from '../../hooks/useData';
import { useI18n } from '../../i18n/I18nContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ProductsManager from '../../components/admin/ProductsManager';
import InquiriesManager from '../../components/admin/InquiriesManager';
import AppointmentsManager from '../../components/admin/AppointmentsManager';
import CategoriesManager from '../../components/admin/CategoriesManager';
import SiteSettingsManager from '../../components/admin/SiteSettingsManager';
import OrdersManager from '../../components/admin/OrdersManager';
import ReportsDashboard from '../../components/admin/ReportsDashboard';
import PremiumDashboard from '../../components/admin/PremiumDashboard';
import HeroBannerManager from '../../components/admin/HeroBannerManager';
import GalleryManager from '../../components/admin/GalleryManager';
import CollectionsManager from '../../components/admin/CollectionsManager';
import WhatsAppSettingsManager from '../../components/admin/WhatsAppSettingsManager';
import DynamicContentManager from '../../components/admin/DynamicContentManager';
import FestivalThemeManager from '../../components/admin/FestivalThemeManager';
import InvoiceManager from '../../components/admin/InvoiceManager';
import AutoSetup from '../../components/admin/AutoSetup';

type Tab = 'overview' | 'products' | 'categories' | 'inquiries' | 'appointments' | 'orders' | 'invoices' | 'reports' | 'hero-banners' | 'gallery' | 'collections' | 'dynamic-content' | 'festival-themes' | 'whatsapp' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    checkAuth();
  }, []);

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

  const tabs = [
    { id: 'overview' as Tab, label: '📊 Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'products' as Tab, label: '🛍️ Products', icon: <Package size={16} /> },
    { id: 'categories' as Tab, label: '🗂️ Categories', icon: <FolderTree size={16} /> },
    { id: 'hero-banners' as Tab, label: '🎨 Hero Banners', icon: <Palette size={16} /> },
    { id: 'gallery' as Tab, label: '🖼️ Gallery', icon: <ImageIcon size={16} /> },
    { id: 'collections' as Tab, label: '💎 Collections', icon: <Palette size={16} /> },
    { id: 'dynamic-content' as Tab, label: '📄 Dynamic Content', icon: <LayoutDashboard size={16} /> },
    { id: 'festival-themes' as Tab, label: '🎉 Festival Themes', icon: <Palette size={16} /> },
    { id: 'inquiries' as Tab, label: '💌 Inquiries', icon: <MessageSquare size={16} /> },
    { id: 'appointments' as Tab, label: '📅 Appointments', icon: <Calendar size={16} /> },
    { id: 'orders' as Tab, label: '📦 Orders', icon: <ShoppingCart size={16} /> },
    { id: 'invoices' as Tab, label: '📄 Invoices', icon: <FileText size={16} /> },
    { id: 'reports' as Tab, label: '📈 Reports', icon: <TrendingUp size={16} /> },
    { id: 'whatsapp' as Tab, label: '💬 WhatsApp', icon: <MessageSquare size={16} /> },
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

        <div className="p-4 border-t border-ivory/10 space-y-2">
          <div className="px-4 py-2">
            <LanguageSwitcher />
          </div>
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
        <AutoSetup />
        {activeTab === 'overview' && <PremiumDashboard />}
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'hero-banners' && <HeroBannerManager />}
        {activeTab === 'gallery' && <GalleryManager />}
        {activeTab === 'collections' && <CollectionsManager />}
        {activeTab === 'dynamic-content' && <DynamicContentManager />}
        {activeTab === 'festival-themes' && <FestivalThemeManager />}
        {activeTab === 'inquiries' && <InquiriesManager />}
        {activeTab === 'appointments' && <AppointmentsManager />}
        {activeTab === 'orders' && <OrdersManager />}
        {activeTab === 'invoices' && <InvoiceManager />}
        {activeTab === 'reports' && <ReportsDashboard />}
        {activeTab === 'whatsapp' && <WhatsAppSettingsManager />}
        {activeTab === 'settings' && <SiteSettingsManager />}
      </main>
    </div>
  );
}

// Database Setup Screen
