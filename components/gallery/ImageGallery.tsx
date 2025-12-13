"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { clx } from "@lib/utils";

const DEFAULT_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzE2JyBoZWlnaHQ9JzEwJyBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+";

type ImageGalleryProps = {
  images?: string[];
  media?: { images?: string[] };
  coverImage?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  compact?: boolean; // Para layouts más pequeños
};

export function ImageGallery({
  images,
  media,
  coverImage,
  autoPlay = false,
  autoPlayInterval = 5000,
  compact = false
}: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isInitialRenderRef = useRef(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Priority: media.images > images prop > fallback to coverImage
  const imageList = media?.images?.length ? media.images : images?.length ? images : coverImage ? [coverImage] : [];

  useEffect(() => {
    // After first client render, disable priority to avoid multiple priority images after interactions
    isInitialRenderRef.current = false;

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || prefersReducedMotion || imageList.length <= 1) {
      return;
    }

    if (isPlaying) {
      autoPlayRef.current = setInterval(() => {
        setActive((prev) => (prev + 1) % imageList.length);
      }, autoPlayInterval);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, autoPlay, autoPlayInterval, imageList.length, prefersReducedMotion]);

  // Pause auto-play on hover
  const handleMouseEnter = useCallback(() => {
    if (autoPlay && !prefersReducedMotion) {
      setIsPlaying(false);
    }
  }, [autoPlay, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (autoPlay && !prefersReducedMotion) {
      setIsPlaying(true);
    }
  }, [autoPlay, prefersReducedMotion]);

  const nextImage = useCallback(() => {
    if (!imageList || imageList.length === 0) return;
    setActive((prev) => (prev + 1) % imageList.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only depends on length for modular arithmetic
  }, [imageList.length]);

  const prevImage = useCallback(() => {
    if (!imageList || imageList.length === 0) return;
    setActive((prev) => (prev - 1 + imageList.length) % imageList.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only depends on length for modular arithmetic
  }, [imageList.length]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'Escape':
            setIsFullscreen(false);
            break;
          case 'ArrowLeft':
            prevImage();
            break;
          case 'ArrowRight':
            nextImage();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, prevImage, nextImage]);

  if (!imageList || imageList.length === 0) {
    return null;
  }

  const handleKeyDown = (event: React.KeyboardEvent, index?: number) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (index !== undefined) {
          event.preventDefault();
          setActive(index);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextImage();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        prevImage();
        break;
      case 'Home':
        event.preventDefault();
        setActive(0);
        break;
      case 'End':
        event.preventDefault();
        setActive(imageList.length - 1);
        break;
      case 'Escape':
        if (autoPlay) {
          setIsPlaying(false);
        }
        break;
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Aspect ratios optimizados para imágenes de propiedades
  const aspectRatioClass = compact
    ? "aspect-[4/3] md:aspect-[3/2]"
    : "aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/10]";

  return (
    <div
      className="w-full space-y-3"
      role="region"
      aria-label="Galería de imágenes de la propiedad"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* Main Image Container */}
      <div className={clx(
        "relative overflow-hidden rounded-2xl ring-1 ring-white/10 group",
        aspectRatioClass
      )}>
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Main Image */}
        <Image
          src={imageList[active]}
          alt={`Imagen ${active + 1} de ${imageList.length} de la galería`}
          fill
          sizes={compact
            ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            : "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          }
          className={clx(
            "object-cover transition-all duration-700 ease-out",
            isLoading ? "opacity-0" : "opacity-100",
            !prefersReducedMotion && "group-hover:scale-105 transition-transform duration-700 ease-out"
          )}
          placeholder="blur"
          blurDataURL={DEFAULT_BLUR}
          priority={isInitialRenderRef.current && active === 0}
          onLoad={handleImageLoad}
        />

        {/* Navigation Controls */}
        {imageList.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={prevImage}
              onKeyDown={handleKeyDown}
              className={clx(
                "absolute top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                compact ? "left-2" : "left-4"
              )}
              aria-label="Imagen anterior"
              tabIndex={0}
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextImage}
              onKeyDown={handleKeyDown}
              className={clx(
                "absolute top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                compact ? "right-2" : "right-4"
              )}
              aria-label="Imagen siguiente"
              tabIndex={0}
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Contador de imágenes */}
            <div className="absolute top-4 right-4 bg-black/50 text-white text-sm font-medium px-3 py-1.5 rounded-full">
              {active + 1} / {imageList.length}
            </div>

            {/* Auto-play Toggle */}
            {autoPlay && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={clx(
                  "absolute w-8 h-8 md:w-10 md:h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  compact ? "top-2 right-2" : "top-4 right-4"
                )}
                aria-label={isPlaying ? "Pausar presentación" : "Reproducir presentación"}
                tabIndex={0}
              >
                {isPlaying ? <Pause className="w-3 h-3 md:w-4 md:h-4" /> : <Play className="w-3 h-3 md:w-4 md:h-4" />}
              </button>
            )}

            {/* Image Counter */}
            <div className={clx(
              "absolute bg-black/50 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium",
              compact ? "bottom-2 left-2" : "bottom-4 left-4"
            )}>
              {active + 1} / {imageList.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {imageList.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={clx(
                "shrink-0 aspect-video rounded-lg md:rounded-xl overflow-hidden ring-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-all duration-300 ease-out",
                !prefersReducedMotion && "motion-reduce:transition-none",
                compact
                  ? "w-16 md:w-20"
                  : "w-20 md:w-24 lg:w-28",
                i === active
                  ? "ring-[var(--ring)] scale-105"
                  : "ring-white/10 hover:ring-white/20 hover:scale-102"
              )}
              aria-label={`Ver imagen ${i + 1} de ${imageList.length}`}
              aria-pressed={i === active}
              tabIndex={0}
            >
              <Image
                src={src}
                alt={`Miniatura ${i + 1}`}
                width={compact ? 80 : 112}
                height={compact ? 60 : 84}
                className="w-full h-full object-cover"
                placeholder="blur"
                blurDataURL={DEFAULT_BLUR}
              />
            </button>
          ))}
        </div>
      )}

      {/* Paginador visual (dots) */}
      {imageList.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {imageList.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={clx(
                "w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                i === active
                  ? "bg-blue-600 w-4"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              )}
              aria-label={`Ir a imagen ${i + 1}`}
              aria-current={i === active ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
