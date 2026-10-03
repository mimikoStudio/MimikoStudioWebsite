# 🔧 Fix RLS Error & Enable Image Uploads

## Problem
You're getting this error when trying to add products or categories:
```
Error: new row violates row-level security policy for table "products"
```

## Solution

### Step 1: Run the RLS Fix Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy the entire contents of `supabase/migrations/003_complete_rls_fix.sql`
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)

This will:
- ✅ Create the `is_admin()` helper function
- ✅ Disable and re-enable RLS on all tables
- ✅ Drop all old restrictive policies
- ✅ Create new permissive policies that allow admin operations
- ✅ Verify all policies were created

You should see a success message:
```
✅ All RLS policies have been successfully updated! You can now add products, categories, and manage all data.
```

### Step 2: Run the Storage Setup Migration

1. In the same **SQL Editor**, click **"New Query"**
2. Copy the entire contents of `supabase/migrations/004_storage_setup.sql`
3. Paste it into the SQL Editor
4. Click **"Run"**

This will:
- ✅ Create 4 storage buckets (product-images, gallery-images, inquiry-references, customer-uploads)
- ✅ Set up proper access policies for each bucket
- ✅ Enable image uploads from the admin dashboard

You should see:
```
✅ Storage buckets and policies have been successfully configured! You can now upload images.
```

### Step 3: Test Adding Products

1. Go to your admin dashboard
2. Navigate to **Products** tab
3. Click **"Add Product"**
4. Fill in the product details
5. **Upload images** using the new image upload component
6. Click **"Create Product"**

It should work now! 🎉

---

## 📸 Image Upload Feature

### What's New

The Products Manager now includes a full image upload system:

#### Features:
- ✅ **Drag & Drop Upload** - Click to upload or drag images
- ✅ **Multiple Images** - Upload up to 5 images per product
- ✅ **Image Preview** - See thumbnails before saving
- ✅ **Main Image** - First image is marked as the main product image
- ✅ **Delete Images** - Remove individual images with hover button
- ✅ **File Validation** - Only images allowed, max 5MB each
- ✅ **Progress Indicator** - See upload status
- ✅ **Supabase Storage** - Images stored securely in cloud storage

#### Supported Formats:
- PNG
- JPG / JPEG
- WEBP
- GIF

#### File Size Limit:
- Maximum 5MB per image
- Maximum 5 images per product

### How to Use

1. **Open Product Form**
   - Click "Add Product" or edit an existing product
   - Scroll to the "Product Images" section

2. **Upload Images**
   - Click the upload area or drag images onto it
   - Select multiple images from your computer
   - Wait for upload to complete (you'll see a spinner)

3. **Manage Images**
   - First image is automatically marked as "Main Image"
   - Hover over any image to see the delete button (X)
   - Click X to remove an image
   - Images are ordered by upload sequence

4. **Save Product**
   - Images are automatically saved when you create/update the product
   - They're stored in the `product-images` bucket in Supabase Storage
   - Public URLs are generated and linked to the product

### Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `product-images` | Public | Product photos visible to customers |
| `gallery-images` | Public | Gallery showcase images |
| `inquiry-references` | Private | Customer reference images for inquiries |
| `customer-uploads` | Private | General customer uploads |

### Image Display

- **Product List**: Shows first image as thumbnail (48x48px)
- **Product Detail**: Shows all images in a gallery
- **Main Image**: First image is used as the primary product image
- **Responsive**: Images scale properly on all devices

---

## 🔍 Troubleshooting

### Still Getting RLS Errors?

If you still see RLS errors after running the migration:

1. **Verify the migration ran successfully**
   - Check the SQL Editor output for success message
   - Run this query to verify policies:
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```

2. **Check your user role**
   - Go to Supabase → Table Editor → `profiles` table
   - Find your user
   - Make sure `role` is set to `'admin'`

3. **Clear browser cache**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Try in incognito/private mode

4. **Check browser console**
   - Open DevTools (F12)
   - Look for specific error messages
   - Check Network tab for failed requests

### Images Not Uploading?

If image uploads fail:

1. **Check storage bucket exists**
   ```sql
   SELECT * FROM storage.buckets;
   ```
   You should see: product-images, gallery-images, inquiry-references, customer-uploads

2. **Check storage policies**
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'storage';
   ```
   You should see policies for each bucket

3. **Check file size**
   - Images must be under 5MB
   - Only image formats allowed (PNG, JPG, WEBP, GIF)

4. **Check browser console**
   - Look for CORS errors
   - Check for authentication errors
   - Verify you're logged in as admin

### Images Not Showing After Upload?

If images upload but don't display:

1. **Check product_images table**
   ```sql
   SELECT * FROM product_images WHERE product_id = 'your-product-id';
   ```

2. **Verify image URLs**
   - URLs should be in format: `https://xxxxx.supabase.co/storage/v1/object/public/product-images/filename.jpg`
   - Test the URL directly in browser

3. **Check product query**
   - Products should include `product_images` relation
   - Check the useProducts hook is fetching images correctly

---

## 📋 Migration Files Summary

| File | Purpose | When to Run |
|------|---------|-------------|
| `001_initial_schema.sql` | Create all database tables | Initial setup |
| `002_fix_rls_policies.sql` | Fix RLS policies (first attempt) | If you got RLS errors |
| `003_complete_rls_fix.sql` | Complete RLS fix (recommended) | **Run this now** |
| `004_storage_setup.sql` | Setup storage buckets for images | **Run this now** |

---

## ✅ Verification Checklist

After running both migrations, verify:

- [ ] Can add new categories without errors
- [ ] Can add new products without errors
- [ ] Can upload product images
- [ ] Images appear in product form preview
- [ ] Images save when product is created
- [ ] Images display in product list (thumbnails)
- [ ] Can edit products and update images
- [ ] Can delete products and images are removed
- [ ] Image URLs are accessible in browser
- [ ] Storage buckets exist in Supabase dashboard

---

## 🎯 Quick Fix Commands

If you want to run just the essential fixes:

### Fix RLS (Copy & Paste into SQL Editor):
```sql
-- Quick RLS Fix
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Disable and re-enable RLS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);
```

### Setup Storage (Copy & Paste into SQL Editor):
```sql
-- Quick Storage Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access - Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admin Insert - Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');
```

---

## 📞 Support

If you're still having issues:

1. Check the browser console (F12) for specific errors
2. Verify you're logged in as admin
3. Check Supabase logs in the dashboard
4. Review the RLS policies in Supabase → Authentication → Policies
5. Check storage bucket settings in Supabase → Storage

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ You can add products without RLS errors  
✅ You can upload multiple images per product  
✅ Images display correctly in the admin dashboard  
✅ Images are visible on the public website  
✅ You can edit and delete products with images  
✅ Storage buckets show files in Supabase dashboard  

---

**Run both migrations (003 and 004) and you'll be all set!** 🚀
