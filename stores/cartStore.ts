import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cart, CartItem, Product, Variant } from "@schemas/ecommerce";
import type { ShippingEstimate } from "@lib/ecommerce/shipping";
import { applyDiscount } from "@lib/ecommerce/discount";
import { calculateShipping } from "@lib/ecommerce/shipping";

interface CartStore {
  cart: Cart;
  isLoading: boolean;
  discountCode?: string;
  discountAmount: number;
  shippingEstimate?: ShippingEstimate;
  // Actions
  addItem: (product: Product, variant: Variant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  getSubtotal: () => number;
  applyDiscount: (code: string) => Promise<void>;
  removeDiscount: () => void;
  updateShippingEstimate: (postalCode?: string) => Promise<void>;
}

const calculateCartTotals = (
  items: CartItem[],
  discountAmount: number = 0,
  shippingCost: number = 0
): { subtotal: number; total: number } => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );
  const total = Math.max(0, subtotal - discountAmount + shippingCost);
  return { subtotal, total };
};

const createInitialCart = (): Cart => ({
  items: [],
  subtotal: 0,
  total: 0,
  currency: "CLP",
});

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: createInitialCart(),
      isLoading: false,
      discountCode: undefined,
      discountAmount: 0,
      shippingEstimate: undefined,

      addItem: (product: Product, variant: Variant, quantity = 1) => {
        set({ isLoading: true });
        const { cart } = get();

        // Verificar si el item ya existe en el carrito
        const existingItemIndex = cart.items.findIndex(
          (item) => item.variantId === variant.id && item.productId === product.id
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Actualizar cantidad del item existente
          newItems = cart.items.map((item, index) =>
            index === existingItemIndex
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                }
              : item
          );
        } else {
          // Agregar nuevo item
          const newItem: CartItem = {
            id: `cart-item-${Date.now()}-${variant.id}`,
            variantId: variant.id,
            productId: product.id,
            quantity,
            product,
            variant,
          };
          newItems = [...cart.items, newItem];
        }

        const { discountAmount, shippingEstimate } = get();
        const shippingCost = shippingEstimate?.cost || 0;
        const { subtotal, total } = calculateCartTotals(
          newItems,
          discountAmount,
          shippingCost
        );

        set({
          cart: {
            ...cart,
            items: newItems,
            subtotal,
            total,
            updatedAt: new Date().toISOString(),
          },
          isLoading: false,
        });
      },

      removeItem: (itemId: string) => {
        set({ isLoading: true });
        const { cart } = get();

        const newItems = cart.items.filter((item) => item.id !== itemId);
        const { discountAmount, shippingEstimate } = get();
        const shippingCost = shippingEstimate?.cost || 0;
        const { subtotal, total } = calculateCartTotals(
          newItems,
          discountAmount,
          shippingCost
        );

        set({
          cart: {
            ...cart,
            items: newItems,
            subtotal,
            total,
            updatedAt: new Date().toISOString(),
          },
          isLoading: false,
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set({ isLoading: true });
        const { cart } = get();

        const newItems = cart.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );

        const { discountAmount, shippingEstimate } = get();
        const shippingCost = shippingEstimate?.cost || 0;
        const { subtotal, total } = calculateCartTotals(
          newItems,
          discountAmount,
          shippingCost
        );

        set({
          cart: {
            ...cart,
            items: newItems,
            subtotal,
            total,
            updatedAt: new Date().toISOString(),
          },
          isLoading: false,
        });
      },

      clearCart: () => {
        set({
          cart: createInitialCart(),
          isLoading: false,
        });
      },

      getItemCount: () => {
        const { cart } = get();
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotal: () => {
        const { cart } = get();
        return cart.total;
      },

      getSubtotal: () => {
        const { cart } = get();
        return cart.subtotal;
      },

      applyDiscount: async (code: string) => {
        const { cart } = get();
        const result = applyDiscount(code, cart);

        if (!result.success) {
          throw new Error(result.error || "Código de descuento inválido");
        }

        const { discountAmount, shippingEstimate } = get();
        const shippingCost = shippingEstimate?.cost || 0;
        const { subtotal, total } = calculateCartTotals(
          cart.items,
          result.discountAmount,
          shippingCost
        );

        set({
          discountCode: code.toUpperCase().trim(),
          discountAmount: result.discountAmount,
          cart: {
            ...cart,
            subtotal,
            total,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      removeDiscount: () => {
        const { cart, shippingEstimate } = get();
        const shippingCost = shippingEstimate?.cost || 0;
        const { subtotal, total } = calculateCartTotals(
          cart.items,
          0,
          shippingCost
        );

        set({
          discountCode: undefined,
          discountAmount: 0,
          cart: {
            ...cart,
            subtotal,
            total,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateShippingEstimate: async (postalCode?: string) => {
        const { cart } = get();
        const estimate = calculateShipping(cart, postalCode);

        const { discountAmount } = get();
        const { subtotal, total } = calculateCartTotals(
          cart.items,
          discountAmount,
          estimate.cost
        );

        set({
          shippingEstimate: estimate,
          cart: {
            ...cart,
            shipping: estimate.cost,
            subtotal,
            total,
            updatedAt: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: "elkisecom-cart", // localStorage key
      partialize: (state) => ({
        cart: state.cart,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
      }), // Persistir carrito y descuentos
    }
  )
);

