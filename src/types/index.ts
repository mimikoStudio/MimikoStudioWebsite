export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
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
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
