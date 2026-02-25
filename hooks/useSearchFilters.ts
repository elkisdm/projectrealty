"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { SearchFilters } from "@/types/search";
import {
  applySearchFiltersToSearchParams,
  parseSearchFiltersFromSearchParams,
  areSearchFiltersEqual,
} from "@/lib/search/query-params";

/**
 * Hook to manage search filters with URL synchronization.
 */
export function useSearchFilters(initialFilters?: Partial<SearchFilters>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>(() => {
    if (typeof window === "undefined") return initialFilters || {};
    if (window.location.pathname === "/buscar") {
      return parseSearchFiltersFromSearchParams(new URLSearchParams(window.location.search));
    }
    return initialFilters || {};
  });

  useEffect(() => {
    if (pathname !== "/buscar") return;
    const parsed = parseSearchFiltersFromSearchParams(new URLSearchParams(searchParams.toString()));
    setFilters((prev) => (areSearchFiltersEqual(prev, parsed) ? prev : parsed));
  }, [pathname, searchParams]);

  const updateURL = useCallback(
    (newFilters: Partial<SearchFilters>, options?: { replace?: boolean }) => {
      if (pathname !== "/buscar") return;

      const params = new URLSearchParams(searchParams.toString());
      applySearchFiltersToSearchParams(params, newFilters);

      // Any filter mutation resets pagination.
      if (
        newFilters.q !== undefined ||
        newFilters.comuna !== undefined ||
        newFilters.operation !== undefined ||
        newFilters.precioMin !== undefined ||
        newFilters.precioMax !== undefined ||
        newFilters.dormitoriosMin !== undefined ||
        newFilters.tipos !== undefined ||
        newFilters.estacionamiento !== undefined ||
        newFilters.bodega !== undefined ||
        newFilters.mascotas !== undefined
      ) {
        params.delete("page");
      }

      const queryString = params.toString();
      const newUrl = `/buscar${queryString ? `?${queryString}` : ""}`;
      const method = options?.replace ? router.replace : router.push;

      method(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>, autoApply = false) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      if (autoApply) updateURL(newFilters);
    },
    [updateURL]
  );

  const clearFilters = useCallback(() => {
    const cleared: SearchFilters = {
      q: filters.q,
      operation: filters.operation ?? "rent",
    };
    setFilters(cleared);
    if (pathname === "/buscar") {
      const params = new URLSearchParams();
      applySearchFiltersToSearchParams(params, cleared);
      const queryString = params.toString();
      router.push(`/buscar${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }
  }, [filters.operation, filters.q, pathname, router]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.comuna) count += Array.isArray(filters.comuna) ? filters.comuna.length : 1;
    if (typeof filters.dormitoriosMin === "number") count++;
    if (filters.tipos) count += Array.isArray(filters.tipos) ? filters.tipos.length : 1;
    if (filters.estacionamiento !== undefined) count++;
    if (filters.bodega !== undefined) count++;
    if (filters.mascotas !== undefined) count++;
    if (filters.precioMin !== undefined) count++;
    if (filters.precioMax !== undefined) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilters,
    updateURL,
    clearFilters,
    activeFiltersCount,
  };
}
