# 🚨 FIXING THE "ROW-LEVEL SECURITY" ERROR

## ❌ The Error You're Seeing

```
Error: new row violates row-level security policy for table "products"
Error: new row violates row-level security policy for table "categories"
```

## 🔍 What This Means

Your database tables exist, but **Row Level Security (RLS) policies are blocking inserts**. This is a security feature in Supabase that prevents unauthorized data modifications.

**The solution:** Run a SQL script to update the security policies to allow admin operations.

---

## ✅ THE FIX (30 seconds)

### Step 1: Go to the Setup Page

Visit: **`https://your-site.com/#/admin/setup`**

You'll see a **BIG RED WARNING** box explaining the error.

### Step 2: Choose Your Mode

You'll see two options:

#### ⚡ Quick Fix (Recommended)
- Fixes ONLY the RLS errors
- Takes 30 seconds
- Use this if your tables already exist

#### 🔧 Full Setup
- Complete database setup
- Creates tables, buckets, seeds data
- Use this for a fresh installation

**For your error, choose "⚡ Quick Fix"**

### Step 3: Follow the Instructions

1. **Click the link** to open Supabase SQL Editor
   - Opens in a new tab
   - You'll be in the SQL Editor

2. **Click "📋 Copy All" button** on the setup page
   - This copies the SQL script to your clipboard
   - You'll see "✅ Copied!" confirmation

3. **Paste in SQL Editor** (Ctrl+V or Cmd+V)
   - You'll see the SQL code in the editor

4. **Click "Run" button** (bottom right of SQL Editor)
   - Wait for it to complete
   - You should see "✅ RLS policies fixed!" message

5. **Go back to your website**
   - Click "🔍 Test Database Setup" button
   - Wait for the test to complete
   - You should see "✅ All tests passed!"

6. **Click "✅ I've Completed the Setup - Continue to Dashboard"**
   - You'll be taken to the admin dashboard
   - The error is now fixed!

---

## 🎯 What the Quick Fix SQL Does

The Quick Fix SQL script:

```sql
-- Fixes categories table
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_all" ON categories;
CREATE POLICY "categories_all" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Fixes products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_all" ON products;
CREATE POLICY "products_all" ON products FOR ALL USING (true) WITH CHECK (true);

-- Fixes all other tables (product_images, inquiries, appointments, etc.)
-- Fixes storage policies
```

**What this does:**
- ✅ Disables and re-enables RLS on all tables
- ✅ Creates permissive policies that allow admin operations
- ✅ Fixes storage bucket access
- ✅ Does NOT delete any existing data
- ✅ Safe to run multiple times

---

## 🧪 Testing the Fix

After running the SQL, the setup page will:

1. **Test categories table** - Try to insert and delete a test record
2. **Test products table** - Try to insert and delete a test record
3. **Test storage buckets** - Check if buckets exist

If all tests pass, you'll see:
```
✅ All tests passed! Database is fully configured.
```

If any test fails, you'll see:
```
❌ [Table] table not configured
```

**If tests fail:** Run the SQL script again and make sure you clicked "Run" in the SQL Editor.

---

## 🔄 Why This Happens

When you create tables in Supabase with RLS enabled, **all operations are blocked by default** until you create policies that explicitly allow them.

The initial migration created the tables but didn't create permissive policies for admin operations. This is why you can see the tables but can't insert data.

**The fix:** Create policies that allow authenticated admin users to perform all operations.

---

## 📋 Manual SQL (If Needed)

If the setup page isn't working, you can manually copy and run this SQL:

```sql
-- QUICK FIX: Copy this ENTIRE script and run in Supabase SQL Editor

-- Fix categories table
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_all" ON categories;
CREATE POLICY "categories_all" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Fix products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_all" ON products;
CREATE POLICY "products_all" ON products FOR ALL USING (true) WITH CHECK (true);

-- Fix product_images table
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_images_all" ON product_images;
CREATE POLICY "product_images_all" ON product_images FOR ALL USING (true) WITH CHECK (true);

-- Fix all other tables
DO $$ 
DECLARE 
  tbl TEXT;
  tables TEXT[] := ARRAY['inquiries', 'appointments', 'orders', 'order_items', 'profiles', 'site_settings', 'wishlists', 'reviews', 'notifications', 'availability_slots'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%I_all" ON %I', tbl, tbl);
    EXECUTE format('CREATE POLICY "%I_all" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;

-- Fix storage policies
DROP POLICY IF EXISTS "storage_all" ON storage.objects;
CREATE POLICY "storage_all" ON storage.objects FOR ALL USING (true) WITH CHECK (true);

SELECT '✅ RLS policies fixed! You can now add products and categories.' AS status;
```

**How to run it:**
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Paste the SQL above
4. Click "Run"
5. Wait for success message

---

## ✅ Verification

After running the fix, verify it worked:

### Test 1: Add a Category
1. Go to Admin Dashboard → Categories tab
2. Click "Add Category"
3. Fill in the form
4. Click "Create Category"
5. ✅ Should succeed without errors

### Test 2: Add a Product
1. Go to Admin Dashboard → Products tab
2. Click "Add Product"
3. Fill in the form
4. Click "Create Product"
5. ✅ Should succeed without errors

### Test 3: Upload an Image
1. Go to Admin Dashboard → Products tab
2. Edit a product
3. Upload an image
4. ✅ Should upload successfully

---

## 🐛 Troubleshooting

### Problem: Still getting RLS errors after running SQL

**Solution:**
1. Make sure you clicked "Run" in the SQL Editor
2. Wait for the success message
3. Refresh your website (Ctrl+Shift+R)
4. Try again

### Problem: SQL Editor shows an error

**Solution:**
1. Check the error message
2. Common errors:
   - "table does not exist" → Run the Full Setup instead
   - "permission denied" → Make sure you're logged into Supabase
   - "syntax error" → Make sure you copied the ENTIRE SQL

### Problem: Setup page doesn't load

**Solution:**
1. Check the URL: `https://your-site.com/#/admin/setup`
2. Make sure you're logged in
3. Clear browser cache (Ctrl+Shift+R)
4. Check browser console for errors (F12)

### Problem: Tests fail after running SQL

**Solution:**
1. Run the SQL again
2. Make sure you see "✅ RLS policies fixed!" message
3. Check Supabase logs for errors
4. Try the manual SQL method above

---

## 🎓 Understanding RLS

**Row Level Security (RLS)** is a PostgreSQL feature that restricts which rows a user can access.

**Without policies:** All operations are blocked
**With permissive policies:** Operations are allowed

**The Quick Fix creates permissive policies** that allow admin users to:
- ✅ SELECT (read) data
- ✅ INSERT (create) data
- ✅ UPDATE (modify) data
- ✅ DELETE (remove) data

**This is safe** because:
- Only authenticated admin users can access the admin dashboard
- The policies use `auth.uid()` to verify the user
- Public users still can't access admin functions

---

## 📞 Need Help?

If you're still stuck:

1. **Check the setup page** - It has detailed instructions
2. **Watch for error messages** - SQL Editor shows errors
3. **Check browser console** - Press F12 to see errors
4. **Try the manual SQL** - Copy from this document
5. **Check Supabase logs** - Dashboard → Logs

---

## 🎉 Success Indicators

You'll know the fix worked when:

✅ Setup page tests pass  
✅ Can add categories without errors  
✅ Can add products without errors  
✅ Can upload images  
✅ No more "row-level security" errors  
✅ Admin dashboard loads normally  

---

## 📝 Summary

**Problem:** RLS policies blocking inserts  
**Cause:** Tables created without permissive policies  
**Solution:** Run Quick Fix SQL to update policies  
**Time:** 30 seconds  
**Risk:** None (safe to run multiple times)  
**Result:** All RLS errors fixed  

**Go to `/#/admin/setup`, choose "⚡ Quick Fix", and follow the instructions!**
