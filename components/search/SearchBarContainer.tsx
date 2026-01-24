"use client";

import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/filters/SearchInput";
import { QuickFiltersRow } from "./QuickFiltersRow";
import { FilterBottomSheet } from "./FilterBottomSheet";
import { clx } from "@lib/utils";
import type { SearchBarContainerProps, SearchFilters } from "@/types/search";

/**
 * SearchBarContainer - Main search bar component
 * Mobile-first design with input, quick filters, and bottom sheet
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
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBarContainer.tsx:27',message:'Component render entry',data:{variant,initialQuery,initialFilters,pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }
  // #endregion
  
  // Check if we're on search page - use state to avoid SSR issues
  const [isOnSearchPage, setIsOnSearchPage] = useState(false);
  
  useEffect(() => {
    setIsOnSearchPage(window.location.pathname === "/buscar");
  }, []);
  
  // Use local state if not on search page, otherwise use provided filters
  const [localFilters, setLocalFilters] = useState<SearchFilters>(() => ({
    ...initialFilters,
    q: initialQuery,
  }));
  
  const filters = isOnSearchPage ? (initialFilters as SearchFilters) : localFilters;
  const [query, setQuery] = useState(initialQuery || filters.q || "");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.comuna) {
      count += Array.isArray(filters.comuna) ? filters.comuna.length : 1;
    }
    if (filters.dormitorios) {
      count += Array.isArray(filters.dormitorios) ? filters.dormitorios.length : 1;
    }
    if (filters.estacionamiento !== undefined) count++;
    if (filters.bodega !== undefined) count++;
    if (filters.mascotas !== undefined) count++;
    if (filters.precioMin !== undefined) count++;
    if (filters.precioMax !== undefined) count++;
    return count;
  }, [filters]);
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBarContainer.tsx:55',message:'After state setup',data:{filters,activeFiltersCount,isOnSearchPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync query with filters
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBarContainer.tsx:50',message:'Sync query effect',data:{filtersQ:filters.q,currentQuery:query,shouldUpdate:filters.q !== query && filters.q !== undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (filters.q !== query && filters.q !== undefined) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBarContainer.tsx:53',message:'Updating query state',data:{newQuery:filters.q},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      setQuery(filters.q);
    }
  }, [filters.q, query]);

  // Handle search query change with debounce (handled by SearchInput)
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (isOnSearchPage) {
        // On search page, update URL directly
        const params = new URLSearchParams(window.location.search);
        if (newQuery) {
          params.set("q", newQuery);
        } else {
          params.delete("q");
        }
        router.push(`/buscar?${params.toString()}`, { scroll: false });
      } else {
        // Not on search page, just update local state
        setLocalFilters((prev) => ({ ...prev, q: newQuery }));
      }
    },
    [isOnSearchPage, router]
  );

  // Handle quick filter changes (auto-apply)
  const handleComunaChange = useCallback(
    (value: string | string[] | undefined) => {
      if (isOnSearchPage) {
        const params = new URLSearchParams(window.location.search);
        if (value) {
          const comunaValue = Array.isArray(value) ? value.join(",") : value;
          params.set("comuna", comunaValue);
        } else {
          params.delete("comuna");
        }
        router.push(`/buscar?${params.toString()}`, { scroll: false });
      } else {
        setLocalFilters((prev) => ({ ...prev, comuna: value }));
      }
    },
    [isOnSearchPage, router]
  );

  const handleDormitoriosChange = useCallback(
    (value: string | string[] | undefined) => {
      if (isOnSearchPage) {
        const params = new URLSearchParams(window.location.search);
        if (value) {
          const dormitoriosValue = Array.isArray(value) ? value.join(",") : value;
          params.set("dormitorios", dormitoriosValue);
        } else {
          params.delete("dormitorios");
        }
        router.push(`/buscar?${params.toString()}`, { scroll: false });
      } else {
        setLocalFilters((prev) => ({ ...prev, dormitorios: value }));
      }
    },
    [isOnSearchPage, router]
  );

  // Handle search submission
  const handleSearch = useCallback(() => {
    const searchFilters: SearchFilters = {
      ...filters,
      q: query,
    };

    if (onSearch) {
      onSearch(searchFilters);
    } else {
      // Navigate to search page with all filters
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (filters.comuna) {
        const comunaValue = Array.isArray(filters.comuna) ? filters.comuna.join(",") : filters.comuna;
        params.set("comuna", comunaValue);
      }
      if (filters.dormitorios) {
        const dormitoriosValue = Array.isArray(filters.dormitorios) ? filters.dormitorios.join(",") : filters.dormitorios;
        params.set("dormitorios", dormitoriosValue);
      }
      if (filters.estacionamiento !== undefined) params.set("estacionamiento", String(filters.estacionamiento));
      if (filters.bodega !== undefined) params.set("bodega", String(filters.bodega));
      if (filters.mascotas !== undefined) params.set("mascotas", "true");
      if (filters.precioMin) params.set("precioMin", filters.precioMin.toString());
      if (filters.precioMax) params.set("precioMax", filters.precioMax.toString());
      
      router.push(`/buscar?${params.toString()}`);
    }
  }, [query, filters, onSearch, router]);

  // Handle sheet filter changes (apply immediately)
  const handleSheetFiltersChange = useCallback(
    (newFilters: SearchFilters) => {
      if (isOnSearchPage) {
        // Update URL directly
        const params = new URLSearchParams(window.location.search);
        if (newFilters.estacionamiento !== undefined) {
          params.set("estacionamiento", String(newFilters.estacionamiento));
        } else {
          params.delete("estacionamiento");
        }
        if (newFilters.bodega !== undefined) {
          params.set("bodega", String(newFilters.bodega));
        } else {
          params.delete("bodega");
        }
        if (newFilters.mascotas !== undefined) {
          params.set("mascotas", "true");
        } else {
          params.delete("mascotas");
        }
        if (newFilters.precioMin) {
          params.set("precioMin", newFilters.precioMin.toString());
        } else {
          params.delete("precioMin");
        }
        if (newFilters.precioMax) {
          params.set("precioMax", newFilters.precioMax.toString());
        } else {
          params.delete("precioMax");
        }
        router.push(`/buscar?${params.toString()}`, { scroll: false });
      } else {
        setLocalFilters((prev) => ({ ...prev, ...newFilters }));
      }
    },
    [isOnSearchPage, router]
  );

  // Variant-specific classes
  const containerClasses = clx(
    "w-full transition-all duration-300",
    variant === "hero" && "relative",
    variant === "sticky" && "fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg",
    variant === "inline" && "relative",
    className
  );

  const inputContainerClasses = clx(
    "flex items-center gap-3",
    variant === "hero" && [
      "bg-white/10 dark:bg-gray-800/80 backdrop-blur-md",
      "rounded-full border border-white/20 dark:border-gray-700/50",
      "shadow-lg px-4 py-3",
    ],
    variant === "sticky" && [
      "bg-white dark:bg-gray-800",
      "rounded-full shadow-sm px-4 py-2",
    ],
    variant === "inline" && [
      "bg-white dark:bg-gray-800",
      "rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3",
    ]
  );

  return (
    <div className={containerClasses}>
      <div className={variant === "sticky" ? "container mx-auto px-4 py-3" : ""}>
        <div className={variant === "hero" ? "max-w-4xl mx-auto" : ""}>
          {/* Search Input */}
          <div className={inputContainerClasses}>
            <SearchInput
              value={query}
              onChange={handleQueryChange}
              placeholder="Buscar por comuna, dirección, nombre de edificio..."
              debounceMs={300}
              className="flex-1 bg-transparent border-0 outline-none"
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
              <Search
                className={variant === "inline" ? "w-4 h-4" : "w-5 h-5"}
                color="white"
              />
              {variant === "inline" && (
                <span className="hidden sm:inline text-white font-medium">Buscar</span>
              )}
            </button>
          </div>

          {/* Quick Filters Row */}
          <div className="mt-3">
            <QuickFiltersRow
              selectedComuna={filters.comuna}
              selectedDormitorios={filters.dormitorios}
              onComunaChange={handleComunaChange}
              onDormitoriosChange={handleDormitoriosChange}
              onMoreFiltersClick={() => setIsSheetOpen(true)}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </div>
      </div>

      {/* Filter Bottom Sheet */}
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
