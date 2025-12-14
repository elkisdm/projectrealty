'use client';

import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UnitCard } from '@/components/ui/UnitCard';
import { UnitCardSkeleton } from '@/components/ui/UnitCardSkeleton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { UnitWithBuilding } from '@lib/hooks/useFeaturedUnits';

interface FeaturedUnitsGridClientProps {
  title: string;
  units: UnitWithBuilding[];
  isLoading?: boolean;
  filterType: 'comuna' | 'dormitorios' | 'precio' | 'featured';
  filterValue: string | number;
  className?: string;
}

/**
 * Client Component con carousel para mostrar unidades destacadas
 * Incluye navegación con flechas y scroll horizontal en mobile
 */
export function FeaturedUnitsGridClient({
  title,
  units,
  isLoading = false,
  filterType,
  filterValue,
  className = '',
}: FeaturedUnitsGridClientProps) {
  const prefersReducedMotion = useReducedMotion();

  // Construir URL para "Ver todos"
  const getViewAllUrl = () => {
    const params = new URLSearchParams();
    switch (filterType) {
      case 'comuna':
        params.set('comuna', filterValue as string);
        break;
      case 'dormitorios':
        params.set('dormitorios', filterValue as string);
        break;
      case 'precio':
        params.set('precioMax', filterValue.toString());
        break;
      case 'featured':
        // No agregar filtros para featured
        break;
    }
    return `/buscar${params.toString() ? `?${params.toString()}` : ''}`;
  };

  // Si no hay unidades y no está cargando, no mostrar nada
  if (!isLoading && units.length === 0) {
    return null;
  }

  // Mostrar todas las unidades (el grid se encarga del responsive)
  // En mobile habrá scroll horizontal, en desktop se muestran todas con botones de navegación

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header con título y botón Ver todos */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-text">{title}</h3>
        {units.length > 0 && (
          <Link
            href={getViewAllUrl()}
            className="text-sm font-semibold text-[#8B6CFF] hover:text-[#7a5ce6] transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2 rounded"
          >
            Ver todos
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* Grid de unidades */}
      <div className="relative">
        {/* Contenedor del grid */}
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <UnitCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {units.map(({ unit, building }) => (
                <motion.div
                  key={`${building.id}-${unit.id}`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                >
                  <UnitCard
                    unit={unit}
                    building={building}
                    priority={false}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}



