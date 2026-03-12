import { useLanguage } from '../LanguageContext';
import { useRouter } from '../Router';
import { BackButton } from '../BackButton';
import { ImageWithFallback } from '../figma/ImageWithFallback';
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
        } else {
          // If not found in active members, scroll to alumni section
          const alumniEl = document.getElementById('alumni-section');
          if (alumniEl) {
            alumniEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [navigateTo, authors]);

  if (loading) {
    return (
      <div className="theme-page theme-page-gradient min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[color:var(--border-strong)] mx-auto mb-4"></div>
          <p className="theme-soft">Loading Research Areas...</p>
        </div>
      </div>
    );
  }

  if (error || areas.length === 0) {
    return (
      <div className="theme-page theme-page-gradient min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-6">{error || 'No research areas found'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="theme-icon-button px-6 py-2 rounded-full transition-colors"
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
      className="theme-page theme-page-gradient min-h-screen pt-24 pb-20 relative overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <BackButton onClick={() => navigateTo('home')} className="md:hidden mb-8 transition-all" />

        {/* Page Header */}
        <div className="text-center mb-16 select-none">
          <div className="inline-block mb-4">
              <span 
                className="theme-pill text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light px-3.5 py-1 rounded-full backdrop-blur-sm"
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
            className="text-4xl md:text-6xl font-extralight tracking-wide text-[color:var(--foreground)] leading-tight block"
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
              className="theme-surface rounded-2xl overflow-hidden sticky top-28"
              style={{
                backdropFilter: 'blur(20px)',
              }}
            >
              {areas.map((area, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={i}
                    onClick={() => handleTabChange(i)}
                    className={`relative w-full text-left px-6 py-5 transition-all duration-300 flex items-center justify-between group border-b theme-divider last:border-b-0 overflow-hidden ${
                      isActive 
                        ? 'bg-[var(--overlay-strong)] shadow-[inset_2px_0_0_0_rgba(203,116,59,0.8)]' 
                        : 'hover:bg-[var(--overlay)] hover:translate-x-1'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#CB743B] shadow-[0_0_10px_rgba(203,116,59,0.5)]" />
                    )}
                    <div className="flex-1 min-w-0 z-10">
                        <p
                          className={`text-sm font-semibold transition-colors duration-200 ${
                            isActive ? 'text-[color:var(--foreground)]' : 'theme-muted group-hover:text-[color:var(--foreground-soft)]'
                          }`}
                        >
                        {language === 'zh' ? area.meta.title_zh : area.meta.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail Panel */}
          <div
            className={`theme-surface flex-1 rounded-2xl overflow-hidden min-h-[600px] flex flex-col transition-all duration-300 ${
              animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
            style={{
              backdropFilter: 'blur(32px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header / Image Area */}
            <div className="relative h-[400px] overflow-hidden">
              <ImageWithFallback
                src={active.meta.image}
                alt={active.meta.title}
                className="w-full h-full rounded-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent opacity-80" />
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
                <div className="markdown-body p-0 bg-transparent theme-soft">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {language === 'zh' ? active.description.zh : active.description.en}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Keywords */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-4 w-4 text-[#CB743B]/60" />
                    <span className="text-lg font-semibold tracking-wider text-[color:var(--foreground-soft)]">
                      {language === 'zh' ? '领域关键词' : 'Keywords'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.keywords.map((kw, ki) => (
                        <span
                          key={ki}
                          className="theme-pill px-4 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--overlay-strong)] hover:text-[color:var(--foreground)]"
                        >
                        {language === 'zh' ? kw.zh : kw.en}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-[#CB743B]/60" />
                    <span className="text-lg font-semibold tracking-wider text-[color:var(--foreground-soft)]">
                      {language === 'zh' ? '相关实验室成员' : 'Related Lab Members'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.members.map((member, mi) => (
                      <button
                        key={mi}
                        onClick={() => handleMemberClick(member.slug)}
                        title={language === 'zh' ? member.topic_zh : member.topic}
                        className="theme-pill px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:text-[color:var(--foreground)] hover:border-[color:var(--border-strong)] hover:bg-[var(--overlay-strong)]"
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
                className="theme-surface rounded-2xl overflow-hidden"
                style={{ backdropFilter: 'blur(20px)' }}
              >
                 <ImageWithFallback src={area.meta.image} alt={area.meta.title} className="w-full h-56" />
                 <div className="p-6">
                  <h2 className="text-xl font-bold text-[color:var(--foreground)] mb-4">
                     {language === 'zh' ? area.meta.title_zh : area.meta.title}
                   </h2>
                  <div className="theme-soft text-sm leading-relaxed mb-6 markdown-custom-wrapper">
                    <div className="markdown-body p-0 bg-transparent theme-soft">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {language === 'zh' ? area.description.zh : area.description.en}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {/* Mobile Keywords */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-[#CB743B]/80" />
                      <span className="text-base font-semibold tracking-wider text-[color:var(--foreground-soft)]">
                        {language === 'zh' ? '关键词' : 'Keywords'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {area.keywords.map((kw, ki) => (
                        <span key={ki} className="theme-pill text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm">
                          {language === 'zh' ? kw.zh : kw.en}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Members */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-[#CB743B]/80" />
                      <span className="text-base font-semibold tracking-wider text-[color:var(--foreground-soft)]">
                        {language === 'zh' ? '相关实验室成员' : 'Related Lab Members'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {area.members.map((member, mi) => (
                        <button 
                          key={mi} 
                          onClick={() => handleMemberClick(member.slug)}
                          className="theme-pill px-3 py-1.5 rounded-lg text-xs active:bg-[var(--overlay-strong)] transition-colors"
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
