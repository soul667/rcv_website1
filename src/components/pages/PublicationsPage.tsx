import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ExternalLink,
  BookOpen,
  Users,
  ChevronDown,
  TrendingUp,
  Award,
  Globe,
  Library,
  X
} from "lucide-react";

import { BackButton } from '../BackButton';
import { YamlPublication, loadAllYamlPublications } from "../../utils/publicationLoader";
import { useRouter } from '../Router';
import { loadAllAuthors, AuthorData } from '../../utils/authorLoader';
import { useLanguage } from '../LanguageContext';

const TYPES = ["All", "Journal", "Conference", "Preprint"];

// Bilingual translations dictionary
const translations = {
  en: {
    headerTitle: "Academic Output",
    pageTitle: "Publications",
    pageSubtitle: "Cutting-edge research in robotics, computer vision, and autonomous systems.",
    totalPubs: "Total Publications",
    journalPapers: "Journal Papers",
    conferencePapers: "Conference Papers",
    recent: "Recent (2024+)",
    searchPlaceholder: "Search by title, author, venue, or keyword...",
    clear: "Clear",
    filter: "Filter",
    all: "All Types",
    journal: "Journal",
    conference: "Conference",
    preprint: "Preprint",
    allYears: "All Years",
    showing: "Showing",
    of: "of",
    pubsText: "publications",
    noPubs: "No results found",
    tryAdjusting: "Try adjusting your search or filters",
    reset: "Reset all",
    featured: "Featured",
    showAbstract: "Abstract",
    hideAbstract: "Close",
    paper: "Paper",
    doi: "DOI",
    noLinks: "Internal Only",
    toggleLang: "中"
  },
  zh: {
    headerTitle: "学术成果",
    pageTitle: "发表论文",
    pageSubtitle: "RCV实验室在机器人、计算机视觉和自主系统领域的尖端研究。",
    totalPubs: "论文总数",
    journalPapers: "期刊论文",
    conferencePapers: "会议论文",
    recent: "近期成果 (2024+)",
    searchPlaceholder: "搜索标题、作者、发表地或关键词...",
    clear: "清除",
    filter: "筛选",
    all: "全部类型",
    journal: "期刊",
    conference: "会议",
    preprint: "预印本",
    allYears: "所有年份",
    showing: "显示",
    of: "共",
    pubsText: "篇论文",
    noPubs: "未找到相关论文",
    tryAdjusting: "请尝试调整搜索或筛选条件",
    reset: "重置筛选",
    featured: "重点推荐",
    showAbstract: "摘要",
    hideAbstract: "收起",
    paper: "论文详情",
    doi: "DOI",
    noLinks: "仅内阅",
    toggleLang: "EN"
  }
};

type FilterType = "All" | "Journal" | "Conference" | "Preprint";

function StatCard({
  icon: Icon,
  value,
  label,
  delay
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
      className="relative group overflow-hidden rounded-xl border border-white/[0.08] bg-[#2a2a35]/40 backdrop-blur-xl p-4 transition-all duration-500 hover:border-white/[0.2] hover:bg-white/[0.05]"
    >
      <div className="absolute -right-2 -top-2 w-16 h-16 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 pointer-events-none group-hover:scale-125 group-hover:-rotate-12">
        <Icon className="w-full h-full text-white" />
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-500 flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-2xl font-light tracking-tight text-white mb-0.5 leading-none">
            {value}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-medium group-hover:text-white/60 transition-colors duration-300 line-clamp-1">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}
function YearSection({ year }: { year: number }) {
  return (
    <div className="sticky top-0 z-20 pt-8 pb-4 bg-gray-900">
      <div className="flex items-center gap-6">
        <span className="text-3xl font-light tracking-tighter text-white/80 font-mono italic opacity-90">{year}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-white/[0.15] to-transparent" />
      </div>
    </div>
  );
}

function PublicationCard({ pub, index, t, authors }: {
  pub: YamlPublication;
  index: number;
  t: typeof translations.en;
  authors: AuthorData[];
}) {
  const [expanded, setExpanded] = useState(false);
  const { navigateTo } = useRouter();

  // Find author match
  const handleAuthorClick = (authorName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Normalize and robustly match author
    const normalizedQuery = authorName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const matchedAuthor = authors.find((a: AuthorData) => {
      const nameMatch = a.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedQuery;
      const nameEnMatch = a.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedQuery;
      // also match partial for robust mapping "Chao Tang" vs "Tang Chao"
      const parts = authorName.toLowerCase().split(/[ \-]/);
      const crossMatch = parts.length >= 2 && a.nameEn.toLowerCase().includes(parts[0]) && a.nameEn.toLowerCase().includes(parts[parts.length-1]);
      
      return nameMatch || nameEnMatch || crossMatch;
    });

    if (matchedAuthor) {
      navigateTo('member-profile', { memberId: matchedAuthor.id, previousPage: 'publications' });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden
        ${pub.highlighted
          ? "border-white/[0.18] bg-white/[0.04] hover:border-white/40 hover:bg-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          : "border-white/[0.08] bg-[#2a2a35]/20 hover:border-white/[0.15] hover:bg-[#2a2a35]/40"
        }`}
    >
      {/* Visual Accents */}
      {pub.highlighted && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/40 via-white/10 to-transparent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="p-8 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border ${
                pub.type === "Journal"
                  ? "bg-white/[0.08] text-white/90 border-white/20"
                  : pub.type === "Conference"
                    ? "bg-white/[0.04] text-white/60 border-white/10"
                    : "bg-transparent text-white/40 border-white/5"
              }`}
            >
              {pub.type === "Journal" ? t.journal : pub.type === "Conference" ? t.conference : t.preprint}
            </span>
            
            {pub.highlighted && (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white border border-white/30 animate-pulse">
                <Award className="w-3 h-3" />
                {t.featured}
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-white/20 group-hover:text-white/40 transition-colors">#{pub.id.slice(0, 15)}</span>
        </div>

        <h3 className="text-xl font-light text-white mb-4 leading-snug group-hover:text-white transition-colors duration-300">
          {pub.title}
        </h3>

        <div className="flex items-start gap-2 mb-4">
          <div className="text-[14px] text-white/50 leading-relaxed font-light">
            {pub.authors.map((author, i) => (
              <span key={i}>
                {i > 0 && ", "}
                <span 
                  onClick={(e) => handleAuthorClick(author, e)}
                  className={`transition-colors duration-300 ${author.includes("Tang Chao") || author.includes("Chao Tang") || author.includes("Yichen Wang") ? "text-white/80 font-medium cursor-pointer hover:text-white hover:underline underline-offset-4" : "hover:text-white/70 cursor-pointer"}` }
                >
                  {author}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[14px] text-white/70 mb-6 italic opacity-80 group-hover:opacity-100 transition-opacity">
          <span>{pub.venue}</span>
        </div>

        {pub.keywords && pub.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {pub.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.03] text-white/30 border border-white/[0.05] group-hover:border-white/10 group-hover:text-white/50 transition-all"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        <AnimatePresence>
          {expanded && pub.abstract && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden border-t border-white/5 mt-4 pt-6"
            >
              <p className="text-[14px] text-white/40 leading-relaxed font-light italic mb-6">
                {pub.abstract}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {(pub.url || pub.doi || pub.abstract) && (
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-6">
              {pub.url && (
                <a
                  href={pub.url}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-white/50 hover:text-white transition-all group/link"
                >
                  <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  {t.paper}
                </a>
              )}
              {pub.doi && (
                <a
                  href={`https://doi.org/${pub.doi.replace('https://doi.org/','')}`}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-white/50 hover:text-white transition-all group/link"
                >
                  <Globe className="w-3.5 h-3.5 opacity-50 group-hover/link:rotate-12 transition-transform" />
                  {t.doi}
                </a>
              )}
            </div>
            
            {pub.abstract && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all text-white/40 hover:text-white"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function PublicationsPage() {
  const { navigateTo } = useRouter();
  const { language } = useLanguage();
  // Safe cast since the user's component only supports 'en' | 'zh'
  const langKey = language === 'en' ? 'en' : 'zh';
  const t = translations[langKey];

  const [publications, setPublications] = useState<YamlPublication[]>([]);
  const [authors, setAuthors] = useState<AuthorData[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [pubs, auths] = await Promise.all([
          loadAllYamlPublications(),
          loadAllAuthors()
        ]);
        setPublications(pubs);
        setAuthors(auths);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  const years = useMemo(
    () => Array.from(new Set(publications.map((p: YamlPublication) => p.year))).sort((a, b) => (b as number) - (a as number)),
    [publications]
  );

  const stats = useMemo(() => ({
    total: publications.length,
    journal: publications.filter((p: YamlPublication) => p.type === "Journal").length,
    conference: publications.filter((p: YamlPublication) => p.type === "Conference").length,
    recent: publications.filter((p: YamlPublication) => p.year >= 2024).length
  }), [publications]);

  const filteredPubs = useMemo(() => {
    return publications.filter((pub: YamlPublication) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        query === "" ||
        pub.title.toLowerCase().includes(query) ||
        pub.authors.some((a: string) => a.toLowerCase().includes(query)) ||
        pub.venue.toLowerCase().includes(query) ||
        (pub.keywords && pub.keywords.some((k: string) => k.toLowerCase().includes(query)));

      const matchesType = activeFilter === "All" || pub.type === activeFilter;
      const matchesYear = yearFilter === null || pub.year === yearFilter;

      return matchesSearch && matchesType && matchesYear;
    });
  }, [searchQuery, activeFilter, yearFilter, publications]);

  const groupedByYear = useMemo(() => {
    const groups: Record<number, YamlPublication[]> = {};
    filteredPubs.forEach((pub: YamlPublication) => {
      if (!groups[pub.year]) groups[pub.year] = [];
      groups[pub.year].push(pub);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, pubs]) => ({ year: Number(year), pubs: pubs as YamlPublication[] }));
  }, [filteredPubs]);

  return (
    <div className="min-h-screen bg-gray-900 text-white selection:bg-white/20 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton onClick={() => navigateTo('home')} className="md:hidden" />
      </div>

      {/* Hero directly aligned with Research Page styling */}
      <section className="relative pt-12 pb-12 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="inline-block mb-4">
              <span 
                className="text-[10px] sm:text-xs tracking-[0.2em] text-white/60 uppercase font-light border border-white/10 px-3.5 py-1 rounded-full backdrop-blur-sm bg-white/5"
                style={{
                  fontFamily: langKey === 'zh'
                    ? '"Microsoft YaHei", "微软雅黑", sans-serif'
                    : 'inherit',
                  letterSpacing: langKey === 'zh' ? '0.3em' : '0.2em'
                }}
              >
                {t.headerTitle}
              </span>
            </div>
            
            <h1 
              className="text-4xl md:text-6xl font-extralight tracking-wide text-white leading-tight block mb-4"
              style={{
                fontWeight: 200,
                letterSpacing: langKey === 'zh' ? '0.08em' : '0.04em',
                fontFamily: langKey === 'zh'
                  ? '"Microsoft YaHei", "微软雅黑", sans-serif'
                  : 'inherit',
              }}
            >
              {t.pageTitle}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 pb-40 relative z-10">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50 mx-auto mb-4"></div>
            <p className="text-white/40">Loading academic outputs...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
              <StatCard icon={BookOpen} value={stats.total} label={t.totalPubs} delay={0.1} />
              <StatCard icon={Library} value={stats.journal} label={t.journalPapers} delay={0.2} />
              <StatCard icon={Users} value={stats.conference} label={t.conferencePapers} delay={0.3} />
              <StatCard icon={TrendingUp} value={stats.recent} label={t.recent} delay={0.4} />
            </div>

            {/* Filters & Search */}
            <div className="sticky top-20 z-40 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-gray-900 border border-white/[0.08] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* Desktop: single row | Mobile: search on top, filters below */}
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Search */}
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-12 pl-12 pr-12 bg-transparent text-[14px] text-white placeholder:text-white/20 focus:outline-none rounded-t-2xl md:rounded-none md:rounded-l-2xl transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px bg-white/5 self-stretch" />
                  <div className="md:hidden h-px bg-white/5 mx-3" />

                  {/* Filters row: type buttons + year select side by side */}
                  <div className="flex items-center gap-1 px-2 py-1.5 md:py-0">
                    <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar flex-1">
                      {(["All", "Journal", "Conference", "Preprint"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setActiveFilter(type as typeof activeFilter)}
                          className={`px-3 md:px-4 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider transition-all duration-500 whitespace-nowrap ${
                            activeFilter === type
                              ? "bg-white text-gray-900 shadow-lg"
                              : "text-white/40 hover:text-white/80 hover:bg-white/5"
                          }`}
                        >
                          {type === "All" ? t.all : type === "Journal" ? t.journal : type === "Conference" ? t.conference : t.preprint}
                        </button>
                      ))}
                    </div>

                    {/* Year Filter */}
                    <div className="relative flex-shrink-0">
                      <select
                        value={yearFilter === null ? "" : yearFilter.toString()}
                        onChange={(e) => setYearFilter(e.target.value === "" ? null : parseInt(e.target.value))}
                        className="appearance-none h-9 pl-3 pr-8 bg-transparent text-[12px] font-semibold text-white/50 hover:text-white focus:outline-none rounded-lg cursor-pointer transition-all"
                      >
                        <option value="" className="bg-gray-900">{t.allYears}</option>
                        {years.map((y: number) => (
                          <option key={y} value={y} className="bg-gray-900">{y}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* List */}
            <div className="space-y-12">
              {groupedByYear.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-40 text-center border border-white/[0.03] rounded-3xl bg-white/[0.01]"
                >
                  <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-8 border border-white/5">
                    <Search className="w-8 h-8 text-white/10" />
                  </div>
                  <h3 className="text-2xl font-light text-white/80 mb-4">{t.noPubs}</h3>
                  <p className="text-white/30 text-sm mb-10 max-w-xs leading-relaxed">
                    {t.tryAdjusting}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("All");
                      setYearFilter(null);
                    }}
                    className="px-10 py-3 bg-white text-gray-900 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl"
                  >
                    {t.reset}
                  </button>
                </motion.div>
              ) : (
                groupedByYear.map(({ year, pubs }: { year: number, pubs: YamlPublication[] }) => (
                  <div key={year} className="relative">
                    <YearSection year={year} />
                    <div className="grid grid-cols-1 gap-6 mt-8">
                      <AnimatePresence mode="popLayout">
                        {pubs.map((pub: YamlPublication, idx: number) => (
                          <PublicationCard
                            key={pub.id}
                            pub={pub}
                            index={idx}
                            t={t}
                            authors={authors}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Custom styles for scrollbar and fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;300;500&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace !important; }
      `}} />
    </div>
  );
}
