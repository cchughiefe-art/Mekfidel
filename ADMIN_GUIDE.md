# Mekfidel Admin Guide

A comprehensive guide to using all admin features for managing the Mekfidel Communication Ltd website.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Products Management](#products-management)
4. [Categories Management](#categories-management)
5. [Brands Management](#brands-management)
6. [Orders Management](#orders-management)
7. [Customers](#customers)
8. [Blog](#blog)
9. [Services](#services)
10. [Media Library](#media-library)
11. [Content Management System (CMS)](#content-management-system-cms)
    - [Homepage CMS](#homepage-cms)
    - [Navigation CMS](#navigation-cms)
    - [Footer CMS](#footer-cms)
    - [Icons Library](#icons-library)
    - [Testimonials](#testimonials)
    - [FAQs](#faqs)
12. [Settings](#settings)
13. [SEO](#seo)
14. [Users & Roles](#users--roles)
15. [Phone Screen Compatibility](#phone-screen-compatibility)

---

## Getting Started

### Accessing the Admin Panel

1. Navigate to `/auth/login`
2. Enter your admin credentials
3. You'll be redirected to `/admin/dashboard`

### Admin Sidebar Navigation

The admin sidebar provides access to all features:

**Desktop View:**
- Fixed sidebar on the left side
- Hover over items to see full names

**Mobile View:**
- Tap the hamburger menu icon (☰) in the top header
- Sidebar slides out as a drawer
- Tap outside or select a menu item to close

---

## Dashboard

**URL:** `/admin/dashboard`

The dashboard provides an overview of your store's performance.

### Available Widgets

| Widget | Description |
|--------|-------------|
| **Total Products** | Count of all active products |
| **Total Orders** | Count of all orders |
| **Pending Orders** | Orders awaiting processing |
| **Total Customers** | Count of registered customers |

### Recent Activity

- Shows the latest 5 orders
- Displays order status, customer name, and total amount
- Click an order to view details

---

## Products Management

**URL:** `/admin/products`

### Viewing Products

The products table displays:
- Product image thumbnail
- Product name
- Category
- Price
- Stock status
- Active/Inactive status

### Creating a New Product

1. Click **+ Add Product** button
2. Fill in the product details:

| Field | Description | Required |
|-------|-------------|----------|
| Name | Product title | Yes |
| Slug | URL-friendly version (auto-generated) | Auto |
| Description | Detailed product description | Yes |
| Price | Product price (₦) | Yes |
| Compare Price | Original price for discounts | No |
| SKU | Stock keeping unit | Yes |
| Category | Product category | Yes |
| Brand | Product brand | No |
| Stock | Available quantity | Yes |
| Warranty | Warranty information | No |
| Availability | in_stock, out_of_stock, pre_order | Yes |

3. **Images Tab:** Upload product images (up to 10)
4. **Features Tab:** Add bullet points for key features
5. **Specifications Tab:** Add key-value specifications (JSON format)
6. **SEO Tab:** Add meta title and description
7. Click **Create Product**

### Editing a Product

1. Click the **Edit** (pencil) icon on any product row
2. Modify the desired fields
3. Click **Update Product**

### Toggling Product Status

- Click the **eye icon** to toggle between Active/Inactive
- Inactive products won't appear on the public website

### Deleting a Product

1. Click the **trash icon** on the product row
2. Confirm deletion in the popup dialog

### Searching & Filtering

- Use the **search bar** to find products by name
- Use **category filter** dropdown to filter by category
- Use **status filter** to show Active/Inactive/All

---

## Categories Management

**URL:** `/admin/categories`

### Creating a Category

1. Click **+ Add Category**
2. Fill in:

| Field | Description |
|-------|-------------|
| Name | Category name (e.g., "Mobile Phones") |
| Slug | URL-friendly version (auto-generated) |
| Description | Optional description |
| Parent Category | For subcategories, select a parent |
| Order | Sort order number |
| Image | Optional category image |

3. Click **Create Category**

### Editing/Deleting

- Click **Edit** to modify a category
- Click **Delete** to remove (only if no products use it)

### Hierarchical Categories

Categories support parent-child relationships:
- Select a **Parent Category** when creating subcategories
- Products can belong to any level of the hierarchy

---

## Brands Management

**URL:** `/admin/brands`

### Creating a Brand

1. Click **+ Add Brand**
2. Fill in:

| Field | Description |
|-------|-------------|
| Name | Brand name (e.g., "Samsung") |
| Slug | URL-friendly version |
| Logo | Brand logo image |
| Description | Optional description |

3. Click **Create Brand**

---

## Orders Management

**URL:** `/admin/orders`

### Viewing Orders

The orders table displays:
- Order ID
- Customer name
- Status (pending, confirmed, processing, ready, delivered, cancelled)
- Total amount
- Date created

### Order Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Just placed, awaiting confirmation |
| `confirmed` | Order confirmed, preparing |
| `processing` | Being prepared/packaged |
| `ready` | Ready for delivery/pickup |
| `delivered` | Successfully delivered |
| `cancelled` | Order cancelled |

### Updating Order Status

1. Click on an order row to view details
2. Use the **Status** dropdown to change status
3. The customer will see the updated status

### Order Details

Click any order to see:
- Customer information (name, phone, email, address)
- Order items with quantities and prices
- Order notes
- Delivery details (state, city)
- Status history

### Filtering Orders

- Use the **search bar** to find orders by ID or customer name
- Use **status filter** to show specific statuses
- Use **date filter** to show orders from a specific period

---

## Customers

**URL:** `/admin/customers`

### Viewing Customers

Displays:
- Customer name
- Email
- Phone
- Total orders count
- Total spent

### Customer Details

Click on a customer to see:
- Contact information
- Address details
- Complete order history
- Total spending

---

## Blog

**URL:** `/admin/blog`

### Creating a Blog Post

1. Click **+ Add Post**
2. Fill in:

| Field | Description |
|-------|-------------|
| Title | Post headline |
| Slug | URL-friendly version (auto-generated) |
| Excerpt | Short summary (shown in listings) |
| Content | Full post content (supports markdown) |
| Category | Blog category |
| Tags | Comma-separated tags |
| Author | Post author name |
| Image | Featured image |

3. Toggle **Published** to make it live
4. Click **Create Post**

### Managing Posts

- **Edit:** Modify any post
- **Delete:** Remove a post (confirmation required)
- **Toggle Visibility:** Use eye icon to publish/unpublish

---

## Services

**URL:** `/admin/services`

### Service Card Fields

| Field | Description |
|-------|-------------|
| Title | Service name |
| Description | Detailed description |
| Icon | Lucide icon name |
| Color | Color class (e.g., blue, green, red) |
| Features | List of service features |
| Order | Display order |

### Creating a Service

1. Click **+ Add Service**
2. Fill in the service details
3. Add features as comma-separated values
4. Select icon and color
5. Click **Create Service**

---

## Media Library

**URL:** `/admin/media`

### Uploading Images

1. Click **Upload** button
2. Drag and drop files or click to browse
3. Supported formats: PNG, JPG, JPEG, WebP, SVG
4. Max file size: 10MB

### Managing Files

- **Copy URL:** Click to copy the public URL
- **Delete:** Remove files (confirmation required)

### Storage Buckets

| Bucket | Purpose | Max Size |
|--------|---------|----------|
| `logos` | Brand and company logos | 2MB |
| `products` | Product images | 10MB |
| `banners` | Homepage banners | 5MB |
| `gallery` | General gallery images | 10MB |
| `blog` | Blog post images | 5MB |
| `icons` | SVG icons | 100KB |
| `uploads` | General uploads | 10MB |

---

## Content Management System (CMS)

The CMS allows you to manage all website content without coding.

### Homepage CMS

**URL:** `/admin/homepage`

Manage all homepage sections including hero, features, statistics, and CTA.

#### Sections Tab

Manage page sections:

| Section Key | Description |
|------------|-------------|
| `hero` | Hero banner at the top |
| `about_intro` | "Why Choose Us" features section |
| `cta` | Call-to-action section |
| `stats` | Statistics/counters section |

**Creating a Section:**
1. Click **+ Add Section**
2. Enter **Section Key** (unique identifier)
3. Select **Type** (hero, features_grid, cta, stats, etc.)
4. Add **Title**, **Subtitle**, **Description**
5. Configure **Button Text** and **URL**
6. Set **Sort Order** and **Status**
7. Click **Create Section**

#### Feature Cards Tab

Individual feature cards displayed in sections.

**Creating a Feature Card:**
1. Select the **Parent Section** (e.g., about_intro)
2. Enter **Title** (e.g., "Fast Delivery")
3. Enter **Description**
4. Select an **Icon** from the dropdown
5. Choose an **Icon Color**
6. Preview the feature card
7. Click **Create Feature**

#### Statistics Tab

Counter numbers displayed on the homepage.

**Creating a Statistic:**
1. Enter **Label** (e.g., "Happy Customers")
2. Enter **Value** (e.g., "5000")
3. Enter **Suffix** (e.g., "+")
4. Select an **Icon**
5. Set **Sort Order**
6. Click **Create Statistic**

---

### Navigation CMS

**URL:** `/admin/navigation`

Manage header, footer, and mobile navigation menus.

#### Navigation Locations

| Location | Where it appears |
|----------|------------------|
| `header` | Top navigation bar |
| `footer_main` | Main footer links |
| `footer_categories` | Footer product categories |
| `mobile` | Mobile hamburger menu |

#### Creating a Navigation Item

1. Click **+ Add Navigation Item**
2. Select **Location** (header, footer_main, etc.)
3. Enter **Label** (display text)
4. Enter **URL** (e.g., `/products`)
5. Optionally select an **Icon**
6. Set **Sort Order** (controls position)
7. Toggle **Open in New Tab** if needed
8. Click **Create**

#### Reordering Items

Use the **arrow buttons** (↑ ↓) to reorder items within the same location.

---

### Footer CMS

**URL:** `/admin/footer`

#### Sections Tab

Manage footer columns.

**Creating a Footer Section:**
1. Click **+ Add Section**
2. Enter **Section Key** (unique, e.g., "company")
3. Enter **Title** (column heading)
4. Optionally add **Content** text
5. Add **Quick Links:**
   - Click **Add** after entering Label and URL
   - Repeat to add multiple links
6. Set **Sort Order**
7. Click **Create Section**

#### Social Links Tab

Manage social media links.

**Creating a Social Link:**
1. Click **+ Add Social Link**
2. Select **Platform** (Facebook, Instagram, Twitter, etc.)
3. Enter **Label** (e.g., "Follow us on Facebook")
4. Enter **URL** (full social media profile URL)
5. Set **Sort Order**
6. Toggle **Visible** to show/hide
7. Click **Create**

---

### Icons Library

**URL:** `/admin/icons`

#### Browse Tab

Browse available Lucide icons:

1. Use the **search bar** to find icons by name
2. Click any icon to copy its name to clipboard
3. Use the copied name in CMS feature cards

#### Uploaded Tab

Manage custom SVG icons.

**Uploading a Custom Icon:**
1. Click **Upload SVG**
2. Enter **Icon Name** (e.g., "Custom Logo")
3. Paste the **SVG Content** (full `<svg>...</svg>` code)
4. Add **Tags** (comma-separated, e.g., "logo, brand")
5. Preview the icon
6. Click **Upload Icon**

**Icon Usage:**
- Custom icons are stored with a slug (URL-friendly name)
- Reference them in code using the `uploaded` library type

---

### Testimonials

**URL:** `/admin/testimonials`

#### Creating a Testimonial

1. Click **+ Add Testimonial**
2. Fill in:

| Field | Description |
|-------|-------------|
| Customer Name | Reviewer's name |
| Role/Title | Their job title |
| Company | Company name (optional) |
| Content | The testimonial text |
| Rating | 1-5 stars |
| Avatar URL | Profile image URL (optional) |

3. Toggle **Published** to show on website
4. Toggle **Featured** to highlight
5. Set **Sort Order**
6. Click **Create Testimonial**

#### Reordering

Use arrows to change display order.

---

### FAQs

**URL:** `/admin/faqs`

#### Creating an FAQ

1. Click **+ Add FAQ**
2. Fill in:

| Field | Description |
|-------|-------------|
| Question | The FAQ question |
| Answer | Detailed answer |
| Category | Category name (e.g., "Products", "Shipping") |
| Sort Order | Display order |

3. Toggle **Published**
4. Click **Create FAQ**

#### Categories

Categories help organize FAQs:
- Type an existing category name to group
- Type a new name to create a category
- Use the category filter on the page to show specific FAQs

---

## Settings

**URL:** `/admin/settings`

### Company Information

| Field | Description |
|-------|-------------|
| Company Name | Business name |
| Phone | Main contact number |
| WhatsApp | WhatsApp number (without +) |
| Email | Contact email |
| Address | Physical address |
| Business Hours | Operating hours |

### Social Media

| Platform | Field |
|----------|-------|
| Facebook | Facebook page URL |
| Instagram | Instagram profile URL |
| Twitter | Twitter/X profile URL |
| LinkedIn | LinkedIn page URL |
| YouTube | YouTube channel URL |
| TikTok | TikTok profile URL |

### Homepage Content

| Field | Description |
|-------|-------------|
| Hero Title | Homepage hero headline |
| Hero Subtitle | Homepage hero subtitle |
| About Text | About section content |
| Footer Text | Footer tagline |

### Google Maps

Paste your Google Maps embed code in the Google Maps Embed field.

---

## SEO

**URL:** `/admin/seo`

### Meta Settings

| Field | Description |
|-------|-------------|
| SEO Title | Browser tab title |
| SEO Description | Meta description for search engines |
| Keywords | Comma-separated keywords |

These settings are used throughout the site for search engine optimization.

---

## Users & Roles

**URL:** `/admin/users`

### Admin Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access to everything |
| `editor` | Can manage products, blog, orders |
| `viewer` | Read-only access |

### Creating an Admin User

1. The user must first register at `/auth/register`
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'user@example.com';
   ```
3. The user will have admin access on next login

### Changing User Roles

1. Find the user in the table
2. Click the **role dropdown**
3. Select a new role
4. The change takes effect immediately

---

## Phone Screen Compatibility

**URL:** `/admin/compatibility`

A database for finding compatible replacement screens.

### Adding Compatibility Data

1. Click **+ Add Compatibility**
2. Fill in:

| Field | Description |
|-------|-------------|
| Brand | Phone brand (e.g., "Samsung") |
| Model | Phone model (e.g., "Galaxy S21") |
| Series | Series name (optional) |
| Screen Code | Part number/code |
| Manufacturer Model | Manufacturer's model number |
| Compatible With | Array of compatible screen types |
| Notes | Additional information |

3. Click **Create**

### Search Usage

Customers use this database at `/phone-screen-compatibility`:
1. Select brand
2. Select model
3. View compatible screens

---

## Quick Reference

### Common Tasks

| Task | How to Do |
|------|-----------|
| Add a new product | Products → + Add Product |
| Update homepage | Homepage CMS → Edit sections |
| Change navigation | Navigation CMS → Add/Edit items |
| Add a testimonial | Testimonials → + Add Testimonial |
| Manage FAQs | FAQs → + Add FAQ |
| Upload images | Media → Upload |
| Update company info | Settings → Edit fields |
| View orders | Orders → Click order row |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click outside modal | Close modal |
| Escape key | Close modal |
| Enter key (in forms) | Submit form |

### Tips & Best Practices

1. **Always preview** before publishing content
2. **Use categories** to organize products and FAQs
3. **Keep descriptions concise** for better readability
4. **Update stock levels** regularly to avoid overselling
5. **Monitor orders** and respond quickly to pending orders
6. **Use featured products** to highlight popular items
7. **Add high-quality images** for products (optimized for web)

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't access admin | Verify your role is `admin` in profiles table |
| Images not uploading | Check Supabase Storage bucket permissions |
| Changes not showing | Clear browser cache or check RLS policies |
| Order status not updating | Check Supabase connection |

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase dashboard for any alerts
3. Review the browser's network tab for failed requests

---

## Support

For additional help, contact the development team or refer to:
- [CMS Setup Guide](./CMS_SETUP.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [GitHub Issues](https://github.com/cchughiefe-art/Mekfidel/issues)
