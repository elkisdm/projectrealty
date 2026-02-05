"use client";

import Link from "next/link";
import { useAdminStats } from "@hooks/useAdminStats";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6 hover:bg-[var(--soft)] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        {href && (
          <Link
            href={href}
            className="text-sm text-[var(--subtext)] hover:text-[var(--text)] transition-colors"
          >
            Ver más →
          </Link>
        )}
      </div>
      <h3 className="text-sm font-medium text-[var(--subtext)] mb-1">{title}</h3>
      <p className="text-3xl font-bold text-[var(--text)] mb-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-[var(--subtext)]">{subtitle}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: loading, error: queryError } = useAdminStats();

  const error = queryError instanceof Error ? queryError.message : queryError ? "Error al cargar estadísticas" : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">Dashboard</h1>
          <p className="text-[var(--subtext)]">Cargando métricas...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6 animate-pulse"
            >
              <div className="h-8 bg-gray-600 rounded mb-4 w-1/3"></div>
              <div className="h-12 bg-gray-600 rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">Dashboard</h1>
          <p className="text-red-400">{error || "Error al cargar datos"}</p>
        </div>
      </div>
    );
  }

  const availabilityPercentage =
    stats.totalUnits > 0
      ? Math.round((stats.availableUnits / stats.totalUnits) * 100)
      : 0;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">Dashboard</h1>
        <p className="text-[var(--subtext)]">
          Vista general del sistema y métricas clave
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Edificios"
          value={stats.totalBuildings}
          icon="🏢"
          href="/admin/buildings"
        />
        <StatCard
          title="Total Unidades"
          value={stats.totalUnits}
          icon="🏠"
          href="/admin/units"
        />
        <StatCard
          title="Unidades Disponibles"
          value={stats.availableUnits}
          subtitle={`${availabilityPercentage}% del total`}
          icon="✅"
        />
        <StatCard
          title="Datos Incompletos"
          value={stats.buildingsWithIncompleteData}
          subtitle="Edificios con información faltante"
          icon="⚠️"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribución por Comuna */}
        <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6">
          <h2 className="text-xl font-bold mb-4 text-[var(--text)]">
            Distribución por Comuna
          </h2>
          <div className="space-y-3">
            {stats.distributionByComuna && stats.distributionByComuna.length > 0 ? (
              stats.distributionByComuna.slice(0, 5).map((item) => {
                const percentage =
                  stats.totalBuildings > 0
                    ? Math.round((item.count / stats.totalBuildings) * 100)
                    : 0;
                return (
                  <div key={item.comuna}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text)]">
                        {item.comuna}
                      </span>
                      <span className="text-sm text-[var(--subtext)]">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-violet transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[var(--subtext)]">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Distribución por Tipología */}
        <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6">
          <h2 className="text-xl font-bold mb-4 text-[var(--text)]">
            Distribución por Tipología
          </h2>
          <div className="space-y-3">
            {stats.typologyDistribution && stats.typologyDistribution.length > 0 ? (
              stats.typologyDistribution.slice(0, 5).map((item) => {
                const percentage =
                  stats.totalUnits > 0
                    ? Math.round((item.count / stats.totalUnits) * 100)
                    : 0;
                return (
                  <div key={item.tipologia}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text)]">
                        {item.tipologia}
                      </span>
                      <span className="text-sm text-[var(--subtext)]">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-violet transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[var(--subtext)]">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-[var(--text)]">
          Rango de Precios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-[var(--subtext)] mb-1">Precio Mínimo</p>
            <p className="text-2xl font-bold text-[var(--text)]">
              ${stats.priceRange.min.toLocaleString("es-CL")}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--subtext)] mb-1">Precio Promedio</p>
            <p className="text-2xl font-bold text-[var(--text)]">
              ${stats.priceRange.average.toLocaleString("es-CL")}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--subtext)] mb-1">Precio Máximo</p>
            <p className="text-2xl font-bold text-[var(--text)]">
              ${stats.priceRange.max.toLocaleString("es-CL")}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--text)]">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/listar-propiedad"
            className="px-4 py-3 rounded-lg bg-brand-violet text-white font-medium hover:bg-brand-violet/90 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
          >
            Listar propiedad nueva
          </Link>
          <Link
            href="/admin/buildings"
            className="px-4 py-3 rounded-lg bg-[var(--soft)] text-[var(--text)] font-medium hover:bg-[var(--soft)]/80 transition-colors text-center ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
          >
            Gestionar Edificios
          </Link>
          <Link
            href="/admin/units"
            className="px-4 py-3 rounded-lg bg-[var(--soft)] text-[var(--text)] font-medium hover:bg-[var(--soft)]/80 transition-colors text-center ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
          >
            Gestionar Unidades
          </Link>
          <Link
            href="/admin/flags"
            className="px-4 py-3 rounded-lg bg-[var(--soft)] text-[var(--text)] font-medium hover:bg-[var(--soft)]/80 transition-colors text-center ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
          >
            Feature Flags
          </Link>
          <Link
            href="/admin/completeness"
            className="px-4 py-3 rounded-lg bg-[var(--soft)] text-[var(--text)] font-medium hover:bg-[var(--soft)]/80 transition-colors text-center ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
          >
            Completitud de Datos
          </Link>
        </div>
      </div>
    </div>
  );
}
