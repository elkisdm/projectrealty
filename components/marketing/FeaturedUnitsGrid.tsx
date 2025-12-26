import { getFeaturedUnits, type UnitWithBuilding } from '@lib/hooks/useFeaturedUnits';
import { UnitCard } from '@/components/ui/UnitCard';
import { UnitCardSkeleton } from '@/components/ui/UnitCardSkeleton';
import type { FeaturedUnitsFilter } from '@lib/hooks/useFeaturedUnits';

interface FeaturedUnitsGridProps {
  title: string;
  filter: FeaturedUnitsFilter;
  limit?: number;
  className?: string;
}

/**
 * Server Component que obtiene y renderiza unidades destacadas
 * Usa UnitCard para mostrar cada unidad
 */
export async function FeaturedUnitsGrid({
  title,
  filter,
  limit = 6,
  className = '',
}: FeaturedUnitsGridProps) {
  // Obtener unidades destacadas
  const units = await getFeaturedUnits(filter, limit);

  // Si no hay unidades, retornar null (el componente padre puede manejar esto)
  if (units.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-2xl font-bold tracking-tight text-text mb-6">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {units.map(({ unit, building }) => (
          <UnitCard
            key={`${building.id}-${unit.id}`}
            unit={unit}
            building={building}
            priority={false}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader para FeaturedUnitsGrid
 */
export function FeaturedUnitsGridSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-8 w-64 bg-surface rounded-lg mb-6 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <UnitCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}





