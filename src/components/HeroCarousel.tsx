import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveHeroBanners, HeroBanner } from '../lib/contentService';

export default function HeroCarousel() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const data = await getActiveHeroBanners();
    setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    if (banners.length <= 1) return;

    const currentBanner = banners[currentIndex];
    if (!currentBanner) return;

    const timer = setTimeout(() => {
      goToNext();
    }, currentBanner.duration);

    return () => clearTimeout(timer);
  }, [currentIndex, banners]);

  const goToNext = () => {
    if (banners.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      setIsTransitioning(false);
    }, 500);
  };

  const goToPrevious = () => {
    if (banners.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center bg-gradient-to-br from-chocolate to-coffee">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="spinner-luxury" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  if (!currentBanner) return null;

  const getTransitionClass = () => {
    switch (currentBanner.transition_type) {
      case 'slide':
        return 'transform transition-transform duration-500';
      case 'fade-slide':
        return 'opacity-0 transform translate-x-4 transition-all duration-500';
      case 'fade':
      default:
        return 'opacity-0 transition-opacity duration-500';
    }
  };

  const getActiveClass = () => {
    switch (currentBanner.transition_type) {
      case 'slide':
        return 'transform translate-x-0';
      case 'fade-slide':
        return 'opacity-100 transform translate-x-0';
      case 'fade':
      default:
        return 'opacity-100';
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <picture>
          {currentBanner.mobile_image_url && (
            <source
              media="(max-width: 768px)"
              srcSet={currentBanner.mobile_image_url}
            />
          )}
          {currentBanner.tablet_image_url && (
            <source
              media="(max-width: 1024px)"
              srcSet={currentBanner.tablet_image_url}
            />
          )}
          <img
            src={currentBanner.desktop_image_url}
            alt={currentBanner.title}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isTransitioning ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
            }`}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-chocolate/80 via-chocolate/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className={`max-w-3xl ${getTransitionClass()} ${!isTransitioning ? getActiveClass() : ''}`}>
          {/* Small Label */}
          {currentBanner.subtitle && (
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gold" />
              <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">
                {currentBanner.subtitle}
              </span>
            </div>
          )}

          {/* Main Title */}
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light text-ivory leading-tight mb-4">
            {currentBanner.title}
          </h1>

          {/* Highlighted Title */}
          {currentBanner.description && (
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light italic text-gold leading-tight mb-6">
              {currentBanner.description}
            </h2>
          )}

          {/* Button */}
          {currentBanner.button_text && currentBanner.button_url && (
            <div className="mt-8">
              {currentBanner.button_url.startsWith('http') ? (
                <a
                  href={currentBanner.button_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary group inline-flex items-center gap-2"
                >
                  {currentBanner.button_text}
                </a>
              ) : (
                <Link
                  to={currentBanner.button_url}
                  className="btn-primary group inline-flex items-center gap-2"
                >
                  {currentBanner.button_text}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-ivory/10 hover:bg-ivory/20 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory transition-all"
            aria-label="Previous banner"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-ivory/10 hover:bg-ivory/20 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory transition-all"
            aria-label="Next banner"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-gold w-8'
                  : 'bg-ivory/50 hover:bg-ivory/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
