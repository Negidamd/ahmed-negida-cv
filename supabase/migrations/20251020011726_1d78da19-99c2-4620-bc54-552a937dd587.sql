-- Add display_order column to publications table
ALTER TABLE public.publications 
ADD COLUMN display_order integer NOT NULL DEFAULT 0;