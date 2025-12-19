import { create } from "zustand";
import type { Variant, Product } from "@schemas/ecommerce";
import type { Bundle } from "@schemas/ecommerce";

interface ProductPageState {
  // Estado de selección
  selectedOption: Variant | null;
  selectedBundle: Bundle | null;
  quantity: number;
  
  // Cálculos
  priceCalculated: number;
  shippingEligible: boolean;
  freeShippingThreshold: number;
  
  // Acciones
  setSelectedOption: (variant: Variant) => void;
  setSelectedBundle: (bundle: Bundle | null) => void;
  setQuantity: (quantity: number) => void;
  calculatePrice: (product: Product, variant?: Variant, bundle?: Bundle | null, qty?: number) => void;
  checkShippingEligibility: (subtotal: number) => void;
  reset: () => void;
}

const initialState = {
  selectedOption: null,
  selectedBundle: null,
  quantity: 1,
  priceCalculated: 0,
  shippingEligible: false,
  freeShippingThreshold: 50000,
};

export const useProductPageStore = create<ProductPageState>((set, get) => ({
  ...initialState,

  setSelectedOption: (variant: Variant) => {
    set({ selectedOption: variant });
    // Recalcular precio si hay producto en contexto
    const state = get();
    if (state.selectedBundle) {
      // Si hay bundle seleccionado, mantenerlo pero actualizar variant
      get().calculatePrice(
        {} as Product, // Se pasará desde el componente
        variant,
        state.selectedBundle,
        state.quantity
      );
    }
  },

  setSelectedBundle: (bundle: Bundle | null) => {
    set({ selectedBundle: bundle });
    // Si se selecciona un bundle, limpiar variant individual
    if (bundle) {
      set({ selectedOption: null });
    }
  },

  setQuantity: (quantity: number) => {
    if (quantity < 1) return;
    set({ quantity });
    // Recalcular precio
    const state = get();
    get().calculatePrice(
      {} as Product,
      state.selectedOption || undefined,
      state.selectedBundle,
      quantity
    );
  },

  calculatePrice: (product: Product, variant?: Variant, bundle?: Bundle | null, qty?: number) => {
    const state = get();
    const quantity = qty ?? state.quantity;
    let price = 0;

    if (bundle) {
      // Precio del bundle
      const bundlePrice = bundle.price ?? (product.price * bundle.quantity);
      price = bundlePrice * quantity;
    } else if (variant) {
      // Precio de la variante
      price = variant.price * quantity;
    } else if (product) {
      // Precio base del producto
      price = product.price * quantity;
    }

    set({ priceCalculated: price });
    
    // Verificar elegibilidad de envío gratis
    get().checkShippingEligibility(price);
  },

  checkShippingEligibility: (subtotal: number) => {
    const state = get();
    const eligible = subtotal >= state.freeShippingThreshold;
    set({ shippingEligible: eligible });
  },

  reset: () => {
    set(initialState);
  },
}));




