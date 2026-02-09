"use client";

import { useState, useMemo, memo, useCallback, useEffect } from "react";
import { MobileFilterSheet } from "@/components/mobile/MobileFilterSheet";
import { ToggleRow } from "./ToggleRow";
import { StickyCTA } from "./StickyCTA";
import { NumberInput } from "@/components/ui/NumberInput";
import { SearchPills } from "@/components/marketing/SearchPills";
import { Car, Package, Heart, ChevronDown } from "lucide-react";
import type { FilterBottomSheetProps, SearchFilters } from "@/types/search";

const BEDS_OPTIONS = ["Studio", "1D", "2D", "3D+"];
const BEDS_VALUE_MAP: Record<string, string> = {
  "Studio": "studio",
  "1D": "1",
  "2D": "2",
  "3D+": "3plus",
};
const BEDS_DISPLAY_MAP: Record<string, string> = {
  "studio": "Studio",
  "1": "1D",
  "2": "2D",
  "3plus": "3D+",
};

const PRICE_OPTIONS = [
  { value: "", label: "Sin límite" },
  { value: "400000", label: "$400.000" },
  { value: "500000", label: "$500.000" },
  { value: "650000", label: "$650.000" },
  { value: "800000", label: "$800.000" },
  { value: "1000000", label: "$1.000.000" },
  { value: "1500000", label: "$1.500.000" },
  { value: "2000000", label: "$2.000.000" },
];

const TIPOLOGIA_OPTIONS = ["Studio", "1D1B", "2D1B", "2D2B", "3D2B"];
const DORMITORIOS_MIN_OPTIONS = ["1+", "2+", "3+", "4+"];
const RANGE_MIN = 0;
const RANGE_MAX = 3000000;
const RANGE_STEP = 50000;

const MOVE_IN_OPTIONS = ["Ahora", "30 días", "60 días"];
const MOVE_IN_VALUE_MAP: Record<string, string> = {
  "Ahora": "now",
  "30 días": "30d",
  "60 días": "60d",
};
const MOVE_IN_DISPLAY_MAP: Record<string, string> = {
  "now": "Ahora",
  "30d": "30 días",
  "60d": "60 días",
};

/**
 * FilterBottomSheet component
 * Bottom sheet with LEVEL 2 filters for progressive disclosure
 * Contains: Tipología, Presupuesto, Mudanza, Pet friendly, Estacionamiento, Bodega
 */
export const FilterBottomSheet = memo(function FilterBottomSheet({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  resultsCount,
  isLoading = false,
  // New LEVEL 2 fields
  beds,
  priceMax,
  moveIn,
  onBedsChange,
  onPriceMaxChange,
  onMoveInChange,
  triggerRef,
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
      operation: filters.operation ?? "rent",
      estacionamiento: undefined,
      bodega: undefined,
      mascotas: undefined,
      precioMin: undefined,
      precioMax: undefined,
      dormitoriosMin: undefined,
      tipos: undefined,
      beds: undefined,
      priceMax: undefined,
      moveIn: undefined,
    };
    setPendingFilters(clearedFilters);
    // Also clear the new fields via callbacks
    onBedsChange?.(undefined);
    onPriceMaxChange?.(undefined);
    onMoveInChange?.(undefined);
  }, [filters.operation, filters.q, onBedsChange, onMoveInChange, onPriceMaxChange]);

  // Convert beds value to display format
  const bedsDisplay = useMemo(() => {
    if (!beds) return [];
    const values = Array.isArray(beds) ? beds : [beds];
    return values.map((b) => BEDS_DISPLAY_MAP[b] || b);
  }, [beds]);

  // Convert moveIn value to display format
  const moveInDisplay = useMemo(() => {
    if (!moveIn) return undefined;
    return MOVE_IN_DISPLAY_MAP[moveIn] || moveIn;
  }, [moveIn]);

  // Handle beds change
  const handleBedsChangeInternal = useCallback((value: string | string[] | undefined) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      onBedsChange?.(undefined);
      return;
    }
    const values = Array.isArray(value) ? value : [value];
    const schemaValues = values.map((v) => BEDS_VALUE_MAP[v] || v);
    onBedsChange?.(schemaValues.length > 0 ? schemaValues : undefined);
  }, [onBedsChange]);

  // Handle moveIn change
  const handleMoveInChangeInternal = useCallback((value: string | string[] | undefined) => {
    if (!value) {
      onMoveInChange?.(undefined);
      return;
    }
    const selected = Array.isArray(value) ? value[0] : value;
    onMoveInChange?.(MOVE_IN_VALUE_MAP[selected] || undefined);
  }, [onMoveInChange]);

  // Count active filters in sheet
  const activeSheetFiltersCount = useMemo(() => {
    let count = 0;
    if (pendingFilters.estacionamiento !== undefined) count++;
    if (pendingFilters.bodega !== undefined) count++;
    if (pendingFilters.mascotas !== undefined) count++;
    if (pendingFilters.precioMin !== undefined) count++;
    if (pendingFilters.precioMax !== undefined) count++;
    if (typeof pendingFilters.dormitoriosMin === "number") count++;
    if (pendingFilters.tipos) count += Array.isArray(pendingFilters.tipos) ? pendingFilters.tipos.length : 1;
    // Count new LEVEL 2 fields
    if (beds && (Array.isArray(beds) ? beds.length > 0 : true)) count++;
    if (priceMax) count++;
    if (moveIn) count++;
    return count;
  }, [pendingFilters, beds, priceMax, moveIn]);

  const selectedDormitoriosMin =
    typeof pendingFilters.dormitoriosMin === "number"
      ? `${pendingFilters.dormitoriosMin}+`
      : undefined;
  const selectedTipos = pendingFilters.tipos
    ? Array.isArray(pendingFilters.tipos)
      ? pendingFilters.tipos
      : [pendingFilters.tipos]
    : [];
  const sliderMin = pendingFilters.precioMin ?? RANGE_MIN;
  const sliderMax = pendingFilters.precioMax ?? RANGE_MAX;

  return (
    <MobileFilterSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Ajusta tu búsqueda"
      maxHeight="85vh"
      triggerRef={triggerRef}
    >
      <div className="space-y-6 pb-24">
        {/* Tipología (beds) - NEW */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-text">Tipología</label>
          <SearchPills
            options={BEDS_OPTIONS}
            selected={bedsDisplay}
            onSelect={handleBedsChangeInternal}
            multiple={true}
          />
        </div>

        {/* Tipos de inmueble (mapeado desde tipologías) */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-text">Tipos de inmueble</label>
          <SearchPills
            options={TIPOLOGIA_OPTIONS}
            selected={selectedTipos}
            onSelect={(value) => handleFilterChange("tipos", value)}
            multiple={true}
          />
        </div>

        {/* Dormitorios mínimos */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-text">Dormitorios mínimos</label>
          <SearchPills
            options={DORMITORIOS_MIN_OPTIONS}
            selected={selectedDormitoriosMin}
            onSelect={(value) => {
              if (!value || Array.isArray(value)) {
                handleFilterChange("dormitoriosMin", undefined);
                return;
              }
              const parsed = Number(value.replace("+", ""));
              handleFilterChange("dormitoriosMin", Number.isFinite(parsed) ? parsed : undefined);
            }}
            multiple={false}
          />
        </div>

        {/* Presupuesto máximo - NEW */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-text">Presupuesto máximo</label>
          <div className="relative">
            <select
              value={priceMax || ""}
              onChange={(e) => onPriceMaxChange?.(e.target.value || undefined)}
              className="w-full h-[52px] px-4 pr-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
              aria-label="Presupuesto máximo"
            >
              {PRICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Mudanza - NEW */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-text">Mudanza</label>
          <SearchPills
            options={MOVE_IN_OPTIONS}
            selected={moveInDisplay}
            onSelect={handleMoveInChangeInternal}
            multiple={false}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2" />

        {/* Mascotas */}
        <ToggleRow
          label="Acepta mascotas"
          value={pendingFilters.mascotas ?? null}
          onChange={(value) => handleFilterChange("mascotas", value ?? undefined)}
          icon={<Heart className="w-5 h-5" />}
        />

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

        {/* Precio Range (detailed) */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-text">Rango de precio</label>
          <div className="space-y-2 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between text-xs text-subtext">
              <span>{RANGE_MIN.toLocaleString("es-CL")}</span>
              <span>{RANGE_MAX.toLocaleString("es-CL")}</span>
            </div>
            <input
              type="range"
              min={RANGE_MIN}
              max={RANGE_MAX}
              step={RANGE_STEP}
              value={Math.min(sliderMin, sliderMax)}
              onChange={(event) => {
                const value = Number(event.target.value);
                handleFilterChange("precioMin", Math.min(value, sliderMax));
              }}
              className="w-full accent-primary"
              aria-label="Slider precio mínimo"
            />
            <input
              type="range"
              min={RANGE_MIN}
              max={RANGE_MAX}
              step={RANGE_STEP}
              value={Math.max(sliderMin, sliderMax)}
              onChange={(event) => {
                const value = Number(event.target.value);
                handleFilterChange("precioMax", Math.max(value, sliderMin));
              }}
              className="w-full accent-primary"
              aria-label="Slider precio máximo"
            />
          </div>
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
        label="Aplicar filtros"
      />
    </MobileFilterSheet>
  );
});
