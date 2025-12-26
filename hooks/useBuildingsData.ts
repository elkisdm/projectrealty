import { useMemo, useState, useCallback } from 'react';
import { Building } from '../types';
import { BuildingFilters, SortOption } from '../types/buildings';
import { useFetchBuildings, type FilterValues } from './useFetchBuildings';

// Función para convertir BuildingFilters a FilterValues
const convertFiltersToFilterValues = (filters: BuildingFilters): FilterValues => {
  return {
    comuna: filters.comuna || 'Todas',
    tipologia: filters.tipologia || 'Todas',
    minPrice: filters.minPrice ?? null,
    maxPrice: filters.maxPrice ?? null,
  };
};

// Función para convertir SortOption a string
const convertSortToAPI = (sort: SortOption): string => {
  switch (sort) {
    case 'price-asc': return 'price-asc';
    case 'price-desc': return 'price-desc';
    case 'm2-asc': return 'm2-asc';
    case 'm2-desc': return 'm2-desc';
    case 'name-asc': return 'name-asc';
    case 'name-desc': return 'name-desc';
    default: return 'default';
  }
};

// Función para convertir BuildingSummary a Building (simplificado)
const convertToBuilding = (summary: any): Building => {
  return {
    id: summary.id,
    slug: summary.slug,
    name: summary.name,
    comuna: summary.comuna,
    address: summary.address,
    coverImage: summary.coverImage || summary.gallery?.[0],
    gallery: summary.gallery || [],
    units: summary.typologySummary?.map((t: any, idx: number) => ({
      id: `${summary.id}-unit-${idx}`,
      tipologia: t.key,
      price: t.minPrice || summary.precioDesde,
      m2: t.minM2 || 40,
      estacionamiento: false,
      bodega: false,
      disponible: true,
    })) || [],
    amenities: summary.amenities || [],
    badges: summary.badges || [],
  };
};

// Hook principal para manejar datos de buildings usando React Query
export function useBuildingsData() {
  const [filters, setFiltersState] = useState<BuildingFilters>({});
  const [sort, setSortState] = useState<SortOption>('price-asc');

  // Convertir filtros para usar con useFetchBuildings
  const filterValues = useMemo(() => convertFiltersToFilterValues(filters), [filters]);
  const sortString = useMemo(() => convertSortToAPI(sort), [sort]);

  // Usar React Query para obtener datos
  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
  } = useFetchBuildings({
    filters: filterValues,
    sort: sortString,
  });

  // Convertir BuildingSummary[] a Building[]
  const buildings = useMemo(() => {
    if (!queryData?.buildings) return [];
    return queryData.buildings.map(convertToBuilding);
  }, [queryData?.buildings]);

  // Los filteredBuildings son los mismos que buildings (filtrado se hace en el servidor)
  const filteredBuildings = useMemo(() => buildings, [buildings]);

  // Estado de carga y error
  const loading = isLoading;
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Error desconocido') : null;

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<BuildingFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Función para actualizar ordenamiento
  const updateSort = useCallback((newSort: SortOption) => {
    setSortState(newSort);
  }, []);

  // Función para limpiar filtros
  const clearFiltersAction = useCallback(() => {
    setFiltersState({});
  }, []);

  // Función para recargar datos
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Función para resetear todo
  const reset = useCallback(() => {
    setFiltersState({});
    setSortState('price-asc');
    refetch();
  }, [refetch]);

  // Función para fetch (mantener compatibilidad, pero usa React Query internamente)
  const fetchBuildings = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    // Datos
    buildings,
    filteredBuildings,
    
    // Estado
    loading,
    error,
    
    // Filtros y ordenamiento
    filters,
    sort,
    
    // Acciones
    fetchBuildings,
    updateFilters,
    updateSort,
    clearFilters: clearFiltersAction,
    refresh,
    
    // Utilidades
    reset,
  };
}

// Hook simplificado para usar solo los datos filtrados
export function useFilteredBuildings() {
  const { filteredBuildings, loading, error } = useBuildingsData();
  return { buildings: filteredBuildings, loading, error };
}

// Hook para usar solo los filtros
export function useBuildingsFilters() {
  const { filters, updateFilters, clearFilters } = useBuildingsData();
  return { filters, updateFilters, clearFilters };
}

// Hook para usar solo el ordenamiento
export function useBuildingsSort() {
  const { sort, updateSort } = useBuildingsData();
  return { sort, updateSort };
}
