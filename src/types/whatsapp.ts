// WhatsApp Template Types

export type WhatsAppTemplateKey =
  | 'ORDER_CONFIRMATION'
  | 'ORDER_RECEIVED'
  | 'ORDER_STATUS_UPDATE'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'INQUIRY_RECEIVED'
  | 'INQUIRY_ADMIN_NOTIFICATION'
  | 'BOOKING_REQUEST'
  | 'BOOKING_CONFIRMATION'
  | 'BOOKING_STATUS_UPDATE'
  | 'CUSTOM_ORDER_REQUEST'
  | 'PRODUCT_INQUIRY'
  | 'CONTACT_FORM'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_FAILED'
  | 'GENERAL_ENQUIRY'
  | 'CUSTOMER_WELCOME'
  | 'CUSTOMER_FOLLOW_UP'
  | 'ADMIN_NEW_ORDER'
  | 'ADMIN_NEW_INQUIRY'
  | 'ADMIN_NEW_BOOKING'
  | 'ADMIN_CUSTOM_ORDER';

export type WhatsAppRecipientType =
  | 'CUSTOMER'
  | 'ADMIN'
  | 'BUSINESS'
  | 'SALES'
  | 'SUPPORT';

export type WhatsAppEntityType =
  | 'order'
  | 'inquiry'
  | 'booking'
  | 'customer'
  | 'product'
  | 'invoice'
  | 'custom_order';

export type WhatsAppMessageStatus =
  | 'generated'
  | 'opened'
  | 'sent'
  | 'failed';

export interface WhatsAppTemplate {
  id: string;
  template_key: WhatsAppTemplateKey;
  template_name: string;
  description: string;
  message_body: string;
  recipient_type: WhatsAppRecipientType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessageLog {
  id: string;
  template_id: string;
  recipient_type: WhatsAppRecipientType;
  recipient_phone: string;
  entity_type: WhatsAppEntityType;
  entity_id: string;
  message_body: string;
  status: WhatsAppMessageStatus;
  created_at: string;
  created_by: string;
}

export interface WhatsAppSettings {
  business_whatsapp_number: string;
  country_code: string;
  enable_whatsapp: boolean;
  enable_customer_messages: boolean;
  enable_admin_notifications: boolean;
  enable_order_notifications: boolean;
  enable_inquiry_notifications: boolean;
  enable_booking_notifications: boolean;
  enable_invoice_messages: boolean;
  enable_payment_messages: boolean;
  enable_status_messages: boolean;
  default_greeting: string;
  default_footer: string;
  business_signature: string;
}

export interface WhatsAppTemplateVariables {
  // Customer
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  
  // Business
  business_name?: string;
  business_phone?: string;
  website_url?: string;
  
  // Order
  order_id?: string;
  order_number?: string;
  order_date?: string;
  order_status?: string;
  payment_status?: string;
  payment_method?: string;
  subtotal?: string;
  discount?: string;
  tax?: string;
  shipping_charge?: string;
  order_total?: string;
  currency?: string;
  items_summary?: string;
  shipping_address?: string;
  billing_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  tracking_number?: string;
  tracking_url?: string;
  
  // Product
  product_name?: string;
  product_id?: string;
  product_price?: string;
  product_url?: string;
  product_quantity?: string;
  product_total?: string;
  
  // Inquiry
  inquiry_id?: string;
  inquiry_type?: string;
  inquiry_subject?: string;
  inquiry_message?: string;
  
  // Booking
  booking_date?: string;
  booking_time?: string;
  booking_status?: string;
  booking_notes?: string;
  service_name?: string;
  
  // Invoice
  invoice_number?: string;
  invoice_url?: string;
  
  // Admin
  admin_name?: string;
  order_url?: string;
  inquiry_url?: string;
  
  // Time
  current_date?: string;
  current_time?: string;
}
