import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zshfxzdtosfvtngctftn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaGZ4emR0b3NmdnRuZ2N0ZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMTAyMDgsImV4cCI6MjEwNjU4NjIwOH0.wCwcfECDKX7IrwKp2hR8lrWhMXJLdteyjf3pFcMojc0';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const WHATSAPP_NUMBER = '917874291924';
export const INSTAGRAM_URL = 'https://www.instagram.com/mimiko.studio24/';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function createWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function generateReferenceNumber(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
