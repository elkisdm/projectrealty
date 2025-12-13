"use client";

import { useState, useEffect } from "react";
import MotionWrapper from "@/components/ui/MotionWrapper";
import { logger } from "@lib/logger";

interface StatsData {
  totalBuildings: number;
  totalUnits: number;
  availableUnits: number;
  averagePrice: number;
  comunas: string[];
  tipologias: string[];
}

export default function ArriendaSinComisionStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Usar datos mock de Home Amengual
        const mockStats = {
          totalBuildings: 1,
          totalUnits: 8,
          availableUnits: 8,
          averagePrice: 550000,
          comunas: ["Estación Central"],
          tipologias: ["Estudio", "1D1B", "2D1B", "2D2B"]
        };

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500));

        setStats(mockStats);
      } catch (error) {
        logger.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatPrice = (price: number): string => {
    if (price >= 1_000_000) {
      const millions = price / 1_000_000;
      return `$${millions.toFixed(0)}M`;
    }
    return `$${price.toLocaleString('es-CL')}`;
  };

  if (loading) {
    return (
      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section className="px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <MotionWrapper direction="up" delay={0.1}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Home Amengual en Números
            </h2>
            <p className="mt-2 text-muted-foreground">
              Datos actualizados del edificio disponible
            </p>
          </div>
        </MotionWrapper>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MotionWrapper direction="up" delay={0.2}>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/30 rounded-2xl p-6 ring-1 ring-cyan-200/50 dark:ring-cyan-800/50">
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {stats.totalBuildings}
              </div>
              <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                Edificio
              </div>
            </div>
          </MotionWrapper>

          <MotionWrapper direction="up" delay={0.3}>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl p-6 ring-1 ring-blue-200/50 dark:ring-blue-800/50">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.availableUnits}
              </div>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Unidades Disponibles
              </div>
            </div>
          </MotionWrapper>

          <MotionWrapper direction="up" delay={0.4}>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-2xl p-6 ring-1 ring-purple-200/50 dark:ring-purple-800/50">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.tipologias.length}
              </div>
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Tipologías
              </div>
            </div>
          </MotionWrapper>

          <MotionWrapper direction="up" delay={0.5}>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 rounded-2xl p-6 ring-1 ring-emerald-200/50 dark:ring-emerald-800/50">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatPrice(stats.averagePrice)}
              </div>
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Precio Promedio
              </div>
            </div>
          </MotionWrapper>
        </div>

        {/* Información adicional */}
        <MotionWrapper direction="up" delay={0.6}>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-400/10 dark:to-blue-400/10 px-6 py-3 rounded-2xl border border-cyan-200/50 dark:border-cyan-800/50">
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                📍 {stats.comunas.join(", ")}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                Desde {formatPrice(450000)} hasta {formatPrice(650000)}
              </span>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}
