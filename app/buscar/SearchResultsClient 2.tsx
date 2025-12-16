"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { FilterBar } from "@/components/filters/FilterBar";
import { ResultsGrid } from "@/components/lists/ResultsGrid";
import { useFetchBuildings } from "@/hooks/useFetchBuildings";
import { BuildingCard } from "@/components/BuildingCard";
import { BuildingCardV2 } from "@/components/ui/BuildingCardV2";
import { BuildingCardSkeleton } from "@/components/ui/BuildingCardSkeleton";
import { getFlagValue } from "@lib/flags";
import type { FilterValues } from "@/types/filters";
import type { BuildingSummary } from "@/hooks/useFetchBuildings";
import { Building } from "@types";

// Wrapper para ResultsGrid que acepta search
function ResultsGridWithSearch({
  filters,
  sort,
  search,
  onResultsChange,
}: {
  filters: FilterValues;
  sort: string;
  search: string;
  onResultsChange: (count: number) => void;
}) {
  const { data, isLoading, isFetching, error } = useFetchBuildings({
    filters,
    sort,
    search: search || undefined,
  });

  const buildings = useMemo(() => data?.buildings || [], [data?.buildings]);

  useEffect(() => {
    if (!isLoading && !isFetching) {
      onResultsChange(buildings.length);
    }
  }, [buildings.length, isLoading, isFetching, onResultsChange]);

  if (isLoading || isFetching) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <BuildingCardSkeleton key={`skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  if (error) {
    if (error instanceof Error) throw error;
    throw new Error("Error desconocido al cargar propiedades");
  }

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

  // Adapter function
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
      badges: buildingSummary.badges || [],
    };
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {buildings.map((building: BuildingSummary, idx: number) => {
        if (getFlagValue('CARD_V2')) {
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

export function SearchResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Leer query params de la URL
  const q = searchParams.get("q") || "";
  const comunaParam = searchParams.get("comuna") || "Todas";
  const precioMinParam = searchParams.get("precioMin");
  const precioMaxParam = searchParams.get("precioMax");
  const dormitoriosParam = searchParams.get("dormitorios");
  const banosParam = searchParams.get("banos");
  const sortParam = searchParams.get("sort") || "default";

  // Estado de filtros
  const [filters, setFilters] = useState<FilterValues>({
    comuna: comunaParam,
    tipologia: "Todas", // Por ahora no usamos tipología desde URL
    minPrice: precioMinParam ? Number(precioMinParam) : null,
    maxPrice: precioMaxParam ? Number(precioMaxParam) : null,
  });

  const [sort, setSort] = useState(sortParam);
  const [resultCount, setResultCount] = useState(0);

  // Actualizar filtros cuando cambian los query params
  useEffect(() => {
    setFilters({
      comuna: comunaParam,
      tipologia: "Todas",
      minPrice: precioMinParam ? Number(precioMinParam) : null,
      maxPrice: precioMaxParam ? Number(precioMaxParam) : null,
    });
    setSort(sortParam);
  }, [comunaParam, precioMinParam, precioMaxParam, sortParam]);

  // Actualizar URL cuando cambian los filtros
  const updateURL = useCallback((newFilters: FilterValues, newSort: string) => {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (newFilters.comuna && newFilters.comuna !== "Todas") {
      const comunaValue = Array.isArray(newFilters.comuna) ? newFilters.comuna.join(',') : newFilters.comuna;
      params.set("comuna", comunaValue);
    }
    if (newFilters.minPrice) {
      params.set("precioMin", newFilters.minPrice.toString());
    }
    if (newFilters.maxPrice) {
      params.set("precioMax", newFilters.maxPrice.toString());
    }
    if (dormitoriosParam) {
      params.set("dormitorios", dormitoriosParam);
    }
    if (banosParam) {
      params.set("banos", banosParam);
    }
    if (newSort && newSort !== "default") {
      params.set("sort", newSort);
    }

    const queryString = params.toString();
    router.push(`/buscar${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [q, dormitoriosParam, banosParam, router]);

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    updateURL(newFilters, sort);
  }, [sort, updateURL]);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
    updateURL(filters, newSort);
  }, [filters, updateURL]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters: FilterValues = {
      comuna: "Todas",
      tipologia: "Todas",
      minPrice: null,
      maxPrice: null,
    };
    setFilters(emptyFilters);
    setSort("default");

    // Limpiar URL pero mantener búsqueda si existe
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const queryString = params.toString();
    router.push(`/buscar${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [q, router]);

  const handleApplyFilters = useCallback(() => {
    updateURL(filters, sort);
  }, [filters, sort, updateURL]);

  // Construir texto de búsqueda actual
  const searchText = q || "todas las propiedades";
  const hasActiveFilters = filters.comuna !== "Todas" || filters.minPrice !== null || filters.maxPrice !== null;

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header con búsqueda actual */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text mb-2">
            {resultCount > 0 ? (
              <>
                {resultCount} {resultCount === 1 ? "propiedad encontrada" : "propiedades encontradas"}
              </>
            ) : (
              "Buscando propiedades..."
            )}
          </h1>
          {q && (
            <p className="text-subtext">
              Resultados para: <span className="font-semibold text-text">"{q}"</span>
            </p>
          )}
          {hasActiveFilters && (
            <p className="text-sm text-subtext mt-1">
              Con filtros aplicados
            </p>
          )}
        </div>

        {/* Barra de filtros */}
        <div className="mb-8">
          <FilterBar
            value={filters}
            onChange={handleFiltersChange}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            sort={sort}
            onSort={handleSortChange}
          />
        </div>

        {/* Grid de resultados */}
        <div>
          <ResultsGridWithSearch
            filters={filters}
            sort={sort}
            search={q}
            onResultsChange={setResultCount}
          />
        </div>
      </div>
    </div>
  );
}
