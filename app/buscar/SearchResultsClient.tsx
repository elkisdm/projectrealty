"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { Map, Bell } from "lucide-react";
import { SearchBarContainer } from "@/components/search/SearchBarContainer";
import { SortSelect } from "@/components/filters/SortSelect";
import { ResultsBreadcrumb } from "@/components/search/ResultsBreadcrumb";
import { EmptyResults } from "@/components/search/EmptyResults";
import { ResultsError } from "@/components/search/ResultsError";
import { PaginationControls } from "@/components/search/PaginationControls";
import { MobileResultsList } from "@/components/mobile/MobileResultsList";
import { UnitCard } from "@/components/ui/UnitCard";
import { UnitCardSkeleton } from "@/components/ui/UnitCardSkeleton";
import { useSearchResults } from "@/lib/hooks/useSearchResults";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortParam = searchParams.get("sort") || "default";
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  const { filters, clearFilters, activeFiltersCount } = useSearchFilters();
  const [sort, setSort] = useState(sortParam);
  const [placeholderFeedback, setPlaceholderFeedback] = useState<string | null>(null);

  const searchParamsForHook = useMemo(
    () => ({
      q: filters.q,
      comuna: filters.comuna,
      operation: filters.operation ?? "rent",
      precioMin: filters.precioMin,
      precioMax: filters.precioMax,
      dormitoriosMin: filters.dormitoriosMin,
      tipos: filters.tipos,
      estacionamiento: filters.estacionamiento,
      bodega: filters.bodega,
      mascotas: filters.mascotas,
      sort: sort !== "default" ? sort : undefined,
      page,
      limit: 12,
    }),
    [filters, sort, page]
  );

  const {
    units,
    total,
    page: currentPage,
    totalPages,
    isLoading,
    isFetching,
    error,
  } = useSearchResults(searchParamsForHook);

  useEffect(() => {
    setSort(sortParam);
  }, [sortParam]);

  const locationLabel = useMemo(() => {
    if (!filters.comuna) return undefined;
    return Array.isArray(filters.comuna) ? filters.comuna.join(", ") : filters.comuna;
  }, [filters.comuna]);

  const title = useMemo(() => {
    if (isFetching) return "Buscando propiedades...";
    const noun = total === 1 ? "propiedad encontrada" : "propiedades encontradas";
    if (locationLabel) return `${total} ${noun} en ${locationLabel}`;
    return `${total} ${noun}`;
  }, [isFetching, total, locationLabel]);

  const handleSortChange = useCallback(
    (newSort: string) => {
      setSort(newSort);
      const params = new URLSearchParams(window.location.search);
      if (newSort && newSort !== "default") {
        params.set("sort", newSort);
      } else {
        params.delete("sort");
      }
      params.delete("page");
      router.push(`/buscar?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setSort("default");
  }, [clearFilters]);

  const hasActiveFilters = activeFiltersCount > 0 || !!filters.q;

  const handleRetry = useCallback(() => {
    router.refresh();
  }, [router]);

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

  const handlePlaceholderAction = useCallback((featureName: string) => {
    setPlaceholderFeedback(`${featureName}: Próximamente`);
    window.setTimeout(() => {
      setPlaceholderFeedback((current) =>
        current === `${featureName}: Próximamente` ? null : current
      );
    }, 2200);
  }, []);

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

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ResultsBreadcrumb location={locationLabel} />

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{title}</h1>
          {filters.q && (
            <p className="mt-2 text-subtext">
              Resultados para <span className="font-semibold text-text">"{filters.q}"</span>
            </p>
          )}
        </div>

        <div className="mb-6 space-y-4 sm:mb-8">
          <SearchBarContainer
            variant="inline"
            initialQuery={filters.q}
            initialFilters={filters}
            resultsCount={total}
            isLoading={isFetching}
          />

          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <SortSelect value={sort} onChange={handleSortChange} />
          </div>
        </div>

        <div>
          {error && !isFetching && (
            <ResultsError error={error as Error} onRetry={handleRetry} />
          )}

          {isLoading && !isFetching && units.length === 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <UnitCardSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          )}

          {!error && !isLoading && !isFetching && units.length === 0 && (
            <EmptyResults
              searchTerm={filters.q}
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          )}

          {!error && (units.length > 0 || isFetching) && (
            <>
              {isFetching && units.length === 0 && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <UnitCardSkeleton key={`skeleton-fetch-${idx}`} />
                  ))}
                </div>
              )}

              {units.length > 0 && (
                <>
                  <MobileResultsList
                    items={units}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    className="md:hidden"
                  />

                  <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {units.map((item, idx) => (
                      <UnitCard
                        key={`${item.building.id}-${item.unit.id}`}
                        unit={item.unit}
                        building={item.building}
                        variant="v2"
                        priority={idx < 4}
                      />
                    ))}
                  </div>

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

      {units.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 md:hidden">
          <button
            type="button"
            onClick={() => handlePlaceholderAction("Mostrar en mapa")}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-text shadow-lg ring-1 ring-black/5"
            aria-label="Mostrar resultados en mapa (próximamente)"
          >
            <Map className="h-4 w-4" aria-hidden="true" />
            Mostrar en mapa
          </button>

          <button
            type="button"
            onClick={() => handlePlaceholderAction("Crear alerta")}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-text shadow-lg ring-1 ring-black/5"
            aria-label="Crear alerta de búsqueda (próximamente)"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            Crear alerta
          </button>
        </div>
      )}

      {placeholderFeedback && (
        <div className="fixed bottom-24 right-4 z-50 rounded-xl bg-text px-3 py-2 text-sm text-white shadow-xl md:hidden">
          {placeholderFeedback}
        </div>
      )}
    </div>
  );
}

export function SearchResultsClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="text-center">
            <div className="text-subtext">Cargando resultados...</div>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
