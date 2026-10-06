import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';
import { SiteSettings } from '../types/siteSettings';

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
}

export interface InvoiceSettings {
  invoice_prefix: string;
  invoice_starting_number: number;
  invoice_footer: string;
  invoice_terms: string;
  invoice_thank_you: string;
  show_gst: boolean;
  show_tax: boolean;
  show_discount: boolean;
  show_shipping: boolean;
  invoice_accent_color: string;
  gst_number: string;
  pan_number: string;
  registration_number: string;
}

export const defaultInvoiceSettings: InvoiceSettings = {
  invoice_prefix: 'INV',
  invoice_starting_number: 1,
  invoice_footer: 'Thank you for your business!',
  invoice_terms: 'Payment is due within 30 days of invoice date.',
  invoice_thank_you: 'Thank you for choosing our jewellery collection.',
  show_gst: false,
  show_tax: false,
  show_discount: true,
  show_shipping: true,
  invoice_accent_color: '#D5AA64',
  gst_number: '',
  pan_number: '',
  registration_number: '',
};

/**
 * Generate unique invoice number
 */
export async function generateInvoiceNumber(): Promise<string> {
  try {
    // Get invoice settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'invoice_settings')
      .single();

    let invoiceSettings = defaultInvoiceSettings;
    if (settings) {
      try {
        invoiceSettings = JSON.parse(settings.setting_value);
      } catch (e) {
        console.error('Failed to parse invoice settings:', e);
      }
    }

    // Get the latest invoice number
    const { data: latestInvoice, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = invoiceSettings.invoice_starting_number;

    if (latestInvoice && !error) {
      // Extract number from invoice number (e.g., INV-2026-000001 -> 1)
      const parts = latestInvoice.invoice_number.split('-');
      const lastPart = parts[parts.length - 1];
      const currentNumber = parseInt(lastPart, 10);
      if (!isNaN(currentNumber)) {
        nextNumber = currentNumber + 1;
      }
    }

    // Format: INV-2026-000001
    const year = new Date().getFullYear();
    const paddedNumber = String(nextNumber).padStart(6, '0');
    const invoiceNumber = `${invoiceSettings.invoice_prefix}-${year}-${paddedNumber}`;

    return invoiceNumber;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to timestamp-based number
    const timestamp = Date.now();
    return `INV-${timestamp}`;
  }
}

/**
 * Create invoice for an order
 */
export async function createInvoice(orderId: string): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    // Check if invoice already exists for this order
    const { data: existingInvoice, error: checkError } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (existingInvoice && !checkError) {
      return {
        success: false,
        error: 'Invoice already exists for this order',
      };
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Get invoice settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'invoice_settings')
      .single();

    let invoiceSettings = defaultInvoiceSettings;
    if (settings) {
      try {
        invoiceSettings = JSON.parse(settings.setting_value);
      } catch (e) {
        console.error('Failed to parse invoice settings:', e);
      }
    }

    // Calculate amounts
    const subtotal = order.subtotal || 0;
    const discountAmount = order.discount_amount || 0;
    const taxAmount = 0; // Tax not implemented in current system
    const shippingAmount = order.shipping_fee || 0;
    const totalAmount = order.total_amount || (subtotal - discountAmount + taxAmount + shippingAmount);
    const amountPaid = order.payment_status === 'paid' ? totalAmount : 0;
    const balanceDue = totalAmount - amountPaid;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        order_id: orderId,
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString(),
        due_date: null,
        subtotal: subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        balance_due: balanceDue,
        notes: invoiceSettings.invoice_footer,
        terms: invoiceSettings.invoice_terms,
      }])
      .select()
      .single();

    if (invoiceError) {
      return {
        success: false,
        error: invoiceError.message,
      };
    }

    // Update order with invoice reference
    await supabase
      .from('orders')
      .update({ invoice_number: invoiceNumber })
      .eq('id', orderId);

    return {
      success: true,
      invoice: invoice as Invoice,
    };
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return {
      success: false,
      error: error.message || 'Failed to create invoice',
    };
  }
}

/**
 * Get invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, order:orders(*, order_items(*))')
      .eq('id', invoiceId)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }

    return invoice as Invoice;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }
}

/**
 * Get invoice by order ID
 */
export async function getInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, order:orders(*, order_items(*))')
      .eq('order_id', orderId)
      .single();

    if (error) {
      return null;
    }

    return invoice as Invoice;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }
}

/**
 * Get all invoices
 */
export async function getAllInvoices(): Promise<Invoice[]> {
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, order:orders(*, order_items(*))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }

    return invoices as Invoice[];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

/**
 * Update invoice
 */
export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Invoice>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update invoice',
    };
  }
}

/**
 * Delete invoice
 */
export async function deleteInvoice(invoiceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete invoice',
    };
  }
}

/**
 * Save invoice settings
 */
export async function saveInvoiceSettings(settings: InvoiceSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'invoice_settings',
        setting_value: JSON.stringify(settings),
      }, { onConflict: 'setting_key' });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to save invoice settings',
    };
  }
}

/**
 * Get invoice settings
 */
export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  try {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'invoice_settings')
      .single();

    if (settings) {
      try {
        return JSON.parse(settings.setting_value);
      } catch (e) {
        console.error('Failed to parse invoice settings:', e);
      }
    }

    return defaultInvoiceSettings;
  } catch (error) {
    console.error('Error fetching invoice settings:', error);
    return defaultInvoiceSettings;
  }
}
