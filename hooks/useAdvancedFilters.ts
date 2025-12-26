/**
 * Advanced Filters Hook (Simplified for MVP)
 * Only supports basic filters: comuna and price
 */

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { 
  FilterValues, 
  FilterChip, 
  FilterAnalytics 
} from '../types/filters';
import type { Building } from '../schemas/models';

// Simplified AdvancedFilterValues for MVP (only comuna and price)
export type AdvancedFilterValues = FilterValues;

export interface UseAdvancedFiltersParams {
  buildings: Building[];
  initialFilters?: Partial<AdvancedFilterValues>;
  urlSync?: boolean;
  debounceMs?: number;
}

export interface UseAdvancedFiltersReturn {
  // Current filter state
  filters: AdvancedFilterValues;
  
  // Filter actions
  setFilters: (filters: Partial<AdvancedFilterValues>) => void;
  setQuery: (query: string) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;
  
  // Results
  filteredBuildings: Building[];
  searchResults: never[]; // Empty for MVP
  resultsCount: number;
  
  // Filter state
  hasActiveFilters: boolean;
  activeFilterChips: FilterChip[];
  
  // URL sync
  updateURL: () => void;
  
  // Analytics
  getFilterAnalytics: () => FilterAnalytics;
}

// Re-export types for backward compatibility
export type { FilterChip, FilterAnalytics };

const DEFAULT_FILTERS: AdvancedFilterValues = {
  // Basic filters only
  comuna: "Todas",
  tipologia: "Todas", 
  minPrice: null,
  maxPrice: null,
};

/**
 * Convert AdvancedFilterValues to basic FilterValues for backward compatibility
 */
export function toBasicFilters(advanced: AdvancedFilterValues): FilterValues {
  return {
    comuna: advanced.comuna,
    tipologia: advanced.tipologia,
    minPrice: advanced.minPrice,
    maxPrice: advanced.maxPrice,
  };
}

/**
 * Simplified filters hook for MVP (only comuna and price)
 */
export function useAdvancedFilters({
  buildings,
  initialFilters = {},
  urlSync = true,
  debounceMs: _debounceMs = 300,
}: UseAdvancedFiltersParams): UseAdvancedFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL or defaults
  const [filters, setFiltersState] = useState<AdvancedFilterValues>(() => {
    const baseFilters = { ...DEFAULT_FILTERS, ...initialFilters };
    
    if (urlSync) {
      return {
        ...baseFilters,
        comuna: searchParams.get("comuna") || baseFilters.comuna,
        tipologia: searchParams.get("tipologia") || baseFilters.tipologia,
        minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : baseFilters.minPrice,
        maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : baseFilters.maxPrice,
      };
    }
    
    return baseFilters;
  });

  // Apply basic filters to buildings (only comuna and price for MVP)
  const filteredBuildings = useMemo(() => {
    let results = [...buildings];

    // Filter by comuna
    if (filters.comuna && filters.comuna !== "Todas") {
      results = results.filter(building => building.comuna === filters.comuna);
    }

    // Filter by tipologia
    if (filters.tipologia && filters.tipologia !== "Todas") {
      results = results.filter(building => 
        building.units.some(unit => unit.tipologia === filters.tipologia)
      );
    }

    // Filter by price
    if (filters.minPrice !== null) {
      results = results.filter(building => 
        building.units.some(unit => unit.price >= filters.minPrice!)
      );
    }

    if (filters.maxPrice !== null) {
      results = results.filter(building => 
        building.units.some(unit => unit.price <= filters.maxPrice!)
      );
    }

    return results;
  }, [buildings, filters]);

  // Generate filter chips for active filters (simplified for MVP)
  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (filters.comuna !== "Todas") {
      const comunaValue = Array.isArray(filters.comuna) 
        ? filters.comuna.length === 1 
          ? filters.comuna[0] 
          : `${filters.comuna.length} comunas`
        : filters.comuna;
      chips.push({
        id: 'comuna',
        label: 'Comuna',
        value: comunaValue,
        onRemove: () => setFilters({ comuna: "Todas" })
      });
    }

    if (filters.tipologia !== "Todas") {
      chips.push({
        id: 'tipologia',
        label: 'Tipología',
        value: filters.tipologia,
        onRemove: () => setFilters({ tipologia: "Todas" })
      });
    }

    if (filters.minPrice !== null || filters.maxPrice !== null) {
      const min = filters.minPrice ? `$${filters.minPrice.toLocaleString()}` : '';
      const max = filters.maxPrice ? `$${filters.maxPrice.toLocaleString()}` : '';
      const value = min && max ? `${min} - ${max}` : min || max;
      
      chips.push({
        id: 'price',
        label: 'Precio',
        value,
        onRemove: () => setFilters({ minPrice: null, maxPrice: null })
      });
    }

    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setFilters is stable (useCallback with [])
  }, [filters]);

  // Update filters with partial values
  const setFilters = useCallback((newFilters: Partial<AdvancedFilterValues>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = DEFAULT_FILTERS[key as keyof AdvancedFilterValues];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== defaultValue;
    });
  }, [filters]);

  // Set search query (no-op for MVP, kept for compatibility)
  const setQuery = useCallback((_query: string) => {
    // No search functionality in MVP
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Reset to default values
  const resetToDefaults = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Update URL with current filters (simplified for MVP)
  const updateURL = useCallback(() => {
    if (!urlSync) return;

    const params = new URLSearchParams();
    
    // Basic filters only
    if (filters.comuna !== "Todas") {
      const comunaValue = Array.isArray(filters.comuna) 
        ? filters.comuna[0] 
        : filters.comuna;
      params.set("comuna", comunaValue);
    }
    if (filters.tipologia !== "Todas") params.set("tipologia", filters.tipologia);
    if (filters.minPrice !== null) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== null) params.set("maxPrice", filters.maxPrice.toString());

    const url = params.toString() ? `?${params.toString()}` : "";
    router.replace(`${window.location.pathname}${url}`, { scroll: false });
  }, [filters, router, urlSync]);

  // Get analytics data (simplified for MVP)
  const getFilterAnalytics = useCallback((): FilterAnalytics => {
    const filtersUsed = Object.entries(filters)
      .filter(([key, value]) => {
        const defaultValue = DEFAULT_FILTERS[key as keyof AdvancedFilterValues];
        return value !== defaultValue;
      })
      .map(([key]) => key);

    return {
      totalFilters: filtersUsed.length,
      searchQuery: null, // No search in MVP
      filtersUsed,
      resultCount: filteredBuildings.length,
    };
  }, [filters, filteredBuildings.length]);

  return {
    // State
    filters,
    
    // Actions
    setFilters,
    setQuery,
    clearFilters,
    resetToDefaults,
    
    // Results
    filteredBuildings,
    searchResults: [], // Empty for MVP
    resultsCount: filteredBuildings.length,
    
    // Filter state
    hasActiveFilters,
    activeFilterChips,
    
    // URL sync
    updateURL,
    
    // Analytics
    getFilterAnalytics,
  };
}
