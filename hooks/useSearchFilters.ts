"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SearchFilters } from "@/types/search";

/**
 * Hook to manage search filters with URL synchronization
 * Auto-applies quick filters, pending state for sheet filters
 * Works both in pages (with useSearchParams) and outside (reading from window.location)
 */
// Helper function to parse URL filters (outside component to avoid hook order issues)
function parseUrlFiltersFromWindow(): SearchFilters {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || undefined;
  const comunaParam = params.get("comuna");
  const dormitoriosParam = params.get("dormitorios");
  const estacionamientoParam = params.get("estacionamiento");
  const bodegaParam = params.get("bodega");
  const mascotasParam = params.get("mascotas");
  const precioMinParam = params.get("precioMin");
  const precioMaxParam = params.get("precioMax");

  return {
    q,
    comuna: comunaParam
      ? comunaParam.includes(",")
        ? comunaParam.split(",")
        : comunaParam
      : undefined,
    dormitorios: dormitoriosParam
      ? dormitoriosParam.includes(",")
        ? (dormitoriosParam.split(",") as Array<"Estudio" | "1" | "2" | "3">)
        : (dormitoriosParam as "Estudio" | "1" | "2" | "3")
      : undefined,
    estacionamiento:
      estacionamientoParam === "true"
        ? true
        : estacionamientoParam === "false"
        ? false
        : undefined,
    bodega:
      bodegaParam === "true" ? true : bodegaParam === "false" ? false : undefined,
    mascotas: mascotasParam === "true" ? true : undefined,
    precioMin: precioMinParam ? Number(precioMinParam) : undefined,
    precioMax: precioMaxParam ? Number(precioMaxParam) : undefined,
  };
}

export function useSearchFilters(initialFilters?: Partial<SearchFilters>) {
  const router = useRouter();

  // Initialize filters from URL or initialFilters - only read once on mount
  const [filters, setFilters] = useState<SearchFilters>(() => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSearchFilters.ts:58',message:'useState initial - reading URL',data:{pathname:window.location.pathname,hasInitialFilters:!!initialFilters},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    
    if (typeof window === "undefined") {
      // SSR: use initialFilters
      return initialFilters || {};
    }

    // Client: read from URL if on search page, otherwise use initialFilters
    if (window.location.pathname === "/buscar") {
      const urlFilters = parseUrlFiltersFromWindow();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSearchFilters.ts:68',message:'Initial filters from URL',data:{urlFilters},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return urlFilters;
    }

    // Not on search page: use initialFilters
    return initialFilters || {};
  });

  // Sync filters from URL when on search page (only sync, don't update URL)
  useEffect(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/buscar") {
      return;
    }

    const urlFilters = parseUrlFiltersFromWindow();
    // Only update if different to avoid loops
    setFilters((prev) => {
      const hasChanges = 
        prev.q !== urlFilters.q ||
        JSON.stringify(prev.comuna) !== JSON.stringify(urlFilters.comuna) ||
        JSON.stringify(prev.dormitorios) !== JSON.stringify(urlFilters.dormitorios) ||
        prev.estacionamiento !== urlFilters.estacionamiento ||
        prev.bodega !== urlFilters.bodega ||
        prev.mascotas !== urlFilters.mascotas ||
        prev.precioMin !== urlFilters.precioMin ||
        prev.precioMax !== urlFilters.precioMax;

      if (!hasChanges) {
        return prev;
      }

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSearchFilters.ts:95',message:'Syncing filters from URL',data:{prev,urlFilters},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return { ...prev, ...urlFilters };
    });
  }, []); // Only run once on mount - URL changes handled by router events

  // Update URL with filters
  const updateURL = useCallback(
    (newFilters: Partial<SearchFilters>, options?: { replace?: boolean }) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSearchFilters.ts:70',message:'updateURL called',data:{newFilters,options,currentPath:typeof window !== 'undefined' ? window.location.pathname : 'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const params = new URLSearchParams(window.location.search);

      // Update or remove query params
      if (newFilters.q !== undefined) {
        if (newFilters.q) {
          params.set("q", newFilters.q);
        } else {
          params.delete("q");
        }
      }

      if (newFilters.comuna !== undefined) {
        if (newFilters.comuna) {
          const comunaValue = Array.isArray(newFilters.comuna)
            ? newFilters.comuna.join(",")
            : newFilters.comuna;
          params.set("comuna", comunaValue);
        } else {
          params.delete("comuna");
        }
      }

      if (newFilters.dormitorios !== undefined) {
        if (newFilters.dormitorios) {
          const dormitoriosValue = Array.isArray(newFilters.dormitorios)
            ? newFilters.dormitorios.join(",")
            : newFilters.dormitorios;
          params.set("dormitorios", dormitoriosValue);
        } else {
          params.delete("dormitorios");
        }
      }

      if (newFilters.estacionamiento !== undefined) {
        if (newFilters.estacionamiento !== null) {
          params.set("estacionamiento", String(newFilters.estacionamiento));
        } else {
          params.delete("estacionamiento");
        }
      }

      if (newFilters.bodega !== undefined) {
        if (newFilters.bodega !== null) {
          params.set("bodega", String(newFilters.bodega));
        } else {
          params.delete("bodega");
        }
      }

      if (newFilters.mascotas !== undefined) {
        if (newFilters.mascotas) {
          params.set("mascotas", "true");
        } else {
          params.delete("mascotas");
        }
      }

      if (newFilters.precioMin !== undefined) {
        if (newFilters.precioMin) {
          params.set("precioMin", newFilters.precioMin.toString());
        } else {
          params.delete("precioMin");
        }
      }

      if (newFilters.precioMax !== undefined) {
        if (newFilters.precioMax) {
          params.set("precioMax", newFilters.precioMax.toString());
        } else {
          params.delete("precioMax");
        }
      }

      const queryString = params.toString();
      const method = options?.replace ? router.replace : router.push;
      const newUrl = `/buscar${queryString ? `?${queryString}` : ""}`;
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSearchFilters.ts:148',message:'Calling router method',data:{method:options?.replace ? 'replace' : 'push',newUrl,currentUrl:typeof window !== 'undefined' ? window.location.href : 'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      method(newUrl, {
        scroll: false,
      });
    },
    [router]
  );

  // Update filters with auto-apply to URL (for quick filters)
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>, autoApply = false) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSearchFilters.ts:155',message:'updateFilters called',data:{newFilters,autoApply},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        if (autoApply && typeof window !== "undefined" && window.location.pathname === "/buscar") {
          updateURL(newFilters);
        }
        return updated;
      });
    },
    [updateURL]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const cleared: SearchFilters = {
      q: filters.q, // Keep search query
    };
    setFilters(cleared);
    updateURL(cleared);
  }, [filters.q, updateURL]);

  // Count active filters
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

  return {
    filters,
    updateFilters,
    updateURL,
    clearFilters,
    activeFiltersCount,
  };
}
