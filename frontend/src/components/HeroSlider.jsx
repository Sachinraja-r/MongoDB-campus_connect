import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

export const HeroSlider = ({ slides = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  // Fallback default slide if no slides seeded yet
  const displaySlides =
    slides.length > 0
      ? slides
      : [
          {
            title: 'Campus Hackathon 2026',
            subtitle: 'Knowledge Institute of Technology (KIOT)',
            description:
              '36-Hour flagship hackathon. Win cash prizes and incubation support from KIOT Innovation Centre.',
            image:
              'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
            tag: 'FEATURED HACKATHON',
            ctaLabel: 'Explore Hackathon',
            ctaDestination: '/events',
          },
        ];

  // Auto-rotation every 5 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused || displaySlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, displaySlides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: '340px' }}
    >
      {/* Background Image with Dark Vignette Gradient */}
      <div className="absolute inset-0">
        <img
          src={currentSlide.image}
          alt={currentSlide.title}
          className="w-full h-full object-cover opacity-35 transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      {/* Slide Content */}
      <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-between min-h-[340px] max-w-2xl">
        <div>
          {/* Tag / Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-kiot-gold text-slate-950 shadow-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{currentSlide.tag || 'KIOT SPOTLIGHT'}</span>
          </div>

          {/* Title */}
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {currentSlide.title}
          </h2>

          {/* Subtitle */}
          {currentSlide.subtitle && (
            <p className="text-sm sm:text-base font-semibold text-kiot-lightgold/90 mt-1">
              {currentSlide.subtitle}
            </p>
          )}

          {/* Description */}
          {currentSlide.description && (
            <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              {currentSlide.description}
            </p>
          )}
        </div>

        {/* CTA & Slide Indicators */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <Link
            to={currentSlide.ctaDestination || '/events'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kiot-maroon text-white font-bold text-xs sm:text-sm hover:bg-kiot-crimson shadow-md shadow-kiot-maroon/30 transition-all hover:gap-3"
          >
            <span>{currentSlide.ctaLabel || 'Explore Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Navigation Dots */}
          <div className="flex items-center gap-1.5">
            {displaySlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-kiot-gold'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Arrow Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
