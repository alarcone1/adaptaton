-- Disable RLS momentarily to avoid locking issues during policy changes
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all known duplicate policies to start fresh
DROP POLICY IF EXISTS "Profiles self" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles cohort peers" ON public.profiles;
DROP POLICY IF EXISTS "Profiles teacher" ON public.profiles;
DROP POLICY IF EXISTS "Profiles partner" ON public.profiles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create standard policies

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- 3. Teachers can view students in their cohorts (Expanded logic can be added later)
-- For now allowing basic read if role is teacher
CREATE POLICY "Teachers can view profiles"
ON public.profiles
FOR SELECT
USING (auth.jwt() ->> 'role' = 'teacher' OR exists(select 1 from public.profiles where id = auth.uid() and role = 'teacher'));

-- 4. Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin' OR exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
