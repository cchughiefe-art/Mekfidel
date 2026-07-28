-- ============================================================
-- MEKFIDEL CMS - CONSOLIDATED SQL FOR SUPABASE SQL EDITOR
-- Execute this entire file in Supabase SQL Editor
-- ============================================================
-- This file contains all database schema, indexes, triggers, RLS, and seed data
-- Copy and paste the entire content into your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PRODUCTS (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  features TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  compare_price NUMERIC(12, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT NOT NULL,
  warranty TEXT DEFAULT 'No warranty',
  availability TEXT DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'out_of_stock', 'pre_order')),
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT
);

-- ============================================================
-- ORDERS (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled')),
  total NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(12, 2) NOT NULL
);

-- ============================================================
-- CUSTOMERS (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  state TEXT,
  city TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0
);

-- ============================================================
-- SCREEN COMPATIBILITY (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS screen_compatibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  series TEXT,
  screen_code TEXT,
  manufacturer_model TEXT,
  compatible_with TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- SERVICES (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT 'bg-blue-50 text-blue-600',
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- BLOG (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  image TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'Admin',
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  views INTEGER DEFAULT 0
);

-- ============================================================
-- FAQS (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  "order" INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TESTIMONIALS (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  image TEXT,
  is_published BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- SETTINGS (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT DEFAULT 'Mekfidel Communication Ltd',
  logo TEXT,
  phone TEXT DEFAULT '+2348000000000',
  whatsapp TEXT DEFAULT '2348000000000',
  email TEXT DEFAULT 'info@mekfidelcomms.com',
  address TEXT DEFAULT 'Lagos, Nigeria',
  business_hours TEXT DEFAULT 'Mon - Sat: 8AM - 6PM',
  social_media JSONB DEFAULT '{"facebook": "", "instagram": "", "twitter": "", "linkedin": "", "youtube": "", "tiktok": ""}',
  homepage_hero_title TEXT DEFAULT 'Your Premium Mobile Phone Destination',
  homepage_hero_subtitle TEXT DEFAULT 'Discover the latest mobile phones, quality accessories, genuine spare parts, and professional repair services.',
  hero_banner TEXT,
  about_text TEXT DEFAULT 'Mekfidel Communication Ltd is your trusted partner for mobile phones, accessories, and repair services across Nigeria.',
  footer_text TEXT DEFAULT 'Your trusted partner for mobile technology.',
  seo_title TEXT DEFAULT 'Mekfidel Communication Ltd - Mobile Phones, Accessories & Repair Services',
  seo_description TEXT DEFAULT 'Your trusted partner for mobile phones, phone accessories, phone screens, spare parts, and professional phone repair services across Nigeria.',
  seo_keywords TEXT DEFAULT 'Mekfidel Communication, mobile phones Nigeria, phone accessories, phone repair, phone screens Nigeria',
  google_maps_embed TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES (Existing - Auth)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEDIA (Existing)
-- ============================================================

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  folder TEXT DEFAULT 'uploads',
  alt TEXT,
  width INTEGER,
  height INTEGER
);

-- ============================================================
-- HOMEPAGE SECTIONS (NEW - CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  section_key TEXT NOT NULL UNIQUE,
  section_type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_url TEXT,
  image TEXT,
  background_image TEXT,
  icon TEXT,
  color TEXT,
  background_color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================
-- FEATURE CARDS (NEW - CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon_library TEXT DEFAULT 'lucide',
  icon_name TEXT,
  icon_color TEXT,
  url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- STATISTICS (NEW - CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  context TEXT DEFAULT 'homepage',
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  suffix TEXT,
  icon_library TEXT DEFAULT 'lucide',
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- NAVIGATION ITEMS (NEW - CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  location TEXT NOT NULL CHECK (location IN ('header', 'footer_main', 'footer_quick', 'footer_categories', 'mobile')),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_library TEXT,
  icon_name TEXT,
  parent_id UUID REFERENCES navigation_items(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_new_tab BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- FOOTER SECTIONS (NEW - CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS footer_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  icon_library TEXT,
  icon_name TEXT,
  links JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- SOCIAL LINKS (NEW - CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  platform TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon_library TEXT DEFAULT 'lucide',
  icon_name TEXT,
  url TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- UPLOADED ICONS (NEW - CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS uploaded_icons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  svg_content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER
);

-- ============================================================
-- CONTENT BLOCKS (NEW - CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  block_key TEXT NOT NULL UNIQUE,
  block_type TEXT DEFAULT 'text',
  title TEXT,
  content TEXT NOT NULL,
  page TEXT,
  position TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- COMPANY INFO (NEW - CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  info_key TEXT NOT NULL UNIQUE,
  info_type TEXT DEFAULT 'text',
  title TEXT,
  content TEXT NOT NULL,
  image TEXT,
  icon_library TEXT,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- INDEXES (All)
-- ============================================================

-- Existing indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_screen_compatibility_brand ON screen_compatibility(brand);
CREATE INDEX IF NOT EXISTS idx_screen_compatibility_model ON screen_compatibility(model);
CREATE INDEX IF NOT EXISTS idx_services_order ON services(order_index);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- CMS indexes
CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(sort_order);

CREATE INDEX IF NOT EXISTS idx_feature_cards_section ON feature_cards(section_id);
CREATE INDEX IF NOT EXISTS idx_feature_cards_active ON feature_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_feature_cards_order ON feature_cards(sort_order);

CREATE INDEX IF NOT EXISTS idx_statistics_context ON statistics(context);
CREATE INDEX IF NOT EXISTS idx_statistics_active ON statistics(is_active);
CREATE INDEX IF NOT EXISTS idx_statistics_order ON statistics(sort_order);

CREATE INDEX IF NOT EXISTS idx_navigation_location ON navigation_items(location);
CREATE INDEX IF NOT EXISTS idx_navigation_parent ON navigation_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_active ON navigation_items(is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_order ON navigation_items(sort_order);

CREATE INDEX IF NOT EXISTS idx_footer_sections_key ON footer_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_footer_sections_active ON footer_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_sections_order ON footer_sections(sort_order);

CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);
CREATE INDEX IF NOT EXISTS idx_social_links_visible ON social_links(is_visible);
CREATE INDEX IF NOT EXISTS idx_social_links_order ON social_links(sort_order);

CREATE INDEX IF NOT EXISTS idx_uploaded_icons_slug ON uploaded_icons(slug);

CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(is_published);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials(sort_order);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs(sort_order);

CREATE INDEX IF NOT EXISTS idx_content_blocks_key ON content_blocks(block_key);
CREATE INDEX IF NOT EXISTS idx_content_blocks_page ON content_blocks(page);
CREATE INDEX IF NOT EXISTS idx_content_blocks_active ON content_blocks(is_active);

CREATE INDEX IF NOT EXISTS idx_company_info_key ON company_info(info_key);
CREATE INDEX IF NOT EXISTS idx_company_info_active ON company_info(is_active);

-- ============================================================
-- AUTO-UPDATE TRIGGERS (All)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Existing triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- CMS triggers
CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_feature_cards_updated_at BEFORE UPDATE ON feature_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_statistics_updated_at BEFORE UPDATE ON statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_navigation_items_updated_at BEFORE UPDATE ON navigation_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_footer_sections_updated_at BEFORE UPDATE ON footer_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON content_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON company_info FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (All Tables)
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Public read access (existing)
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON screen_compatibility FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON services FOR SELECT USING (is_active = true);

-- Public read access (CMS)
CREATE POLICY "Public read homepage_sections" ON homepage_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public read feature_cards" ON feature_cards FOR SELECT USING (is_active = true);
CREATE POLICY "Public read statistics" ON statistics FOR SELECT USING (is_active = true);
CREATE POLICY "Public read navigation_items" ON navigation_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public read footer_sections" ON footer_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public read social_links" ON social_links FOR SELECT USING (is_visible = true);
CREATE POLICY "Public read uploaded_icons" ON uploaded_icons FOR SELECT USING (true);
CREATE POLICY "Public read content_blocks" ON content_blocks FOR SELECT USING (is_active = true);
CREATE POLICY "Public read company_info" ON company_info FOR SELECT USING (is_active = true);

-- Admin full access (existing)
CREATE POLICY "Admin full access" ON categories FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON brands FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON products FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON orders FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON order_items FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON customers FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON screen_compatibility FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON blog_posts FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON faqs FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON testimonials FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON settings FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON services FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full access" ON media FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Admin full access (CMS)
CREATE POLICY "Admin full homepage_sections" ON homepage_sections FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full feature_cards" ON feature_cards FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full statistics" ON statistics FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full navigation_items" ON navigation_items FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full footer_sections" ON footer_sections FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full social_links" ON social_links FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full uploaded_icons" ON uploaded_icons FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full content_blocks" ON content_blocks FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Admin full company_info" ON company_info FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- ============================================================
-- INSERT DEFAULT SETTINGS
-- ============================================================

INSERT INTO settings (company_name) VALUES ('Mekfidel Communication Ltd')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA (CMS)
-- ============================================================

-- Seed default homepage sections
INSERT INTO homepage_sections (section_key, section_type, title, subtitle, description, button_text, button_url, sort_order, is_active, metadata) VALUES
  ('hero', 'hero', 'Your Premium Mobile Phone Destination', 'Discover the latest mobile phones, quality accessories, genuine spare parts, and professional repair services.', 'Shop Now', '/products', 1, true, '{"trust_badge": "Trusted Phone Dealer in Nigeria"}'),
  ('about_intro', 'features_grid', 'Why Choose Mekfidel Communication?', 'We combine quality products with exceptional service to deliver the best mobile experience in Nigeria.', NULL, NULL, 2, true, '{}'),
  ('cta', 'cta', 'Ready to Experience the Difference?', 'Visit our store or browse our catalog online. We are here to help.', 'Contact Us', '/contact', 4, true, '{"button_secondary": "Browse Products|/products"}'),
  ('how_it_works', 'steps', 'How It Works', 'Simple steps to get started with our services.', NULL, NULL, 5, true, '{}')
ON CONFLICT (section_key) DO NOTHING;

-- Seed default feature cards
INSERT INTO feature_cards (section_id, title, description, icon_library, icon_name, icon_color, sort_order, is_active)
SELECT hs.id, fc.title, fc.description, fc.icon_library, fc.icon_name, fc.icon_color, fc.sort_order, true
FROM homepage_sections hs
CROSS JOIN (VALUES
  ('Genuine Products', '100% authentic mobile phones and accessories sourced directly from trusted manufacturers.', 'lucide', 'Shield', 'text-blue-600', 1),
  ('Expert Service', 'Professional phone repair services by certified technicians with years of experience.', 'lucide', 'Award', 'text-blue-600', 2),
  ('Customer Support', 'Dedicated support team ready to help you with any questions or concerns.', 'lucide', 'Headphones', 'text-blue-600', 3),
  ('Fast Delivery', 'Nationwide shipping with fast and reliable delivery right to your doorstep.', 'lucide', 'Truck', 'text-blue-600', 4)
) AS fc(title, description, icon_library, icon_name, icon_color, sort_order)
WHERE hs.section_key = 'about_intro'
ON CONFLICT DO NOTHING;

-- Seed default statistics
INSERT INTO statistics (context, label, value, suffix, icon_library, icon_name, sort_order, is_active) VALUES
  ('homepage', 'Years Experience', '5', '+', 'lucide', 'Clock', 1, true),
  ('homepage', 'Happy Customers', '1000', '+', 'lucide', 'Users', 2, true),
  ('homepage', 'Products Sold', '5000', '+', 'lucide', 'Package', 3, true),
  ('homepage', 'Brands Available', '50', '+', 'lucide', 'Award', 4, true)
ON CONFLICT DO NOTHING;

-- Seed default navigation items
INSERT INTO navigation_items (location, label, url, sort_order, is_active) VALUES
  ('header', 'Home', '/', 1, true),
  ('header', 'Products', '/products', 2, true),
  ('header', 'Phone Screen Compatibility', '/phone-screen-compatibility', 3, true),
  ('header', 'Services', '/services', 4, true),
  ('header', 'About', '/about', 5, true),
  ('header', 'Blog', '/blog', 6, true),
  ('header', 'Contact', '/contact', 7, true),
  ('header', 'FAQ', '/faq', 8, true),
  ('footer_main', 'Home', '/', 1, true),
  ('footer_main', 'Products', '/products', 2, true),
  ('footer_main', 'Services', '/services', 3, true),
  ('footer_main', 'About Us', '/about', 4, true),
  ('footer_main', 'Blog', '/blog', 5, true),
  ('footer_main', 'Contact', '/contact', 6, true),
  ('footer_main', 'FAQ', '/faq', 7, true),
  ('footer_categories', 'Mobile Phones', '/products?category=mobile-phones', 1, true),
  ('footer_categories', 'Phone Accessories', '/products?category=accessories', 2, true),
  ('footer_categories', 'Phone Screens', '/products?category=screens', 3, true),
  ('footer_categories', 'Spare Parts', '/products?category=spare-parts', 4, true),
  ('footer_categories', 'Phone Repair', '/services', 5, true)
ON CONFLICT DO NOTHING;

-- Seed default footer sections
INSERT INTO footer_sections (section_key, title, content, sort_order, is_active) VALUES
  ('company', 'Company', NULL, 1, true),
  ('quick_links', 'Quick Links', NULL, 2, true),
  ('categories', 'Categories', NULL, 3, true),
  ('contact', 'Contact Us', NULL, 4, true),
  ('newsletter', 'Newsletter', 'Subscribe to get the latest products and offers.', 5, true)
ON CONFLICT (section_key) DO NOTHING;

-- Seed default social links
INSERT INTO social_links (platform, label, icon_name, url, sort_order, is_visible) VALUES
  ('facebook', 'Facebook', 'Facebook', NULL, 1, true),
  ('instagram', 'Instagram', 'Instagram', NULL, 2, true),
  ('twitter', 'Twitter', 'Twitter', NULL, 3, true),
  ('linkedin', 'LinkedIn', 'Linkedin', NULL, 4, true),
  ('youtube', 'YouTube', 'Youtube', NULL, 5, true),
  ('tiktok', 'TikTok', 'Music', NULL, 6, true)
ON CONFLICT (platform) DO NOTHING;

-- Seed default testimonials
INSERT INTO testimonials (name, role, company, content, rating, sort_order, is_published, is_featured) VALUES
  ('Emmanuel Okonkwo', 'Business Owner', 'Ema Ventures', 'Mekfidel has been my go-to for all phone purchases. Their prices are competitive and the quality is always top-notch. Highly recommended!', 5, 1, true, true),
  ('Blessing Adeyemi', 'Student', NULL, 'I got my phone screen replaced here and the service was excellent. Fast, affordable, and professional. The staff are very helpful.', 5, 2, true, true),
  ('Chidi Nwachukwu', 'Tech Enthusiast', NULL, 'Best phone store in Lagos! They have a wide variety of accessories and spare parts. Great customer service too.', 5, 3, true, false)
ON CONFLICT DO NOTHING;

-- Seed default FAQs
INSERT INTO faqs (question, answer, category, "order", is_published) VALUES
  ('What products do you sell?', 'We sell mobile phones, phone accessories, replacement screens, spare parts, and offer professional repair services for all major phone brands.', 'Products', 1, true),
  ('Do you offer warranty on your products?', 'Yes, all our products come with manufacturer warranty. The warranty period varies by product. Ask our staff for specific warranty details.', 'Products', 2, true),
  ('Do you ship nationwide?', 'Yes, we offer delivery services across Nigeria. Shipping fees and delivery times vary by location.', 'Shipping', 3, true),
  ('How long does phone repair take?', 'Most repairs are completed within 1-2 hours. Complex repairs may take longer depending on parts availability.', 'Services', 4, true),
  ('What payment methods do you accept?', 'We accept cash, bank transfers, and mobile money payments.', 'Payment', 5, true)
ON CONFLICT DO NOTHING;

-- Seed default company info
INSERT INTO company_info (info_key, info_type, title, content, sort_order, is_active) VALUES
  ('story', 'text', 'Our Story', 'Mekfidel Communication Ltd was founded with a simple mission: to provide Nigerians with access to quality mobile phones, genuine accessories, and reliable repair services at affordable prices.', 1, true),
  ('mission', 'text', 'Our Mission', 'To provide every Nigerian with access to quality mobile phones, genuine accessories, and professional repair services at the best possible prices, delivered with exceptional customer service.', 2, true),
  ('vision', 'text', 'Our Vision', 'To become Nigeria''s most trusted mobile phone retailer and repair service provider, known for quality, reliability, and innovation in everything we do.', 3, true),
  ('founded_year', 'number', NULL, '2020', 4, true)
ON CONFLICT (info_key) DO NOTHING;

-- Seed default content blocks
INSERT INTO content_blocks (block_key, block_type, title, content, page, position, sort_order, is_active) VALUES
  ('about_story', 'text', 'Our Story', 'Mekfidel Communication Ltd was founded with a simple mission: to provide Nigerians with access to quality mobile phones, genuine accessories, and reliable repair services at affordable prices. Starting as a small mobile phone retail shop in Lagos, we have grown into a trusted name in the Nigerian mobile phone industry. Our commitment to quality, transparency, and exceptional customer service has earned us the loyalty of thousands of customers across the country.', 'about', 'main', 1, true),
  ('contact_info', 'text', NULL, NULL, 'contact', 'sidebar', 1, true),
  ('services_hero', 'text', 'Our Services', 'Comprehensive mobile solutions from sales to repair and wholesale.', 'services', 'hero', 1, true),
  ('how_it_works_steps', 'text', 'How It Works', 'Contact Us, Get a Quote, Service Delivery, Satisfaction', 'services', 'main', 1, true)
ON CONFLICT (block_key) DO NOTHING;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('logos', 'logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']),
  ('products', 'products', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('banners', 'banners', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']),
  ('gallery', 'gallery', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('blog', 'blog', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('icons', 'icons', true, 102400, ARRAY['image/svg+xml']),
  ('uploads', 'uploads', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read products" ON storage.objects;
DROP POLICY IF EXISTS "Public read banners" ON storage.objects;
DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public read blog" ON storage.objects;
DROP POLICY IF EXISTS "Public read icons" ON storage.objects;
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;

CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Public read products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Public read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public read blog" ON storage.objects FOR SELECT USING (bucket_id = 'blog');
CREATE POLICY "Public read icons" ON storage.objects FOR SELECT USING (bucket_id = 'icons');
CREATE POLICY "Public read uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

-- ============================================================
-- END OF SQL
-- ============================================================
