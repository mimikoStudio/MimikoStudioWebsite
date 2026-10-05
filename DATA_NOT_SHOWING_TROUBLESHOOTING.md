# 🔧 Data Not Showing - Complete Troubleshooting Guide

## ⚠️ Problem: Data not showing in admin panel and buyer website

If you're experiencing this issue, follow these steps.

---

## 🎯 Quick Solution

### Step 1: Commit and push latest code
```bash
git add .
git commit -m "Add debug panel and better error handling"
git push origin main
```

### Step 2: Wait for deployment
Wait 2-3 minutes for GitHub Actions to complete deployment.

### Step 3: Go to admin panel
Visit: `https://mimikostudio.github.io/MimikoStudioWebsite/#/admin`

### Step 4: Check the Debug Panel
You'll see a **Database Debug Panel** at the top showing:
- ✅ Database connection status
- 📊 Total products, published count, draft count
- 📦 Sample product list
- 🚀 Quick action buttons

---

## 🔍 Diagnosing the Problem

### Case 1: Debug panel shows "❌ Database connection failed"

**Cause:** Supabase connection failed

**Solution:**
1. Check if Supabase credentials are correct
2. Verify Supabase project is active
3. Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`

### Case 2: Debug panel shows "✅ Database connection successful" but product count is 0

**Cause:** No products in database

**Solution:**
1. Click **"📦 Insert Sample Products"** button in debug panel
2. Or go to Products tab and manually add products
3. Make sure to check the "Published" checkbox

### Case 3: Debug panel shows products but "Published" count is 0

**Cause:** All products are in draft status

**Solution:**
1. Click **"🚀 Publish All Drafts"** button in debug panel
2. Or go to Products tab and click status badges to publish individually
3. Products will show on buyer website after publishing

### Case 4: Debug panel shows "row-level security" error

**Cause:** RLS policy blocking access

**Solution:**
1. Open Supabase SQL Editor
2. Run this SQL:

```sql
-- Disable RLS on all tables
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots DISABLE ROW LEVEL SECURITY;
```

3. Click "Run"
4. Refresh admin panel page

### Case 5: Debug panel shows "relation does not exist" error

**Cause:** Database tables don't exist

**Solution:**
1. Open Supabase SQL Editor
2. Run the complete database migration SQL (in `COMPLETE_SETUP_SQL`)
3. Or visit `/#/admin/setup` page and follow instructions

---

## 📊 Debug Panel Features

### Information Displayed:
- **Database connection status** - Whether it can connect to Supabase
- **Product statistics** - Total, published, draft counts
- **Category statistics** - Number of categories
- **Sample products** - First 5 products with name, price, status
- **Error details** - Detailed error information if any

### Available Actions:
- **🔄 Test Connection** - Retest database connection
- **🚀 Publish All Drafts** - Publish all draft products at once
- **📦 Insert Sample Products** - Insert 3 sample products

---

## 🛠️ Common Issues & Solutions

### Issue 1: Product added but not showing on website

**Checklist:**
- [ ] Is the product published? (Status should be "✅ Published")
- [ ] Does debug panel show "Published" count > 0?
- [ ] Have you refreshed the buyer website? (Ctrl+Shift+R)

**Solution:**
1. Go to Admin Panel → Products tab
2. Find your product
3. If status is "📝 Draft", click status badge to switch to "✅ Published"
4. Or click "🚀 Publish All" button
5. Refresh buyer website page

### Issue 2: Admin panel shows "Loading..." spinner forever

**Cause:** Database query timeout or connection issue

**Solution:**
1. Check internet connection
2. Refresh page (Ctrl+Shift+R)
3. Check browser console (F12) for errors
4. Verify Supabase project is running normally

### Issue 3: Error when adding products

**Common errors and solutions:**

**Error: "new row violates row-level security policy"**
- Run RLS fix SQL (see Case 4)

**Error: "duplicate key value violates unique constraint"**
- Product slug already exists, use different name or manually edit slug

**Error: "invalid input syntax for type numeric"**
- Price field must be a number, cannot contain letters or special characters

### Issue 4: Images not showing

**Cause:** Image storage issue or corrupted base64 data

**Solution:**
1. Edit product
2. Delete existing images
3. Re-upload images (ensure less than 2MB)
4. Save product

---

## 🎯 Complete Troubleshooting Flow

### Step 1: Check Debug Panel
1. Go to admin panel
2. Look at debug panel at top
3. Note the status and numbers shown

### Step 2: Take Action Based on Status

**If shows "❌ Database connection failed":**
→ Check Supabase credentials and project status

**If shows "✅ Database connection successful" but product count is 0:**
→ Click "Insert Sample Products" or add products manually

**If shows products but "Published" count is 0:**
→ Click "Publish All Drafts"

**If shows RLS error:**
→ Run RLS fix SQL

**If shows table doesn't exist error:**
→ Run database migration SQL

### Step 3: Verify Fix
1. Refresh admin panel page
2. Check if debug panel shows correct numbers
3. Go to Products tab to view product list
4. Visit buyer website to check if products show

### Step 4: Test Complete Flow
1. Add new product (make sure to check "Published")
2. Upload images
3. Save product
4. View product in admin panel
5. View product on buyer website
6. Click product to view detail page
7. Add to cart
8. Complete checkout flow

---

## 📞 Getting Help

### Check Browser Console
1. Press F12 to open Developer Tools
2. Switch to "Console" tab
3. Look for red error messages
4. Screenshot the error information

### Check Network Requests
1. Press F12 to open Developer Tools
2. Switch to "Network" tab
3. Refresh page
4. Check if there are failed requests (red)
5. Click failed request to view details

### Check Supabase Logs
1. Login to Supabase Dashboard
2. Go to your project
3. Check "Logs" section
4. Look for error logs

---

## ✅ Success Indicators

When everything is working correctly, you should see:

### Admin Panel:
- ✅ Debug panel shows "✅ Database connection successful"
- ✅ Product statistics show correct numbers
- ✅ Product list shows all products
- ✅ Can add, edit, delete products
- ✅ Can publish/unpublish products

### Buyer Website:
- ✅ Shop page shows published products
- ✅ Product images display correctly
- ✅ Can click products to view details
- ✅ Can add to cart
- ✅ Can complete checkout

---

## 🎊 Summary

**Common reasons for data not showing:**
1. Products not published (draft status)
2. RLS policy blocking access
3. Database tables don't exist
4. Supabase connection issues

**Solutions:**
1. Use debug panel to diagnose problem
2. Take appropriate action based on diagnosis
3. Publish products or fix database issues
4. Verify fix is successful

**The debug panel is your best friend!** It tells you the exact cause of the problem and provides quick solutions.

---

## 🚀 Quick Action Guide

### If product count is 0:
```
1. Go to admin panel
2. Check debug panel
3. Click "📦 Insert Sample Products"
4. Wait for insertion to complete
5. Refresh page
6. Products should show!
```

### If all products are drafts:
```
1. Go to admin panel
2. Check debug panel
3. Click "🚀 Publish All Drafts"
4. Confirm action
5. Refresh page
6. Visit buyer website to see products
```

### If there's RLS error:
```
1. Open Supabase SQL Editor
2. Copy RLS fix SQL
3. Paste and run
4. Return to admin panel
5. Refresh page
6. Error should be gone!
```

---

**Use the debug panel to quickly diagnose and fix any data not showing issues!** 🎉
