-- Add status column to tasks table to support "do it later" functionality
ALTER TABLE public.tasks 
ADD COLUMN status TEXT NOT NULL DEFAULT 'today' CHECK (status IN ('today', 'later', 'completed'));