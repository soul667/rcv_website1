import { useLanguage } from '../LanguageContext';
import { useRouter } from '../Router';
import { BackButton } from '../BackButton';
import { useState, useEffect, useCallback } from 'react';
import { loadResearchAreas, ResearchArea } from '../../utils/researchLoader';
import { loadAllAuthors, AuthorData } from '../../utils/authorLoader';
import { Users, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Load Noto Serif SC for elegant Chinese rendering
const FONT_LINK_ID = 'noto-serif-sc-link';
if (typeof document !== 'undefined' && !document.getElementById(FONT_LINK_ID)) {
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200;300&display=swap';
  document.head.appendChild(link);
}

export function ResearchPage() {
  const { language, t } = useLanguage();
  const { navigateTo } = useRouter();
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [authors, setAuthors] = useState<AuthorData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [areasData, authorsData] = await Promise.all([
          loadResearchAreas(),
          loadAllAuthors(),
        ]);
        setAreas(areasData);
        setAuthors(authorsData);
      } catch (err) {
        console.error('Error loading research data:', err);
        setError('Failed to load research areas');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleTabChange = useCallback((index: number) => {
    if (index === activeIndex) return;
    setAnimating(true);
    setImageLoaded(false);
    setTimeout(() => {
      setActiveIndex(index);
      setAnimating(false);
    }, 200);
  }, [activeIndex]);

  const handleMemberClick = useCallback((slug: string) => {
    const author = authors.find(
      (a) => a.id.toLowerCase() === slug.toLowerCase()
    );
    if (author) {
      navigateTo('member-profile', author);
    } else {
      // Fallback: navigate to team page and scroll to member
      navigateTo('team');
      setTimeout(() => {
        const el = document.getElementById(`member-${slug}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [navigateTo, authors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white/20 mx-auto mb-4"></div>
          <p className="text-white/60">Loading Research Areas...</p>
        </div>
      </div>
    );
  }

  if (error || areas.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-6">{error || 'No research areas found'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const active = areas[activeIndex];

  return (
    <div 
      className="min-h-screen pt-24 pb-20 relative overflow-hidden"
      style={{
        backgroundColor: '#1c1c1f',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 75% 40%, ${active.meta.color} 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <BackButton onClick={() => navigateTo('home')} className="mb-8 hover:bg-white/10 text-white/70 hover:text-white border-white/10 transition-all" />

        {/* Page Header */}
        <div className="text-center mb-16 select-none">
          <div className="inline-block mb-4">
            <span 
              className="text-[10px] sm:text-xs tracking-[0.2em] text-white/60 uppercase font-light border border-white/10 px-3.5 py-1 rounded-full backdrop-blur-sm bg-white/5"
              style={{
                fontFamily: language === 'zh'
                  ? '"Microsoft YaHei", "微软雅黑", sans-serif'
                  : 'inherit',
                letterSpacing: language === 'zh' ? '0.3em' : '0.2em'
              }}
            >
              {language === 'zh' ? '研究领域' : 'Our Research'}
            </span>
          </div>
          
          <h1 
            className="text-4xl md:text-6xl font-extralight tracking-wide text-white leading-tight block"
            style={{
              fontWeight: 200,
              letterSpacing: language === 'zh' ? '0.08em' : '0.04em',
              fontFamily: language === 'zh'
                ? '"Microsoft YaHei", "微软雅黑", sans-serif'
                : 'inherit',
            }}
          >
            {t('research.title')}
          </h1>
        </div>

        {/* Desktop View: Sidebar + Detail Panel */}
        <div className="hidden lg:flex gap-8 items-start">
          {/* Left Sidebar Tabs */}
          <div className="w-80 flex-shrink-0">
            <div
              className="rounded-2xl overflow-hidden border border-white/10 sticky top-28"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {areas.map((area, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={i}
                    onClick={() => handleTabChange(i)}
                    className={`w-full text-left px-6 py-5 transition-all duration-300 flex items-center gap-4 group border-b border-white/5 last:border-b-0 ${
                      isActive ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                        }`}
                      >
                        {language === 'zh' ? area.meta.title_zh : area.meta.title}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail Panel */}
          <div
            className={`flex-1 rounded-2xl overflow-hidden border border-white/10 min-h-[600px] flex flex-col transition-all duration-300 ${
              animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(32px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header / Image Area */}
            <div className="relative h-[400px] overflow-hidden">
              <img
                src={active.meta.image}
                alt={active.meta.title}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1f] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-10">
                <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                  {language === 'zh' ? active.meta.title_zh : active.meta.title}
                </h2>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-10 space-y-10">
              {/* Description */}
              <div className="max-w-4xl markdown-custom-wrapper">
                <div className="markdown-body p-0 bg-transparent text-white/70">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {language === 'zh' ? active.description.zh : active.description.en}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Keywords */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-4 w-4 text-white/30" />
                    <span className="text-xs font-bold tracking-[0.2em] text-white/30 uppercase">
                      {language === 'zh' ? '领域关键词' : 'Keywords'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.keywords.map((kw, ki) => (
                      <span
                        key={ki}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/[0.05] text-white/60 transition-colors hover:bg-white/10 hover:text-white/80"
                      >
                        {language === 'zh' ? kw.zh : kw.en}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-white/30" />
                    <span className="text-xs font-bold tracking-[0.2em] text-white/30 uppercase">
                      {language === 'zh' ? '相关实验室成员' : 'Related Lab Members'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.members.map((member, mi) => (
                      <button
                        key={mi}
                        onClick={() => handleMemberClick(member.slug)}
                        title={language === 'zh' ? member.topic_zh : member.topic}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10"
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View: Simple vertical stack */}
        <div className="lg:hidden flex flex-col gap-8">
           {areas.map((area, i) => (
             <div 
               key={i}
               className="rounded-2xl overflow-hidden border border-white/10"
               style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
             >
                <img src={area.meta.image} alt={area.meta.title} className="w-full h-56 object-cover" />
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    {language === 'zh' ? area.meta.title_zh : area.meta.title}
                  </h2>
                  <div className="text-white/60 text-sm leading-relaxed mb-6 markdown-custom-wrapper">
                    <div className="markdown-body p-0 bg-transparent text-white/60">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {language === 'zh' ? area.description.zh : area.description.en}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {/* Mobile Keywords */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-3 w-3 text-white/20" />
                      <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
                        {language === 'zh' ? '关键词' : 'Keywords'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {area.keywords.map((kw, ki) => (
                        <span key={ki} className="text-[10px] px-2 py-1 rounded border border-white/10 bg-white/[0.05] text-white/50">
                          {language === 'zh' ? kw.zh : kw.en}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Members */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-3 w-3 text-white/20" />
                      <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
                        {language === 'zh' ? '相关实验室成员' : 'Related Lab Members'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {area.members.map((member, mi) => (
                        <button 
                          key={mi} 
                          onClick={() => handleMemberClick(member.slug)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 active:bg-white/20 transition-colors"
                        >
                          {member.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
