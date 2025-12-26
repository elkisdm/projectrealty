"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { BuildingCard } from "../BuildingCard";
import { BuildingCardV2 } from "../ui/BuildingCardV2";
import { BuildingCardSkeleton } from "../ui/BuildingCardSkeleton";
import { type BuildingSummary } from "../../hooks/useFetchBuildings";
import { CARD_V2 } from "@lib/flags";
import { Building } from "@types";

interface VirtualResultsGridProps {
  items: BuildingSummary[];
  isLoading: boolean;
  error?: Error | null;
  onResultsChange?: (count: number) => void;
  className?: string;
}

// Adapter function (reutilizada de ResultsGrid)
function adaptBuildingSummaryToBuilding(buildingSummary: BuildingSummary): Building {
  const syntheticUnits = buildingSummary.typologySummary?.map((typology, index) => ({
    id: `${buildingSummary.id}-unit-${index}`,
    slug: `${buildingSummary.slug}-${typology.key.toLowerCase()}-${index}`,
    codigoUnidad: `UNIT-${index}`,
    buildingId: buildingSummary.id,
    tipologia: typology.key,
    price: typology.minPrice || buildingSummary.precioDesde,
    disponible: true,
    dormitorios: typology.key === 'Studio' || typology.key === 'Estudio' ? 0 : parseInt(typology.key[0]) || 1,
    banos: 1,
    garantia: typology.minPrice || buildingSummary.precioDesde,
    m2: typology.minM2 || 40,
    estacionamiento: false,
    bodega: false,
  })) || [];

  return {
    id: buildingSummary.id,
    slug: buildingSummary.slug,
    name: buildingSummary.name,
    comuna: buildingSummary.comuna,
    address: buildingSummary.address,
    coverImage: buildingSummary.coverImage ?? buildingSummary.gallery?.[0] ?? "/images/nunoa-cover.jpg",
    gallery: buildingSummary.gallery,
    units: syntheticUnits,
    amenities: [],
    badges: buildingSummary.badges || []
  };
}


export function VirtualResultsGrid({
  items = [],
  isLoading,
  error,
  onResultsChange,
  className = ""
}: VirtualResultsGridProps) {
  // Notificar cambios en el conteo de resultados
  useEffect(() => {
    if (onResultsChange && !isLoading) {
      onResultsChange(items.length);
    }
  }, [items.length, isLoading, onResultsChange]);

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <BuildingCardSkeleton key={`skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  if (error) {
    throw error; // Dejar que el error boundary lo maneje
  }

  // Estado vacío
  if (items.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-[var(--subtext)] mb-2">No se encontraron propiedades</div>
        <div className="text-sm text-[var(--subtext)]">
          Intenta ajustar tus filtros de búsqueda
        </div>
      </div>
    );
  }

  // Grid simple sin virtualización
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 ${className}`}>
      {items.map((building: BuildingSummary, idx: number) => (
        <motion.div
          key={building.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
        >
          {CARD_V2 ? (
            <BuildingCardV2
              building={adaptBuildingSummaryToBuilding(building)}
              priority={idx === 0}
              showBadge={true}
            />
          ) : (
            <BuildingCard
              building={building}
              priority={idx === 0}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Componente wrapper que mantiene compatibilidad con la API actual
interface VirtualResultsWrapperProps {
  filters: unknown;
  sort: string;
  onResultsChange: (count: number) => void;
  useFetchBuildings: (params: unknown) => {
    data: BuildingSummary[];
    isLoading: boolean;
    isFetching: boolean;
    error: Error | null;
  };
}

export function VirtualResultsWrapper({
  filters,
  sort,
  onResultsChange,
  useFetchBuildings
}: VirtualResultsWrapperProps) {
  const { data: buildings = [], isLoading, isFetching, error } = useFetchBuildings({
    filters,
    sort
  });

  return (
    <VirtualResultsGrid
      items={buildings}
      isLoading={isLoading || isFetching}
      error={error}
      onResultsChange={onResultsChange}
    />
  );
}

export default VirtualResultsGrid;
