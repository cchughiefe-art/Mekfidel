-- ============================================================
-- MEKFIDEL CMS - DATABASE SCHEMA MIGRATION
-- Supabase PostgreSQL Schema for Full CMS
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- HOMEPAGE SECTIONS
-- ============================================================
-- Manage all homepage content sections dynamically

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Section identification
  section_key TEXT NOT NULL UNIQUE, -- e.g., 'hero', 'about_intro', 'cta', 'features', 'stats'
  section_type TEXT NOT NULL, -- e.g., 'hero', 'features_grid', 'stats', 'cta', 'testimonials', 'promo'
  
  -- Content fields
  title TEXT,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_url TEXT,
  
  -- Media
  image TEXT,
  background_image TEXT,
  icon TEXT,
  
  -- Styling
  color TEXT, -- Tailwind color classes
  background_color TEXT,
  
  -- Order and visibility
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Additional data stored as JSONB
  metadata JSONB DEFAULT '{}'
);

-- ============================================================
-- FEATURE CARDS (for feature grids)
-- ============================================================
-- Individual feature cards within homepage sections

CREATE TABLE IF NOT EXISTS feature_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Link to parent section
  section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,
  
  -- Card content
  title TEXT NOT NULL,
  description TEXT,
  icon_library TEXT DEFAULT 'lucide', -- lucide, heroicons, tabler, uploaded
  icon_name TEXT, -- e.g., 'Shield', 'Wrench', 'Battery'
  icon_color TEXT, -- Tailwind color class
  url TEXT,
  
  -- Order and visibility
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- STATISTICS (for stats sections)
-- ============================================================
-- Dynamic statistics/counters for homepage and other pages

CREATE TABLE IF NOT EXISTS statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Display context
  context TEXT DEFAULT 'homepage', -- homepage, about, footer, etc.
  
  -- Content
  label TEXT NOT NULL, -- e.g., 'Happy Customers', 'Products Sold'
  value TEXT NOT NULL, -- e.g., '1000+', '5000+'
  suffix TEXT, -- e.g., '+', '%', ''
  
  -- Media
  icon_library TEXT DEFAULT 'lucide',
  icon_name TEXT,
  
  -- Order and visibility
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- NAVIGATION ITEMS
-- ============================================================
-- Dynamic header and footer navigation

CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Navigation location
  location TEXT NOT NULL CHECK (location IN ('header', 'footer_main', 'footer_quick', 'footer_categories', 'mobile')),
  
  -- Link content
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_library TEXT,
  icon_name TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES navigation_items(id) ON DELETE SET NULL,
  
  -- Order and visibility
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_new_tab BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- FOOTER CONTENT
-- ============================================================
-- Manageable footer sections and columns

CREATE TABLE IF NOT EXISTS footer_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Section identification
  section_key TEXT NOT NULL UNIQUE, -- e.g., 'company', 'links', 'contact', 'newsletter'
  
  -- Content
  title TEXT,
  content TEXT, -- HTML allowed
  icon_library TEXT,
  icon_name TEXT,
  
  -- Links within this section
  links JSONB DEFAULT '[]', -- Array of {label, url, is_new_tab}
  
  -- Order and visibility
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- SOCIAL LINKS
-- ============================================================
-- Centralized social media links

CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Platform identification
  platform TEXT NOT NULL UNIQUE, -- facebook, instagram, twitter, linkedin, youtube, tiktok, whatsapp
  
  -- Display info
  label TEXT NOT NULL, -- e.g., 'Facebook', 'Instagram'
  icon_library TEXT DEFAULT 'lucide',
  icon_name TEXT, -- e.g., 'Facebook', 'Instagram'
  
  -- Link
  url TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  
  -- Order
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- UPLOADED ICONS
-- ============================================================
-- Store uploaded SVG icons for reuse

CREATE TABLE IF NOT EXISTS uploaded_icons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Icon identification
  name TEXT NOT NULL, -- User-friendly name
  slug TEXT NOT NULL UNIQUE, -- URL-safe identifier
  
  -- SVG content
  svg_content TEXT NOT NULL,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER
);

-- ============================================================
-- TESTIMONIALS (Extended)
-- ============================================================
-- Customer testimonials/reviews

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Author info
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  avatar TEXT,
  
  -- Content
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  
  -- Media
  image TEXT,
  
  -- Visibility
  is_published BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Order
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- FAQs (Extended)
-- ============================================================
-- Frequently Asked Questions

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  -- Category
  category TEXT,
  
  -- Visibility
  is_published BOOLEAN DEFAULT TRUE,
  
  -- Order
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- REUSABLE CONTENT BLOCKS
-- ============================================================
-- Reusable content snippets for various pages

CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Block identification
  block_key TEXT NOT NULL UNIQUE, -- e.g., 'about_story', 'about_mission', 'about_vision', 'contact_info'
  block_type TEXT DEFAULT 'text', -- text, html, markdown, component
  
  -- Content
  title TEXT,
  content TEXT NOT NULL,
  
  -- Metadata
  page TEXT, -- e.g., 'about', 'contact', 'homepage'
  position TEXT, -- e.g., 'main', 'sidebar', 'footer'
  
  -- Order and visibility
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- COMPANY INFO (Extended from settings)
-- ============================================================
-- Additional company information for CMS

CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Info type
  info_key TEXT NOT NULL UNIQUE, -- e.g., 'founded_year', 'story', 'mission', 'vision', 'values'
  info_type TEXT DEFAULT 'text', -- text, html, number, date
  
  -- Content
  title TEXT,
  content TEXT NOT NULL,
  
  -- Media
  image TEXT,
  icon_library TEXT,
  icon_name TEXT,
  
  -- Order (for lists)
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- INDEXES
-- ============================================================

-- homepage_sections indexes
CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(sort_order);

-- feature_cards indexes
CREATE INDEX IF NOT EXISTS idx_feature_cards_section ON feature_cards(section_id);
CREATE INDEX IF NOT EXISTS idx_feature_cards_active ON feature_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_feature_cards_order ON feature_cards(sort_order);

-- statistics indexes
CREATE INDEX IF NOT EXISTS idx_statistics_context ON statistics(context);
CREATE INDEX IF NOT EXISTS idx_statistics_active ON statistics(is_active);
CREATE INDEX IF NOT EXISTS idx_statistics_order ON statistics(sort_order);

-- navigation_items indexes
CREATE INDEX IF NOT EXISTS idx_navigation_location ON navigation_items(location);
CREATE INDEX IF NOT EXISTS idx_navigation_parent ON navigation_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_active ON navigation_items(is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_order ON navigation_items(sort_order);

-- footer_sections indexes
CREATE INDEX IF NOT EXISTS idx_footer_sections_key ON footer_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_footer_sections_active ON footer_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_sections_order ON footer_sections(sort_order);

-- social_links indexes
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);
CREATE INDEX IF NOT EXISTS idx_social_links_visible ON social_links(is_visible);
CREATE INDEX IF NOT EXISTS idx_social_links_order ON social_links(sort_order);

-- uploaded_icons indexes
CREATE INDEX IF NOT EXISTS idx_uploaded_icons_slug ON uploaded_icons(slug);

-- testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(is_published);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials(sort_order);

-- faqs indexes
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs(sort_order);

-- content_blocks indexes
CREATE INDEX IF NOT EXISTS idx_content_blocks_key ON content_blocks(block_key);
CREATE INDEX IF NOT EXISTS idx_content_blocks_page ON content_blocks(page);
CREATE INDEX IF NOT EXISTS idx_content_blocks_active ON content_blocks(is_active);

-- company_info indexes
CREATE INDEX IF NOT EXISTS idx_company_info_key ON company_info(info_key);
CREATE INDEX IF NOT EXISTS idx_company_info_active ON company_info(is_active);

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

-- homepage_sections
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- feature_cards
CREATE TRIGGER update_feature_cards_updated_at
  BEFORE UPDATE ON feature_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- statistics
CREATE TRIGGER update_statistics_updated_at
  BEFORE UPDATE ON statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- navigation_items
CREATE TRIGGER update_navigation_items_updated_at
  BEFORE UPDATE ON navigation_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- footer_sections
CREATE TRIGGER update_footer_sections_updated_at
  BEFORE UPDATE ON footer_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- social_links
CREATE TRIGGER update_social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- testimonials
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- faqs
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- content_blocks
CREATE TRIGGER update_content_blocks_updated_at
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- company_info
CREATE TRIGGER update_company_info_updated_at
  BEFORE UPDATE ON company_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read homepage_sections" ON homepage_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public read feature_cards" ON feature_cards FOR SELECT USING (is_active = true);
CREATE POLICY "Public read statistics" ON statistics FOR SELECT USING (is_active = true);
CREATE POLICY "Public read navigation_items" ON navigation_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public read footer_sections" ON footer_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public read social_links" ON social_links FOR SELECT USING (is_visible = true);
CREATE POLICY "Public read uploaded_icons" ON uploaded_icons FOR SELECT USING (true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Public read faqs" ON faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Public read content_blocks" ON content_blocks FOR SELECT USING (is_active = true);
CREATE POLICY "Public read company_info" ON company_info FOR SELECT USING (is_active = true);

-- Admin full access for all tables
CREATE POLICY "Admin full homepage_sections" ON homepage_sections FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full feature_cards" ON feature_cards FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full statistics" ON statistics FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full navigation_items" ON navigation_items FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full footer_sections" ON footer_sections FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full social_links" ON social_links FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full uploaded_icons" ON uploaded_icons FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full testimonials" ON testimonials FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full faqs" ON faqs FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full content_blocks" ON content_blocks FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);
CREATE POLICY "Admin full company_info" ON company_info FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed default homepage sections
INSERT INTO homepage_sections (section_key, section_type, title, subtitle, description, sort_order, is_active, metadata) VALUES
  ('hero', 'hero', 'Your Premium Mobile Phone Destination', 'Discover the latest mobile phones, quality accessories, genuine spare parts, and professional repair services.', 'Shop Now|/products', 1, true, '{"trust_badge": "Trusted Phone Dealer in Nigeria"}'),
  ('about_intro', 'features_grid', 'Why Choose Mekfidel Communication?', 'We combine quality products with exceptional service.', 2, true, '{}'),
  ('cta', 'cta', 'Ready to Experience the Difference?', 'Visit our store or browse our catalog online.', 'Contact Us|/contact', 4, true, '{"button_secondary": "Browse Products|/products"}'),
  ('how_it_works', 'steps', 'How It Works', 'Simple steps to get started.', 5, true, '{}')
ON CONFLICT (section_key) DO NOTHING;

-- Seed default feature cards
INSERT INTO feature_cards (section_id, title, description, icon_library, icon_name, icon_color, sort_order, is_active)
SELECT 
  hs.id,
  fc.title,
  fc.description,
  fc.icon_library,
  fc.icon_name,
  fc.icon_color,
  fc.sort_order,
  true
FROM homepage_sections hs
CROSS JOIN (
  VALUES
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
INSERT INTO faqs (question, answer, category, sort_order, is_published) VALUES
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
-- Run these in Supabase SQL editor or dashboard
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('logos', 'logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']),
  ('products', 'products', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('banners', 'banners', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']),
  ('gallery', 'gallery', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('blog', 'blog', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('icons', 'icons', true, 102400, ARRAY['image/svg+xml', 'image/svg+xml']),
  ('uploads', 'uploads', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Public read products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Public read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public read blog" ON storage.objects FOR SELECT USING (bucket_id = 'blog');
CREATE POLICY "Public read icons" ON storage.objects FOR SELECT USING (bucket_id = 'icons');
CREATE POLICY "Public read uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

