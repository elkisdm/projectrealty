"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ArriendaSinComisionBuildingCard from "./ArriendaSinComisionBuildingCard";
import { logger } from "@lib/logger";
import type { BuildingSummary } from "@/hooks/useFetchBuildings";

interface LazyBuildingsGridProps {
  initialBuildings: BuildingSummary[];
  hasMore: boolean;
  total: number;
}

export function LazyBuildingsGrid({ initialBuildings, hasMore, total }: LazyBuildingsGridProps) {
  const [buildings, setBuildings] = useState<BuildingSummary[]>(initialBuildings);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // Simular carga de más edificios (en este caso no hay más)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBuildings(prev => [...prev]);
    } catch (error) {
      logger.error("Error loading more buildings:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  return (
    <div className="space-y-8">
      {/* Grid de edificios - siempre 3 columnas con altura uniforme */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {buildings.map((building, index) => (
          <motion.div
            key={building.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
          >
            <ArriendaSinComisionBuildingCard building={building} />
          </motion.div>
        ))}
      </motion.div>

      {/* Botón de cargar más */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Cargando...
              </>
            ) : (
              <>
                Cargar más departamentos
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Mensaje cuando no hay más edificios */}
      {!hasMore && total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-800"
        >
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
            ✨ Departamentos destacados
          </h3>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            Estos son nuestros mejores departamentos con las promociones más atractivas.
            ¡Encuentra tu próximo hogar aquí!
          </p>
        </motion.div>
      )}
    </div>
  );
}

