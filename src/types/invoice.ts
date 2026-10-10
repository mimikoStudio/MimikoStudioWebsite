// Invoice System Types

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: string;
  shipping_address: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_charges: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  invoice_status: 'draft' | 'issued' | 'paid' | 'cancelled';
  notes: string;
  terms: string;
  language: 'en' | 'hi' | 'gu';
  issued_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  product_name_hi?: string;
  product_name_gu?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku?: string;
  image_url?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  template_data: {
    header_color: string;
    accent_color: string;
    show_product_images: boolean;
    show_sku: boolean;
    show_tax_breakdown: boolean;
    custom_footer: string;
  };
  is_active: boolean;
  created_at: string;
}

export interface InvoiceSettings {
  id: string;
  invoice_prefix: string;
  next_invoice_number: number;
  default_tax_rate: number;
  default_shipping_charges: number;
  default_payment_terms: string;
  default_notes: string;
  default_terms: string;
  default_language: 'en' | 'hi' | 'gu';
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_gst_number?: string;
  company_logo_url?: string;
  updated_at: string;
}

export interface InvoiceTranslation {
  invoice: string;
  invoice_number: string;
  date: string;
  due_date: string;
  bill_to: string;
  ship_to: string;
  item: string;
  quantity: string;
  price: string;
  total: string;
  subtotal: string;
  tax: string;
  discount: string;
  shipping: string;
  grand_total: string;
  payment_method: string;
  payment_status: string;
  notes: string;
  terms_and_conditions: string;
  thank_you: string;
  status_draft: string;
  status_issued: string;
  status_paid: string;
  status_cancelled: string;
  pending: string;
  paid: string;
  failed: string;
  refunded: string;
}

export const invoiceTranslations: Record<'en' | 'hi' | 'gu', InvoiceTranslation> = {
  en: {
    invoice: 'INVOICE',
    invoice_number: 'Invoice Number',
    date: 'Date',
    due_date: 'Due Date',
    bill_to: 'Bill To',
    ship_to: 'Ship To',
    item: 'Item',
    quantity: 'Qty',
    price: 'Price',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    shipping: 'Shipping',
    grand_total: 'Grand Total',
    payment_method: 'Payment Method',
    payment_status: 'Payment Status',
    notes: 'Notes',
    terms_and_conditions: 'Terms & Conditions',
    thank_you: 'Thank you for your business!',
    status_draft: 'Draft',
    status_issued: 'Issued',
    status_paid: 'Paid',
    status_cancelled: 'Cancelled',
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  },
  hi: {
    invoice: 'चालान',
    invoice_number: 'चालान संख्या',
    date: 'तारीख',
    due_date: 'नियत तारीख',
    bill_to: 'बिल प्राप्तकर्ता',
    ship_to: 'शिपिंग पता',
    item: 'वस्तु',
    quantity: 'मात्रा',
    price: 'मूल्य',
    total: 'कुल',
    subtotal: 'उप-कुल',
    tax: 'कर',
    discount: 'छूट',
    shipping: 'शिपिंग',
    grand_total: 'कुल राशि',
    payment_method: 'भुगतान विधि',
    payment_status: 'भुगतान स्थिति',
    notes: 'नोट्स',
    terms_and_conditions: 'नियम और शर्तें',
    thank_you: 'आपके व्यवसाय के लिए धन्यवाद!',
    status_draft: 'ड्राफ्ट',
    status_issued: 'जारी किया गया',
    status_paid: 'भुगतान किया गया',
    status_cancelled: 'रद्द किया गया',
    pending: 'लंबित',
    paid: 'भुगतान किया गया',
    failed: 'विफल',
    refunded: 'वापसी',
  },
  gu: {
    invoice: 'બિલ',
    invoice_number: 'બિલ નંબર',
    date: 'તારીખ',
    due_date: 'નિયત તારીખ',
    bill_to: 'બિલ પ્રાપ્તકર્તા',
    ship_to: 'શિપિંગ સરનામું',
    item: 'વસ્તુ',
    quantity: 'જથ્થો',
    price: 'કિંમત',
    total: 'કુલ',
    subtotal: 'ઉપ-કુલ',
    tax: 'ટૅક્સ',
    discount: 'ડિસ્કાઉન્ટ',
    shipping: 'શિપિંગ',
    grand_total: 'કુલ રકમ',
    payment_method: 'ચુકવણી પદ્ધતિ',
    payment_status: 'ચુકવણી સ્થિતિ',
    notes: 'નોંધ',
    terms_and_conditions: 'નિયમો અને શરતો',
    thank_you: 'તમારા વ્યવસાય માટે આભાર!',
    status_draft: 'ડ્રાફ્ટ',
    status_issued: 'જારી કર્યું',
    status_paid: 'ચુકવણી કરી',
    status_cancelled: 'રદ કર્યું',
    pending: 'બાકી',
    paid: 'ચુકવણી કરી',
    failed: 'નિષ્ફળ',
    refunded: 'પાછું',
  },
};
