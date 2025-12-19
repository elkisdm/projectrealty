"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  showValue?: boolean;
  showCount?: boolean;
  reviewCount?: number;
  onRatingChange?: (rating: number) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * RatingDisplay - Componente reutilizable para mostrar ratings con estrellas
 * 
 * Características:
 * - Display de estrellas llenas/vacías/medias
 * - Modo interactivo para formularios
 * - Accesibilidad completa (ARIA, keyboard navigation)
 * - Respeto a prefers-reduced-motion
 * - Soporte para diferentes tamaños
 */
export function RatingDisplay({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  showValue = false,
  showCount = false,
  reviewCount,
  onRatingChange,
  className = "",
  ariaLabel,
}: RatingDisplayProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  // Detectar prefers-reduced-motion
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Tamaños de estrellas
  const starSize = useMemo(() => {
    switch (size) {
      case "sm":
        return "w-3 h-3";
      case "md":
        return "w-4 h-4";
      case "lg":
        return "w-5 h-5";
      default:
        return "w-4 h-4";
    }
  }, [size]);

  // Calcular estrellas a mostrar
  const displayRating = hoveredRating ?? rating;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  // Manejar click en estrella
  const handleStarClick = useCallback(
    (starIndex: number) => {
      if (interactive && onRatingChange) {
        onRatingChange(starIndex + 1);
      }
    },
    [interactive, onRatingChange]
  );

  // Manejar teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, starIndex: number) => {
      if (!interactive) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleStarClick(starIndex);
      } else if (e.key === "ArrowRight" && starIndex < maxRating - 1) {
        e.preventDefault();
        const nextStar = document.querySelector(
          `[data-star-index="${starIndex + 1}"]`
        ) as HTMLElement;
        nextStar?.focus();
      } else if (e.key === "ArrowLeft" && starIndex > 0) {
        e.preventDefault();
        const prevStar = document.querySelector(
          `[data-star-index="${starIndex - 1}"]`
        ) as HTMLElement;
        prevStar?.focus();
      }
    },
    [interactive, maxRating, handleStarClick]
  );

  // Generar label para accesibilidad
  const accessibilityLabel =
    ariaLabel ||
    `Rating: ${rating.toFixed(1)} de ${maxRating} estrellas${
      reviewCount ? ` (${reviewCount} reseñas)` : ""
    }`;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        role={interactive ? "radiogroup" : "img"}
        aria-label={accessibilityLabel}
        aria-valuenow={rating}
        aria-valuemin={1}
        aria-valuemax={maxRating}
      >
        {/* Estrellas llenas */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <button
            key={`full-${index}`}
            type="button"
            data-star-index={index}
            onClick={() => handleStarClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onMouseEnter={() => interactive && setHoveredRating(index + 1)}
            onMouseLeave={() => interactive && setHoveredRating(null)}
            disabled={!interactive}
            className={`${starSize} ${
              interactive
                ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2 rounded"
                : "cursor-default"
            } transition-colors`}
            aria-label={`${index + 1} estrella${index + 1 > 1 ? "s" : ""}`}
            tabIndex={interactive ? 0 : -1}
          >
            <Star
              className={`${starSize} fill-amber-400 text-amber-400 ${
                interactive && hoveredRating !== null
                  ? "scale-110"
                  : shouldReduceMotion
                    ? ""
                    : "transition-transform"
              }`}
            />
          </button>
        ))}

        {/* Media estrella */}
        {hasHalfStar && (
          <div
            className={`${starSize} relative`}
            aria-hidden="true"
          >
            <Star
              className={`${starSize} text-gray-300 dark:text-gray-600`}
            />
            <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
              <Star
                className={`${starSize} fill-amber-400 text-amber-400`}
              />
            </div>
          </div>
        )}

        {/* Estrellas vacías */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <button
            key={`empty-${index}`}
            type="button"
            data-star-index={fullStars + (hasHalfStar ? 1 : 0) + index}
            onClick={() =>
              handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + index)
            }
            onKeyDown={(e) =>
              handleKeyDown(
                e,
                fullStars + (hasHalfStar ? 1 : 0) + index
              )
            }
            onMouseEnter={() =>
              interactive &&
              setHoveredRating(fullStars + (hasHalfStar ? 1 : 0) + index + 1)
            }
            onMouseLeave={() => interactive && setHoveredRating(null)}
            disabled={!interactive}
            className={`${starSize} ${
              interactive
                ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2 rounded"
                : "cursor-default"
            } transition-colors`}
            aria-label={`${fullStars + (hasHalfStar ? 1 : 0) + index + 1} estrella${fullStars + (hasHalfStar ? 1 : 0) + index + 1 > 1 ? "s" : ""}`}
            tabIndex={interactive ? 0 : -1}
          >
            <Star
              className={`${starSize} text-gray-300 dark:text-gray-600 ${
                interactive && hoveredRating !== null
                  ? "scale-110"
                  : shouldReduceMotion
                    ? ""
                    : "transition-transform"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Valor numérico */}
      {showValue && (
        <span className="text-sm font-semibold text-text ml-1">
          {rating.toFixed(1)}
        </span>
      )}

      {/* Contador de reviews */}
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-subtext ml-1">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}




