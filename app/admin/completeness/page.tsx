"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleDashed, Sparkles } from "lucide-react";
import { ErrorState, PageHeader, StatusBadge } from "@components/admin/ui";
import { getErrorMessage } from "@lib/admin/client-errors";
import { Progress } from "@/components/ui/progress";

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
  topIssues: Array<{ field: string; count: number; percentage: number }>;
}

interface CompletenessResponse {
  success: boolean;
  data: {
    buildings: CompletenessBuilding[];
    stats: CompletenessStats;
    timestamp: string;
  } | null;
  error?: { code: string; message: string; details?: unknown } | string;
  message?: string;
}

type IssueStatusKey =
  | "cover_image_status"
  | "badges_status"
  | "service_level_status"
  | "amenities_status"
  | "gallery_status";

const ISSUE_STATUS_FIELDS: Array<{ key: IssueStatusKey; label: string }> = [
  { key: "cover_image_status", label: "Portada" },
  { key: "badges_status", label: "Badges" },
  { key: "service_level_status", label: "Service level" },
  { key: "amenities_status", label: "Amenities" },
  { key: "gallery_status", label: "Galeria" },
];

const ISSUE_LABELS: Record<string, string> = {
  cover_image: "Imagen de portada",
  badges: "Badges",
  service_level: "Service level",
  amenities: "Amenities",
  gallery: "Galeria",
};

function formatLastUpdate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getMissingFields(building: CompletenessBuilding) {
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

      const response = await fetch("/api/admin/completeness", { cache: "no-store" });
      const result = (await response.json()) as CompletenessResponse;

      if (!response.ok || !result.success || !result.data) {
        const errorMessage = getErrorMessage(result.error, result.message || "Error al cargar completitud");
        throw new Error(errorMessage || "Error al cargar completitud");
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCompleteness();
  }, [fetchCompleteness]);

  const buildings = data?.data?.buildings || [];
  const stats = data?.data?.stats;
  const lowCompletenessCount = buildings.filter((item) => item.completeness_percentage < 70).length;

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-1/2 animate-pulse rounded-lg bg-[var(--admin-surface-2)]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-2xl bg-[var(--admin-surface-2)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return <ErrorState title="No pudimos cargar la completitud" description={error} onRetry={() => void fetchCompleteness()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Completitud de datos"
        description="Prioriza edificios criticos, corrige faltantes y acelera la publicacion."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Completitud" },
        ]}
        actions={[
          {
            key: "refresh",
            label: loading ? "Actualizando..." : "Actualizar",
            variant: "secondary",
            onClick: () => void fetchCompleteness(),
            disabled: loading,
          },
        ]}
      />

      {data?.data?.timestamp ? (
        <p className="text-xs text-[var(--subtext)]">Ultima actualizacion: {formatLastUpdate(data.data.timestamp)}</p>
      ) : null}

      {stats ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Total edificios</p>
            <p className="mt-1 text-2xl font-bold text-[var(--text)]">{stats.totalBuildings}</p>
          </article>
          <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Promedio completitud</p>
            <p className="mt-1 text-2xl font-bold text-[var(--text)]">{stats.averageCompleteness.toFixed(1)}%</p>
          </article>
          <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Con faltantes</p>
            <p className="mt-1 text-2xl font-bold text-[var(--text)]">{stats.buildingsWithIssues}</p>
          </article>
          <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Criticos (&lt;70%)</p>
            <p className="mt-1 text-2xl font-bold text-[var(--text)]">{lowCompletenessCount}</p>
          </article>
        </section>
      ) : null}

      {stats ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-5">
            <h2 className="text-lg font-semibold text-[var(--text)]">Distribucion de completitud</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: "Excelente", count: stats.completenessDistribution.excellent, color: "bg-emerald-500" },
                { label: "Buena", count: stats.completenessDistribution.good, color: "bg-sky-500" },
                { label: "Regular", count: stats.completenessDistribution.fair, color: "bg-amber-500" },
                { label: "Baja", count: stats.completenessDistribution.poor, color: "bg-rose-500" },
              ].map((item) => {
                const total = stats.totalBuildings || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-[var(--text)]">{item.label}</span>
                      <span className="text-[var(--subtext)]">{item.count} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-2 bg-[var(--admin-surface-2)]" indicatorClassName={item.color} />
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-5">
            <h2 className="text-lg font-semibold text-[var(--text)]">Top faltantes</h2>
            <div className="mt-4 space-y-2">
              {stats.topIssues.length === 0 ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  Sin faltantes detectados.
                </div>
              ) : (
                stats.topIssues.map((issue) => (
                  <div key={issue.field} className="flex items-center justify-between rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-3 py-2 text-sm">
                    <span className="text-[var(--text)]">{ISSUE_LABELS[issue.field] || issue.field}</span>
                    <span className="text-[var(--subtext)]">{issue.count} ({issue.percentage}%)</span>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-5">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Detalle por edificio</h2>
        {buildings.length === 0 ? (
          <div className="rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-4 text-sm text-[var(--subtext)]">
            No hay edificios para analizar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border-subtle)] text-left text-xs uppercase tracking-wide text-[var(--subtext)]">
                  <th className="px-3 py-3">Edificio</th>
                  <th className="px-3 py-3">Comuna</th>
                  <th className="px-3 py-3">Completitud</th>
                  <th className="px-3 py-3">Faltantes</th>
                  <th className="px-3 py-3">Accion</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => {
                  const missingFields = getMissingFields(building);
                  const isCritical = building.completeness_percentage < 70;
                  return (
                    <tr key={building.id} className="border-b border-[var(--admin-border-subtle)]/70">
                      <td className="px-3 py-3">
                        <p className="font-medium text-[var(--text)]">{building.name}</p>
                        <p className="text-xs text-[var(--subtext)]">{building.slug}</p>
                      </td>
                      <td className="px-3 py-3 text-[var(--text)]">{building.comuna}</td>
                      <td className="px-3 py-3">
                        <StatusBadge
                          status={isCritical ? "warning" : "success"}
                          label={`${building.completeness_percentage}%`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        {missingFields.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {missingFields.map((item) => (
                              <span key={item} className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300 ring-1 ring-amber-500/30">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completo
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href="/admin/buildings"
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-[var(--admin-surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--text)] ring-1 ring-[var(--admin-border-subtle)] hover:bg-[var(--admin-surface-2)]/80"
                        >
                          {isCritical ? <AlertTriangle className="h-3.5 w-3.5 text-amber-300" /> : <Sparkles className="h-3.5 w-3.5 text-sky-300" />}
                          Revisar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {error && data ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          <span className="inline-flex items-center gap-2">
            <CircleDashed className="h-4 w-4" />
            Se detectaron errores parciales al refrescar datos.
          </span>
        </div>
      ) : null}
    </div>
  );
}
