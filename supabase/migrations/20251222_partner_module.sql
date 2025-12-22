-- Add is_highlighted column if it doesn't exist (idempotent check not easy in pure SQL block without plpgsql DO, so we'll add it via ALTER TABLE IF NOT EXISTS logic or just assume it needs adding if missing in next steps. For now, let's include it safely)

-- Safely add is_highlighted to evidences
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evidences' AND column_name = 'is_highlighted') THEN
        ALTER TABLE public.evidences ADD COLUMN is_highlighted BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create Leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID REFERENCES public.profiles(id) NOT NULL,
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    evidence_id UUID REFERENCES public.evidences(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS FOR LEADS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Partner can INSERT their own leads
DROP POLICY IF EXISTS "Partners can create leads" ON public.leads;
CREATE POLICY "Partners can create leads" ON public.leads
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = partner_id 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'partner')
);

-- Partner can VIEW their own leads
DROP POLICY IF EXISTS "Partners can view own leads" ON public.leads;
CREATE POLICY "Partners can view own leads" ON public.leads
FOR SELECT TO authenticated
USING (
    auth.uid() = partner_id
);

-- Admin has full access to leads
DROP POLICY IF EXISTS "Admins full access leads" ON public.leads;
CREATE POLICY "Admins full access leads" ON public.leads
FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- RLS FOR EVIDENCES (PARTNER VIEW)
-- Partners can only see Validated AND Highlighted evidences
DROP POLICY IF EXISTS "Partners view highlighted evidences" ON public.evidences;
CREATE POLICY "Partners view highlighted evidences" ON public.evidences
FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'partner')
    AND status = 'validated'
    AND is_highlighted = true
);

-- Ensure Partners can view Student Profiles (needed for the UI cards)
-- We assume basic profile reading is open to authenticated, but let's make sure specific policy exists or covers it.
-- Existing "Public Profiles are viewable by everyone" might cover it, but let's be explicit if needed.
-- For now, we rely on existing profiles policies. If query fails, we add specific policy.
