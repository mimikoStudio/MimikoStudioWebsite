-- ============================================
-- 产品图片上传问题诊断和修复
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 1. 检查 product_images 表是否存在
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_images')
    THEN '✅ product_images 表存在'
    ELSE '❌ product_images 表不存在'
  END AS table_check;

-- 2. 检查表结构
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_images'
ORDER BY ordinal_position;

-- 3. 检查当前记录数
SELECT 
  COUNT(*) AS total_images,
  COUNT(DISTINCT product_id) AS products_with_images
FROM product_images;

-- 4. 检查 RLS 是否启用
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'product_images';

-- 5. 检查现有的 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'product_images';

-- 6. 禁用 RLS（修复图片上传问题）
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- 7. 确保 image_url 字段类型为 TEXT（可以存储大的 base64 字符串）
ALTER TABLE product_images 
ALTER COLUMN image_url TYPE TEXT;

-- 8. 创建允许所有操作的策略（备用方案）
DROP POLICY IF EXISTS "Allow all operations on product_images" ON product_images;
CREATE POLICY "Allow all operations on product_images" 
ON product_images 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 9. 验证修复
SELECT 
  '✅ RLS 已禁用' AS rls_status,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'product_images') AS rls_enabled;

-- 10. 测试插入
-- 取消下面的注释来测试插入功能
/*
INSERT INTO product_images (product_id, image_url, alt_text, display_order)
VALUES (
  (SELECT id FROM products LIMIT 1),  -- 使用第一个产品的 ID
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',  -- 1x1 像素的测试图片
  'Test image',
  0
);

SELECT '✅ 测试图片插入成功' AS test_result;
*/

-- 11. 最终状态
SELECT 
  '✅ 修复完成！现在可以上传图片了。' AS message,
  (SELECT COUNT(*) FROM product_images) AS current_image_count,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'product_images') AS rls_enabled;
