import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, MessageSquare, Calendar, ShoppingCart,
  Bell, LogOut, Plus, Search, Filter, Eye, Edit, Trash2,
  CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Settings
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type Tab = 'overview' | 'products' | 'inquiries' | 'appointments' | 'orders' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
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
    { id: 'overview' as Tab, label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'products' as Tab, label: 'Products', icon: <Package size={16} /> },
    { id: 'inquiries' as Tab, label: 'Inquiries', icon: <MessageSquare size={16} /> },
    { id: 'appointments' as Tab, label: 'Appointments', icon: <Calendar size={16} /> },
    { id: 'orders' as Tab, label: 'Orders', icon: <ShoppingCart size={16} /> },
    { id: 'settings' as Tab, label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Sidebar */}
      <aside className="w-64 bg-espresso min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40">
        <div className="p-6 border-b border-pearl/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-champagne/20 flex items-center justify-center">
              <span className="text-lg">🎨</span>
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold text-pearl">Mimiko</h1>
              <p className="text-[10px] tracking-[0.2em] uppercase text-champagne">Admin Panel</p>
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
                  ? 'bg-champagne/10 text-champagne'
                  : 'text-pearl/60 hover:text-pearl hover:bg-pearl/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-pearl/10">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm text-pearl/60 hover:text-pearl transition-colors">
            <Eye size={16} /> View Website
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-pearl/60 hover:text-red-400 transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl font-medium text-espresso capitalize">{activeTab}</h2>
            <p className="text-sm text-espresso/50">Manage your Mimiko Studio operations</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-espresso/60 hover:text-champagne transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-4 h-4 bg-champagne text-pearl text-[9px] rounded-full flex items-center justify-center">3</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'inquiries' && <InquiriesTab />}
        {activeTab === 'appointments' && <AppointmentsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

function OverviewTab() {
  const stats = [
    { label: 'Total Products', value: '0', icon: <Package size={20} />, color: 'bg-champagne/10 text-champagne' },
    { label: 'Active Inquiries', value: '0', icon: <MessageSquare size={20} />, color: 'bg-rosegold/10 text-rosegold' },
    { label: 'Pending Appointments', value: '0', icon: <Calendar size={20} />, color: 'bg-sage/10 text-sage' },
    { label: 'Total Orders', value: '0', icon: <ShoppingCart size={20} />, color: 'bg-blush/20 text-espresso' },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-pearl border border-beige/20 rounded-sm p-6">
            <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-heading font-semibold text-espresso">{stat.value}</p>
            <p className="text-xs font-label tracking-wider uppercase text-espresso/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-pearl border border-beige/20 rounded-sm p-6 mb-8">
        <h3 className="font-heading text-lg font-medium text-espresso mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="btn-luxury !py-3 text-xs flex items-center justify-center gap-2">
            <Plus size={14} /> Add Product
          </button>
          <button className="btn-luxury !py-3 text-xs flex items-center justify-center gap-2">
            <Calendar size={14} /> View Appointments
          </button>
          <button className="btn-luxury !py-3 text-xs flex items-center justify-center gap-2">
            <MessageSquare size={14} /> Check Inquiries
          </button>
        </div>
      </div>

      {/* Supabase Status */}
      <div className="bg-pearl border border-beige/20 rounded-sm p-6">
        <h3 className="font-heading text-lg font-medium text-espresso mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-espresso/70">Supabase Connection</span>
            <span className={`text-xs px-2 py-1 rounded-sm ${isSupabaseConfigured ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {isSupabaseConfigured ? 'Connected' : 'Not Configured'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-espresso/70">Authentication</span>
            <span className="text-xs px-2 py-1 rounded-sm bg-green-100 text-green-700">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-espresso/70">Real-time Subscriptions</span>
            <span className={`text-xs px-2 py-1 rounded-sm ${isSupabaseConfigured ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {isSupabaseConfigured ? 'Active' : 'Pending Setup'}
            </span>
          </div>
        </div>
        {!isSupabaseConfigured && (
          <div className="mt-4 p-3 bg-champagne/5 border border-champagne/10 rounded-sm">
            <p className="text-xs text-espresso/60">
              <AlertTriangle size={12} className="inline mr-1" />
              Configure Supabase credentials to enable full functionality. <Link to="/setup" className="text-champagne underline">View setup guide</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40" />
            <input type="text" placeholder="Search products..." className="input-luxury !py-2 !pl-9 text-sm w-64" />
          </div>
          <button className="btn-luxury !py-2 !px-3 text-xs flex items-center gap-2">
            <Filter size={12} /> Filter
          </button>
        </div>
        <button className="btn-luxury-filled !py-2 text-xs flex items-center gap-2">
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="bg-pearl border border-beige/20 rounded-sm overflow-hidden">
        <div className="p-12 text-center">
          <Package size={40} className="mx-auto text-espresso/20 mb-4" />
          <p className="text-espresso/40 text-sm">No products yet.</p>
          <p className="text-espresso/30 text-xs mt-2">
            {isSupabaseConfigured
              ? 'Products will appear here once added through the admin panel or database.'
              : 'Configure Supabase to enable product management.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function InquiriesTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40" />
          <input type="text" placeholder="Search by name or reference..." className="input-luxury !py-2 !pl-9 text-sm w-64" />
        </div>
      </div>

      <div className="bg-pearl border border-beige/20 rounded-sm overflow-hidden">
        <div className="p-12 text-center">
          <MessageSquare size={40} className="mx-auto text-espresso/20 mb-4" />
          <p className="text-espresso/40 text-sm">No inquiries yet.</p>
          <p className="text-espresso/30 text-xs mt-2">
            Customer custom creation requests will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

function AppointmentsTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg text-espresso">Appointment Calendar</h3>
      </div>

      <div className="bg-pearl border border-beige/20 rounded-sm overflow-hidden">
        <div className="p-12 text-center">
          <Calendar size={40} className="mx-auto text-espresso/20 mb-4" />
          <p className="text-espresso/40 text-sm">No appointments scheduled.</p>
          <p className="text-espresso/30 text-xs mt-2">
            Customer booking requests will appear here for management.
          </p>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div>
      <div className="bg-pearl border border-beige/20 rounded-sm overflow-hidden">
        <div className="p-12 text-center">
          <ShoppingCart size={40} className="mx-auto text-espresso/20 mb-4" />
          <p className="text-espresso/40 text-sm">No orders yet.</p>
          <p className="text-espresso/30 text-xs mt-2">
            Customer orders will be tracked here once the ordering system is active.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-pearl border border-beige/20 rounded-sm p-6">
        <h3 className="font-heading text-lg font-medium text-espresso mb-4">Site Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Site Name</label>
            <input type="text" defaultValue="Mimiko Studio" className="input-luxury" />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Tagline</label>
            <input type="text" defaultValue="Paint ♥ Create ♥ Be You" className="input-luxury" />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">WhatsApp Number</label>
            <input type="text" defaultValue="+91 7874291924" className="input-luxury" />
          </div>
        </div>
        <button className="btn-luxury-filled mt-6 !py-2 text-xs">Save Settings</button>
      </div>

      <div className="bg-pearl border border-beige/20 rounded-sm p-6">
        <h3 className="font-heading text-lg font-medium text-espresso mb-4">Supabase Configuration</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-ivory rounded-sm">
            <span className="text-sm text-espresso/70">Project URL</span>
            <span className="text-xs text-espresso/40">{isSupabaseConfigured ? 'Configured ✓' : 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-ivory rounded-sm">
            <span className="text-sm text-espresso/70">Anon Key</span>
            <span className="text-xs text-espresso/40">{isSupabaseConfigured ? 'Configured ✓' : 'Not set'}</span>
          </div>
        </div>
        <Link to="/setup" className="text-xs text-champagne underline mt-4 inline-block">
          View full setup guide →
        </Link>
      </div>
    </div>
  );
}
