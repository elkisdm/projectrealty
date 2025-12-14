"use client";
import { useState } from "react";
import { Filter, X, Search } from "lucide-react";
import { SortSelect } from "./SortSelect";
import { SearchPills } from "@/components/marketing/SearchPills";
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
}: FilterBarProps) {
  const [open, setOpen] = useState(false);

  const set = (patch: Partial<FilterValues>) => onChange({ ...value, ...patch });

  const comunas = ["Todas", "Las Condes", "Ñuñoa", "Providencia", "Santiago", "Macul", "La Florida"];
  const tipologias = ["Todas", "Studio", "1D/1B", "2D/1B", "2D/2B"];
  const dormitoriosOptions = ["Estudio", "1", "2", "3"];

  return (
    <div className="sticky top-0 z-30 backdrop-blur bg-bg/75 ring-1 ring-soft/50 rounded-2xl p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-soft/50 ring-1 ring-soft/50 hover:bg-soft transition-colors"
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
          className="md:ml-auto inline-flex items-center gap-2 text-sm text-subtext hover:text-text transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          Limpiar
        </button>
      </div>

      {open && (
        <div
          id="mobile-filters"
          className="mt-3 grid grid-cols-1 gap-4 md:hidden"
        >
          <select
            aria-label="Comuna"
            className="ui-input"
            value={value.comuna}
            onChange={(e) => set({ comuna: e.target.value })}
          >
            {comunas.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {useDormitorios ? (
            <SearchPills
              options={dormitoriosOptions}
              selected={value.dormitorios}
              onSelect={(val) => set({ dormitorios: val })}
              label="Dormitorios"
            />
          ) : (
            <select
              aria-label="Tipología"
              className="ui-input"
              value={value.tipologia}
              onChange={(e) => set({ tipologia: e.target.value })}
            >
              {tipologias.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          <div className="flex gap-2">
            <input
              aria-label="Precio mínimo"
              className="ui-input w-full"
              type="number"
              placeholder="Mín $"
              value={value.minPrice ?? ""}
              onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : null })}
            />
            <input
              aria-label="Precio máximo"
              className="ui-input w-full"
              type="number"
              placeholder="Máx $"
              value={value.maxPrice ?? ""}
              onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            />
          </div>

          <button
            onClick={onApply}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {isLoading ? "Buscando..." : "Aplicar"}
          </button>
        </div>
      )}

      <div className="hidden md:block mt-3">
        <div className="flex flex-wrap items-center gap-4">
          <select
            aria-label="Comuna"
            className="ui-input"
            value={value.comuna}
            onChange={(e) => set({ comuna: e.target.value })}
          >
            {comunas.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {useDormitorios ? (
            <div className="flex-1 min-w-[200px]">
              <SearchPills
                options={dormitoriosOptions}
                selected={value.dormitorios}
                onSelect={(val) => set({ dormitorios: val })}
                label="Dormitorios"
              />
            </div>
          ) : (
            <select
              aria-label="Tipología"
              className="ui-input"
              value={value.tipologia}
              onChange={(e) => set({ tipologia: e.target.value })}
            >
              {tipologias.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          <input
            aria-label="Precio mínimo"
            className="ui-input"
            type="number"
            placeholder="Mín $"
            value={value.minPrice ?? ""}
            onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : null })}
          />

          <input
            aria-label="Precio máximo"
            className="ui-input"
            type="number"
            placeholder="Máx $"
            value={value.maxPrice ?? ""}
            onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : null })}
          />

          <button
            onClick={onApply}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {isLoading ? "Buscando..." : "Aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
