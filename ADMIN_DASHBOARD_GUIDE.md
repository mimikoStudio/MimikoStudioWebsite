# 🎨 Complete Admin Dashboard Guide

## Overview

Your Mimiko Studio admin dashboard is a fully functional management system with real-time Supabase integration. You can manage products, categories, inquiries, appointments, and site settings all from one place.

## 🚀 Accessing the Admin Dashboard

### Login URL
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/#/admin/login
```

### First-Time Setup

1. **Create Admin User in Supabase**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User" → "Create New User"
   - Enter your email and password
   - Click "Create User"

2. **Set Admin Role**
   - Go to Supabase → Table Editor → `profiles` table
   - Find your user row
   - Change `role` from `customer` to `admin`
   - Save changes

3. **Login**
   - Navigate to the admin login page
   - Enter your email and password
   - You'll be redirected to the dashboard

---

## 📊 Dashboard Sections

### 1. Overview (📊)

The main dashboard shows:
- **Total Products**: Number of products in your catalog
- **Active Inquiries**: Pending customer inquiries
- **Pending Appointments**: Upcoming appointment requests
- **Total Orders**: Order count (when orders table is populated)

**Recent Activity**:
- Latest 5 inquiries with status
- Upcoming 5 appointments
- Recent 5 products

---

### 2. Products Management (🛍️)

#### Features:
- ✅ Add new products
- ✅ Edit existing products
- ✅ Delete products
- ✅ Search products
- ✅ Filter by category
- ✅ Bulk actions

#### Adding a Product:

1. Click "Add Product" button
2. Fill in the form:
   - **Product Name**: Display name
   - **Slug**: URL-friendly name (auto-generated if empty)
   - **Description**: Product details
   - **Price**: Regular price in INR
   - **Sale Price**: Discounted price (optional)
   - **Stock Quantity**: Available inventory
   - **Category**: Select from dropdown
   - **Material**: Fabric type
   - **Sizes**: Comma-separated (e.g., "S, M, L, XL")
   - **Colors**: Comma-separated (e.g., "Red, Blue, Green")
   - **Customization Available**: Checkbox
   - **Featured Product**: Show on homepage
   - **New Arrival**: Mark as new
   - **Published**: Make visible to customers

3. Click "Create Product"

#### Editing a Product:
1. Find the product in the list
2. Click the edit icon (✏️)
3. Modify fields
4. Click "Update Product"

#### Deleting a Product:
1. Find the product in the list
2. Click the delete icon (🗑️)
3. Confirm deletion

---

### 3. Categories Management (🗂️)

#### Features:
- ✅ Add new categories
- ✅ Edit categories
- ✅ Delete categories
- ✅ Set display order
- ✅ Activate/deactivate categories

#### Adding a Category:

1. Click "Add Category" button
2. Fill in:
   - **Category Name**: Display name (e.g., "Hand-Painted Clothing")
   - **Slug**: URL-friendly name (auto-generated)
   - **Description**: Category description
   - **Image URL**: Category image (optional)
   - **Display Order**: Sorting priority (lower = first)
   - **Active**: Show on website

3. Click "Create Category"

#### Default Categories:
- Hand-Painted Clothing
- Designer Bags
- Home Decor
- Fashion Accessories
- Personalized Gifts
- Small Handmade Creations

---

### 4. Inquiries Management (💌)

#### Features:
- ✅ View all customer inquiries
- ✅ Filter by status
- ✅ Search by name/reference
- ✅ Update inquiry status
- ✅ Contact customers via WhatsApp
- ✅ View detailed inquiry information

#### Inquiry Statuses:

| Status | Description | Action |
|--------|-------------|--------|
| `new` | New inquiry received | Review details |
| `under_review` | Currently reviewing | Prepare quotation |
| `quotation_sent` | Price quote sent | Wait for response |
| `awaiting_customer_response` | Waiting for customer | Follow up |
| `approved` | Customer approved | Start production |
| `in_production` | Being created | Track progress |
| `completed` | Delivered to customer | Archive |
| `rejected` | Declined | Note reason |

#### Managing an Inquiry:

1. **View Details**: Click "View Details" to see full information
2. **Update Status**: 
   - Select new status from dropdown
   - Status updates in real-time
3. **Contact Customer**:
   - Click "WhatsApp" button
   - Pre-filled message with reference number
   - Direct communication

#### Inquiry Details Include:
- Customer name, email, phone
- Product category and type
- Design style and preferences
- Quantity and size requirements
- Budget range
- Preferred completion date
- Custom text/notes
- Reference images (if uploaded)
- Additional instructions

---

### 5. Appointments Management (📅)

#### Features:
- ✅ View all appointments
- ✅ Filter by status
- ✅ List and calendar views
- ✅ Confirm/reject appointments
- ✅ Contact customers
- ✅ Group by date

#### Appointment Statuses:

| Status | Description | Action |
|--------|-------------|--------|
| `requested` | Customer requested | Review and confirm/reject |
| `confirmed` | Approved by admin | Prepare for meeting |
| `rescheduled` | Date changed | Update calendar |
| `completed` | Meeting happened | Archive |
| `cancelled` | Cancelled by either | Note reason |
| `rejected` | Declined by admin | Inform customer |

#### Managing an Appointment:

1. **View Details**: See customer info, date, time, type
2. **Confirm**: Click "Confirm" to approve
3. **Reject**: Click "Reject" to decline
4. **Mark Complete**: After meeting, click "Mark Complete"
5. **Contact**: Use WhatsApp button for communication

#### Appointment Types:
- Custom Design Consultation
- Wedding & Festive Orders
- Bulk Order Discussion
- Product Inquiry
- General Consultation

---

### 6. Settings Management (⚙️)

#### Features:
- ✅ Update site information
- ✅ Configure contact details
- ✅ Set e-commerce preferences
- ✅ Save changes to database

#### Settings Categories:

**General Settings**:
- Site Name: "Mimiko Studio"
- Tagline: "Paint ♥ Create ♥ Be You"

**Contact & Social Media**:
- WhatsApp Number: "+917874291924"
- Instagram Handle: "@mimiko.studio24"
- Instagram URL: Full profile link

**E-commerce Settings**:
- Currency: INR, USD, or EUR
- Shipping Fee: Flat rate
- Free Shipping Minimum: Order threshold

#### Saving Settings:
1. Modify any field
2. Click "Save Settings" button
3. Confirmation message appears
4. Changes apply immediately

---

## 🔔 Real-Time Updates

The admin dashboard uses Supabase Realtime to show live updates:

- ✅ New inquiries appear instantly
- ✅ Appointment requests show immediately
- ✅ Product changes reflect in real-time
- ✅ Status updates sync across devices

No need to refresh the page!

---

## 📱 WhatsApp Integration

All customer communication links open WhatsApp with pre-filled messages:

### Inquiry Contact:
```
Hi [Customer Name]! Regarding your inquiry [Reference Number]...
```

### Appointment Contact:
```
Hi [Customer Name]! Regarding your appointment on [Date]...
```

### Product Inquiry:
```
Hi! I'm interested in: [Product Name] (₹[Price])
```

---

## 🎯 Quick Actions

### Adding Your First Product:
1. Go to Products tab
2. Click "Add Product"
3. Fill in basic info (name, price, category)
4. Check "Published"
5. Click "Create Product"
6. Product appears on website immediately

### Handling First Inquiry:
1. Go to Inquiries tab
2. Click "View Details"
3. Review customer requirements
4. Update status to "under_review"
5. Prepare quotation
6. Update to "quotation_sent"
7. Contact via WhatsApp

### Confirming First Appointment:
1. Go to Appointments tab
2. Find the appointment
3. Review details
4. Click "Confirm"
5. Contact customer via WhatsApp
6. Prepare for meeting

---

## 🛠️ Troubleshooting

### Can't Login?
- Verify email is correct in Supabase
- Check `profiles` table for `role = 'admin'`
- Try resetting password in Supabase

### Products Not Showing?
- Check if products are marked as "Published"
- Verify Supabase connection
- Check browser console for errors

### Inquiries Not Appearing?
- Verify form submissions are working
- Check Supabase `inquiries` table
- Ensure RLS policies allow inserts

### Real-Time Not Working?
- Check browser console for WebSocket errors
- Verify Supabase Realtime is enabled
- Refresh the page

### Settings Not Saving?
- Check Supabase `site_settings` table exists
- Verify RLS policies allow updates
- Check browser console for errors

---

## 📊 Database Tables Used

| Table | Purpose |
|-------|---------|
| `products` | Product catalog |
| `categories` | Product categories |
| `inquiries` | Customer inquiries |
| `appointments` | Booking requests |
| `orders` | Customer orders |
| `profiles` | User accounts |
| `site_settings` | Configuration |

---

## 🔐 Security

- ✅ All admin actions require authentication
- ✅ Only users with `role = 'admin'` can access dashboard
- ✅ Supabase RLS protects all data
- ✅ No sensitive data exposed in frontend
- ✅ Secure password handling via Supabase Auth

---

## 🎨 Best Practices

### Product Management:
- Use high-quality images
- Write detailed descriptions
- Set accurate stock quantities
- Categorize products correctly
- Mark bestsellers as "Featured"

### Inquiry Handling:
- Respond within 24 hours
- Update status regularly
- Keep notes in admin_notes field
- Use WhatsApp for quick communication
- Follow up on pending inquiries

### Appointment Management:
- Confirm appointments promptly
- Send reminders via WhatsApp
- Update status after meetings
- Keep calendar organized
- Block unavailable time slots

### Settings:
- Keep contact info updated
- Review shipping fees periodically
- Update social media links
- Monitor currency settings

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Verify Supabase connection
3. Check RLS policies in Supabase
4. Review this documentation
5. Check Supabase logs for database errors

---

## 🎉 You're Ready!

Your admin dashboard is fully functional and ready to manage your Mimiko Studio business. Start by:

1. Adding your first products
2. Setting up categories
3. Configuring site settings
4. Waiting for customer inquiries
5. Managing appointments

Happy managing! 🎨✨
