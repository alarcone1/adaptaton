-- Seed Script for Academic Module

-- 1. Create Subjects (Catalog)
INSERT INTO public.subjects (id, name, description, credits) VALUES
    (gen_random_uuid(), 'Reciclaje I', 'Fundamentos del manejo de residuos y economía circular.', 3),
    (gen_random_uuid(), 'Innovación Sostenible', 'Desarrollo de soluciones creativas para problemas ambientales.', 4)
ON CONFLICT DO NOTHING;

-- 2. Create a Course (Instance) for "Reciclaje I"
-- Teacher: afb03d98-f174-4509-bd67-a1bef8c53309
-- Cohort: 84655a56-9c82-4310-a760-cb040760fc7c
DO $$
DECLARE
    subject_id_val UUID;
    course_id_val UUID;
BEGIN
    -- Get ID for Reciclaje I
    SELECT id INTO subject_id_val FROM public.subjects WHERE name = 'Reciclaje I' LIMIT 1;

    -- Create Course if it doesn't exist
    INSERT INTO public.courses (cohort_id, subject_id, teacher_id, start_date, end_date)
    VALUES (
        '84655a56-9c82-4310-a760-cb040760fc7c', -- Cohort Alpha
        subject_id_val,
        'afb03d98-f174-4509-bd67-a1bef8c53309', -- The Teacher
        '2025-01-15',
        '2025-06-15'
    )
    RETURNING id INTO course_id_val;

    -- 3. Enroll Students
    -- Enroll specific student: 00ebbf57-769c-4e6b-8b65-f68150c55e1e
    INSERT INTO public.course_enrollments (course_id, student_id, status)
    VALUES (course_id_val, '00ebbf57-769c-4e6b-8b65-f68150c55e1e', 'active')
    ON CONFLICT DO NOTHING;

    -- Enroll other random students from the same cohort
    INSERT INTO public.course_enrollments (course_id, student_id, status)
    SELECT course_id_val, id, 'active'
    FROM public.profiles
    WHERE role = 'student' 
      AND cohort_id = '84655a56-9c82-4310-a760-cb040760fc7c'
      AND id != '00ebbf57-769c-4e6b-8b65-f68150c55e1e'
    LIMIT 4
    ON CONFLICT DO NOTHING;

END $$;
