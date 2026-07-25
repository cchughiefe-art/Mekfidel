-- ============================================================
-- MEKFIDEL COMMUNICATION LTD - DATABASE SCHEMA
-- Supabase PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PRODUCTS
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
-- ORDERS
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
-- CUSTOMERS
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
-- SCREEN COMPATIBILITY
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
-- BLOG
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
-- FAQS
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
-- TESTIMONIALS
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
-- SETTINGS
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
-- PROFILES (Auth)
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
-- MEDIA TRACKING
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
-- INDEXES
-- ============================================================

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

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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
-- ROW LEVEL SECURITY
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

-- Public read access
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON screen_compatibility FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON settings FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access" ON categories FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON brands FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON products FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON orders FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON order_items FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON customers FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON screen_compatibility FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON blog_posts FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON faqs FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON testimonials FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON settings FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full access" ON media FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);

-- ============================================================
-- INSERT DEFAULT SETTINGS
-- ============================================================

INSERT INTO settings (company_name) VALUES ('Mekfidel Communication Ltd')
ON CONFLICT DO NOTHING;

-- ============================================================
-- STORAGE BUCKETS SETUP
-- Run these in Supabase SQL editor or create via dashboard
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('logos', 'logos', true),
--   ('products', 'products', true),
--   ('banners', 'banners', true),
--   ('gallery', 'gallery', true),
--   ('blog', 'blog', true),
--   ('icons', 'icons', true),
--   ('uploads', 'uploads', true)
-- ON CONFLICT DO NOTHING;

