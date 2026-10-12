import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, ShoppingBag, Users, TrendingUp, AlertTriangle, 
  Clock, Eye, ArrowUpRight, ArrowDownRight, Activity,
  DollarSign, Star, Zap, Calendar
} from 'lucide-react';
import { useDashboardStats, useProducts, useInquiries, useAppointments } from '../../hooks/useData';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

interface RecentActivity {
  id: string;
  type: 'order' | 'inquiry' | 'appointment' | 'product';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export default function PremiumDashboard() {
  const { t } = useI18n();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { products, loading: productsLoading } = useProducts({ showAll: true, limit: 5 });
  const { inquiries } = useInquiries();
  const { appointments } = useAppointments();
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load recent activity
      await loadRecentActivity();
      
      // Load low stock products
      await loadLowStockProducts();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    const activity: RecentActivity[] = [];

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentOrders) {
      recentOrders.forEach((order: any) => {
        activity.push({
          id: order.id,
          type: 'order',
          title: `New Order #${order.order_number}`,
          description: `₹${order.total_amount} from ${order.customer_name}`,
          timestamp: order.created_at,
          status: order.order_status,
        });
      });
    }

    // Recent inquiries
    inquiries.slice(0, 2).forEach(inquiry => {
      activity.push({
        id: inquiry.id,
        type: 'inquiry',
        title: `New Inquiry from ${inquiry.customer_name}`,
        description: inquiry.product_type || 'Custom request',
        timestamp: inquiry.created_at,
        status: inquiry.status,
      });
    });

    // Recent appointments
    appointments.slice(0, 2).forEach(apt => {
      activity.push({
        id: apt.id,
        type: 'appointment',
        title: `Appointment with ${apt.customer_name}`,
        description: `${apt.appointment_date} at ${apt.start_time}`,
        timestamp: apt.created_at,
        status: apt.status,
      });
    });

    // Sort by timestamp and take top 5
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(activity.slice(0, 5));
  };

  const loadLowStockProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_published', true)
      .lte('stock_quantity', 5)
      .gt('stock_quantity', 0)
      .order('stock_quantity', { ascending: true })
      .limit(5);

    if (data) {
      setLowStockProducts(data);
    }
  };

  if (loading || statsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner-luxury" />
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      trend: '+12%',
      trendUp: true,
      link: '/admin/products',
    },
    {
      title: 'Active Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-green-50 text-green-600',
      trend: '+8%',
      trendUp: true,
      link: '/admin/orders',
    },
    {
      title: 'Pending Inquiries',
      value: stats.pendingInquiries,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      trend: '+15%',
      trendUp: true,
      link: '/admin/inquiries',
    },
    {
      title: 'Appointments',
      value: stats.newAppointments,
      icon: Calendar,
      color: 'bg-orange-50 text-orange-600',
      trend: '+5%',
      trendUp: true,
      link: '/admin/appointments',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-chocolate">
            Dashboard Overview
          </h1>
          <p className="text-coffee/60 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/reports" className="btn-outline flex items-center gap-2">
            <TrendingUp size={16} />
            View Reports
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => (
          <Link
            key={idx}
            to={card.link}
            className="curved-card bg-white p-6 shadow-curved hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                card.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-chocolate mb-1">
                {card.value}
              </p>
              <p className="text-sm text-coffee/60">{card.title}</p>
            </div>
            <div className="mt-4 flex items-center text-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View Details <ArrowUpRight size={14} className="ml-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 curved-card bg-white p-6 shadow-curved">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold text-chocolate flex items-center gap-2">
              <Activity size={20} className="text-gold" />
              Recent Activity
            </h2>
            <Link to="/admin/orders" className="text-sm text-gold hover:text-chocolate transition-colors">
              View All
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-beige mb-3" />
              <p className="text-coffee/60">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-ivory/50 hover:bg-cream/30 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'order' ? 'bg-green-100 text-green-600' :
                    activity.type === 'inquiry' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'appointment' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'order' && <ShoppingBag size={20} />}
                    {activity.type === 'inquiry' && <Users size={20} />}
                    {activity.type === 'appointment' && <Calendar size={20} />}
                    {activity.type === 'product' && <Package size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-chocolate truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-coffee/60 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-coffee/40 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {activity.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' || activity.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      activity.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="curved-card bg-white p-6 shadow-curved">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold text-chocolate flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              Low Stock Alert
            </h2>
            <Link to="/admin/products" className="text-sm text-gold hover:text-chocolate transition-colors">
              View All
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-beige mb-3" />
              <p className="text-coffee/60">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-chocolate truncate text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-coffee/60 truncate">
                      {product.categories?.name || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      {product.stock_quantity}
                    </p>
                    <p className="text-xs text-coffee/60">left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Stats */}
        <div className="curved-card bg-gradient-to-br from-gold/10 to-champagne/5 p-6 shadow-curved">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gold/20">
              <DollarSign size={24} className="text-gold" />
            </div>
            <div>
              <p className="text-sm text-coffee/60">Total Revenue</p>
              <p className="text-2xl font-bold text-chocolate">
                ₹{(stats.totalOrders * 1500).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="curved-card bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-curved">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-coffee/60">Total Customers</p>
              <p className="text-2xl font-bold text-chocolate">
                {stats.totalOrders}
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+12 new this week</span>
          </div>
        </div>

        {/* Product Stats */}
        <div className="curved-card bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-curved">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Star size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-coffee/60">Featured Products</p>
              <p className="text-2xl font-bold text-chocolate">
                {products.filter(p => p.is_featured).length}
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-blue-600">
            <Zap size={16} className="mr-1" />
            <span>Top performing items</span>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="curved-card bg-white p-6 shadow-curved">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-semibold text-chocolate flex items-center gap-2">
            <Eye size={20} className="text-gold" />
            Recent Products
          </h2>
          <Link to="/admin/products" className="text-sm text-gold hover:text-chocolate transition-colors">
            View All Products
          </Link>
        </div>

        {productsLoading ? (
          <div className="flex justify-center py-8">
            <div className="spinner-luxury" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-beige mb-3" />
            <p className="text-coffee/60">No products yet</p>
            <Link to="/admin/products" className="btn-primary mt-4 inline-flex">
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="group curved-card bg-ivory/50 hover:bg-cream/50 p-4 transition-all duration-300"
              >
                <div className="aspect-square rounded-lg bg-gradient-to-br from-cream to-beige/20 mb-3 overflow-hidden flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <Package size={48} className="text-beige" />
                  )}
                </div>
                <h3 className="font-medium text-chocolate text-sm truncate mb-1">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-gold">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-coffee/60">
                    Stock: {product.stock_quantity}
                  </span>
                  {product.is_featured && (
                    <Star size={14} className="text-gold fill-gold" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
