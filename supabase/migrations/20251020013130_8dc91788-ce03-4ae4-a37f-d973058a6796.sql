-- Create teaching_modules table
CREATE TABLE public.teaching_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create invited_lectures table
CREATE TABLE public.invited_lectures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  event text,
  location text,
  date text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create professional_services table
CREATE TABLE public.professional_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  organization text,
  period text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teaching_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invited_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- Create policies for teaching_modules
CREATE POLICY "Teaching modules are viewable by everyone" 
ON public.teaching_modules FOR SELECT USING (true);

CREATE POLICY "Admins can insert teaching modules" 
ON public.teaching_modules FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update teaching modules" 
ON public.teaching_modules FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete teaching modules" 
ON public.teaching_modules FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for invited_lectures
CREATE POLICY "Invited lectures are viewable by everyone" 
ON public.invited_lectures FOR SELECT USING (true);

CREATE POLICY "Admins can insert invited lectures" 
ON public.invited_lectures FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update invited lectures" 
ON public.invited_lectures FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invited lectures" 
ON public.invited_lectures FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for professional_services
CREATE POLICY "Professional services are viewable by everyone" 
ON public.professional_services FOR SELECT USING (true);

CREATE POLICY "Admins can insert professional services" 
ON public.professional_services FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update professional services" 
ON public.professional_services FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete professional services" 
ON public.professional_services FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_teaching_modules_updated_at
BEFORE UPDATE ON public.teaching_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_publications_updated_at();

CREATE TRIGGER update_invited_lectures_updated_at
BEFORE UPDATE ON public.invited_lectures
FOR EACH ROW
EXECUTE FUNCTION public.update_publications_updated_at();

CREATE TRIGGER update_professional_services_updated_at
BEFORE UPDATE ON public.professional_services
FOR EACH ROW
EXECUTE FUNCTION public.update_publications_updated_at();