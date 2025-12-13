"use client";

import { useState, useEffect } from "react";
import MotionWrapper from "@/components/ui/MotionWrapper";
import { logger } from "@lib/logger";

interface FilterOptions {
  comunas: string[];
  tipologias: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

interface BuildingFromAPI {
  comuna: string;
  precioDesde?: number;
  typologySummary?: Array<{ key: string }>;
}

interface ArriendaSinComisionFiltersProps {
  onFiltersChange: (filters: {
    comuna?: string;
    tipologia?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
}

export default function ArriendaSinComisionFilters({ onFiltersChange }: ArriendaSinComisionFiltersProps) {
  const [filters, setFilters] = useState({
    comuna: '',
    tipologia: '',
    minPrice: '',
    maxPrice: ''
  });

  const [options, setOptions] = useState<FilterOptions>({
    comunas: [],
    tipologias: [],
    priceRange: { min: 0, max: 0 }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/arrienda-sin-comision?limit=100');
        const data = await response.json();

        if (data.success && data.buildings) {
          const buildings = data.buildings as BuildingFromAPI[];
          const comunas = [...new Set(buildings.map((b) => b.comuna))].sort() as string[];
          const tipologias = [...new Set(buildings.flatMap((b) =>
            b.typologySummary?.map((t) => t.key) || []
          ))].sort() as string[];
          const prices = buildings.map((b) => b.precioDesde).filter((p): p is number => typeof p === 'number' && p > 0);

          setOptions({
            comunas,
            tipologias,
            priceRange: {
              min: Math.min(...prices),
              max: Math.max(...prices)
            }
          });
        }
      } catch (error) {
        logger.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    onFiltersChange({
      comuna: newFilters.comuna || undefined,
      tipologia: newFilters.tipologia || undefined,
      minPrice: newFilters.minPrice ? parseInt(newFilters.minPrice) : undefined,
      maxPrice: newFilters.maxPrice ? parseInt(newFilters.maxPrice) : undefined,
    });
  };

  const clearFilters = () => {
    setFilters({
      comuna: '',
      tipologia: '',
      minPrice: '',
      maxPrice: ''
    });
    onFiltersChange({});
  };

  const formatPrice = (price: number): string => {
    if (price >= 1_000_000) {
      const millions = price / 1_000_000;
      return `$${millions.toFixed(0)}M`;
    }
    return `$${price.toLocaleString('es-CL')}`;
  };

  if (loading) {
    return (
      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="bg-card rounded-2xl p-6 ring-1 ring-border animate-pulse">
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <MotionWrapper direction="up" delay={0.1}>
          <div className="bg-card rounded-2xl p-6 ring-1 ring-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por comuna */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Comuna
                </label>
                <select
                  value={filters.comuna}
                  onChange={(e) => handleFilterChange('comuna', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Todas las comunas</option>
                  {options.comunas.map((comuna) => (
                    <option key={comuna} value={comuna}>
                      {comuna}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por tipología */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Tipología
                </label>
                <select
                  value={filters.tipologia}
                  onChange={(e) => handleFilterChange('tipologia', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Todas las tipologías</option>
                  {options.tipologias.map((tipologia) => (
                    <option key={tipologia} value={tipologia}>
                      {tipologia}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por precio mínimo */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Precio mínimo
                </label>
                <select
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sin mínimo</option>
                  <option value="200000">{formatPrice(200000)}</option>
                  <option value="300000">{formatPrice(300000)}</option>
                  <option value="400000">{formatPrice(400000)}</option>
                  <option value="500000">{formatPrice(500000)}</option>
                  <option value="600000">{formatPrice(600000)}</option>
                  <option value="700000">{formatPrice(700000)}</option>
                </select>
              </div>

              {/* Filtro por precio máximo */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Precio máximo
                </label>
                <select
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sin máximo</option>
                  <option value="400000">{formatPrice(400000)}</option>
                  <option value="500000">{formatPrice(500000)}</option>
                  <option value="600000">{formatPrice(600000)}</option>
                  <option value="700000">{formatPrice(700000)}</option>
                  <option value="800000">{formatPrice(800000)}</option>
                  <option value="900000">{formatPrice(900000)}</option>
                  <option value="1000000">{formatPrice(1000000)}</option>
                </select>
              </div>
            </div>

            {/* Filtros activos */}
            {(filters.comuna || filters.tipologia || filters.minPrice || filters.maxPrice) && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {filters.comuna && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Comuna: {filters.comuna}
                      <button
                        onClick={() => handleFilterChange('comuna', '')}
                        className="ml-1 hover:text-green-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.tipologia && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      Tipología: {filters.tipologia}
                      <button
                        onClick={() => handleFilterChange('tipologia', '')}
                        className="ml-1 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.minPrice && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      Mín: {formatPrice(parseInt(filters.minPrice))}
                      <button
                        onClick={() => handleFilterChange('minPrice', '')}
                        className="ml-1 hover:text-purple-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                      Máx: {formatPrice(parseInt(filters.maxPrice))}
                      <button
                        onClick={() => handleFilterChange('maxPrice', '')}
                        className="ml-1 hover:text-orange-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}
