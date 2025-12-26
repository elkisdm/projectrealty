"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FilterBar } from "@/components/filters/FilterBar";
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
  const sortParam = searchParams.get("sort") || "default";
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  // Estado de filtros
  const [filters, setFilters] = useState<FilterValues>({
    comuna: comunaParam,
    tipologia: "Todas", // Mantener para compatibilidad pero no usar
    dormitorios: dormitoriosParam,
    minPrice: precioMinParam ? Number(precioMinParam) : null,
    maxPrice: precioMaxParam ? Number(precioMaxParam) : null,
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
    comuna: filters.comuna !== "Todas" ? filters.comuna : undefined,
    precioMin: filters.minPrice ?? undefined,
    precioMax: filters.maxPrice ?? undefined,
    dormitorios: filters.dormitorios,
    sort: sort !== "default" ? sort : undefined,
    page,
    limit: 12,
  });

  // Actualizar filtros cuando cambian los query params
  useEffect(() => {
    setFilters({
      comuna: comunaParam,
      tipologia: "Todas",
      dormitorios: dormitoriosParam,
      minPrice: precioMinParam ? Number(precioMinParam) : null,
      maxPrice: precioMaxParam ? Number(precioMaxParam) : null,
    });
    setSort(sortParam);
  }, [comunaParam, precioMinParam, precioMaxParam, dormitoriosParam, sortParam]);

  // Actualizar URL cuando cambian los filtros
  const updateURL = useCallback(
    (newFilters: FilterValues, newSort: string, newPage: number = 1) => {
      const params = new URLSearchParams();

      if (q) params.set("q", q);
      if (newFilters.comuna && newFilters.comuna !== "Todas") {
        const comunaValue = Array.isArray(newFilters.comuna) 
          ? newFilters.comuna[0] 
          : newFilters.comuna;
        if (comunaValue && comunaValue !== "Todas") {
          params.set("comuna", comunaValue);
        }
      }
      if (newFilters.minPrice) {
        params.set("precioMin", newFilters.minPrice.toString());
      }
      if (newFilters.maxPrice) {
        params.set("precioMax", newFilters.maxPrice.toString());
      }
      if (newFilters.dormitorios) {
        const dormitoriosValue = Array.isArray(newFilters.dormitorios)
          ? newFilters.dormitorios.join(",")
          : newFilters.dormitorios;
        params.set("dormitorios", dormitoriosValue);
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

  const handleSearchChange = useCallback(
    (newQ: string) => {
      const params = new URLSearchParams();
      
      if (newQ && newQ.trim()) {
        params.set("q", newQ.trim());
      }
      
      // Mantener filtros actuales
      if (filters.comuna && filters.comuna !== "Todas") {
        const comunaValue = Array.isArray(filters.comuna) 
          ? filters.comuna.join(",")
          : filters.comuna;
        if (comunaValue && comunaValue !== "Todas") {
          params.set("comuna", comunaValue);
        }
      }
      if (filters.minPrice) {
        params.set("precioMin", filters.minPrice.toString());
      }
      if (filters.maxPrice) {
        params.set("precioMax", filters.maxPrice.toString());
      }
      if (filters.dormitorios) {
        const dormitoriosValue = Array.isArray(filters.dormitorios)
          ? filters.dormitorios.join(",")
          : filters.dormitorios;
        params.set("dormitorios", dormitoriosValue);
      }
      if (sort && sort !== "default") {
        params.set("sort", sort);
      }
      if (page > 1) {
        params.set("page", page.toString());
      }

      const queryString = params.toString();
      router.push(`/buscar${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [filters, sort, page, router]
  );

  // Filtros activos para FilterDescription (formato compatible)
  const activeFiltersForDescription = {
    comuna: filters.comuna !== "Todas" ? filters.comuna : undefined,
    precioMin: filters.minPrice !== null ? filters.minPrice : undefined,
    precioMax: filters.maxPrice !== null ? filters.maxPrice : undefined,
    dormitorios: filters.dormitorios,
    estacionamiento: filters.estacionamiento === true ? true : undefined,
    bodega: filters.bodega === true ? true : undefined,
    mascotas: filters.mascotas === true ? true : undefined,
  };

  const handleRemoveFilter = useCallback(
    (key: "comuna" | "precioMin" | "precioMax" | "dormitorios" | "estacionamiento" | "bodega" | "mascotas") => {
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
        newFilters.estacionamiento = null;
      } else if (key === "bodega") {
        newFilters.bodega = null;
      } else if (key === "mascotas") {
        newFilters.mascotas = null;
      }
      handleFiltersChange(newFilters);
    },
    [filters, handleFiltersChange]
  );

  // Construir texto de búsqueda actual
  const hasActiveFilters =
    filters.comuna !== "Todas" ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.dormitorios !== undefined ||
    filters.estacionamiento !== null ||
    filters.bodega !== null ||
    filters.mascotas !== null;

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
          filters_applied: activeFiltersForDescription,
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

        {/* Barra de filtros (incluye búsqueda y FilterDescription) */}
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
            q={q || ""}
            onSearchChange={handleSearchChange}
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