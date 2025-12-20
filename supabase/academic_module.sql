-- 1. Master Catalog: Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subjects are viewable by everyone" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admins can manage subjects" ON public.subjects USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 2. Instances: Courses (The Virtual Classroom)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS: Teachers see their own courses, Students see enrolled courses, Admins see all
CREATE POLICY "Public courses view" ON public.courses FOR SELECT USING (
  -- Teacher of the course
  auth.uid() = teacher_id OR 
  -- Enrolled Student
  exists (select 1 from public.course_enrollments ce where ce.course_id = courses.id and ce.student_id = auth.uid()) OR
  -- Admin
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

CREATE POLICY "Admins can manage courses" ON public.courses USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- 3. Matriculation: Course Enrollments
CREATE TYPE public.enrollment_status AS ENUM ('active', 'completed', 'failed', 'dropped');

CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.enrollment_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, student_id)
);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own enrollments" ON public.course_enrollments FOR SELECT USING (
    auth.uid() = student_id OR
    exists (select 1 from public.courses c where c.id = course_enrollments.course_id and c.teacher_id = auth.uid()) OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

CREATE POLICY "Admins can manage enrollments" ON public.course_enrollments USING (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 4. Update Course Activities
-- Add course_id column, initially nullable to support existing data
ALTER TABLE public.course_activities ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- 5. Feedback and Activity Link for Evidences
ALTER TABLE public.evidences ADD COLUMN IF NOT EXISTS feedback TEXT;

-- 6. Fix RLS Recursion (Helper Function)
CREATE OR REPLACE FUNCTION public.is_course_teacher(course_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.courses
    WHERE id = course_uuid
    AND teacher_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redefine policies to use helper
DROP POLICY IF EXISTS "View own enrollments" ON public.course_enrollments;
CREATE POLICY "View own enrollments" ON public.course_enrollments FOR SELECT USING (
    auth.uid() = student_id OR
    public.is_course_teacher(course_id) OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

DROP POLICY IF EXISTS "Course Activities Visibility" ON public.course_activities;
CREATE POLICY "Course Activities Visibility" ON public.course_activities FOR SELECT USING (
    (course_id IS NOT NULL AND (
        public.is_course_teacher(course_id) OR
        exists (select 1 from public.course_enrollments ce where ce.course_id = course_activities.course_id and ce.student_id = auth.uid())
    )) OR

-- 7. Course Attendance
CREATE TABLE IF NOT EXISTS public.course_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(course_id, student_id, date)
);

ALTER TABLE public.course_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage attendance for their courses" ON public.course_attendance
    FOR ALL USING (
        public.is_course_teacher(course_id) OR
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

CREATE POLICY "Students can view their own attendance" ON public.course_attendance
    FOR SELECT USING (
        auth.uid() = student_id
    );

-- RLS Update for course_activities (New Logic)
DROP POLICY IF EXISTS "Teachers can manage activities for their cohorts" ON public.course_activities;

CREATE POLICY "Course Activities Visibility" ON public.course_activities FOR SELECT USING (
    -- If it has a course_id, check enrollment/teacher match
    (course_id IS NOT NULL AND (
        exists (select 1 from public.courses c where c.id = course_activities.course_id and c.teacher_id = auth.uid()) OR
        exists (select 1 from public.course_enrollments ce where ce.course_id = course_activities.course_id and ce.student_id = auth.uid())
    )) OR
    -- Fallback for legacy data with cohort_id (keep existing logic if needed or just allow admin)
    (course_id IS NULL AND exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
);

CREATE POLICY "Teachers manage their course activities" ON public.course_activities FOR ALL USING (
    exists (select 1 from public.courses c where c.id = course_activities.course_id and c.teacher_id = auth.uid())
);
