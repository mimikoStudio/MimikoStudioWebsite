-- ============================================
-- IMAGE DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor to check image data
-- ============================================

-- 1. Check all products and their image status
SELECT 
  p.id,
  p.name,
  p.is_published,
  COUNT(pi.id) AS image_count,
  CASE 
    WHEN COUNT(pi.id) = 0 THEN '❌ No images'
    ELSE '✅ Has images'
  END AS status
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_published = true
GROUP BY p.id, p.name, p.is_published
ORDER BY p.created_at DESC;

-- 2. Check image data details
SELECT 
  pi.id,
  pi.product_id,
  p.name AS product_name,
  LENGTH(pi.image_url) AS image_size_bytes,
  ROUND(LENGTH(pi.image_url) / 1024.0, 2) AS image_size_kb,
  CASE 
    WHEN pi.image_url LIKE 'data:image/%' THEN '✅ Valid base64 format'
    WHEN pi.image_url LIKE 'http%' THEN '✅ URL format'
    ELSE '❌ Unknown format'
  END AS format_check,
  SUBSTRING(pi.image_url FROM 1 FOR 100) AS url_preview
FROM product_images pi
JOIN products p ON pi.product_id = p.id
ORDER BY pi.created_at DESC;

-- 3. Check for products without images
SELECT 
  p.id,
  p.name,
  '⚠️ This product has no images' AS warning
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_published = true
  AND pi.id IS NULL;

-- 4. Summary statistics
SELECT 
  COUNT(*) AS total_published_products,
  COUNT(DISTINCT pi.product_id) AS products_with_images,
  COUNT(*) - COUNT(DISTINCT pi.product_id) AS products_without_images,
  ROUND(AVG(LENGTH(pi.image_url)) / 1024.0, 2) AS avg_image_size_kb,
  ROUND(MAX(LENGTH(pi.image_url)) / 1024.0, 2) AS max_image_size_kb,
  ROUND(MIN(LENGTH(pi.image_url)) / 1024.0, 2) AS min_image_size_kb
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_published = true;

-- 5. Check if images are valid base64
SELECT 
  pi.id,
  p.name,
  CASE 
    WHEN pi.image_url ~ '^data:image\/[a-z]+;base64,' THEN '✅ Valid base64'
    ELSE '❌ Invalid format - should start with "data:image/...;base64,"'
  END AS validation,
  SUBSTRING(pi.image_url FROM 1 FOR 50) AS starts_with
FROM product_images pi
JOIN products p ON pi.product_id = p.id;
