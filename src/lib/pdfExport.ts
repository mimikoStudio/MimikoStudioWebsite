import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from './supabase';

interface PDFConfig {
  title: string;
  subtitle?: string;
  headers: string[];
  data: any[][];
  filename: string;
  orientation?: 'portrait' | 'landscape';
  includeCompanyInfo?: boolean;
  includeDate?: boolean;
  includePageNumbers?: boolean;
}

/**
 * Generate a professional PDF report
 */
export async function generatePDF(config: PDFConfig): Promise<void> {
  const {
    title,
    subtitle,
    headers,
    data,
    filename,
    orientation = 'portrait',
    includeCompanyInfo = true,
    includeDate = true,
    includePageNumbers = true,
  } = config;

  // Get company information
  const { data: businessProfile } = await supabase
    .from('business_profile')
    .select('*')
    .single();

  // Create PDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Add company header
  if (includeCompanyInfo && businessProfile) {
    // Company name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99); // Dark gray
    doc.text(businessProfile.company_name || 'Mimiko Studio', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Company details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // Medium gray
    
    if (businessProfile.company_address) {
      doc.text(businessProfile.company_address, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
    }
    
    const contactInfo = [];
    if (businessProfile.company_phone) contactInfo.push(`Phone: ${businessProfile.company_phone}`);
    if (businessProfile.company_email) contactInfo.push(`Email: ${businessProfile.company_email}`);
    if (businessProfile.company_website) contactInfo.push(`Web: ${businessProfile.company_website}`);
    
    if (contactInfo.length > 0) {
      doc.text(contactInfo.join(' | '), pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    }

    // Divider line
    doc.setDrawColor(212, 175, 55); // Gold color
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
  }

  // Add report title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(75, 85, 99);
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(subtitle, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }

  // Add date
  if (includeDate) {
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Generated on: ${dateStr}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
  }

  // Add table
  autoTable(doc, {
    startY: yPos,
    head: [headers],
    body: data,
    theme: 'striped',
    headStyles: {
      fillColor: [212, 175, 55], // Gold color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { top: 20, left: 20, right: 20 },
    didDrawPage: (data) => {
      // Add page numbers
      if (includePageNumbers) {
        const pageCount = doc.getNumberOfPages();
        const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
        
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(
          `Page ${currentPage} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    },
  });

  // Add footer
  const finalYPos = (doc as any).lastAutoTable.finalY || yPos;
  if (finalYPos + 30 < pageHeight) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      'This report was generated automatically by Mimiko Studio Management System',
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }

  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Generate CSV from data
 */
export function generateCSV(headers: string[], data: any[][], filename: string): void {
  // Convert data to CSV format
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const cellStr = String(cell ?? '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export report data to PDF
 */
export async function exportReportToPDF(
  reportType: string,
  data: any[],
  filters?: any
): Promise<void> {
  let title = '';
  let headers: string[] = [];
  let tableData: any[][] = [];

  switch (reportType) {
    case 'sales':
      title = 'Sales Report';
      headers = ['Date', 'Order ID', 'Customer', 'Amount', 'Status'];
      tableData = data.map((item: any) => [
        new Date(item.created_at).toLocaleDateString('en-IN'),
        item.order_number || item.id,
        item.customer_name || 'Guest',
        `₹${item.total_amount?.toLocaleString('en-IN') || '0'}`,
        item.payment_status || 'pending',
      ]);
      break;

    case 'orders':
      title = 'Orders Report';
      headers = ['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Status'];
      tableData = data.map((item: any) => [
        item.order_number || item.id,
        new Date(item.created_at).toLocaleDateString('en-IN'),
        item.customer_name || 'Guest',
        item.items_count || item.order_items?.length || 0,
        `₹${item.total_amount?.toLocaleString('en-IN') || '0'}`,
        item.order_status || 'pending',
      ]);
      break;

    case 'products':
      title = 'Products Report';
      headers = ['Product Name', 'Category', 'Price', 'Stock', 'Status'];
      tableData = data.map((item: any) => [
        item.name,
        item.category_name || item.categories?.name || 'Uncategorized',
        `₹${item.price?.toLocaleString('en-IN') || '0'}`,
        item.stock_quantity || 0,
        item.is_published ? 'Published' : 'Draft',
      ]);
      break;

    case 'customers':
      title = 'Customers Report';
      headers = ['Name', 'Email', 'Phone', 'Orders', 'Total Spent'];
      tableData = data.map((item: any) => [
        item.name || item.full_name || 'N/A',
        item.email || 'N/A',
        item.phone || 'N/A',
        item.orders_count || 0,
        `₹${item.total_spent?.toLocaleString('en-IN') || '0'}`,
      ]);
      break;

    case 'inventory':
      title = 'Inventory Report';
      headers = ['Product', 'SKU', 'Category', 'Stock', 'Status'];
      tableData = data.map((item: any) => [
        item.name,
        item.sku || 'N/A',
        item.category_name || item.categories?.name || 'Uncategorized',
        item.stock_quantity || 0,
        item.stock_quantity === 0 ? 'Out of Stock' : 
        item.stock_quantity <= 5 ? 'Low Stock' : 'In Stock',
      ]);
      break;

    case 'categories':
      title = 'Categories Report';
      headers = ['Category', 'Products', 'Total Sales', 'Revenue'];
      tableData = data.map((item: any) => [
        item.name,
        item.products_count || 0,
        item.total_sales || 0,
        `₹${item.revenue?.toLocaleString('en-IN') || '0'}`,
      ]);
      break;

    default:
      title = 'Report';
      headers = ['Data'];
      tableData = data.map((item: any) => [JSON.stringify(item)]);
  }

  // Add filter info to subtitle
  let subtitle = '';
  if (filters) {
    const filterParts = [];
    if (filters.dateRange?.start && filters.dateRange?.end) {
      filterParts.push(`From ${new Date(filters.dateRange.start).toLocaleDateString('en-IN')} to ${new Date(filters.dateRange.end).toLocaleDateString('en-IN')}`);
    }
    if (filters.category) {
      filterParts.push(`Category: ${filters.category}`);
    }
    if (filters.status) {
      filterParts.push(`Status: ${filters.status}`);
    }
    if (filterParts.length > 0) {
      subtitle = filterParts.join(' | ');
    }
  }

  await generatePDF({
    title,
    subtitle,
    headers,
    data: tableData,
    filename: `${reportType}_report_${new Date().toISOString().split('T')[0]}`,
    includeCompanyInfo: true,
    includeDate: true,
    includePageNumbers: true,
  });
}

/**
 * Export report data to CSV
 */
export function exportReportToCSV(
  reportType: string,
  data: any[],
  filters?: any
): void {
  let headers: string[] = [];
  let tableData: any[][] = [];

  switch (reportType) {
    case 'sales':
      headers = ['Date', 'Order ID', 'Customer', 'Email', 'Phone', 'Amount', 'Discount', 'Shipping', 'Total', 'Payment Status', 'Order Status'];
      tableData = data.map((item: any) => [
        new Date(item.created_at).toLocaleDateString('en-IN'),
        item.order_number || item.id,
        item.customer_name || 'Guest',
        item.email || '',
        item.phone || '',
        item.subtotal || 0,
        item.discount_amount || 0,
        item.shipping_fee || 0,
        item.total_amount || 0,
        item.payment_status || 'pending',
        item.order_status || 'pending',
      ]);
      break;

    case 'orders':
      headers = ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Items Count', 'Subtotal', 'Discount', 'Shipping', 'Total', 'Payment Status', 'Order Status'];
      tableData = data.map((item: any) => [
        item.order_number || item.id,
        new Date(item.created_at).toLocaleDateString('en-IN'),
        item.customer_name || 'Guest',
        item.email || '',
        item.phone || '',
        item.items_count || item.order_items?.length || 0,
        item.subtotal || 0,
        item.discount_amount || 0,
        item.shipping_fee || 0,
        item.total_amount || 0,
        item.payment_status || 'pending',
        item.order_status || 'pending',
      ]);
      break;

    case 'products':
      headers = ['Product Name', 'SKU', 'Category', 'Price', 'Sale Price', 'Stock', 'Status', 'Created Date'];
      tableData = data.map((item: any) => [
        item.name,
        item.sku || '',
        item.category_name || item.categories?.name || 'Uncategorized',
        item.price || 0,
        item.sale_price || '',
        item.stock_quantity || 0,
        item.is_published ? 'Published' : 'Draft',
        new Date(item.created_at).toLocaleDateString('en-IN'),
      ]);
      break;

    case 'customers':
      headers = ['Name', 'Email', 'Phone', 'Orders Count', 'Total Spent', 'Last Order Date'];
      tableData = data.map((item: any) => [
        item.name || item.full_name || 'N/A',
        item.email || 'N/A',
        item.phone || 'N/A',
        item.orders_count || 0,
        item.total_spent || 0,
        item.last_order_date ? new Date(item.last_order_date).toLocaleDateString('en-IN') : 'N/A',
      ]);
      break;

    case 'inventory':
      headers = ['Product Name', 'SKU', 'Category', 'Current Stock', 'Low Stock Threshold', 'Status'];
      tableData = data.map((item: any) => [
        item.name,
        item.sku || 'N/A',
        item.category_name || item.categories?.name || 'Uncategorized',
        item.stock_quantity || 0,
        item.low_stock_threshold || 5,
        item.stock_quantity === 0 ? 'Out of Stock' : 
        item.stock_quantity <= (item.low_stock_threshold || 5) ? 'Low Stock' : 'In Stock',
      ]);
      break;

    case 'categories':
      headers = ['Category Name', 'Products Count', 'Total Sales', 'Total Revenue', 'Created Date'];
      tableData = data.map((item: any) => [
        item.name,
        item.products_count || 0,
        item.total_sales || 0,
        item.revenue || 0,
        new Date(item.created_at).toLocaleDateString('en-IN'),
      ]);
      break;

    default:
      headers = ['Data'];
      tableData = data.map((item: any) => [JSON.stringify(item)]);
  }

  const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}`;
  generateCSV(headers, tableData, filename);
}
