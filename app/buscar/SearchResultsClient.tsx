"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FilterBar } from "@/components/filters/FilterBar";
import { FilterDescription } from "@/components/filters/FilterDescription";
import { ResultsBreadcrumb } from "@/components/search/ResultsBreadcrumb";
import { EmptyResults } from "@/components/search/EmptyResults";
import { ResultsError } from "@/components/search/ResultsError";
import { PaginationControls } from "@/components/search/PaginationControls";
import { UnitCard } from "@/components/ui/UnitCard";
import { UnitCardSkeleton } from "@/components/ui/UnitCardSkeleton";
import { useSearchResults } from "@/lib/hooks/useSearchResults";
import type { FilterValues } from "@/types/filters";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export function SearchResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Leer query params de la URL
  const q = searchParams.get("q") || undefined;
  const comunaParam = searchParams.get("comuna") || "Todas";
  const precioMinParam = searchParams.get("precioMin");
  const precioMaxParam = searchParams.get("precioMax");
  const dormitoriosParam = searchParams.get("dormitorios") || undefined;
  const estacionamientoParam = searchParams.get("estacionamiento");
  const bodegaParam = searchParams.get("bodega");
  const mascotasParam = searchParams.get("mascotas");
  const sortParam = searchParams.get("sort") || "default";
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  // Estado de filtros
  const [filters, setFilters] = useState<FilterValues>({
    comuna: comunaParam ? (comunaParam.includes(',') ? comunaParam.split(',') : comunaParam) : "Todas",
    tipologia: "Todas", // Mantener para compatibilidad pero no usar
    dormitorios: dormitoriosParam ? (dormitoriosParam.includes(',') ? dormitoriosParam.split(',') : dormitoriosParam) : undefined,
    minPrice: precioMinParam ? Number(precioMinParam) : null,
    maxPrice: precioMaxParam ? Number(precioMaxParam) : null,
    estacionamiento: estacionamientoParam === "true" ? true : estacionamientoParam === "false" ? false : undefined,
    bodega: bodegaParam === "true" ? true : bodegaParam === "false" ? false : undefined,
    mascotas: mascotasParam === "true" ? true : mascotasParam === "false" ? false : undefined,
  });

  const [sort, setSort] = useState(sortParam);

  // Obtener resultados usando el hook
  const {
    units,
    total,
    page: currentPage,
    totalPages,
    isLoading,
    isFetching,
    error,
  } = useSearchResults({
    q,
    comuna: Array.isArray(filters.comuna) 
      ? filters.comuna.length > 0 ? filters.comuna : undefined
      : filters.comuna !== "Todas" ? filters.comuna : undefined,
    precioMin: filters.minPrice ?? undefined,
    precioMax: filters.maxPrice ?? undefined,
    dormitorios: filters.dormitorios,
    estacionamiento: filters.estacionamiento,
    bodega: filters.bodega,
    mascotas: filters.mascotas,
    sort: sort !== "default" ? sort : undefined,
    page,
    limit: 12,
  });

  // Actualizar filtros cuando cambian los query params
  useEffect(() => {
    setFilters({
      comuna: comunaParam ? (comunaParam.includes(',') ? comunaParam.split(',') : comunaParam) : "Todas",
      tipologia: "Todas",
      dormitorios: dormitoriosParam ? (dormitoriosParam.includes(',') ? dormitoriosParam.split(',') : dormitoriosParam) : undefined,
      minPrice: precioMinParam ? Number(precioMinParam) : null,
      maxPrice: precioMaxParam ? Number(precioMaxParam) : null,
      estacionamiento: estacionamientoParam === "true" ? true : estacionamientoParam === "false" ? false : undefined,
      bodega: bodegaParam === "true" ? true : bodegaParam === "false" ? false : undefined,
      mascotas: mascotasParam === "true" ? true : mascotasParam === "false" ? false : undefined,
    });
    setSort(sortParam);
  }, [comunaParam, precioMinParam, precioMaxParam, dormitoriosParam, estacionamientoParam, bodegaParam, mascotasParam, sortParam]);

  // Actualizar URL cuando cambian los filtros
  const updateURL = useCallback(
    (newFilters: FilterValues, newSort: string, newPage: number = 1) => {
      const params = new URLSearchParams();

      if (q) params.set("q", q);
      
      // Comuna (soporta array)
      if (newFilters.comuna) {
        if (Array.isArray(newFilters.comuna) && newFilters.comuna.length > 0) {
          params.set("comuna", newFilters.comuna.join(','));
        } else if (typeof newFilters.comuna === 'string' && newFilters.comuna !== "Todas") {
          params.set("comuna", newFilters.comuna);
        }
      }
      
      if (newFilters.minPrice) {
        params.set("precioMin", newFilters.minPrice.toString());
      }
      if (newFilters.maxPrice) {
        params.set("precioMax", newFilters.maxPrice.toString());
      }
      
      // Dormitorios (soporta array)
      if (newFilters.dormitorios) {
        if (Array.isArray(newFilters.dormitorios) && newFilters.dormitorios.length > 0) {
          params.set("dormitorios", newFilters.dormitorios.join(','));
        } else if (typeof newFilters.dormitorios === 'string') {
          params.set("dormitorios", newFilters.dormitorios);
        }
      }
      
      // Nuevos filtros
      if (newFilters.estacionamiento !== undefined) {
        params.set("estacionamiento", newFilters.estacionamiento.toString());
      }
      if (newFilters.bodega !== undefined) {
        params.set("bodega", newFilters.bodega.toString());
      }
      if (newFilters.mascotas !== undefined) {
        params.set("mascotas", newFilters.mascotas.toString());
      }
      
      if (newSort && newSort !== "default") {
        params.set("sort", newSort);
      }
      if (newPage > 1) {
        params.set("page", newPage.toString());
      }

      const queryString = params.toString();
      router.push(`/buscar${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [q, router]
  );

  const handleFiltersChange = useCallback(
    (newFilters: FilterValues) => {
      setFilters(newFilters);
      updateURL(newFilters, sort, 1); // Reset a página 1 al cambiar filtros
    },
    [sort, updateURL]
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      setSort(newSort);
      updateURL(filters, newSort, page);
    },
    [filters, page, updateURL]
  );

  const handleClearFilters = useCallback(() => {
    const emptyFilters: FilterValues = {
      comuna: "Todas",
      tipologia: "Todas",
      dormitorios: undefined,
      minPrice: null,
      maxPrice: null,
      estacionamiento: undefined,
      bodega: undefined,
      mascotas: undefined,
    };
    setFilters(emptyFilters);
    setSort("default");

    // Limpiar URL pero mantener búsqueda si existe
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const queryString = params.toString();
    router.push(`/buscar${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [q, router]);

  const handleApplyFilters = useCallback(() => {
    // Trackear evento de filtros aplicados
    track(ANALYTICS_EVENTS.FILTER_APPLIED, {
      filters: {
        comuna: filters.comuna !== "Todas" ? filters.comuna : undefined,
        precioMin: filters.minPrice,
        precioMax: filters.maxPrice,
        dormitorios: filters.dormitorios,
      },
      query: q,
    });
    updateURL(filters, sort, 1); // Reset a página 1 al aplicar filtros
  }, [filters, sort, updateURL, q]);

  // Filtros activos para FilterChips
  const activeFilters = {
    comuna: Array.isArray(filters.comuna) 
      ? filters.comuna.length > 0 ? filters.comuna : undefined
      : filters.comuna !== "Todas" ? filters.comuna : undefined,
    precioMin: filters.minPrice ?? undefined,
    precioMax: filters.maxPrice ?? undefined,
    dormitorios: filters.dormitorios,
    estacionamiento: filters.estacionamiento,
    bodega: filters.bodega,
    mascotas: filters.mascotas,
  };

  const handleRemoveFilter = useCallback(
    (key: keyof typeof activeFilters) => {
      const newFilters = { ...filters };
      if (key === "comuna") {
        newFilters.comuna = "Todas";
      } else if (key === "precioMin" || key === "precioMax") {
        // Remover ambos precios
        newFilters.minPrice = null;
        newFilters.maxPrice = null;
      } else if (key === "dormitorios") {
        newFilters.dormitorios = undefined;
      } else if (key === "estacionamiento") {
        newFilters.estacionamiento = undefined;
      } else if (key === "bodega") {
        newFilters.bodega = undefined;
      } else if (key === "mascotas") {
        newFilters.mascotas = undefined;
      }
      handleFiltersChange(newFilters);
    },
    [filters, handleFiltersChange]
  );

  // Construir texto de búsqueda actual
  const hasActiveFilters =
    (Array.isArray(filters.comuna) && filters.comuna.length > 0) ||
    (typeof filters.comuna === 'string' && filters.comuna !== "Todas") ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.dormitorios !== undefined ||
    filters.estacionamiento !== undefined ||
    filters.bodega !== undefined ||
    filters.mascotas !== undefined;

  // Handler para reintentar en caso de error
  const handleRetry = useCallback(() => {
    // Forzar refetch
    router.refresh();
  }, [router]);

  // Handler para cambio de página
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateURL(filters, sort, newPage);
    },
    [filters, sort, updateURL]
  );

  return (
    <div className="min-h-screen bg-bg text-text">
      <PageViewTracker
        pageName="search"
        pageType="search"
        additionalParams={{
          has_filters: hasActiveFilters || !!q,
          filters_applied: activeFilters,
        }}
      />
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Breadcrumb */}
        <ResultsBreadcrumb />

        {/* Header con búsqueda actual */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-text mb-2">
            {isFetching ? (
              "Buscando propiedades..."
            ) : (
              <>
                {total}{" "}
                {total === 1
                  ? "propiedad encontrada"
                  : "propiedades encontradas"}
              </>
            )}
          </h1>
          {q && (
            <p className="text-subtext mt-2">
              Resultados para:{" "}
              <span className="font-semibold text-text">"{q}"</span>
            </p>
          )}
        </div>

        {/* FilterDescription - Descripción dinámica de filtros activos */}
        {hasActiveFilters && (
          <div className="mb-4">
            <FilterDescription
              filters={activeFilters}
              onClear={handleClearFilters}
            />
          </div>
        )}

        {/* Barra de filtros */}
        <div className="mb-8">
          <FilterBar
            value={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            sort={sort}
            onSort={handleSortChange}
            useDormitorios={true}
            isLoading={isFetching}
          />
        </div>

        {/* Grid de resultados */}
        <div>
          {/* Estado de error */}
          {error && !isFetching && (
            <ResultsError error={error as Error} onRetry={handleRetry} />
          )}

          {/* Estado de carga inicial */}
          {isLoading && !isFetching && units.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <UnitCardSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          )}

          {/* Estado vacío (sin resultados) */}
          {!error && !isLoading && !isFetching && units.length === 0 && (
            <EmptyResults
              searchTerm={q}
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          )}

          {/* Estado con resultados o loading durante fetch */}
          {!error && (units.length > 0 || isFetching) && (
            <>
              {/* Loading durante fetch (mostrar skeletons mientras se cargan más resultados) */}
              {isFetching && units.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <UnitCardSkeleton key={`skeleton-fetch-${idx}`} />
                  ))}
                </div>
              )}

              {/* Grid de resultados */}
              {units.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {units.map((item, idx) => (
                      <UnitCard
                        key={`${item.building.id}-${item.unit.id}`}
                        unit={item.unit}
                        building={item.building}
                        priority={idx < 4}
                      />
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalResults={total}
                      limit={12}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}