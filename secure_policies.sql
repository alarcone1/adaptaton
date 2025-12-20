-- 1. PROTECTION OF MINORS (View Strategy)
-- Create a secure view that excludes sensitive columns (phone, email, cedula)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name, last_name, avatar_url, bio, role, cohort_id
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. EVIDENCES SECURITY (RLS)
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;

-- Policy: Student Isolation (See own + Cohort peers)
CREATE POLICY "Student Cohort Isolation" ON public.evidences
FOR SELECT TO authenticated
USING (
  -- 1. Own evidence
  user_id = auth.uid() OR
  -- 2. Peer evidence (Same Cohort)
  (
    -- Check if requester is a student
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
    AND
    -- Check if evidence belongs to someone in the same cohort
    (SELECT cohort_id FROM public.profiles WHERE id = public.evidences.user_id) = 
    (SELECT cohort_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- Policy: Partner Unified Visibility (Validated & Highlighted only)
CREATE POLICY "Partner Portfolio Access" ON public.evidences
FOR SELECT TO authenticated
USING (
  -- Requester is Partner
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'partner')
  AND
  -- Evidence is quality-assured
  status = 'validated' AND is_highlighted = true
);

-- Policy: Teachers & Admins (Full Access)
CREATE POLICY "Staff Full Access" ON public.evidences
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Allow students to insert their own evidence
CREATE POLICY "Students insert own evidence" ON public.evidences
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
);

-- Allow students to update own draft evidence
CREATE POLICY "Students update own drafts" ON public.evidences
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'draft');
