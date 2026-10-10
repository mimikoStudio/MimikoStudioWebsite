import { supabase } from './supabase';
import type { WebsiteContentSection, DynamicNotification, BusinessProfile } from '../types';

// ============================================
// WEBSITE CONTENT SECTIONS
// ============================================

export async function getVisibleContentSections(): Promise<WebsiteContentSection[]> {
  try {
    const { data, error } = await supabase
      .from('website_content_sections')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching content sections:', error);
    return [];
  }
}

export async function getAllContentSections(): Promise<WebsiteContentSection[]> {
  try {
    const { data, error } = await supabase
      .from('website_content_sections')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all content sections:', error);
    return [];
  }
}

export async function getContentSectionByKey(key: string): Promise<WebsiteContentSection | null> {
  try {
    const { data, error } = await supabase
      .from('website_content_sections')
      .select('*')
      .eq('section_key', key)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching content section:', error);
    return null;
  }
}

export async function createContentSection(section: Partial<WebsiteContentSection>): Promise<{ success: boolean; data?: WebsiteContentSection; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('website_content_sections')
      .insert([section])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating content section:', error);
    return { success: false, error: error.message };
  }
}

export async function updateContentSection(id: string, updates: Partial<WebsiteContentSection>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('website_content_sections')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating content section:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteContentSection(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('website_content_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting content section:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function getActiveNotifications(): Promise<DynamicNotification[]> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function getAllNotifications(): Promise<DynamicNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    return [];
  }
}

export async function createNotification(notification: Partial<DynamicNotification>): Promise<{ success: boolean; data?: DynamicNotification; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
}

export async function updateNotification(id: string, updates: Partial<DynamicNotification>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// BUSINESS PROFILE
// ============================================

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  try {
    const { data, error } = await supabase
      .from('business_profile')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return null;
  }
}

export async function updateBusinessProfile(updates: Partial<BusinessProfile>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('business_profile')
      .update(updates)
      .eq('id', (await getBusinessProfile())?.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating business profile:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// LOCALIZED CONTENT HELPERS
// ============================================

export function getLocalizedContent(
  content: { en?: string; hi?: string; gu?: string },
  language: 'en' | 'hi' | 'gu'
): string {
  return content[language] || content.en || '';
}

export function getLocalizedProduct(product: any, language: 'en' | 'hi' | 'gu') {
  return {
    ...product,
    name: language === 'hi' ? (product.name_hi || product.name) :
          language === 'gu' ? (product.name_gu || product.name) :
          product.name,
    description: language === 'hi' ? (product.description_hi || product.description) :
                 language === 'gu' ? (product.description_gu || product.description) :
                 product.description,
  };
}

export function getLocalizedCategory(category: any, language: 'en' | 'hi' | 'gu') {
  return {
    ...category,
    name: language === 'hi' ? (category.name_hi || category.name) :
          language === 'gu' ? (category.name_gu || category.name) :
          category.name,
    description: language === 'hi' ? (category.description_hi || category.description) :
                 language === 'gu' ? (category.description_gu || category.description) :
                 category.description,
  };
}

export function getLocalizedCollection(collection: any, language: 'en' | 'hi' | 'gu') {
  return {
    ...collection,
    name: language === 'hi' ? (collection.name_hi || collection.name) :
          language === 'gu' ? (collection.name_gu || collection.name) :
          collection.name,
    short_description: language === 'hi' ? (collection.short_description_hi || collection.short_description) :
                       language === 'gu' ? (collection.short_description_gu || collection.short_description) :
                       collection.short_description,
    long_description: language === 'hi' ? (collection.long_description_hi || collection.long_description) :
                      language === 'gu' ? (collection.long_description_gu || collection.long_description) :
                      collection.long_description,
  };
}
