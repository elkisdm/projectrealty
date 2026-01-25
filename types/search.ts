/**
 * Search and Filter Types
 * Centralized types for search functionality
 */

export interface SearchFilters {
  q?: string;
  comuna?: string | string[];
  dormitorios?: 'Estudio' | '1' | '2' | '3' | Array<'Estudio' | '1' | '2' | '3'>;
  estacionamiento?: boolean;
  bodega?: boolean;
  mascotas?: boolean;
  precioMin?: number;
  precioMax?: number;
  // New Hero Cocktail fields for progressive disclosure
  beds?: string | string[];
  priceMax?: string;
  moveIn?: string;
}

export interface SearchBarContainerProps {
  variant?: 'hero' | 'sticky' | 'inline';
  initialQuery?: string;
  initialFilters?: Partial<SearchFilters>;
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
  resultsCount?: number;
  isLoading?: boolean;
}

export interface QuickFiltersRowProps {
  selectedComuna?: string | string[];
  selectedDormitorios?: string | string[];
  onComunaChange: (value: string | string[] | undefined) => void;
  onDormitoriosChange: (value: string | string[] | undefined) => void;
  onMoreFiltersClick: () => void;
  activeFiltersCount: number;
  className?: string;
}

export interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  resultsCount?: number;
  isLoading?: boolean;
  // New Hero Cocktail LEVEL 2 fields
  beds?: string | string[];
  priceMax?: string;
  moveIn?: string;
  onBedsChange?: (value: string | string[] | undefined) => void;
  onPriceMaxChange?: (value: string | undefined) => void;
  onMoveInChange?: (value: string | undefined) => void;
}

export interface ToggleRowProps {
  label: string;
  value: boolean | null; // null = no filter, true/false = filter
  onChange: (value: boolean | null) => void;
  icon?: React.ReactNode;
  className?: string;
}

export interface StickyCTAProps {
  resultsCount?: number;
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
  /** Custom label for the button (overrides default text) */
  label?: string;
}
