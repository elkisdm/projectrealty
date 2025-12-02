import { QueryClient } from "@tanstack/react-query";
import type { BuildingFilters } from "../types/buildings";

// Configuración optimizada para paginación y cache
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos para datos estables
      gcTime: 10 * 60 * 1000, // 10 minutos en cache
      retry: (failureCount: number, error: unknown) => {
        // No reintentar errores 4xx
        if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always' as const,
    },
    mutations: {
      retry: 0,
    },
  },
};

// Query keys estandarizadas para cache consistente
export const queryKeys = {
  // Buildings básicos
  buildings: {
    all: ['buildings'] as const,
    lists: () => [...queryKeys.buildings.all, 'list'] as const,
    list: (filters: BuildingFilters) => [...queryKeys.buildings.lists(), { filters }] as const,
    details: () => [...queryKeys.buildings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.buildings.details(), id] as const,
  },
  
  // Buildings paginados
  buildingsPaginated: {
    all: ['buildings', 'paginated'] as const,
    lists: () => [...queryKeys.buildingsPaginated.all, 'list'] as const,
    list: (filters: BuildingFilters, page: number, limit: number) => 
      [...queryKeys.buildingsPaginated.lists(), { filters, page, limit }] as const,
    infinite: (filters: BuildingFilters) => 
      [...queryKeys.buildingsPaginated.all, 'infinite', { filters }] as const,
  },
  
  // Admin queries
  admin: {
    all: ['admin'] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    buildings: (page: number, limit: number, search?: string, comuna?: string) =>
      [...queryKeys.admin.all, 'buildings', { page, limit, search, comuna }] as const,
    units: (page: number, limit: number, filters?: Record<string, unknown>) =>
      [...queryKeys.admin.all, 'units', { page, limit, filters }] as const,
    completeness: () => [...queryKeys.admin.all, 'completeness'] as const,
  },
} as const;

// Tipos para respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

// Función para crear un QueryClient con configuración optimizada
export function createOptimizedQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}

// Utilidades para invalidación de cache
export const invalidateQueries = {
  buildings: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all });
  },
  buildingsPaginated: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.buildingsPaginated.all });
  },
  allBuildings: (queryClient: QueryClient) => {
    return Promise.all([
      invalidateQueries.buildings(queryClient),
      invalidateQueries.buildingsPaginated(queryClient),
    ]);
  },
  admin: {
    stats: (queryClient: QueryClient) => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
    buildings: (queryClient: QueryClient) => {
      return queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.all, 'buildings'] });
    },
    units: (queryClient: QueryClient) => {
      return queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.all, 'units'] });
    },
    all: (queryClient: QueryClient) => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  },
} as const;

// Configuración específica para infinite queries
export const infiniteQueryConfig = {
  getNextPageParam: (lastPage: unknown) => {
    const { pagination } = lastPage as any;
    return pagination.hasNextPage ? pagination.currentPage + 1 : undefined;
  },
  getPreviousPageParam: (firstPage: unknown) => {
    const { pagination } = firstPage as any;
    return pagination.hasPrevPage ? pagination.currentPage - 1 : undefined;
  },
  initialPageParam: 1,
  maxPages: 10, // Límite para evitar memory leaks
} as const;
