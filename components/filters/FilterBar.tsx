"use client";
import { useState } from "react";
import { Filter, X, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SortSelect } from "./SortSelect";
import { SearchPills } from "@/components/marketing/SearchPills";
import { NumberInput } from "@/components/ui/NumberInput";
import { SearchInput } from "./SearchInput";
import { FilterDescription } from "./FilterDescription";
import { hasActiveFilters } from "@/lib/utils/filterDescription";
import type { FilterValues } from "../../types/filters";

// Re-export for backward compatibility
export type { FilterValues };

interface FilterBarProps {
  value: FilterValues;
  onChange: (filters: FilterValues) => void;
  onApply: () => void;
  onClear: () => void;
  sort: string;
  onSort: (sort: string) => void;
  isLoading?: boolean;
  useDormitorios?: boolean; // Si es true, usar pills de dormitorios en lugar de dropdown de tipología
  q?: string; // Búsqueda por texto
  onSearchChange?: (q: string) => void; // Callback para cambios en la búsqueda
}

export function FilterBar({
  value,
  onChange,
  onApply,
  onClear,
  sort,
  onSort,
  isLoading = false,
  useDormitorios = false, // Por defecto mantener tipología para compatibilidad
  q = "",
  onSearchChange,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const set = (patch: Partial<FilterValues>) => onChange({ ...value, ...patch });
  
  // Preparar filtros para FilterDescription
  const activeFiltersForDescription = {
    comuna: value.comuna !== "Todas" ? value.comuna : undefined,
    precioMin: value.minPrice !== null ? value.minPrice : undefined,
    precioMax: value.maxPrice !== null ? value.maxPrice : undefined,
    dormitorios: value.dormitorios,
    estacionamiento: value.estacionamiento === true ? true : undefined,
    bodega: value.bodega === true ? true : undefined,
    mascotas: value.mascotas === true ? true : undefined,
  };

  const comunas = ["Las Condes", "Ñuñoa", "Providencia", "Santiago", "Macul", "La Florida"];
  const tipologias = ["Todas", "Studio", "1D/1B", "2D/1B", "2D/2B"];
  const dormitoriosOptions = ["Estudio", "1", "2", "3"];
  
  // Normalizar valores para multiselección
  const comunasSelected = Array.isArray(value.comuna) 
    ? value.comuna 
    : value.comuna && value.comuna !== "Todas" 
      ? [value.comuna] 
      : [];
  
  const dormitoriosSelected = Array.isArray(value.dormitorios)
    ? value.dormitorios
    : value.dormitorios
      ? [value.dormitorios]
      : [];

  return (
    <div className="sticky top-0 z-30 backdrop-blur bg-white dark:bg-gray-900/95 ring-1 ring-gray-200 dark:ring-gray-700 rounded-2xl p-4 shadow-sm">
      {/* Barra de búsqueda */}
      {onSearchChange && (
        <div className="mb-4">
          <SearchInput
            value={q}
            onChange={onSearchChange}
            placeholder="Buscar por dirección, comuna, nombre de edificio..."
            className="w-full"
            autoFocus={false}
          />
        </div>
      )}
      
      {/* FilterDescription */}
      {hasActiveFilters(activeFiltersForDescription) && (
        <div className="mb-4">
          <FilterDescription
            filters={activeFiltersForDescription}
            onClear={onClear}
          />
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          aria-expanded={open}
          aria-controls="mobile-filters"
        >
          <Filter className="w-4 h-4" aria-hidden="true" />
          Filtros
        </button>
        <div className="ml-auto md:ml-0">
          <SortSelect value={sort} onChange={onSort} />
        </div>
        <button
          onClick={onClear}
          className="md:ml-auto inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          Limpiar
        </button>
      </div>

      {open && (
        <div
          id="mobile-filters"
          className="mt-4 space-y-4 md:hidden"
        >
          {/* Comunas con multiselección */}
          <SearchPills
            options={comunas}
            selected={comunasSelected}
            onSelect={(val) => {
              const newComunas = Array.isArray(val) ? val : val ? [val] : [];
              set({ comuna: newComunas.length > 0 ? newComunas : "Todas" });
            }}
            label="Comuna"
            multiple={true}
          />

          {/* Dormitorios con multiselección */}
          {useDormitorios && (
            <SearchPills
              options={dormitoriosOptions}
              selected={dormitoriosSelected}
              onSelect={(val) => set({ dormitorios: val })}
              label="Dormitorios"
              multiple={true}
            />
          )}

          {/* Estacionamiento */}
          <SearchPills
            options={["Sí", "No"]}
            selected={value.estacionamiento === true ? "Sí" : value.estacionamiento === false ? "No" : undefined}
            onSelect={(val) => {
              const boolValue = val === "Sí" ? true : val === "No" ? false : undefined;
              set({ estacionamiento: boolValue });
            }}
            label="Estacionamiento"
          />

          {/* Bodega */}
          <SearchPills
            options={["Sí", "No"]}
            selected={value.bodega === true ? "Sí" : value.bodega === false ? "No" : undefined}
            onSelect={(val) => {
              const boolValue = val === "Sí" ? true : val === "No" ? false : undefined;
              set({ bodega: boolValue });
            }}
            label="Bodega"
          />

          {/* Mascotas */}
          <SearchPills
            options={["Acepta mascotas"]}
            selected={value.mascotas === true ? "Acepta mascotas" : undefined}
            onSelect={(val) => {
              // Toggle: si está seleccionado, deseleccionar; si no, seleccionar
              set({ mascotas: val === "Acepta mascotas" ? (value.mascotas === true ? undefined : true) : undefined });
            }}
            label="Mascotas"
          />

          {/* Precios */}
          <div className="flex items-center gap-2">
            <NumberInput
              aria-label="Precio mínimo"
              value={value.minPrice}
              onChange={(val) => set({ minPrice: val })}
              placeholder="Mín $"
              min={0}
              step={100000}
              className="flex-1 min-w-[100px]"
            />
            <span className="text-subtext font-medium flex-shrink-0">-</span>
            <NumberInput
              aria-label="Precio máximo"
              value={value.maxPrice}
              onChange={(val) => set({ maxPrice: val })}
              placeholder="Máx $"
              min={0}
              step={100000}
              className="flex-1 min-w-[100px]"
            />
          </div>

          <button
            onClick={onApply}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8B6CFF] text-white rounded-xl hover:bg-[#7a5ce6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm shadow-violet-500/25"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {isLoading ? "Buscando..." : "Aplicar"}
          </button>
        </div>
      )}

      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-4">
          {/* Comunas con multiselección */}
          <div className="flex-shrink-0">
            <SearchPills
              options={comunas}
              selected={comunasSelected}
              onSelect={(val) => {
                const newComunas = Array.isArray(val) ? val : val ? [val] : [];
                set({ comuna: newComunas.length > 0 ? newComunas : "Todas" });
              }}
              label="Comuna"
              multiple={true}
            />
          </div>

          {/* Dormitorios con multiselección */}
          {useDormitorios && (
            <div className="flex-shrink-0">
              <SearchPills
                options={dormitoriosOptions}
                selected={dormitoriosSelected}
                onSelect={(val) => set({ dormitorios: val })}
                label="Dormitorios"
                multiple={true}
              />
            </div>
          )}

          {/* Estacionamiento */}
          <div className="flex-shrink-0">
            <SearchPills
              options={["Sí", "No"]}
              selected={value.estacionamiento === true ? "Sí" : value.estacionamiento === false ? "No" : undefined}
              onSelect={(val) => {
                const boolValue = val === "Sí" ? true : val === "No" ? false : undefined;
                set({ estacionamiento: boolValue });
              }}
              label="Estacionamiento"
            />
          </div>

          {/* Bodega */}
          <div className="flex-shrink-0">
            <SearchPills
              options={["Sí", "No"]}
              selected={value.bodega === true ? "Sí" : value.bodega === false ? "No" : undefined}
              onSelect={(val) => {
                const boolValue = val === "Sí" ? true : val === "No" ? false : undefined;
                set({ bodega: boolValue });
              }}
              label="Bodega"
            />
          </div>

          {/* Mascotas */}
          <div className="flex-shrink-0">
            <SearchPills
              options={["Acepta mascotas"]}
              selected={value.mascotas === true ? "Acepta mascotas" : undefined}
              onSelect={(val) => {
                // Toggle: si está seleccionado, deseleccionar; si no, seleccionar
                set({ mascotas: val === "Acepta mascotas" ? (value.mascotas === true ? undefined : true) : undefined });
              }}
              label="Mascotas"
            />
          </div>

          {/* Precios */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <NumberInput
              aria-label="Precio mínimo"
              value={value.minPrice}
              onChange={(val) => set({ minPrice: val })}
              placeholder="Mín $"
              min={0}
              step={100000}
              className="min-w-[100px] w-24"
            />
            <span className="text-subtext font-medium flex-shrink-0">-</span>
            <NumberInput
              aria-label="Precio máximo"
              value={value.maxPrice}
              onChange={(val) => set({ maxPrice: val })}
              placeholder="Máx $"
              min={0}
              step={100000}
              className="min-w-[100px] w-24"
            />
          </div>

          {/* Botón Aplicar */}
          <button
            onClick={onApply}
            disabled={isLoading}
            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B6CFF] text-white rounded-xl hover:bg-[#7a5ce6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm shadow-violet-500/25"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {isLoading ? "Buscando..." : "Aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
