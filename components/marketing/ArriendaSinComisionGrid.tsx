"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LazyBuildingsGrid } from "./LazyBuildingsGrid";
import { LANDING_BUILDINGS_MOCK } from "@/lib/arrienda-sin-comision-mocks";
import { logger } from "@lib/logger";
import type { BuildingSummary } from "@/hooks/useFetchBuildings";

interface ArriendaSinComisionGridProps {
  initialBuildings?: BuildingSummary[];
}

export default function ArriendaSinComisionGrid({ initialBuildings }: ArriendaSinComisionGridProps) {
  const [buildings, setBuildings] = useState<BuildingSummary[]>(initialBuildings || []);
  const [loading, setLoading] = useState(!initialBuildings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialBuildings) {
      fetchInitialBuildings();
    }
  }, [initialBuildings]);

  const fetchInitialBuildings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar solo los datos mock de Home Amengual
      const mockBuildings = LANDING_BUILDINGS_MOCK;

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      setBuildings(mockBuildings);
    } catch (err) {
      logger.error("Error fetching buildings:", err);
      setError("Error al cargar los edificios");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-bg to-surface/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            >
              Cargando edificios disponibles...
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800:bg-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-bg to-surface/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8"
          >
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error al cargar edificios
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchInitialBuildings}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Intentar nuevamente
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  const total = buildings.length;

  return (
    <section className="py-16 bg-gradient-to-b from-bg to-surface/20" id="buildings-grid">
      <div className="container mx-auto px-4">
        {/* Header con información */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Departamentos que inspiran
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada espacio está diseñado para que te sientas como en casa desde el primer día
          </p>

          {/* Badge destacado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mt-4"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            ✨ {total === 1 ? "1 departamento" : `${total} departamentos`} listos para ti
          </motion.div>
        </motion.div>

        {/* Grid de edificios */}
        <LazyBuildingsGrid
          initialBuildings={buildings}
          hasMore={false} // Solo tenemos 1 edificio mock
          total={total}
        />
      </div>
    </section>
  );
}
