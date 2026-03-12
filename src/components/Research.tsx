import { useLanguage } from './LanguageContext';
import { useRouter } from './Router';
import { useEffect, useState, useCallback } from 'react';
import { parse as parseTOML } from 'smol-toml';
import { ChevronRight, Users, Tag } from 'lucide-react';
import { getContentUrl } from '../utils/paths';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ResearchMember {
  name: string;
  slug: string;
  topic: string;
  topic_zh: string;
}

interface ResearchKeyword {
  en: string;
  zh: string;
}

interface ResearchArea {
  meta: {
    title: string;
    title_zh: string;
    weight: number;
    image: string;
    color: string;
  };
  description: {
    en: string;
    zh: string;
  };
  keywords: ResearchKeyword[];
  members: ResearchMember[];
}

// ─── TOML Data Sources ────────────────────────────────────────────────────────

const RESEARCH_DIRS = [
  'simultaneous localization and mapping',
  'semantic scene understanding',
  'human-robot interaction',
  'perception with the polarization camera',
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Research() {
  const { language } = useLanguage();
  const { navigateTo } = useRouter();

  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Load TOML files on mount
  useEffect(() => {
    const loadAll = async () => {
      const results: ResearchArea[] = [];
      for (const dir of RESEARCH_DIRS) {
        try {
          const url = getContentUrl(`research/${encodeURIComponent(dir)}/index.toml`);
          const res = await fetch(url);
          if (!res.ok) continue;
          const text = await res.text();
          const data = parseTOML(text) as ResearchArea;
          results.push(data);
        } catch (err) {
          console.warn(`Failed to load research area: ${dir}`, err);
        }
      }
      // Sort by weight
      results.sort((a, b) => a.meta.weight - b.meta.weight);
      setAreas(results);
    };
    loadAll();
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
    navigateTo('team');
    // Small delay to allow page transition, then scroll/highlight member
    setTimeout(() => {
      const el = document.getElementById(`member-${slug}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('member-highlight');
        setTimeout(() => el.classList.remove('member-highlight'), 2000);
      }
    }, 300);
  }, [navigateTo]);

  const active = areas[activeIndex];

  return (
    <section
      id="research"
      className="min-h-screen py-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1526 40%, #111827 100%)',
      }}
    >
      {/* Subtle ambient glow */}
      {active && (
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 70% 40%, ${active.meta.color} 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.3em] text-white/40 uppercase mb-3">
            {language === 'zh' ? '探索我们的' : 'Explore Our'}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {language === 'zh' ? '研究领域' : 'Research Areas'}
          </h2>
          <div className="mt-4 w-16 h-px mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        {/* Main layout: tabs + detail */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Tab List ─────────────────────────────────────────── */}
          <div className="lg:w-72 flex-shrink-0 w-full">
            <div
              className="rounded-2xl overflow-hidden border border-white/10"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {areas.map((area, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={i}
                    onClick={() => handleTabChange(i)}
                    className={`w-full text-left px-5 py-4 transition-all duration-300 flex items-center gap-3 group border-b border-white/5 last:border-b-0 ${
                      isActive ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Color accent bar */}
                    <div
                      className="w-1 h-8 rounded-full flex-shrink-0 transition-all duration-300"
                      style={{
                        background: isActive ? area.meta.color : 'rgba(255,255,255,0.1)',
                        boxShadow: isActive ? `0 0 8px ${area.meta.color}80` : 'none',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium leading-tight transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                        }`}
                      >
                        {language === 'zh' ? area.meta.title_zh : area.meta.title}
                      </p>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 flex-shrink-0 transition-all duration-200 ${
                        isActive ? 'text-white/70 translate-x-0.5' : 'text-white/20 group-hover:text-white/40'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Detail Panel ─────────────────────────────────────── */}
          {active && (
            <div
              className={`flex-1 min-w-0 rounded-2xl overflow-hidden border border-white/10 transition-opacity duration-200 ${
                animating ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Featured Image */}
              <div className="relative h-56 md:h-72 overflow-hidden">
                <img
                  key={active.meta.image}
                  src={active.meta.image}
                  alt={active.meta.title}
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/30 to-transparent" />
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-7 pb-5">
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
                    style={{
                      background: `${active.meta.color}22`,
                      color: active.meta.color,
                      border: `1px solid ${active.meta.color}44`,
                    }}
                  >
                    {language === 'zh' ? `研究方向 0${activeIndex + 1}` : `Research Area 0${activeIndex + 1}`}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                    {language === 'zh' ? active.meta.title_zh : active.meta.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="px-7 py-6 space-y-6">

                {/* Description */}
                <p className="text-white/70 leading-relaxed text-sm md:text-base">
                  {language === 'zh' ? active.description.zh : active.description.en}
                </p>

                {/* Keywords */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-3.5 w-3.5 text-white/40" />
                    <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                      {language === 'zh' ? '关键词' : 'Keywords'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.keywords.map((kw, ki) => (
                      <span
                        key={ki}
                        className="px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200"
                        style={{
                          background: `${active.meta.color}15`,
                          color: active.meta.color,
                          borderColor: `${active.meta.color}30`,
                        }}
                      >
                        {language === 'zh' ? kw.zh : kw.en}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Members */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-3.5 w-3.5 text-white/40" />
                    <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                      {language === 'zh' ? '相关成员' : 'Related Members'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.members.map((member, mi) => (
                      <button
                        key={mi}
                        onClick={() => handleMemberClick(member.slug)}
                        className="group flex flex-col px-4 py-2.5 rounded-xl text-left transition-all duration-200 border border-white/10 hover:border-white/25"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                        }}
                        title={language === 'zh' ? member.topic_zh : member.topic}
                      >
                        <span className="text-sm font-semibold text-white/85 group-hover:text-white transition-colors leading-tight">
                          {member.name}
                        </span>
                        <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors mt-0.5 leading-tight">
                          {language === 'zh' ? member.topic_zh : member.topic}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {areas.length === 0 && (
            <div className="flex-1 rounded-2xl border border-white/10 h-96 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />
          )}
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
    </section>
  );
}
