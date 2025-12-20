-- ADMIN MODULE UPDATES
-- 1. Resource Library Table (Bank of Resources)
CREATE TABLE IF NOT EXISTS public.resource_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    base_description TEXT,
    resource_url TEXT,
    metrics_schema JSONB DEFAULT '[]'::jsonb, -- Array of { label, type, required }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Resource Library
ALTER TABLE public.resource_library ENABLE ROW LEVEL SECURITY;

-- Admins: Full Access
CREATE POLICY "Admins Full Access Resources" ON public.resource_library
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Students/Teachers: Read Only (So they can see instructions)
CREATE POLICY "Public Read Access Resources" ON public.resource_library
FOR SELECT TO authenticated
USING (true);


-- 2. Opportunities Updates
-- Add is_active flag
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Note: We cannot easily alter the enum type 'cohort_type' in a migration without recreating it.
-- Instead, we will rely on frontend logic to handle 'all' by leaving target_cohort_type NULL or specific convention.
-- OR we can add a text check constraint if strictly needed, but let's stick to the existing enum for now.
-- If 'all' is needed, we interpret NULL `target_cohort_type` as 'all'.
