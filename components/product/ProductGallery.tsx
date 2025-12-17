"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@schemas/ecommerce";

interface ProductGalleryProps {
  product: Product;
  className?: string;
}

export function ProductGallery({ product, className = "" }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const images = product.images || [];

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

  if (images.length === 0) {
    return (
      <div className={`relative aspect-square overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-center text-subtext">
          <p className="text-lg font-semibold">Sin imágenes</p>
          <p className="text-sm">Imagen no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Imagen principal */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 group">
        <Image
          src={getImageUrl(activeIndex)}
          alt={`${product.title} - Imagen ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={activeIndex === 0}
          onError={() => handleImageError(activeIndex)}
        />

        {/* Navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
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
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                index === activeIndex
                  ? "border-[#8B6CFF] scale-105"
                  : "border-transparent hover:border-gray-300"
              }`}
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
  );
}

