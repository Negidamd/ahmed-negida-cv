import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, ExternalLink, Github } from "lucide-react";
import { 
  SiGooglescholar, 
  SiOrcid, 
  SiResearchgate,
  SiX
} from '@icons-pack/react-simple-icons';

const socialLinks = [
  { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/in/ahmednegida" },
  { name: "Google Scholar", icon: SiGooglescholar, url: "https://scholar.google.com/citations?user=HURlCI8AAAAJ&hl=en" },
  { name: "ORCID", icon: SiOrcid, url: "https://orcid.org/0000-0001-5363-6369" },
  { name: "X / Twitter", icon: SiX, url: "https://x.com/NegidaMD" },
  { name: "ResearchGate", icon: SiResearchgate, url: "https://www.researchgate.net/profile/Ahmed-Negida-2" },
  { name: "GitHub", icon: Github, url: "https://github.com/ahmednegida" }
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="max-w-5xl mx-auto">
          <Card className="p-6 lg:p-8 bg-white/95 hover:bg-white hover:shadow-hover transition-all duration-500 border-0 ring-1 ring-primary/10">
            <div className="grid lg:grid-cols-[40%_60%] gap-8 lg:gap-10">
              {/* Left: Contact Information */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-semibold text-primary mb-6">
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl shadow-card flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary mb-1 text-base">Email</div>
                      <p className="text-academic-gray text-sm font-light">ahmed.negida@vcuhealth.org</p>
                      <p className="text-academic-gray text-sm font-light">ahmed.said.negida@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl shadow-card flex-shrink-0">
                      <ExternalLink className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary mb-1 text-base">Institutional Affiliation</div>
                      <p className="text-academic-gray text-sm font-light leading-relaxed">
                        Department of Neurology<br />
                        Virginia Commonwealth University School of Medicine<br />
                        Richmond, VA
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Professional Profiles */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-semibold text-primary mb-6">
                  Professional Profiles
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Button 
                        key={link.name}
                        variant="outline" 
                        className="gap-2 justify-start py-4 text-sm font-semibold h-auto"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{link.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
