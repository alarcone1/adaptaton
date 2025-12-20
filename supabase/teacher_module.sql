-- Create course_activities table
CREATE TABLE IF NOT EXISTS public.course_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resource_library(id) ON DELETE RESTRICT,
    custom_instructions TEXT,
    due_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for course_activities
ALTER TABLE public.course_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can see activities for their cohorts
CREATE POLICY "Teachers can view activities for their cohorts"
ON public.course_activities
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.cohort_instructors ci
        WHERE ci.cohort_id = course_activities.cohort_id
        AND ci.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.cohort_id = course_activities.cohort_id
        AND p.role = 'student'
    )
);

-- Policy: Teachers can insert/update/delete activities for their cohorts
CREATE POLICY "Teachers can manage activities for their cohorts"
ON public.course_activities
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.cohort_instructors ci
        WHERE ci.cohort_id = course_activities.cohort_id
        AND ci.user_id = auth.uid()
    )
);

-- Ensure cohort_instructors exists (it was seen in types but let's be safe or just policies)
-- The user said "Tabla cohort_instructors: (Tabla intermedia)... Asegura que existan".
-- It exists in database.types.ts, so likely already created. 
-- Just in case, we add RLS for it if not present, but user instructions said "El Docente SOLO puede ver/editar datos de las cohortes donde aparezca en cohort_instructors".

-- Policy for cohort_instructors: Teachers need to see their own assignments
ALTER TABLE public.cohort_instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own instructor assignments"
ON public.cohort_instructors
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);
