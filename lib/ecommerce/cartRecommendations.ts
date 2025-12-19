import type { Cart, Product } from "@schemas/ecommerce";
// import { getAllProducts } from "@workspace/data/ecommerce.mock"; // Deshabilitado - no es parte del MVP

/**
 * Obtener productos recomendados basados en el carrito
 * 
 * Estrategias de recomendación:
 * 1. Basado en categorías de productos en el carrito
 * 2. Basado en tags similares
 * 3. Productos frecuentemente comprados juntos (mock)
 */
export function getCartRecommendations(
  cart: Cart,
  limit: number = 3
): Product[] {
  if (cart.items.length === 0) {
    return [];
  }

  const allProducts: Product[] = []; // Deshabilitado - no es parte del MVP
  
  // Obtener categorías y tags del carrito
  const cartCategories = new Set<string>();
  const cartTags = new Set<string>();
  const cartProductIds = new Set<string>();

  cart.items.forEach((item) => {
    cartCategories.add(item.product.category);
    cartProductIds.add(item.product.id);
    if (item.product.tags) {
      item.product.tags.forEach((tag) => cartTags.add(tag));
    }
  });

  // Filtrar productos que no están en el carrito
  const availableProducts = allProducts.filter(
    (product) => !cartProductIds.has(product.id) && product.available
  );

  // Calcular score de recomendación para cada producto
  const scoredProducts = availableProducts.map((product) => {
    let score = 0;

    // Misma categoría (peso alto)
    if (cartCategories.has(product.category)) {
      score += 10;
    }

    // Tags similares (peso medio)
    if (product.tags) {
      const commonTags = product.tags.filter((tag) => cartTags.has(tag));
      score += commonTags.length * 3;
    }

    // Productos frecuentemente comprados juntos (mock)
    // En producción, esto vendría de analytics/ML
    const frequentlyBoughtTogether = getFrequentlyBoughtTogether(
      cart.items.map((item) => item.product.id)
    );
    if (frequentlyBoughtTogether.includes(product.id)) {
      score += 15;
    }

    // Precio similar (peso bajo)
    const avgCartPrice = cart.subtotal / cart.items.length;
    const priceDiff = Math.abs(product.price - avgCartPrice);
    const priceSimilarity = Math.max(0, 100 - (priceDiff / avgCartPrice) * 100);
    score += priceSimilarity * 0.1;

    return { product, score };
  });

  // Ordenar por score y tomar los mejores
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

/**
 * Obtener productos frecuentemente comprados juntos (mock)
 * 
 * En producción, esto vendría de:
 * - Analytics de compras previas
 * - Machine Learning basado en comportamiento
 * - Reglas de negocio (ej: "si compras X, también compran Y")
 * 
 * ```typescript
 * export async function getFrequentlyBoughtTogether(
 *   productIds: string[]
 * ): Promise<string[]> {
 *   const response = await fetch("/api/recommendations/frequently-bought-together", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ productIds }),
 *   });
 *   return response.json();
 * }
 * ```
 */
function getFrequentlyBoughtTogether(productIds: string[]): string[] {
  // Mock: reglas simples basadas en categorías
  // En producción, esto sería mucho más sofisticado
  
  const recommendations: string[] = [];
  const allProducts: Product[] = []; // Deshabilitado - no es parte del MVP

  // Si hay productos de suplementos, recomendar otros suplementos
  const hasSupplements = productIds.some((id) => {
    const product = allProducts.find((p) => p.id === id);
    return product?.category === "supplements";
  });

  if (hasSupplements) {
    const supplementProducts = allProducts
      .filter((p) => p.category === "supplements" && !productIds.includes(p.id))
      .slice(0, 2)
      .map((p) => p.id);
    recommendations.push(...supplementProducts);
  }

  // Si hay productos de proteína, recomendar otros sabores
  const hasProtein = productIds.some((id) => {
    const product = allProducts.find((p) => p.id === id);
    return product?.tags?.includes("proteína");
  });

  if (hasProtein) {
    const proteinProducts = allProducts
      .filter(
        (p) =>
          p.tags?.includes("proteína") &&
          !productIds.includes(p.id) &&
          !recommendations.includes(p.id)
      )
      .slice(0, 1)
      .map((p) => p.id);
    recommendations.push(...proteinProducts);
  }

  return recommendations;
}

/**
 * Obtener productos relacionados a un producto específico
 */
export function getRelatedProducts(
  product: Product,
  limit: number = 4
): Product[] {
  const allProducts: Product[] = []; // Deshabilitado - no es parte del MVP

  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        p.available &&
        (p.category === product.category ||
          p.tags?.some((tag) => product.tags?.includes(tag)))
    )
    .slice(0, limit);

  return relatedProducts;
}


