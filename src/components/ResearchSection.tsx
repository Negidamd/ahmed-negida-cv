import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Activity, Cpu, Microscope, Database, Network } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const researchAreas = [
  {
    icon: Activity,
    title: "Neurodegenerative Disease Research",
    description: "Focus on Parkinson's disease subtyping, Lewy Body Dementia cognitive fluctuations, Alzheimer's biomarkers, and cholinergic system degeneration.",
    tags: ["Parkinson's", "LBD", "Alzheimer's"]
  },
  {
    icon: Brain,
    title: "Multimodal Brain Imaging",
    description: "Integration of structural MRI (T1, T2 FLAIR), functional MRI, diffusion MRI (DTI, tractography), and EEG for comprehensive disease characterization.",
    tags: ["MRI", "fMRI", "DTI", "EEG"]
  },
  {
    icon: Network,
    title: "Glymphatic Dysfunction",
    description: "Studying glymphatic dysfunction and its links to vascular integrity and cognition in neurodegenerative diseases.",
    tags: ["Sleep", "Cognition", "Vascular Health"]
  },
  {
    icon: Microscope,
    title: "Biomarker Discovery",
    description: "Identifying neuroimaging and fluid biomarkers for early disease detection, progression prediction, and treatment response monitoring.",
    tags: ["Imaging Biomarkers", "Fluid Biomarkers", "Precision Medicine"]
  },
  {
    icon: Database,
    title: "Clinical Trials Optimization",
    description: "Developing enrichment strategies and predictive models to optimize patient selection for disease-modifying clinical trials.",
    tags: ["Patient Stratification", "Trial Design", "Progression Modeling"]
  },
  {
    icon: Cpu,
    title: "Data Science & Artificial Intelligence",
    description: "Machine learning, deep learning, and AI algorithms for predictive modeling, biomarker discovery, and clinical decision support.",
    tags: ["Machine Learning", "Deep Learning", "Biostatistics"]
  }
];

interface Project {
  id: string;
  title: string;
  description: string | null;
  funding: string | null;
  photo_url: string | null;
  display_order: number | null;
}

const ResearchSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, funding, photo_url, display_order')
        .eq('visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="research" className="py-20 lg:py-28 bg-academic-gray-light relative">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-6 leading-tight">
            Research Focus & Expertise
          </h2>
          <div className="w-24 h-1 bg-gradient-accent mx-auto mb-8 rounded-full shadow-sm"></div>
          <p className="text-lg lg:text-xl text-academic-gray max-w-4xl mx-auto leading-relaxed">
            Dr. Negida's research is driven by the vision of advancing precision medicine in neurodegenerative 
            diseases through biomarker-driven patient stratification. By integrating multimodal neuroimaging, 
            fluid biomarkers, and data-driven computational models, his work aims to identify disease subtypes, 
            predict progression trajectories, and optimize patient selection for disease-modifying clinical trials.
          </p>
        </div>

        {/* Research Areas */}
        <div className="mb-20">
          <h3 className="text-2xl lg:text-3xl font-display font-bold text-primary mb-10 text-center">
            Core Research Areas
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {researchAreas.map((area, index) => {
              const IconComponent = area.icon;
              return (
                <Card key={index} className="p-6 bg-white/95 hover:bg-white hover:shadow-hover transition-all duration-500 group cursor-pointer hover:-translate-y-1 border-0 ring-1 ring-primary/10">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-accent rounded-xl mr-3.5 group-hover:scale-110 transition-transform duration-500 shadow-card">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg lg:text-xl font-display font-semibold text-primary leading-tight">
                      {area.title}
                    </h4>
                  </div>
                  
                  <p className="text-academic-gray mb-4 leading-relaxed text-base font-normal">
                    {area.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {area.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs font-medium">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Current Research Projects — only render when there are any */}
        {!loading && projects.length === 0 ? null : (
        <div>
          <h3 className="text-2xl lg:text-3xl font-display font-bold text-primary mb-10 text-center">
            Current Research Projects
          </h3>
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-7">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-20 w-full mb-5" />
                  <Skeleton className="h-6 w-1/3" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
              {projects.map((project) => (
                <Card key={project.id} className="p-6 bg-white/95 hover:bg-white hover:shadow-hover transition-all duration-500 group cursor-pointer hover:-translate-y-1 border-0 border-l-4 border-l-primary/30 hover:border-l-primary ring-1 ring-primary/10">
                  {project.photo_url && (
                    <div className="mb-5">
                      <img 
                        src={project.photo_url} 
                        alt={project.title}
                        className="w-full h-48 object-cover rounded-lg shadow-card"
                      />
                    </div>
                  )}
                  <h4 className="text-lg lg:text-xl font-display font-semibold text-primary mb-3 leading-tight">
                    {project.title}
                  </h4>
                  <p className="text-academic-gray mb-4 leading-relaxed text-base font-normal">
                    {project.description}
                  </p>
                  {project.funding && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      {project.funding}
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </section>
  );
};

export default ResearchSection;