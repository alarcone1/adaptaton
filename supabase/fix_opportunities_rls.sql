-- FIX: Add missing RLS policies for opportunities

-- Ensure RLS is enabled (it should be, but just in case)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- 1. Admins: Full Access (CRUD) to ALL opportunities
CREATE POLICY "Admins Full Access Opportunities" ON public.opportunities
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Authenticated Users (Student, Teacher, Partner): View ONLY Active Opportunities
--    This allows them to see the opportunities in the "feed" or list.
CREATE POLICY "Authenticated Read Active Opportunities" ON public.opportunities
FOR SELECT TO authenticated
USING (
  is_active = true
);

-- 3. Partners: View/Edit OWN opportunities (Optional, but good practice if partners manage them)
--    We can add this later or now. For now, let's stick to Admin control + Public view.
