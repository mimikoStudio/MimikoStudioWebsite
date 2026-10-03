# 🔑 GitHub Pages Quick Setup

## Your Credentials (Ready to Use)

### Supabase Configuration
```
VITE_SUPABASE_URL=https://zshfxzdtosfvtngctftn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaGZ4emR0b3NmdnRuZ2N0ZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMTAyMDgsImV4cCI6MjEwNjU4NjIwOH0.wCwcfECDKX7IrwKp2hR8lrWhMXJLdteyjf3pFcMojc0
```

### GitHub Repository Setup

1. **Create Repository**
   - Go to: https://github.com/new
   - Name: `mimiko-studio`
   - Public (required for free GitHub Pages)

2. **Add Secrets** (Settings → Secrets → Actions)
   ```
   Name: VITE_SUPABASE_URL
   Value: https://zshfxzdtosfvtngctftn.supabase.co
   
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaGZ4emR0b3NmdnRuZ2N0ZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMTAyMDgsImV4cCI6MjEwNjU4NjIwOH0.wCwcfECDKX7IrwKp2hR8lrWhMXJLdteyjf3pFcMojc0
   ```

3. **Push Code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/mimiko-studio.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Settings → Pages
   - Source: **GitHub Actions**

5. **Update Base Path** (vite.config.js line 8)
   ```javascript
   const basePath = process.env.GITHUB_PAGES === 'true' ? '/mimiko-studio/' : '/';
   // Change '/mimiko-studio/' to match your repo name
   ```

6. **Deploy!**
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy
   - Site URL: `https://YOUR_USERNAME.github.io/mimiko-studio/`

7. **Set Up Database**
   - Visit: `https://YOUR_USERNAME.github.io/mimiko-studio/#/db-setup`
   - Copy SQL and run in Supabase SQL Editor

---

## ✅ Deployment Checklist

- [ ] GitHub repository created
- [ ] Supabase secrets added to GitHub
- [ ] Code pushed to `main` branch
- [ ] GitHub Pages enabled (GitHub Actions)
- [ ] Base path updated in vite.config.js
- [ ] Workflow completed successfully
- [ ] Database migration run
- [ ] Admin user created in Supabase
- [ ] Products added

---

## 📞 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn
- **SQL Editor**: https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql
- **Full Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎉 That's It!

Your site will be live at: `https://YOUR_USERNAME.github.io/mimiko-studio/`

Replace `YOUR_USERNAME` with your actual GitHub username.
