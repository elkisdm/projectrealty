"use client";

import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/filters/SearchInput";
import { QuickFiltersRow } from "./QuickFiltersRow";
import { FilterBottomSheet } from "./FilterBottomSheet";
import { clx } from "@lib/utils";
import { CHILEAN_COMMUNES_RM } from "@/lib/data/chilean-communes";
import {
  applySearchFiltersToSearchParams,
  buildSearchParams,
} from "@/lib/search/query-params";
import type { SearchBarContainerProps, SearchFilters } from "@/types/search";

/**
 * SearchBarContainer - Main search bar component.
 * Mobile-first design with query input, quick filters, and advanced filters sheet.
 */
export const SearchBarContainer = memo(function SearchBarContainer({
  variant = "inline",
  initialQuery = "",
  initialFilters = {},
  onSearch,
  className = "",
  resultsCount,
  isLoading = false,
}: SearchBarContainerProps) {
  const router = useRouter();
  const [isOnSearchPage, setIsOnSearchPage] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(() => ({
    operation: "rent",
    ...initialFilters,
    q: initialQuery || initialFilters.q,
  }));
  const [query, setQuery] = useState(initialQuery || initialFilters.q || "");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsOnSearchPage(window.location.pathname === "/buscar");
  }, []);

  const filters = useMemo(
    () =>
      isOnSearchPage
        ? ({ operation: "rent", ...initialFilters } as SearchFilters)
        : localFilters,
    [initialFilters, isOnSearchPage, localFilters]
  );

  useEffect(() => {
    if (filters.q !== undefined && filters.q !== query) {
      setQuery(filters.q);
    }
  }, [filters.q, query]);

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

  const pushSearchPagePatch = useCallback(
    (patch: Partial<SearchFilters>) => {
      const params = new URLSearchParams(window.location.search);
      applySearchFiltersToSearchParams(params, patch);

      if (
        patch.q !== undefined ||
        patch.comuna !== undefined ||
        patch.dormitoriosMin !== undefined ||
        patch.tipos !== undefined ||
        patch.precioMin !== undefined ||
        patch.precioMax !== undefined ||
        patch.estacionamiento !== undefined ||
        patch.bodega !== undefined ||
        patch.mascotas !== undefined ||
        patch.operation !== undefined
      ) {
        params.delete("page");
      }

      router.push(`/buscar${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [router]
  );

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (isOnSearchPage) {
        pushSearchPagePatch({ q: newQuery || undefined });
      } else {
        setLocalFilters((prev) => ({ ...prev, q: newQuery || undefined }));
      }
    },
    [isOnSearchPage, pushSearchPagePatch]
  );

  const handleComunaChange = useCallback(
    (value: string | string[] | undefined) => {
      if (isOnSearchPage) {
        pushSearchPagePatch({ comuna: value });
      } else {
        setLocalFilters((prev) => ({ ...prev, comuna: value }));
      }
    },
    [isOnSearchPage, pushSearchPagePatch]
  );

  const handleDormitoriosMinChange = useCallback(
    (value: number | undefined) => {
      if (isOnSearchPage) {
        pushSearchPagePatch({ dormitoriosMin: value });
      } else {
        setLocalFilters((prev) => ({ ...prev, dormitoriosMin: value }));
      }
    },
    [isOnSearchPage, pushSearchPagePatch]
  );

  const handleSearch = useCallback(() => {
    const searchFilters: SearchFilters = {
      ...filters,
      q: query || undefined,
      operation: "rent",
    };

    if (onSearch) {
      onSearch(searchFilters);
      return;
    }

    if (isOnSearchPage) {
      pushSearchPagePatch(searchFilters);
      return;
    }

    const params = buildSearchParams(searchFilters);
    router.push(`/buscar${params.toString() ? `?${params.toString()}` : ""}`);
  }, [filters, isOnSearchPage, onSearch, pushSearchPagePatch, query, router]);

  const handleSheetFiltersChange = useCallback(
    (newFilters: SearchFilters) => {
      if (isOnSearchPage) {
        pushSearchPagePatch(newFilters);
      } else {
        const merged = {
          ...localFilters,
          ...newFilters,
          q: query || undefined,
          operation: "rent" as const,
        };
        setLocalFilters(merged);
        const params = buildSearchParams(merged);
        router.push(`/buscar${params.toString() ? `?${params.toString()}` : ""}`);
      }
    },
    [isOnSearchPage, localFilters, pushSearchPagePatch, query, router]
  );

  const containerClasses = clx(
    "w-full transition-all duration-300",
    variant === "hero" && "relative",
    variant === "sticky" &&
      "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-lg",
    variant === "inline" && "relative",
    className
  );

  const inputContainerClasses = clx(
    "flex items-center gap-3",
    variant === "hero" &&
      "bg-background/10 md:bg-card/80 backdrop-blur-md rounded-full border border-border/50 shadow-lg px-4 py-3",
    variant === "sticky" && "bg-card rounded-full shadow-sm px-4 py-2",
    variant === "inline" && "bg-card rounded-xl border border-border px-4 py-3"
  );

  return (
    <div className={containerClasses}>
      <div className={variant === "sticky" ? "container mx-auto px-4 py-3" : ""}>
        <div className={variant === "hero" ? "max-w-4xl mx-auto" : ""}>
          <div className={inputContainerClasses}>
            <SearchInput
              value={query}
              onChange={handleQueryChange}
              placeholder="Buscar por comuna, dirección, nombre de edificio..."
              debounceMs={300}
              className="flex-1 bg-transparent border-0 outline-none"
              suggestions={[...CHILEAN_COMMUNES_RM]}
              onSuggestionSelect={(suggestion) => {
                handleQueryChange(suggestion);
                handleSearch();
              }}
              autoFocus={false}
            />
            <button
              type="button"
              onClick={handleSearch}
              className={clx(
                "flex-shrink-0 rounded-full bg-[#8B6CFF] hover:bg-[#7a5ce6] transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]/50",
                variant === "hero" && "w-10 h-10",
                variant === "sticky" && "w-9 h-9",
                variant === "inline" && "px-6 py-2 gap-2"
              )}
              aria-label="Buscar"
            >
              <Search className={variant === "inline" ? "w-4 h-4" : "w-5 h-5"} color="white" />
              {variant === "inline" && <span className="hidden sm:inline text-white font-medium">Buscar</span>}
            </button>
          </div>

          <div className="mt-3">
            <QuickFiltersRow
              selectedComuna={filters.comuna}
              selectedDormitoriosMin={filters.dormitoriosMin}
              onComunaChange={handleComunaChange}
              onDormitoriosMinChange={handleDormitoriosMinChange}
              onMoreFiltersClick={() => setIsSheetOpen(true)}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </div>
      </div>

      <FilterBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        filters={filters}
        onFiltersChange={handleSheetFiltersChange}
        resultsCount={resultsCount}
        isLoading={isLoading}
      />
    </div>
  );
});
