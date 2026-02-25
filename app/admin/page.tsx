"use client";

import Link from "next/link";
import { AlertTriangle, Building2, CheckCircle2, Home, Layers3 } from "lucide-react";
import { useAdminStats } from "@hooks/useAdminStats";
import { ErrorState } from "@components/admin/ui/ErrorState";
import { KpiCard } from "@components/admin/ui/KpiCard";
import { PageHeader } from "@components/admin/ui/PageHeader";
import { EmptyState } from "@components/admin/ui/EmptyState";

function loadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-36 animate-pulse rounded-2xl bg-[var(--admin-surface-2)]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--admin-surface-2)]" />
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--admin-surface-2)]" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error: queryError, refetch } = useAdminStats();
  const error = queryError instanceof Error ? queryError.message : queryError ? "Error al cargar estadisticas" : null;

  if (isLoading) {
    return loadingSkeleton();
  }

  if (!stats || error) {
    return (
      <ErrorState
        title="No pudimos cargar el dashboard"
        description={error || "Intenta nuevamente en unos segundos."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const availabilityPercentage = stats.totalUnits > 0 ? Math.round((stats.availableUnits / stats.totalUnits) * 100) : 0;
  const riskyBuildings = stats.buildingsWithIncompleteData;
  const topComuna = stats.distributionByComuna?.[0];
  const topTipology = stats.typologyDistribution?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard operativo"
        description="Monitorea inventario, calidad de datos y acciones prioritarias del panel de administracion."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total edificios" value={stats.totalBuildings} icon={<Building2 className="h-5 w-5" />} href="/admin/buildings" />
        <KpiCard title="Total unidades" value={stats.totalUnits} icon={<Home className="h-5 w-5" />} href="/admin/units" />
        <KpiCard title="Disponibilidad" value={`${availabilityPercentage}%`} subtitle={`${stats.availableUnits} disponibles`} icon={<CheckCircle2 className="h-5 w-5" />} trend={availabilityPercentage >= 50 ? "up" : "down"} />
        <KpiCard title="Riesgo de data" value={riskyBuildings} subtitle="Edificios con info faltante" icon={<AlertTriangle className="h-5 w-5" />} trend={riskyBuildings > 0 ? "down" : "up"} href="/admin/completeness" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text)]">Atencion requerida</h2>
          <div className="mt-4 space-y-2">
            {riskyBuildings > 0 ? (
              <Link
                href="/admin/completeness"
                className="flex items-start justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 hover:bg-amber-500/15"
              >
                <div>
                  <p className="text-sm font-medium text-amber-300">{riskyBuildings} edificio(s) con completitud baja</p>
                  <p className="text-xs text-amber-200/80">Revisar portada, amenities y niveles de servicio.</p>
                </div>
                <span className="text-xs text-amber-200">Ver</span>
              </Link>
            ) : (
              <EmptyState title="Sin alertas criticas" description="No hay tareas urgentes en este momento." icon={<CheckCircle2 className="h-5 w-5" />} />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text)]">Contexto rapido</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3">
              <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Comuna lider</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">{topComuna ? `${topComuna.comuna} (${topComuna.count})` : "Sin datos"}</p>
            </div>
            <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3">
              <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Tipologia lider</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">{topTipology ? `${topTipology.tipologia} (${topTipology.count})` : "Sin datos"}</p>
            </div>
            <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3">
              <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Precio minimo</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">${stats.priceRange.min.toLocaleString("es-CL")}</p>
            </div>
            <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3">
              <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Precio promedio</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">${stats.priceRange.average.toLocaleString("es-CL")}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
          <Layers3 className="h-5 w-5 text-[var(--subtext)]" />
          Acciones rapidas
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/admin/listar-propiedad" className="rounded-xl bg-brand-violet px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-violet/90">
            Crear nueva propiedad
          </Link>
          <Link href="/admin/buildings" className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-4 py-3 text-center text-sm font-medium text-[var(--text)] hover:bg-[var(--admin-surface-2)]/80">
            Gestionar edificios
          </Link>
          <Link href="/admin/units" className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-4 py-3 text-center text-sm font-medium text-[var(--text)] hover:bg-[var(--admin-surface-2)]/80">
            Gestionar unidades
          </Link>
          <Link href="/admin/completeness" className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-4 py-3 text-center text-sm font-medium text-[var(--text)] hover:bg-[var(--admin-surface-2)]/80">
            Revisar completitud
          </Link>
        </div>
      </section>
    </div>
  );
}

