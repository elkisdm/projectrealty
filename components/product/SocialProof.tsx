"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@hooks/useReducedMotion";
import { RatingDisplay } from "@components/ecommerce/RatingDisplay";
import type { Review } from "@schemas/review";

interface SocialProofProps {
  averageRating: number;
  totalReviews: number;
  reviews?: Review[];
  className?: string;
}

export function SocialProof({
  averageRating,
  totalReviews,
  reviews = [],
  className = "",
}: SocialProofProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Extraer todas las imágenes de reviews (priorizar reviews emocionales - rating 4-5)
  const photoReviews = reviews
    .filter((review) => review.rating >= 4 && review.images && review.images.length > 0)
    .flatMap((review) =>
      (review.images || []).map((image) => ({
        ...image,
        reviewUserName: review.userName,
        reviewRating: review.rating,
        reviewComment: review.comment,
      }))
    );

  // Si no hay suficientes fotos de reviews emocionales, agregar otras
  if (photoReviews.length < 3) {
    reviews
      .filter((review) => review.images && review.images.length > 0)
      .forEach((review) => {
        (review.images || []).forEach((image) => {
          if (!photoReviews.find((p) => p.id === image.id)) {
            photoReviews.push({
              ...image,
              reviewUserName: review.userName,
              reviewRating: review.rating,
              reviewComment: review.comment,
            });
          }
        });
      });
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photoReviews.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photoReviews.length) % photoReviews.length);
  };

  // Auto-avanzar carrusel cada 5 segundos
  useEffect(() => {
    if (photoReviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photoReviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [photoReviews.length]);

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}>
      <div className="space-y-12">
        {/* Rating y total de reviews */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold text-text">{averageRating.toFixed(1)}</span>
              <RatingDisplay rating={averageRating} size="lg" showValue={false} />
            </div>
          </div>
          <p className="text-subtext text-lg">
            Basado en <strong className="text-text">{totalReviews}</strong> reseña
            {totalReviews !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Photo Reviews Carousel - Fotos reales antes que texto */}
        {photoReviews.length > 0 && (
          <div className="relative">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 group border border-border">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhotoIndex}
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                  transition={{ duration: shouldReduceMotion ? 0.2 : 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={photoReviews[currentPhotoIndex].url}
                    alt={
                      photoReviews[currentPhotoIndex].alt ||
                      `Foto de reseña de ${photoReviews[currentPhotoIndex].reviewUserName}`
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />

                  {/* Overlay con info de la review */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <RatingDisplay
                        rating={photoReviews[currentPhotoIndex].reviewRating}
                        size="sm"
                        showValue={false}
                      />
                      <span className="text-white text-sm font-medium">
                        {photoReviews[currentPhotoIndex].reviewUserName}
                      </span>
                    </div>
                    {photoReviews[currentPhotoIndex].reviewComment && (
                      <p className="text-white/90 text-sm line-clamp-2">
                        {photoReviews[currentPhotoIndex].reviewComment}
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navegación */}
              {photoReviews.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Indicadores */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {photoReviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                          index === currentPhotoIndex
                            ? "bg-white w-6"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                        aria-label={`Ir a foto ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Contador */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    {currentPhotoIndex + 1} / {photoReviews.length}
                  </div>
                </>
              )}
            </div>

            {/* Botón ver todas las reseñas */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  const reviewsSection = document.querySelector('[data-section="reviews"]');
                  if (reviewsSection) {
                    reviewsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="px-6 py-3 bg-action text-action-text rounded-lg hover:bg-action-hover transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2"
              >
                Ver todas las reseñas ({totalReviews})
              </button>
            </div>
          </div>
        )}

        {/* Fallback si no hay fotos */}
        {photoReviews.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Star className="w-12 h-12 text-subtext mx-auto mb-4 opacity-50" />
            <p className="text-subtext">
              Sé el primero en compartir una foto de tu experiencia
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

