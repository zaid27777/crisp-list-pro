/*
  # Add subtasks and notes functionality

  1. New Tables
    - `subtasks`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key to tasks)
      - `title` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `task_notes`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key to tasks)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own subtasks and notes
*/

-- Create subtasks table
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_notes table
CREATE TABLE IF NOT EXISTS public.task_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for subtasks
CREATE POLICY "Users can view subtasks of their own tasks" 
ON public.subtasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create subtasks for their own tasks" 
ON public.subtasks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update subtasks of their own tasks" 
ON public.subtasks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete subtasks of their own tasks" 
ON public.subtasks 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  )
);

-- Create policies for task_notes
CREATE POLICY "Users can view notes of their own tasks" 
ON public.task_notes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_notes.task_id 
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create notes for their own tasks" 
ON public.task_notes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_notes.task_id 
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update notes of their own tasks" 
ON public.task_notes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_notes.task_id 
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete notes of their own tasks" 
ON public.task_notes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_notes.task_id 
    AND tasks.user_id = auth.uid()
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_subtasks_updated_at
BEFORE UPDATE ON public.subtasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_notes_updated_at
BEFORE UPDATE ON public.task_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_task_notes_task_id ON public.task_notes(task_id);