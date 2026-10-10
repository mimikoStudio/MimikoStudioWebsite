export interface Product {
  id: string;
  category_id: string;
  name: string;
  name_hi?: string;
  name_gu?: string;
  slug: string;
  description: string;
  description_hi?: string;
  description_gu?: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  material: string;
  sizes: string[];
  colors: string[];
  customization_available: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_published: boolean;
  sku?: string;
  fabric_type?: string;
  dimensions?: string;
  pattern?: string;
  seo_title?: string;
  seo_description?: string;
  share_url?: string;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  category?: Category;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_hi?: string;
  name_gu?: string;
  slug: string;
  description: string;
  description_hi?: string;
  description_gu?: string;
  image_url: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  is_featured?: boolean;
  parent_id?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface Inquiry {
  id: string;
  reference_number: string;
  customer_name: string;
  email: string;
  phone: string;
  product_category: string;
  product_type: string;
  fabric_preference: string;
  preferred_colors: string;
  design_style: string;
  custom_text: string;
  size: string;
  quantity: number;
  budget: string;
  preferred_date: string;
  reference_image_urls: string[];
  instructions: string;
  quotation_amount: number | null;
  status: InquiryStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export type InquiryStatus =
  | 'new'
  | 'under_review'
  | 'quotation_sent'
  | 'awaiting_customer_response'
  | 'approved'
  | 'in_production'
  | 'completed'
  | 'rejected';

export interface Appointment {
  id: string;
  reference_number: string;
  customer_name: string;
  email: string;
  phone: string;
  appointment_type: AppointmentType;
  appointment_date: string;
  start_time: string;
  end_time: string;
  project_description: string;
  reference_image_urls: string[];
  communication_method: string;
  status: AppointmentStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentType =
  | 'custom_design_consultation'
  | 'wedding_festive_orders'
  | 'bulk_order_discussion'
  | 'product_inquiry'
  | 'general_consultation';

export type AppointmentStatus =
  | 'requested'
  | 'confirmed'
  | 'rescheduled'
  | 'cancelled'
  | 'completed';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_reference: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  selected_options: Record<string, string>;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface SiteSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalInquiries: number;
  pendingInquiries: number;
  newAppointments: number;
  confirmedAppointments: number;
  totalOrders: number;
}

// Dynamic Content Management Types
export interface WebsiteContentSection {
  id: string;
  section_key: string;
  section_name: string;
  section_type: 'hero' | 'banner' | 'notification' | 'button' | 'textbox';
  content_en?: string;
  content_hi?: string;
  content_gu?: string;
  image_url?: string;
  button_label_en?: string;
  button_label_hi?: string;
  button_label_gu?: string;
  button_url?: string;
  is_visible: boolean;
  display_order: number;
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DynamicNotification {
  id: string;
  notification_type: 'success' | 'error' | 'warning' | 'info' | 'promo';
  title_en: string;
  title_hi?: string;
  title_gu?: string;
  message_en: string;
  message_hi?: string;
  message_gu?: string;
  is_active: boolean;
  expires_at?: string;
  target_audience: 'all' | 'customers' | 'admins';
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  studio_name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  tax_registration?: string;
  invoice_footer_en?: string;
  invoice_footer_hi?: string;
  invoice_footer_gu?: string;
  business_terms_en?: string;
  business_terms_hi?: string;
  business_terms_gu?: string;
  default_currency: string;
  default_language: 'en' | 'hi' | 'gu';
  social_links?: Record<string, string>;
  updated_at: string;
}

export interface InvoiceSnapshot {
  id: string;
  invoice_id: string;
  order_id: string;
  snapshot_data: Record<string, any>;
  created_at: string;
  is_finalized: boolean;
}

export interface SharingAudit {
  id: string;
  entity_type: 'product' | 'invoice' | 'collection';
  entity_id: string;
  share_type: 'link' | 'pdf' | 'whatsapp' | 'email' | 'native';
  shared_by?: string;
  created_at: string;
}
