"use client";
import { useMemo, useEffect } from "react";
import { BuildingCard } from "../BuildingCard";
import { BuildingCardV2 } from "../ui/BuildingCardV2";
import { BuildingCardSkeleton } from "../ui/BuildingCardSkeleton";
import { useFetchBuildings, type FilterValues, type BuildingSummary } from "../../hooks/useFetchBuildings";
import { getFlagValue } from "@lib/flags";
import { Building } from "@types";

interface ResultsGridProps {
  filters: FilterValues;
  sort: string;
  onResultsChange: (count: number) => void;
  paginationMode?: 'traditional' | 'infinite' | 'auto-infinite';
}

// Adapter function to convert BuildingSummary to Building for BuildingCardV2
function adaptBuildingSummaryToBuilding(buildingSummary: BuildingSummary): Building {
  // Create synthetic units based on typologySummary
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
    amenities: [], // Not available in BuildingSummary
    badges: buildingSummary.badges || []
  };
}

export function ResultsGrid({
  filters,
  sort,
  onResultsChange,
  paginationMode: _paginationMode = 'traditional'
}: ResultsGridProps) {
  // Use React Query hook directly
  const {
    data,
    isLoading,
    isFetching,
    error: queryError
  } = useFetchBuildings({
    filters,
    sort
  });

  const buildings = useMemo(() => data?.buildings || [], [data?.buildings]);
  const error = queryError;

  // Notify parent component of results count changes
  useEffect(() => {
    if (!isLoading && !isFetching) {
      onResultsChange(buildings.length);
    }
  }, [buildings.length, isLoading, isFetching, onResultsChange]);

  // Show skeletons during initial load and refetching
  if (isLoading || isFetching) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <BuildingCardSkeleton key={`skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  // Error state -> Throw to be handled by route error boundary
  if (error) {
    if (error instanceof Error) throw error;
    throw new Error("Error desconocido al cargar propiedades");
  }

  // Empty state
  if (buildings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[var(--subtext)] mb-2">No se encontraron propiedades</div>
        <div className="text-sm text-[var(--subtext)]">
          Intenta ajustar tus filtros de búsqueda
        </div>
      </div>
    );
  }

  // Results grid with feature flag for BuildingCardV2
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {buildings.map((building: BuildingSummary, idx: number) => {
        if (getFlagValue('CARD_V2')) {
          // Use BuildingCardV2 when flag is enabled
          const adaptedBuilding = adaptBuildingSummaryToBuilding(building);
          return (
            <BuildingCardV2
              key={building.id}
              building={adaptedBuilding}
              priority={idx === 0}
              showBadge={true}
            />
          );
        } else {
          // Use original BuildingCard when flag is disabled
          return (
            <BuildingCard
              key={building.id}
              building={building}
              priority={idx === 0}
            />
          );
        }
      })}
    </div>
  );
}
