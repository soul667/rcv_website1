import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useState, useEffect } from 'react';
import { loadAllAuthors, categorizeAuthors } from '../utils/authorLoader';
import { getTeamCarouselConfig } from '../utils/config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { AnimatePresence, motion } from 'framer-motion';
import { getAssetUrl } from '../utils/paths';

// Module-level cache for author data
let cachedAuthors: AuthorData[] | null = null;

interface AuthorData {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  email?: string;
  image: string;
  bio: string;
  bioEn: string;
  research: string[];
  researchEn: string[];
  publications: {
    title: string;
    authors: string;
    venue: string;
    year: number;
    link?: string;
  }[];
  weight?: number;
  role?: string;
  userGroups: string[];
  social?: {
    icon: string;
    icon_pack: string;
    link: string;
  }[];
  markdownContent?: string;
}

interface TeamMembersProps {
  onMemberClick?: (member: any) => void;
  sectionClassName?: string;
}

export function TeamMembers({ onMemberClick, sectionClassName = 'theme-page py-20' }: TeamMembersProps) {
  const { language, t } = useLanguage();
  const [authors, setAuthors] = useState<AuthorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alumniContent, setAlumniContent] = useState('');
  const [alumniLoading, setAlumniLoading] = useState(true);
  const [alumniError, setAlumniError] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const teamCarouselConfig = getTeamCarouselConfig();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const facultyGridColumns = viewportWidth >= 350 ? 2 : 1;
  const memberGridColumns = viewportWidth >= 1100 ? 3 : viewportWidth >= 350 ? 2 : 1;

  // 轮播图自动播放
  useEffect(() => {
    if (teamCarouselConfig.autoPlay) {
      const timer = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % teamCarouselConfig.slides.length);
      }, teamCarouselConfig.slideDuration);
      return () => clearInterval(timer);
    }
  }, [teamCarouselConfig.autoPlay, teamCarouselConfig.slideDuration, teamCarouselConfig.slides.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % teamCarouselConfig.slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + teamCarouselConfig.slides.length) % teamCarouselConfig.slides.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const swipeDistance = touchStartX - touchEndX;

    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setTouchStartX(null);
  };

  useEffect(() => {
    const loadAuthorsData = async () => {
      try {
        setLoading(true);
        if (cachedAuthors) {
          setAuthors(cachedAuthors);
        } else {
          const authorsData = await loadAllAuthors();
          cachedAuthors = authorsData;
          setAuthors(authorsData);
        }
      } catch (err) {
        console.error('Error loading authors:', err);
        setError('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    loadAuthorsData();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadAlumni = async () => {
      setAlumniLoading(true);
      setAlumniError(null);
      try {
        const url = getAssetUrl(`docs/${language === 'zh' ? 'alumni_zh.md' : 'alumni_en.md'}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load alumni content (${response.status})`);
        }
        const text = await response.text();
        if (!isCancelled) {
          setAlumniContent(text);
        }
      } catch (err) {
        if (!isCancelled) {
          setAlumniError('Failed to load alumni information.');
        }
      } finally {
        if (!isCancelled) {
          setAlumniLoading(false);
        }
      }
    };

    loadAlumni();
    return () => {
      isCancelled = true;
    };
  }, [language]);

  if (loading) {
    return (
      <section id="team" className={sectionClassName}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4 text-[color:var(--foreground)]">{t('team.title')}</h2>
            <p className="theme-soft">Loading team members...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="team" className={sectionClassName}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4 text-[color:var(--foreground)]">{t('team.title')}</h2>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  const { faculty, phdStudents, masterStudents, researchAssociates, administrativeAssistants, others } = categorizeAuthors(authors);

  return (
    <section id="team" className={sectionClassName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Team Photo Carousel */}
        <div className="mb-16">
          <div
            className="relative overflow-hidden rounded-lg"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Image Area */}
            <div className="relative h-64 lg:h-80 overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 100 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: {
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.5 }
                    }
                  }}
                  exit={{ opacity: 0, x: direction * -100 }}
                  className="absolute inset-0"
                >
                  <ImageWithFallback
                    src={teamCarouselConfig.slides[currentSlide].image}
                    alt={teamCarouselConfig.slides[currentSlide].alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40"></div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            {teamCarouselConfig.showNavigation && teamCarouselConfig.slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 z-20 rounded-full p-3 bg-white/10 backdrop-blur-xl border border-white/30 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 z-20 rounded-full p-3 bg-white/10 backdrop-blur-xl border border-white/30 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Slide Indicators */}
            {teamCarouselConfig.showIndicators && teamCarouselConfig.slides.length > 1 && (
              <div className="hidden md:flex absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-3 z-20">
                <div className="backdrop-blur-xl bg-white/10 border border-white/30 rounded-full px-6 py-3 shadow-lg">
                  <div className="flex space-x-3">
                    {teamCarouselConfig.slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? 'bg-white scale-125 shadow-lg' 
                            : 'bg-white/50 hover:bg-white/70 hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4 text-[color:var(--foreground)]">{t('team.title')}</h2>
        </div>

        {/* Faculty Members */}
        {faculty.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-[color:var(--foreground)] text-center">{t('team.faculty')}</h3>
            
            <div className="grid gap-6 max-w-4xl mx-auto" style={{ gridTemplateColumns: `repeat(${facultyGridColumns}, minmax(0, 1fr))` }}>
              {faculty.map((member) => (
                <Card key={member.id} id={`member-${member.id}`} onClick={() => onMemberClick?.(member)} className="bg-transparent border-none shadow-none group rounded-[20px] p-4 sm:p-6 text-center hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
                  {/* Crisp hover background that is invisible by default */}
                  <div className="absolute inset-0 bg-[var(--panel-strong)] backdrop-blur-md border border-[color:var(--border)] rounded-[20px] opacity-0 group-hover:opacity-100 shadow-2xl transition-all duration-300 pointer-events-none z-0"></div>
                  
                  <CardContent className="p-0 relative z-10 flex flex-col h-full bg-transparent">
                    <div className="mb-5 relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                      <ImageWithFallback
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full ring-2 ring-transparent group-hover:ring-[color:var(--border-strong)] group-hover:ring-offset-4 group-hover:ring-offset-[var(--background)] transition-all duration-300 relative z-10"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-[color:var(--foreground)] group-hover:text-[color:var(--foreground)] transition-colors duration-300">
                          {language === 'zh' ? member.name : member.nameEn}
                        </h4>
                        <p className="text-sm theme-muted font-medium mb-4 group-hover:text-[color:var(--foreground-soft)] transition-colors duration-300">
                          {language === 'zh' ? member.title : member.titleEn}
                        </p>
                      </div>
                      {member.email && (
                        <div className="flex justify-center mt-auto pt-2">
                          <a
                            href={`mailto:${member.email}`}
                            className="p-2 inline-flex items-center justify-center rounded-full bg-transparent theme-muted hover:text-[color:var(--foreground)] hover:bg-[var(--overlay-strong)] transition-all duration-300 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-[18px] w-[18px]" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

            {/* Elegant Section Divider */}
            <div className="flex items-center justify-center my-12 opacity-40">
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
              <div className="w-2 h-2 rounded-full bg-[color:var(--foreground)] mx-4 shadow-[0_0_8px_rgba(203,116,59,0.45)]"></div>
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
            </div>

        {/* PhD Students */}
        {phdStudents.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-[color:var(--foreground)] text-center">{t('team.phd')}</h3>
            
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${memberGridColumns}, minmax(0, 1fr))` }}>
              {phdStudents.map((student) => (
                <Card key={student.id} id={`member-${student.id}`} onClick={() => onMemberClick?.(student)} className="bg-transparent border-none shadow-none group rounded-[20px] p-4 sm:p-6 text-center hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
                  {/* Crisp hover background that is invisible by default */}
                  <div className="absolute inset-0 bg-[var(--panel-strong)] backdrop-blur-md border border-[color:var(--border)] rounded-[20px] opacity-0 group-hover:opacity-100 shadow-2xl transition-all duration-300 pointer-events-none z-0"></div>
                  
                  <CardContent className="p-0 relative z-10 flex flex-col h-full bg-transparent">
                    <div className="mb-5 relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                      <ImageWithFallback
                        src={student.image}
                        alt={student.name}
                        className="w-full h-full object-cover rounded-full ring-2 ring-transparent group-hover:ring-[color:var(--border-strong)] group-hover:ring-offset-4 group-hover:ring-offset-[var(--background)] transition-all duration-300 relative z-10"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-[color:var(--foreground)] group-hover:text-[color:var(--foreground)] transition-colors duration-300">
                          {language === 'zh' ? student.name : student.nameEn}
                        </h4>
                        <p className="text-sm theme-muted font-medium mb-4 group-hover:text-[color:var(--foreground-soft)] transition-colors duration-300">
                          {language === 'zh' ? student.title : student.titleEn}
                        </p>
                      </div>
                      {student.email && (
                        <div className="flex justify-center mt-auto pt-2">
                          <a
                            href={`mailto:${student.email}`}
                            className="p-2 inline-flex items-center justify-center rounded-full bg-transparent theme-muted hover:text-[color:var(--foreground)] hover:bg-[var(--overlay-strong)] transition-all duration-300 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-[18px] w-[18px]" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

            {/* Elegant Section Divider */}
            <div className="flex items-center justify-center my-12 opacity-40">
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
              <div className="w-2 h-2 rounded-full bg-[color:var(--foreground)] mx-4 shadow-[0_0_8px_rgba(203,116,59,0.45)]"></div>
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
            </div>

        {/* Master Students */}
        {masterStudents.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-[color:var(--foreground)] text-center">{t('team.master')}</h3>
            
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${memberGridColumns}, minmax(0, 1fr))` }}>
              {masterStudents.map((student) => (
                <Card key={student.id} id={`member-${student.id}`} onClick={() => onMemberClick?.(student)} className="bg-transparent border-none shadow-none group rounded-[20px] p-4 sm:p-6 text-center hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
                  {/* Crisp hover background that is invisible by default */}
                  <div className="absolute inset-0 bg-[var(--panel-strong)] backdrop-blur-md border border-[color:var(--border)] rounded-[20px] opacity-0 group-hover:opacity-100 shadow-2xl transition-all duration-300 pointer-events-none z-0"></div>
                  
                  <CardContent className="p-0 relative z-10 flex flex-col h-full bg-transparent">
                    <div className="mb-5 relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                      <ImageWithFallback
                        src={student.image}
                        alt={student.name}
                        className="w-full h-full object-cover rounded-full ring-2 ring-transparent group-hover:ring-[color:var(--border-strong)] group-hover:ring-offset-4 group-hover:ring-offset-[var(--background)] transition-all duration-300 relative z-10"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-[color:var(--foreground)] group-hover:text-[color:var(--foreground)] transition-colors duration-300">
                          {language === 'zh' ? student.name : student.nameEn}
                        </h4>
                        <p className="text-sm theme-muted font-medium mb-4 group-hover:text-[color:var(--foreground-soft)] transition-colors duration-300">
                          {language === 'zh' ? student.title : student.titleEn}
                        </p>
                      </div>
                      {student.email && (
                        <div className="flex justify-center mt-auto pt-2">
                          <a
                            href={`mailto:${student.email}`}
                            className="p-2 inline-flex items-center justify-center rounded-full bg-transparent theme-muted hover:text-[color:var(--foreground)] hover:bg-[var(--overlay-strong)] transition-all duration-300 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-[18px] w-[18px]" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

            {/* Elegant Section Divider */}
            <div className="flex items-center justify-center my-12 opacity-40">
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
              <div className="w-2 h-2 rounded-full bg-[color:var(--foreground)] mx-4 shadow-[0_0_8px_rgba(203,116,59,0.45)]"></div>
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
            </div>

        {/* Research Associates */}
        {researchAssociates.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-[color:var(--foreground)] text-center">{t('team.researchAssociates')}</h3>
            
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${memberGridColumns}, minmax(0, 1fr))` }}>
              {researchAssociates.map((associate) => (
                <Card 
                  key={associate.id} 
                  id={`member-${associate.id}`}
                  onClick={() => onMemberClick?.(associate)} 
                  className="bg-transparent border-none shadow-none group rounded-[20px] p-4 sm:p-6 text-center hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
                >
                  {/* Crisp hover background that is invisible by default */}
                  <div className="absolute inset-0 bg-[var(--panel-strong)] backdrop-blur-md border border-[color:var(--border)] rounded-[20px] opacity-0 group-hover:opacity-100 shadow-2xl transition-all duration-300 pointer-events-none z-0"></div>
                  
                  <CardContent className="p-0 relative z-10 flex flex-col h-full bg-transparent">
                    <div className="mb-5 relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                      <ImageWithFallback
                        src={associate.image}
                        alt={associate.name}
                        className="w-full h-full object-cover rounded-full ring-2 ring-transparent group-hover:ring-[color:var(--border-strong)] group-hover:ring-offset-4 group-hover:ring-offset-[var(--background)] transition-all duration-300 relative z-10"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-[color:var(--foreground)] group-hover:text-[color:var(--foreground)] transition-colors duration-300">
                          {language === 'zh' ? associate.name : associate.nameEn}
                        </h4>
                        <p className="text-sm theme-muted font-medium mb-4 group-hover:text-[color:var(--foreground-soft)] transition-colors duration-300">
                          {language === 'zh' ? associate.title : associate.titleEn}
                        </p>
                      </div>
                      {associate.email && (
                        <div className="flex justify-center mt-auto pt-2">
                          <a
                            href={`mailto:${associate.email}`}
                            className="p-2 inline-flex items-center justify-center rounded-full bg-transparent theme-muted hover:text-[color:var(--foreground)] hover:bg-[var(--overlay-strong)] transition-all duration-300 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-[18px] w-[18px]" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

            {/* Elegant Section Divider */}
            <div className="flex items-center justify-center my-12 opacity-40">
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
              <div className="w-2 h-2 rounded-full bg-[color:var(--foreground)] mx-4 shadow-[0_0_8px_rgba(203,116,59,0.45)]"></div>
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
            </div>

        {/* Administrative Assistants */}
        {administrativeAssistants.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-[color:var(--foreground)] text-center">{t('team.adminAssistants')}</h3>
            
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${memberGridColumns}, minmax(0, 1fr))` }}>
              {administrativeAssistants.map((assistant) => (
                <Card 
                  key={assistant.id} 
                  id={`member-${assistant.id}`}
                  onClick={() => onMemberClick?.(assistant)} 
                  className="bg-transparent border-none shadow-none group rounded-[20px] p-4 sm:p-6 text-center hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
                >
                  {/* Crisp hover background that is invisible by default */}
                  <div className="absolute inset-0 bg-[var(--panel-strong)] backdrop-blur-md border border-[color:var(--border)] rounded-[20px] opacity-0 group-hover:opacity-100 shadow-2xl transition-all duration-300 pointer-events-none z-0"></div>
                  
                  <CardContent className="p-0 relative z-10 flex flex-col h-full bg-transparent">
                    <div className="mb-5 relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                      <ImageWithFallback
                        src={assistant.image}
                        alt={assistant.name}
                        className="w-full h-full object-cover rounded-full ring-2 ring-transparent group-hover:ring-[color:var(--border-strong)] group-hover:ring-offset-4 group-hover:ring-offset-[var(--background)] transition-all duration-300 relative z-10"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-[color:var(--foreground)] group-hover:text-[color:var(--foreground)] transition-colors duration-300">
                          {language === 'zh' ? assistant.name : assistant.nameEn}
                        </h4>
                        <p className="text-sm theme-muted font-medium mb-4 group-hover:text-[color:var(--foreground-soft)] transition-colors duration-300">
                          {language === 'zh' ? assistant.title : assistant.titleEn}
                        </p>
                      </div>
                      {assistant.email && (
                        <div className="flex justify-center mt-auto pt-2">
                          <a
                            href={`mailto:${assistant.email}`}
                            className="p-2 inline-flex items-center justify-center rounded-full bg-transparent theme-muted hover:text-[color:var(--foreground)] hover:bg-[var(--overlay-strong)] transition-all duration-300 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-[18px] w-[18px]" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

            {/* Elegant Section Divider */}
            <div className="flex items-center justify-center my-12 opacity-40">
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
              <div className="w-2 h-2 rounded-full bg-[color:var(--foreground)] mx-4 shadow-[0_0_8px_rgba(203,116,59,0.45)]"></div>
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
            </div>

        {/* Other Members */}
        {others.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-[color:var(--foreground)] text-center">{t('team.others')}</h3>
            
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${memberGridColumns}, minmax(0, 1fr))` }}>
              {others.map((member) => (
                <Card key={member.id} id={`member-${member.id}`} onClick={() => onMemberClick?.(member)} className="bg-transparent border-none shadow-none group rounded-[20px] p-4 sm:p-6 text-center hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
                  {/* Crisp hover background that is invisible by default */}
                  <div className="absolute inset-0 bg-[var(--panel-strong)] backdrop-blur-md border border-[color:var(--border)] rounded-[20px] opacity-0 group-hover:opacity-100 shadow-2xl transition-all duration-300 pointer-events-none z-0"></div>
                  
                  <CardContent className="p-0 relative z-10 flex flex-col h-full bg-transparent">
                    <div className="mb-5 relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                      <ImageWithFallback
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full ring-2 ring-transparent group-hover:ring-[color:var(--border-strong)] group-hover:ring-offset-4 group-hover:ring-offset-[var(--background)] transition-all duration-300 relative z-10"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-[color:var(--foreground)] group-hover:text-[color:var(--foreground)] transition-colors duration-300">
                          {language === 'zh' ? member.name : member.nameEn}
                        </h4>
                        <p className="text-sm theme-muted font-medium mb-4 group-hover:text-[color:var(--foreground-soft)] transition-colors duration-300">
                          {language === 'zh' ? member.title : member.titleEn}
                        </p>
                      </div>
                      {member.email && (
                        <div className="flex justify-center mt-auto pt-2">
                          <a
                            href={`mailto:${member.email}`}
                            className="p-2 inline-flex items-center justify-center rounded-full bg-transparent theme-muted hover:text-[color:var(--foreground)] hover:bg-[var(--overlay-strong)] transition-all duration-300 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-[18px] w-[18px]" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

            {/* Elegant Section Divider */}
            <div className="flex items-center justify-center my-12 opacity-40">
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
              <div className="w-2 h-2 rounded-full bg-[color:var(--foreground)] mx-4 shadow-[0_0_8px_rgba(203,116,59,0.45)]"></div>
              <div className="w-1/3 h-[1px] theme-divider-glow"></div>
            </div>

        {/* Alumni Section */}
        <div id="alumni-section" className="mt-20">
          <h3 className="text-2xl mb-8 text-[color:var(--foreground)] text-center">{t('team.alumni')}</h3>
          
          <div className="max-w-4xl mx-auto px-6 sm:px-8 markdown-custom-wrapper">
            <style>{`
              .markdown-custom-wrapper .markdown-body {
                background-color: transparent !important;
                padding: 0 !important;
                font-family: inherit !important;
              }
              .markdown-custom-wrapper h4 {
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--foreground);
                margin-top: 2rem;
                margin-bottom: 0.75rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid var(--border);
              }
              .markdown-custom-wrapper h4:first-child {
                margin-top: 0;
              }
              .markdown-custom-wrapper ul {
                list-style-type: disc;
                padding-left: 1.5rem;
                margin-bottom: 1.5rem;
              }
              .markdown-custom-wrapper ul li {
                font-size: 0.875rem; /* text-sm */
                color: var(--foreground-soft);
                margin-top: 0.375rem;
                margin-bottom: 0.375rem;
              }
              .markdown-custom-wrapper ul li strong {
                color: var(--foreground);
                font-weight: normal;
              }
              .markdown-custom-wrapper ul li em {
                color: var(--foreground-muted);
                font-style: italic;
              }
            `}</style>
            <div className="markdown-body">
              {alumniLoading && <p className="theme-muted">{t('loading') || 'Loading...'}</p>}
              {alumniError && <p className="text-red-500">{alumniError}</p>}
              {!alumniLoading && !alumniError && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {alumniContent}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
