"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroCarouselProps {
  images: Array<{
    url: string;
    alt: string;
    buildingName?: string;
  }>;
  autoplayInterval?: number;
  className?: string;
}

const DEFAULT_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzE2JyBoZWlnaHQ9JzEwJyBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+";

export function HeroCarousel({
  images,
  autoplayInterval = 5000,
  className = "",
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Si no hay imágenes, no renderizar
  if (!images || images.length === 0) {
    return null;
  }

  // Autoplay
  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isPaused, images.length, autoplayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        // Bordes modernos con border-radius grande y responsive
        borderRadius: 'clamp(1.5rem, 4vw, 2.5rem)',
        // Sombra moderna con múltiples capas para profundidad
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.05),
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 20px 25px -5px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
        `,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        // Reanudar después de 3 segundos de inactividad táctil
        setTimeout(() => setIsPaused(false), 3000);
      }}
    >
      {/* Container de imágenes */}
      <div
        className="relative aspect-square w-full sm:aspect-[21/8] md:aspect-[21/7]"
        style={{
          borderRadius: 'clamp(1.5rem, 4vw, 2.5rem)',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt}
              fill
              priority={currentIndex === 0}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR}
            />
            {/* Overlay sutil para mejorar legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Botones de navegación (solo en desktop y si hay más de 1 imagen) */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 hidden sm:block"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 hidden sm:block"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* Indicadores de slide (dots) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 sm:bottom-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:h-2.5 sm:w-2.5 ${index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
                  }`}
                aria-label={`Ir a imagen ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>
        )}

        {/* Contador de imágenes (opcional, solo si hay más de 1) */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:top-4 sm:right-4 sm:text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}

