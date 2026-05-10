-- Create publications table to store fetched publications
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pmid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  journal TEXT,
  year TEXT,
  type TEXT,
  impact TEXT,
  authors TEXT,
  doi TEXT,
  abstract TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view publications (public data)
CREATE POLICY "Publications are viewable by everyone" 
ON public.publications 
FOR SELECT 
USING (true);

-- Create policy to allow insert for authenticated users (for admin updates)
CREATE POLICY "Authenticated users can insert publications" 
ON public.publications 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy to allow update for authenticated users
CREATE POLICY "Authenticated users can update publications" 
ON public.publications 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policy to allow delete for authenticated users
CREATE POLICY "Authenticated users can delete publications" 
ON public.publications 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_publications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW
EXECUTE FUNCTION public.update_publications_updated_at();