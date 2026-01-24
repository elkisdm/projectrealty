"use client";

import { memo, useCallback } from "react";
import { X } from "lucide-react";
import { SearchPills } from "@/components/marketing/SearchPills";
import type { QuickFiltersRowProps } from "@/types/search";

const COMUNAS_PRINCIPALES = ['Las Condes', 'Ñuñoa', 'Providencia', 'Santiago', 'Macul', 'La Florida'];
const DORMITORIOS_OPTIONS = ['Estudio', '1', '2', '3'] as const;

/**
 * QuickFiltersRow component - Mobile-first filter row
 * Shows Comuna, Dormitorios, and "Más filtros" button in a single row
 */
export const QuickFiltersRow = memo(function QuickFiltersRow({
  selectedComuna,
  selectedDormitorios,
  onComunaChange,
  onDormitoriosChange,
  onMoreFiltersClick,
  activeFiltersCount,
  className = "",
}: QuickFiltersRowProps) {
  const hasActiveFilters = activeFiltersCount > 0;

  const handleClear = useCallback(() => {
    onComunaChange(undefined);
    onDormitoriosChange(undefined);
  }, [onComunaChange, onDormitoriosChange]);

  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 ${className}`}>
      {/* Comuna Filter - Compact pill */}
      <div className="flex-shrink-0" role="group" aria-label="Filtro de comuna">
        <SearchPills
          options={COMUNAS_PRINCIPALES.slice(0, 3)} // Show only first 3 on mobile
          selected={selectedComuna}
          onSelect={onComunaChange}
          multiple={true}
          className="flex-nowrap"
          label="" // Hide label, aria-label on parent
        />
      </div>

      {/* Dormitorios Filter - Compact pill */}
      <div className="flex-shrink-0" role="group" aria-label="Filtro de dormitorios">
        <SearchPills
          options={[...DORMITORIOS_OPTIONS]}
          selected={selectedDormitorios}
          onSelect={onDormitoriosChange}
          multiple={true}
          className="flex-nowrap"
          label="" // Hide label, aria-label on parent
        />
      </div>

      {/* Más filtros button */}
      <button
        type="button"
        onClick={onMoreFiltersClick}
        className="
          flex-shrink-0
          inline-flex items-center gap-2
          px-4 py-2
          rounded-full
          text-sm font-medium
          bg-gray-100 dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          text-text
          hover:bg-gray-200 dark:hover:bg-gray-700
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B6CFF]
          min-h-[44px]
        "
        aria-label="Más filtros"
      >
        <span>Más filtros</span>
        {hasActiveFilters && (
          <span className="bg-[#8B6CFF] text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Clear filters button - only show if filters are active */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="
            flex-shrink-0
            p-2
            rounded-full
            text-gray-600 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B6CFF]
            min-h-[44px] min-w-[44px]
            flex items-center justify-center
          "
          aria-label="Limpiar filtros rápidos"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});
