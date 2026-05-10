import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroProfile from "@/assets/ahmed-negida-profile.png";
import { BookOpen, GraduationCap, Users, Award } from "lucide-react";
import { useCounterAnimation } from "@/hooks/use-counter-animation";

const AnimatedStat = ({ icon: Icon, label, value, targetNumber, suffix = "" }: {
  icon: any;
  label: string;
  value: string;
  targetNumber: number;
  suffix?: string;
}) => {
  const count = useCounterAnimation(targetNumber, 2500);
  
  return (
    <Card className="p-6 bg-white/95 hover:bg-white hover:shadow-hover transition-all duration-500 hover:-translate-y-1 group border-0 ring-1 ring-primary/10">
      <div className="flex flex-col items-center text-center">
        <div className="p-3.5 bg-gradient-accent rounded-xl mb-4 group-hover:scale-110 transition-all duration-500 shadow-card">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-4xl font-bold text-primary mb-2 font-display">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-xs text-academic-gray font-medium uppercase tracking-wider">
          {label}
        </div>
      </div>
    </Card>
  );
};

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { icon: BookOpen, label: "Publications", value: "280+", targetNumber: 280, suffix: "+" },
    { icon: GraduationCap, label: "Citations", value: "8,300+", targetNumber: 8300, suffix: "+" },
    { icon: Award, label: "H-index", value: "43", targetNumber: 43, suffix: "" },
    { icon: Users, label: "Trainees", value: "30,000+", targetNumber: 30000, suffix: "+" }
  ];

  return (
    <section id="about" className="relative min-h-screen bg-gradient-hero flex items-center justify-center py-20 lg:py-28 pt-24 overflow-hidden">
      {/* Refined background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-primary-glow/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container mx-auto px-8 lg:px-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Photo and Bio Layout - 35% / 65% */}
          <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6 lg:gap-10 items-start">
            {/* Left Column - Photo and Key Info - 35% */}
            <div className="flex flex-col items-center lg:items-start animate-fade-in text-center lg:text-left">
              {/* Profile Image */}
              <div className="relative w-full max-w-md mb-6">
                <div className="absolute inset-0 bg-gradient-accent rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
                <Card className="relative p-2.5 shadow-professional bg-white hover:shadow-hover transition-all duration-700 hover:scale-[1.01] border-0 ring-1 ring-primary/10">
                  <img
                    src={heroProfile}
                    alt="Dr. Ahmed Negida - Research Scientist"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                </Card>
              </div>

              {/* Info Below Photo */}
              <div className="text-white">
                <h1 className="text-5xl lg:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-white via-white/98 to-white/95 bg-clip-text text-transparent leading-tight">
                  Ahmed Negida
                </h1>
                <p className="text-xl lg:text-2xl mb-4 text-white/95 font-light tracking-wide">
                  MBBCh, PhD
                </p>
                <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
                  <Badge className="text-primary bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-card px-3.5 py-1.5 text-sm font-medium border-0 ring-1 ring-primary/20">
                    Research Scientist
                  </Badge>
                  <Badge className="text-primary bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-card px-3.5 py-1.5 text-sm font-medium border-0 ring-1 ring-primary/20">
                    Neurodegenerative Diseases
                  </Badge>
                  <Badge className="text-primary bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-card px-3.5 py-1.5 text-sm font-medium border-0 ring-1 ring-primary/20">
                    Clinical Research Educator
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Right Column - Bio and Buttons - 65% */}
            <div className="text-center lg:text-left text-white animate-fade-in lg:pl-8" style={{ animationDelay: '0.2s' }}>
              
              <div className="space-y-5 mb-8 text-white/90 text-base lg:text-lg leading-relaxed font-normal max-w-3xl">
                <p className="leading-loose">
                  Dr. Ahmed Negida is a postdoctoral scholar at the Virginia Commonwealth University 
                  Department of Neurology, where he conducts translational research on neurodegenerative 
                  diseases. His work combines multimodal brain imaging—including structural T1 and T2 
                  FLAIR MRI, functional MRI, diffusion MRI, and EEG—with advanced data science techniques 
                  such as machine learning, deep learning, and artificial intelligence to uncover 
                  biomarkers and therapeutic targets for personalized patient care.
                </p>
                <p className="leading-loose">
                  Beyond his research, Dr. Negida is the founder of Negida Academy LLC, established in 
                  2014 in Egypt. The academy has become the largest clinical research training platform 
                  in the Middle East and North Africa, empowering more than 30,000 medical students, 
                  trainees, and physicians with high-quality education in scientific research and 
                  academic writing.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="shadow-professional hover:shadow-hover transition-all duration-500 hover:-translate-y-1 font-semibold text-base px-8 py-6"
                  onClick={() => scrollToSection('research')}
                >
                  View My Research
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="shadow-professional hover:shadow-hover transition-all duration-500 hover:-translate-y-1 font-semibold text-base px-8 py-6"
                  onClick={() => scrollToSection('publications')}
                >
                  Explore Publications
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="shadow-professional hover:shadow-hover transition-all duration-500 hover:-translate-y-1 font-semibold text-base px-8 py-6"
                  onClick={() => window.open('#', '_blank')}
                >
                  Download CV
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {stats.map((stat, index) => (
            <AnimatedStat
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              targetNumber={stat.targetNumber}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;