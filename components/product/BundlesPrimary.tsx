"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Sparkles, Check } from "lucide-react";
import type { Product, Bundle } from "@schemas/ecommerce";
import { useProductPageStore } from "@stores/productPageStore";
import { useCartStore } from "@stores/cartStore";
import {
  notifyProductAddedToCart,
  notifyAddToCartError,
} from "@lib/ecommerce/toast";
import { motion } from "framer-motion";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface BundlesPrimaryProps {
  product: Product;
  bundles: Bundle[];
  className?: string;
}

export function BundlesPrimary({
  product,
  bundles,
  className = "",
}: BundlesPrimaryProps) {
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(
    bundles.find((b) => b.isRecommended) || bundles[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const shouldReduceMotion = useReducedMotion();

  const { setSelectedBundle: setStoreBundle, calculatePrice } = useProductPageStore();
  const addItem = useCartStore((state) => state.addItem);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calcular precio del bundle
  const getBundlePrice = (bundle: Bundle) => {
    return bundle.price ?? (product.price * bundle.quantity);
  };

  // Calcular ahorro
  const getSavings = (bundle: Bundle) => {
    const bundlePrice = getBundlePrice(bundle);
    const regularPrice = product.price * bundle.quantity;
    return regularPrice - bundlePrice;
  };

  const handleBundleSelect = (bundle: Bundle) => {
    setSelectedBundle(bundle);
    setStoreBundle(bundle);
    calculatePrice(product, undefined, bundle);
  };

  const handleAddToCart = () => {
    if (!selectedBundle) return;

    // Agregar cada producto del bundle al carrito
    selectedBundle.products.forEach((productId) => {
      const variant = product.variants[0]; // Usar primera variante por defecto
      try {
        addItem(product, variant, quantity);
      } catch (error) {
        notifyAddToCartError(product, "Error al agregar el bundle al carrito");
        return;
      }
    });

    notifyProductAddedToCart(product, quantity);
  };

  if (bundles.length === 0) {
    return null;
  }

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}>
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-text mb-2">
            Ahorra más con nuestros packs
          </h2>
          <p className="text-subtext">Descuento progresivo - Mientras más compres, más ahorras</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Bundle Gallery - Imágenes del producto */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border border-border">
              <Image
                src={product.images[0] || ""}
                alt={`${product.title} - Bundle`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Indicador de cantidad en el bundle */}
            {selectedBundle && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-action/20 rounded-full">
                  <Sparkles className="w-5 h-5 text-action" />
                  <span className="font-semibold text-text">
                    Pack de {selectedBundle.quantity} unidad{selectedBundle.quantity > 1 ? "es" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bundle Options */}
          <div className="space-y-6">
            <div className="space-y-3">
              {bundles.map((bundle) => {
                const isSelected = selectedBundle?.id === bundle.id;
                const bundlePrice = getBundlePrice(bundle);
                const savings = getSavings(bundle);
                const discount = bundle.discount || Math.round((savings / (product.price * bundle.quantity)) * 100);

                return (
                  <motion.button
                    key={bundle.id}
                    onClick={() => handleBundleSelect(bundle)}
                    className={`w-full p-4 rounded-lg border text-left transition-all focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 ${
                      isSelected
                        ? "border-action bg-action/5"
                        : "border-border hover:border-subtext bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-text">{bundle.label}</span>
                          {bundle.isRecommended && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-action/20 text-action-text rounded text-xs font-medium">
                              <Sparkles className="w-3 h-3" />
                              Recomendado
                            </span>
                          )}
                        </div>

                        {/* Precio y descuento */}
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-bold text-text">
                            {formatPrice(bundlePrice)}
                          </span>
                          {discount > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white rounded text-sm font-semibold">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* Ahorro */}
                        {savings > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Ahorras {formatPrice(savings)}
                          </p>
                        )}

                        {/* Perks */}
                        {bundle.perks && bundle.perks.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {bundle.perks.map((perk, idx) => (
                              <li key={idx} className="text-sm text-subtext flex items-center gap-1">
                                <Check className="w-3 h-3 text-action" />
                                {perk}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Indicador de selección */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "border-action bg-action"
                            : "border-border"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-action-text" />}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Cantidad de packs
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-action"
                  aria-label="Reducir cantidad"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold text-text">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-action"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>

            {/* Bundle CTA */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedBundle}
              className="w-full px-6 py-4 bg-action text-action-text rounded-lg hover:bg-action-hover transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Agregar pack al carrito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

