-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid conflict
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create the policy
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);
