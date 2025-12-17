"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import type { Product, Variant } from "@schemas/ecommerce";
import { useCartStore } from "@stores/cartStore";
import { useProductPageStore } from "@stores/productPageStore";
import {
  notifyProductAddedToCart,
  notifyAddToCartError,
  notifyProductOutOfStock,
  notifyLowStock,
} from "@lib/ecommerce/toast";
import { RatingDisplay } from "@components/ecommerce/RatingDisplay";

interface ProductHeroProps {
  product: Product;
}

export function ProductHero({ product }: ProductHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const images = product.images || [];
  
  const addItem = useCartStore((state) => state.addItem);
  const { selectedOption, setSelectedOption, calculatePrice } = useProductPageStore();

  // Inicializar variant seleccionado
  useEffect(() => {
    if (!selectedOption && product.variants.length > 0) {
      setSelectedOption(product.variants[0]);
      calculatePrice(product, product.variants[0]);
    }
  }, [product, selectedOption, setSelectedOption, calculatePrice]);

  const selectedVariant = selectedOption || product.variants[0];

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

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const getImageUrl = (index: number) => {
    if (imageErrors.has(index)) {
      return "https://via.placeholder.com/800x800/8B6CFF/FFFFFF?text=Producto";
    }
    return images[index] || "https://via.placeholder.com/800x800/8B6CFF/FFFFFF?text=Producto";
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

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= selectedVariant.inventory) {
      setQuantity(newQuantity);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          {/* Imagen principal */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 group">
            <Image
              src={getImageUrl(activeIndex)}
              alt={`${product.title} - Imagen ${activeIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              onError={() => handleImageError(activeIndex)}
            />

            {/* Navegación */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Contador */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-action ${
                    index === activeIndex
                      ? "border-action"
                      : "border-border hover:border-subtext"
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <Image
                    src={getImageUrl(index)}
                    alt={`Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    onError={() => handleImageError(index)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto - Above the fold optimizado */}
        <div className="space-y-8">
          {/* Vendor/Category */}
          {(product.vendor || product.categoryName) && (
            <div className="text-sm text-subtext uppercase tracking-wide">
              {product.vendor || product.categoryName}
            </div>
          )}

          {/* Título */}
          <h1 className="text-3xl lg:text-4xl font-bold text-text">{product.title}</h1>

          {/* Rating - Refuerzo silencioso */}
          {product.rating && product.reviewCount && (
            <button
              onClick={() => {
                const reviewsSection = document.querySelector('[data-section="reviews"]');
                if (reviewsSection) {
                  reviewsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-action rounded px-2 py-1 -ml-2"
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
          )}

          {/* Precio con anclaje - Siempre visible */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl lg:text-4xl font-semibold text-text">
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

          {/* Descripción corta */}
          {product.description && (
            <p className="text-lg text-subtext leading-relaxed">{product.description}</p>
          )}

          {/* CTA Primario - Máximo 2 decisiones visibles aquí */}
          <div className="space-y-4 pt-4">
            {/* Cantidad (decisión 1) */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-action"
                  aria-label="Reducir cantidad"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold text-text">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-action"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
                <span className="text-sm text-subtext">
                  {selectedVariant.inventory} disponibles
                </span>
              </div>
            </div>

            {/* Botón agregar al carrito (decisión 2) */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant.available || selectedVariant.inventory === 0}
              className="w-full px-6 py-4 bg-action text-action-text rounded-lg hover:bg-action-hover transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {selectedVariant.available && selectedVariant.inventory > 0
                ? "Agregar al carrito"
                : "Agotado"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

