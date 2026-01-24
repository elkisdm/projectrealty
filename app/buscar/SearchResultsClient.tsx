"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { SearchBarContainer } from "@/components/search/SearchBarContainer";
import { SortSelect } from "@/components/filters/SortSelect";
import { ResultsBreadcrumb } from "@/components/search/ResultsBreadcrumb";
import { EmptyResults } from "@/components/search/EmptyResults";
import { ResultsError } from "@/components/search/ResultsError";
import { PaginationControls } from "@/components/search/PaginationControls";
import { UnitCard } from "@/components/ui/UnitCard";
import { UnitCardSkeleton } from "@/components/ui/UnitCardSkeleton";
import { useSearchResults } from "@/lib/hooks/useSearchResults";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import type { SearchFilters } from "@/types/search";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Leer query params de la URL
  const q = searchParams.get("q") || undefined;
  const sortParam = searchParams.get("sort") || "default";
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  // Use new search filters hook - it reads from URL automatically
  const { filters, updateFilters, clearFilters, activeFiltersCount } = useSearchFilters();

  const [sort, setSort] = useState(sortParam);

  // Convert SearchFilters to useSearchResults format
  const searchParamsForHook = useMemo(() => {
    const comunaValue = filters.comuna
      ? Array.isArray(filters.comuna)
        ? filters.comuna
        : [filters.comuna]
      : undefined;

    return {
      q: filters.q || q,
      comuna: comunaValue,
      precioMin: filters.precioMin,
      precioMax: filters.precioMax,
      dormitorios: filters.dormitorios,
      estacionamiento: filters.estacionamiento,
      bodega: filters.bodega,
      mascotas: filters.mascotas,
      sort: sort !== "default" ? sort : undefined,
      page,
      limit: 12,
    };
  }, [filters, q, sort, page]);

  // Obtener resultados usando el hook
  const {
    units,
    total,
    page: currentPage,
    totalPages,
    isLoading,
    isFetching,
    error,
  } = useSearchResults(searchParamsForHook);

  // Update sort when URL changes
  useEffect(() => {
    setSort(sortParam);
  }, [sortParam]);

  const handleSortChange = useCallback(
    (newSort: string) => {
      setSort(newSort);
      const params = new URLSearchParams(window.location.search);
      if (newSort && newSort !== "default") {
        params.set("sort", newSort);
      } else {
        params.delete("sort");
      }
      router.push(`/buscar?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setSort("default");
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    router.push(`/buscar${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }, [filters.q, clearFilters, router]);

  // Check if there are active filters
  const hasActiveFilters = activeFiltersCount > 0 || !!filters.q;

  // Handler para reintentar en caso de error
  const handleRetry = useCallback(() => {
    // Forzar refetch
    router.refresh();
  }, [router]);

  // Handler para cambio de página
  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(window.location.search);
      if (newPage > 1) {
        params.set("page", newPage.toString());
      } else {
        params.delete("page");
      }
      router.push(`/buscar?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-bg text-text">
      <PageViewTracker
        pageName="search"
        pageType="search"
        additionalParams={{
          has_filters: hasActiveFilters,
          filters_applied: filters,
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

        {/* Barra de búsqueda y filtros - Mobile-first */}
        <div className="mb-8 space-y-4">
          <SearchBarContainer
            variant="inline"
            initialQuery={filters.q}
            initialFilters={filters}
            resultsCount={total}
            isLoading={isFetching}
          />
          
          {/* Sort selector */}
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <SortSelect value={sort} onChange={handleSortChange} />
          </div>
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

export function SearchResultsClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="text-center">
          <div className="text-subtext">Cargando resultados...</div>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}