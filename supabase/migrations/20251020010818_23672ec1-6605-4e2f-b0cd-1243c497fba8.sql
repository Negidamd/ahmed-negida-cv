-- Add visible column to projects table
ALTER TABLE public.projects 
ADD COLUMN visible boolean NOT NULL DEFAULT true;