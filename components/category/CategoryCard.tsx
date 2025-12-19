"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@schemas/ecommerce";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className = "" }: CategoryCardProps) {
  const imageUrl = category.image || "/images/placeholder-category.jpg";
  const categoryUrl = `/category/${category.slug}`;

  return (
    <Link
      href={categoryUrl}
      className={`group relative block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Imagen de fondo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {category.image ? (
          <Image
            src={imageUrl}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#8B6CFF] to-[#7a5ce6] flex items-center justify-center">
            <span className="text-white text-4xl font-bold">{category.name.charAt(0)}</span>
          </div>
        )}

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <h3 className="text-2xl font-bold mb-2 group-hover:text-[#8B6CFF] transition-colors">
            {category.name}
          </h3>

          {category.description && (
            <p className="text-sm text-white/90 mb-3 line-clamp-2">
              {category.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {category.productCount} {category.productCount === 1 ? "producto" : "productos"}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}




