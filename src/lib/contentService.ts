import { supabase } from './supabase';

// ============================================
// TYPES
// ============================================

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  desktop_image_url: string;
  mobile_image_url?: string;
  tablet_image_url?: string;
  display_order: number;
  duration: number;
  transition_type: 'fade' | 'slide' | 'fade-slide';
  is_active: boolean;
  start_at?: string;
  end_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images?: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  category_id: string;
  title?: string;
  description?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: GalleryCategory;
}

export interface Collection {
  id: string;
  name: string;
  name_hi?: string;
  name_gu?: string;
  slug: string;
  short_description?: string;
  short_description_hi?: string;
  short_description_gu?: string;
  long_description?: string;
  long_description_hi?: string;
  long_description_gu?: string;
  cover_image_url?: string;
  background_image_url?: string;
  button_text?: string;
  button_url?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  start_at?: string;
  end_at?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// HERO BANNERS
// ============================================

export async function getActiveHeroBanners(): Promise<HeroBanner[]> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .or(`start_at.is.null,start_at.lte.${now}`)
      .or(`end_at.is.null,end_at.gte.${now}`)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    return [];
  }
}

export async function getAllHeroBanners(): Promise<HeroBanner[]> {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all hero banners:', error);
    return [];
  }
}

export async function createHeroBanner(banner: Partial<HeroBanner>): Promise<{ success: boolean; data?: HeroBanner; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .insert([banner])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating hero banner:', error);
    return { success: false, error: error.message };
  }
}

export async function updateHeroBanner(id: string, updates: Partial<HeroBanner>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('hero_banners')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating hero banner:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteHeroBanner(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('hero_banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting hero banner:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// GALLERY CATEGORIES
// ============================================

export async function getActiveGalleryCategories(): Promise<GalleryCategory[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    return [];
  }
}

export async function getAllGalleryCategories(): Promise<GalleryCategory[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all gallery categories:', error);
    return [];
  }
}

export async function getGalleryCategoryBySlug(slug: string): Promise<GalleryCategory | null> {
  try {
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*, gallery_images(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching gallery category:', error);
    return null;
  }
}

export async function createGalleryCategory(category: Partial<GalleryCategory>): Promise<{ success: boolean; data?: GalleryCategory; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('gallery_categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating gallery category:', error);
    return { success: false, error: error.message };
  }
}

export async function updateGalleryCategory(id: string, updates: Partial<GalleryCategory>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_categories')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating gallery category:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteGalleryCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting gallery category:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// GALLERY IMAGES
// ============================================

export async function getActiveGalleryImages(categoryId?: string): Promise<GalleryImage[]> {
  try {
    let query = supabase
      .from('gallery_images')
      .select('*, gallery_categories(*)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

export async function getAllGalleryImages(categoryId?: string): Promise<GalleryImage[]> {
  try {
    let query = supabase
      .from('gallery_images')
      .select('*, gallery_categories(*)')
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all gallery images:', error);
    return [];
  }
}

export async function createGalleryImage(image: Partial<GalleryImage>): Promise<{ success: boolean; data?: GalleryImage; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert([image])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating gallery image:', error);
    return { success: false, error: error.message };
  }
}

export async function updateGalleryImage(id: string, updates: Partial<GalleryImage>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_images')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating gallery image:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteGalleryImage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting gallery image:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// COLLECTIONS
// ============================================

export async function getActiveCollections(): Promise<Collection[]> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .or(`start_at.is.null,start_at.lte.${now}`)
      .or(`end_at.is.null,end_at.gte.${now}`)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function getAllCollections(): Promise<Collection[]> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all collections:', error);
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export async function createCollection(collection: Partial<Collection>): Promise<{ success: boolean; data?: Collection; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .insert([collection])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCollection(id: string, updates: Partial<Collection>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating collection:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    return { success: false, error: error.message };
  }
}
