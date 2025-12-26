import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Building } from '../../types';
import { BuildingsStore, BuildingFilters, SortOption } from '../../types/buildings';

// Estado inicial
const initialState = {
  buildings: [],
  filteredBuildings: [],
  loading: false,
  error: null,
  filters: {} as BuildingFilters,
  sort: 'price-asc' as SortOption,
  page: 1,
  pageSize: 12,
  totalPages: 1,
  totalCount: 0,
  paginationMode: 'traditional' as 'traditional' | 'infinite',
  infinitePages: [] as Building[][],
  // Nuevos campos para integración con React Query
  useReactQuery: true,
  queryKey: null as string | null,
};

// Store de buildings con Zustand
export const useBuildingsStore = create<BuildingsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Acciones de datos
      setBuildings: (buildings: Building[]) => {
        set({ buildings, filteredBuildings: buildings }, false, 'setBuildings');
      },

      setFilteredBuildings: (filteredBuildings: Building[]) => {
        set({ filteredBuildings }, false, 'setFilteredBuildings');
      },

      // Acciones de estado
      setLoading: (loading: boolean) => {
        set({ loading }, false, 'setLoading');
      },

      setError: (error: string | null) => {
        set({ error }, false, 'setError');
      },

      // Acciones de filtros y ordenamiento
      setFilters: (newFilters: Partial<BuildingFilters>) => {
        const currentFilters = get().filters;
        const filters = { ...currentFilters, ...newFilters };
        set({ filters, page: 1 }, false, 'setFilters'); // Reset page when filters change
      },

      setSort: (sort: SortOption) => {
        set({ sort }, false, 'setSort');
      },

      clearFilters: () => {
        set({ filters: {}, page: 1 }, false, 'clearFilters'); // Reset page when clearing filters
      },

      // Acciones de paginación tradicional
      setPage: (page: number) => {
        set({ page }, false, 'setPage');
      },

      setPageSize: (pageSize: number) => {
        set({ pageSize, page: 1 }, false, 'setPageSize'); // Reset page when changing page size
      },

      setTotalPages: (totalPages: number) => {
        set({ totalPages }, false, 'setTotalPages');
      },

      setTotalCount: (totalCount: number) => {
        set({ totalCount }, false, 'setTotalCount');
      },

      // Acciones de paginación infinita
      setPaginationMode: (paginationMode: 'traditional' | 'infinite') => {
        set({ paginationMode }, false, 'setPaginationMode');
      },

      addInfinitePage: (buildings: Building[]) => {
        const state = get();
        const newInfinitePages = [...state.infinitePages, buildings];
        set({ infinitePages: newInfinitePages }, false, 'addInfinitePage');
      },

      clearInfinitePages: () => {
        set({ infinitePages: [] }, false, 'clearInfinitePages');
      },

      // Nuevas acciones para integración con React Query
      setUseReactQuery: (useReactQuery: boolean) => {
        set({ useReactQuery }, false, 'setUseReactQuery');
      },

      setQueryKey: (queryKey: string | null) => {
        set({ queryKey }, false, 'setQueryKey');
      },

      // Sincronizar datos de React Query
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
      }) => {
        set({
          buildings: data.buildings,
          filteredBuildings: data.buildings,
          page: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalCount: data.pagination.totalCount,
          pageSize: data.pagination.limit,
        }, false, 'syncFromReactQuery');
      },

      // Utilidades
      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    {
      name: 'buildings-store',
    }
  )
);

// Selectores útiles
export const useBuildings = () => useBuildingsStore((state) => state.buildings);
export const useFilteredBuildings = () => useBuildingsStore((state) => state.filteredBuildings);
export const useBuildingsLoading = () => useBuildingsStore((state) => state.loading);
export const useBuildingsError = () => useBuildingsStore((state) => state.error);
export const useBuildingsFilters = () => useBuildingsStore((state) => state.filters);
export const useBuildingsSort = () => useBuildingsStore((state) => state.sort);

// Selectores de paginación
export const useBuildingsPagination = () => useBuildingsStore((state) => ({
  page: state.page,
  pageSize: state.pageSize,
  totalPages: state.totalPages,
  totalCount: state.totalCount,
  paginationMode: state.paginationMode,
}));

export const useBuildingsInfinitePages = () => useBuildingsStore((state) => state.infinitePages);

// Nuevos selectores para React Query
export const useBuildingsReactQuery = () => useBuildingsStore((state) => ({
  useReactQuery: state.useReactQuery,
  queryKey: state.queryKey,
}));


