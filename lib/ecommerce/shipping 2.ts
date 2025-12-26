import type { Cart, CartItem } from "@schemas/ecommerce";

/**
 * Estimación de envío
 */
export interface ShippingEstimate {
  cost: number;
  time: string; // Ej: "3-5 días hábiles"
  method: string; // Ej: "Estándar", "Express"
  estimatedDays: number; // Días estimados
}

/**
 * Configuración de envío (mock)
 */
const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 50000, // CLP - Envío gratis sobre $50k
  BASE_SHIPPING_COST: 5000, // CLP - Costo base de envío
  WEIGHT_COST_PER_KG: 1000, // CLP por kg adicional
  STANDARD_DAYS: "3-5 días hábiles",
  EXPRESS_DAYS: "1-2 días hábiles",
  EXPRESS_COST_MULTIPLIER: 2, // Express cuesta el doble
};

/**
 * Calcular peso total del carrito
 */
function calculateTotalWeight(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const weight = item.variant.weight || 0.5; // Default 0.5kg si no tiene peso
    const weightInKg =
      item.variant.weightUnit === "g"
        ? weight / 1000
        : item.variant.weightUnit === "lb"
        ? weight * 0.453592
        : item.variant.weightUnit === "oz"
        ? weight * 0.0283495
        : weight; // kg por defecto
    return total + weightInKg * item.quantity;
  }, 0);
}

/**
 * Calcular costo de envío (mock)
 * 
 * En producción, esto se reemplazará con una llamada a API:
 * 
 * ```typescript
 * export async function calculateShipping(
 *   cart: Cart,
 *   postalCode?: string
 * ): Promise<ShippingEstimate> {
 *   if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
 *     return calculateShippingMock(cart);
 *   }
 * 
 *   const response = await fetch("/api/shipping/calculate", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({
 *       items: cart.items,
 *       postalCode,
 *       subtotal: cart.subtotal,
 *     }),
 *   });
 * 
 *   if (!response.ok) {
 *     throw new Error("Error al calcular envío");
 *   }
 * 
 *   return response.json();
 * }
 * ```
 */
export function calculateShipping(
  cart: Cart,
  postalCode?: string,
  method: "standard" | "express" = "standard"
): ShippingEstimate {
  // Envío gratis si el subtotal supera el umbral
  if (cart.subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return {
      cost: 0,
      time: method === "express" ? SHIPPING_CONFIG.EXPRESS_DAYS : SHIPPING_CONFIG.STANDARD_DAYS,
      method: method === "express" ? "Express" : "Estándar",
      estimatedDays: method === "express" ? 2 : 4,
    };
  }

  // Calcular costo base
  const totalWeight = calculateTotalWeight(cart.items);
  const weightCost = Math.max(0, (totalWeight - 1) * SHIPPING_CONFIG.WEIGHT_COST_PER_KG); // Primer kg incluido
  const baseCost = SHIPPING_CONFIG.BASE_SHIPPING_COST + weightCost;

  // Aplicar multiplicador para express
  const finalCost =
    method === "express"
      ? Math.round(baseCost * SHIPPING_CONFIG.EXPRESS_COST_MULTIPLIER)
      : baseCost;

  return {
    cost: finalCost,
    time: method === "express" ? SHIPPING_CONFIG.EXPRESS_DAYS : SHIPPING_CONFIG.STANDARD_DAYS,
    method: method === "express" ? "Express" : "Estándar",
    estimatedDays: method === "express" ? 2 : 4,
  };
}

/**
 * Estimar tiempo de envío basado en código postal (mock)
 * 
 * En producción, esto consultaría una API de envíos:
 * 
 * ```typescript
 * export async function estimateShippingTime(
 *   postalCode: string
 * ): Promise<{ minDays: number; maxDays: number }> {
 *   const response = await fetch(`/api/shipping/time?postalCode=${postalCode}`);
 *   if (!response.ok) {
 *     throw new Error("Error al estimar tiempo de envío");
 *   }
 *   return response.json();
 * }
 * ```
 */
export function estimateShippingTime(
  postalCode?: string
): { minDays: number; maxDays: number; description: string } {
  // Mock: diferentes zonas según código postal
  if (!postalCode) {
    return {
      minDays: 3,
      maxDays: 5,
      description: SHIPPING_CONFIG.STANDARD_DAYS,
    };
  }

  // Zona 1: Región Metropolitana (códigos que empiezan con 7, 8, 9)
  const firstDigit = postalCode.charAt(0);
  if (["7", "8", "9"].includes(firstDigit)) {
    return {
      minDays: 1,
      maxDays: 3,
      description: "1-3 días hábiles",
    };
  }

  // Zona 2: Regiones (códigos que empiezan con 1-6)
  if (["1", "2", "3", "4", "5", "6"].includes(firstDigit)) {
    return {
      minDays: 3,
      maxDays: 5,
      description: SHIPPING_CONFIG.STANDARD_DAYS,
    };
  }

  // Default
  return {
    minDays: 3,
    maxDays: 5,
    description: SHIPPING_CONFIG.STANDARD_DAYS,
  };
}

/**
 * Obtener todas las opciones de envío disponibles
 */
export function getShippingOptions(cart: Cart): ShippingEstimate[] {
  return [
    calculateShipping(cart, undefined, "standard"),
    calculateShipping(cart, undefined, "express"),
  ];
}




