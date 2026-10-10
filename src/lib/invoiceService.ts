import { supabase } from './supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, InvoiceItem, InvoiceSettings, InvoiceTranslation } from '../types/invoice';
import { invoiceTranslations } from '../types/invoice';

// ============================================
// INVOICE SETTINGS
// ============================================

export async function getInvoiceSettings(): Promise<InvoiceSettings | null> {
  try {
    const { data, error } = await supabase
      .from('invoice_settings')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching invoice settings:', error);
    return null;
  }
}

export async function updateInvoiceSettings(settings: Partial<InvoiceSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('invoice_settings')
      .update(settings)
      .eq('id', (await getInvoiceSettings())?.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating invoice settings:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// INVOICE GENERATION
// ============================================

export async function generateInvoiceNumber(): Promise<string> {
  const settings = await getInvoiceSettings();
  if (!settings) {
    throw new Error('Invoice settings not found');
  }

  const invoiceNumber = `${settings.invoice_prefix}${String(settings.next_invoice_number).padStart(6, '0')}`;

  // Increment the next invoice number
  await supabase
    .from('invoice_settings')
    .update({ next_invoice_number: settings.next_invoice_number + 1 })
    .eq('id', settings.id);

  return invoiceNumber;
}

export async function createInvoiceFromOrder(orderId: string, language: 'en' | 'hi' | 'gu' = 'en'): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, name_hi, name_gu, sku, images:product_images(image_url)))')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Prepare invoice items
    const items: InvoiceItem[] = order.order_items.map((item: any) => ({
      id: crypto.randomUUID(),
      product_id: item.product_id,
      product_name: item.products?.name || 'Product',
      product_name_hi: item.products?.name_hi,
      product_name_gu: item.products?.name_gu,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      sku: item.products?.sku,
      image_url: item.products?.images?.[0]?.image_url,
    }));

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const settings = await getInvoiceSettings();
    const taxAmount = subtotal * ((settings?.default_tax_rate || 0) / 100);
    const discountAmount = order.discount_amount || 0;
    const shippingCharges = order.shipping_fee || settings?.default_shipping_charges || 0;
    const totalAmount = subtotal + taxAmount - discountAmount + shippingCharges;

    // Create invoice
    const invoice: Partial<Invoice> = {
      invoice_number: invoiceNumber,
      order_id: orderId,
      customer_id: order.customer_id,
      customer_name: order.customer_name,
      customer_email: order.email,
      customer_phone: order.phone,
      billing_address: order.billing_address || order.shipping_address,
      shipping_address: order.shipping_address,
      items,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      shipping_charges: shippingCharges,
      total_amount: totalAmount,
      payment_method: order.payment_method || 'COD',
      payment_status: order.payment_status || 'pending',
      invoice_status: 'issued',
      notes: settings?.default_notes || '',
      terms: settings?.default_terms || '',
      language,
      issued_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();

    if (error) throw error;

    return { success: true, invoice: data };
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// INVOICE MANAGEMENT
// ============================================

export async function getInvoices(filters?: {
  customer_id?: string;
  invoice_status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
}): Promise<Invoice[]> {
  try {
    let query = supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters?.invoice_status) {
      query = query.eq('invoice_status', filters.invoice_status);
    }
    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }
    if (filters?.date_from) {
      query = query.gte('issued_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('issued_date', filters.date_to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: Invoice['invoice_status']): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({ invoice_status: status, updated_at: new Date().toISOString() })
      .eq('id', invoiceId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteInvoice(invoiceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// PDF GENERATION
// ============================================

export function generateInvoicePDF(invoice: Invoice): Blob {
  const doc = new jsPDF();
  const t = invoiceTranslations[invoice.language];
  const settings = getInvoiceSettingsSync();

  // Page setup
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header with company info
  doc.setFillColor(213, 170, 100); // Gold color
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Company name
  doc.setTextColor(75, 40, 24); // Dark brown
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(settings?.company_name || 'Mimiko Studio', margin, 20);

  // Company details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos = 28;
  if (settings?.company_address) {
    doc.text(settings.company_address, margin, yPos);
    yPos += 5;
  }
  if (settings?.company_phone) {
    doc.text(`Phone: ${settings.company_phone}`, margin, yPos);
  }
  if (settings?.company_email) {
    doc.text(`Email: ${settings.company_email}`, pageWidth - margin, 28, { align: 'right' });
  }

  // Invoice title
  yPos = 50;
  doc.setTextColor(75, 40, 24);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(t.invoice, pageWidth - margin, yPos, { align: 'right' });

  // Invoice details
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.invoice_number}: ${invoice.invoice_number}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`${t.date}: ${new Date(invoice.issued_date).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`${t.due_date}: ${new Date(invoice.due_date).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });

  // Bill To and Ship To
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.bill_to, margin, yPos);
  doc.text(t.ship_to, pageWidth / 2 + 10, yPos);

  yPos += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Bill to details
  doc.text(invoice.customer_name, margin, yPos);
  yPos += 5;
  doc.text(invoice.customer_email, margin, yPos);
  yPos += 5;
  doc.text(invoice.customer_phone, margin, yPos);
  yPos += 5;
  
  // Split billing address into lines
  const billingLines = doc.splitTextToSize(invoice.billing_address, pageWidth / 2 - margin - 10);
  doc.text(billingLines, margin, yPos);
  
  // Ship to details
  yPos -= billingLines.length * 5 - 15;
  doc.text(invoice.customer_name, pageWidth / 2 + 10, yPos);
  yPos += 5;
  const shippingLines = doc.splitTextToSize(invoice.shipping_address, pageWidth / 2 - margin - 10);
  doc.text(shippingLines, pageWidth / 2 + 10, yPos);

  // Items table
  yPos += shippingLines.length * 5 + 15;
  
  const tableData = invoice.items.map((item, index) => {
    const productName = invoice.language === 'hi' && item.product_name_hi
      ? item.product_name_hi
      : invoice.language === 'gu' && item.product_name_gu
      ? item.product_name_gu
      : item.product_name;

    return [
      index + 1,
      productName,
      item.quantity,
      `₹${item.unit_price.toFixed(2)}`,
      `₹${item.total_price.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [[t.item, t.quantity, t.price, t.total]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [213, 170, 100],
      textColor: [75, 40, 24],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  // Totals
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const rightColumnX = pageWidth - margin - 60;
  
  doc.text(`${t.subtotal}:`, rightColumnX, yPos);
  doc.text(`₹${invoice.subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  
  if (invoice.tax_amount > 0) {
    doc.text(`${t.tax}:`, rightColumnX, yPos);
    doc.text(`₹${invoice.tax_amount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
  }
  
  if (invoice.discount_amount > 0) {
    doc.text(`${t.discount}:`, rightColumnX, yPos);
    doc.text(`-₹${invoice.discount_amount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
  }
  
  if (invoice.shipping_charges > 0) {
    doc.text(`${t.shipping}:`, rightColumnX, yPos);
    doc.text(`₹${invoice.shipping_charges.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
  }
  
  yPos += 2;
  doc.setDrawColor(213, 170, 100);
  doc.line(rightColumnX, yPos, pageWidth - margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${t.grand_total}:`, rightColumnX, yPos);
  doc.text(`₹${invoice.total_amount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  // Payment info
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.payment_method}:`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.payment_method, margin + 40, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.payment_status}:`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  const statusText = t[invoice.payment_status as keyof InvoiceTranslation] || invoice.payment_status;
  doc.text(statusText, margin + 40, yPos);

  // Notes
  if (invoice.notes) {
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.notes}:`, margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
  }

  // Terms
  if (invoice.terms) {
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.terms_and_conditions}:`, margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const termsLines = doc.splitTextToSize(invoice.terms, pageWidth - 2 * margin);
    doc.text(termsLines, margin, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(213, 170, 100);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(107, 62, 40);
  doc.text(t.thank_you, pageWidth / 2, footerY, { align: 'center' });

  return doc.output('blob');
}

// Sync version for PDF generation (settings should be cached)
function getInvoiceSettingsSync(): InvoiceSettings | null {
  // This is a simplified version - in production, you'd cache settings
  return {
    id: '',
    invoice_prefix: 'INV',
    next_invoice_number: 1,
    default_tax_rate: 0,
    default_shipping_charges: 0,
    default_payment_terms: '',
    default_notes: '',
    default_terms: '',
    default_language: 'en',
    company_name: 'Mimiko Studio',
    company_address: '',
    company_phone: '',
    company_email: '',
    updated_at: '',
  };
}

export function downloadInvoicePDF(invoice: Invoice): void {
  const pdfBlob = generateInvoicePDF(invoice);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoice_number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printInvoicePDF(invoice: Invoice): void {
  const pdfBlob = generateInvoicePDF(invoice);
  const url = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
