"use client";

import React from "react";
import { ProductReviews } from "@components/ecommerce/ProductReviews";
import type { Product } from "@schemas/ecommerce";

interface ReviewsExtendedProps {
  product: Product;
  className?: string;
}

export function ReviewsExtended({ product, className = "" }: ReviewsExtendedProps) {
  return (
    <section
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}
      data-section="reviews"
    >
      <div className="space-y-12">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text mb-2">
            Reseñas de clientes
          </h2>
          <p className="text-subtext">
            Descubre lo que otros clientes opinan sobre este producto
          </p>
        </div>

        <ProductReviews
          productId={product.id}
          productName={product.title}
        />
      </div>
    </section>
  );
}

