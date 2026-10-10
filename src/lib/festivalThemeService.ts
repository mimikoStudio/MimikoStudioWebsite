import { supabase } from './supabase';
import type { ThemePreset, FestivalCampaign, CampaignBanner, ThemeRevision, ThemeConfig } from '../types/festivalTheme';

// ============================================
// THEME PRESETS
// ============================================

export async function getActiveThemePreset(): Promise<ThemePreset | null> {
  try {
    const { data, error } = await supabase
      .from('theme_presets')
      .select('*')
      .eq('is_active', true)
      .eq('is_default', false)
      .single();

    if (error || !data) {
      // Fallback to default theme
      const { data: defaultData, error: defaultError } = await supabase
        .from('theme_presets')
        .select('*')
        .eq('is_default', true)
        .single();

      if (defaultError || !defaultData) return null;
      return defaultData;
    }

    return data;
  } catch (error) {
    console.error('Error fetching active theme:', error);
    return null;
  }
}

export async function getAllThemePresets(): Promise<ThemePreset[]> {
  try {
    const { data, error } = await supabase
      .from('theme_presets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching theme presets:', error);
    return [];
  }
}

export async function createThemePreset(preset: Partial<ThemePreset>): Promise<{ success: boolean; data?: ThemePreset; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('theme_presets')
      .insert([preset])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating theme preset:', error);
    return { success: false, error: error.message };
  }
}

export async function updateThemePreset(id: string, updates: Partial<ThemePreset>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('theme_presets')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating theme preset:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteThemePreset(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('theme_presets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting theme preset:', error);
    return { success: false, error: error.message };
  }
}

export async function activateThemePreset(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Deactivate all other themes
    await supabase
      .from('theme_presets')
      .update({ is_active: false })
      .neq('id', id);

    // Activate selected theme
    const { error } = await supabase
      .from('theme_presets')
      .update({ is_active: true })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error activating theme preset:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// FESTIVAL CAMPAIGNS
// ============================================

export async function getActiveCampaigns(): Promise<FestivalCampaign[]> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('festival_campaigns')
      .select('*, theme_preset:theme_presets(*), banners:campaign_banners(*)')
      .eq('is_active', true)
      .eq('status', 'active')
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    return [];
  }
}

export async function getAllCampaigns(): Promise<FestivalCampaign[]> {
  try {
    const { data, error } = await supabase
      .from('festival_campaigns')
      .select('*, theme_preset:theme_presets(*), banners:campaign_banners(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    return [];
  }
}

export async function createCampaign(campaign: Partial<FestivalCampaign>): Promise<{ success: boolean; data?: FestivalCampaign; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('festival_campaigns')
      .insert([campaign])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCampaign(id: string, updates: Partial<FestivalCampaign>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('festival_campaigns')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCampaign(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('festival_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function scheduleCampaign(id: string, startDate: string, endDate?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('festival_campaigns')
      .update({
        status: 'scheduled',
        start_date: startDate,
        end_date: endDate,
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error scheduling campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function activateCampaign(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('festival_campaigns')
      .update({ status: 'active' })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error activating campaign:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CAMPAIGN BANNERS
// ============================================

export async function getCampaignBanners(campaignId: string): Promise<CampaignBanner[]> {
  try {
    const { data, error } = await supabase
      .from('campaign_banners')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching campaign banners:', error);
    return [];
  }
}

export async function createCampaignBanner(banner: Partial<CampaignBanner>): Promise<{ success: boolean; data?: CampaignBanner; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('campaign_banners')
      .insert([banner])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating campaign banner:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCampaignBanner(id: string, updates: Partial<CampaignBanner>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('campaign_banners')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating campaign banner:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCampaignBanner(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('campaign_banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting campaign banner:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// THEME REVISIONS
// ============================================

export async function createThemeRevision(themePresetId: string, config: ThemeConfig, createdBy?: string, notes?: string): Promise<{ success: boolean; data?: ThemeRevision; error?: string }> {
  try {
    // Get latest revision number
    const { data: latestRevision } = await supabase
      .from('theme_revisions')
      .select('revision_number')
      .eq('theme_preset_id', themePresetId)
      .order('revision_number', { ascending: false })
      .limit(1)
      .single();

    const revisionNumber = latestRevision ? latestRevision.revision_number + 1 : 1;

    const { data, error } = await supabase
      .from('theme_revisions')
      .insert([{
        theme_preset_id: themePresetId,
        revision_number: revisionNumber,
        config,
        created_by: createdBy,
        notes,
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating theme revision:', error);
    return { success: false, error: error.message };
  }
}

export async function getThemeRevisions(themePresetId: string): Promise<ThemeRevision[]> {
  try {
    const { data, error } = await supabase
      .from('theme_revisions')
      .select('*')
      .eq('theme_preset_id', themePresetId)
      .order('revision_number', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching theme revisions:', error);
    return [];
  }
}

export async function restoreThemeRevision(revisionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the revision
    const { data: revision, error: fetchError } = await supabase
      .from('theme_revisions')
      .select('*')
      .eq('id', revisionId)
      .single();

    if (fetchError || !revision) {
      throw new Error('Revision not found');
    }

    // Update the theme preset with the revision config
    const { error: updateError } = await supabase
      .from('theme_presets')
      .update({ config: revision.config })
      .eq('id', revision.theme_preset_id);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error: any) {
    console.error('Error restoring theme revision:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// THEME APPLICATION
// ============================================

export function applyThemeToDocument(config: ThemeConfig) {
  const root = document.documentElement;
  
  Object.entries(config).forEach(([key, value]) => {
    const cssVar = `--theme-${key.replace(/_/g, '-')}`;
    root.style.setProperty(cssVar, value);
  });
}

export function getLocalizedBannerContent(banner: CampaignBanner, language: 'en' | 'hi' | 'gu') {
  return {
    title: banner[`title_${language}`] || banner.title_en || '',
    subtitle: banner[`subtitle_${language}`] || banner.subtitle_en || '',
    description: banner[`description_${language}`] || banner.description_en || '',
    ctaText: banner[`cta_text_${language}`] || banner.cta_text_en || '',
  };
}
