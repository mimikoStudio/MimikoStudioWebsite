# 🚀 One-Time Database Setup Guide

## ✅ Automatic Setup System

Your Mimiko Studio website now has an **automatic database setup system**! 

When you first access the admin dashboard, it will:
1. **Detect** if the database needs setup
2. **Show** a simple 3-step setup screen
3. **Guide** you through copying and running the SQL
4. **Verify** the setup is complete
5. **Work** automatically from then on

**You only need to do this ONCE!** After that, everything works automatically.

---

## 📋 What Happens Automatically

### First Time You Visit Admin Dashboard:

1. **Auto-Detection**: The system checks if your database is configured
2. **Setup Screen**: If not configured, you'll see a beautiful setup guide
3. **One-Click Copy**: Click "Copy SQL" to copy the complete setup script
4. **Run in Supabase**: Paste and run in Supabase SQL Editor
5. **Continue**: Click "I've Run the SQL" and you're done!

### After Setup:

- ✅ All tables are created
- ✅ All permissions are configured
- ✅ Storage buckets are ready
- ✅ Default categories are added
- ✅ Site settings are initialized
- ✅ Image uploads work
- ✅ Everything works automatically!

---

## 🎯 Step-by-Step Instructions

### Step 1: Access Admin Dashboard

Go to your website's admin page:
```
https://your-username.github.io/your-repo-name/#/admin/login
```

Login with your admin credentials.

### Step 2: See the Setup Screen

If the database isn't configured yet, you'll automatically see:

```
🎨 Welcome to Mimiko Studio Admin!

Your database needs a one-time setup. Follow these 3 simple steps:

1. Open Supabase SQL Editor
   [Click here to open SQL Editor]

2. Copy & Paste the SQL Script
   [SQL code with Copy button]

3. Click "Run" in SQL Editor
   Then come back here and click the button below

[✅ I've Run the SQL - Continue to Dashboard]
```

### Step 3: Run the SQL

1. **Click the link** to open Supabase SQL Editor
   - Or go to: https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql

2. **Click "Copy SQL"** button on the setup screen
   - This copies the complete setup script

3. **Paste in SQL Editor**
   - Paste the copied SQL into the editor

4. **Click "Run"**
   - Wait for it to complete (should take 2-3 seconds)

5. **Go back to your website**
   - Click "✅ I've Run the SQL - Continue to Dashboard"

### Step 4: You're Done! 🎉

The admin dashboard will now load normally. You can:
- ✅ Add products with images
- ✅ Manage categories
- ✅ Handle inquiries
- ✅ Schedule appointments
- ✅ Update settings

**You never need to do this again!**

---

## 🔧 What the SQL Script Does

The automatic setup script:

### 1. Creates Admin Helper Function
```sql
CREATE OR REPLACE FUNCTION is_admin()
```
- Checks if current user is an admin
- Used for permission checks

### 2. Creates Storage Buckets
```sql
INSERT INTO storage.buckets
```
- `product-images` - For product photos (public)
- `gallery-images` - For gallery showcase (public)
- `inquiry-references` - For customer uploads (private)
- `customer-uploads` - For general uploads (private)

### 3. Configures RLS Policies
```sql
ALTER TABLE ... ENABLE ROW LEVEL SECURITY
CREATE POLICY ... FOR ALL USING (true)
```
- Enables security on all tables
- Creates permissive policies for admin access
- Allows all CRUD operations

### 4. Sets Up Storage Policies
```sql
CREATE POLICY "storage_public_read"
CREATE POLICY "storage_authenticated_write"
```
- Allows public read access to images
- Allows authenticated users to upload

### 5. Seeds Default Data
```sql
INSERT INTO categories ...
INSERT INTO site_settings ...
```
- Adds 6 default product categories
- Initializes site settings
- Sets up WhatsApp and Instagram links

---

## 🎨 Setup Screen Features

### Beautiful UI
- Luxury design matching your brand
- Clear step-by-step instructions
- Progress indicators
- Success confirmations

### One-Click Copy
- Click "Copy SQL" button
- SQL is copied to clipboard
- Visual feedback when copied

### Direct Links
- Click to open Supabase SQL Editor
- Opens in new tab
- Takes you directly to the right page

### Auto-Detection
- Checks database status automatically
- Only shows setup if needed
- Verifies setup is complete

---

## 🔄 What If I Skip the Setup?

If you try to use the admin dashboard without running the SQL:

- ❌ You'll see the setup screen every time
- ❌ You won't be able to add products
- ❌ You won't be able to manage categories
- ❌ Image uploads won't work
- ❌ Inquiries won't save

**Solution**: Just run the SQL once and you're done!

---

## ✅ How to Verify Setup is Complete

After running the SQL, you can verify:

### 1. Check Tables Exist
Go to Supabase → Table Editor
You should see:
- ✅ categories
- ✅ products
- ✅ product_images
- ✅ inquiries
- ✅ appointments
- ✅ orders
- ✅ order_items
- ✅ profiles
- ✅ site_settings
- ✅ wishlists
- ✅ reviews
- ✅ notifications
- ✅ availability_slots

### 2. Check Storage Buckets
Go to Supabase → Storage
You should see:
- ✅ product-images
- ✅ gallery-images
- ✅ inquiry-references
- ✅ customer-uploads

### 3. Check Default Data
In Table Editor → categories:
You should see 6 categories:
- Hand-Painted Clothing
- Designer Bags
- Home Decor
- Fashion Accessories
- Personalized Gifts
- Small Handmade Creations

### 4. Test Admin Dashboard
Go to your admin dashboard:
- ✅ No setup screen appears
- ✅ You can add products
- ✅ You can upload images
- ✅ Everything works!

---

## 🐛 Troubleshooting

### Problem: Setup screen keeps appearing

**Solution**: 
1. Make sure you ran the SQL successfully
2. Check Supabase SQL Editor for errors
3. Refresh the admin dashboard page
4. Clear browser cache (Ctrl+Shift+R)

### Problem: SQL fails to run

**Solution**:
1. Check you're logged into Supabase
2. Make sure you have admin access to the project
3. Copy the SQL again (might have been truncated)
4. Try running it in smaller chunks if needed

### Problem: Can't access Supabase SQL Editor

**Solution**:
1. Go to https://supabase.com
2. Login to your account
3. Select your project: `zshfxzdtosfvtngctftn`
4. Click "SQL Editor" in the left sidebar

### Problem: Tables exist but still see setup screen

**Solution**:
1. The setup screen checks if you can INSERT data
2. Make sure RLS policies are configured correctly
3. Try running the SQL again (it's safe to run multiple times)
4. Check browser console for errors (F12)

---

## 🎯 Quick Reference

### Setup Screen URL
```
#/admin
```
(automatically shows setup if needed)

### Supabase SQL Editor
```
https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql
```

### SQL Script Location
```
supabase/migrations/COMPLETE_SETUP.sql
```

### Admin Dashboard
```
#/admin
```

---

## 📊 Setup Checklist

Before you start:
- [ ] You have Supabase project credentials
- [ ] You can access Supabase dashboard
- [ ] You have admin access to the project
- [ ] You're logged into your website's admin panel

After setup:
- [ ] SQL ran successfully (no errors)
- [ ] Setup screen no longer appears
- [ ] You can add products
- [ ] You can upload images
- [ ] You can manage categories
- [ ] Default categories are visible
- [ ] Site settings are configured

---

## 🎉 That's It!

**The setup is completely automatic!** 

Just follow the 3 steps on the setup screen:
1. Open SQL Editor
2. Copy & paste the SQL
3. Click "Run"

Then click "Continue to Dashboard" and you're done!

**You only need to do this ONCE. After that, everything works automatically!** 🚀

---

## 💡 Pro Tips

### Tip 1: Bookmark the SQL Editor
Save this URL for future reference:
```
https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql
```

### Tip 2: Keep the SQL Script Safe
The complete SQL script is in:
```
supabase/migrations/COMPLETE_SETUP.sql
```
You can always re-run it if needed.

### Tip 3: Test After Setup
After setup, try these actions:
- Add a test product
- Upload an image
- Create a test inquiry
- Verify everything works

### Tip 4: Share with Team
If others need admin access:
1. Add them in Supabase Authentication
2. Set their role to 'admin' in profiles table
3. They'll see the same setup screen (if needed)
4. After setup, everything works for them too

---

## 📞 Need Help?

If you're stuck:

1. **Check the setup screen** - It has all the instructions
2. **Watch for errors** - SQL Editor shows error messages
3. **Check browser console** - Press F12 to see errors
4. **Re-run the SQL** - It's safe to run multiple times
5. **Clear cache** - Press Ctrl+Shift+R to hard refresh

---

## 🎊 Congratulations!

Your Mimiko Studio admin dashboard is now fully set up and ready to use!

**What you can do now:**
- 🛍️ Add unlimited products with images
- 🗂️ Manage categories
- 💌 Handle customer inquiries
- 📅 Schedule appointments
- ⚙️ Update site settings
- 📊 View dashboard statistics

**Everything works automatically from now on!** 🚀✨
