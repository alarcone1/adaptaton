-- Create Attendance Table
CREATE TABLE IF NOT EXISTS public.course_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(course_id, student_id, date)
);

-- RLS Policies for Attendance
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
