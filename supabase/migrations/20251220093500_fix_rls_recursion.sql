-- Function to check teacher status without triggering RLS recursion
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

-- Update course_enrollments policy to use the function
DROP POLICY IF EXISTS "View own enrollments" ON public.course_enrollments;

CREATE POLICY "View own enrollments" ON public.course_enrollments FOR SELECT USING (
    auth.uid() = student_id OR
    public.is_course_teacher(course_id) OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Update course_activities policy to use the function (it also had similar logic)
DROP POLICY IF EXISTS "Course Activities Visibility" ON public.course_activities;

CREATE POLICY "Course Activities Visibility" ON public.course_activities FOR SELECT USING (
    -- If it has a course_id, check enrollment (student) or teacher (function)
    (course_id IS NOT NULL AND (
        public.is_course_teacher(course_id) OR
        exists (select 1 from public.course_enrollments ce where ce.course_id = course_activities.course_id and ce.student_id = auth.uid())
    )) OR
    -- Fallback/Admin
    (course_id IS NULL AND exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')) OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
