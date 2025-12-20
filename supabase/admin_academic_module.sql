-- Create Cohorts table
DO $$ BEGIN
    CREATE TYPE cohort_type AS ENUM ('minor', 'adult');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.cohorts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type cohort_type NOT NULL DEFAULT 'minor',
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add cohort_id to profiles (1:1 relationship for students)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id);

-- Create Cohort Instructors table (Many-to-Many for teachers)
CREATE TABLE IF NOT EXISTS public.cohort_instructors (
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (cohort_id, user_id)
);

-- Enable RLS
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_instructors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Cohorts
CREATE POLICY "Admins can manage cohorts" 
    ON public.cohorts 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can view cohorts" 
    ON public.cohorts 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- RLS Policies for Cohort Instructors
CREATE POLICY "Admins can manage cohort instructors" 
    ON public.cohort_instructors 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Teachers can view their assignments" 
    ON public.cohort_instructors 
    FOR SELECT 
    USING (auth.uid() = user_id);
