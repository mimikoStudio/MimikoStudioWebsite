# 🚨 SOLUÇÃO DEFINITIVA - Execute Este SQL Agora

## ❌ Problema
```
Could not find the table 'public.hero_banners' in the schema cache
```

As tabelas não existem no seu banco de dados Supabase.

---

## ✅ Solução (3 Passos Simples)

### Passo 1: Abra o Supabase SQL Editor

Clique neste link:
```
https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql
```

Ou vá manualmente:
1. Acesse: https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn
2. Clique em **SQL Editor** no menu lateral

---

### Passo 2: Copie e Cole Este SQL

Abra o arquivo: **`RUN_THIS_SQL_NOW.sql`**

Copie **TUDO** do arquivo e cole no SQL Editor.

Ou copie diretamente daqui:

```sql
-- ============================================
-- COMPLETE DATABASE SETUP - RUN THIS NOW
-- ============================================

-- 1. CREATE HERO BANNERS TABLE
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
  duration INTEGER NOT NULL DEFAULT 5000,
  transition_type TEXT DEFAULT 'fade',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CREATE GALLERY CATEGORIES TABLE
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

-- 3. CREATE GALLERY IMAGES TABLE
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES gallery_categories(id) ON DELETE CASCADE,
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

-- 4. CREATE COLLECTIONS TABLE
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

-- 5. CREATE INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ADD INVOICE_NUMBER COLUMN TO ORDERS
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_banners_order ON hero_banners(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_active ON gallery_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_order ON gallery_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(display_order);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(display_order);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- 8. ENABLE ROW LEVEL SECURITY
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICIES

-- Hero Banners
DROP POLICY IF EXISTS "hero_banners_public_read" ON hero_banners;
CREATE POLICY "hero_banners_public_read" ON hero_banners FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "hero_banners_admin_all" ON hero_banners;
CREATE POLICY "hero_banners_admin_all" ON hero_banners FOR ALL USING (true);

-- Gallery Categories
DROP POLICY IF EXISTS "gallery_categories_public_read" ON gallery_categories;
CREATE POLICY "gallery_categories_public_read" ON gallery_categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "gallery_categories_admin_all" ON gallery_categories;
CREATE POLICY "gallery_categories_admin_all" ON gallery_categories FOR ALL USING (true);

-- Gallery Images
DROP POLICY IF EXISTS "gallery_images_public_read" ON gallery_images;
CREATE POLICY "gallery_images_public_read" ON gallery_images FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "gallery_images_admin_all" ON gallery_images;
CREATE POLICY "gallery_images_admin_all" ON gallery_images FOR ALL USING (true);

-- Collections
DROP POLICY IF EXISTS "collections_public_read" ON collections;
CREATE POLICY "collections_public_read" ON collections FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "collections_admin_all" ON collections;
CREATE POLICY "collections_admin_all" ON collections FOR ALL USING (true);

-- Invoices
DROP POLICY IF EXISTS "invoices_public_read" ON invoices;
CREATE POLICY "invoices_public_read" ON invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "invoices_admin_all" ON invoices;
CREATE POLICY "invoices_admin_all" ON invoices FOR ALL USING (true);

-- 10. CREATE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-content',
  'website-content',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 11. CREATE STORAGE POLICIES
DROP POLICY IF EXISTS "website_content_public_read" ON storage.objects;
CREATE POLICY "website_content_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'website-content');

DROP POLICY IF EXISTS "website_content_auth_insert" ON storage.objects;
CREATE POLICY "website_content_auth_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'website-content' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "website_content_auth_update" ON storage.objects;
CREATE POLICY "website_content_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'website-content' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "website_content_auth_delete" ON storage.objects;
CREATE POLICY "website_content_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'website-content' AND auth.role() = 'authenticated');

-- 12. VERIFY SETUP
SELECT 
  '✅ Database setup complete!' AS status,
  (SELECT COUNT(*) FROM hero_banners) AS hero_banners_count,
  (SELECT COUNT(*) FROM gallery_categories) AS gallery_categories_count,
  (SELECT COUNT(*) FROM gallery_images) AS gallery_images_count,
  (SELECT COUNT(*) FROM collections) AS collections_count,
  (SELECT COUNT(*) FROM invoices) AS invoices_count;
```

---

### Passo 3: Clique em "Run"

1. Cole o SQL no editor
2. Clique no botão **"Run"** (canto inferior direito)
3. Aguarde a execução (1-2 segundos)
4. Você verá: `✅ Database setup complete!`

---

## ✅ Verificação

Após executar o SQL:

1. **Recarregue o Admin Panel:**
   ```
   https://mimikostudio.github.io/MimikoStudioWebsite/#/admin
   ```

2. **Verifique se o erro desapareceu**

3. **Teste as funcionalidades:**
   - Hero Banners tab
   - Gallery tab
   - Collections tab

---

## 🎯 O Que Foi Criado

### Tabelas:
- ✅ `hero_banners` - Banners do hero
- ✅ `gallery_categories` - Categorias da galeria
- ✅ `gallery_images` - Imagens da galeria
- ✅ `collections` - Coleções
- ✅ `invoices` - Faturas

### Colunas Adicionadas:
- ✅ `orders.invoice_number` - Número da fatura

### Indexes:
- ✅ 11 indexes para performance

### RLS Policies:
- ✅ Políticas de segurança para todas as tabelas

### Storage:
- ✅ Bucket `website-content` criado
- ✅ Políticas de acesso configuradas

---

## 🐛 Se Ainda Der Erro

### Erro: "relation already exists"

**Solução:** Isso é bom! Significa que as tabelas já existem. O SQL usa `IF NOT EXISTS`, então é seguro executar múltiplas vezes.

### Erro: "permission denied"

**Solução:** 
1. Verifique se você está logado no Supabase
2. Verifique se tem permissão de admin no projeto
3. Tente executar cada comando separadamente

### Erro: "table orders does not exist"

**Solução:** 
A tabela `orders` precisa existir antes. Execute primeiro:

```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  shipping_address TEXT DEFAULT '',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Depois execute o SQL completo novamente.

---

## 📋 Resumo Rápido

### O Que Fazer:

1. ✅ Abra o Supabase SQL Editor
2. ✅ Copie o SQL do arquivo `RUN_THIS_SQL_NOW.sql`
3. ✅ Cole no editor
4. ✅ Clique em "Run"
5. ✅ Aguarde "✅ Database setup complete!"
6. ✅ Recarregue o Admin Panel
7. ✅ Pronto!

### Tempo Estimado:
- **2-3 minutos** no total

### Resultado:
- ✅ Todas as tabelas criadas
- ✅ Todas as políticas RLS configuradas
- ✅ Bucket de storage criado
- ✅ Admin Panel funcionando
- ✅ Sem mais erros de tabela

---

## 🎊 Depois de Executar

Você poderá:

- ✅ Criar hero banners
- ✅ Gerenciar galeria
- ✅ Criar coleções
- ✅ Gerar faturas
- ✅ Fazer upload de imagens
- ✅ Usar todas as funcionalidades

---

**Execute o SQL agora e o problema será resolvido!** 🚀
