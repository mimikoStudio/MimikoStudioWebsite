import { supabase, isSupabaseConfigured } from './supabase';
import type { Product, Category, Inquiry, Appointment } from '../types';

// ============================================
// CATEGORIES
// ============================================
export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

// ============================================
// PRODUCTS
// ============================================
export async function fetchProducts(filters?: {
  category?: string;
  search?: string;
  featured?: boolean;
  newArrival?: boolean;
  limit?: number;
}): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  try {
    let query = supabase
      .from('products')
      .select('*, product_images(*), categories(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }
    if (filters?.newArrival) {
      query = query.eq('is_new_arrival', true);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), categories(*)')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching product:', err);
    return null;
  }
}

export async function fetchRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('category_id', categoryId)
      .eq('is_published', true)
      .neq('id', productId)
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching related products:', err);
    return [];
  }
}

// ============================================
// INQUIRIES
// ============================================
export async function submitInquiry(inquiry: any): Promise<{ success: boolean; referenceNumber?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured' };
  }
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([inquiry])
      .select('reference_number')
      .single();
    
    if (error) throw error;
    return { success: true, referenceNumber: data?.reference_number };
  } catch (err: any) {
    console.error('Error submitting inquiry:', err);
    return { success: false, error: err.message || 'Failed to submit inquiry' };
  }
}

export async function fetchInquiries(status?: string): Promise<Inquiry[]> {
  if (!isSupabaseConfigured) return [];
  try {
    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    return [];
  }
}

// ============================================
// APPOINTMENTS
// ============================================
export async function submitAppointment(appointment: any): Promise<{ success: boolean; referenceNumber?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured' };
  }
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select('reference_number')
      .single();
    
    if (error) throw error;
    return { success: true, referenceNumber: data?.reference_number };
  } catch (err: any) {
    console.error('Error submitting appointment:', err);
    return { success: false, error: err.message || 'Failed to submit appointment' };
  }
}

export async function fetchAppointments(status?: string): Promise<Appointment[]> {
  if (!isSupabaseConfigured) return [];
  try {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return [];
  }
}

// ============================================
// FILE UPLOADS
// ============================================
export async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (err) {
    console.error('Error uploading image:', err);
    return null;
  }
}

// ============================================
// DASHBOARD STATS
// ============================================
export async function fetchDashboardStats() {
  if (!isSupabaseConfigured) {
    return {
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      totalInquiries: 0,
      pendingInquiries: 0,
      newAppointments: 0,
      confirmedAppointments: 0,
      totalOrders: 0,
    };
  }
  
  try {
    const [productsRes, inquiriesRes, appointmentsRes, ordersRes] = await Promise.all([
      supabase.from('products').select('id, is_published, stock_quantity'),
      supabase.from('inquiries').select('id, status'),
      supabase.from('appointments').select('id, status'),
      supabase.from('orders').select('id'),
    ]);

    const products = productsRes.data || [];
    const inquiries = inquiriesRes.data || [];
    const appointments = appointmentsRes.data || [];
    const orders = ordersRes.data || [];

    return {
      totalProducts: products.length,
      activeProducts: products.filter((p: any) => p.is_published).length,
      lowStockProducts: products.filter((p: any) => p.stock_quantity < 5).length,
      totalInquiries: inquiries.length,
      pendingInquiries: inquiries.filter((i: any) => i.status === 'new' || i.status === 'under_review').length,
      newAppointments: appointments.filter((a: any) => a.status === 'requested').length,
      confirmedAppointments: appointments.filter((a: any) => a.status === 'confirmed').length,
      totalOrders: orders.length,
    };
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return {
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      totalInquiries: 0,
      pendingInquiries: 0,
      newAppointments: 0,
      confirmedAppointments: 0,
      totalOrders: 0,
    };
  }
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================
export function subscribeToInquiries(callback: (payload: any) => void) {
  if (!isSupabaseConfigured) return { unsubscribe: () => {} };
  
  const channel = supabase
    .channel('inquiries-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, callback)
    .subscribe();
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

export function subscribeToAppointments(callback: (payload: any) => void) {
  if (!isSupabaseConfigured) return { unsubscribe: () => {} };
  
  const channel = supabase
    .channel('appointments-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, callback)
    .subscribe();
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

export function subscribeToProducts(callback: (payload: any) => void) {
  if (!isSupabaseConfigured) return { unsubscribe: () => {} };
  
  const channel = supabase
    .channel('products-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
    .subscribe();
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
