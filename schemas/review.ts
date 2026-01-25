import { z } from "zod";

/**
 * Review Schema - Sistema completo de reseñas de productos
 * Compatible con estándares de ecommerce modernos
 */

// Schema para imágenes de reseña
export const ReviewImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  alt: z.string().optional(),
});

export type ReviewImage = z.infer<typeof ReviewImageSchema>;

// Schema para respuesta del vendedor
export const VendorResponseSchema = z.object({
  id: z.string().min(1),
  message: z.string().min(1).max(2000),
  vendorName: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type VendorResponse = z.infer<typeof VendorResponseSchema>;

// Schema principal de Review
export const ReviewSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  userId: z.string().min(1).optional(), // Opcional para mock data
  userName: z.string().min(1).max(100),
  userEmail: z.string().email().optional(), // Solo para backend, no se expone
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10).max(2000),
  images: z.array(ReviewImageSchema).max(5).default([]),
  verified: z.boolean().default(false), // Verificado como comprador
  helpful: z.number().int().nonnegative().default(0), // Contador de "útil"
  helpfulUsers: z.array(z.string()).default([]), // IDs de usuarios que marcaron como útil
  vendorResponse: VendorResponseSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  // Campos adicionales para moderación (futuro)
  status: z.enum(["pending", "approved", "rejected"]).default("approved"),
  reported: z.boolean().default(false),
  reportedReason: z.string().optional(),
});

export type Review = z.infer<typeof ReviewSchema>;

// Schema para crear una nueva review (sin campos generados)
export const CreateReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10).max(2000),
  images: z.array(z.string().url()).max(5).default([]), // URLs de imágenes subidas
  userName: z.string().min(1).max(100),
  userEmail: z.string().email().optional(),
});

export type CreateReview = z.infer<typeof CreateReviewSchema>;

// Schema para estadísticas de reviews
export const ReviewStatsSchema = z.object({
  totalReviews: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  ratingDistribution: z.object({
    5: z.number().int().nonnegative(),
    4: z.number().int().nonnegative(),
    3: z.number().int().nonnegative(),
    2: z.number().int().nonnegative(),
    1: z.number().int().nonnegative(),
  }),
  verifiedCount: z.number().int().nonnegative(),
});

export type ReviewStats = z.infer<typeof ReviewStatsSchema>;

// Schema para filtros de reviews
export const ReviewFiltersSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  sort: z
    .enum([
      "newest",
      "oldest",
      "most_helpful",
      "highest_rating",
      "lowest_rating",
    ])
    .default("newest"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

export type ReviewFilters = z.infer<typeof ReviewFiltersSchema>;

// Schema para respuesta de API GET
export const ReviewsResponseSchema = z.object({
  reviews: z.array(ReviewSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  stats: ReviewStatsSchema,
});

export type ReviewsResponse = z.infer<typeof ReviewsResponseSchema>;




