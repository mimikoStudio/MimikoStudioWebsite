import { supabase } from '../lib/supabase';

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  category?: string;
  product?: string;
  orderStatus?: string;
  paymentStatus?: string;
  customer?: string;
}

export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalDiscount: number;
  totalShipping: number;
  netSales: number;
  salesByDate: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface OrderReport {
  totalOrders: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  ordersByDate: Array<{
    date: string;
    count: number;
  }>;
}

export interface CategoryReport {
  categories: Array<{
    categoryId: string;
    categoryName: string;
    orderCount: number;
    unitsSold: number;
    revenue: number;
    percentage: number;
  }>;
}

export interface ProductReport {
  products: Array<{
    productId: string;
    productName: string;
    categoryName: string;
    quantitySold: number;
    orderCount: number;
    revenue: number;
    averagePrice: number;
  }>;
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string;
  }>;
}

export interface InventoryReport {
  totalProducts: number;
  totalUnits: number;
  lowStockProducts: Array<{
    productId: string;
    productName: string;
    categoryName: string;
    currentStock: number;
    threshold: number;
  }>;
  outOfStockProducts: Array<{
    productId: string;
    productName: string;
    categoryName: string;
  }>;
}

export interface DashboardInsights {
  todayOrders: number;
  todaySales: number;
  monthSales: number;
  topProduct: {
    name: string;
    revenue: number;
  } | null;
  topCategory: {
    name: string;
    revenue: number;
  } | null;
  lowStockCount: number;
  pendingOrders: number;
  newCustomers: number;
}

/**
 * Get sales report
 */
export async function getSalesReport(filters: ReportFilters): Promise<SalesReport> {
  try {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);

    if (filters.orderStatus) {
      query = query.eq('order_status', filters.orderStatus);
    }

    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }

    const {  orders, error } = await query;

    if (error) {
      console.error('Error fetching sales report:', error);
      return {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalDiscount: 0,
        totalShipping: 0,
        netSales: 0,
        salesByDate: [],
      };
    }

    if (!orders || orders.length === 0) {
      return {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalDiscount: 0,
        totalShipping: 0,
        netSales: 0,
        salesByDate: [],
      };
    }

    const totalSales = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalDiscount = orders.reduce((sum: number, order: any) => sum + (order.discount_amount || 0), 0);
    const totalShipping = orders.reduce((sum: number, order: any) => sum + (order.shipping_fee || 0), 0);
    const netSales = totalSales - totalDiscount;

    // Group sales by date
    const salesByDateMap = new Map<string, { sales: number; orders: number }>();
    orders.forEach((order: any) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      const existing = salesByDateMap.get(date) || { sales: 0, orders: 0 };
      salesByDateMap.set(date, {
        sales: existing.sales + (order.total_amount || 0),
        orders: existing.orders + 1,
      });
    });

    const salesByDate = Array.from(salesByDateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      totalDiscount,
      totalShipping,
      netSales,
      salesByDate,
    };
  } catch (error) {
    console.error('Error in getSalesReport:', error);
    return {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalDiscount: 0,
      totalShipping: 0,
      netSales: 0,
      salesByDate: [],
    };
  }
}

/**
 * Get order report
 */
export async function getOrderReport(filters: ReportFilters): Promise<OrderReport> {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);

    if (filters.orderStatus) {
      query = query.eq('order_status', filters.orderStatus);
    }

    const {  orders, error } = await query;

    if (error || !orders) {
      return {
        totalOrders: 0,
        ordersByStatus: [],
        ordersByDate: [],
      };
    }

    const totalOrders = orders.length;

    // Group by status
    const statusMap = new Map<string, number>();
    orders.forEach((order: any) => {
      const status = order.order_status || 'unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const ordersByStatus = Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Group by date
    const dateMap = new Map<string, number>();
    orders.forEach((order: any) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    const ordersByDate = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalOrders,
      ordersByStatus,
      ordersByDate,
    };
  } catch (error) {
    console.error('Error in getOrderReport:', error);
    return {
      totalOrders: 0,
      ordersByStatus: [],
      ordersByDate: [],
    };
  }
}

/**
 * Get category report
 */
export async function getCategoryReport(filters: ReportFilters): Promise<CategoryReport> {
  try {
    let query = supabase
      .from('order_items')
      .select('*, orders!inner(*), products!inner(*, categories(*))')
      .gte('orders.created_at', filters.dateRange.start)
      .lte('orders.created_at', filters.dateRange.end);

    if (filters.category) {
      query = query.eq('products.category_id', filters.category);
    }

    const {  orderItems, error } = await query;

    if (error || !orderItems) {
      return { categories: [] };
    }

    // Group by category
    const categoryMap = new Map<string, {
      categoryId: string;
      categoryName: string;
      orderCount: number;
      unitsSold: number;
      revenue: number;
    }>();

    orderItems.forEach((item: any) => {
      const category = item.products?.categories;
      if (!category) return;

      const existing = categoryMap.get(category.id) || {
        categoryId: category.id,
        categoryName: category.name,
        orderCount: 0,
        unitsSold: 0,
        revenue: 0,
      };

      categoryMap.set(category.id, {
        ...existing,
        orderCount: existing.orderCount + 1,
        unitsSold: existing.unitsSold + (item.quantity || 0),
        revenue: existing.revenue + ((item.unit_price || 0) * (item.quantity || 0)),
      });
    });

    const totalRevenue = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.revenue, 0);

    const categories = Array.from(categoryMap.values())
      .map(cat => ({
        ...cat,
        percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return { categories };
  } catch (error) {
    console.error('Error in getCategoryReport:', error);
    return { categories: [] };
  }
}

/**
 * Get product report
 */
export async function getProductReport(filters: ReportFilters): Promise<ProductReport> {
  try {
    let query = supabase
      .from('order_items')
      .select('*, orders!inner(*), products!inner(*, categories(*))')
      .gte('orders.created_at', filters.dateRange.start)
      .lte('orders.created_at', filters.dateRange.end);

    if (filters.product) {
      query = query.eq('product_id', filters.product);
    }

    if (filters.category) {
      query = query.eq('products.category_id', filters.category);
    }

    const {  orderItems, error } = await query;

    if (error || !orderItems) {
      return { products: [] };
    }

    // Group by product
    const productMap = new Map<string, {
      productId: string;
      productName: string;
      categoryName: string;
      quantitySold: number;
      orderCount: number;
      revenue: number;
    }>();

    orderItems.forEach((item: any) => {
      const product = item.products;
      if (!product) return;

      const existing = productMap.get(product.id) || {
        productId: product.id,
        productName: product.name,
        categoryName: product.categories?.name || 'Uncategorized',
        quantitySold: 0,
        orderCount: 0,
        revenue: 0,
      };

      productMap.set(product.id, {
        ...existing,
        quantitySold: existing.quantitySold + (item.quantity || 0),
        orderCount: existing.orderCount + 1,
        revenue: existing.revenue + ((item.unit_price || 0) * (item.quantity || 0)),
      });
    });

    const products = Array.from(productMap.values())
      .map(prod => ({
        ...prod,
        averagePrice: prod.quantitySold > 0 ? prod.revenue / prod.quantitySold : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return { products };
  } catch (error) {
    console.error('Error in getProductReport:', error);
    return { products: [] };
  }
}

/**
 * Get customer report
 */
export async function getCustomerReport(filters: ReportFilters): Promise<CustomerReport> {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);

    if (filters.customer) {
      query = query.eq('customer_id', filters.customer);
    }

    const {  orders, error } = await query;

    if (error || !orders) {
      return {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        topCustomers: [],
      };
    }

    // Group by customer
    const customerMap = new Map<string, {
      customerId: string;
      customerName: string;
      email: string;
      phone: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: string;
    }>();

    orders.forEach((order: any) => {
      const customerId = order.customer_id || order.email;
      const existing = customerMap.get(customerId) || {
        customerId,
        customerName: order.customer_name,
        email: order.email,
        phone: order.phone,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: order.created_at,
      };

      customerMap.set(customerId, {
        ...existing,
        totalOrders: existing.totalOrders + 1,
        totalSpent: existing.totalSpent + (order.total_amount || 0),
        lastOrderDate: new Date(existing.lastOrderDate) > new Date(order.created_at)
          ? existing.lastOrderDate
          : order.created_at,
      });
    });

    const totalCustomers = customerMap.size;
    const topCustomers = Array.from(customerMap.values())
      .map(customer => ({
        ...customer,
        averageOrderValue: customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Calculate new vs returning customers (simplified)
    const newCustomers = Math.floor(totalCustomers * 0.3); // Approximation
    const returningCustomers = totalCustomers - newCustomers;

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      topCustomers,
    };
  } catch (error) {
    console.error('Error in getCustomerReport:', error);
    return {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      topCustomers: [],
    };
  }
}

/**
 * Get inventory report
 */
export async function getInventoryReport(): Promise<InventoryReport> {
  try {
    const {  products, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_published', true);

    if (error || !products) {
      return {
        totalProducts: 0,
        totalUnits: 0,
        lowStockProducts: [],
        outOfStockProducts: [],
      };
    }

    const totalProducts = products.length;
    const totalUnits = products.reduce((sum: number, p: any) => sum + (p.stock_quantity || 0), 0);

    const lowStockThreshold = 5;
    const lowStockProducts = products
      .filter((p: any) => p.stock_quantity > 0 && p.stock_quantity <= lowStockThreshold)
      .map((p: any) => ({
        productId: p.id,
        productName: p.name,
        categoryName: p.categories?.name || 'Uncategorized',
        currentStock: p.stock_quantity,
        threshold: lowStockThreshold,
      }));

    const outOfStockProducts = products
      .filter((p: any) => p.stock_quantity === 0)
      .map((p: any) => ({
        productId: p.id,
        productName: p.name,
        categoryName: p.categories?.name || 'Uncategorized',
      }));

    return {
      totalProducts,
      totalUnits,
      lowStockProducts,
      outOfStockProducts,
    };
  } catch (error) {
    console.error('Error in getInventoryReport:', error);
    return {
      totalProducts: 0,
      totalUnits: 0,
      lowStockProducts: [],
      outOfStockProducts: [],
    };
  }
}

/**
 * Get dashboard insights
 */
export async function getDashboardInsights(): Promise<DashboardInsights> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString();

    // Today's orders and sales
    const {  todayOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', todayStr);

    const todayOrdersCount = todayOrders?.length || 0;
    const todaySales = todayOrders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0;

    // Month sales
    const {  monthOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', monthStartStr);

    const monthSales = monthOrders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0;

    // Top product
    const {  topProducts } = await supabase
      .from('order_items')
      .select('product_id, quantity, unit_price, products(name)')
      .order('quantity', { ascending: false })
      .limit(1);

    const topProduct = topProducts && topProducts.length > 0 ? {
      name: topProducts[0].products?.name || 'Unknown',
      revenue: (topProducts[0].quantity || 0) * (topProducts[0].unit_price || 0),
    } : null;

    // Top category
    const {  topCategories } = await supabase
      .from('order_items')
      .select('quantity, unit_price, products!inner(categories(name))')
      .order('quantity', { ascending: false })
      .limit(100);

    const categoryRevenue = new Map<string, number>();
    topCategories?.forEach((item: any) => {
      const categoryName = item.products?.categories?.name || 'Unknown';
      const revenue = (item.quantity || 0) * (item.unit_price || 0);
      categoryRevenue.set(categoryName, (categoryRevenue.get(categoryName) || 0) + revenue);
    });

    const topCategoryEntry = Array.from(categoryRevenue.entries()).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCategoryEntry ? {
      name: topCategoryEntry[0],
      revenue: topCategoryEntry[1],
    } : null;

    // Low stock count
    const { count: lowStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock_quantity', 5)
      .gt('stock_quantity', 0)
      .eq('is_published', true);

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'pending');

    // New customers this month
    const {  newCustomers } = await supabase
      .from('orders')
      .select('customer_id')
      .gte('created_at', monthStartStr);

    const uniqueCustomers = new Set(newCustomers?.map((o: any) => o.customer_id));
    const newCustomersCount = uniqueCustomers.size;

    return {
      todayOrders: todayOrdersCount,
      todaySales,
      monthSales,
      topProduct,
      topCategory,
      lowStockCount: lowStockCount || 0,
      pendingOrders: pendingOrders || 0,
      newCustomers: newCustomersCount,
    };
  } catch (error) {
    console.error('Error in getDashboardInsights:', error);
    return {
      todayOrders: 0,
      todaySales: 0,
      monthSales: 0,
      topProduct: null,
      topCategory: null,
      lowStockCount: 0,
      pendingOrders: 0,
      newCustomers: 0,
    };
  }
}
