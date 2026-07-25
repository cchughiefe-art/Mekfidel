# Mekfidel Communication Ltd

A production-ready e-commerce and business website for **Mekfidel Communication Ltd** — a Nigeria-based mobile phones, accessories, spare parts, and phone repair service provider.

Built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## Tech Stack

| Layer             | Technology                                      |
| ----------------- | ----------------------------------------------- |
| Framework         | Next.js 15 (App Router)                         |
| Language          | TypeScript                                      |
| Styling           | Tailwind CSS v4                                 |
| Database          | Supabase (PostgreSQL)                           |
| Auth              | Supabase Auth                                   |
| Storage           | Supabase Storage (product images, blog media)   |
| State             | Zustand (cart) + React Query (server state)     |
| Forms             | React Hook Form + Zod validation                |
| Animations        | Framer Motion                                   |
| Icons             | Lucide React                                    |
| Notifications     | React Hot Toast                                 |

---

## Project Structure

```
mekfidel-comms/
├── src/
│   ├── app/
│   │   ├── admin/          # Admin dashboard (analytics, products, orders, etc.)
│   │   ├── api/            # API routes (orders, contact, newsletter, search, upload)
│   │   ├── auth/           # Authentication pages (login, forgot/reset password)
│   │   ├── blog/           # Blog listing and detail pages
│   │   ├── cart/           # Shopping cart page
│   │   ├── contact/        # Contact form page
│   │   ├── faq/            # Frequently asked questions
│   │   ├── privacy/        # Privacy policy
│   │   ├── products/       # Product listing and detail pages
│   │   ├── search/         # Search results page
│   │   ├── services/       # Services overview page
│   │   ├── terms/          # Terms of service
│   │   ├── layout.tsx      # Root layout with providers
│   │   ├── not-found.tsx   # Custom 404 page
│   │   ├── page.tsx        # Homepage
│   │   ├── robots.ts       # SEO robots config
│   │   └── sitemap.ts      # Dynamic sitemap
│   ├── components/
│   │   ├── home/           # Homepage section components
│   │   ├── layout/         # Header, Footer, AdminSidebar, CartSidebar, WhatsAppButton
│   │   └── ui/             # Reusable UI components (Button, Input, Modal, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── supabase/       # Supabase clients (client, server, service)
│   │   └── utils/          # Utility functions (cn, format, validators, storage)
│   ├── providers/          # React context providers (Query, Cart, Toast)
│   └── types/              # TypeScript type definitions
├── database.sql            # Full database schema
├── .env.example            # Environment variables template
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

---

## Features

### Public Website
- **Homepage** — Hero banner, about intro, services overview, product categories, featured products, testimonials, CTA, Google Maps embed
- **Products** — Listing with filtering/sorting, detail pages with image gallery, specifications, features
- **Phone Screen Compatibility** — Check which phone screens are compatible with devices
- **Services** — Phone repair and services overview
- **Blog** — Articles with categories, tags, and SEO metadata
- **Contact** — Contact form with Supabase integration
- **FAQ** — Frequently asked questions (admin-managed)
- **Cart** — Shopping cart with checkout
- **Search** — Product search via API route
- **Legal** — Privacy Policy, Terms of Service, Return Policy

### Admin Dashboard
- **Dashboard** — Stats cards, recent orders, revenue charts (placeholder)
- **Products** — CRUD with image gallery, categories, brands, stock management
- **Categories** — Manage product categories (hierarchical)
- **Brands** — Manage phone brands
- **Orders** — View and manage customer orders with status updates
- **Customers** — Customer records with order history
- **Blog** — Create and manage blog posts
- **Media** — Media library with Supabase Storage integration
- **Analytics** — Sales and traffic analytics (placeholder)
- **SEO** — SEO settings management
- **Settings** — Site-wide settings (company info, social media, hero content)
- **Users** — Admin user management with role-based access (admin/editor/viewer)
- **Compatibility** — Manage screen compatibility database

### Backend / Infrastructure
- Supabase database with full schema (tables, indexes, triggers, RLS policies)
- Supabase Storage for media uploads with admin-only write access
- API routes for orders, contact, newsletter, search, and file upload
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection)
- Dynamic sitemap generation for SEO
- robots.txt configuration

---

## Getting Started

### 1. Prerequisites

- Node.js 18+ 
- A Supabase account (free tier works)
- npm, yarn, or pnpm

### 2. Clone & Install

```bash
git clone <your-repo-url> mekfidel-comms
cd mekfidel-comms
npm install
```

### 3. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the entire contents of `database.sql`
3. Enable authentication providers (Email/Password at minimum)
4. Create Storage buckets (run the commented SQL at the bottom of `database.sql` or create via dashboard):
   - `logos` (public)
   - `products` (public)
   - `banners` (public)
   - `gallery` (public)
   - `blog` (public)
   - `icons` (public)
   - `uploads` (public)

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Your Supabase service role key (admin operations)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### 6. Create First Admin User

1. Register at `/auth/login` (a new user link is available on the login page)
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Refresh and access `/admin`

---

## Building for Production

```bash
npm run build
npm start
```

---

## Deployment

### Vercel (Recommended)

1. Push to a GitHub repository
2. Import into Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Hosting

- Build with `npm run build`
- Deploy the `.next/` folder to your hosting provider
- Set up environment variables on your hosting platform

---

## Database Schema Overview

| Table                  | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `products`             | Phone products with pricing, stock, images |
| `categories`           | Product categories (hierarchical)          |
| `brands`               | Phone brands                               |
| `orders`               | Customer orders                            |
| `order_items`          | Individual items within orders             |
| `customers`            | Customer records                           |
| `screen_compatibility` | Phone screen compatibility database        |
| `blog_posts`           | Blog articles                              |
| `faqs`                 | Frequently asked questions                 |
| `testimonials`         | Customer testimonials                      |
| `settings`             | Site-wide settings                         |
| `profiles`             | User profiles (linked to auth.users)       |
| `media`                | Media library tracking                     |

See `database.sql` for the complete schema with indexes, triggers, and Row-Level Security policies.

---

## Admin Roles

| Role     | Permissions                                            |
| -------- | ------------------------------------------------------ |
| `admin`  | Full access to all admin features and user management  |
| `editor` | CRUD on products, blog, categories, brands, orders     |
| `viewer` | Read-only access to admin dashboard                    |

---

## License

Private — All rights reserved. Mekfidel Communication Ltd.

