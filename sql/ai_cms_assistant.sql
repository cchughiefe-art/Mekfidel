-- Mekfidel AI CMS Assistant audit log and rollback storage.
-- Run once in the Supabase SQL Editor before enabling the assistant in Vercel.

CREATE TABLE IF NOT EXISTS public.ai_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  instruction TEXT NOT NULL CHECK (char_length(instruction) BETWEEN 3 AND 2000),
  summary TEXT NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]'::JSONB,
  rollback_actions JSONB NOT NULL DEFAULT '[]'::JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applying', 'applied', 'failed', 'rolled_back')),
  applied_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_ai_change_requests_created_at ON public.ai_change_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_change_requests_created_by ON public.ai_change_requests(created_by);

ALTER TABLE public.ai_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage AI change requests" ON public.ai_change_requests;
DROP POLICY IF EXISTS "Admins read own AI change requests" ON public.ai_change_requests;
CREATE POLICY "Admins read own AI change requests"
  ON public.ai_change_requests
  FOR SELECT
  USING (
    auth.uid() = created_by
    AND auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'editor'))
  );

REVOKE ALL ON public.ai_change_requests FROM anon;
REVOKE ALL ON public.ai_change_requests FROM authenticated;
GRANT SELECT ON public.ai_change_requests TO authenticated;
