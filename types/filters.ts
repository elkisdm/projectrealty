/**
 * Filter Types
 * Centralized types for all filter-related functionality
 */

export interface FilterValues {
  comuna: string | string[]; // Soporta string simple o array para multiselección
  tipologia: string; // Mantener para compatibilidad
  dormitorios?: string | string[]; // "Estudio", "1", "2", "3" - soporta multiselección
  minPrice: number | null;
  maxPrice: number | null;
  estacionamiento?: boolean | null;
  bodega?: boolean | null;
  mascotas?: boolean | null;
}

export interface AdvancedFilterValues extends FilterValues {
  // Search functionality
  query: string;
  
  // Advanced filters
  amenities: string[];
  minM2: number | null;
  maxM2: number | null;
  estacionamiento: boolean | null; // null = no filter, true/false = filter
  bodega: boolean | null;
  amoblado: boolean | null;
  petFriendly: boolean | null;
  
  // Unit filters
  bedrooms: number | null;
  bathrooms: number | null;
  
  // Promotion filters
  hasPromotions: boolean | null;
  serviceLevel: 'pro' | 'standard' | null;
  
  // Location filters
  nearTransit: boolean | null;
}

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface FilterAnalytics {
  totalFilters: number;
  searchQuery: string | null;
  filtersUsed: string[];
  resultCount: number;
}
