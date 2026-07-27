-- Add services table to your Supabase database
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_order ON services(order_index);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- Set up RLS policies (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Allow only admins to insert services
CREATE POLICY "Only admins can insert services"
  ON services FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Allow only admins to update services
CREATE POLICY "Only admins can update services"
  ON services FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Allow only admins to delete services
CREATE POLICY "Only admins can delete services"
  ON services FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
