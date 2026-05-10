-- Create storage buckets for publications and projects
INSERT INTO storage.buckets (id, name, public) 
VALUES ('publication-photos', 'publication-photos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-photos', 'project-photos', true);

-- Add photo_url columns to tables
ALTER TABLE public.publications ADD COLUMN photo_url text;
ALTER TABLE public.projects ADD COLUMN photo_url text;

-- Create storage policies for publication photos
CREATE POLICY "Publication photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'publication-photos');

CREATE POLICY "Admins can upload publication photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'publication-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update publication photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'publication-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete publication photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'publication-photos' AND has_role(auth.uid(), 'admin'::app_role));

-- Create storage policies for project photos
CREATE POLICY "Project photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-photos');

CREATE POLICY "Admins can upload project photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update project photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete project photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-photos' AND has_role(auth.uid(), 'admin'::app_role));