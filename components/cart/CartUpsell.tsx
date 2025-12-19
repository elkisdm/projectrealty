"use client";

import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useCartStore } from "@stores/cartStore";
import { getCartRecommendations } from "@lib/ecommerce/cartRecommendations";
import Image from "next/image";
import Link from "next/link";
import { useCartStore as useCart } from "@stores/cartStore";
import {
  notifyProductAddedToCart,
  notifyAddToCartError,
  notifyProductOutOfStock,
} from "@lib/ecommerce/toast";
import type { Product } from "@schemas/ecommerce";

interface CartUpsellProps {
  onItemAdded?: () => void;
  className?: string;
}

export function CartUpsell({ onItemAdded, className = "" }: CartUpsellProps) {
  const cart = useCartStore((state) => state.cart);
  const addItem = useCart((state) => state.addItem);

  // Obtener recomendaciones
  const recommendations = useMemo(() => {
    if (cart.items.length === 0) return [];
    return getCartRecommendations(cart, 3);
  }, [cart]);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Manejar agregar producto
  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const availableVariant = product.variants.find(
      (v) => v.available && v.inventory > 0
    );

    if (!availableVariant) {
      notifyProductOutOfStock(product);
      return;
    }

    try {
      addItem(product, availableVariant, 1);
      notifyProductAddedToCart(product, 1);
      onItemAdded?.();
    } catch (error) {
      notifyAddToCartError(product, "Error al agregar el producto al carrito");
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#8B6CFF]" />
        <h3 className="text-sm font-semibold text-text">
          Te puede interesar
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {recommendations.map((product) => {
          const imageUrl =
            product.images[0] || "/images/placeholder-product.jpg";
          const minPrice = Math.min(...product.variants.map((v) => v.price));

          return (
            <div
              key={product.id}
              className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Imagen */}
              <Link
                href={`/product/${product.handle}`}
                className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200"
              >
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${product.handle}`}
                  className="block"
                >
                  <h4 className="text-sm font-medium text-text line-clamp-2 mb-1 hover:text-[#8B6CFF] transition-colors">
                    {product.title}
                  </h4>
                </Link>
                <p className="text-sm font-semibold text-[#8B6CFF] mb-2">
                  {formatPrice(minPrice)}
                </p>
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="w-full px-3 py-1.5 text-xs bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2"
                >
                  Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}




