# Mekfidel CMS Setup Guide

This guide explains how to set up and use the Content Management System (CMS) for the Mekfidel website.

## Overview

The CMS allows you to manage all editable content on the website through an intuitive admin interface. No coding required!

## Database Setup

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase_sql_editor.sql`
4. Paste and execute the SQL

### Option 2: Migration File

1. Navigate to your Supabase project's **Database** section
2. Go to **Migration Manager**
3. Copy the contents of `sql/cms_migration.sql`
4. Create a new migration and paste the SQL

## Admin Access

### Logging In

1. Navigate to `/auth/login`
2. Enter your credentials
3. If you don't have an account, contact your administrator

### Required Role

To access CMS features, you need one of these roles:
- **admin** - Full access to all CMS features
- **editor** - Can edit content but cannot manage users or settings

## CMS Features

### 1. Homepage Management (`/admin/homepage`)

Manage the homepage content:

- **Sections**: Hero, features grid, CTA, stats
- **Feature Cards**: Individual cards with icon, title, description
- **Statistics**: Counter values with labels and icons

#### Creating a New Section

1. Go to **Homepage CMS** → **Sections** tab
2. Click **Add Section**
3. Fill in the details:
   - **Section Key**: Unique identifier (e.g., `promo_1`)
   - **Type**: Section type (hero, features_grid, cta, etc.)
   - **Title**: Section heading
   - **Subtitle**: Section subtitle
   - **Description**: Optional description text
   - **Button Text/URL**: CTA button configuration
4. Click **Create Section**

#### Adding Feature Cards

1. Go to **Homepage CMS** → **Feature Cards** tab
2. Click **Add Feature**
3. Select the parent section
4. Fill in the details:
   - **Title**: Feature name
   - **Description**: Feature description
   - **Icon**: Select from Lucide icon library
   - **Icon Color**: Choose color theme
5. Click **Create Feature**

### 2. Navigation Management (`/admin/navigation`)

Manage header and footer navigation:

#### Adding Navigation Items

1. Go to **Navigation**
2. Click **Add Navigation Item**
3. Configure:
   - **Location**: header, footer_main, footer_categories, mobile
   - **Label**: Display text
   - **URL**: Link destination
   - **Icon** (optional): Icon from library
   - **Sort Order**: Position in menu
   - **New Tab**: Open in new window option

#### Reordering Items

Use the arrow buttons to move items up or down within their location group.

### 3. Footer Management (`/admin/footer`)

#### Sections Tab

Manage footer columns:

1. Click **Add Section**
2. Configure:
   - **Section Key**: Unique identifier
   - **Title**: Column heading
   - **Quick Links**: Add links that appear in this column

#### Social Links Tab

Manage social media links:

1. Click **Add Social Link**
2. Select platform (Facebook, Instagram, Twitter, etc.)
3. Enter URL
4. Configure visibility and order

### 4. Icons Management (`/admin/icons`)

#### Browse Tab

Browse available Lucide icons:
- Search by name
- Click to copy icon name to clipboard
- Use icon names in feature cards and other CMS items

#### Uploaded Tab

Upload custom SVG icons:

1. Click **Upload SVG**
2. Enter icon name
3. Paste SVG code
4. Add optional tags
5. Click **Upload Icon**

### 5. Testimonials Management (`/admin/testimonials`)

Add customer testimonials:

1. Click **Add Testimonial**
2. Enter:
   - Customer name
   - Role/Title
   - Company
   - Testimonial content
   - Rating (1-5 stars)
   - Avatar URL (optional)
3. Configure visibility and featured status
4. Use arrows to reorder testimonials

### 6. FAQ Management (`/admin/faqs`)

Manage frequently asked questions:

1. Click **Add FAQ**
2. Enter question and answer
3. Add category (Products, Shipping, Services, etc.)
4. Configure visibility
5. Use arrows to reorder

## Using CMS Content in Code

### Fetching Data

```typescript
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Homepage sections
const { data } = useQuery({
  queryKey: ['homepage-sections'],
  queryFn: async () => {
    const { data } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    return data;
  },
});

// Feature cards
const { data: features } = useQuery({
  queryKey: ['feature-cards'],
  queryFn: async () => {
    const { data } = await supabase
      .from('feature_cards')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    return data;
  },
});

// Navigation
const { data: navItems } = useQuery({
  queryKey: ['navigation'],
  queryFn: async () => {
    const { data } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('is_active', true)
      .eq('location', 'header')
      .order('sort_order');
    return data;
  },
});
```

### Using Icons

```typescript
import { SimpleIcon } from '@/components/ui/icon-renderer';

// Lucide icon
<SimpleIcon name="Shield" size={24} />

// With custom color
<SimpleIcon name="Truck" size={24} className="text-blue-600" />
```

## Icon System

### Supported Libraries
- **Lucide** (default): Built-in icon library
- **Heroicons**: Available but requires additional setup
- **Tabler**: Available but requires additional setup
- **Uploaded**: Custom SVG icons uploaded via admin

### Icon Naming Convention

Icons are stored by their library name in the database:
```json
{
  "icon_library": "lucide",
  "icon_name": "Shield"
}
```

## Storage Buckets

The following storage buckets are created:
- `logos` - Company and brand logos
- `products` - Product images
- `banners` - Homepage banners
- `gallery` - Image gallery
- `blog` - Blog post images
- `icons` - Custom SVG icons
- `uploads` - General file uploads

## Security

### Row Level Security (RLS)

All CMS tables have RLS enabled:
- **Public read**: Anyone can view active content
- **Admin full access**: Only admin/editor roles can modify

### Best Practices

1. **Use strong passwords** for admin accounts
2. **Limit editor access** to trusted users only
3. **Regular backups** of database recommended
4. **Review changes** in Supabase logs

## Troubleshooting

### Content Not Appearing

1. Check `is_active` is `true` in the database
2. Verify `sort_order` is set correctly
3. Check RLS policies in Supabase

### Icon Not Displaying

1. Verify icon name is correct (case-sensitive)
2. Check icon library is set to `lucide` (or appropriate library)
3. For uploaded icons, verify SVG content is valid

### Upload Fails

1. Check file size limits
2. Verify allowed mime types
3. Check storage bucket permissions

## Support

For issues or questions:
- Check Supabase dashboard logs
- Review browser console errors
- Contact the development team
