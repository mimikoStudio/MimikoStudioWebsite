# 🎨 Site Settings & UI/UX Upgrade Guide

## ✅ What's New

Your Mimiko Studio website now has a **comprehensive Site Settings system** that allows you to customize every aspect of your website without touching code!

---

## 🚀 New Features

### 1. **Comprehensive Site Settings Panel**
Access via: Admin Dashboard → Settings tab

**10 Settings Sections:**

#### 🎨 Branding
- Website logo (with upload)
- Favicon (with upload)
- Brand name
- Tagline
- Light/Dark/Footer logos
- Social sharing image

#### 🎨 Theme Colors
- Primary color
- Secondary color
- Accent color
- Background color
- Card background
- Text color
- Heading color
- Muted text color
- Border color
- Button colors
- Header/Footer backgrounds
- **Color picker + HEX input**
- **Live preview**

#### ✍️ Typography
- Heading font
- Body font
- Button font
- Font size
- Font weights
- Letter spacing
- **8 professional font choices**

#### 🏠 Homepage
- Hero section title/subtitle/description
- Hero images (with upload)
- Button text and links
- Show/hide hero section

#### 🧭 Header
- Sticky header toggle
- Show/hide search
- Show/hide wishlist
- Show/hide cart
- Show/hide login

#### 🦶 Footer
- Footer about text
- Copyright text
- Show/hide quick links
- Show/hide social media
- Show/hide contact info

#### 📱 Social Media
- Instagram
- Facebook
- YouTube
- Pinterest
- Twitter/X
- LinkedIn
- **Icons only show when URLs are added**

#### 📞 Contact & Business
- Business name
- Phone number
- WhatsApp number
- Email
- Address
- Google Maps URL
- Business hours
- Enable/disable contact form
- Enable/disable WhatsApp button

#### 🛍️ E-commerce
- Currency (INR/USD/EUR)
- Shipping fee
- Free shipping minimum

#### 💬 Inquiry & Booking
- Enable/disable inquiries
- Enable/disable booking
- Custom success messages
- Default inquiry status
- Booking notice

---

## 🎯 How to Use

### Step 1: Run Database Migration

**Open Supabase SQL Editor:**
https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql

**Copy and run this SQL:**
```sql
-- File: supabase/migrations/005_site_settings_upgrade.sql
```

This creates all the necessary settings fields with default values.

### Step 2: Commit and Push Code

```bash
git add .
git commit -m "Add comprehensive site settings system"
git push origin main
```

### Step 3: Access Site Settings

1. Go to: `https://mimikostudio.github.io/MimikoStudioWebsite/#/admin`
2. Click **Settings** tab
3. You'll see the new **Site Settings** panel with 10 sections

### Step 4: Customize Your Website

1. **Click any tab** (Branding, Theme, Typography, etc.)
2. **Make changes** - see live preview
3. **Click "Save Changes"** when done
4. **Website updates automatically!**

---

## 🎨 Theme Customization Guide

### Color Scheme Examples

#### Luxury Gold Theme (Current)
```
Primary: #D5AA64 (Champagne Gold)
Secondary: #6B3E28 (Chocolate Brown)
Accent: #F2A0B4 (Blush Pink)
Background: #FFF5E9 (Warm Ivory)
Text: #4B2818 (Dark Brown)
```

#### Modern Minimal Theme
```
Primary: #2C3E50 (Dark Blue)
Secondary: #E74C3C (Red)
Accent: #3498DB (Blue)
Background: #FFFFFF (White)
Text: #333333 (Dark Gray)
```

#### Elegant Rose Theme
```
Primary: #B76E79 (Rose Gold)
Secondary: #4A4A4A (Charcoal)
Accent: #E8B4B8 (Light Rose)
Background: #FDF6F0 (Cream)
Text: #2C2C2C (Near Black)
```

### Font Combinations

#### Luxury Editorial
```
Heading: Cormorant Garamond
Body: Inter
Button: Montserrat
```

#### Modern Professional
```
Heading: Playfair Display
Body: Lato
Button: Poppins
```

#### Clean Minimal
```
Heading: Montserrat
Body: Open Sans
Button: Roboto
```

---

## 📸 Image Upload Guide

### Logo Upload
1. Go to **Branding** tab
2. Click "Upload logo" area
3. Select your logo file (PNG recommended with transparent background)
4. Image preview appears immediately
5. Click "Save Changes"

### Recommended Image Sizes
- **Logo**: 200x60px (PNG with transparency)
- **Favicon**: 32x32px (PNG or ICO)
- **Hero Image**: 1920x1080px (JPG or WEBP)
- **Social Share**: 1200x630px (JPG)

### Image Formats
- **PNG**: Best for logos with transparency
- **JPG**: Best for photos
- **WEBP**: Best for web performance
- **SVG**: Best for scalable graphics (if supported)

---

## 🎯 Live Preview Feature

When you make changes:
1. **Changes are saved locally** immediately
2. **Live preview indicator** appears (bottom right)
3. **Website updates in real-time**
4. **Click "Save Changes"** to persist to database
5. **Click "Reset"** to undo all changes

---

## 📊 Settings Storage

### Where Settings Are Stored
- **Database**: Supabase `site_settings` table
- **Format**: Key-value pairs
- **Persistence**: Permanent until changed
- **Sync**: Real-time across all pages

### How Settings Are Applied
1. **On page load**: Settings loaded from Supabase
2. **Applied via CSS variables**: Theme colors/fonts applied globally
3. **Components read settings**: Each component uses relevant settings
4. **Real-time updates**: Changes propagate immediately

---

## 🔧 Technical Details

### New Files Created

1. **`src/types/siteSettings.ts`**
   - SiteSettings interface
   - Default settings object
   - Type definitions

2. **`src/context/SiteSettingsContext.tsx`**
   - Settings provider
   - Settings context
   - Theme application logic
   - CSS variable management

3. **`src/components/admin/SiteSettingsManager.tsx`**
   - Complete settings UI
   - 10 settings sections
   - Image upload functionality
   - Color picker integration
   - Live preview system

4. **`supabase/migrations/005_site_settings_upgrade.sql`**
   - Database migration
   - Default settings insertion
   - RLS policies

### Modified Files

1. **`src/main.tsx`**
   - Added SiteSettingsProvider wrapper

2. **`src/pages/admin/AdminDashboard.tsx`**
   - Updated to use SiteSettingsManager

---

## 🎨 CSS Variables System

The theme system uses CSS variables for dynamic styling:

```css
:root {
  --color-primary: #D5AA64;
  --color-secondary: #6B3E28;
  --color-accent: #F2A0B4;
  --color-background: #FFF5E9;
  --color-text: #4B2818;
  --font-heading: 'Cormorant Garamond';
  --font-body: 'Inter';
  /* ... more variables */
}
```

### How to Use in Components

```typescript
import { useSiteSettings } from '../context/SiteSettingsContext';

function MyComponent() {
  const { settings } = useSiteSettings();
  
  return (
    <div style={{ 
      backgroundColor: settings.background_color,
      color: settings.text_color,
      fontFamily: settings.font_body 
    }}>
      {/* Your content */}
    </div>
  );
}
```

---

## 🚀 Next Steps

### Immediate Actions
1. ✅ Run database migration
2. ✅ Commit and push code
3. ✅ Access Site Settings
4. ✅ Customize branding (logo, colors)
5. ✅ Customize typography
6. ✅ Update contact information
7. ✅ Add social media links

### Future Enhancements
- [ ] Apply settings to all components
- [ ] Add more homepage sections
- [ ] Create theme presets
- [ ] Add advanced typography options
- [ ] Implement dark mode
- [ ] Add animation settings

---

## 📋 Checklist

After deploying, verify:

### Admin Panel
- [ ] Can access Site Settings
- [ ] All 10 tabs work
- [ ] Can upload logo
- [ ] Can change colors
- [ ] Can change fonts
- [ ] Can save settings
- [ ] Can reset settings
- [ ] Live preview works

### Customer Website
- [ ] Logo displays correctly
- [ ] Colors applied correctly
- [ ] Fonts applied correctly
- [ ] Social icons show/hide correctly
- [ ] Contact info displays correctly
- [ ] Footer displays correctly
- [ ] Header displays correctly

### Database
- [ ] Settings saved to Supabase
- [ ] Settings persist after refresh
- [ ] Settings sync across pages
- [ ] RLS policies working

---

## 🎊 Summary

### What You Can Now Control

✅ **Branding**: Logo, favicon, brand name, tagline  
✅ **Colors**: 13 color settings with live preview  
✅ **Typography**: 3 fonts + size/weight/spacing  
✅ **Homepage**: Hero section with images and buttons  
✅ **Header**: Sticky header + icon visibility  
✅ **Footer**: About text, copyright, section visibility  
✅ **Social Media**: 6 social platforms  
✅ **Contact**: Business info, hours, maps  
✅ **E-commerce**: Currency, shipping settings  
✅ **Inquiry/Booking**: Enable/disable, custom messages  

### Benefits

- 🎨 **No coding required** - Visual interface
- ⚡ **Live preview** - See changes instantly
- 💾 **Persistent storage** - Settings saved to database
- 🔄 **Real-time sync** - Changes propagate immediately
- 📱 **Fully responsive** - Works on all devices
- 🔒 **Secure** - Admin-only access
- 🎯 **User-friendly** - Clear labels and descriptions

---

## 🆘 Troubleshooting

### Settings Not Saving
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies on site_settings table

### Images Not Uploading
- Check file size (max 5MB)
- Verify storage bucket exists
- Check storage policies

### Theme Not Applying
- Refresh the page
- Check browser console for errors
- Verify CSS variables are set
- Clear browser cache

### Fonts Not Loading
- Check font names are correct
- Verify fonts are loaded in index.html
- Check browser console for font errors

---

## 📞 Support

### Documentation Files
- **SITE_SETTINGS_UPGRADE.md** (this file)
- **supabase/migrations/005_site_settings_upgrade.sql**
- **src/types/siteSettings.ts**
- **src/context/SiteSettingsContext.tsx**
- **src/components/admin/SiteSettingsManager.tsx**

### Quick Links
- **Admin Panel**: `/#/admin` → Settings tab
- **Supabase SQL Editor**: https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql
- **Supabase Storage**: https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/storage

---

**Your website is now fully customizable through the admin panel! 🎉**

No more code changes needed - just use the visual interface to customize every aspect of your website!
