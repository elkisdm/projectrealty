"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeGesture } from "@hooks/useSwipeGesture";

interface SwipeableGalleryProps {
  images: string[];
  initialIndex?: number;
  onImageChange?: (index: number) => void;
  onImageClick?: (index: number) => void;
  className?: string;
  showIndicators?: boolean;
  showNavigation?: boolean;
}

const DEFAULT_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzE2JyBoZWlnaHQ9JzEwJyBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+";

/**
 * Componente de galería con gestos swipe mejorados
 * Usa react-use-gesture para gestos fluidos y naturales
 */
export function SwipeableGallery({
  images,
  initialIndex = 0,
  onImageChange,
  onImageClick,
  className = "",
  showIndicators = true,
  showNavigation = true,
}: SwipeableGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Actualizar índice activo cuando cambia desde fuera
  useEffect(() => {
    if (initialIndex !== activeIndex && !isTransitioning) {
      setActiveIndex(initialIndex);
    }
  }, [initialIndex]);

  const goToIndex = (index: number, animate = true) => {
    if (index < 0 || index >= images.length || index === activeIndex) return;
    
    setIsTransitioning(true);
    setActiveIndex(index);
    onImageChange?.(index);
    
    if (animate) {
      setTimeout(() => setIsTransitioning(false), 300);
    } else {
      setIsTransitioning(false);
    }
  };

  const goToNext = () => {
    if (activeIndex < images.length - 1) {
      goToIndex(activeIndex + 1);
    } else {
      // Loop al inicio
      goToIndex(0);
    }
  };

  const goToPrevious = () => {
    if (activeIndex > 0) {
      goToIndex(activeIndex - 1);
    } else {
      // Loop al final
      goToIndex(images.length - 1);
    }
  };

  // Gestos swipe
  const { bind, isDragging, offset } = useSwipeGesture({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    threshold: 50,
    velocityThreshold: 0.5,
    preventScroll: true,
  });

  // Calcular transformación durante drag
  const getTransform = () => {
    if (!isDragging || offset === 0) return "translateX(0)";
    const percentage = (offset / (containerRef.current?.clientWidth || 1)) * 100;
    return `translateX(${percentage}%)`;
  };

  if (images.length === 0) return null;

  return (
    <div
      className={`relative w-full aspect-[4/3] overflow-hidden rounded-2xl ${className}`}
      ref={containerRef}
      {...bind()}
    >
      {/* Contenedor de imágenes */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: offset > 0 ? 100 : -100 }
            }
            animate={
              isDragging
                ? {
                    x: offset,
                    opacity: 1,
                  }
                : {
                    x: 0,
                    opacity: 1,
                  }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: offset > 0 ? -100 : 100 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.2 }
                : {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }
            }
            className="absolute inset-0"
            style={isDragging ? { transform: getTransform() } : undefined}
          >
            <Image
              src={images[activeIndex]}
              alt={`Imagen ${activeIndex + 1} de ${images.length}`}
              fill
              sizes="100vw"
              className="object-cover"
              priority={activeIndex === 0}
              loading={activeIndex === 0 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR}
              onClick={() => onImageClick?.(activeIndex)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicadores de posición */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${
                  index === activeIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/75"
                }
                focus:outline-none focus:ring-2 focus:ring-white/50
              `}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Contador de imágenes */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 pointer-events-none z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          {activeIndex + 1} / {images.length}
        </div>
      )}

      {/* Botones de navegación */}
      {showNavigation && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

