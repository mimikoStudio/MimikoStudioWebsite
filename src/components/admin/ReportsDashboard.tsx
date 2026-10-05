import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Package, Users, ShoppingCart, DollarSign, 
  AlertTriangle, Calendar, Filter, Download, Eye
} from 'lucide-react';
import { 
  getSalesReport, getOrderReport, getCategoryReport, 
  getProductReport, getCustomerReport, getInventoryReport,
  getDashboardInsights,
  SalesReport, OrderReport, CategoryReport, ProductReport, 
  CustomerReport, InventoryReport, DashboardInsights,
  ReportFilters
} from '../../lib/reportService';
import { exportSalesReportToExcel, exportCategoryReportToExcel, exportProductSalesToExcel } from '../../lib/excelExport';

type ReportType = 'dashboard' | 'sales' | 'orders' | 'categories' | 'products' | 'customers' | 'inventory';

export default function ReportsDashboard() {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState<ReportType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [orderReport, setOrderReport] = useState<OrderReport | null>(null);
  const [categoryReport, setCategoryReport] = useState<CategoryReport | null>(null);
  const [productReport, setProductReport] = useState<ProductReport | null>(null);
  const [customerReport, setCustomerReport] = useState<CustomerReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);

  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    loadReport();
  }, [activeReport, filters]);

  const loadReport = async () => {
    setLoading(true);
    try {
      switch (activeReport) {
        case 'dashboard':
          const insightsData = await getDashboardInsights();
          setInsights(insightsData);
          break;
        case 'sales':
          const salesData = await getSalesReport(filters);
          setSalesReport(salesData);
          break;
        case 'orders':
          const orderData = await getOrderReport(filters);
          setOrderReport(orderData);
          break;
        case 'categories':
          const categoryData = await getCategoryReport(filters);
          setCategoryReport(categoryData);
          break;
        case 'products':
          const productData = await getProductReport(filters);
          setProductReport(productData);
          break;
        case 'customers':
          const customerData = await getCustomerReport(filters);
          setCustomerReport(customerData);
          break;
        case 'inventory':
          const inventoryData = await getInventoryReport();
          setInventoryReport(inventoryData);
          break;
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    switch (activeReport) {
      case 'sales':
        if (salesReport?.salesByDate) {
          exportSalesReportToExcel(salesReport.salesByDate, 'Sales_Report');
        }
        break;
      case 'categories':
        if (categoryReport?.categories) {
          exportCategoryReportToExcel(categoryReport.categories, 'Category_Report');
        }
        break;
      case 'products':
        if (productReport?.products) {
          exportProductSalesToExcel(productReport.products, 'Product_Sales');
        }
        break;
    }
  };

  const reportTabs = [
    { id: 'dashboard' as ReportType, label: '📊 Dashboard', icon: <TrendingUp size={16} /> },
    { id: 'sales' as ReportType, label: '💰 Sales', icon: <DollarSign size={16} /> },
    { id: 'orders' as ReportType, label: '📦 Orders', icon: <ShoppingCart size={16} /> },
    { id: 'categories' as ReportType, label: '🏷️ Categories', icon: <Package size={16} /> },
    { id: 'products' as ReportType, label: '💎 Products', icon: <Package size={16} /> },
    { id: 'customers' as ReportType, label: '👥 Customers', icon: <Users size={16} /> },
    { id: 'inventory' as ReportType, label: '📋 Inventory', icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">📊 Reports & Analytics</h2>
        <button
          onClick={handleExport}
          className="btn-primary flex items-center gap-2"
          disabled={loading || activeReport === 'dashboard' || activeReport === 'orders' || activeReport === 'customers' || activeReport === 'inventory'}
        >
          <Download size={16} />
          Export Excel
        </button>
      </div>

      {/* Report Tabs */}
      <div className="bg-pearl border border-beige/20 rounded-sm mb-6">
        <div className="flex overflow-x-auto border-b border-beige/20">
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                activeReport === tab.id
                  ? 'text-gold border-b-2 border-gold bg-gold/5'
                  : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        {activeReport !== 'dashboard' && activeReport !== 'inventory' && (
          <div className="p-4 border-b border-beige/20">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                  className="input-luxury"
                />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
                  className="input-luxury"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    dateRange: {
                      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      end: new Date().toISOString().split('T')[0],
                    },
                  })}
                  className="btn-outline"
                >
                  Last 7 Days
                </button>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    dateRange: {
                      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      end: new Date().toISOString().split('T')[0],
                    },
                  })}
                  className="btn-outline"
                >
                  Last 30 Days
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner-luxury" />
            </div>
          ) : (
            <>
              {activeReport === 'dashboard' && insights && <DashboardView insights={insights} />}
              {activeReport === 'sales' && salesReport && <SalesView report={salesReport} />}
              {activeReport === 'orders' && orderReport && <OrdersView report={orderReport} />}
              {activeReport === 'categories' && categoryReport && <CategoriesView report={categoryReport} />}
              {activeReport === 'products' && productReport && <ProductsView report={productReport} />}
              {activeReport === 'customers' && customerReport && <CustomersView report={customerReport} />}
              {activeReport === 'inventory' && inventoryReport && <InventoryView report={inventoryReport} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Dashboard View
function DashboardView({ insights }: { insights: DashboardInsights }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📦</span>
            <span className="text-xs font-label tracking-wider uppercase text-coffee/50">Today's Orders</span>
          </div>
          <p className="text-3xl font-bold text-chocolate">{insights.todayOrders}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">💰</span>
            <span className="text-xs font-label tracking-wider uppercase text-coffee/50">Today's Sales</span>
          </div>
          <p className="text-3xl font-bold text-chocolate">₹{insights.todaySales.toLocaleString()}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📈</span>
            <span className="text-xs font-label tracking-wider uppercase text-coffee/50">This Month</span>
          </div>
          <p className="text-3xl font-bold text-chocolate">₹{insights.monthSales.toLocaleString()}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⚠️</span>
            <span className="text-xs font-label tracking-wider uppercase text-coffee/50">Low Stock</span>
          </div>
          <p className="text-3xl font-bold text-chocolate">{insights.lowStockCount}</p>
        </div>
      </div>

      {/* Business Insights */}
      <div className="bg-pearl border border-beige/20 rounded-sm p-6">
        <h3 className="font-heading text-lg text-chocolate mb-4">💡 Business Insights</h3>
        <div className="space-y-3">
          {insights.topCategory && (
            <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-sm">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-sm font-medium text-chocolate">Top Category</p>
                <p className="text-xs text-coffee/60">{insights.topCategory.name} - ₹{insights.topCategory.revenue.toLocaleString()}</p>
              </div>
            </div>
          )}
          {insights.topProduct && (
            <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-sm">
              <span className="text-2xl">💎</span>
              <div>
                <p className="text-sm font-medium text-chocolate">Best Selling Product</p>
                <p className="text-xs text-coffee/60">{insights.topProduct.name} - ₹{insights.topProduct.revenue.toLocaleString()}</p>
              </div>
            </div>
          )}
          {insights.lowStockCount > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blush/10 rounded-sm">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-chocolate">Low Stock Alert</p>
                <p className="text-xs text-coffee/60">{insights.lowStockCount} products are running low on stock</p>
              </div>
            </div>
          )}
          {insights.newCustomers > 0 && (
            <div className="flex items-center gap-3 p-3 bg-sage/10 rounded-sm">
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-sm font-medium text-chocolate">New Customers</p>
                <p className="text-xs text-coffee/60">{insights.newCustomers} new customers this month</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sales View
function SalesView({ report }: { report: SalesReport }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Total Sales</p>
          <p className="text-2xl font-bold text-chocolate">₹{report.totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Total Orders</p>
          <p className="text-2xl font-bold text-chocolate">{report.totalOrders}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Average Order</p>
          <p className="text-2xl font-bold text-chocolate">₹{report.averageOrderValue.toLocaleString()}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Net Sales</p>
          <p className="text-2xl font-bold text-chocolate">₹{report.netSales.toLocaleString()}</p>
        </div>
      </div>

      {/* Sales by Date */}
      {report.salesByDate.length > 0 && (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <h3 className="font-heading text-lg text-chocolate mb-4">Sales Over Time</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Sales</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/20">
                {report.salesByDate.map((day, idx) => (
                  <tr key={idx} className="hover:bg-cream/30">
                    <td className="px-4 py-3 text-chocolate">{day.date}</td>
                    <td className="px-4 py-3 text-right font-medium text-chocolate">₹{day.sales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-coffee/70">{day.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Orders View
function OrdersView({ report }: { report: OrderReport }) {
  return (
    <div className="space-y-6">
      <div className="bg-pearl border border-beige/20 rounded-sm p-6">
        <h3 className="font-heading text-lg text-chocolate mb-4">Total Orders: {report.totalOrders}</h3>
        {report.ordersByStatus.length > 0 && (
          <div className="space-y-3">
            {report.ordersByStatus.map((status, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-ivory rounded-sm">
                <div>
                  <p className="font-medium text-chocolate capitalize">{status.status}</p>
                  <p className="text-xs text-coffee/50">{status.count} orders</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gold">{status.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Categories View
function CategoriesView({ report }: { report: CategoryReport }) {
  return (
    <div className="space-y-6">
      {report.categories.length > 0 ? (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <h3 className="font-heading text-lg text-chocolate mb-4">Category Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Orders</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Units Sold</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/20">
                {report.categories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-cream/30">
                    <td className="px-4 py-3 font-medium text-chocolate">{cat.categoryName}</td>
                    <td className="px-4 py-3 text-right text-coffee/70">{cat.orderCount}</td>
                    <td className="px-4 py-3 text-right text-coffee/70">{cat.unitsSold}</td>
                    <td className="px-4 py-3 text-right font-medium text-chocolate">₹{cat.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gold font-medium">{cat.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No category data available for the selected period</p>
        </div>
      )}
    </div>
  );
}

// Products View
function ProductsView({ report }: { report: ProductReport }) {
  return (
    <div className="space-y-6">
      {report.products.length > 0 ? (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <h3 className="font-heading text-lg text-chocolate mb-4">Product Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Qty Sold</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Orders</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Avg Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/20">
                {report.products.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-cream/30">
                    <td className="px-4 py-3 font-medium text-chocolate">{prod.productName}</td>
                    <td className="px-4 py-3 text-coffee/70">{prod.categoryName}</td>
                    <td className="px-4 py-3 text-right text-coffee/70">{prod.quantitySold}</td>
                    <td className="px-4 py-3 text-right text-coffee/70">{prod.orderCount}</td>
                    <td className="px-4 py-3 text-right font-medium text-chocolate">₹{prod.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-coffee/70">₹{prod.averagePrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No product data available for the selected period</p>
        </div>
      )}
    </div>
  );
}

// Customers View
function CustomersView({ report }: { report: CustomerReport }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Total Customers</p>
          <p className="text-2xl font-bold text-chocolate">{report.totalCustomers}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">New Customers</p>
          <p className="text-2xl font-bold text-chocolate">{report.newCustomers}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Returning</p>
          <p className="text-2xl font-bold text-chocolate">{report.returningCustomers}</p>
        </div>
      </div>

      {/* Top Customers */}
      {report.topCustomers.length > 0 && (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <h3 className="font-heading text-lg text-chocolate mb-4">Top Customers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Orders</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Total Spent</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Avg Order</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/20">
                {report.topCustomers.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-cream/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-chocolate">{customer.customerName}</p>
                      <p className="text-xs text-coffee/50">{customer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-coffee/70">{customer.totalOrders}</td>
                    <td className="px-4 py-3 text-right font-medium text-chocolate">₹{customer.totalSpent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-coffee/70">₹{customer.averageOrderValue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-coffee/70">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Inventory View
function InventoryView({ report }: { report: InventoryReport }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Total Products</p>
          <p className="text-2xl font-bold text-chocolate">{report.totalProducts}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Total Units</p>
          <p className="text-2xl font-bold text-chocolate">{report.totalUnits}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Low Stock</p>
          <p className="text-2xl font-bold text-gold">{report.lowStockProducts.length}</p>
        </div>
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <p className="text-xs font-label tracking-wider uppercase text-coffee/50 mb-2">Out of Stock</p>
          <p className="text-2xl font-bold text-blush">{report.outOfStockProducts.length}</p>
        </div>
      </div>

      {/* Low Stock Products */}
      {report.lowStockProducts.length > 0 && (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <h3 className="font-heading text-lg text-chocolate mb-4">⚠️ Low Stock Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Current Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/20">
                {report.lowStockProducts.map((product, idx) => (
                  <tr key={idx} className="hover:bg-cream/30">
                    <td className="px-4 py-3 font-medium text-chocolate">{product.productName}</td>
                    <td className="px-4 py-3 text-coffee/70">{product.categoryName}</td>
                    <td className="px-4 py-3 text-right font-medium text-gold">{product.currentStock}</td>
                    <td className="px-4 py-3 text-right text-coffee/70">{product.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Out of Stock Products */}
      {report.outOfStockProducts.length > 0 && (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <h3 className="font-heading text-lg text-chocolate mb-4">🔴 Out of Stock Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/20">
                {report.outOfStockProducts.map((product, idx) => (
                  <tr key={idx} className="hover:bg-cream/30">
                    <td className="px-4 py-3 font-medium text-chocolate">{product.productName}</td>
                    <td className="px-4 py-3 text-coffee/70">{product.categoryName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
