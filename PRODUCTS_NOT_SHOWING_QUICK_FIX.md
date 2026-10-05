# 🚨 Products Not Showing on Website - QUICK FIX

## ❌ Problem
Products show in admin panel but NOT on the website (shop page, product detail page).

## 🔍 Root Cause
Your products have `is_published = false` (draft status). The website only shows **published** products.

---

## ✅ Solution (2 Minutes)

### Option 1: Publish All Products via SQL (Fastest)

**Step 1:** Go to Supabase SQL Editor
```
https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql
```

**Step 2:** Copy and run this SQL:
```sql
-- Publish ALL products
UPDATE products 
SET is_published = true 
WHERE is_published = false;

-- Verify
SELECT 
  COUNT(*) AS total_products,
  COUNT(CASE WHEN is_published = true THEN 1 END) AS published,
  COUNT(CASE WHEN is_published = false THEN 1 END) AS drafts
FROM products;
```

**Step 3:** Click "Run"

**Step 4:** Refresh your website
```
https://mimikostudio.github.io/MimikoStudioWebsite/#/shop
```

**Done!** All products should now show on the website with images! ✅

---

### Option 2: Publish via Admin Panel

**Step 1:** Go to Admin Panel → Products tab
```
https://mimikostudio.github.io/MimikoStudioWebsite/#/admin
```

**Step 2:** Look at the status column
- 📝 Draft = Not visible on website
- ✅ Published = Visible on website

**Step 3:** Click the status badge to toggle
- Click "📝 Draft" → Changes to "✅ Published"
- Product now visible on website!

**Step 4:** Or use "🚀 Publish All" button
- If you see this button, click it
- Confirms the action
- All drafts become published

---

## 🔍 How to Verify

### Check in Admin Panel:
1. Go to Products tab
2. Look at the status column
3. Should show "✅ Published" (green)
4. Not "📝 Draft" (gray)

### Check on Website:
1. Go to Shop page
2. Products should appear
3. Images should display
4. Click a product → Detail page should show images

### Check in Database:
```sql
SELECT 
  id,
  name,
  is_published,
  (SELECT COUNT(*) FROM product_images WHERE product_id = products.id) AS image_count
FROM products
ORDER BY created_at DESC;
```

You should see:
- `is_published = true` ✅
- `image_count > 0` ✅

---

## 🐛 Still Not Working?

### Issue 1: Products Published But No Images

**Check:** Are images actually in the database?

```sql
SELECT 
  p.id,
  p.name,
  p.is_published,
  pi.id AS image_id,
  LENGTH(pi.image_url) AS image_size
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_published = true;
```

**If image_size is NULL or 0:**
- Images were not saved correctly
- Re-upload images in admin panel
- Save the product again

**If image_size is very large (> 1MB):**
- Images might be too big for base64
- Compress images to under 1MB
- Re-upload

### Issue 2: Images Show as Broken/Placeholder

**Check:** Browser console for errors

1. Open website
2. Press F12 → Console tab
3. Look for red errors about images
4. Common errors:
   - "Failed to load resource" → Image URL is invalid
   - "CORS error" → Image hosting issue
   - "404 Not Found" → Image doesn't exist

**Solution:**
- Re-upload images in admin
- Use smaller images (< 1MB)
- Use JPG or PNG format

### Issue 3: Products Show But Images Don't

**Check:** Is the image data actually base64?

```sql
SELECT 
  id,
  SUBSTRING(image_url, 1, 50) AS image_preview
FROM product_images
LIMIT 5;
```

**Should see:**
```
image_preview
---------------------------
data:image/jpeg;base64,/9j...
data:image/png;base64,iVBOR...
```

**If you see something else:**
- Images were not converted to base64 correctly
- Re-upload images in admin panel

---

## 📋 Quick Checklist

Before reporting issues, verify:

- [ ] Products are published (`is_published = true`)
- [ ] Products have images in `product_images` table
- [ ] Images are base64 format (start with `data:image/`)
- [ ] Images are under 1MB each
- [ ] Browser cache is cleared (Ctrl+Shift+R)
- [ ] Website is refreshed after publishing

---

## 🎯 Most Common Solution

**90% of the time, the issue is:**
1. Products are not published
2. Run the SQL to publish all products
3. Refresh the website
4. Done! ✅

---

## 🚀 Quick Fix Commands

### Publish All Products:
```sql
UPDATE products SET is_published = true WHERE is_published = false;
```

### Check Product Status:
```sql
SELECT id, name, is_published FROM products;
```

### Check Images:
```sql
SELECT product_id, COUNT(*) AS image_count 
FROM product_images 
GROUP BY product_id;
```

---

## 📞 Need More Help?

If products are published but images still don't show:

1. **Open browser console** (F12)
2. **Go to Console tab**
3. **Look for red errors**
4. **Take a screenshot**
5. **Share the error message**

Common errors and solutions:
- **"Failed to load resource"** → Image URL is broken, re-upload
- **"CORS error"** → Image hosting issue, use base64
- **"404 Not Found"** → Image doesn't exist, re-upload

---

## ✅ Success Indicators

After publishing, you should see:

### In Admin Panel:
- ✅ Status shows "✅ Published" (green badge)
- ✅ Images show in product list
- ✅ Image count displays (e.g., "3 images")

### On Website:
- ✅ Products appear in shop page
- ✅ Product images display correctly
- ✅ Click product → Detail page shows images
- ✅ Image gallery works (thumbnails)

### In Database:
- ✅ `is_published = true`
- ✅ `product_images` has records
- ✅ `image_url` contains base64 data

---

**Just run the SQL to publish all products and refresh your website! That's it!** 🎉
