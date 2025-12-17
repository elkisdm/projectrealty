"use client";

import React from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@schemas/ecommerce";
import { getAllProducts } from "@workspace/data/ecommerce.mock";

interface RelatedProductsProps {
  product: Product;
  limit?: number;
  className?: string;
}

export function RelatedProducts({
  product,
  limit = 4,
  className = "",
}: RelatedProductsProps) {
  // Obtener productos relacionados (misma categoría o tags similares)
  const allProducts = getAllProducts();
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.tags?.some((tag) => product.tags?.includes(tag)))
    )
    .slice(0, limit);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <h2 className="text-2xl font-bold text-text mb-6">Productos relacionados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} />
        ))}
      </div>
    </section>
  );
}

