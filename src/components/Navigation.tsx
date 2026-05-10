import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Download, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Education", href: "#roadmap" },
  { label: "Research", href: "#research" },
  { label: "Publications", href: "#publications" },
  { label: "Teaching", href: "#teaching" },
  { label: "Contact", href: "#contact" },
  { label: "Admin", href: "/auth", isExternal: true },
];

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 500);

      // Detect active section
      const sections = navItems.map(item => item.href.substring(1));
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string, isExternal?: boolean) => {
    if (isExternal) {
      window.location.href = href;
      return;
    }
    const element = document.getElementById(href.substring(1));
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
            : "bg-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={scrollToTop}
              className={cn(
                "text-xl font-serif font-bold transition-colors",
                isScrolled ? "text-primary" : "text-white"
              )}
            >
              Ahmed Negida
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                item.isExternal ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-sm font-medium text-primary font-semibold transition-colors hover:text-primary/80"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href, item.isExternal)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      activeSection === item.href.substring(1)
                      ? "text-primary"
                      : isScrolled
                      ? "text-academic-gray"
                      : "text-white/90"
                    )}
                  >
                    {item.label}
                  </button>
                )
              ))}
              <Button
                size="sm"
                variant={isScrolled ? "default" : "secondary"}
                className="gap-2"
                onClick={() => window.open("#", "_blank")}
              >
                <Download className="w-4 h-4" />
                CV
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className={cn("w-6 h-6", isScrolled ? "text-primary" : "text-white")} />
              ) : (
                <Menu className={cn("w-6 h-6", isScrolled ? "text-primary" : "text-white")} />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in">
              {navItems.map((item) => (
                item.isExternal ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block w-full text-left px-4 py-2 rounded-md bg-primary/10 text-primary font-semibold transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href, item.isExternal)}
                    className={cn(
                      "block w-full text-left px-4 py-2 rounded-md transition-colors",
                      activeSection === item.href.substring(1)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/5 text-academic-gray"
                    )}
                  >
                    {item.label}
                  </button>
                )
              ))}
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={() => window.open("#", "_blank")}
              >
                <Download className="w-4 h-4" />
                Download CV
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-primary text-white rounded-full shadow-professional hover:bg-primary/90 transition-all duration-300 animate-fade-in"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default Navigation;
