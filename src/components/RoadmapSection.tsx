import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

const timelineData = [
  {
    year: "2025",
    title: "IMPACT-AD Fellowship Track",
    institution: "Alzheimer's Association & NIA/NIH",
    location: "National",
    description: "Advanced training in Alzheimer's disease and related dementias research, with focused mentorship from leaders in the field.",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/7a1e3e71-4701-4f51-a4cd-4c884aec28cf.png"
  },
  {
    year: "2023 - Present",
    title: "Postdoctoral Scholar",
    institution: "Virginia Commonwealth University",
    location: "Richmond, VA",
    description: "Division of Parkinson's Disease & Movement Disorders. Using advanced multimodal brain imaging (including EEG) to study cognitive impairment and sleep disorders in Parkinson's Disease, Alzheimer's Disease, and related dementias.",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/76ce2dee-8b66-4ee4-8dd2-3a641e99b170.webp"
  },
  {
    year: "2021 - 2023",
    title: "Postdoctoral Research Fellow",
    institution: "Harvard Medical School",
    location: "Boston, MA",
    description: "Global Neurosurgery Initiative. Joint affiliation as Research Fellow at Boston Children's Hospital. Studying global health disparities in neurological & neurosurgical diseases.",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/9f3d45f6-09cd-4f6b-854a-4ba7b8e3517d.png"
  },
  {
    year: "2020 - 2022",
    title: "Ph.D. by Publication",
    institution: "University of Portsmouth",
    location: "United Kingdom",
    description: "School of Pharmacy and Biomedical Science. Thesis: 'The HOPE and the HYPE in Parkinson's Disease Treatments.'",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/d06cda17-5aaa-468f-bcb7-b0e9ebf5aef8.png"
  },
  {
    year: "2019",
    title: "Neurosurgery Research Fellowship",
    institution: "Bahcesehir University",
    location: "Istanbul, Turkey",
    description: "Neurological Surgery Department, Medical Park Hospital. Studying Deep Brain Stimulation in Parkinson's and Huntington's disease patients.",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/d0a7baab-612d-4aa9-bb97-3b87996a3aa9.webp"
  },
  {
    year: "2012 - 2018",
    title: "Bachelor of Medicine & Surgery (MBBCh)",
    institution: "Zagazig University",
    location: "Zagazig, Egypt",
    description: "College of Human Medicine. MBBCh is the advanced high-education professional degree of medicine in Egypt (equivalent to the MD in the United States).",
    logoUrl: "https://assets.softr-files.com/applications/ee0b8793-88fb-46dc-80f5-1d9a3a387395/assets/b32ecaeb-0b02-4385-84e3-3282da1f70f2.png"
  }
];

const RoadmapSection = () => {
  return (
    <section id="roadmap" className="py-16 bg-academic-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Education & Training
          </h2>
          <div className="w-24 h-1 bg-gradient-accent mx-auto rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Horizontal timeline with stairs effect */}
          <div className="relative">
            {/* Main horizontal line */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-accent transform -translate-y-1/2 hidden lg:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 relative">
              {timelineData.map((item, index) => (
                <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Timeline dot on the line */}
                  <div className="absolute left-1/2 top-0 lg:top-1/2 transform -translate-x-1/2 lg:-translate-y-1/2 w-6 h-6 bg-accent rounded-full border-4 border-white shadow-lg z-10 hidden lg:block"></div>
                  
                  {/* Connecting line from dot to card */}
                  <div className={`absolute left-1/2 w-1 bg-primary/30 transform -translate-x-1/2 hidden lg:block ${index % 2 === 0 ? 'top-1/2 h-12' : 'bottom-1/2 h-12'}`}></div>
                  
                  {/* Year badge */}
                  <Badge className="mb-3 bg-primary text-white whitespace-nowrap inline-flex">
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.year}
                  </Badge>

                  {/* Content Card - alternating top and bottom */}
                  <Card className={`p-5 shadow-card hover:shadow-professional transition-all duration-300 bg-white border-t-4 border-accent group ${index % 2 === 0 ? 'lg:mt-16' : 'lg:mb-16'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-16 h-16 bg-white rounded-lg shadow-card p-2 flex items-center justify-center flex-shrink-0">
                        <img 
                          src={item.logoUrl} 
                          alt={`${item.institution} logo`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-primary mb-1 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm font-semibold text-academic-gray mb-1">
                          {item.institution}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {item.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-academic-gray leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
