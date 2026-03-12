import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeroConfig } from '../utils/config';

interface CarouselProps {
  config: HeroConfig;
  className?: string;
  height?: string;
}

export function Carousel({ config, className = '', height = 'h-64 lg:h-80' }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (config.autoPlay) {
      const timer = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % config.slides.length);
      }, config.slideDuration);
      return () => clearInterval(timer);
    }
  }, [config.autoPlay, config.slideDuration, config.slides.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % config.slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + config.slides.length) % config.slides.length);
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Background Image */}
      <div className={`relative ${height} overflow-hidden`}>
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
              src={config.slides[currentSlide].image}
              alt={config.slides[currentSlide].alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40"></div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {config.showNavigation && config.slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 rounded-full p-2 bg-white/10 backdrop-blur-xl border border-white/30 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 rounded-full p-2 bg-white/10 backdrop-blur-xl border border-white/30 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {config.showIndicators && config.slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          <div className="backdrop-blur-xl bg-white/10 border border-white/30 rounded-full px-4 py-2 shadow-lg">
            <div className="flex space-x-2">
              {config.slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
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
  );
}
