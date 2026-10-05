-- ============================================
-- SITE SETTINGS UPGRADE MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new settings fields to site_settings table
-- Note: site_settings uses key-value pairs, so we just need to ensure the table exists

-- Ensure site_settings table exists with proper structure
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for admin access
DROP POLICY IF EXISTS "site_settings_all_access" ON site_settings;
CREATE POLICY "site_settings_all_access" 
ON site_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert default settings if they don't exist
INSERT INTO site_settings (setting_key, setting_value) VALUES
  -- Branding
  ('site_name', 'Mimiko Studio'),
  ('site_tagline', 'Paint ♥ Create ♥ Be You'),
  ('logo_url', ''),
  ('favicon_url', ''),
  ('light_logo_url', ''),
  ('dark_logo_url', ''),
  ('footer_logo_url', ''),
  ('social_share_image_url', ''),
  
  -- Theme Colors
  ('primary_color', '#D5AA64'),
  ('secondary_color', '#6B3E28'),
  ('accent_color', '#F2A0B4'),
  ('background_color', '#FFF5E9'),
  ('card_background_color', '#FFFCF7'),
  ('text_color', '#4B2818'),
  ('heading_color', '#4B2818'),
  ('muted_text_color', '#6B3E28'),
  ('border_color', '#EAC69C'),
  ('button_color', '#4B2818'),
  ('button_hover_color', '#6B3E28'),
  ('header_background_color', '#FFF5E9'),
  ('footer_background_color', '#4B2818'),
  
  -- Typography
  ('font_heading', 'Cormorant Garamond'),
  ('font_body', 'Inter'),
  ('font_button', 'Montserrat'),
  ('font_size_base', '16px'),
  ('heading_weight', '500'),
  ('body_weight', '400'),
  ('letter_spacing', '0.02em'),
  
  -- Contact & Business
  ('business_name', 'Mimiko Studio'),
  ('phone', '+91 7874291924'),
  ('whatsapp', '+917874291924'),
  ('email', 'hello@mimikostudio.com'),
  ('address', ''),
  ('google_maps_url', ''),
  ('business_hours', 'Mon-Sat: 10 AM - 7 PM'),
  ('enable_contact_form', 'true'),
  ('enable_whatsapp_button', 'true'),
  
  -- Social Media
  ('instagram_url', 'https://www.instagram.com/mimiko.studio24/'),
  ('facebook_url', ''),
  ('youtube_url', ''),
  ('pinterest_url', ''),
  ('twitter_url', ''),
  ('linkedin_url', ''),
  
  -- E-commerce
  ('currency', 'INR'),
  ('shipping_fee', '99'),
  ('free_shipping_minimum', '1999'),
  
  -- Inquiry & Booking
  ('enable_inquiries', 'true'),
  ('enable_booking', 'true'),
  ('inquiry_success_message', 'Your creative request has been received! Our studio will review your idea and contact you with pricing and availability.'),
  ('booking_success_message', 'Your appointment request has been submitted. We''ll confirm your appointment via WhatsApp within 24 hours.'),
  ('default_inquiry_status', 'new'),
  ('booking_notice', 'Please book at least 24 hours in advance.'),
  
  -- Footer
  ('footer_about_text', 'Handcrafted fabric art, thoughtfully painted and uniquely designed for you. Each piece tells a story of creativity and passion.'),
  ('copyright_text', '© 2024 Mimiko Studio | Fabric Art. All rights reserved.'),
  ('show_footer_quick_links', 'true'),
  ('show_footer_social', 'true'),
  ('show_footer_contact', 'true'),
  
  -- Header
  ('enable_sticky_header', 'true'),
  ('show_search', 'true'),
  ('show_wishlist', 'true'),
  ('show_cart', 'true'),
  ('show_login', 'true'),
  
  -- Homepage
  ('hero_title', 'Where Art Meets Elegance.'),
  ('hero_subtitle', 'Hand-Painted Creations, Made With Love.'),
  ('hero_description', 'Explore the beauty of personalized fabric art, thoughtfully designed to express your unique style.'),
  ('hero_image_url', ''),
  ('hero_background_url', ''),
  ('hero_primary_button_text', '✨ Explore Our Collection'),
  ('hero_primary_button_link', '/collections'),
  ('hero_secondary_button_text', '🎨 Create Your Own Design'),
  ('hero_secondary_button_link', '/custom-creations'),
  ('show_hero_section', 'true'),
  
  -- Metadata
  ('updated_at', NOW()::text)
ON CONFLICT (setting_key) DO NOTHING;

-- Verify the migration
SELECT 
  '✅ Site settings migration complete!' AS status,
  (SELECT COUNT(*) FROM site_settings) AS total_settings;
