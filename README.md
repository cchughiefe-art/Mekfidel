# Mekfidel Communication Ltd

A comprehensive, production-ready e-commerce and Content Management System (CMS) website for **Mekfidel Communication Ltd** — a Nigeria-based supplier of phone repair tools, replacement screens, and spare parts.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS 3**, **Supabase**, and featuring a fully dynamic CMS.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Database Schema](#database-schema)
- [Admin Dashboard](#admin-dashboard)
- [Content Management System (CMS)](#content-management-system-cms)
- [API Routes](#api-routes)
- [Icons System](#icons-system)
- [Admin Roles & Permissions](#admin-roles--permissions)
- [Security](#security)
- [Documentation](#documentation)

---

## Overview

Mekfidel Communication Ltd is a full-featured e-commerce platform that enables the business to:

- Sell phone repair tools, replacement screens and spare parts online
- Help customers select compatible parts and tools
- Manage a blog for content marketing
- Provide a screen compatibility checker for customers
- Accept and process orders with status tracking
- Manage all website content through an intuitive admin dashboard
- Provide real-time customer support via WhatsApp integration

---

## Tech Stack

| Layer              | Technology                        | Purpose                                |
| ------------------ | --------------------------------- | -------------------------------------- |
| **Framework**      | Next.js 16 (App Router)           | React framework with server components |
| **Language**       | TypeScript                        | Type-safe development                  |
| **Styling**        | Tailwind CSS v3                   | Utility-first CSS framework            |
| **Database**       | Supabase (PostgreSQL)             | Primary database with RLS              |
| **Authentication** | Supabase Auth                     | User authentication and management     |
| **Storage**        | Supabase Storage                  | Media file storage (images, SVGs)      |
| **State (Client)** | Zustand + React Query             | Cart state and server state            |
| **Forms**          | React Hook Form + Zod             | Form handling with validation          |
| **UI Components**  | Custom shadcn/ui-style components | Consistent UI across the app           |
| **Icons**          | Lucide React + Custom SVG         | Icon library with CMS support          |
| **Notifications**  | React Hot Toast                   | Toast notifications                    |
| **Validation**     | Zod                               | Runtime type validation                |

---

## Features

### Public Website

| Page                           | Description                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Homepage**                   | Dynamic hero section, feature cards, statistics, product categories, testimonials carousel, CTA banners          |
| **Products**                   | Filterable/sortable product listing, detail pages with image gallery, specifications, features, related products |
| **Product Categories**         | Browse by category (repair tools, screens and spare parts)                                                       |
| **Phone Screen Compatibility** | Searchable database to find compatible replacement screens by phone model                                        |
| **Services**                   | Tools and parts supply information and ordering steps                                                            |
| **About**                      | Company story, mission, vision, statistics                                                                       |
| **Blog**                       | Articles with categories, tags, author info, SEO metadata, view counts                                           |
| **Contact**                    | Contact form with Supabase integration, company info, business hours                                             |
| **FAQ**                        | Frequently asked questions organized by category                                                                 |
| **Shopping Cart**              | Persistent cart with checkout, order summary, delivery details                                                   |
| **Search**                     | Full-text product search with real-time results                                                                  |
| **Legal Pages**                | Privacy Policy, Terms of Service, Return Policy                                                                  |

### Admin Dashboard

| Section                  | Capabilities                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **Dashboard**            | Overview stats, recent orders, revenue charts                                      |
| **Products**             | Full CRUD, image gallery, categories, brands, stock, pricing, warranty, SEO fields |
| **Categories**           | Hierarchical category management with ordering                                     |
| **Brands**               | Brand management with logos                                                        |
| **Orders**               | View, manage, update status, view order details                                    |
| **Customers**            | Customer records with order history                                                |
| **Blog**                 | Create/edit/delete blog posts, categories, tags                                    |
| **Media Library**        | Upload and manage images via Supabase Storage                                      |
| **SEO Settings**         | Meta tags, sitemap configuration                                                   |
| **Site Settings**        | Company info, social media, hero content, business hours                           |
| **Users**                | Admin user management with role-based access                                       |
| **Screen Compatibility** | Manage phone screen compatibility database                                         |

### Content Management System (CMS)

The CMS allows complete control over website content without code changes:

| CMS Section      | Manageable Content                                                    |
| ---------------- | --------------------------------------------------------------------- |
| **Homepage**     | Hero banner, section titles, descriptions, CTA buttons, feature cards |
| **Navigation**   | Header menu, footer links, mobile menu with drag ordering             |
| **Footer**       | Footer columns, quick links, newsletter section, contact info         |
| **Icons**        | Browse Lucide library, upload custom SVG icons                        |
| **Testimonials** | Customer reviews with ratings, featured status                        |
| **FAQs**         | Questions and answers organized by category                           |

---

## Project Structure

```
mekfidel/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth group routes
│   │   │   ├── login/           # Login page
│   │   │   └── reset-password/ # Password recovery
│   │   ├── admin/               # Admin dashboard (CMS + E-commerce)
│   │   │   ├── dashboard/       # Admin overview
│   │   │   ├── products/        # Product management
│   │   │   ├── categories/      # Category management
│   │   │   ├── brands/          # Brand management
│   │   │   ├── orders/          # Order management
│   │   │   ├── customers/       # Customer management
│   │   │   ├── blog/            # Blog management
│   │   │   ├── services/        # Services management
│   │   │   ├── media/           # Media library
│   │   │   ├── settings/        # Site settings
│   │   │   ├── users/           # User management
│   │   │   ├── seo/             # SEO settings
│   │   │   ├── compatibility/   # Screen compatibility
│   │   │   ├── analytics/       # Analytics placeholder
│   │   │   ├── homepage/         # 🔥 Homepage CMS management
│   │   │   ├── navigation/       # 🔥 Navigation CMS management
│   │   │   ├── footer/          # 🔥 Footer CMS management
│   │   │   ├── icons/           # 🔥 Icon library management
│   │   │   ├── testimonials/    # 🔥 Testimonials CMS management
│   │   │   └── faqs/            # 🔥 FAQ CMS management
│   │   ├── api/                 # API routes
│   │   │   ├── orders/          # Order processing
│   │   │   ├── contact/         # Contact form
│   │   │   ├── newsletter/      # Newsletter subscription
│   │   │   ├── search/          # Product search
│   │   │   ├── upload/          # File uploads
│   │   │   ├── homepage-sections/  # 🔥 Homepage CMS API
│   │   │   ├── feature-cards/      # 🔥 Feature cards API
│   │   │   ├── navigation/         # 🔥 Navigation API
│   │   │   ├── footer/             # 🔥 Footer API
│   │   │   ├── statistics/          # 🔥 Statistics API
│   │   │   ├── social-links/       # 🔥 Social links API
│   │   │   ├── icons/              # 🔥 Icon management API
│   │   │   └── company-info/       # 🔥 Company info API
│   │   ├── blog/              # Blog pages
│   │   ├── products/           # Product pages
│   │   ├── services/           # Services pages
│   │   ├── about/              # About page
│   │   ├── contact/            # Contact page
│   │   ├── faq/                # FAQ page
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/            # Checkout flow
│   │   ├── auth/               # Auth pages
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   ├── robots.ts            # SEO robots.txt
│   │   └── sitemap.ts           # Dynamic sitemap
│   ├── components/
│   │   ├── home/               # Homepage sections
│   │   │   ├── hero.tsx
│   │   │   ├── about-intro.tsx      # 🔥 Dynamic CMS
│   │   │   ├── cta-section.tsx      # 🔥 Dynamic CMS
│   │   │   ├── testimonials.tsx      # 🔥 Dynamic CMS
│   │   │   ├── product-categories.tsx # 🔥 Dynamic CMS
│   │   │   ├── google-map.tsx
│   │   │   └── stats-section.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx           # Dynamic navigation
│   │   │   ├── footer.tsx           # Dynamic footer
│   │   │   ├── admin-sidebar.tsx   # 🔥 Mobile-responsive
│   │   │   ├── cart-sidebar.tsx
│   │   │   └── whatsapp-button.tsx
│   │   └── ui/                     # Reusable UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── modal.tsx
│   │       ├── icon-renderer.tsx    # 🔥 Multi-library icon support
│   │       └── ...
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-cart.ts
│   │   └── use-supabase-query.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts          # Server components
│   │   │   └── service.ts         # Admin operations
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── format.ts
│   │       ├── icon-mapper.ts      # 🔥 Icon mapping utilities
│   │       └── storage.ts
│   ├── providers/                 # React context providers
│   └── types/                     # TypeScript definitions
│       └── index.ts                # All CMS types
├── sql/
│   └── cms_migration.sql           # CMS database migration
├── supabase_sql_editor.sql        # 🔥 Complete SQL for Supabase
├── CHANGELOG.md                    # Version history
├── CMS_SETUP.md                    # CMS usage guide
├── DEPLOYMENT_GUIDE.md             # Deployment instructions
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

> 🔥 = New/updated features from CMS implementation

---

## Quick Start

### Prerequisites

- Node.js 22+ (deployment: 24.x)
- npm, yarn, or pnpm
- A Supabase account ([Sign up free](https://supabase.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/cchughiefe-art/Mekfidel.git
cd Mekfidel

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your API keys from Settings → API
3. Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Database Setup

1. Go to your Supabase project → SQL Editor
2. Copy the entire contents of `supabase_sql_editor.sql`
3. Paste and execute (this creates all tables, indexes, RLS policies, and seed data)

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Create Admin User

1. Create a team account using Supabase Auth, then sign in at `/auth/login`
2. In Supabase SQL Editor, execute:
   ```sql
   INSERT INTO profiles (id, email, role)
   SELECT id, email, 'admin' FROM auth.users WHERE email = 'your-email@example.com'
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```
3. Refresh and access `/admin`

---

## Database Setup

### Option 1: Supabase SQL Editor (Recommended)

The `supabase_sql_editor.sql` file contains the complete database schema and is designed to be executed in one step:

1. Open Supabase Dashboard → SQL Editor
2. Copy all contents from `supabase_sql_editor.sql`
3. Click **Run**

### Option 2: Migration Files

For incremental updates, use `sql/cms_migration.sql` which adds only the CMS tables to an existing database.

### Database Tables

#### E-commerce Tables

| Table                  | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `products`             | Product catalog with pricing, stock, images, specifications |
| `categories`           | Hierarchical product categories                             |
| `brands`               | Phone brands with logos                                     |
| `orders`               | Customer orders with status tracking                        |
| `order_items`          | Individual items in orders                                  |
| `customers`            | Customer records                                            |
| `screen_compatibility` | Phone screen compatibility database                         |

#### CMS Tables 🔥

| Table               | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `homepage_sections` | Homepage content sections (hero, features, CTA, stats) |
| `feature_cards`     | Individual feature cards with icons                    |
| `statistics`        | Counter/statistic values with icons                    |
| `navigation_items`  | Header, footer, and mobile navigation                  |
| `footer_sections`   | Footer column content and links                        |
| `social_links`      | Social media platform links                            |
| `uploaded_icons`    | Custom SVG icon uploads                                |
| `content_blocks`    | Reusable content snippets                              |
| `company_info`      | Company information entries                            |
| `testimonials`      | Customer testimonials with ratings                     |
| `faqs`              | FAQ questions and answers                              |

#### Supporting Tables

| Table        | Description              |
| ------------ | ------------------------ |
| `settings`   | Site-wide configuration  |
| `profiles`   | User profiles with roles |
| `blog_posts` | Blog articles            |
| `media`      | Media library tracking   |

---

## Environment Variables

| Variable                        | Required | Description                            |
| ------------------------------- | -------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Supabase service role key (admin only) |
| `NEXT_PUBLIC_SITE_URL`          | No       | Production site URL for SEO            |
| `NEXT_PUBLIC_GA_ID`             | No       | Google Analytics ID                    |

---

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Import in Vercel
# 1. Connect your GitHub repository
# 2. Add environment variables
# 3. Deploy
```

### Manual Build

```bash
npm run build
npm start
```

### Docker

```dockerfile
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static .next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Admin Dashboard

The admin dashboard provides complete control over the e-commerce and CMS features.

### Navigation

The sidebar features:

- **Desktop**: Fixed sidebar on the left
- **Mobile**: Hamburger menu with slide-out drawer

### Dashboard Sections

#### E-commerce Management

- **Products** (`/admin/products`) — Full product CRUD with images, variants, SEO
- **Categories** (`/admin/categories`) — Category hierarchy management
- **Brands** (`/admin/brands`) — Brand management
- **Orders** (`/admin/orders`) — Order processing and status updates
- **Customers** (`/admin/customers`) — Customer records

#### Content Management 🔥

- **Homepage** (`/admin/homepage`) — Hero, features, stats, CTA sections
- **Navigation** (`/admin/navigation`) — Header/footer/mobile menu management
- **Footer** (`/admin/footer`) — Footer content and social links
- **Icons** (`/admin/icons`) — Browse Lucide icons, upload custom SVGs
- **Testimonials** (`/admin/testimonials`) — Customer reviews management
- **FAQs** (`/admin/faqs`) — FAQ management with categories

#### Blog & Media

- **Blog** (`/admin/blog`) — Article creation and management
- **Media** (`/admin/media`) — Image upload and management

#### Settings

- **Settings** (`/admin/settings`) — Company info, social links
- **SEO** (`/admin/seo`) — Meta tags, keywords
- **Users** (`/admin/users`) — Admin user management

---

## Content Management System (CMS)

The CMS enables non-technical users to manage all website content.

### Homepage Management

Manage all homepage sections:

- **Hero Banner** — Title, subtitle, description, button
- **Feature Grid** — Section title, subtitle
- **Feature Cards** — Icon, title, description, color (CRUD)
- **Statistics** — Label, value, suffix, icon (CRUD)
- **Call-to-Action** — Title, description, button

### Navigation Management

- Create/edit/delete navigation items
- Assign to location (header, footer_main, footer_categories, mobile)
- Drag-to-reorder functionality
- Toggle visibility
- Open in new tab option

### Footer Management

- **Sections** — Column titles, content, quick links
- **Social Links** — Platform, URL, visibility
- Add/edit/remove links within sections

### Icon Library

- **Browse** — Search 1000+ Lucide icons
- **Copy** — Click to copy icon name
- **Upload** — Add custom SVG icons
- **Manage** — View usage, delete icons

### Testimonials

- Customer name, role, company
- Testimonial content
- Star rating (1-5)
- Featured status
- Sort order
- Publish/draft toggle

### FAQs

- Question and answer
- Category assignment
- Sort order
- Publish/draft toggle

---

## API Routes

### E-commerce APIs

| Endpoint          | Methods   | Description                     |
| ----------------- | --------- | ------------------------------- |
| `/api/orders`     | GET, POST | Order operations                |
| `/api/contact`    | POST      | Contact form submission         |
| `/api/newsletter` | POST      | Newsletter subscription         |
| `/api/search`     | GET       | Product search                  |
| `/api/upload`     | POST      | File upload to Supabase Storage |

### CMS APIs 🔥

| Endpoint                 | Methods                  | Description            |
| ------------------------ | ------------------------ | ---------------------- |
| `/api/homepage-sections` | GET, POST                | Homepage sections CRUD |
| `/api/feature-cards`     | GET, POST, PATCH, DELETE | Feature cards CRUD     |
| `/api/statistics`        | GET, POST, PATCH, DELETE | Statistics CRUD        |
| `/api/navigation`        | GET, POST, PATCH, DELETE | Navigation CRUD        |
| `/api/footer`            | GET, POST, PATCH, DELETE | Footer sections CRUD   |
| `/api/social-links`      | GET, POST, PATCH, DELETE | Social links CRUD      |
| `/api/icons`             | GET, POST, DELETE        | Icon management        |
| `/api/company-info`      | GET, POST, PATCH, DELETE | Company info CRUD      |

---

## Icons System 🔥

The icon system supports multiple icon libraries and custom uploads.

### Supported Libraries

| Library      | Icon Count | Usage             |
| ------------ | ---------- | ----------------- |
| Lucide React | 1000+      | Default, built-in |
| Heroicons    | Available  | Requires setup    |
| Tabler       | Available  | Requires setup    |
| Custom SVG   | Unlimited  | Upload via admin  |

### Usage in Code

```typescript
// Lucide icon
import { SimpleIcon } from '@/components/ui/icon-renderer';
<SimpleIcon name="Shield" size={24} />

// Multi-library icon
import { IconRenderer } from '@/components/ui/icon-renderer';
<IconRenderer
  library="lucide"
  iconName="Shield"
  size={24}
/>
```

### Database Storage

Icons are stored by name only (no React components):

```json
{
  "icon_library": "lucide",
  "icon_name": "Shield"
}
```

---

## Admin Roles & Permissions

| Role     | Dashboard | Products | Orders | Blog   | CMS    | Settings | Users  |
| -------- | --------- | -------- | ------ | ------ | ------ | -------- | ------ |
| `admin`  | ✓ Full    | ✓ Full   | ✓ Full | ✓ Full | ✓ Full | ✓ Full   | ✓ Full |
| `editor` | ✗         | ✗        | ✗      | ✓ CRUD | ✓ Edit | ✗        | ✗      |
| `viewer` | ✗         | ✗        | ✗      | ✗      | ✗      | ✗        | ✗      |

---

## Security

### Database Security

- **Row Level Security (RLS)** — Enabled on all tables
- **Policy-based Access** — Public read, authenticated write for content
- **Admin-only Operations** — Service role key for privileged operations

### Application Security

- Security headers configured in middleware
- Form validation with Zod
- SQL injection prevention via parameterized queries
- XSS protection via React's default escaping

### Storage Security

- Public read for display images
- Admin-only write access
- File type restrictions by bucket

---

## Documentation

| Document                  | Description                       |
| ------------------------- | --------------------------------- |
| `README.md`               | This file                         |
| `CHANGELOG.md`            | Version history and changes       |
| `CMS_SETUP.md`            | CMS configuration and usage guide |
| `DEPLOYMENT_GUIDE.md`     | Deployment instructions           |
| `supabase_sql_editor.sql` | Complete database SQL             |

---

## Contributing

This is a private project for Mekfidel Communication Ltd. All rights reserved.

---

## License

Private — All rights reserved. Mekfidel Communication Ltd.

## Audit remediation setup (October 2026)

After the base schema and CMS tables, apply `sql/ai_cms_assistant.sql`, then the SQL in `supabase/migrations/20261008075452_transactional_admin_orders.sql`. This migration adds atomic checkout, inventory reservations, lifecycle protection, request limits, private newsletter subscriptions and transactional manual/AI change history. Browser writes are disabled; use the admin API. Existing orders are not retroactively reserved.

Configure `SUPABASE_SERVICE_ROLE_KEY` on the server. For the assistant, configure `GROQ_API_KEY` and/or `GEMINI_API_KEY`. Optional models are `GROQ_MODEL` (default `openai/gpt-oss-20b`) and `GEMINI_MODEL` (default `gemini-3.1-flash-lite`). Automatic mode tries Groq then Gemini. Provider free quotas and availability depend on the account; exhaustion displays an error and leaves manual controls usable. Never put these keys in a `NEXT_PUBLIC_` variable.

The assistant previews supported content and commerce changes before applying them. Authentication credentials, deployment settings, payment credentials and file bytes are outside its action engine. Upload files manually; the assistant can edit registered media metadata. Undo checks for conflicting changes. Order transitions cannot be undone from history.

Create the first user in Supabase Auth, then assign its existing UUID an admin profile through the Supabase dashboard. Public registration does not grant admin access. Editors manage website content; only admins manage commerce, business settings and team roles.

Run `npm run lint -- --max-warnings 0`, `npm run typecheck`, `npm test` and `npm run build`. CI runs lint, types, tests and the production dependency audit without deployment credentials. Vercel performs the preview build. See `docs/AUDIT-REMEDIATION.md` for verified changes and remaining business decisions.

Checkout submits an order request. Payment and delivery charges are confirmed with the shop; it does not collect a card payment. The former placeholder notification integration has been removed. No outbound order notification service is configured.
