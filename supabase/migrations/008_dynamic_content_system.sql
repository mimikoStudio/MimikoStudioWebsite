-- ============================================
-- DYNAMIC CONTENT MANAGEMENT SYSTEM
-- Hero Banners, Gallery, Collections
-- ============================================

-- STEP 1: Create hero_banners table
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_url TEXT,
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  tablet_image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 5000, -- milliseconds
  transition_type TEXT DEFAULT 'fade', -- fade, slide, fade-slide
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 2: Create gallery_categories table
CREATE TABLE IF NOT EXISTS gallery_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 3: Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES gallery_categories(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 4: Create collections table (if not exists)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  long_description TEXT,
  cover_image_url TEXT,
  background_image_url TEXT,
  button_text TEXT,
  button_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_banners_order ON hero_banners(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_active ON gallery_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_order ON gallery_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(display_order);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(display_order);

-- STEP 6: Enable RLS on all tables
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- STEP 7: Create RLS policies

-- Hero Banners
DROP POLICY IF EXISTS "hero_banners_public_read" ON hero_banners;
CREATE POLICY "hero_banners_public_read" 
ON hero_banners 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "hero_banners_admin_all" ON hero_banners;
CREATE POLICY "hero_banners_admin_all" 
ON hero_banners 
FOR ALL 
USING (true);

-- Gallery Categories
DROP POLICY IF EXISTS "gallery_categories_public_read" ON gallery_categories;
CREATE POLICY "gallery_categories_public_read" 
ON gallery_categories 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "gallery_categories_admin_all" ON gallery_categories;
CREATE POLICY "gallery_categories_admin_all" 
ON gallery_categories 
FOR ALL 
USING (true);

-- Gallery Images
DROP POLICY IF EXISTS "gallery_images_public_read" ON gallery_images;
CREATE POLICY "gallery_images_public_read" 
ON gallery_images 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "gallery_images_admin_all" ON gallery_images;
CREATE POLICY "gallery_images_admin_all" 
ON gallery_images 
FOR ALL 
USING (true);

-- Collections
DROP POLICY IF EXISTS "collections_public_read" ON collections;
CREATE POLICY "collections_public_read" 
ON collections 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "collections_admin_all" ON collections;
CREATE POLICY "collections_admin_all" 
ON collections 
FOR ALL 
USING (true);

-- STEP 8: Create storage bucket for website content
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-content', 'website-content', true)
ON CONFLICT (id) DO NOTHING;

-- STEP 9: Create storage policies
DROP POLICY IF EXISTS "website_content_public_read" ON storage.objects;
CREATE POLICY "website_content_public_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'website-content');

DROP POLICY IF EXISTS "website_content_admin_insert" ON storage.objects;
CREATE POLICY "website_content_admin_insert" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'website-content');

DROP POLICY IF EXISTS "website_content_admin_update" ON storage.objects;
CREATE POLICY "website_content_admin_update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'website-content');

DROP POLICY IF EXISTS "website_content_admin_delete" ON storage.objects;
CREATE POLICY "website_content_admin_delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'website-content');

-- STEP 10: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 11: Create triggers for updated_at
DROP TRIGGER IF EXISTS update_hero_banners_updated_at ON hero_banners;
CREATE TRIGGER update_hero_banners_updated_at
BEFORE UPDATE ON hero_banners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_categories_updated_at ON gallery_categories;
CREATE TRIGGER update_gallery_categories_updated_at
BEFORE UPDATE ON gallery_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON gallery_images;
CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- STEP 12: Verify the migration
SELECT 
  '✅ Dynamic content management system migration complete!' AS status,
  (SELECT COUNT(*) FROM hero_banners) AS hero_banners_count,
  (SELECT COUNT(*) FROM gallery_categories) AS gallery_categories_count,
  (SELECT COUNT(*) FROM gallery_images) AS gallery_images_count,
  (SELECT COUNT(*) FROM collections) AS collections_count;
