import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useEffect } from "react";
import type { BuildingFilters } from "../types/buildings";
import { queryKeys, type PaginatedResponse } from "../lib/react-query";
import { useBuildingsStore } from "@lib/stores/buildingsStore";

// Tipos para el hook
interface BuildingListItem {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  gallery: string[];
  coverImage: string;
  badges: string[];
  serviceLevel: string;
  precioDesde: number;
  precioRango?: { min: number; max: number };
  hasAvailability: boolean;
  typologySummary?: Array<{
    key: string;
    label: string;
    count: number;
    minPrice?: number;
    minM2?: number;
  }>;
}

interface UseBuildingsPaginationOptions {
  filters?: BuildingFilters;
  page?: number;
  limit?: number;
  enabled?: boolean;
  useStore?: boolean; // Nuevo: integrar con Zustand store
}

interface UseBuildingsPaginationReturn {
  // Datos
  buildings: BuildingListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  } | null;
  
  // Estados
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  isStale: boolean;
  
  // Acciones
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refetch: () => void;
  invalidate: () => void;
}

// Función para fetch paginado
async function fetchPaginatedBuildings(
  filters: BuildingFilters, 
  page: number, 
  limit: number
): Promise<PaginatedResponse<BuildingListItem>> {
  const params = new URLSearchParams();
  
  // Agregar filtros
  if (filters.comuna) params.append('comuna', filters.comuna);
  if (filters.tipologia) params.append('tipologia', filters.tipologia);
  if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  
  // Agregar paginación
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const url = `/api/buildings/paginated?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    data: data.buildings || [],
    pagination: data.pagination || {
      currentPage: page,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit,
    },
  };
}

/**
 * Hook para paginación normal con React Query
 */
export function useBuildingsPagination({
  filters = {},
  page = 1,
  limit = 12,
  enabled = true,
  useStore = true, // Por defecto integrar con store
}: UseBuildingsPaginationOptions = {}): UseBuildingsPaginationReturn {
  const queryClient = useQueryClient();
  
  // Integración con Zustand store
  const {
    setLoading,
    setError,
    syncFromReactQuery,
    setPage,
    // setFilters: _setFilters,
    // setTotalPages: _setTotalPages,
    // setTotalCount: _setTotalCount,
  } = useBuildingsStore();
  
  // Query con React Query
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isStale,
    refetch,
  } = useQuery({
    queryKey: queryKeys.buildingsPaginated.list(filters, page, limit),
    queryFn: () => fetchPaginatedBuildings(filters, page, limit),
    enabled,
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Sincronizar con Zustand store
  useEffect(() => {
    if (useStore && data) {
      setLoading(false);
      setError(null);
      // Convertir BuildingListItem a Building para el store
      const buildings = data.data.map(item => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        comuna: item.comuna,
        address: item.address,
        cover: item.coverImage,
        hero: item.gallery?.[0] || item.coverImage,
        gallery: item.gallery,
        units: [], // Placeholder - se puede expandir si es necesario
        amenities: [], // Placeholder - se puede expandir si es necesario
      }));
      
      syncFromReactQuery({
        buildings,
        pagination: data.pagination,
      });
    }
  }, [data, useStore, setLoading, setError, syncFromReactQuery]);
  
  // Sincronizar estados de carga
  useEffect(() => {
    if (useStore) {
      setLoading(isLoading);
      setError(isError ? error?.message || 'Error desconocido' : null);
    }
  }, [isLoading, isError, error, useStore, setLoading, setError]);
  
  // Memoizar resultados
  const buildings = useMemo(() => data?.data || [], [data?.data]);
  const pagination = useMemo(() => data?.pagination || null, [data?.pagination]);
  
  // Acciones de navegación
  const goToPage = useCallback((newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      if (useStore) {
        setPage(newPage);
      }
      // React Query manejará el cambio automáticamente cuando cambien las queryKey
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildingsPaginated.list(filters, newPage, limit)
      });
    }
  }, [queryClient, filters, limit, pagination, useStore, setPage]);
  
  const nextPage = useCallback(() => {
    if (pagination?.hasNextPage) {
      goToPage(pagination.currentPage + 1);
    }
  }, [goToPage, pagination]);
  
  const prevPage = useCallback(() => {
    if (pagination?.hasPrevPage) {
      goToPage(pagination.currentPage - 1);
    }
  }, [goToPage, pagination]);
  
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.buildingsPaginated.all
    });
  }, [queryClient]);
  
  return {
    // Datos
    buildings,
    pagination,
    
    // Estados
    isLoading,
    isError,
    error: error as Error | null,
    isFetching,
    isStale,
    
    // Acciones
    goToPage,
    nextPage,
    prevPage,
    refetch,
    invalidate,
  };
}

/**
 * Hook para infinite scroll con React Query
 */
export function useBuildingsInfinite({
  filters = {},
  limit = 12,
  enabled = true,
  useStore = true,
}: Omit<UseBuildingsPaginationOptions, 'page'> = {}) {
  const queryClient = useQueryClient();
  
  // Integración con Zustand store
  const {
    setLoading,
    setError,
    addInfinitePage,
    clearInfinitePages,
  } = useBuildingsStore();
  
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    isError,
    error,
    isFetching,
    isStale,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.buildingsPaginated.infinite(filters),
    queryFn: ({ pageParam = 1 }) => fetchPaginatedBuildings(filters, pageParam, limit),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage 
        ? lastPage.pagination.currentPage + 1 
        : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.pagination.hasPrevPage 
        ? firstPage.pagination.currentPage - 1 
        : undefined;
    },
    maxPages: 10, // Limite de páginas para evitar memory leaks
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  
  // Sincronizar con Zustand store
  useEffect(() => {
    if (useStore && data) {
      setLoading(false);
      setError(null);
      clearInfinitePages();
      data.pages.forEach(page => {
        // Convertir BuildingListItem a Building para el store
        const buildings = page.data.map(item => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          comuna: item.comuna,
          address: item.address,
          cover: item.coverImage,
          hero: item.gallery?.[0] || item.coverImage,
          gallery: item.gallery,
          units: [], // Placeholder
          amenities: [], // Placeholder
        }));
        addInfinitePage(buildings);
      });
    }
  }, [data, useStore, setLoading, setError, addInfinitePage, clearInfinitePages]);
  
  // Sincronizar estados de carga
  useEffect(() => {
    if (useStore) {
      setLoading(isLoading);
      setError(isError ? error?.message || 'Error desconocido' : null);
    }
  }, [isLoading, isError, error, useStore, setLoading, setError]);
  
  // Combinar todas las páginas
  const buildings = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data?.pages]);
  
  // Información de paginación combinada
  const pagination = useMemo(() => {
    if (!data?.pages.length) return null;
    
    const firstPage = data.pages[0];
    const lastPage = data.pages[data.pages.length - 1];
    
    return {
      currentPage: lastPage.pagination.currentPage,
      totalPages: firstPage.pagination.totalPages,
      totalCount: firstPage.pagination.totalCount,
      hasNextPage: Boolean(hasNextPage),
      hasPrevPage: Boolean(hasPreviousPage),
      limit: firstPage.pagination.limit,
      loadedPages: data.pages.length,
    };
  }, [data?.pages, hasNextPage, hasPreviousPage]);
  
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.buildingsPaginated.all
    });
  }, [queryClient]);
  
  return {
    // Datos
    buildings,
    pagination,
    
    // Estados
    isLoading,
    isError,
    error: error as Error | null,
    isFetching,
    isStale,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    hasPreviousPage,
    
    // Acciones
    fetchNextPage,
    fetchPreviousPage,
    refetch,
    invalidate,
  };
}
