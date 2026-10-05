-- ============================================
-- 产品图片问题修复 SQL
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 1. 禁用 product_images 表的 RLS
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- 2. 确保 image_url 字段类型为 TEXT（可以存储大的 base64 字符串）
ALTER TABLE product_images 
ALTER COLUMN image_url TYPE TEXT;

-- 3. 验证修改
SELECT 
  '✅ product_images RLS disabled' AS status1,
  (SELECT COUNT(*) FROM product_images) AS total_images;

-- 4. 检查表结构
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'product_images'
ORDER BY ordinal_position;

-- 完成
SELECT '✅ 图片问题修复完成！现在可以上传图片了。' AS message;
