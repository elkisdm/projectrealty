"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Filter, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Review, ReviewStats, ReviewFilters } from "@schemas/review";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { RatingDisplay } from "./RatingDisplay";
import { notifyError } from "@lib/ecommerce/toast";

interface ProductReviewsProps {
  productId: string;
  productName: string;
  className?: string;
}

/**
 * ProductReviews - Componente principal de reseñas
 * 
 * Características:
 * - Estadísticas de reviews (promedio, distribución)
 * - Filtros por rating
 * - Ordenamiento
 * - Paginación
 * - Formulario de reseña
 */
export function ProductReviews({
  productId,
  productName,
  className = "",
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReviewFilters>({
    sort: "newest",
    page: 1,
    limit: 10,
  });
  const [selectedRating, setSelectedRating] = useState<number | undefined>(
    undefined
  );
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Cargar reviews
  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        productId,
        sort: filters.sort,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      if (selectedRating) {
        params.append("rating", selectedRating.toString());
      }

      const response = await fetch(`/api/reviews?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (error) {
      notifyError("Error", "No se pudieron cargar las reseñas");
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, filters, selectedRating]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Manejar cambio de filtro de rating
  const handleRatingFilter = (rating: number | undefined) => {
    setSelectedRating(rating);
    setFilters((prev) => ({ ...prev, page: 1 })); // Reset a página 1
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (sort: ReviewFilters["sort"]) => {
    setFilters((prev) => ({ ...prev, sort, page: 1 }));
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Manejar creación de review
  const handleReviewSubmit = async (data: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    userName: string;
  }) => {
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create review");
      }

      // Recargar reviews
      await loadReviews();
      setShowReviewForm(false);
    } catch (error) {
      throw error; // El ReviewForm maneja el error
    }
  };

  // Calcular total de páginas
  const totalPages = stats
    ? Math.ceil(
        (selectedRating
          ? stats.ratingDistribution[
              selectedRating as keyof typeof stats.ratingDistribution
            ]
          : stats.totalReviews) / filters.limit
      )
    : 0;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Estadísticas y Filtros */}
      {stats && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          {/* Rating promedio y total */}
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-text">
                  {stats.averageRating.toFixed(1)}
                </span>
                <RatingDisplay
                  rating={stats.averageRating}
                  size="lg"
                  showValue={false}
                />
              </div>
              <p className="text-subtext mt-2">
                Basado en {stats.totalReviews} reseña
                {stats.totalReviews !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Distribución de ratings */}
            <div className="flex-1 min-w-[200px] space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  stats.ratingDistribution[
                    rating as keyof typeof stats.ratingDistribution
                  ];
                const percentage =
                  stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleRatingFilter(
                          selectedRating === rating ? undefined : rating
                        )
                      }
                      className={`text-sm font-semibold w-8 text-left ${
                        selectedRating === rating
                          ? "text-[#8B6CFF]"
                          : "text-subtext hover:text-text"
                      } transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] rounded`}
                    >
                      {rating}★
                    </button>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selectedRating === rating
                            ? "bg-[#8B6CFF]"
                            : "bg-amber-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-subtext w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filtros y ordenamiento */}
          <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-subtext" />
              <span className="text-sm font-semibold text-text">Filtrar:</span>
              <button
                onClick={() => handleRatingFilter(undefined)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedRating === undefined
                    ? "bg-[#8B6CFF] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-subtext hover:text-text"
                } focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]`}
              >
                Todas
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingFilter(rating)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedRating === rating
                      ? "bg-[#8B6CFF] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-subtext hover:text-text"
                  } focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]`}
                >
                  {rating}★
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-subtext">Ordenar por:</span>
              <select
                value={filters.sort}
                onChange={(e) =>
                  handleSortChange(e.target.value as ReviewFilters["sort"])
                }
                className="px-3 py-1 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
              >
                <option value="newest">Más reciente</option>
                <option value="oldest">Más antiguo</option>
                <option value="most_helpful">Más útil</option>
                <option value="highest_rating">Mayor rating</option>
                <option value="lowest_rating">Menor rating</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de reseña */}
      <ReviewForm
        productId={productId}
        productName={productName}
        onSubmit={handleReviewSubmit}
        onCancel={() => setShowReviewForm(false)}
      />

      {/* Lista de reviews */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B6CFF]" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <p className="text-subtext">
              {selectedRating
                ? `No hay reseñas con ${selectedRating} estrellas`
                : "Aún no hay reseñas para este producto"}
            </p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
                  aria-label="Página anterior"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-subtext">
                  Página {filters.page} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
                  aria-label="Página siguiente"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}




