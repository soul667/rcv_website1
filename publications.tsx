import { useState, useMemo, forwardRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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

// --- DATA & TYPES INLINED FOR PORTABILITY ---
export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: "Journal" | "Conference" | "Preprint";
  abstract?: string;
  doi?: string;
  url?: string;
  keywords?: string[];
  highlighted?: boolean;
}

const publications: Publication[] = [
  {
    id: "wang2025slam",
    title: "NeRF-Enhanced Visual SLAM with Semantic Scene Graph for Dynamic Environments",
    authors: ["Yichen Wang", "Hao Zhang", "Jiawei Liu", "Mingyu Chen"],
    venue: "IEEE Transactions on Robotics (T-RO)",
    year: 2025,
    type: "Journal",
    abstract: "We present a novel visual SLAM framework that leverages Neural Radiance Fields (NeRF) for robust 3D reconstruction in dynamic environments. Our approach integrates semantic scene graphs to detect and filter dynamic objects, achieving state-of-the-art accuracy on TUM RGB-D and KITTI benchmarks.",
    doi: "10.1109/TRO.2025.001234",
    url: "#",
    keywords: ["SLAM", "NeRF", "Dynamic Environments", "Semantic Scene Graph"],
    highlighted: true,
  },
  {
    id: "zhang2025hri",
    title: "Intention-Aware Robot Navigation Using Transformer-Based Human Behavior Prediction",
    authors: ["Hao Zhang", "Xiaoming Li", "Yichen Wang"],
    venue: "International Conference on Robotics and Automation (ICRA)",
    year: 2025,
    type: "Conference",
    abstract: "This paper proposes a transformer-based framework for predicting human intentions during robot navigation in crowded spaces. The model achieves 94.2% prediction accuracy and enables smoother, safer robot trajectories.",
    url: "#",
    keywords: ["Human-Robot Interaction", "Transformer", "Navigation", "Intention Prediction"],
    highlighted: true,
  },
  {
    id: "liu2024pointcloud",
    title: "Efficient 3D Point Cloud Segmentation via Sparse Attention Mechanisms",
    authors: ["Jiawei Liu", "Yichen Wang", "Qian Sun", "Hao Zhang"],
    venue: "IEEE Transactions on Pattern Analysis and Machine Intelligence (T-PAMI)",
    year: 2024,
    type: "Journal",
    abstract: "We introduce a sparse attention module for efficient 3D point cloud segmentation, reducing computational costs by 60% while maintaining competitive accuracy on SemanticKITTI and nuScenes datasets.",
    doi: "10.1109/TPAMI.2024.005678",
    url: "#",
    keywords: ["Point Cloud", "Segmentation", "Sparse Attention", "3D Understanding"],
    highlighted: true,
  },
  {
    id: "chen2024scenegraph",
    title: "Compositional Scene Graph Generation for Robotic Manipulation Tasks",
    authors: ["Mingyu Chen", "Jiawei Liu", "Lei Huang"],
    venue: "European Conference on Computer Vision (ECCV)",
    year: 2024,
    type: "Conference",
    abstract: "We propose a compositional approach to scene graph generation that explicitly models part-whole relationships, enabling more accurate grasp planning for robotic manipulation.",
    url: "#",
    keywords: ["Scene Graph", "Robotic Manipulation", "Compositional Reasoning"],
  },
  {
    id: "sun2024lidar",
    title: "Cross-Modal LiDAR-Camera Fusion for All-Weather Autonomous Driving",
    authors: ["Qian Sun", "Yichen Wang", "Xiaoming Li"],
    venue: "IEEE Robotics and Automation Letters (RA-L)",
    year: 2024,
    type: "Journal",
    abstract: "A cross-modal fusion framework that combines LiDAR and camera data to achieve robust perception under adverse weather conditions including rain, fog, and snow.",
    doi: "10.1109/LRA.2024.009012",
    keywords: ["Sensor Fusion", "LiDAR", "Autonomous Driving", "Adverse Weather"],
  },
  {
    id: "li2024gesture",
    title: "Real-Time Hand Gesture Recognition for Intuitive Robot Control",
    authors: ["Xiaoming Li", "Hao Zhang", "Mingyu Chen"],
    venue: "IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)",
    year: 2024,
    type: "Conference",
    abstract: "A lightweight deep learning model for real-time hand gesture recognition that enables intuitive human-robot interaction, running at 120 FPS on edge devices.",
    url: "#",
    keywords: ["Gesture Recognition", "Human-Robot Interaction", "Edge AI"],
  },
  {
    id: "wang2023semantic",
    title: "Semantic Visual Localization with Hierarchical Scene Representations",
    authors: ["Yichen Wang", "Qian Sun", "Lei Huang", "Hao Zhang"],
    venue: "Computer Vision and Image Understanding (CVIU)",
    year: 2023,
    type: "Journal",
    abstract: "A hierarchical approach to visual localization that leverages semantic landmarks at multiple scales, achieving sub-meter accuracy in large-scale outdoor environments.",
    doi: "10.1016/j.cviu.2023.103456",
    keywords: ["Visual Localization", "Semantic Mapping", "Hierarchical Representations"],
  },
  {
    id: "huang2023grasp",
    title: "Learning Category-Level 6-DoF Grasp Poses from Point Clouds",
    authors: ["Lei Huang", "Mingyu Chen", "Jiawei Liu"],
    venue: "Conference on Robot Learning (CoRL)",
    year: 2023,
    type: "Conference",
    abstract: "A category-level 6-DoF grasp pose estimation method that generalizes across novel object instances within known categories, achieving an 87% grasp success rate.",
    url: "#",
    keywords: ["Grasp Planning", "6-DoF", "Point Cloud", "Category-Level"],
  },
  {
    id: "zhang2023collaborative",
    title: "Multi-Robot Collaborative SLAM with Decentralized Communication",
    authors: ["Hao Zhang", "Yichen Wang", "Qian Sun"],
    venue: "Autonomous Robots",
    year: 2023,
    type: "Journal",
    doi: "10.1007/s10514-023-10089-0",
    keywords: ["Multi-Robot", "Collaborative SLAM", "Decentralized Systems"],
  },
  {
    id: "liu2022depth",
    title: "Self-Supervised Monocular Depth Estimation with Cross-Scale Feature Fusion",
    authors: ["Jiawei Liu", "Yichen Wang", "Hao Zhang"],
    venue: "IEEE Conference on Computer Vision and Pattern Recognition (CVPR)",
    year: 2022,
    type: "Conference",
    abstract: "A self-supervised monocular depth estimation approach using cross-scale feature fusion that outperforms existing methods on KITTI and NYU Depth V2 benchmarks.",
    url: "#",
    keywords: ["Depth Estimation", "Self-Supervised Learning", "Feature Fusion"],
  },
  {
    id: "wang2024generative",
    title: "Generative World Models for Autonomous Driving Safety Assessment",
    authors: ["Yichen Wang", "Jiawei Liu", "Mingyu Chen"],
    venue: "arXiv preprint",
    year: 2024,
    type: "Preprint",
    abstract: "We explore the use of diffusion-based generative world models to simulate critical long-tail scenarios for safety-testing autonomous vehicles.",
    url: "#",
    keywords: ["Generative Models", "Autonomous Driving", "Safety"],
  }
];

type FilterType = "All" | "Journal" | "Conference" | "Preprint";
type Language = "en" | "zh";

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
      className="relative group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6 transition-all duration-500 hover:border-white/[0.2] hover:bg-white/[0.05]"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 pointer-events-none group-hover:scale-125 group-hover:-rotate-12">
        <Icon className="w-full h-full text-white" />
      </div>
      
      <div className="flex flex-col gap-4 relative z-10">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-500">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-3xl font-light tracking-tight text-white mb-1">
            {value}
          </div>
          <div className="text-[12px] uppercase tracking-widest text-white/40 font-medium group-hover:text-white/60 transition-colors duration-300">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function YearSection({ year }: { year: number }) {
  return (
    <div className="sticky top-0 z-20 pt-8 pb-4 bg-[#1c1c1f]/95 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <span className="text-3xl font-light tracking-tighter text-white font-mono italic opacity-90">{year}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-white/[0.15] to-transparent" />
      </div>
    </div>
  );
}

const PublicationCard = forwardRef<HTMLDivElement, {
  pub: Publication;
  index: number;
  t: typeof translations.en;
}>(({ pub, index, t }, ref) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden
        ${pub.highlighted
          ? "border-white/[0.18] bg-white/[0.04] hover:border-white/40 hover:bg-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          : "border-white/[0.08] bg-white/[0.01] hover:border-white/[0.15] hover:bg-white/[0.03]"
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
          <span className="text-xs font-mono text-white/20 group-hover:text-white/40 transition-colors">#{pub.id}</span>
        </div>

        <h3 className="text-xl font-light text-white mb-4 leading-snug group-hover:text-white transition-colors duration-300">
          {pub.title}
        </h3>

        <div className="flex items-start gap-2 mb-4">
          <div className="text-[14px] text-white/50 leading-relaxed font-light">
            {pub.authors.map((author, i) => (
              <span key={i}>
                {i > 0 && ", "}
                <span className={`hover:text-white transition-colors duration-300 cursor-pointer ${author.includes("Yichen Wang") ? "text-white/80 font-medium" : ""}`}>
                  {author}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[14px] text-white/70 mb-6 italic opacity-80 group-hover:opacity-100 transition-opacity">
          <span>{pub.venue}</span>
        </div>

        {pub.keywords && (
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
                href={`https://doi.org/${pub.doi}`}
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
      </div>
    </motion.div>
  );
});

export function Publications() {
  const [lang, setLang] = useState<Language>("zh");
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const years = useMemo(
    () => [...new Set(publications.map((p) => p.year))].sort((a, b) => b - a),
    []
  );

  const stats = useMemo(() => ({
    total: publications.length,
    journal: publications.filter((p) => p.type === "Journal").length,
    conference: publications.filter((p) => p.type === "Conference").length,
    recent: publications.filter((p) => p.year >= 2024).length
  }), []);

  const filteredPubs = useMemo(() => {
    return publications.filter((pub) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        query === "" ||
        pub.title.toLowerCase().includes(query) ||
        pub.authors.some((a) => a.toLowerCase().includes(query)) ||
        pub.venue.toLowerCase().includes(query) ||
        (pub.keywords && pub.keywords.some((k) => k.toLowerCase().includes(query)));

      const matchesType = activeFilter === "All" || pub.type === activeFilter;
      const matchesYear = yearFilter === null || pub.year === yearFilter;

      return matchesSearch && matchesType && matchesYear;
    });
  }, [searchQuery, activeFilter, yearFilter]);

  const groupedByYear = useMemo(() => {
    const groups: Record<number, Publication[]> = {};
    filteredPubs.forEach((pub) => {
      if (!groups[pub.year]) groups[pub.year] = [];
      groups[pub.year].push(pub);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, pubs]) => ({ year: Number(year), pubs }));
  }, [filteredPubs]);

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-white selection:bg-white/20">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-white/[0.01] blur-[100px] rounded-full" />
      </div>

      {/* Language Toggle */}
      <div className="fixed top-8 right-8 z-50">
        <button
          onClick={() => setLang(lang === "en" ? "zh" : "en")}
          className="flex items-center justify-center h-10 px-4 rounded-full border border-white/10 bg-[#1c1c1f]/50 backdrop-blur-xl text-[12px] font-semibold tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all duration-500 shadow-2xl"
        >
          {t.toggleLang}
        </button>
      </div>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{t.headerTitle}</span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-light tracking-tighter text-white mb-8">
              {t.pageTitle}
            </h1>
            <p className="text-xl text-white/30 max-w-2xl font-light leading-relaxed">
              {t.pageSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 pb-40">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          <StatCard icon={BookOpen} value={stats.total} label={t.totalPubs} delay={0.1} />
          <StatCard icon={Library} value={stats.journal} label={t.journalPapers} delay={0.2} />
          <StatCard icon={Users} value={stats.conference} label={t.conferencePapers} delay={0.3} />
          <StatCard icon={TrendingUp} value={stats.recent} label={t.recent} delay={0.4} />
        </div>

        {/* Filters & Search */}
        <div className="sticky top-8 z-40 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="p-2 bg-[#1c1c1f]/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-stretch gap-2"
          >
            {/* Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-12 bg-transparent text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.02] rounded-xl transition-all"
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

            <div className="hidden md:block w-px bg-white/5 my-2" />

            {/* Type Filter */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.02] rounded-xl overflow-x-auto no-scrollbar">
              {(["All", "Journal", "Conference", "Preprint"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-500 whitespace-nowrap ${
                    activeFilter === type
                      ? "bg-white text-[#1c1c1f] shadow-lg"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  {type === "All" ? t.all : type === "Journal" ? t.journal : type === "Conference" ? t.conference : t.preprint}
                </button>
              ))}
            </div>

            {/* Year Filter */}
            <div className="relative">
              <select
                value={yearFilter === null ? "" : yearFilter.toString()}
                onChange={(e) => setYearFilter(e.target.value === "" ? null : parseInt(e.target.value))}
                className="appearance-none h-12 pl-5 pr-12 bg-white/[0.02] border-none text-[13px] font-semibold text-white/60 hover:text-white focus:outline-none focus:bg-white/5 rounded-xl cursor-pointer transition-all"
              >
                <option value="" className="bg-[#1c1c1f]">{t.allYears}</option>
                {years.map((y) => (
                  <option key={y} value={y} className="bg-[#1c1c1f]">{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </motion.div>

          <div className="mt-4 px-4 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">
              {t.showing} {filteredPubs.length} {t.of} {publications.length} {t.pubsText}
            </span>
          </div>
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
                className="px-10 py-3 bg-white text-[#1c1c1f] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                {t.reset}
              </button>
            </motion.div>
          ) : (
            groupedByYear.map(({ year, pubs }) => (
              <div key={year} className="relative">
                <YearSection year={year} />
                <div className="grid grid-cols-1 gap-6 mt-8">
                  <AnimatePresence mode="popLayout">
                    {pubs.map((pub, idx) => (
                      <PublicationCard
                        key={pub.id}
                        pub={pub}
                        index={idx}
                        t={t}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto px-8 flex flex-col items-center text-center">
          <div className="text-white font-mono tracking-tighter text-2xl mb-4 opacity-80">RCV LAB</div>
          <p className="text-white/20 text-xs tracking-widest uppercase font-semibold">© 2026 Robotic Perception & Computer Vision Lab</p>
        </div>
      </footer>

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
