import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  CreateReviewSchema,
  ReviewFiltersSchema,
  ReviewsResponseSchema,
} from "@schemas/review";
import {
  getReviewsByProductId,
  getReviewStats,
  createReview,
} from "@workspace/data/reviews.mock";
import { createRateLimiter } from "@lib/rate-limit";
import { logger } from "@lib/logger";

// Rate limiter: 20 requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * GET /api/reviews
 * Obtener reviews de un producto con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting check
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const rateLimitResult = await rateLimiter.check(ip);

    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimitResult.retryAfter },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Window": "60",
          },
        }
      );
    }

    // Obtener query params
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const rating = searchParams.get("rating");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validar productId
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Validar y parsear filtros
    const filtersResult = ReviewFiltersSchema.safeParse({
      rating: rating ? parseInt(rating, 10) : undefined,
      sort,
      page,
      limit,
    });

    if (!filtersResult.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: filtersResult.error.flatten() },
        { status: 400 }
      );
    }

    const filters = filtersResult.data;

    // Obtener reviews
    const allReviews = getReviewsByProductId(productId, filters);
    const total = allReviews.length;

    // Paginación
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const reviews = allReviews.slice(startIndex, endIndex);

    // Obtener estadísticas
    const stats = getReviewStats(productId);

    // Construir respuesta
    const response = {
      reviews,
      total,
      page: filters.page,
      limit: filters.limit,
      stats,
    };

    // Validar respuesta con schema
    const validatedResponse = ReviewsResponseSchema.parse(response);

    // Log sin PII
    logger.log(`Reviews fetched for product ${productId}`, {
      total,
      page: filters.page,
      rating: filters.rating || "all",
      sort: filters.sort,
    });

    return NextResponse.json(validatedResponse, { status: 200 });
  } catch (error) {
    logger.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Crear nueva review
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const rateLimitResult = await rateLimiter.check(ip);

    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimitResult.retryAfter },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Window": "60",
          },
        }
      );
    }

    // Parsear y validar body
    const body = await request.json();
    const validationResult = CreateReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid review data",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const reviewData = validationResult.data;

    // Crear review
    const newReview = createReview(reviewData.productId, {
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images,
      userName: reviewData.userName,
      userEmail: reviewData.userEmail,
    });

    // Log sin PII
    logger.log(`Review created for product ${reviewData.productId}`, {
      rating: reviewData.rating,
      hasTitle: !!reviewData.title,
      hasImages: (reviewData.images?.length || 0) > 0,
    });

    return NextResponse.json({ review: newReview }, { status: 201 });
  } catch (error) {
    logger.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




