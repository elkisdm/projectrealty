"use client";

import { useState, useMemo, memo, useCallback, useEffect } from "react";
import { MobileFilterSheet } from "@/components/mobile/MobileFilterSheet";
import { ToggleRow } from "./ToggleRow";
import { StickyCTA } from "./StickyCTA";
import { NumberInput } from "@/components/ui/NumberInput";
import { Car, Package, Heart } from "lucide-react";
import type { FilterBottomSheetProps, SearchFilters } from "@/types/search";

/**
 * FilterBottomSheet component
 * Bottom sheet with advanced filters and sticky CTA
 */
export const FilterBottomSheet = memo(function FilterBottomSheet({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  resultsCount,
  isLoading = false,
}: FilterBottomSheetProps) {
  const [pendingFilters, setPendingFilters] = useState<SearchFilters>(filters);

  // Update pending filters when sheet opens or filters change externally
  useEffect(() => {
    if (isOpen) {
      setPendingFilters(filters);
    }
  }, [isOpen, filters]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: unknown) => {
    setPendingFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleApply = useCallback(() => {
    onFiltersChange(pendingFilters);
    onClose();
  }, [pendingFilters, onFiltersChange, onClose]);

  const handleClear = useCallback(() => {
    const clearedFilters: SearchFilters = {
      q: filters.q, // Keep search query
      estacionamiento: undefined,
      bodega: undefined,
      mascotas: undefined,
      precioMin: undefined,
      precioMax: undefined,
    };
    setPendingFilters(clearedFilters);
  }, [filters.q]);

  // Count active filters in sheet (excluding comuna and dormitorios which are in quick filters)
  const activeSheetFiltersCount = useMemo(() => {
    let count = 0;
    if (pendingFilters.estacionamiento !== undefined) count++;
    if (pendingFilters.bodega !== undefined) count++;
    if (pendingFilters.mascotas !== undefined) count++;
    if (pendingFilters.precioMin !== undefined) count++;
    if (pendingFilters.precioMax !== undefined) count++;
    return count;
  }, [pendingFilters]);

  return (
    <MobileFilterSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros"
      maxHeight="85vh"
    >
      <div className="space-y-6 pb-24">
        {/* Estacionamiento */}
        <ToggleRow
          label="Estacionamiento"
          value={pendingFilters.estacionamiento ?? null}
          onChange={(value) => handleFilterChange("estacionamiento", value ?? undefined)}
          icon={<Car className="w-5 h-5" />}
        />

        {/* Bodega */}
        <ToggleRow
          label="Bodega"
          value={pendingFilters.bodega ?? null}
          onChange={(value) => handleFilterChange("bodega", value ?? undefined)}
          icon={<Package className="w-5 h-5" />}
        />

        {/* Mascotas */}
        <ToggleRow
          label="Acepta mascotas"
          value={pendingFilters.mascotas ?? null}
          onChange={(value) => handleFilterChange("mascotas", value ?? undefined)}
          icon={<Heart className="w-5 h-5" />}
        />

        {/* Precio Range */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-text">Precio</label>
          <div className="flex items-center gap-3">
            <NumberInput
              aria-label="Precio mínimo"
              value={pendingFilters.precioMin ?? null}
              onChange={(val) => handleFilterChange("precioMin", val ?? undefined)}
              placeholder="Mín $"
              min={0}
              step={100000}
              className="flex-1"
            />
            <span className="text-subtext font-medium flex-shrink-0">-</span>
            <NumberInput
              aria-label="Precio máximo"
              value={pendingFilters.precioMax ?? null}
              onChange={(val) => handleFilterChange("precioMax", val ?? undefined)}
              placeholder="Máx $"
              min={0}
              step={100000}
              className="flex-1"
            />
          </div>
        </div>

        {/* Clear button */}
        {activeSheetFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="
              w-full
              px-4 py-3
              rounded-xl
              border border-border dark:border-gray-700
              text-text
              hover:bg-soft dark:hover:bg-gray-800
              transition-colors duration-200
              font-medium
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B6CFF]
              min-h-[44px]
            "
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Sticky CTA */}
      <StickyCTA
        resultsCount={resultsCount}
        isLoading={isLoading}
        onClick={handleApply}
      />
    </MobileFilterSheet>
  );
});
