/**
 * Filters Module - Advanced Search and Filtering System
 * 
 * This module provides a complete advanced filtering solution with:
 * - Fuzzy search algorithm
 * - Advanced filters hook with URL sync
 * - Modern UI components with accessibility
 * - Backward compatibility with existing systems
 */

// Core algorithm
export { searchBuildings, getSearchSuggestions, highlightText, createDebouncedSearch } from '../../lib/search';
export type { SearchOptions, SearchResult } from '../../lib/search';

// Advanced filters hook
export { 
  useAdvancedFilters
} from '../../hooks/useAdvancedFilters';
export type { 
  AdvancedFilterValues, 
  UseAdvancedFiltersParams, 
  UseAdvancedFiltersReturn,
  FilterChip,
  FilterAnalytics 
} from '../../hooks/useAdvancedFilters';

// UI Components
export { SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';

export { FilterChips } from './FilterChips';

export { AdvancedFilterBar } from './AdvancedFilterBar';
export type { AdvancedFilterBarProps } from './AdvancedFilterBar';

// Legacy compatibility
export { FilterBar } from './FilterBar';
export { SortSelect } from './SortSelect';
export type { FilterValues } from './FilterBar';

/**
 * Integration Example:
 * 
 * ```tsx
 * import { AdvancedFilterBar, useAdvancedFilters } from '@/components/filters';
 * 
 * function PropertyListPage() {
 *   const [buildings, setBuildings] = useState<Building[]>([]);
 *   const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
 *   const [sort, setSort] = useState('relevance');
 * 
 *   return (
 *     <div>
 *       <AdvancedFilterBar
 *         buildings={buildings}
 *         onFiltersChange={setFilteredBuildings}
 *         onSortChange={setSort}
 *         sort={sort}
 *         urlSync={true}
 *         showSearchSuggestions={true}
 *       />
 *       
 *       <ResultsGrid buildings={filteredBuildings} />
 *     </div>
 *   );
 * }
 * ```
 */
