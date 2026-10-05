import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product, Category, Inquiry, Appointment } from '../types';

// ============================================
// useProducts Hook
// ============================================
export function useProducts(filters?: {
  category?: string;
  search?: string;
  featured?: boolean;
  newArrival?: boolean;
  limit?: number;
  showAll?: boolean; // Show all products including drafts (for admin)
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    if (!isSupabaseConfigured) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('products')
        .select('*, product_images(*), categories(*)')
        .order('created_at', { ascending: false });

      // Only filter by is_published if showAll is false
      if (!filters?.showAll) {
        query = query.eq('is_published', true);
      }

      if (filters?.category) query = query.eq('category_id', filters.category);
      if (filters?.featured) query = query.eq('is_featured', true);
      if (filters?.newArrival) query = query.eq('is_new_arrival', true);
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        // If RLS error, return empty array but don't throw
        if (fetchError.message.includes('row-level security')) {
          setProducts([]);
          setError('Database access blocked by security policy. Please contact admin.');
          setLoading(false);
          return;
        }
        
        throw fetchError;
      }
      
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.search, filters?.featured, filters?.newArrival, filters?.limit, filters?.showAll]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    const channel = supabase
      .channel('products-hook')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

// ============================================
// useCategories Hook
// ============================================
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (!error && data) setCategories(data);
    } catch (err) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refetch: fetchCategories };
}

// ============================================
// useInquiries Hook
// ============================================
export function useInquiries(status?: string) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      let query = supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query;
      if (!error && data) setInquiries(data);
    } catch (err) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Realtime
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    const channel = supabase
      .channel('inquiries-hook')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
        fetchInquiries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInquiries]);

  return { inquiries, loading, refetch: fetchInquiries };
}

// ============================================
// useAppointments Hook
// ============================================
export function useAppointments(status?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query;
      if (!error && data) setAppointments(data);
    } catch (err) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Realtime
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    const channel = supabase
      .channel('appointments-hook')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments]);

  return { appointments, loading, refetch: fetchAppointments };
}

// ============================================
// useDashboardStats Hook
// ============================================
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    newAppointments: 0,
    confirmedAppointments: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
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

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p: any) => p.is_published).length,
        lowStockProducts: products.filter((p: any) => p.stock_quantity < 5).length,
        totalInquiries: inquiries.length,
        pendingInquiries: inquiries.filter((i: any) => i.status === 'new' || i.status === 'under_review').length,
        newAppointments: appointments.filter((a: any) => a.status === 'requested').length,
        confirmedAppointments: appointments.filter((a: any) => a.status === 'confirmed').length,
        totalOrders: orders.length,
      });
    } catch (err) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Realtime updates
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    const channels = ['products', 'inquiries', 'appointments', 'orders'].map(table =>
      supabase
        .channel(`stats-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          fetchStats();
        })
        .subscribe()
    );

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

// ============================================
// useAuth Hook
// ============================================
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(data?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);

  return { user, loading, isAdmin };
}
