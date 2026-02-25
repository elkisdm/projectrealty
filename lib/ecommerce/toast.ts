import { toast } from "sonner";
import type { Product, CartItem } from "@schemas/ecommerce";
import type { ShippingEstimate } from "@lib/ecommerce/shipping";

/**
 * Helpers tipados para notificaciones del ecommerce
 * 
 * Proporciona funciones específicas para diferentes tipos de notificaciones
 * con mensajes predefinidos y acciones comunes.
 */

/**
 * Notificar que un producto fue agregado al carrito
 */
export function notifyProductAddedToCart(
  product: Product,
  quantity: number = 1
): void {
  toast.success("Producto agregado", {
    description: `${quantity}x ${product.title} agregado al carrito`,
    duration: 3000,
    action: {
      label: "Ver carrito",
      onClick: () => {
        // Abrir carrito drawer
        const event = new CustomEvent("open-cart");
        window.dispatchEvent(event);
      },
    },
  });
}

/**
 * Notificar que un producto fue agregado a favoritos
 */
export function notifyProductAddedToWishlist(product: Product): void {
  toast.success("Agregado a favoritos", {
    description: `${product.title} se agregó a tu lista de favoritos`,
    duration: 3000,
  });
}

/**
 * Notificar que un producto fue removido de favoritos
 */
export function notifyProductRemovedFromWishlist(product: Product): void {
  toast.info("Removido de favoritos", {
    description: `${product.title} se removió de tu lista de favoritos`,
    duration: 2000,
  });
}

/**
 * Notificar error al agregar producto al carrito
 */
export function notifyAddToCartError(
  product: Product,
  reason?: string
): void {
  toast.error("Error al agregar producto", {
    description: reason || `No se pudo agregar ${product.title} al carrito`,
    duration: 4000,
  });
}

/**
 * Notificar que el producto está agotado
 */
export function notifyProductOutOfStock(product: Product): void {
  toast.warning("Producto agotado", {
    description: `${product.title} no está disponible en este momento`,
    duration: 4000,
    action: {
      label: "Notificarme",
      onClick: () => {
        // Abrir formulario de notificación de stock
        const event = new CustomEvent("open-stock-alert", {
          detail: { productId: product.id },
        });
        window.dispatchEvent(event);
      },
    },
  });
}

/**
 * Notificar stock bajo
 */
export function notifyLowStock(product: Product, remaining: number): void {
  toast.warning("Stock bajo", {
    description: `Solo quedan ${remaining} unidades de ${product.title}`,
    duration: 5000,
  });
}

/**
 * Notificar que se aplicó un código de descuento
 */
export function notifyDiscountApplied(
  code: string,
  discount: number | string
): void {
  toast.success("Descuento aplicado", {
    description: `Código ${code} aplicado. Descuento: ${discount}`,
    duration: 3000,
  });
}

/**
 * Notificar que se aplicó un descuento (con monto)
 */
export function notifyDiscountAppliedAmount(amount: number): void {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  toast.success("Descuento aplicado", {
    description: `Se aplicó un descuento de ${formatPrice(amount)}`,
    duration: 3000,
  });
}

/**
 * Notificar error en código de descuento
 */
export function notifyDiscountError(reason: string): void {
  toast.error("Código inválido", {
    description: reason,
    duration: 4000,
  });
}

/**
 * Notificar que el carrito fue actualizado
 */
export function notifyCartUpdated(itemCount: number): void {
  toast.info("Carrito actualizado", {
    description: `Tu carrito ahora tiene ${itemCount} ${itemCount === 1 ? "producto" : "productos"}`,
    duration: 2000,
  });
}

/**
 * Notificar que el carrito fue vaciado
 */
export function notifyCartCleared(): void {
  toast.info("Carrito vaciado", {
    description: "Todos los productos fueron removidos del carrito",
    duration: 2000,
  });
}

/**
 * Notificar inicio de checkout
 */
export function notifyCheckoutStarted(): void {
  toast.loading("Procesando checkout...", {
    description: "Redirigiendo a la página de pago",
    duration: 2000,
  });
}

/**
 * Notificar error en checkout
 */
export function notifyCheckoutError(reason?: string): void {
  toast.error("Error en checkout", {
    description: reason || "No se pudo procesar el checkout. Intenta nuevamente.",
    duration: 5000,
  });
}

/**
 * Notificar suscripción a alerta de stock
 */
export function notifyStockAlertSubscribed(product: Product): void {
  toast.success("Alerta configurada", {
    description: `Te notificaremos cuando ${product.title} esté disponible`,
    duration: 3000,
  });
}

/**
 * Notificar error al suscribirse a alerta de stock
 */
export function notifyStockAlertError(reason?: string): void {
  toast.error("Error al configurar alerta", {
    description: reason || "No se pudo configurar la alerta. Intenta nuevamente.",
    duration: 4000,
  });
}

/**
 * Notificación genérica de éxito
 */
export function notifySuccess(title: string, description?: string): void {
  toast.success(title, {
    description,
    duration: 3000,
  });
}

/**
 * Notificación genérica de error
 */
export function notifyError(title: string, description?: string): void {
  toast.error(title, {
    description,
    duration: 4000,
  });
}

/**
 * Notificación genérica de información
 */
export function notifyInfo(title: string, description?: string): void {
  toast.info(title, {
    description,
    duration: 3000,
  });
}

/**
 * Notificación genérica de advertencia
 */
export function notifyWarning(title: string, description?: string): void {
  toast.warning(title, {
    description,
    duration: 4000,
  });
}

/**
 * Notificación de carga (loading)
 */
export function notifyLoading(title: string, description?: string): string | number {
  return toast.loading(title, {
    description,
  });
}

/**
 * Actualizar notificación de carga
 */
export function updateLoadingToast(
  toastId: string | number,
  title: string,
  description?: string,
  type: "success" | "error" | "info" = "success"
): void {
  toast.dismiss(toastId);
  if (type === "success") {
    toast.success(title, { description });
  } else if (type === "error") {
    toast.error(title, { description });
  } else {
    toast.info(title, { description });
  }
}

/**
 * Notificar que un item fue agregado al carrito (con detalles)
 */
export function notifyItemAdded(item: CartItem): void {
  toast.success("Producto agregado", {
    description: `${item.quantity}x ${item.product.title} agregado al carrito`,
    duration: 3000,
    action: {
      label: "Ver carrito",
      onClick: () => {
        const event = new CustomEvent("open-cart");
        window.dispatchEvent(event);
      },
    },
  });
}

/**
 * Notificar que un item fue removido del carrito
 */
export function notifyItemRemoved(item: CartItem): void {
  toast.info("Producto removido", {
    description: `${item.product.title} fue removido del carrito`,
    duration: 2000,
  });
}

/**
 * Notificar que la estimación de envío fue actualizada
 */
export function notifyShippingUpdated(estimate: ShippingEstimate): void {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (estimate.cost === 0) {
    toast.success("Envío gratis", {
      description: `Tu pedido será entregado en ${estimate.time}`,
      duration: 3000,
    });
  } else {
    toast.info("Envío calculado", {
      description: `${formatPrice(estimate.cost)} - ${estimate.time}`,
      duration: 3000,
    });
  }
}

