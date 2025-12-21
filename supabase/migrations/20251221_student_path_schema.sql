-- Student Path Schema Updates

-- 1. Course Activities: Timeline & Prerequisites
ALTER TABLE public.course_activities 
ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prerequisite_activity_id UUID REFERENCES public.course_activities(id) ON DELETE SET NULL;

-- 2. Evidences: History & Branching (Attempts)
ALTER TABLE public.evidences
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_evidence_id UUID REFERENCES public.evidences(id) ON DELETE SET NULL;

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_activities_sequence ON public.course_activities(course_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_evidences_parent ON public.evidences(parent_evidence_id);
