# Changelog

All notable changes to the Mekfidel website will be documented in this file.

## [2.0.0] - 2024-07-28

### Added
- **Full CMS Implementation**
  - Dynamic homepage sections management (hero, features, CTA, etc.)
  - Dynamic navigation management (header, footer, mobile)
  - Dynamic footer content management
  - Dynamic statistics and counters
  - Dynamic testimonials management
  - Dynamic FAQ management
  - Icon library management with Lucide icons and SVG upload support

### New Database Tables
- `homepage_sections` - Manage homepage content sections
- `feature_cards` - Individual feature cards for homepage
- `statistics` - Statistics/counters for various contexts
- `navigation_items` - Header and footer navigation
- `footer_sections` - Footer column sections
- `social_links` - Social media links
- `uploaded_icons` - Custom SVG icon uploads
- `content_blocks` - Reusable content snippets
- `company_info` - Company information entries

### New Admin Pages
- `/admin/homepage` - Homepage CMS management
- `/admin/navigation` - Navigation management
- `/admin/footer` - Footer and social links management
- `/admin/icons` - Icon library management
- `/admin/testimonials` - Testimonials management
- `/admin/faqs` - FAQ management

### New API Routes
- `/api/homepage-sections` - Homepage sections CRUD
- `/api/feature-cards` - Feature cards CRUD
- `/api/navigation` - Navigation items CRUD
- `/api/footer` - Footer sections CRUD
- `/api/statistics` - Statistics CRUD
- `/api/social-links` - Social links CRUD
- `/api/icons` - Icon management
- `/api/company-info` - Company info CRUD

### Components
- `IconRenderer` - Reusable icon component supporting Lucide, Heroicons, Tabler, and uploaded SVGs
- `SimpleIcon` - Simplified icon component for Lucide icons

### Updated Components
- `AboutIntro` - Now fetches dynamic features from CMS
- `CTASection` - Now fetches dynamic CTA content from CMS
- `Testimonials` - Now fetches dynamic testimonials from database
- `ProductCategories` - Now fetches dynamic categories from database
- `AdminSidebar` - Added CMS management links

### Database
- Complete SQL migration file: `sql/cms_migration.sql`
- Consolidated SQL for Supabase SQL Editor: `supabase_sql_editor.sql`
- Row Level Security (RLS) policies for all new tables
- Seed data for initial CMS content

### TypeScript Types
- Added CMS-related types: `HomepageSection`, `FeatureCard`, `Statistic`, `NavigationItem`, `FooterSection`, `SocialLink`, `UploadedIcon`, `ContentBlock`, `CompanyInfo`, `FAQ`, `AboutValue`

## [1.0.0] - Previous Versions

### Previous Features
- Product management (CRUD)
- Category management
- Brand management
- Order management
- Customer management
- Blog posts management
- Screen compatibility checker
- Services management
- FAQ management (basic)
- Media library
- Settings management
- SEO management
- User management
- Authentication system
- Cart and checkout system
- Search functionality
- WhatsApp integration
- Email newsletter subscription

---

## Migration Guide

### For New Installations
1. Run `supabase_sql_editor.sql` in your Supabase SQL Editor
2. All tables, indexes, triggers, RLS policies, and seed data will be created

### For Existing Installations
1. Run `sql/cms_migration.sql` in your Supabase SQL Editor
2. This will add the new CMS tables without affecting existing data
3. Seed data will be inserted for new tables

## Breaking Changes
None - All changes are additive

## Known Issues
None reported
