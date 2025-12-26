import { Building } from '../schemas/models';

// Tipos para filtros
export interface BuildingFilters {
  comuna?: string;
  minPrice?: number;
  maxPrice?: number;
  minM2?: number;
  maxM2?: number;
  amenities?: string[];
  tipologia?: string;
}

// Tipos para ordenamiento
export type SortOption = 'price-asc' | 'price-desc' | 'm2-asc' | 'm2-desc' | 'name-asc' | 'name-desc';

// Estado del store
export interface BuildingsState {
  // Datos
  buildings: Building[];
  filteredBuildings: Building[];
  
  // Estado de carga
  loading: boolean;
  error: string | null;
  
  // Filtros y ordenamiento
  filters: BuildingFilters;
  sort: SortOption;
  
  // Paginación
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  paginationMode: 'traditional' | 'infinite';
  infinitePages: Building[][];
  
  // Integración con React Query
  useReactQuery: boolean;
  queryKey: string | null;
}

// Acciones del store
export interface BuildingsActions {
  // Datos
  setBuildings: (buildings: Building[]) => void;
  setFilteredBuildings: (buildings: Building[]) => void;
  
  // Estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filtros y ordenamiento
  setFilters: (filters: Partial<BuildingFilters>) => void;
  setSort: (sort: SortOption) => void;
  clearFilters: () => void;
  
  // Paginación tradicional
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalPages: (totalPages: number) => void;
  setTotalCount: (totalCount: number) => void;
  
  // Paginación infinita
  setPaginationMode: (mode: 'traditional' | 'infinite') => void;
  addInfinitePage: (buildings: Building[]) => void;
  clearInfinitePages: () => void;
  
  // Integración con React Query
  setUseReactQuery: (useReactQuery: boolean) => void;
  setQueryKey: (queryKey: string | null) => void;
  syncFromReactQuery: (data: {
    buildings: Building[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  }) => void;
  
  // Utilidades
  reset: () => void;
}

// Store completo
export type BuildingsStore = BuildingsState & BuildingsActions;
