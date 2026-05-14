import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Globe, BookOpen, Award, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TeachingModule {
  id: string;
  title: string;
  description: string | null;
}

interface InvitedLecture {
  id: string;
  title: string;
  event: string | null;
  location: string | null;
  date: string | null;
}


const impactMetrics = [
  { icon: Users, label: "Trainees Trained", value: "30,000+" },
  { icon: Globe, label: "Years Operating", value: "11 Years" },
  { icon: BookOpen, label: "Training Modules", value: "7 Courses" },
  { icon: Award, label: "Geographic Reach", value: "MENA Region" }
];

const TeachingSection = () => {
  const [modules, setModules] = useState<TeachingModule[]>([]);
  const [lectures, setLectures] = useState<InvitedLecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modulesData, lecturesData] = await Promise.all([
        supabase.from('teaching_modules').select('*').eq('visible', true).order('display_order', { ascending: true }),
        supabase.from('invited_lectures').select('*').eq('visible', true).order('display_order', { ascending: true })
      ]);

      if (modulesData.data) setModules(modulesData.data);
      if (lecturesData.data) setLectures(lecturesData.data);
    } catch (error) {
      console.error('Error fetching teaching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="teaching" className="py-20 lg:py-28 bg-academic-gray-light">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-6 leading-tight">
            Teaching
          </h2>
          <div className="w-24 h-1 bg-gradient-accent mx-auto mb-8 rounded-full shadow-sm"></div>
          <p className="text-lg lg:text-xl text-academic-gray max-w-4xl mx-auto leading-relaxed">
            Dr. Negida believes that building research capacity is crucial to improving healthcare 
            and medical education, particularly in resource-limited settings. As a researcher from 
            a developing country who had the opportunity to learn and conduct medical research early 
            in his career, he is committed to giving back to his community by providing accessible, 
            high-quality clinical research training.
          </p>
        </div>

        {/* Negida Academy */}
        <div className="max-w-7xl mx-auto mb-16">
          <Card className="p-8 shadow-professional bg-white/95 border-0 ring-1 ring-primary/10">
            <div className="flex flex-col lg:flex-row gap-8 items-center mb-8">
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-2xl bg-primary/10 flex items-center justify-center shadow-card">
                  <GraduationCap className="w-20 h-20 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-3xl lg:text-4xl font-display font-bold text-primary mb-4">
                  Negida Research Academy LLC
                </h3>
                <Badge variant="secondary" className="mb-6 text-base px-4 py-2">
                  Established 2014 | Largest Clinical Research Training Platform in MENA
                </Badge>
                <p className="text-academic-gray leading-relaxed text-lg font-light">
                  Founded in 2014 in Egypt, Negida Research Academy has grown to become the largest 
                  clinical research training platform in the Middle East and North Africa. The academy 
                  provides comprehensive online training programs covering all aspects of clinical research, 
                  from study design and methodology to data analysis, scientific writing, and academic publishing.
                </p>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {impactMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 shadow-card">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2 font-display">
                      {metric.value}
                    </div>
                    <div className="text-sm text-academic-gray font-semibold uppercase tracking-wide">
                      {metric.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Training Modules */}
            <div className="mb-8">
              <h4 className="text-xl lg:text-2xl font-semibold text-primary mb-5 text-center">
                Core Training Modules
              </h4>
              {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {modules.map((module) => (
                  <div key={module.id} className="flex items-start gap-3 text-academic-gray">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                      <p className="text-base font-light leading-relaxed">{module.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Testimonial */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm mb-6 border-0 ring-1 ring-primary/10">
              <p className="text-academic-gray italic mb-3 text-lg leading-relaxed font-light">
                "Dr. Negida's course is very useful, well-prepared and organized. It is more than 
                a course, it is a road map of knowledge and capacity-building."
              </p>
              <p className="text-base text-academic-gray font-semibold">
                — Negida Academy Graduate
              </p>
            </Card>

            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => window.open('https://courses.negida.com/store', '_blank')}
                className="gap-2 px-8 py-6 text-base font-semibold"
              >
                <ExternalLink className="w-5 h-5" />
                Visit Negida Research Academy
              </Button>
            </div>
          </Card>
        </div>

        {/* Additional Teaching Activities */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl lg:text-3xl font-display font-bold text-primary mb-10 text-center">
            Invited Lectures & Workshops
          </h3>
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : (
            <div className="space-y-5">
              {lectures.map((lecture) => (
                <Card key={lecture.id} className="p-5 bg-white/95 hover:bg-white hover:shadow-hover transition-all duration-500 border-0 ring-1 ring-primary/10">
                  <div className="font-semibold text-primary mb-2 text-lg">
                    {lecture.title}
                  </div>
                  <p className="text-base text-academic-gray font-light">
                    {lecture.event}
                    {lecture.location && ` • ${lecture.location}`}
                    {lecture.date && ` (${lecture.date})`}
                  </p>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default TeachingSection;
