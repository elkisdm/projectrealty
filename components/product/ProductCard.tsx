/**
 * TEMPORALMENTE DESHABILITADO - Módulos faltantes
 * Este componente requiere módulos que no existen:
 * - @schemas/ecommerce
 * - @stores/cartStore
 * 
 * Para habilitar: crear los módulos faltantes o eliminar este archivo si no se usa.
 */

/*
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import type { Product } from "@schemas/ecommerce";
import { useCartStore } from "@stores/cartStore";
import {
  notifyProductAddedToCart,
  notifyAddToCartError,
  notifyProductOutOfStock,
} from "@lib/ecommerce/toast";

interface ProductCardProps {
  product: Product;
  className?: string;
  showQuickAdd?: boolean;
}

export function ProductCard({
  product,
  className = "",
  showQuickAdd = true,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Obtener el precio más bajo y más alto de las variantes
  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const hasPriceRange = minPrice !== maxPrice;

  // Obtener el precio comparado más bajo
  const comparePrices = product.variants
    .map((v) => v.compareAtPrice)
    .filter((p): p is number => p !== undefined);
  const minComparePrice = comparePrices.length > 0 ? Math.min(...comparePrices) : undefined;

  // Calcular descuento
  const discount =
    minComparePrice && minComparePrice > minPrice
      ? Math.round(((minComparePrice - minPrice) / minComparePrice) * 100)
      : 0;

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Manejar agregar al carrito (usa la primera variante disponible)
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const availableVariant = product.variants.find((v) => v.available && v.inventory > 0);
    
    if (!availableVariant) {
      notifyProductOutOfStock(product);
      return;
    }

    try {
      addItem(product, availableVariant, 1);
      notifyProductAddedToCart(product, 1);
    } catch (error) {
      notifyAddToCartError(product, "Error al agregar el producto al carrito");
    }
  };

  const imageUrl = product.images[0] || "/images/placeholder-product.jpg";
  const productUrl = `/product/${product.handle}`;

  return (
    <div
      className={`group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <Link href={productUrl} className="block">
        {/* Imagen del producto */}
<div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
  <Image
    src={imageUrl}
    alt={product.title}
    fill
    className="object-cover transition-transform duration-300 group-hover:scale-105"
    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  />

  {/* Badge de descuento */}
  {discount > 0 && (
    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
      -{discount}%
    </div>
  )}

  {/* Badge de agotado */}
  {!product.available && (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
      <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
        Agotado
      </span>
    </div>
  )}

  {/* Botón rápido agregar al carrito (hover) */}
  {showQuickAdd && product.available && (
    <button
      onClick={handleQuickAdd}
      className="absolute bottom-3 right-3 w-10 h-10 bg-[#8B6CFF] hover:bg-[#7a5ce6] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-10 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2"
      aria-label={`Agregar ${product.title} al carrito`}
    >
      <ShoppingCart className="w-5 h-5" />
    </button>
  )}
</div>

{/* Información del producto */ }
<div className="p-4 space-y-2">
  {/* Categoría/Vendor */}
  {(product.vendor || product.categoryName) && (
    <div className="text-xs text-subtext uppercase tracking-wide">
      {product.vendor || product.categoryName}
    </div>
  )}

  {/* Título */}
  <h3 className="text-sm font-semibold text-text line-clamp-2 min-h-[2.5rem] group-hover:text-[#8B6CFF] transition-colors">
    {product.title}
  </h3>

  {/* Rating */}
  {product.rating && product.reviewCount && (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
      <span className="text-xs text-subtext">
        {product.rating.toFixed(1)} ({product.reviewCount})
      </span>
    </div>
  )}

  {/* Precio */}
  <div className="flex items-baseline gap-2">
    {hasPriceRange ? (
      <>
        <span className="text-lg font-bold text-text">
          {formatPrice(minPrice)}
        </span>
        <span className="text-sm text-subtext">- {formatPrice(maxPrice)}</span>
      </>
    ) : (
      <>
        <span className="text-lg font-bold text-text">{formatPrice(minPrice)}</span>
        {minComparePrice && minComparePrice > minPrice && (
          <span className="text-sm text-subtext line-through">
            {formatPrice(minComparePrice)}
          </span>
        )}
      </>
    )}
  </div>

  {/* Variantes disponibles */}
  {product.variants.length > 1 && (
    <div className="text-xs text-subtext">
      {product.variants.length} opciones disponibles
    </div>
  )}
</div>
      </Link >
    </div >
  );
}
*/

