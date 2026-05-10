import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";

const timelineData = [
  {
    year: "2012 - 2018",
    title: "Bachelor of Medicine & Surgery (MBBCh)",
    institution: "Zagazig University",
    location: "Zagazig, Egypt",
    description: "College of Human Medicine. MBBCh equivalent to MD in the United States.",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/b32ecaeb-0b02-4385-84e3-3282da1f70f2.png"
  },
  {
    year: "2019",
    title: "Research Fellowship: Deep Brain Stimulation in Parkinson's disease",
    institution: "Bahcesehir University",
    location: "Istanbul, Turkey",
    description: "Studying Deep Brain Stimulation in Parkinson's and Huntington's disease patients.",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/d0a7baab-612d-4aa9-bb97-3b87996a3aa9.webp"
  },
  {
    year: "2020 - 2022",
    title: "Ph.D. by Publication in Parkinson's Disease treatment trials",
    institution: "University of Portsmouth",
    location: "United Kingdom",
    description: "Thesis: 'The HOPE and the HYPE in Parkinson's Disease Treatments.'",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/d06cda17-5aaa-468f-bcb7-b0e9ebf5aef8.png"
  },
  {
    year: "2021 - 2023",
    title: "Research Fellow",
    institution: "Harvard Medical School",
    location: "Boston, MA",
    description: "Global Neurosurgery Initiative studying health disparities in neurological diseases.",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/9f3d45f6-09cd-4f6b-854a-4ba7b8e3517d.png"
  },
  {
    year: "2023 - Present",
    title: "Postdoctoral Scholar: Lewy Body Dementia and Parkinson's Disease",
    institution: "Virginia Commonwealth University",
    location: "Richmond, VA",
    description: "Using advanced multimodal brain imaging to study neurodegenerative diseases.",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/76ce2dee-8b66-4ee4-8dd2-3a641e99b170.webp"
  },
  {
    year: "2025",
    title: "IMPACT-AD Fellowship Track",
    institution: "Alzheimer's Association & NIA/NIH",
    location: "San Diego, CA",
    description: "Advanced training in Alzheimer's disease and related dementias research.",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/7a1e3e71-4701-4f51-a4cd-4c884aec28cf.png"
  }
].sort((a, b) => {
  // Extract start years for sorting - newest first
  const yearA = parseInt(a.year.split(/[-\s]/)[0]);
  const yearB = parseInt(b.year.split(/[-\s]/)[0]);
  return yearB - yearA;
});

const RoadmapMapSection = () => {
  return (
    <section id="roadmap" className="py-16 bg-academic-gray-light">
      <div className="container mx-auto px-8 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-6 leading-tight">
            Education & Training Journey
          </h2>
          <div className="w-24 h-1 bg-gradient-accent mx-auto mb-8 rounded-full shadow-sm"></div>
        </div>

        <div className="overflow-x-auto pb-6">
          <div className="flex items-center gap-2 min-w-max px-4">
            {timelineData.map((item, index) => (
              <div key={index} className="flex items-center">
                {/* Card */}
                <Card 
                  className="relative bg-white/95 hover:bg-white border-0 border-t-4 border-t-accent shadow-card hover:shadow-professional transition-all duration-300 animate-fade-in w-64 h-80 flex-shrink-0 ring-1 ring-primary/10"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex flex-col gap-2 flex-1">
                      {/* Logo */}
                      <div className="flex justify-center">
                        <div className="w-32 h-32 bg-white rounded-lg shadow-card p-2 flex items-center justify-center border-2 border-accent/20">
                          <img 
                            src={item.logoUrl}
                            alt={`${item.institution} logo`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <Badge className="bg-primary text-white text-xs px-2 py-0.5">
                            {item.year}
                          </Badge>
                        </div>
                        
                        <div className="text-base font-bold text-primary mb-1.5 leading-tight text-center">
                          {item.title}
                        </div>
                        
                        <p className="text-xs font-semibold text-academic-gray mb-1 text-center">
                          {item.institution}
                        </p>
                        
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {item.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Arrow pointing from older to newer (leftward, toward progression) */}
                {index < timelineData.length - 1 && (
                  <div className="flex flex-col items-center mx-2">
                    <ArrowLeft className="w-6 h-6 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapMapSection;
