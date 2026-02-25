import type { Cart } from "@schemas/ecommerce";

/**
 * Tipo de descuento
 */
export type DiscountType = "percentage" | "fixed" | "free_shipping";

/**
 * Código de descuento
 */
export interface DiscountCode {
  code: string;
  type: DiscountType;
  value: number; // Porcentaje (0-100) o monto fijo en CLP
  minPurchase?: number; // Compra mínima requerida
  maxDiscount?: number; // Descuento máximo (para porcentajes)
  validUntil?: string; // Fecha de expiración ISO
  description?: string;
}

/**
 * Resultado de aplicar descuento
 */
export interface DiscountResult {
  success: boolean;
  discountAmount: number;
  discountCode?: DiscountCode;
  error?: string;
}

/**
 * Códigos de descuento mock
 * 
 * En producción, esto se reemplazará con una llamada a API:
 * 
 * ```typescript
 * export async function validateDiscountCode(
 *   code: string,
 *   cart: Cart
 * ): Promise<DiscountResult> {
 *   if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
 *     return validateDiscountCodeMock(code, cart);
 *   }
 * 
 *   const response = await fetch("/api/discounts/validate", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ code, cartId: cart.id, subtotal: cart.subtotal }),
 *   });
 * 
 *   if (!response.ok) {
 *     const error = await response.json();
 *     return {
 *       success: false,
 *       discountAmount: 0,
 *       error: error.message || "Código inválido",
 *     };
 *   }
 * 
 *   const data = await response.json();
 *   return {
 *     success: true,
 *     discountAmount: data.discountAmount,
 *     discountCode: data.discountCode,
 *   };
 * }
 * ```
 */
const MOCK_DISCOUNT_CODES: DiscountCode[] = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    description: "10% de descuento en tu primera compra",
  },
  {
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    description: "Envío gratis en tu compra",
  },
  {
    code: "SAVE20",
    type: "percentage",
    value: 20,
    minPurchase: 30000,
    maxDiscount: 10000,
    description: "20% de descuento (máx. $10.000) en compras sobre $30.000",
  },
  {
    code: "FIXED5000",
    type: "fixed",
    value: 5000,
    minPurchase: 20000,
    description: "$5.000 de descuento en compras sobre $20.000",
  },
];

/**
 * Validar y aplicar código de descuento (mock)
 */
export function validateDiscountCode(
  code: string,
  cart: Cart
): DiscountResult {
  const normalizedCode = code.toUpperCase().trim();
  const discountCode = MOCK_DISCOUNT_CODES.find(
    (dc) => dc.code === normalizedCode
  );

  if (!discountCode) {
    return {
      success: false,
      discountAmount: 0,
      error: "Código de descuento no válido",
    };
  }

  // Verificar compra mínima
  if (discountCode.minPurchase && cart.subtotal < discountCode.minPurchase) {
    return {
      success: false,
      discountAmount: 0,
      error: `Compra mínima de ${formatPrice(discountCode.minPurchase)} requerida`,
    };
  }

  // Verificar expiración
  if (discountCode.validUntil) {
    const expiryDate = new Date(discountCode.validUntil);
    if (new Date() > expiryDate) {
      return {
        success: false,
        discountAmount: 0,
        error: "Este código de descuento ha expirado",
      };
    }
  }

  // Calcular descuento
  let discountAmount = 0;

  switch (discountCode.type) {
    case "percentage":
      discountAmount = Math.round((cart.subtotal * discountCode.value) / 100);
      // Aplicar descuento máximo si existe
      if (discountCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, discountCode.maxDiscount);
      }
      break;

    case "fixed":
      discountAmount = discountCode.value;
      break;

    case "free_shipping":
      // Este tipo se maneja en el cálculo de shipping
      discountAmount = 0;
      break;

    default:
      return {
        success: false,
        discountAmount: 0,
        error: "Tipo de descuento no válido",
      };
  }

  // No permitir descuento mayor al subtotal
  discountAmount = Math.min(discountAmount, cart.subtotal);

  return {
    success: true,
    discountAmount,
    discountCode,
  };
}

/**
 * Aplicar descuento al carrito
 */
export function applyDiscount(
  code: string,
  cart: Cart
): DiscountResult {
  return validateDiscountCode(code, cart);
}

/**
 * Formatear precio (helper)
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}




