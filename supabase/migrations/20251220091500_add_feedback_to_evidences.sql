-- Add feedback column to evidences table
ALTER TABLE public.evidences ADD COLUMN IF NOT EXISTS feedback TEXT;
