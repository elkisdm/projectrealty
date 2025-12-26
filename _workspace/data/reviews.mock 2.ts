import type { Review, ReviewStats, ReviewFilters } from "@schemas/review";

/**
 * Mock Reviews Data
 * Datos de ejemplo para desarrollo y testing
 * En producción, esto se reemplazaría con datos de Supabase
 */

// Helper para generar fecha relativa
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Nombres de usuarios para mock data
const mockUserNames = [
  "Carlos M.",
  "María González",
  "Juan Pérez",
  "Ana Silva",
  "Roberto Torres",
  "Laura Martínez",
  "Diego Ramírez",
  "Sofía López",
  "Miguel Ángel",
  "Valentina R.",
  "Andrés C.",
  "Camila F.",
  "Fernando S.",
  "Isabella M.",
  "Sebastián P.",
];

// Comentarios de ejemplo para diferentes ratings
const sampleComments = {
  5: [
    "Excelente producto, superó mis expectativas. La calidad es increíble y el sabor es delicioso.",
    "Muy recomendado. Noté resultados desde la primera semana. El envío fue rápido y el empaque perfecto.",
    "Perfecto para mis objetivos. La textura es suave y se disuelve fácilmente. Definitivamente compraré de nuevo.",
    "Increíble relación calidad-precio. Los resultados son visibles y el producto es de primera calidad.",
    "Me encantó este producto. El sabor es natural y no tiene ese sabor artificial de otros productos.",
  ],
  4: [
    "Buen producto en general. Cumple con lo esperado, aunque el sabor podría ser mejor.",
    "Satisfecho con la compra. Funciona bien, solo esperaba un poco más de sabor.",
    "Producto de calidad. Los resultados son buenos, aunque el precio es un poco alto.",
    "Recomendable. Hace su trabajo, aunque el empaque podría ser más resistente.",
    "Buen producto. Noté mejoras, aunque esperaba resultados más rápidos.",
  ],
  3: [
    "Producto regular. No es malo pero tampoco destacable. Cumple su función básica.",
    "Esperaba más. El producto funciona pero no noté grandes diferencias.",
    "Aceptable. No está mal pero hay mejores opciones en el mercado.",
    "Regular. Hace lo que promete pero sin nada especial.",
    "Producto promedio. Funciona pero no es nada del otro mundo.",
  ],
  2: [
    "No cumplió mis expectativas. El sabor no es bueno y los resultados son mínimos.",
    "Discreto. No recomendaría este producto, hay mejores alternativas.",
    "No me gustó mucho. El producto tiene un sabor artificial muy fuerte.",
    "Esperaba más calidad. El producto no justifica su precio.",
    "No lo recomiendo. Los resultados no son los esperados.",
  ],
  1: [
    "Muy decepcionado. El producto no funciona como se promete y el sabor es terrible.",
    "No recomiendo. Calidad muy baja y resultados nulos.",
    "Pésimo producto. No volveré a comprar.",
    "Muy malo. El sabor es horrible y no noté ningún beneficio.",
    "Decepcionante. No cumple con lo prometido.",
  ],
};

// Generar reviews mock para un producto
const generateReviewsForProduct = (
  productId: string,
  count: number,
  baseRating: number = 4.5
): Review[] => {
  const reviews: Review[] = [];
  const ratings = [5, 5, 4, 5, 4, 3, 5, 4, 5, 4, 3, 2, 5, 4, 5]; // Distribución realista

  for (let i = 0; i < count; i++) {
    const rating = ratings[i % ratings.length] || Math.floor(baseRating);
    const userName = mockUserNames[i % mockUserNames.length];
    const daysAgo = Math.floor(Math.random() * 180); // Últimos 6 meses
    const hasImages = Math.random() > 0.7; // 30% tienen imágenes
    const isVerified = Math.random() > 0.4; // 60% verificados
    const helpfulCount = Math.floor(Math.random() * 50);

    const review: Review = {
      id: `review-${productId}-${i + 1}`,
      productId,
      userId: `user-${i + 1}`,
      userName,
      rating,
      title:
        rating >= 4
          ? `Excelente producto${i % 2 === 0 ? " - Muy recomendado" : ""}`
          : rating === 3
            ? "Producto regular"
            : "No cumplió expectativas",
      comment:
        sampleComments[rating as keyof typeof sampleComments][
          i % sampleComments[rating as keyof typeof sampleComments].length
        ],
      images: hasImages
        ? [
            {
              id: `img-${i}-1`,
              url: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&sig=${i}`,
              thumbnailUrl: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&sig=${i}`,
              alt: `Imagen de reseña ${i + 1}`,
            },
          ]
        : [],
      verified: isVerified,
      helpful: helpfulCount,
      helpfulUsers: [],
      createdAt: getDateString(daysAgo),
      updatedAt: daysAgo < 30 ? getDateString(daysAgo - 1) : undefined,
      status: "approved",
      reported: false,
    };

    reviews.push(review);
  }

  return reviews;
};

// Reviews mock para todos los productos
export const mockReviews: Review[] = [
  // Reviews para prod-1 (Whey Protein Vanilla)
  ...generateReviewsForProduct("prod-1", 45, 4.8),
  // Reviews para prod-2 (Whey Protein Chocolate)
  ...generateReviewsForProduct("prod-2", 38, 4.9),
  // Reviews para prod-3 (Casein Protein)
  ...generateReviewsForProduct("prod-3", 32, 4.7),
  // Reviews para otros productos
  ...generateReviewsForProduct("prod-4", 28, 4.6),
  ...generateReviewsForProduct("prod-5", 25, 4.5),
  ...generateReviewsForProduct("prod-6", 22, 4.4),
  ...generateReviewsForProduct("prod-7", 20, 4.7),
  ...generateReviewsForProduct("prod-8", 18, 4.6),
  ...generateReviewsForProduct("prod-9", 15, 4.5),
  ...generateReviewsForProduct("prod-10", 12, 4.3),
];

// Helper: Obtener reviews por productId
export function getReviewsByProductId(
  productId: string,
  filters?: ReviewFilters
): Review[] {
  let reviews = mockReviews.filter((r) => r.productId === productId);

  // Filtrar por rating si se especifica
  if (filters?.rating) {
    reviews = reviews.filter((r) => r.rating === filters.rating);
  }

  // Ordenar
  const sort = filters?.sort || "newest";
  switch (sort) {
    case "newest":
      reviews.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "oldest":
      reviews.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case "most_helpful":
      reviews.sort((a, b) => b.helpful - a.helpful);
      break;
    case "highest_rating":
      reviews.sort((a, b) => b.rating - a.rating);
      break;
    case "lowest_rating":
      reviews.sort((a, b) => a.rating - b.rating);
      break;
  }

  return reviews;
}

// Helper: Calcular estadísticas de reviews
export function getReviewStats(productId: string): ReviewStats {
  const reviews = mockReviews.filter((r) => r.productId === productId);

  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
      verifiedCount: 0,
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  const distribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const verifiedCount = reviews.filter((r) => r.verified).length;

  return {
    totalReviews: reviews.length,
    averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
    ratingDistribution: distribution,
    verifiedCount,
  };
}

// Helper: Crear nueva review
export function createReview(
  productId: string,
  data: {
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    userName: string;
    userEmail?: string;
  }
): Review {
  const newReview: Review = {
    id: `review-${productId}-${Date.now()}`,
    productId,
    userId: `user-${Date.now()}`,
    userName: data.userName,
    userEmail: data.userEmail,
    rating: data.rating,
    title: data.title,
    comment: data.comment,
    images: (data.images || []).map((url, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url,
      alt: `Imagen de reseña ${idx + 1}`,
    })),
    verified: false,
    helpful: 0,
    helpfulUsers: [],
    createdAt: new Date().toISOString(),
    status: "approved",
    reported: false,
  };

  // Agregar a mockReviews (en producción esto iría a la base de datos)
  mockReviews.push(newReview);

  return newReview;
}

// Helper: Obtener todas las reviews (para debugging)
export function getAllReviews(): Review[] {
  return mockReviews;
}




