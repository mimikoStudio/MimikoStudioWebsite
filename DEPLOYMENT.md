# 🚀 GitHub Pages Deployment Guide

Complete step-by-step guide to deploy Mimiko Studio to GitHub Pages.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Your Supabase credentials ready
- Node.js 18+ and npm installed

---

## 🔧 Step 1: Create GitHub Repository

### Option A: Create New Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in top-right → **New repository**
3. Fill in details:
   - **Repository name**: `mimiko-studio` (or your preferred name)
   - **Description**: "Mimiko Studio - Handcrafted Fabric Art"
   - **Public** (required for free GitHub Pages)
   - ✅ **Add a README file**
   - ✅ **Add .gitignore** (select Node)
4. Click **Create repository**

### Option B: Use Existing Repository

If you already have a repository, skip to Step 3.

---

## 🔐 Step 2: Add Supabase Secrets to GitHub

GitHub Actions needs your Supabase credentials to build the site.

### Add Repository Secrets

1. Go to your repository on GitHub
2. Click **Settings** tab
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

#### Secret 1: VITE_SUPABASE_URL
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://zshfxzdtosfvtngctftn.supabase.co`
- Click **Add secret**

#### Secret 2: VITE_SUPABASE_ANON_KEY
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaGZ4emR0b3NmdnRuZ2N0ZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMTAyMDgsImV4cCI6MjEwNjU4NjIwOH0.wCwcfECDKX7IrwKp2hR8lrWhMXJLdteyjf3pFcMojc0`
- Click **Add secret**

⚠️ **Important**: 
- Never commit `.env` files to Git
- These secrets are only used during GitHub Actions build
- The anon key is safe to expose (it's protected by RLS)

---

## 📤 Step 3: Push Code to GitHub

### Initialize Git Repository (if not already done)

```bash
# Navigate to your project folder
cd mimiko-studio

# Initialize git (skip if already initialized)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Mimiko Studio website"

# Add GitHub remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/mimiko-studio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Replace YOUR_USERNAME

Replace `YOUR_USERNAME` with your actual GitHub username in the remote URL.

Example:
```bash
git remote add origin https://github.com/johndoe/mimiko-studio.git
```

---

## 🌐 Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. In left sidebar, click **Pages**
4. Under **Source**, select:
   - **Source**: GitHub Actions
5. The workflow will automatically deploy when you push to `main` branch

---

## ⚙️ Step 5: Configure Base Path (Important!)

The `vite.config.js` is configured for GitHub Pages, but you need to update the repository name.

### Update vite.config.js

Open `vite.config.js` and change line 8:

```javascript
const basePath = process.env.GITHUB_PAGES === 'true' ? '/mimiko-studio/' : '/';
```

**Replace `/mimiko-studio/` with your actual repository name:**

- If repo is `mimiko-studio` → keep `/mimiko-studio/`
- If repo is `my-art-website` → change to `/my-art-website/`
- If using custom domain → change to `/`

Then commit and push:

```bash
git add vite.config.js
git commit -m "Update base path for GitHub Pages"
git push
```

---

## 🔄 Step 6: Trigger Deployment

The GitHub Actions workflow will automatically run when you push to `main`.

### Manual Trigger (Optional)

1. Go to **Actions** tab in your repository
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

---

## ✅ Step 7: Verify Deployment

### Check Deployment Status

1. Go to **Actions** tab
2. You should see a workflow run in progress
3. Wait for it to complete (usually 2-3 minutes)
4. Green checkmark ✅ means success

### Access Your Live Site

Your site will be available at:

```
https://YOUR_USERNAME.github.io/mimiko-studio/
```

Replace:
- `YOUR_USERNAME` with your GitHub username
- `mimiko-studio` with your repository name

Example:
```
https://johndoe.github.io/mimiko-studio/
```

---

## 🗄️ Step 8: Set Up Database

After deployment, you need to set up the Supabase database.

### Option 1: Use Built-in Setup Page

1. Visit: `https://YOUR_USERNAME.github.io/mimiko-studio/#/db-setup`
2. Click **Test Connection**
3. Copy the SQL migration
4. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql)
5. Paste and run the SQL

### Option 2: Manual Setup

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql)
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run

---

## 👤 Step 9: Create Admin User

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email and password
4. Go to **Table Editor** → **profiles** table
5. Find your user and set `role` to `admin`

Now you can log in at:
```
https://YOUR_USERNAME.github.io/mimiko-studio/#/admin/login
```

---

## 🎨 Step 10: Add Products

### Via Admin Dashboard

1. Log in to admin dashboard
2. Go to **Products** → **Add Product**
3. Fill in product details
4. Upload images
5. Click **Save**

### Via Supabase Table Editor

1. Go to Supabase → **Table Editor** → **products**
2. Click **Insert** → **New Row**
3. Fill in product details
4. Set `is_published` to `true`
5. Click **Save**

---

## 🔄 Updating Your Site

Whenever you make changes to the code:

```bash
# Make your changes...

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push
```

GitHub Actions will automatically rebuild and redeploy your site.

---

## 🐛 Troubleshooting

### Build Fails

**Problem**: GitHub Actions build fails

**Solutions**:
1. Check **Actions** tab for error logs
2. Verify secrets are set correctly
3. Ensure all dependencies are in `package.json`
4. Check for TypeScript errors: `npm run typecheck`

### 404 on Page Refresh

**Problem**: Refreshing a page shows 404

**Solution**: The site uses HashRouter (`/#/path`), so this shouldn't happen. If it does:
1. Verify `vite.config.js` has correct base path
2. Check that you're using `HashRouter` in `App.tsx`

### Images Not Loading

**Problem**: Product images show broken

**Solutions**:
1. Check Supabase Storage bucket permissions
2. Verify image URLs in database
3. Ensure images are uploaded to correct bucket

### Database Connection Error

**Problem**: "Failed to fetch" errors

**Solutions**:
1. Verify Supabase URL and anon key in GitHub secrets
2. Check Supabase project is active
3. Run database migration
4. Check browser console for specific errors

### Site Shows Blank Page

**Problem**: Site loads but shows nothing

**Solutions**:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify Supabase credentials are correct
4. Check if database tables exist

---

## 🌍 Custom Domain (Optional)

To use a custom domain:

### 1. Update vite.config.js

```javascript
const basePath = '/'; // Change to root
```

### 2. Add CNAME File

Create `public/CNAME` with your domain:
```
mimikostudio.com
```

### 3. Configure DNS

In your domain registrar, add:
- **Type**: CNAME
- **Name**: www
- **Value**: `YOUR_USERNAME.github.io`

### 4. Enable in GitHub

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Check **Enforce HTTPS**

---

## 📊 Monitoring Deployment

### View Deployment Logs

1. Go to **Actions** tab
2. Click on a workflow run
3. Click **build** job
4. View logs for each step

### Check Deployment Status

- ✅ **Success**: Site is live
- ❌ **Failure**: Check logs for errors
- ⏳ **In Progress**: Wait for completion

---

## 🔒 Security Notes

### What's Safe to Expose

- ✅ Supabase URL (public)
- ✅ Supabase anon key (protected by RLS)
- ✅ Website code (public repository)

### What's NOT Safe

- ❌ Supabase service role key (NEVER expose)
- ❌ Database passwords
- ❌ Private API keys
- ❌ `.env` files

### Row Level Security (RLS)

Your Supabase database uses RLS to protect data:
- Public users can only view published products
- Customers can only see their own orders
- Admin operations require authentication
- Private uploads are protected

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check browser console for errors
4. Verify Supabase connection at `#/db-setup`

---

## ✅ Deployment Checklist

- [ ] GitHub repository created
- [ ] Supabase secrets added to GitHub
- [ ] Code pushed to `main` branch
- [ ] GitHub Pages enabled (GitHub Actions source)
- [ ] Base path updated in `vite.config.js`
- [ ] Workflow completed successfully
- [ ] Site accessible at GitHub Pages URL
- [ ] Database migration run
- [ ] Admin user created
- [ ] Products added
- [ ] Tested all pages and features

---

## 🎉 You're Live!

Your Mimiko Studio website is now live on GitHub Pages!

**Your site URL**: `https://YOUR_USERNAME.github.io/mimiko-studio/`

Share it with the world and start receiving custom orders! 🎨✨
