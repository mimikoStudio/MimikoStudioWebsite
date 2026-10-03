# Mimiko Studio | Fabric Art

A premium, luxury-inspired website for Mimiko Studio — a handmade fabric painting and customized art brand.

**Tagline:** Paint ♥ Create ♥ Be You

## 🌟 Features

- **Luxury Jewellery-Inspired Design** — Elegant champagne gold, ivory, and espresso color palette
- **Product Catalog** — Full product management with categories, filtering, and search
- **Custom Creation Studio** — Interactive form for personalized fabric art requests
- **Appointment Booking** — Schedule consultations with time slot management
- **Admin Dashboard** — Real-time management of products, inquiries, and appointments
- **Supabase Backend** — PostgreSQL database with Row Level Security
- **Real-Time Updates** — Live synchronization via Supabase Realtime
- **WhatsApp Integration** — Direct customer communication throughout the site
- **GitHub Pages Deployment** — Automated CI/CD with GitHub Actions
- **Responsive Design** — Beautiful experience on all devices

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Icons:** Lucide React
- **Forms:** React Hook Form, Zod validation
- **Deployment:** GitHub Pages, GitHub Actions

## 📋 Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier works)
- A GitHub account for deployment

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd mimiko-studio
npm install
```

### 2. Configure Supabase

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project dashboard: **Settings → API**

### 3. Set Up Database

1. Go to your Supabase dashboard → **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL
4. Verify tables in the **Table Editor**

### 4. Create Storage Buckets

In Supabase → **Storage**, create:
- `product-images` (public)
- `gallery-images` (public)
- `inquiry-references` (private)
- `customer-uploads` (private)

### 5. Create Admin User

1. Go to **Authentication → Users** in Supabase
2. Add a new user with your email and password
3. In the `profiles` table, set the user's `role` to `admin`

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🌐 GitHub Pages Deployment

### Repository Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon/public key

### Deploy

Push to the `main` branch. GitHub Actions will automatically:
1. Install dependencies
2. Run TypeScript checks
3. Build the production site
4. Deploy to GitHub Pages

### Configure GitHub Pages

1. Go to **Settings → Pages**
2. Set Source to **GitHub Actions**
3. The site will be available at `https://<username>.github.io/<repo-name>/`

## 📁 Project Structure

```
├── .github/workflows/     # GitHub Actions CI/CD
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── WhatsAppButton.tsx
│   ├── context/           # React context providers
│   │   └── CartContext.tsx
│   ├── lib/               # Utility functions
│   │   └── supabase.ts
│   ├── pages/             # Page components
│   │   ├── Home.tsx
│   │   ├── Collections.tsx
│   │   ├── Shop.tsx
│   │   ├── CustomCreations.tsx
│   │   ├── BookAppointment.tsx
│   │   ├── OurStory.tsx
│   │   ├── Gallery.tsx
│   │   ├── Contact.tsx
│   │   ├── SetupGuide.tsx
│   │   └── admin/
│   │       ├── AdminLogin.tsx
│   │       └── AdminDashboard.tsx
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main app with routing
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── supabase/
│   └── migrations/        # Database schema
│       └── 001_initial_schema.sql
├── index.html
├── package.json
└── vite.config.js
```

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- Public users can only view published products and active categories
- Customers can only access their own data
- Admin operations require authenticated admin role
- Service role key is never exposed in frontend code
- Role escalation prevention via database triggers
- Private customer uploads protected with signed URLs

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `#/` | Luxury hero, collections, features |
| Collections | `#/collections` | Category browsing |
| Shop | `#/shop` | Product catalog with filters |
| Custom Creations | `#/custom-creations` | Personalized order form |
| Book Appointment | `#/book-appointment` | Consultation scheduling |
| Our Story | `#/our-story` | Brand narrative |
| Gallery | `#/gallery` | Portfolio showcase |
| Contact | `#/contact` | Contact form & info |
| Admin Login | `#/admin/login` | Admin authentication |
| Admin Dashboard | `#/admin` | Management panel |
| Setup Guide | `#/setup` | Configuration instructions |

## 🎨 Design System

Inspired by the Mimiko Studio logo's warm, artisanal palette:

- **Primary:** Champagne Gold (#D5AA64), Dark Chocolate (#4B2818)
- **Backgrounds:** Warm Ivory (#FFF5E9), Soft Cream (#F9EBDD)
- **Accents:** Blush Pink (#F2A0B4), Pastel Blue (#79B8E8), Sage Green (#82986C)
- **Wood tones:** Natural Wood (#D9A46F), Light Beige (#EAC69C)
- **Typography:** Cormorant Garamond (headings), Inter (body), Montserrat (labels)
- **Icons:** Emoji-based icon system for friendly, creative feel

## 📞 Contact

- **WhatsApp:** +91 7874291924
- **Instagram:** [@mimiko.studio24](https://www.instagram.com/mimiko.studio24/)

## 📄 License

© 2024 Mimiko Studio | Fabric Art. All rights reserved.
