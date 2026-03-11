import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../LanguageContext';
import { useRouter } from '../Router';
import { BackButton } from '../BackButton';
import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { loadResearchAreas, ResearchArea } from '../../utils/researchLoader';

export function ResearchPage() {
  const { language, t } = useLanguage();
  const { navigateTo } = useRouter();
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carousel state
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    skipSnaps: false,
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );

  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const areas = await loadResearchAreas();
        setResearchAreas(areas);
      } catch (err) {
        console.error('Error loading research areas:', err);
        setError('Failed to load research areas');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading research areas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <BackButton onClick={() => navigateTo('home')} />

        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl mb-6 text-foreground">
            {t('research.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            {language === 'zh' 
              ? '我们的研究专注于机器人技术和计算机视觉的前沿领域，致力于开发能够在真实世界中运行的智能系统。'
              : 'Our research focuses on cutting-edge areas of robotics and computer vision, dedicated to developing intelligent systems that can operate in the real world.'
            }
          </p>
          
          {/* Research Direction Buttons */}
          <div className="flex flex-wrap justify-center gap-3 max-w-7xl mx-auto mt-8">
            <Button
              onClick={() => scrollTo(0)}
              className="flex-1 min-w-[200px] max-w-[280px] h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-xs font-bold leading-tight">
                  {language === 'zh' ? '机器人感知与计算机视觉' : 'Robot Perception & Computer Vision'}
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => scrollTo(1)}
              className="flex-1 min-w-[200px] max-w-[280px] h-16 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-xs font-bold leading-tight">
                  {language === 'zh' ? '智能机器人导航与控制' : 'Intelligent Robot Navigation & Control'}
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => scrollTo(2)}
              className="flex-1 min-w-[200px] max-w-[280px] h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-xs font-bold leading-tight">
                  {language === 'zh' ? '深度学习与人工智能' : 'Deep Learning & Artificial Intelligence'}
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => scrollTo(3)}
              className="flex-1 min-w-[200px] max-w-[280px] h-16 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-xs font-bold leading-tight">
                  {language === 'zh' ? '自主系统与工业自动化' : 'Autonomous Systems & Industrial Automation'}
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Research Areas Carousel */}
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-xl relative" ref={emblaRef}>
            <div className="flex" style={{ transform: 'translate3d(0, 0, 0)', width: '100%' }}>
              {researchAreas.map((area, index) => (
                <div key={index} className="w-full shrink-0" style={{ position: 'relative', left: `${index * 100}%` }}>
                  <Card className="overflow-hidden border-0 shadow-2xl bg-card/90 backdrop-blur-sm">
                    <CardContent className="p-0">
                      {/* Image with Title Overlay */}
                      <div className="relative h-80 lg:h-96">
                        <ImageWithFallback
                          src={area.image}
                          alt={area.title}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                          <div className="backdrop-blur-md bg-black/90 rounded-lg px-4 py-3 border border-white/20 shadow-lg">
                            <h2 className="text-2xl lg:text-2xl font-bold text-white mb-2 drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                              {area.title}
                            </h2>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content Below Image */}
                      <div className="p-6 lg:p-8">
                        <div className="text-muted-foreground leading-relaxed text-base mb-6">
                          <div dangerouslySetInnerHTML={{ __html: area.introduction }} />
                        </div>
                        
                        {/* Details */}
                        {area.details && (
                          <div className="mb-6">
                            <h3 className="text-lg mb-3 text-foreground font-semibold">
                              {language === 'zh' ? '研究详情' : 'Research Details'}
                            </h3>
                            <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-border/60">
                              <div className="text-sm leading-relaxed text-muted-foreground">
                                <div dangerouslySetInnerHTML={{ __html: area.details }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {researchAreas.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 rounded-full p-3 bg-white/95 backdrop-blur-sm border border-gray-300 text-slate-800 hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={scrollPrev}
                type="button"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 rounded-full p-3 bg-white/95 backdrop-blur-sm border border-gray-300 text-slate-800 hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={scrollNext}
                type="button"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {researchAreas.length > 1 && (
            <div className="flex justify-center mt-6">
              <div className="backdrop-blur-sm bg-white/90 rounded-full px-4 py-2 shadow-lg border border-gray-300/60">
                <div className="flex space-x-2">
                  {scrollSnaps.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === selectedIndex 
                          ? 'bg-blue-600 scale-125 shadow-sm' 
                          : 'bg-slate-400 hover:bg-slate-500 hover:scale-110'
                      }`}
                      onClick={() => scrollTo(index)}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        {/* <div className="text-center mt-20">
          <div className="p-12 bg-muted/20 rounded-lg border border-border/30">
            <h2 className="text-3xl mb-6 text-foreground">
              {language === 'zh' ? '合作机会' : 'Collaboration Opportunities'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {language === 'zh' 
                ? '我们欢迎与学术界和工业界的合作伙伴探讨研究合作、技术转移和学术交流的机会。'
                : 'We welcome opportunities to explore research collaboration, technology transfer, and academic exchange with partners from academia and industry.'
              }
            </p>
            <Button
              onClick={() => navigateTo('contact')}
              className="px-8 py-3 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {language === 'zh' ? '联系我们' : 'Contact Us'}
            </Button>
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}
