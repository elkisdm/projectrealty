"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface CompletenessBuilding {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  completeness_percentage: number;
  cover_image_status: "✅" | "❌";
  badges_status: "✅" | "❌";
  service_level_status: "✅" | "❌";
  amenities_status: "✅" | "❌";
  gallery_status: "✅" | "❌";
  updated_at: string;
}

interface CompletenessStats {
  totalBuildings: number;
  averageCompleteness: number;
  buildingsWithIssues: number;
  completenessDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  topIssues: Array<{
    field: string;
    count: number;
    percentage: number;
  }>;
}

interface CompletenessResponse {
  success: boolean;
  buildings: CompletenessBuilding[];
  stats: CompletenessStats;
  timestamp: string;
  error?: string;
  message?: string;
}

type IssueStatusKey =
  | "cover_image_status"
  | "badges_status"
  | "service_level_status"
  | "amenities_status"
  | "gallery_status";

const ISSUE_LABELS: Record<string, string> = {
  cover_image: "Imagen de portada",
  badges: "Badges",
  service_level: "Service level",
  amenities: "Amenities",
  gallery: "Galería",
};

const ISSUE_STATUS_FIELDS: Array<{ key: IssueStatusKey; label: string }> = [
  { key: "cover_image_status", label: "Portada" },
  { key: "badges_status", label: "Badges" },
  { key: "service_level_status", label: "Service level" },
  { key: "amenities_status", label: "Amenities" },
  { key: "gallery_status", label: "Galería" },
];

function getCompletenessBadgeClass(percentage: number): string {
  if (percentage >= 90) return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";
  if (percentage >= 70) return "bg-blue-500/15 text-blue-300 ring-blue-500/30";
  if (percentage >= 50) return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
  return "bg-rose-500/15 text-rose-300 ring-rose-500/30";
}

function formatLastUpdate(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getMissingFields(building: CompletenessBuilding): string[] {
  return ISSUE_STATUS_FIELDS.filter((field) => building[field.key] === "❌").map((field) => field.label);
}

export default function CompletenessAdminPage() {
  const [data, setData] = useState<CompletenessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompleteness = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/completeness", {
        cache: "no-store",
      });

      const result = (await response.json()) as CompletenessResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Error al cargar datos de completitud");
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompleteness();
  }, [fetchCompleteness]);

  const buildings = data?.buildings ?? [];
  const stats = data?.stats;

  const lowCompletenessCount = useMemo(
    () => buildings.filter((b) => b.completeness_percentage < 70).length,
    [buildings]
  );

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">Completitud de Datos</h1>
          <p className="text-[var(--subtext)]">Cargando análisis...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-5 animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-2/3 mb-3" />
              <div className="h-9 bg-gray-600 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">Completitud de Datos</h1>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchCompleteness}
            className="px-4 py-2 rounded-lg bg-brand-violet text-white hover:bg-brand-violet/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">Completitud de Datos</h1>
          <p className="text-[var(--subtext)]">
            Detecta edificios con información faltante para priorizar carga de contenido.
          </p>
          {data?.timestamp && (
            <p className="text-xs text-[var(--subtext)]/80 mt-2">
              Última actualización: {formatLastUpdate(data.timestamp)}
            </p>
          )}
        </div>
        <button
          onClick={fetchCompleteness}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--soft)] text-[var(--text)] ring-1 ring-white/10 hover:bg-[var(--soft)]/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-5">
            <p className="text-sm text-[var(--subtext)] mb-1">Total edificios</p>
            <p className="text-3xl font-bold text-[var(--text)]">{stats.totalBuildings}</p>
          </div>
          <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-5">
            <p className="text-sm text-[var(--subtext)] mb-1">Promedio completitud</p>
            <p className="text-3xl font-bold text-[var(--text)]">{stats.averageCompleteness.toFixed(1)}%</p>
          </div>
          <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-5">
            <p className="text-sm text-[var(--subtext)] mb-1">Con campos faltantes</p>
            <p className="text-3xl font-bold text-[var(--text)]">{stats.buildingsWithIssues}</p>
          </div>
          <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-5">
            <p className="text-sm text-[var(--subtext)] mb-1">Riesgo (menos de 70%)</p>
            <p className="text-3xl font-bold text-[var(--text)]">{lowCompletenessCount}</p>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Distribución de completitud</h2>
            <div className="space-y-3">
              {[
                {
                  label: "Excelente (90-100%)",
                  count: stats.completenessDistribution.excellent,
                  color: "bg-emerald-500",
                },
                {
                  label: "Buena (70-89%)",
                  count: stats.completenessDistribution.good,
                  color: "bg-blue-500",
                },
                {
                  label: "Regular (50-69%)",
                  count: stats.completenessDistribution.fair,
                  color: "bg-amber-500",
                },
                {
                  label: "Baja (0-49%)",
                  count: stats.completenessDistribution.poor,
                  color: "bg-rose-500",
                },
              ].map((item) => {
                const total = stats.totalBuildings || 1;
                const percentage = Math.round((item.count / total) * 100);

                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-[var(--text)]">{item.label}</p>
                      <p className="text-sm text-[var(--subtext)]">
                        {item.count} ({percentage}%)
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg)] overflow-hidden">
                      <div className={`h-full ${item.color} transition-all`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Campos más faltantes</h2>
            {stats.topIssues.length > 0 ? (
              <div className="space-y-3">
                {stats.topIssues.map((issue) => (
                  <div
                    key={issue.field}
                    className="flex items-center justify-between rounded-lg bg-[var(--bg)]/40 ring-1 ring-white/10 px-3 py-2"
                  >
                    <p className="text-sm text-[var(--text)]">{ISSUE_LABELS[issue.field] || issue.field}</p>
                    <p className="text-sm text-[var(--subtext)]">
                      {issue.count} edificios ({issue.percentage}%)
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--subtext)]">No hay faltantes detectados.</p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Detalle por edificio</h2>
        {buildings.length === 0 ? (
          <p className="text-sm text-[var(--subtext)]">No hay edificios para analizar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-sm">
              <thead>
                <tr className="text-left border-b border-white/10 text-[var(--subtext)]">
                  <th className="py-3 pr-3">Edificio</th>
                  <th className="py-3 pr-3">Comuna</th>
                  <th className="py-3 pr-3">Completitud</th>
                  <th className="py-3 pr-3">Campos faltantes</th>
                  <th className="py-3 pr-3">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => {
                  const missingFields = getMissingFields(building);

                  return (
                    <tr key={building.id} className="border-b border-white/5 align-top">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-[var(--text)]">{building.name}</p>
                        <p className="text-xs text-[var(--subtext)]">{building.slug}</p>
                      </td>
                      <td className="py-3 pr-3 text-[var(--text)]">{building.comuna}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getCompletenessBadgeClass(
                            building.completeness_percentage
                          )}`}
                        >
                          {building.completeness_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        {missingFields.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {missingFields.map((field) => (
                              <span
                                key={`${building.id}-${field}`}
                                className="inline-flex items-center rounded-md px-2 py-1 text-xs bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                            Completo
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-[var(--subtext)]">{formatLastUpdate(building.updated_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
