import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import ResearchSection from "@/components/ResearchSection";
import PublicationsSection from "@/components/PublicationsSection";
import RoadmapMapSection from "@/components/RoadmapMapSection";
import TeachingSection from "@/components/TeachingSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <RoadmapMapSection />
      <ResearchSection />
      <PublicationsSection />
      <TeachingSection />
      <ContactSection />
    </div>
  );
};

export default Index;
