import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${filename}.xlsx`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Export orders to Excel
 */
export function exportOrdersToExcel(orders: any[], filename: string = 'Orders') {
  const orderData = orders.map(order => ({
    'Order ID': order.order_number || order.id,
    'Invoice Number': order.invoice_number || '',
    'Order Date': new Date(order.created_at).toLocaleDateString(),
    'Customer Name': order.customer_name,
    'Customer Phone': order.phone,
    'Customer Email': order.email,
    'Subtotal': order.subtotal,
    'Discount': order.discount_amount || 0,
    'Shipping': order.shipping_fee || 0,
    'Total': order.total_amount,
    'Payment Status': order.payment_status,
    'Order Status': order.order_status,
    'Shipping Address': order.shipping_address,
  }));

  return exportToExcel(orderData, filename, 'Orders');
}

/**
 * Export order items to Excel
 */
export function exportOrderItemsToExcel(orderItems: any[], filename: string = 'Order_Items') {
  const itemData = orderItems.map(item => ({
    'Order ID': item.order_id,
    'Product Name': item.product_name,
    'Category': item.products?.categories?.name || 'Uncategorized',
    'Quantity': item.quantity,
    'Unit Price': item.unit_price,
    'Total': item.quantity * item.unit_price,
    'Size': item.selected_options?.size || '',
    'Color': item.selected_options?.color || '',
  }));

  return exportToExcel(itemData, filename, 'Order Items');
}

/**
 * Export products to Excel
 */
export function exportProductsToExcel(products: any[], filename: string = 'Products') {
  const productData = products.map(product => ({
    'Product ID': product.id,
    'Name': product.name,
    'Category': product.categories?.name || 'Uncategorized',
    'Price': product.price,
    'Sale Price': product.sale_price || '',
    'Stock': product.stock_quantity,
    'Material': product.material || '',
    'Sizes': product.sizes?.join(', ') || '',
    'Colors': product.colors?.join(', ') || '',
    'Published': product.is_published ? 'Yes' : 'No',
    'Featured': product.is_featured ? 'Yes' : 'No',
    'New Arrival': product.is_new_arrival ? 'Yes' : 'No',
  }));

  return exportToExcel(productData, filename, 'Products');
}

/**
 * Export customers to Excel
 */
export function exportCustomersToExcel(customers: any[], filename: string = 'Customers') {
  const customerData = customers.map(customer => ({
    'Customer ID': customer.customerId || customer.id,
    'Name': customer.customerName || customer.full_name || customer.name,
    'Email': customer.email,
    'Phone': customer.phone,
    'Total Orders': customer.totalOrders || 0,
    'Total Spent': customer.totalSpent || 0,
    'Average Order Value': customer.averageOrderValue || 0,
    'Last Order': customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : '',
  }));

  return exportToExcel(customerData, filename, 'Customers');
}

/**
 * Export sales report to Excel
 */
export function exportSalesReportToExcel(
  salesData: any[],
  filename: string = 'Sales_Report'
) {
  const reportData = salesData.map(sale => ({
    'Date': sale.date,
    'Sales': sale.sales,
    'Orders': sale.orders,
  }));

  return exportToExcel(reportData, filename, 'Sales Report');
}

/**
 * Export category report to Excel
 */
export function exportCategoryReportToExcel(
  categories: any[],
  filename: string = 'Category_Report'
) {
  const reportData = categories.map(category => ({
    'Category': category.categoryName,
    'Orders': category.orderCount,
    'Units Sold': category.unitsSold,
    'Revenue': category.revenue,
    'Percentage': `${category.percentage.toFixed(2)}%`,
  }));

  return exportToExcel(reportData, filename, 'Category Report');
}

/**
 * Export product sales report to Excel
 */
export function exportProductSalesToExcel(
  products: any[],
  filename: string = 'Product_Sales'
) {
  const reportData = products.map(product => ({
    'Product': product.productName,
    'Category': product.categoryName,
    'Quantity Sold': product.quantitySold,
    'Number of Orders': product.orderCount,
    'Revenue': product.revenue,
    'Average Price': product.averagePrice.toFixed(2),
  }));

  return exportToExcel(reportData, filename, 'Product Sales');
}

/**
 * Export inventory report to Excel
 */
export function exportInventoryToExcel(
  products: any[],
  filename: string = 'Inventory'
) {
  const reportData = products.map(product => ({
    'Product': product.name,
    'Category': product.categories?.name || 'Uncategorized',
    'Current Stock': product.stock_quantity,
    'Status': product.stock_quantity === 0 ? 'Out of Stock' : 
              product.stock_quantity <= 5 ? 'Low Stock' : 'In Stock',
  }));

  return exportToExcel(reportData, filename, 'Inventory');
}

/**
 * Export invoices to Excel
 */
export function exportInvoicesToExcel(
  invoices: any[],
  filename: string = 'Invoices'
) {
  const invoiceData = invoices.map(invoice => ({
    'Invoice Number': invoice.invoice_number,
    'Order ID': invoice.order?.order_number || invoice.order_id,
    'Invoice Date': new Date(invoice.invoice_date).toLocaleDateString(),
    'Customer Name': invoice.order?.customer_name || '',
    'Subtotal': invoice.subtotal,
    'Discount': invoice.discount_amount,
    'Tax': invoice.tax_amount,
    'Shipping': invoice.shipping_amount,
    'Total': invoice.total_amount,
    'Amount Paid': invoice.amount_paid,
    'Balance Due': invoice.balance_due,
  }));

  return exportToExcel(invoiceData, filename, 'Invoices');
}
