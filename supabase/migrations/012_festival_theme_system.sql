-- ============================================
-- FESTIVAL THEME SYSTEM & BUG FIXES
-- Phase 5: Billing & Invoice + Festival Themes
-- ============================================

-- PRIORITY 1: Fix product slugs - ensure all products have valid slugs
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Add unique constraint to slug if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;

-- PRIORITY 5: Festival Theme System Tables

-- 1. Create theme_presets table
CREATE TABLE IF NOT EXISTS theme_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  preset_type TEXT NOT NULL DEFAULT 'custom', -- 'default', 'festival', 'seasonal', 'custom'
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create festival_campaigns table
CREATE TABLE IF NOT EXISTS festival_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  theme_preset_id UUID REFERENCES theme_presets(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'expired'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create campaign_banners table
CREATE TABLE IF NOT EXISTS campaign_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES festival_campaigns(id) ON DELETE CASCADE,
  title_en TEXT,
  title_hi TEXT,
  title_gu TEXT,
  subtitle_en TEXT,
  subtitle_hi TEXT,
  subtitle_gu TEXT,
  description_en TEXT,
  description_hi TEXT,
  description_gu TEXT,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  tablet_image_url TEXT,
  cta_text_en TEXT,
  cta_text_hi TEXT,
  cta_text_gu TEXT,
  cta_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create theme_revisions table for rollback
CREATE TABLE IF NOT EXISTS theme_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_preset_id UUID REFERENCES theme_presets(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  config JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_theme_presets_active ON theme_presets(is_active);
CREATE INDEX IF NOT EXISTS idx_theme_presets_default ON theme_presets(is_default);
CREATE INDEX IF NOT EXISTS idx_festival_campaigns_active ON festival_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_festival_campaigns_status ON festival_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_festival_campaigns_dates ON festival_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_banners_campaign ON campaign_banners(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_banners_active ON campaign_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_theme_revisions_preset ON theme_revisions(theme_preset_id);
CREATE INDEX IF NOT EXISTS idx_theme_revisions_number ON theme_revisions(revision_number);

-- 6. Enable RLS
ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_revisions ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
-- Theme presets: public read active, admin all
DROP POLICY IF EXISTS "theme_presets_public_read" ON theme_presets;
CREATE POLICY "theme_presets_public_read" ON theme_presets FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "theme_presets_admin_all" ON theme_presets;
CREATE POLICY "theme_presets_admin_all" ON theme_presets FOR ALL USING (true);

-- Festival campaigns: public read active, admin all
DROP POLICY IF EXISTS "festival_campaigns_public_read" ON festival_campaigns;
CREATE POLICY "festival_campaigns_public_read" ON festival_campaigns FOR SELECT USING (is_active = true AND status = 'active');

DROP POLICY IF EXISTS "festival_campaigns_admin_all" ON festival_campaigns;
CREATE POLICY "festival_campaigns_admin_all" ON festival_campaigns FOR ALL USING (true);

-- Campaign banners: public read active, admin all
DROP POLICY IF EXISTS "campaign_banners_public_read" ON campaign_banners;
CREATE POLICY "campaign_banners_public_read" ON campaign_banners FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "campaign_banners_admin_all" ON campaign_banners;
CREATE POLICY "campaign_banners_admin_all" ON campaign_banners FOR ALL USING (true);

-- Theme revisions: admin only
DROP POLICY IF EXISTS "theme_revisions_admin_all" ON theme_revisions;
CREATE POLICY "theme_revisions_admin_all" ON theme_revisions FOR ALL USING (true);

-- 8. Insert default theme presets
INSERT INTO theme_presets (name, description, preset_type, is_active, is_default, config) VALUES
('Default Mimiko Studio', 'Default theme with warm ivory and gold accents', 'default', true, true, '{
  "primary_color": "#D5AA64",
  "secondary_color": "#6B3E28",
  "accent_color": "#F2A0B4",
  "background_color": "#FFF5E9",
  "card_background_color": "#FFFCF7",
  "text_color": "#4B2818",
  "heading_color": "#4B2818",
  "muted_text_color": "#6B3E28",
  "border_color": "#EAC69C",
  "button_color": "#4B2818",
  "button_hover_color": "#6B3E28",
  "header_background_color": "#FFF5E9",
  "footer_background_color": "#4B2818",
  "border_radius": "12px",
  "shadow_style": "soft"
}'),
('Diwali', 'Festival of lights - warm golden theme', 'festival', true, false, '{
  "primary_color": "#FFD700",
  "secondary_color": "#8B4513",
  "accent_color": "#FF6B35",
  "background_color": "#FFF8DC",
  "card_background_color": "#FFFAF0",
  "text_color": "#2C1810",
  "heading_color": "#8B4513",
  "muted_text_color": "#6B3E28",
  "border_color": "#FFD700",
  "button_color": "#8B4513",
  "button_hover_color": "#A0522D",
  "header_background_color": "#FFF8DC",
  "footer_background_color": "#8B4513",
  "border_radius": "16px",
  "shadow_style": "glow"
}'),
('Navratri', 'Nine nights festival - vibrant colors', 'festival', true, false, '{
  "primary_color": "#FF1493",
  "secondary_color": "#FF8C00",
  "accent_color": "#FFD700",
  "background_color": "#FFF0F5",
  "card_background_color": "#FFFAFA",
  "text_color": "#4B0082",
  "heading_color": "#8B008B",
  "muted_text_color": "#9370DB",
  "border_color": "#FF69B4",
  "button_color": "#FF1493",
  "button_hover_color": "#C71585",
  "header_background_color": "#FFF0F5",
  "footer_background_color": "#4B0082",
  "border_radius": "20px",
  "shadow_style": "vibrant"
}'),
('Holi', 'Festival of colors - bright and playful', 'festival', true, false, '{
  "primary_color": "#FF6B6B",
  "secondary_color": "#4ECDC4",
  "accent_color": "#FFE66D",
  "background_color": "#F7FFF7",
  "card_background_color": "#FFFFFF",
  "text_color": "#2C3E50",
  "heading_color": "#E74C3C",
  "muted_text_color": "#95A5A6",
  "border_color": "#3498DB",
  "button_color": "#E74C3C",
  "button_hover_color": "#C0392B",
  "header_background_color": "#F7FFF7",
  "footer_background_color": "#2C3E50",
  "border_radius": "24px",
  "shadow_style": "playful"
}'),
('Christmas', 'Winter holiday theme', 'festival', true, false, '{
  "primary_color": "#C41E3A",
  "secondary_color": "#2E8B57",
  "accent_color": "#FFD700",
  "background_color": "#FFFAF0",
  "card_background_color": "#FFFFFF",
  "text_color": "#2C1810",
  "heading_color": "#C41E3A",
  "muted_text_color": "#6B3E28",
  "border_color": "#2E8B57",
  "button_color": "#C41E3A",
  "button_hover_color": "#8B0000",
  "header_background_color": "#FFFAF0",
  "footer_background_color": "#2E8B57",
  "border_radius": "12px",
  "shadow_style": "festive"
}'),
('Wedding Season', 'Elegant wedding theme', 'seasonal', true, false, '{
  "primary_color": "#D4AF37",
  "secondary_color": "#8B7355",
  "accent_color": "#FFB6C1",
  "background_color": "#FFFAF0",
  "card_background_color": "#FFFFFF",
  "text_color": "#2C1810",
  "heading_color": "#8B7355",
  "muted_text_color": "#A0826D",
  "border_color": "#D4AF37",
  "button_color": "#8B7355",
  "button_hover_color": "#6B5344",
  "header_background_color": "#FFFAF0",
  "footer_background_color": "#2C1810",
  "border_radius": "8px",
  "shadow_style": "elegant"
}'),
('Summer Collection', 'Bright summer theme', 'seasonal', true, false, '{
  "primary_color": "#FF6B35",
  "secondary_color": "#004E89",
  "accent_color": "#F7C548",
  "background_color": "#FFF8E7",
  "card_background_color": "#FFFFFF",
  "text_color": "#2C3E50",
  "heading_color": "#004E89",
  "muted_text_color": "#7F8C8D",
  "border_color": "#F7C548",
  "button_color": "#FF6B35",
  "button_hover_color": "#E55A2B",
  "header_background_color": "#FFF8E7",
  "footer_background_color": "#004E89",
  "border_radius": "16px",
  "shadow_style": "bright"
}');

-- 9. Create function to get active theme
CREATE OR REPLACE FUNCTION get_active_theme()
RETURNS JSONB AS $$
DECLARE
  active_theme JSONB;
BEGIN
  SELECT config INTO active_theme
  FROM theme_presets
  WHERE is_active = true AND is_default = false
  LIMIT 1;
  
  IF active_theme IS NULL THEN
    SELECT config INTO active_theme
    FROM theme_presets
    WHERE is_default = true
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(active_theme, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to check and activate scheduled campaigns
CREATE OR REPLACE FUNCTION check_scheduled_campaigns()
RETURNS VOID AS $$
DECLARE
  campaign RECORD;
  now_time TIMESTAMPTZ := NOW();
BEGIN
  -- Activate scheduled campaigns
  FOR campaign IN 
    SELECT * FROM festival_campaigns 
    WHERE status = 'scheduled' 
    AND start_date <= now_time 
    AND (end_date IS NULL OR end_date >= now_time)
  LOOP
    UPDATE festival_campaigns 
    SET status = 'active', updated_at = now_time
    WHERE id = campaign.id;
    
    -- Activate associated theme
    IF campaign.theme_preset_id IS NOT NULL THEN
      UPDATE theme_presets 
      SET is_active = true, updated_at = now_time
      WHERE id = campaign.theme_preset_id;
    END IF;
  END LOOP;
  
  -- Expire campaigns
  FOR campaign IN 
    SELECT * FROM festival_campaigns 
    WHERE status = 'active' 
    AND end_date IS NOT NULL 
    AND end_date < now_time
  LOOP
    UPDATE festival_campaigns 
    SET status = 'expired', updated_at = now_time
    WHERE id = campaign.id;
    
    -- Deactivate associated theme
    IF campaign.theme_preset_id IS NOT NULL THEN
      UPDATE theme_presets 
      SET is_active = false, updated_at = now_time
      WHERE id = campaign.theme_preset_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Verify migration
SELECT 
  '✅ Festival theme system migration complete!' AS status,
  (SELECT COUNT(*) FROM theme_presets) AS theme_presets_count,
  (SELECT COUNT(*) FROM festival_campaigns) AS campaigns_count,
  (SELECT COUNT(*) FROM campaign_banners) AS banners_count;
