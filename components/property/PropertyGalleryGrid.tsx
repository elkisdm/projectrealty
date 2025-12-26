"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Unit, Building } from "@schemas/models";
import { SwipeableGallery } from "./SwipeableGallery";

interface PropertyGalleryGridProps {
  unit?: Unit;
  building: Building;
  className?: string;
}

const DEFAULT_BLUR = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

export function PropertyGalleryGrid({ unit, building, className = "" }: PropertyGalleryGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mobileGalleryIndex, setMobileGalleryIndex] = useState(0);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Combinar imágenes según prioridad: tipologiaImages > areasComunesImages > buildingImages > unitImages
  // Eliminar duplicados para evitar mostrar la misma imagen múltiples veces
  const getAllImages = (): string[] => {
    const images: string[] = [];
    const seen = new Set<string>(); // Para detectar duplicados

    // Helper para agregar imágenes sin duplicados
    const addImages = (imageArray: string[]) => {
      imageArray.forEach(img => {
        if (img && !seen.has(img)) {
          seen.add(img);
          images.push(img);
        }
      });
    };

    // Debug en desarrollo - siempre mostrar para diagnosticar
    if (typeof window !== 'undefined') {
      console.log('[PropertyGalleryGrid] Debug imágenes:', {
        tipologia: unit?.tipologia,
        unitId: unit?.id,
        hasUnit: !!unit,
        imagesTipologia: unit?.imagesTipologia,
        imagesTipologiaType: typeof unit?.imagesTipologia,
        imagesTipologiaIsArray: Array.isArray(unit?.imagesTipologia),
        imagesTipologiaLength: unit?.imagesTipologia?.length,
        imagesAreasComunes: unit?.imagesAreasComunes,
        imagesAreasComunesType: typeof unit?.imagesAreasComunes,
        imagesAreasComunesIsArray: Array.isArray(unit?.imagesAreasComunes),
        imagesAreasComunesLength: unit?.imagesAreasComunes?.length,
        buildingGalleryLength: building?.gallery?.length,
        buildingCoverImage: building?.coverImage,
      });
    }

    // Prioridad 1: Imágenes de tipología
    if (unit?.imagesTipologia && Array.isArray(unit.imagesTipologia) && unit.imagesTipologia.length > 0) {
      addImages(unit.imagesTipologia);
    }

    // Prioridad 2: Imágenes de áreas comunes del edificio
    if (unit?.imagesAreasComunes && Array.isArray(unit.imagesAreasComunes) && unit.imagesAreasComunes.length > 0) {
      addImages(unit.imagesAreasComunes);
    }

    // Prioridad 3: Imágenes del edificio (galería) - solo si NO hay imagesAreasComunes
    // (porque imagesAreasComunes ya contiene las imágenes del edificio)
    if (!unit?.imagesAreasComunes || unit.imagesAreasComunes.length === 0) {
      if (building.gallery && Array.isArray(building.gallery) && building.gallery.length > 0) {
        addImages(building.gallery);
      }
    }

    // Prioridad 4: CoverImage del edificio (solo si no está ya incluida)
    if (building.coverImage && !seen.has(building.coverImage)) {
      images.push(building.coverImage);
      seen.add(building.coverImage);
    }

    // Prioridad 5: Imágenes de la unidad (interior) - solo si no hay imágenes del edificio
    if (unit?.images && Array.isArray(unit.images) && unit.images.length > 0) {
      addImages(unit.images);
    }

    // Fallback: si no hay imágenes, usar coverImage del edificio
    if (images.length === 0 && building.coverImage) {
      images.push(building.coverImage);
    }

    return images;
  };

  const allImages = getAllImages();

  // Si no hay imágenes, usar imagen por defecto del edificio o fallback
  const finalImages = allImages.length > 0
    ? allImages
    : building.coverImage
      ? [building.coverImage]
      : ['/images/lascondes-cover.jpg'];

  // Grid 1+4: Primera imagen grande, siguientes 4 pequeñas
  const mainImage = finalImages[0];
  const smallImages = finalImages.slice(1, 5); // Máximo 4 imágenes pequeñas
  const remainingCount = Math.max(0, finalImages.length - 5);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % finalImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + finalImages.length) % finalImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      nextImage();
    } else if (e.key === "ArrowLeft") {
      prevImage();
    }
  };

  // Focus trap para lightbox (accesibilidad)
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      // Focus en el botón de cerrar cuando se abre
      const closeButton = lightboxRef.current.querySelector('button[aria-label="Cerrar galería"]') as HTMLButtonElement;
      if (closeButton) {
        closeButton.focus();
      }

      // Prevenir scroll del body cuando lightbox está abierto
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [lightboxOpen]);

  return (
    <>
      {/* Grid responsive: Mobile stack vertical, Desktop grid 1+4 */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 rounded-2xl overflow-hidden ${className}`}
        role="region"
        aria-label="Galería de imágenes de la propiedad"
      >
        {/* Desktop Layout: Imagen principal grande (Grid 1+4) */}
        <div
          className="hidden md:block relative aspect-square cursor-pointer group overflow-hidden rounded-tl-2xl rounded-tr-none"
          onClick={() => openLightbox(0)}
          role="button"
          tabIndex={0}
          aria-label="Ver imagen principal en pantalla completa"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openLightbox(0);
            }
          }}
        >
          <Image
            src={mainImage}
            alt="Imagen principal de la propiedad"
            fill
            sizes="(max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={DEFAULT_BLUR}
            priority
          />
          {remainingCount > 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-lg font-semibold">
                +{finalImages.length - 1} más
              </span>
            </div>
          )}
        </div>

        {/* Mobile Layout: Swipeable Gallery con gestos mejorados */}
        <div className="md:hidden">
          <SwipeableGallery
            images={finalImages}
            initialIndex={mobileGalleryIndex}
            onImageChange={(index) => {
              setMobileGalleryIndex(index);
            }}
            onImageClick={(index) => {
              setLightboxIndex(index);
              setLightboxOpen(true);
            }}
            showIndicators={true}
            showNavigation={false}
            className="rounded-t-2xl"
          />
        </div>

        {/* Grid de 4 imágenes pequeñas (Oculto en mobile para reducir altura, derecha en desktop) */}
        <div className="hidden md:grid grid-cols-2 gap-2 md:gap-4">
          {smallImages.map((image, index) => {
            const imageIndex = index + 1;
            const isLast = index === smallImages.length - 1 && remainingCount > 0;
            // Bordes redondeados según posición
            const roundedClasses = index === 0
              ? "rounded-bl-2xl md:rounded-tl-none md:rounded-tr-2xl"
              : index === 1
                ? "rounded-br-2xl md:rounded-tr-2xl"
                : index === 2
                  ? "md:rounded-bl-2xl"
                  : "md:rounded-br-2xl";

            return (
              <div
                key={imageIndex}
                className={`relative aspect-square cursor-pointer group overflow-hidden ${roundedClasses}`}
                onClick={() => openLightbox(imageIndex)}
                role="button"
                tabIndex={0}
                aria-label={`Ver imagen ${imageIndex + 1} en pantalla completa`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(imageIndex);
                  }
                }}
              >
                <Image
                  src={image}
                  alt={`Imagen ${imageIndex + 1} de la galería`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL={DEFAULT_BLUR}
                />
                {isLast && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Si hay menos de 4 imágenes pequeñas, rellenar con espacios vacíos */}
          {smallImages.length < 4 && Array.from({ length: 4 - smallImages.length }).map((_, index) => {
            const emptyIndex = smallImages.length + index;
            const roundedClasses = emptyIndex === 2
              ? "md:rounded-bl-2xl"
              : "md:rounded-br-2xl";

            return (
              <div
                key={`empty-${index}`}
                className={`relative aspect-square bg-gray-100 dark:bg-gray-800 ${roundedClasses}`}
                aria-hidden="true"
              />
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Galería de imágenes en pantalla completa"
          >
            {/* Botón cerrar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Cerrar galería"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Imagen en lightbox */}
            <div
              className="relative w-full h-full flex items-center justify-center max-w-7xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={finalImages[lightboxIndex]}
                alt={`Imagen ${lightboxIndex + 1} de ${finalImages.length} en pantalla completa`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />

              {/* Contador */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-lg font-medium">
                {lightboxIndex + 1} / {finalImages.length}
              </div>

              {/* Navegación */}
              {finalImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}





