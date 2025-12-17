"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useReducedMotion } from "@hooks/useReducedMotion";
import { useProductPageStore } from "@stores/productPageStore";
import { useCartStore } from "@stores/cartStore";
import {
  notifyProductAddedToCart,
  notifyAddToCartError,
  notifyProductOutOfStock,
} from "@lib/ecommerce/toast";
import type { Product } from "@schemas/ecommerce";

interface ProductStickyCTAProps {
  product: Product;
  className?: string;
}

export function ProductStickyCTA({ product, className = "" }: ProductStickyCTAProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { selectedOption, selectedBundle, quantity, priceCalculated } = useProductPageStore();
  const addItem = useCartStore((state) => state.addItem);

  // Intersection Observer para detectar scroll (aparece después de 120px)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 120);
    };

    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, []);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = useCallback(() => {
    if (selectedBundle) {
      // Agregar bundle al carrito
      selectedBundle.products.forEach((productId) => {
        const variant = product.variants[0];
        try {
          addItem(product, variant, quantity);
        } catch (error) {
          notifyAddToCartError(product, "Error al agregar el bundle al carrito");
          return;
        }
      });
      notifyProductAddedToCart(product, quantity);
    } else if (selectedOption) {
      if (!selectedOption.available || selectedOption.inventory === 0) {
        notifyProductOutOfStock(product);
        return;
      }

      try {
        addItem(product, selectedOption, quantity);
        notifyProductAddedToCart(product, quantity);
      } catch (error) {
        notifyAddToCartError(product, "Error al agregar el producto al carrito");
      }
    } else {
      // Fallback a primera variante
      const variant = product.variants[0];
      if (variant.available && variant.inventory > 0) {
        try {
          addItem(product, variant, quantity);
          notifyProductAddedToCart(product, quantity);
        } catch (error) {
          notifyAddToCartError(product, "Error al agregar el producto al carrito");
        }
      }
    }
  }, [product, selectedOption, selectedBundle, quantity, addItem]);

  const displayPrice = priceCalculated > 0 ? priceCalculated : (selectedOption?.price || product.price);

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.div
          initial={{ y: prefersReducedMotion ? 0 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: prefersReducedMotion ? 0 : 100, opacity: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.2 }
              : {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }
          }
          className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden ${className}`}
          role="navigation"
          aria-label="Acciones rápidas para agregar al carrito"
        >
          <div
            className="bg-white dark:bg-gray-900 border-t border-border"
            style={{
              paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
            }}
          >
            <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Precio destacado */}
                <div className="flex items-center gap-2 bg-surface rounded-lg px-2 sm:px-3 py-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-text">
                    {formatPrice(displayPrice)}
                  </span>
                </div>

                {/* Botón de acción */}
                <motion.button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-action text-action-text font-semibold min-h-[44px] py-3 px-3 sm:px-4 rounded-lg hover:bg-action-hover transition-colors focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                  aria-label="Agregar producto al carrito"
                >
                  <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm">Agregar al carrito</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

