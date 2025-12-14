"use client";

import React from "react";
import type { Unit, Building } from "@schemas/models";
import { UnitCard } from "@components/ui/UnitCard";
import { UnitCardSkeleton } from "@components/ui/UnitCardSkeleton";
import { readAll } from "@lib/data";

interface PropertySimilarUnitsProps {
  currentUnit: Unit;
  building: Building;
  limit?: number;
  className?: string;
}

interface UnitWithBuilding {
  unit: Unit;
  building: Building;
}

/**
 * Obtiene unidades similares basándose en:
 * - Misma comuna
 * - Precio similar (±20%)
 * - Misma cantidad de dormitorios (o similar)
 * - Excluye unidad actual
 */
function getSimilarUnits(
  currentUnit: Unit,
  currentBuilding: Building,
  allBuildings: Building[],
  limit: number
): UnitWithBuilding[] {
  const currentPrice = currentUnit.price || 0;
  const priceRange = {
    min: currentPrice * 0.8, // -20%
    max: currentPrice * 1.2,  // +20%
  };

  const currentBedrooms = currentUnit.bedrooms || currentUnit.dormitorios || 0;
  const currentComuna = currentBuilding.comuna || "";

  // Flatten: convertir buildings con units a array de unidades con building
  const allUnits: UnitWithBuilding[] = [];

  for (const b of allBuildings) {
    // Solo procesar edificios con unidades disponibles
    const availableUnits = b.units.filter((u) => u.disponible !== false);

    for (const unit of availableUnits) {
      // Excluir unidad actual
      if (unit.id === currentUnit.id) continue;

      allUnits.push({
        unit,
        building: b,
      });
    }
  }

  // Filtrar unidades similares
  const similarUnits = allUnits.filter(({ unit, building }) => {
    // Misma comuna
    if (building.comuna !== currentComuna) return false;

    // Precio similar (±20%)
    const unitPrice = unit.price || 0;
    if (unitPrice < priceRange.min || unitPrice > priceRange.max) return false;

    // Dormitorios similares (mismo número o ±1)
    const unitBedrooms = unit.bedrooms || unit.dormitorios || 0;
    if (Math.abs(unitBedrooms - currentBedrooms) > 1) return false;

    return true;
  });

  // Ordenar por precio (más cercano primero) y limitar
  const sorted = similarUnits.sort((a, b) => {
    const priceDiffA = Math.abs((a.unit.price || 0) - currentPrice);
    const priceDiffB = Math.abs((b.unit.price || 0) - currentPrice);
    return priceDiffA - priceDiffB;
  });

  return sorted.slice(0, limit);
}

export function PropertySimilarUnits({
  currentUnit,
  building,
  limit = 6,
  className = "",
}: PropertySimilarUnitsProps) {
  const [similarUnits, setSimilarUnits] = React.useState<UnitWithBuilding[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadSimilarUnits() {
      try {
        setIsLoading(true);
        // Obtener todos los edificios (readAll funciona en cliente si Supabase está configurado)
        const allBuildings = await readAll();
        const similar = getSimilarUnits(currentUnit, building, allBuildings, limit);
        setSimilarUnits(similar);
      } catch (error) {
        console.error("Error loading similar units:", error);
        setSimilarUnits([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadSimilarUnits();
  }, [currentUnit, building, limit]);

  // No mostrar nada si no hay unidades similares
  if (!isLoading && similarUnits.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-text mb-8">
          Unidades similares
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <UnitCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {similarUnits.map(({ unit, building: unitBuilding }) => (
              <UnitCard
                key={`${unitBuilding.id}-${unit.id}`}
                unit={unit}
                building={unitBuilding}
                priority={false}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}



