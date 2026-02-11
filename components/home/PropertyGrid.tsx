'use client';

import { motion } from 'framer-motion';
import { PropertyCard } from './PropertyCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PropertyData {
  unitId: string;
  slug: string;
  buildingName: string;
  comuna: string;
  tipologia: string;
  m2?: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  amenities: string[];
}

interface PropertyGridProps {
  properties: PropertyData[];
  title?: string;
  showViewAll?: boolean;
}

export function PropertyGrid({ properties, title, showViewAll = true }: PropertyGridProps) {
  if (properties.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Section Header */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-text text-balance">{title}</h2>
          {showViewAll && (
            <Link
              href="/buscar"
              className="flex items-center gap-1.5 text-sm font-semibold text-text hover:underline underline-offset-4 min-h-[44px] px-2"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property, index) => (
          <motion.div
            key={`${property.slug}-${property.unitId}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
          >
            <PropertyCard
              id={property.unitId}
              slug={property.slug}
              buildingName={property.buildingName}
              comuna={property.comuna}
              tipologia={property.tipologia}
              m2={property.m2}
              price={property.price}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              images={property.images}
              amenities={property.amenities}
              priority={index < 4}
            />
          </motion.div>
        ))}
      </div>

      {/* Load more / View all on mobile */}
      {showViewAll && properties.length >= 8 && (
        <div className="mt-8 flex justify-center">
          <Link
            href="/buscar"
            className="cta-outline rounded-lg px-8 py-3 text-sm min-h-[48px]"
          >
            Explorar mas departamentos
          </Link>
        </div>
      )}
    </section>
  );
}
