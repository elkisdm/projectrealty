"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";
import type { Product, Variant } from "@schemas/ecommerce";
import type { Bundle } from "@schemas/ecommerce";
import { useProductPageStore } from "@stores/productPageStore";
import { useCartStore } from "@stores/cartStore";
import {
  notifyProductAddedToCart,
  notifyAddToCartError,
  notifyProductOutOfStock,
} from "@lib/ecommerce/toast";

interface PurchaseOptionsProps {
  product: Product;
  bundles?: Bundle[];
  className?: string;
}

interface PurchaseOption {
  id: string;
  type: "variant" | "bundle";
  label: string;
  price: number;
  compareAtPrice?: number;
  discount?: number;
  perks?: string[];
  isRecommended?: boolean;
  variant?: Variant;
  bundle?: Bundle;
}

export function PurchaseOptions({
  product,
  bundles = [],
  className = "",
}: PurchaseOptionsProps) {
  const { selectedOption, selectedBundle, quantity, setSelectedOption, setSelectedBundle, calculatePrice } = useProductPageStore();
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

  // Construir opciones: variantes + bundles
  const options: PurchaseOption[] = [];

  // Agregar variantes como opciones individuales
  product.variants.forEach((variant, index) => {
    const discount =
      variant.compareAtPrice && variant.compareAtPrice > variant.price
        ? Math.round(
            ((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100
          )
        : undefined;

    options.push({
      id: `variant-${variant.id}`,
      type: "variant",
      label: variant.title || `${product.title} - ${variant.option1 || ""} ${variant.option2 || ""}`.trim(),
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      discount,
      isRecommended: index === 0, // Primera variante como recomendada
      variant,
    });
  });

  // Agregar bundles
  bundles.forEach((bundle, index) => {
    const bundlePrice = bundle.price ?? (product.price * bundle.quantity);
    const discount = bundle.discount;

    options.push({
      id: `bundle-${bundle.id}`,
      type: "bundle",
      label: bundle.label,
      price: bundlePrice,
      discount,
      perks: bundle.perks,
      isRecommended: bundle.isRecommended || (bundles.length > 0 && index === bundles.length - 1), // Último bundle como recomendado
      bundle,
    });
  });

  // Asegurar mínimo 3 opciones (si hay menos, duplicar con variantes)
  while (options.length < 3 && product.variants.length > 0) {
    const variant = product.variants[options.length % product.variants.length];
    options.push({
      id: `variant-extra-${options.length}`,
      type: "variant",
      label: variant.title || product.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      variant,
    });
  }

  const handleOptionSelect = (option: PurchaseOption) => {
    if (option.type === "variant" && option.variant) {
      setSelectedOption(option.variant);
      setSelectedBundle(null);
      calculatePrice(product, option.variant);
    } else if (option.type === "bundle" && option.bundle) {
      setSelectedBundle(option.bundle);
      setSelectedOption(null);
      calculatePrice(product, undefined, option.bundle);
    }
  };

  const handleAddToCart = () => {
    if (selectedBundle) {
      // Agregar bundle al carrito (cada producto del bundle)
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
    }
  };

  const getSelectedOptionId = () => {
    if (selectedBundle) {
      return `bundle-${selectedBundle.id}`;
    }
    if (selectedOption) {
      return `variant-${selectedOption.id}`;
    }
    return options[0]?.id || "";
  };

  const selectedOptionId = getSelectedOptionId();
  const selectedOptionData = options.find((opt) => opt.id === selectedOptionId);

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text mb-2">Elige tu opción</h2>
          <p className="text-subtext">Selecciona la mejor opción para ti</p>
        </div>

        {/* Opciones como radio buttons */}
        <div className="space-y-3" role="radiogroup" aria-label="Opciones de compra">
          {options.map((option) => {
            const isSelected = option.id === selectedOptionId;
            const isRecommended = option.isRecommended;

            return (
              <label
                key={option.id}
                className={`relative flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-action focus-within:ring-offset-2 ${
                  isSelected
                    ? "border-action bg-action/5"
                    : "border-border hover:border-subtext bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="purchase-option"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleOptionSelect(option)}
                  className="sr-only"
                  aria-label={option.label}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text">{option.label}</span>
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-action/20 text-action-text rounded text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        Recomendado
                      </span>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-text">
                      {formatPrice(option.price)}
                    </span>
                    {option.compareAtPrice && option.compareAtPrice > option.price && (
                      <span className="text-sm text-subtext line-through">
                        {formatPrice(option.compareAtPrice)}
                      </span>
                    )}
                    {option.discount && option.discount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-semibold">
                        -{option.discount}%
                      </span>
                    )}
                  </div>

                  {/* Perks */}
                  {option.perks && option.perks.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {option.perks.map((perk, idx) => (
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
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? "border-action bg-action"
                      : "border-border"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-action-text" />}
                </div>
              </label>
            );
          })}
        </div>

        {/* Botón agregar al carrito */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedOptionData}
          className="w-full px-6 py-4 bg-action text-action-text rounded-lg hover:bg-action-hover transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2"
        >
          Agregar al carrito
        </button>
      </div>
    </section>
  );
}

