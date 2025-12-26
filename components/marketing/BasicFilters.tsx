"use client";

import { useState, useMemo, useEffect } from "react";
import { Filter, X } from "lucide-react";
import type { Building } from "@schemas/models";

type BasicFiltersProps = {
  buildings: (Building & { precioDesde: number | null })[];
  onFiltersChange: (filteredBuildings: (Building & { precioDesde: number | null })[]) => void;
};

export function BasicFilters({ buildings, onFiltersChange }: BasicFiltersProps) {
  // Obtener comunas únicas de los edificios
  const communes = useMemo(() => {
    const unique = new Set(buildings.map(b => b.comuna));
    return Array.from(unique).sort();
  }, [buildings]);

  // Obtener rango de precios
  const priceRange = useMemo(() => {
    const prices = buildings
      .map(b => b.precioDesde)
      .filter((p): p is number => p !== null && p > 0);

    if (prices.length === 0) return { min: 0, max: 0 };

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [buildings]);

  const [selectedComuna, setSelectedComuna] = useState<string>("Todas");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Aplicar filtros
  const filteredBuildings = useMemo(() => {
    let filtered = [...buildings];

    // Filtro por comuna
    if (selectedComuna && selectedComuna !== "Todas") {
      filtered = filtered.filter(b => b.comuna === selectedComuna);
    }

    // Filtro por precio mínimo
    if (minPrice !== null && minPrice > 0) {
      filtered = filtered.filter(b => {
        if (b.precioDesde === null) return false;
        return b.precioDesde >= minPrice;
      });
    }

    // Filtro por precio máximo
    if (maxPrice !== null && maxPrice > 0) {
      filtered = filtered.filter(b => {
        if (b.precioDesde === null) return false;
        return b.precioDesde <= maxPrice;
      });
    }

    return filtered;
  }, [buildings, selectedComuna, minPrice, maxPrice]);

  // Notificar cambios (usar useEffect para efectos secundarios, no useMemo)
  useEffect(() => {
    onFiltersChange(filteredBuildings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredBuildings]); // onFiltersChange es estable (setState del padre)

  const hasActiveFilters = selectedComuna !== "Todas" || minPrice !== null || maxPrice !== null;

  const clearFilters = () => {
    setSelectedComuna("Todas");
    setMinPrice(null);
    setMaxPrice(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Título y botón limpiar */}
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Filtros</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Limpiar filtros"
              >
                <X className="h-4 w-4" />
                Limpiar
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Filtro por comuna */}
            <div className="flex-1 sm:flex-initial">
              <label htmlFor="comuna-filter" className="block text-sm font-medium text-muted-foreground mb-2">
                Comuna
              </label>
              <select
                id="comuna-filter"
                value={selectedComuna}
                onChange={(e) => setSelectedComuna(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <option value="Todas">Todas las comunas</option>
                {communes.map(comuna => (
                  <option key={comuna} value={comuna}>
                    {comuna}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por precio mínimo */}
            <div className="flex-1 sm:flex-initial">
              <label htmlFor="min-price-filter" className="block text-sm font-medium text-muted-foreground mb-2">
                Precio desde
              </label>
              <input
                id="min-price-filter"
                type="number"
                min={0}
                max={priceRange.max}
                value={minPrice ?? ""}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                placeholder="Mínimo"
                className="w-full rounded-xl border border-border bg-bg px-4 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>

            {/* Filtro por precio máximo */}
            <div className="flex-1 sm:flex-initial">
              <label htmlFor="max-price-filter" className="block text-sm font-medium text-muted-foreground mb-2">
                Precio hasta
              </label>
              <input
                id="max-price-filter"
                type="number"
                min={0}
                max={priceRange.max}
                value={maxPrice ?? ""}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                placeholder="Máximo"
                className="w-full rounded-xl border border-border bg-bg px-4 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>
          </div>
        </div>

        {/* Resultados */}
        {hasActiveFilters && (
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredBuildings.length} de {buildings.length} proyectos
          </div>
        )}
      </div>
    </div>
  );
}
















