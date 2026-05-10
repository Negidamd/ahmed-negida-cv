import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, FileText, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  pmid: string | null;
  photo_url: string | null;
  visible: boolean;
  display_order: number;
  type: string | null;
}

// Topics for the clickable cloud. Each has a regex matched against title + abstract.
// `weight` biases the font-size scale a little so "Parkinson's Disease" never gets dwarfed.
const TOPICS: { label: string; short?: string; pattern: RegExp; weight?: number }[] = [
  { label: "Parkinson's Disease", short: "PD", pattern: /parkinson/i, weight: 1.2 },
  { label: "Lewy Body Dementia", short: "LBD", pattern: /lewy\s*body/i, weight: 1.1 },
  { label: "Dementia with Lewy Bodies", short: "DLB", pattern: /\bDLB\b|dementia\s+with\s+lewy/i },
  { label: "Alzheimer's Disease", short: "AD", pattern: /alzheimer/i, weight: 1.1 },
  { label: "Vascular Dementia", short: "VD", pattern: /vascular\s+dement|cerebral\s+microbleed|vascular\s+cognit/i },
  { label: "Dementia", pattern: /\bdement(ia|ias)\b/i, weight: 1.05 },
  { label: "Mild Cognitive Impairment", short: "MCI", pattern: /\bMCI\b|mild\s+cognitive\s+impair/i },
  { label: "Cognitive Fluctuations", pattern: /cognitive\s+fluctuat/i },
  { label: "Cholinergic System", pattern: /cholinerg/i },
  { label: "Deep Brain Stimulation", short: "DBS", pattern: /deep\s+brain\s+stim|\bDBS\b|subthalamic|pallidal/i },
  { label: "EEG / Electrophysiology", short: "EEG", pattern: /\bEEG\b|electroencephalo/i },
  { label: "MRI / Neuroimaging", short: "MRI", pattern: /\bMRI\b|magnetic\s+resonance|neuroimag/i },
  { label: "Biomarkers", pattern: /biomarker/i },
  { label: "Machine Learning", pattern: /machine\s+learning|deep\s+learning|neural\s+network|ResNet|artificial\s+intelligence/i },
  { label: "Clinical Trials", pattern: /clinical\s+trial|randomized\s+control|\bRCT\b/i },
];

// Type priority for sorting — primary research (Research Article + Preprint) ranks higher
const TYPE_PRIORITY: Record<string, number> = {
  "Research Article": 1,
  Preprint: 2,
  "Book Chapter": 3,
  "Review / Meta-analysis": 4,
  "Conference Abstract": 5,
  Letter: 6,
  "Editorial / Commentary": 7,
  Erratum: 8,
  Other: 9,
};

// Type-specific badge component (colored by publication type)
const TYPE_STYLES: Record<string, { label: string; classes: string }> = {
  "Research Article": {
    label: "Research Article",
    classes: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  "Review / Meta-analysis": {
    label: "Review",
    classes: "bg-violet-100 text-violet-800 border border-violet-200",
  },
  Preprint: {
    label: "Preprint",
    classes: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  "Conference Abstract": {
    label: "Conf. Abstract",
    classes: "bg-orange-100 text-orange-800 border border-orange-300",
  },
  "Book Chapter": {
    label: "Book Chapter",
    classes: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  Letter: {
    label: "Letter",
    classes: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  "Editorial / Commentary": {
    label: "Editorial",
    classes: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  Erratum: {
    label: "Erratum",
    classes: "bg-rose-100 text-rose-700 border border-rose-200",
  },
  Other: {
    label: "Other",
    classes: "bg-slate-100 text-slate-700 border border-slate-200",
  },
};

const TypeBadge = ({ type }: { type: string | null }) => {
  if (!type) return null;
  const style = TYPE_STYLES[type] || TYPE_STYLES.Other;
  return (
    <span
      className={`flex-shrink-0 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${style.classes}`}
      title={type}
    >
      {style.label}
    </span>
  );
};

const PublicationsSection = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      // Load ALL publications (visible + hidden). Hidden ones surface when user
      // clicks "Show all" or picks a topic that filters into them.
      const { data, error } = await supabase
        .from("publications")
        .select(
          "id,title,authors,journal,year,doi,abstract,pmid,photo_url,visible,display_order,type"
        )
        .order("year", { ascending: false })
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error("Error fetching publications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compute paper count per topic (using ALL publications, not just visible)
  const topicCounts = useMemo(() => {
    return TOPICS.map((t) => {
      const count = publications.filter(
        (p) =>
          t.pattern.test(p.title || "") ||
          t.pattern.test(p.abstract || "") ||
          t.pattern.test(p.journal || "")
      ).length;
      return { ...t, count };
    }).filter((t) => t.count > 0);
  }, [publications]);

  // Map topic counts to a font-size scale (1.0x to ~1.8x)
  const topicScale = useMemo(() => {
    const counts = topicCounts.map((t) => t.count);
    const min = Math.min(...counts, 1);
    const max = Math.max(...counts, 1);
    const span = Math.max(max - min, 1);
    return (count: number, weight = 1): number => {
      const norm = (count - min) / span; // 0..1
      return 0.85 + norm * 0.8 * weight; // 0.85x..1.65x (or up to ~2x with weight)
    };
  }, [topicCounts]);

  // Apply filters: showAll toggle, topic, then search
  const filtered = useMemo(() => {
    let list = showAll || selectedTopic || search ? publications : publications.filter((p) => p.visible);

    if (selectedTopic) {
      const topic = TOPICS.find((t) => t.label === selectedTopic);
      if (topic) {
        list = list.filter(
          (p) =>
            topic.pattern.test(p.title || "") ||
            topic.pattern.test(p.abstract || "") ||
            topic.pattern.test(p.journal || "")
        );
      }
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.abstract || "").toLowerCase().includes(q) ||
          (p.journal || "").toLowerCase().includes(q) ||
          (p.authors || "").toLowerCase().includes(q) ||
          (p.year || "").includes(q)
      );
    }

    // When filtering or showing all, sort by: type priority (primary research first), then year desc.
    // Default curated view uses the explicit display_order set in DB.
    if (showAll || selectedTopic || search) {
      list = [...list].sort((a, b) => {
        const aP = TYPE_PRIORITY[a.type || "Other"] ?? 9;
        const bP = TYPE_PRIORITY[b.type || "Other"] ?? 9;
        if (aP !== bP) return aP - bP;
        const ay = parseInt(a.year || "0", 10) || 0;
        const by = parseInt(b.year || "0", 10) || 0;
        if (by !== ay) return by - ay;
        return (a.display_order || 0) - (b.display_order || 0);
      });
    } else {
      list = [...list].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }

    return list;
  }, [publications, showAll, selectedTopic, search]);

  const visibleCount = publications.filter((p) => p.visible).length;
  const totalCount = publications.length;
  const isExpanded = showAll || !!selectedTopic || !!search;

  return (
    <section id="publications" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-6 leading-tight">
            Selected Publications
          </h2>
          <div className="w-24 h-1 bg-gradient-accent mx-auto mb-8 rounded-full shadow-sm"></div>
          <p className="text-lg lg:text-xl text-academic-gray max-w-4xl mx-auto mb-8 leading-relaxed">
            Dr. Negida has authored and co-authored 280+ peer-reviewed publications in leading
            neuroscience and medical journals, with more than 8,300 citations and an H-index of 43.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "https://scholar.google.com/citations?hl=en&user=HURlCI8AAAAJ&view_op=list_works&sortby=pubdate",
                  "_blank"
                )
              }
              className="gap-2 px-6 py-5 text-base font-semibold"
            >
              <ExternalLink className="w-5 h-5" />
              Google Scholar Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("https://orcid.org/0000-0001-5363-6369", "_blank")}
              className="gap-2 px-6 py-5 text-base font-semibold"
            >
              <ExternalLink className="w-5 h-5" />
              ORCID Profile
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "https://pubmed.ncbi.nlm.nih.gov/?term=%22Negida+A%22&sort=date&size=200",
                  "_blank"
                )
              }
              className="gap-2 px-6 py-5 text-base font-semibold"
            >
              <ExternalLink className="w-5 h-5" />
              PubMed Author Page
            </Button>
          </div>
        </div>

        {/* Topic Word Cloud */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="text-center text-sm uppercase tracking-wider text-academic-gray mb-4 font-semibold">
            Browse by topic
          </div>
          <div className="flex flex-wrap gap-3 justify-center items-center px-4">
            {topicCounts.map((t) => {
              const active = selectedTopic === t.label;
              const fontSize = topicScale(t.count, t.weight);
              return (
                <button
                  key={t.label}
                  onClick={() => {
                    setSelectedTopic(active ? null : t.label);
                    setSearch("");
                  }}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 border ${
                    active
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-primary border-primary/20 hover:border-primary hover:bg-primary/5"
                  }`}
                  style={{ fontSize: `${fontSize}rem` }}
                  title={`${t.count} publication${t.count === 1 ? "" : "s"}`}
                >
                  {t.label}
                  {t.short && t.short !== t.label ? (
                    <span className="opacity-70 ml-1 font-normal">({t.short})</span>
                  ) : null}
                  <span className={`ml-2 text-xs font-bold ${active ? "text-white/80" : "text-primary/60"}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search + Show-all controls */}
        <div className="max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-gray pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, journal, year, or abstract…"
              className="pl-10 h-12 text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-academic-gray hover:text-primary"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant={showAll ? "default" : "outline"}
            onClick={() => {
              setShowAll(!showAll);
              if (!showAll) setSelectedTopic(null);
            }}
            className="h-12 px-6 whitespace-nowrap"
          >
            {showAll ? `Showing all ${totalCount}` : `Show all ${totalCount}`}
          </Button>
        </div>

        {/* Active filter / result count */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          {isExpanded ? (
            <div className="flex flex-wrap gap-2 justify-center items-center text-sm text-academic-gray">
              <span>
                Showing <strong className="text-primary">{filtered.length}</strong> of {totalCount} publications
              </span>
              {selectedTopic && (
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20"
                >
                  Topic: {selectedTopic}
                  <X className="w-3 h-3" />
                </button>
              )}
              {(selectedTopic || search || showAll) && (
                <button
                  onClick={() => {
                    setSelectedTopic(null);
                    setSearch("");
                    setShowAll(false);
                  }}
                  className="text-primary underline hover:text-primary-glow"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm text-academic-gray">
              Showing <strong className="text-primary">{visibleCount}</strong> selected — pick a topic above
              or <button onClick={() => setShowAll(true)} className="text-primary underline">browse all {totalCount}</button>.
            </div>
          )}
        </div>

        {/* Publication list */}
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
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center text-academic-gray">
              No publications match the current filter.
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setSearch("");
                }}
                className="ml-2 text-primary underline"
              >
                Clear filters
              </button>
            </Card>
          ) : (
            filtered.map((pub) => (
              <Card
                key={pub.id}
                className="p-6 bg-white/95 hover:bg-white hover:shadow-professional transition-all duration-500 group hover:-translate-y-1 border-0 ring-1 ring-primary/10"
              >
                <div className="flex gap-4">
                  {pub.photo_url ? (
                    <div className="flex-shrink-0">
                      <img
                        src={pub.photo_url}
                        alt={pub.title}
                        className="w-32 h-32 object-cover rounded-lg shadow-card"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-gradient-accent transition-all duration-500 shadow-card">
                        <FileText className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="text-lg font-semibold text-primary leading-tight group-hover:text-primary-glow transition-colors flex-1">
                        {pub.title}
                      </div>
                      <TypeBadge type={pub.type} />
                    </div>

                    {pub.authors && (
                      <p className="text-sm text-academic-gray mb-2 leading-relaxed">{pub.authors}</p>
                    )}

                    <p className="text-base font-medium text-academic-gray mb-3">
                      {pub.journal && <span className="italic">{pub.journal}</span>}
                      {pub.year && ` (${pub.year})`}
                    </p>

                    {pub.abstract && (
                      <p className="text-sm text-academic-gray leading-relaxed mb-3 line-clamp-4">
                        {pub.abstract}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                      {pub.doi && (
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary"
                          onClick={() => window.open(`https://doi.org/${pub.doi}`, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          DOI: {pub.doi}
                        </Button>
                      )}
                      {pub.pmid && (
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary"
                          onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}`, "_blank")}
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
            onClick={() =>
              window.open(
                "https://scholar.google.com/citations?hl=en&user=HURlCI8AAAAJ&view_op=list_works&sortby=pubdate",
                "_blank"
              )
            }
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
