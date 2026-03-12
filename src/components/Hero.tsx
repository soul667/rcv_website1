import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from './LanguageContext';
import { getHeroConfig } from '../utils/config';

// Load Noto Serif SC for elegant Chinese rendering
const FONT_LINK_ID = 'noto-serif-sc-link';
if (typeof document !== 'undefined' && !document.getElementById(FONT_LINK_ID)) {
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200;300&display=swap';
  document.head.appendChild(link);
}

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const { t, language } = useLanguage();
  const heroConfig = getHeroConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    if (heroConfig.autoPlay) {
      const timer = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % heroConfig.slides.length);
      }, heroConfig.slideDuration);
      return () => clearInterval(timer);
    }
  }, [heroConfig.autoPlay, heroConfig.slideDuration, heroConfig.slides.length]);

  // 滚轮事件处理
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && !isScrolling) {
        event.preventDefault();
        scrollToNextSection();
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('wheel', handleWheel, { passive: false });
      return () => section.removeEventListener('wheel', handleWheel);
    }
  }, [isScrolling]);

  // 触摸滑动事件处理（手机端向下滑动）
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (delta > 50 && !isScrolling) {
        scrollToNextSection();
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('touchstart', handleTouchStart, { passive: true });
      section.addEventListener('touchend', handleTouchEnd, { passive: true });
      return () => {
        section.removeEventListener('touchstart', handleTouchStart);
        section.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isScrolling]);

  const scrollToNextSection = () => {
    if (isScrolling) return;
    setIsScrolling(true);

    // 优先找 #intro，其次找 hero 后面的第一个同级元素
    const target =
      document.getElementById('intro') ||
      (sectionRef.current?.nextElementSibling as HTMLElement | null);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => setIsScrolling(false), 1000);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroConfig.slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroConfig.slides.length) % heroConfig.slides.length);
  };

  return (
    <section ref={sectionRef} id="home" className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
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
              src={heroConfig.slides[currentSlide].image}
              alt={heroConfig.slides[currentSlide].alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/80"></div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white max-w-5xl mx-auto px-6 flex flex-col items-center gap-5">
          {/* Label badge */}
          <span className="text-[10px] md:text-xs tracking-[0.3em] text-white/60 uppercase font-light border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm bg-white/5">
            RCV LAB
          </span>

          {/* Main title */}
          <h1
            className="text-5xl md:text-7xl font-extralight tracking-wide text-white leading-tight"
            style={{
              textShadow: '0 2px 40px rgba(0,0,0,0.8)',
              fontWeight: 200,
              letterSpacing: language === 'zh' ? '0.08em' : '0.04em',
              fontFamily: language === 'zh'
                ? '"Microsoft YaHei", "微软雅黑", sans-serif'
                : 'inherit',
            }}
          >
            {t('hero.title')}
          </h1>

          {/* Thin divider */}
          <div className="flex items-center gap-4 w-48">
            <div className="flex-1 h-px bg-white/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <div className="flex-1 h-px bg-white/30" />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {heroConfig.showNavigation && (
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
      {heroConfig.showIndicators && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          <div className="backdrop-blur-xl bg-white/10 border border-white/30 rounded-full px-6 py-3 shadow-lg">
            <div className="flex space-x-3">
              {heroConfig.slides.map((_, index) => (
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

    </section>
  );
}
