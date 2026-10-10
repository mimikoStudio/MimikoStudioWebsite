export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  preset_type: 'default' | 'festival' | 'seasonal' | 'custom';
  is_active: boolean;
  is_default: boolean;
  config: ThemeConfig;
  created_at: string;
  updated_at: string;
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  card_background_color: string;
  text_color: string;
  heading_color: string;
  muted_text_color: string;
  border_color: string;
  button_color: string;
  button_hover_color: string;
  header_background_color: string;
  footer_background_color: string;
  border_radius: string;
  shadow_style: string;
}

export interface FestivalCampaign {
  id: string;
  name: string;
  description?: string;
  theme_preset_id?: string;
  start_date?: string;
  end_date?: string;
  timezone: string;
  priority: number;
  is_active: boolean;
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  created_at: string;
  updated_at: string;
  theme_preset?: ThemePreset;
  banners?: CampaignBanner[];
}

export interface CampaignBanner {
  id: string;
  campaign_id: string;
  title_en?: string;
  title_hi?: string;
  title_gu?: string;
  subtitle_en?: string;
  subtitle_hi?: string;
  subtitle_gu?: string;
  description_en?: string;
  description_hi?: string;
  description_gu?: string;
  desktop_image_url?: string;
  mobile_image_url?: string;
  tablet_image_url?: string;
  cta_text_en?: string;
  cta_text_hi?: string;
  cta_text_gu?: string;
  cta_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThemeRevision {
  id: string;
  theme_preset_id: string;
  revision_number: number;
  config: ThemeConfig;
  created_by?: string;
  created_at: string;
  notes?: string;
}
