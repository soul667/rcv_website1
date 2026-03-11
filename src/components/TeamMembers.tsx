import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useState, useEffect } from 'react';
import { loadAllAuthors, categorizeAuthors } from '../utils/authorLoader';
import { getTeamCarouselConfig } from '../utils/config';

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

export function TeamMembers({ onMemberClick, sectionClassName = 'py-20 bg-slate-900' }: TeamMembersProps) {
  const { language, t } = useLanguage();
  const [authors, setAuthors] = useState<AuthorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const teamCarouselConfig = getTeamCarouselConfig();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // 轮播图自动播放
  useEffect(() => {
    if (teamCarouselConfig.autoPlay) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % teamCarouselConfig.slides.length);
      }, teamCarouselConfig.slideDuration);
      return () => clearInterval(timer);
    }
  }, [teamCarouselConfig.autoPlay, teamCarouselConfig.slideDuration, teamCarouselConfig.slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % teamCarouselConfig.slides.length);
  };

  const prevSlide = () => {
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

  if (loading) {
    return (
      <section id="team" className={sectionClassName}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4 text-white">{t('team.title')}</h2>
            <p className="text-white">Loading team members...</p>
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
            <h2 className="text-3xl md:text-4xl mb-4 text-white">{t('team.title')}</h2>
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
            {/* Background Image */}
            <div className="relative h-64 lg:h-80">
              <ImageWithFallback
                src={teamCarouselConfig.slides[currentSlide].image}
                alt={teamCarouselConfig.slides[currentSlide].alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40"></div>
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
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
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
          <h2 className="text-3xl md:text-4xl mb-4 text-white">{t('team.title')}</h2>
        </div>

        {/* Faculty Members */}
        {faculty.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-white text-center">{t('team.faculty')}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faculty.map((member) => (
                <Card key={member.id} className="bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/60 hover:border-slate-500/50 transition-all duration-300 cursor-pointer group rounded-xl shadow-none">
                  <CardContent className="p-4 text-center">
                    <div className="mb-3">
                      <ImageWithFallback
                        src={member.image}
                        alt={member.name}
                        className="w-20 h-20 rounded-full mx-auto object-cover ring-2 ring-slate-600/50 group-hover:ring-orange-500/50 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-lg mb-0.5 text-white">
                      {language === 'zh' ? member.name : member.nameEn}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {language === 'zh' ? member.title : member.titleEn}
                    </p>
                    {member.email && (
                      <div className="flex justify-center mb-2">
                        <a
                          href={`mailto:${member.email}`}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMemberClick?.(member)}
                      className="group-hover:bg-orange-500 group-hover:text-white transition-colors text-xs px-3 py-1 h-7"
                    >
                      {t('team.viewProfile')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PhD Students */}
        {phdStudents.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-white text-center">{t('team.phd')}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {phdStudents.map((student) => (
                <Card key={student.id} className="bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/60 hover:border-slate-500/50 transition-all duration-300 cursor-pointer group rounded-xl shadow-none">
                  <CardContent className="p-4 text-center">
                    <div className="mb-3">
                      <ImageWithFallback
                        src={student.image}
                        alt={student.name}
                        className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-slate-600/50 group-hover:ring-orange-500/50 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-sm font-medium mb-0.5 text-white">
                      {language === 'zh' ? student.name : student.nameEn}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {language === 'zh' ? student.title : student.titleEn}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMemberClick?.(student)}
                      className="group-hover:bg-orange-500 group-hover:text-white transition-colors text-xs px-3 py-1 h-7"
                    >
                      {t('team.viewProfile')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Master Students */}
        {masterStudents.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-white text-center">{t('team.master')}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {masterStudents.map((student) => (
                <Card key={student.id} className="bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/60 hover:border-slate-500/50 transition-all duration-300 cursor-pointer group rounded-xl shadow-none">
                  <CardContent className="p-4 text-center">
                    <div className="mb-3">
                      <ImageWithFallback
                        src={student.image}
                        alt={student.name}
                        className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-slate-600/50 group-hover:ring-orange-500/50 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-sm font-medium mb-0.5 text-white">
                      {language === 'zh' ? student.name : student.nameEn}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {language === 'zh' ? student.title : student.titleEn}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMemberClick?.(student)}
                      className="group-hover:bg-orange-500 group-hover:text-white transition-colors text-xs px-3 py-1 h-7"
                    >
                      {t('team.viewProfile')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Research Associates */}
        {researchAssociates.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-white text-center">{t('team.researchAssociates')}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {researchAssociates.map((associate) => (
                <Card key={associate.id} className="bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/60 hover:border-slate-500/50 transition-all duration-300 cursor-pointer group rounded-xl shadow-none">
                  <CardContent className="p-4 text-center">
                    <div className="mb-3">
                      <ImageWithFallback
                        src={associate.image}
                        alt={associate.name}
                        className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-slate-600/50 group-hover:ring-orange-500/50 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-sm font-medium mb-0.5 text-white">
                      {language === 'zh' ? associate.name : associate.nameEn}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {language === 'zh' ? associate.title : associate.titleEn}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMemberClick?.(associate)}
                      className="group-hover:bg-orange-500 group-hover:text-white transition-colors text-xs px-3 py-1 h-7"
                    >
                      {t('team.viewProfile')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Administrative Assistants */}
        {administrativeAssistants.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-white text-center">{t('team.adminAssistants')}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {administrativeAssistants.map((assistant) => (
                <Card key={assistant.id} className="bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/60 hover:border-slate-500/50 transition-all duration-300 cursor-pointer group rounded-xl shadow-none">
                  <CardContent className="p-4 text-center">
                    <div className="mb-3">
                      <ImageWithFallback
                        src={assistant.image}
                        alt={assistant.name}
                        className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-slate-600/50 group-hover:ring-orange-500/50 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-sm font-medium mb-0.5 text-white">
                      {language === 'zh' ? assistant.name : assistant.nameEn}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {language === 'zh' ? assistant.title : assistant.titleEn}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMemberClick?.(assistant)}
                      className="group-hover:bg-orange-500 group-hover:text-white transition-colors text-xs px-3 py-1 h-7"
                    >
                      {t('team.viewProfile')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Members */}
        {others.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl mb-8 text-white text-center">{t('team.others')}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {others.map((member) => (
                <Card key={member.id} className="bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/60 hover:border-slate-500/50 transition-all duration-300 cursor-pointer group rounded-xl shadow-none">
                  <CardContent className="p-4 text-center">
                    <div className="mb-3">
                      <ImageWithFallback
                        src={member.image}
                        alt={member.name}
                        className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-slate-600/50 group-hover:ring-orange-500/50 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-sm font-medium mb-0.5 text-white">
                      {language === 'zh' ? member.name : member.nameEn}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {language === 'zh' ? member.title : member.titleEn}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMemberClick?.(member)}
                      className="group-hover:bg-orange-500 group-hover:text-white transition-colors text-xs px-3 py-1 h-7"
                    >
                      {t('team.viewProfile')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Alumni Section */}
        <div className="mt-20">
          <h3 className="text-2xl mb-8 text-white text-center">{t('team.alumni')}</h3>
          
          <div className="max-w-4xl mx-auto bg-slate-800/40 border border-slate-600/30 rounded-xl p-6 sm:p-8">
            {/* Post-Doctoral Fellows */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-orange-400 mb-3 border-b border-slate-600/40 pb-2">Post-Doctoral Fellows</h4>
              <ul className="space-y-1.5 text-gray-300 text-sm">
                <li><span className="text-white font-medium">Weinan Chen</span> <span className="text-gray-400">(2020 – 2022),</span> <span className="text-gray-500 italic">Guangdong University of Technology</span></li>
              </ul>
            </div>

            {/* Ph.D. Students */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-orange-400 mb-3 border-b border-slate-600/40 pb-2">Ph.D. Students</h4>
              <ul className="space-y-1.5 text-gray-300 text-sm">
                <li><span className="text-white font-medium">Chao Tang</span> <span className="text-gray-400">(2020 – 2025),</span> <span className="text-gray-500 italic">Kungliga Tekniska Högskolan</span></li>
              </ul>
            </div>

            {/* M.Sc. Students */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-orange-400 mb-3 border-b border-slate-600/40 pb-2">M.Sc. Students</h4>
              <ul className="space-y-1.5 text-gray-300 text-sm">
                <li><span className="text-white font-medium">Jiahao Ruan</span> <span className="text-gray-400">(2020 – 2023),</span> <span className="text-gray-500 italic">Ubtech Robotics Corp</span></li>
                <li><span className="text-white font-medium">Ruihao Zhou</span> <span className="text-gray-400">(2020 – 2023),</span> <span className="text-gray-500 italic">China Tobacco</span></li>
                <li><span className="text-white font-medium">Yaling Pan</span> <span className="text-gray-400">(2020 – 2023)</span></li>
                <li><span className="text-white font-medium">Zhilong Tang</span> <span className="text-gray-400">(2020 – 2023),</span> <span className="text-gray-500 italic">BYD Auto</span></li>
                <li><span className="text-white font-medium">Jieting Zhao</span> <span className="text-gray-400">(2021 – 2024),</span> <span className="text-gray-500 italic">XPENG Motors</span></li>
                <li><span className="text-white font-medium">Wen Li</span> <span className="text-gray-400">(2021 – 2024),</span> <span className="text-gray-500 italic">Meituan</span></li>
                <li><span className="text-white font-medium">Wenqi Ge</span> <span className="text-gray-400">(2022 – 2025),</span> <span className="text-gray-500 italic">University of Hong Kong</span></li>
                <li><span className="text-white font-medium">Zhenchao Lin</span> <span className="text-gray-400">(2022 – 2025),</span> <span className="text-gray-500 italic">VisionNav Robotics</span></li>
                <li><span className="text-white font-medium">Zijun Lin</span> <span className="text-gray-400">(2022 – 2025),</span> <span className="text-gray-500 italic">Kingdee</span></li>
              </ul>
            </div>

            {/* Undergraduate Students */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-orange-400 mb-3 border-b border-slate-600/40 pb-2">Undergraduate Students</h4>
              <ul className="space-y-1.5 text-gray-300 text-sm">
                <li><span className="text-white font-medium">Bingqing (Selina) Wan</span> <span className="text-gray-400">(2022),</span> <span className="text-gray-500 italic">University of Toronto</span></li>
                <li><span className="text-white font-medium">Jiayi Yang</span> <span className="text-gray-400">(2024),</span> <span className="text-gray-500 italic">University of Tokyo</span></li>
              </ul>
            </div>

            {/* Research Associates (Alumni) */}
            <div>
              <h4 className="text-lg font-semibold text-orange-400 mb-3 border-b border-slate-600/40 pb-2">Research Associates</h4>
              <ul className="space-y-1.5 text-gray-300 text-sm">
                <li><span className="text-white font-medium">Xinkai Jiang</span> <span className="text-gray-400">(2021 – 2022),</span> <span className="text-gray-500 italic">Karlsruher Institut für Technologie</span></li>
                <li><span className="text-white font-medium">Renxiang Xiao</span> <span className="text-gray-400">(2023.01 – 2023.12),</span> <span className="text-gray-500 italic">Harbin Institute of Technology, Shenzhen</span></li>
                <li><span className="text-white font-medium">Qijin She</span> <span className="text-gray-400">(2024.04 – 2024.08),</span> <span className="text-gray-500 italic">Hong Kong University Of Science and Technology</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
