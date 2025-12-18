-- Fix Infinite Recursion in RLS

-- 1. Create a helper function to check if user is admin WITHOUT triggering RLS recursion
-- SECURITY DEFINER allows this function to run with the privileges of the creator
CREATE OR REPLACE FUNCTION public.authorize_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a helper function for teachers as well
CREATE OR REPLACE FUNCTION public.authorize_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() 
    AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Policies to use these functions
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR ALL
USING (authorize_admin());

CREATE POLICY "Teachers can view profiles"
ON public.profiles
FOR SELECT
USING (authorize_teacher());

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
