-- Add visible column to publications table
ALTER TABLE public.publications 
ADD COLUMN visible boolean DEFAULT true NOT NULL;

-- Make pmid nullable to allow unpublished papers
ALTER TABLE public.publications 
ALTER COLUMN pmid DROP NOT NULL;

-- Add unique partial index on pmid to prevent duplicates (only for non-empty pmid)
CREATE UNIQUE INDEX idx_publications_pmid_unique 
ON public.publications(pmid) 
WHERE pmid IS NOT NULL AND pmid != '';