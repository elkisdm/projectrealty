/**
 * TEMPORALMENTE DESHABILITADO - Módulos faltantes
 * Este componente requiere módulos que no existen:
 * - @schemas/ecommerce
 * - @stores/cartStore
 * - @components/ecommerce/RatingDisplay
 * 
 * Para habilitar: crear los módulos faltantes o eliminar este archivo si no se usa.
 */

/*
"use client";

import React, { useState } from "react";
import { ShoppingCart, Package, Truck } from "lucide-react";
import type { Product, Variant } from "@schemas/ecommerce";
import { useCartStore } from "@stores/cartStore";
import {
  notifyProductAddedToCart,
  notifyAddToCartError,
  notifyProductOutOfStock,
  notifyLowStock,
} from "@lib/ecommerce/toast";
import { RatingDisplay } from "@components/ecommerce/RatingDisplay";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
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

  // Calcular descuento
  const discount =
    selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price
      ? Math.round(
          ((selectedVariant.compareAtPrice - selectedVariant.price) /
            selectedVariant.compareAtPrice) *
            100
        )
      : 0;

  // Agrupar variantes por opciones
  const option1Values = Array.from(
    new Set(product.variants.map((v) => v.option1).filter(Boolean))
  );
  const option2Values = selectedVariant.option1
    ? Array.from(
        new Set(
          product.variants
            .filter((v) => v.option1 === selectedVariant.option1)
            .map((v) => v.option2)
            .filter(Boolean)
        )
      )
    : [];

  const handleVariantChange = (option1?: string, option2?: string) => {
    const variant = product.variants.find(
      (v) => v.option1 === option1 && (!option2 || v.option2 === option2)
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant.available || selectedVariant.inventory === 0) {
      notifyProductOutOfStock(product);
      return;
    }

    if (selectedVariant.inventory < 5) {
      notifyLowStock(product, selectedVariant.inventory);
    }

    try {
      addItem(product, selectedVariant, quantity);
      notifyProductAddedToCart(product, quantity);
    } catch (error) {
      notifyAddToCartError(product, "Error al agregar el producto al carrito");
    }
  };

  return (
    <div className="space-y-6">
      {/* Vendor/Category */}
{
  (product.vendor || product.categoryName) && (
    <div className="text-sm text-subtext uppercase tracking-wide">
      {product.vendor || product.categoryName}
    </div>
  )
}

{/* Título */ }
<h1 className="text-3xl font-bold text-text">{product.title}</h1>

{/* Rating */ }
{
  product.rating && product.reviewCount && (
    <button
      onClick={() => {
        // Scroll a la sección de reviews
        const reviewsTab = document.querySelector('[data-tab="reviews"]');
        if (reviewsTab) {
          reviewsTab.scrollIntoView({ behavior: "smooth", block: "start" });
          // También activar el tab si está disponible
          const reviewsButton = document.querySelector(
            'button[onclick*="reviews"]'
          ) as HTMLButtonElement;
          reviewsButton?.click();
        }
      }}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] rounded px-2 py-1 -ml-2"
      aria-label={`Ver ${product.reviewCount} reseñas`}
    >
      <RatingDisplay
        rating={product.rating}
        size="md"
        showValue={true}
        showCount={true}
        reviewCount={product.reviewCount}
      />
    </button>
  )
}

{/* Precio */ }
<div className="flex items-baseline gap-3">
  <span className="text-4xl font-bold text-text">
    {formatPrice(selectedVariant.price)}
  </span>
  {selectedVariant.compareAtPrice &&
    selectedVariant.compareAtPrice > selectedVariant.price && (
      <>
        <span className="text-2xl text-subtext line-through">
          {formatPrice(selectedVariant.compareAtPrice)}
        </span>
        {discount > 0 && (
          <span className="px-2 py-1 bg-red-500 text-white rounded text-sm font-semibold">
            -{discount}%
          </span>
        )}
      </>
    )}
</div>

{/* Descripción corta */ }
{
  product.description && (
    <p className="text-lg text-subtext">{product.description}</p>
  )
}

{/* Selector de variantes */ }
{
  option1Values.length > 0 && (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          {option1Values[0] && (option1Values[0].includes("kg") || option1Values[0].includes("g"))
            ? "Tamaño"
            : "Sabor"}
        </label>
        <div className="flex flex-wrap gap-2">
          {option1Values.map((value) => (
            <button
              key={value}
              onClick={() => handleVariantChange(value, undefined)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${selectedVariant.option1 === value
                  ? "border-[#8B6CFF] bg-[#8B6CFF]/10 text-[#8B6CFF] font-semibold"
                  : "border-border hover:border-[#8B6CFF]/50 text-text"
                }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {option2Values.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Tamaño
          </label>
          <div className="flex flex-wrap gap-2">
            {option2Values.map((value) => (
              <button
                key={value}
                onClick={() =>
                  handleVariantChange(selectedVariant.option1, value)
                }
                className={`px-4 py-2 rounded-lg border-2 transition-all ${selectedVariant.option2 === value
                    ? "border-[#8B6CFF] bg-[#8B6CFF]/10 text-[#8B6CFF] font-semibold"
                    : "border-border hover:border-[#8B6CFF]/50 text-text"
                  }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

{/* Cantidad */ }
<div>
  <label className="block text-sm font-semibold text-text mb-2">
    Cantidad
  </label>
  <div className="flex items-center gap-3">
    <button
      onClick={() => setQuantity(Math.max(1, quantity - 1))}
      className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Reducir cantidad"
    >
      -
    </button>
    <span className="w-12 text-center font-semibold text-text">{quantity}</span>
    <button
      onClick={() =>
        setQuantity(Math.min(selectedVariant.inventory, quantity + 1))
      }
      className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Aumentar cantidad"
    >
      +
    </button>
    <span className="text-sm text-subtext">
      {selectedVariant.inventory} disponibles
    </span>
  </div>
</div>

{/* Botón agregar al carrito */ }
<button
  onClick={handleAddToCart}
  disabled={!selectedVariant.available || selectedVariant.inventory === 0}
  className="w-full px-6 py-4 bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2"
>
  <ShoppingCart className="w-5 h-5" />
  {selectedVariant.available && selectedVariant.inventory > 0
    ? "Agregar al carrito"
    : "Agotado"}
</button>

{/* Info adicional */ }
<div className="space-y-3 pt-4 border-t border-border">
  <div className="flex items-center gap-3 text-sm text-subtext">
    <Truck className="w-5 h-5" />
    <span>Envío gratis en compras sobre $50.000</span>
  </div>
  <div className="flex items-center gap-3 text-sm text-subtext">
    <Package className="w-5 h-5" />
    <span>Devoluciones dentro de 30 días</span>
  </div>
</div>
    </div >
  );
}
*/

