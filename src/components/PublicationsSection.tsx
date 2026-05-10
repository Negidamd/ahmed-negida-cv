import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Publication {
  id: string;
  title: string;
  authors: string | null;
  journal: string | null;
  year: string | null;
  doi: string | null;
  abstract: string | null;
  pmid: string;
  photo_url: string | null;
}

const PublicationsSection = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="publications" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-6 leading-tight">
            Selected Publications
          </h2>
          <div className="w-24 h-1 bg-gradient-accent mx-auto mb-8 rounded-full shadow-sm"></div>
          <p className="text-lg lg:text-xl text-academic-gray max-w-4xl mx-auto mb-8 leading-relaxed">
            Dr. Negida has authored and co-authored over 150 peer-reviewed publications in leading 
            neuroscience and medical journals, with more than 7,000 citations and an H-index of 40.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://scholar.google.com/citations?hl=en&user=HURlCI8AAAAJ&view_op=list_works&sortby=pubdate', '_blank')}
              className="gap-2 px-6 py-5 text-base font-semibold"
            >
              <ExternalLink className="w-5 h-5" />
              Google Scholar Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://orcid.org/0000-0001-5363-6369', '_blank')}
              className="gap-2 px-6 py-5 text-base font-semibold"
            >
              <ExternalLink className="w-5 h-5" />
              ORCID Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://pubmed.ncbi.nlm.nih.gov/?term=%22Negida+A%22&sort=date&size=200', '_blank')}
              className="gap-2 px-6 py-5 text-base font-semibold"
            >
              <ExternalLink className="w-5 h-5" />
              PubMed Author Page
            </Button>
          </div>
        </div>

        {/* Featured Publications */}
        <div className="space-y-5 max-w-6xl mx-auto">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-5">
                  <div className="flex gap-4">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            publications.map((pub) => (
              <Card key={pub.id} className="p-6 bg-white/95 hover:bg-white hover:shadow-professional transition-all duration-500 group cursor-pointer hover:-translate-y-1 border-0 ring-1 ring-primary/10">
                <div className="flex gap-4">
                  {pub.photo_url ? (
                    <div className="flex-shrink-0">
                      <img 
                        src={pub.photo_url} 
                        alt={pub.title}
                        className="w-32 h-32 object-cover rounded-lg shadow-card"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-gradient-accent transition-all duration-500 shadow-card">
                        <FileText className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-primary mb-2 leading-tight group-hover:text-primary-glow transition-colors">
                      {pub.title}
                    </div>
                    
                    {pub.authors && (
                      <p className="text-sm text-academic-gray mb-3 leading-relaxed">
                        {pub.authors}
                      </p>
                    )}
                    
                    <p className="text-base font-medium text-academic-gray mb-4">
                      {pub.journal && <span className="italic">{pub.journal}</span>}
                      {pub.year && ` (${pub.year})`}
                    </p>
                    
                    {pub.abstract && (
                      <p className="text-sm text-academic-gray leading-relaxed mb-4">
                        {pub.abstract}
                      </p>
                    )}
                    
                    <div className="flex gap-5">
                      {pub.doi && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-primary"
                          onClick={() => window.open(`https://doi.org/${pub.doi}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          DOI: {pub.doi}
                        </Button>
                      )}
                      {pub.pmid && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-primary"
                          onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          PMID: {pub.pmid}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={() => window.open('https://scholar.google.com/citations?hl=en&user=HURlCI8AAAAJ&view_op=list_works&sortby=pubdate', '_blank')}
            className="gap-2 px-8 py-6 text-base font-semibold"
          >
            <ExternalLink className="w-5 h-5" />
            View All Publications on Google Scholar
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PublicationsSection;
