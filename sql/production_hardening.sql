-- Idempotent migration for databases created with an earlier Mekfidel schema.
-- Run this once in the Supabase SQL Editor before deploying the matching code.

ALTER TABLE public.faqs
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'faqs'
      AND column_name = 'order'
  ) THEN
    EXECUTE 'UPDATE public.faqs SET sort_order = COALESCE(sort_order, "order", 0)';
  END IF;
END $$;

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS avatar TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_faqs_sort_order
  ON public.faqs(sort_order);

CREATE INDEX IF NOT EXISTS idx_testimonials_sort_order
  ON public.testimonials(sort_order);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured
  ON public.testimonials(is_featured);

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);
