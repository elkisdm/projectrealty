"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ThumbsUp, Flag, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Review } from "@schemas/review";
import { RatingDisplay } from "./RatingDisplay";

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  className?: string;
}

/**
 * ReviewCard - Tarjeta individual de reseña
 * 
 * Características:
 * - Header con avatar, nombre, fecha, rating
 * - Contenido: título, comentario, imágenes
 * - Footer con acciones (Útil, Reportar)
 * - Badge de verificado
 * - Respuestas del vendedor (colapsable)
 */
export function ReviewCard({
  review,
  onHelpful,
  onReport,
  className = "",
}: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [showVendorResponse, setShowVendorResponse] = useState(false);
  const [imageLightbox, setImageLightbox] = useState<string | null>(null);

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  };

  // Generar iniciales para avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Manejar "Útil"
  const handleHelpful = () => {
    if (onHelpful) {
      onHelpful(review.id);
    }
    setIsHelpful(!isHelpful);
  };

  // Manejar "Reportar"
  const handleReport = () => {
    if (onReport) {
      onReport(review.id);
    } else {
      // Por ahora solo mostrar alerta
      alert("Gracias por reportar esta reseña. La revisaremos pronto.");
    }
  };

  return (
    <>
      <div
        className={`bg-card border border-border rounded-2xl p-6 space-y-4 ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#8B6CFF]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-[#8B6CFF]">
                {getInitials(review.userName)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-text">{review.userName}</span>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-xs text-[#8B6CFF] bg-[#8B6CFF]/10 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verificado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <RatingDisplay rating={review.rating} size="sm" />
                <span className="text-xs text-subtext">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-3">
          {/* Título */}
          {review.title && (
            <h4 className="font-semibold text-text text-lg">{review.title}</h4>
          )}

          {/* Comentario */}
          <p className="text-subtext leading-relaxed">{review.comment}</p>

          {/* Imágenes */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {review.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setImageLightbox(image.url)}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-[#8B6CFF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
                  aria-label={`Ver imagen de reseña: ${image.alt || "Imagen"}`}
                >
                  <Image
                    src={image.thumbnailUrl || image.url}
                    alt={image.alt || "Imagen de reseña"}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Acciones */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHelpful}
              className={`flex items-center gap-2 text-sm transition-colors ${
                isHelpful
                  ? "text-[#8B6CFF]"
                  : "text-subtext hover:text-text"
              } focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] rounded px-2 py-1`}
              aria-label={`Marcar como útil (${review.helpful} personas encontraron esto útil)`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${isHelpful ? "fill-current" : ""}`}
              />
              <span>
                Útil {review.helpful > 0 && `(${review.helpful})`}
              </span>
            </button>

            <button
              onClick={handleReport}
              className="flex items-center gap-2 text-sm text-subtext hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
              aria-label="Reportar reseña"
            >
              <Flag className="w-4 h-4" />
              <span>Reportar</span>
            </button>
          </div>
        </div>

        {/* Respuesta del vendedor */}
        {review.vendorResponse && (
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setShowVendorResponse(!showVendorResponse)}
              className="flex items-center justify-between w-full text-left"
              aria-expanded={showVendorResponse}
              aria-label="Ver respuesta del vendedor"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#8B6CFF]">
                  Respuesta del vendedor
                </span>
                <span className="text-xs text-subtext">
                  {review.vendorResponse.vendorName}
                </span>
              </div>
              {showVendorResponse ? (
                <ChevronUp className="w-4 h-4 text-subtext" />
              ) : (
                <ChevronDown className="w-4 h-4 text-subtext" />
              )}
            </button>

            <AnimatePresence>
              {showVendorResponse && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 bg-[#8B6CFF]/5 rounded-lg">
                    <p className="text-sm text-subtext leading-relaxed">
                      {review.vendorResponse.message}
                    </p>
                    <span className="text-xs text-subtext mt-2 block">
                      {formatDate(review.vendorResponse.createdAt)}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox para imágenes */}
      <AnimatePresence>
        {imageLightbox && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setImageLightbox(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl max-h-[90vh] w-full h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={imageLightbox}
                  alt="Imagen de reseña"
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
                <button
                  onClick={() => setImageLightbox(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Cerrar imagen"
                >
                  ×
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}




