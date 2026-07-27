-- ============================================================
-- SERVICES TABLE
-- Production-ready services table for Mekfidel Communication Ltd
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Store icon name (e.g., "Smartphone", "Wrench", "Battery")
  color TEXT DEFAULT 'bg-blue-50 text-blue-600', -- Background and text color classes
  features TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of feature strings
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_services_order ON services(order_index);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- Set up RLS policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view active services)
CREATE POLICY "Public read access" ON services FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin full access" ON services FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

