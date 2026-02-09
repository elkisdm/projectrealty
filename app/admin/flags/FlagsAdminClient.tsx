"use client";

import { useEffect, useState } from "react";
import { Activity, Clock3, RefreshCw, ShieldAlert } from "lucide-react";
import { FlagToggle } from "@components/admin/FlagToggle";
import { ErrorState, PageHeader, StatusBadge } from "@components/admin/ui";
import { getErrorMessage } from "@lib/admin/client-errors";

interface FlagsStatus {
  comingSoon: {
    value: boolean;
    overridden: boolean;
    expiresAt?: string;
  };
}

export function FlagsAdminClient() {
  const [flagsStatus, setFlagsStatus] = useState<FlagsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlagsStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/flags/override");
      const result = await response.json();

      if (response.ok && result.success) {
        setFlagsStatus(result.flags);
      } else {
        setError(getErrorMessage(result.error, "Error al cargar flags"));
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFlagsStatus();
  }, []);

  if (loading && !flagsStatus) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-1/3 animate-pulse rounded-lg bg-[var(--admin-surface-2)]" />
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="h-32 animate-pulse rounded-2xl bg-[var(--admin-surface-2)]" />
        ))}
      </div>
    );
  }

  if (error && !flagsStatus) {
    return <ErrorState title="No pudimos cargar feature flags" description={error} onRetry={() => void fetchFlagsStatus()} />;
  }

  const comingSoon = flagsStatus?.comingSoon;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Feature flags"
        description="Controla comportamientos sensibles del producto en tiempo real."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Feature Flags" },
        ]}
        actions={[
          {
            key: "refresh",
            label: loading ? "Actualizando..." : "Actualizar",
            icon: <RefreshCw className="h-4 w-4" />,
            variant: "secondary",
            onClick: () => void fetchFlagsStatus(),
            disabled: loading,
          },
        ]}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Flags activos</p>
          <p className="mt-1 text-2xl font-bold text-[var(--text)]">{comingSoon?.value ? 1 : 0}</p>
        </article>
        <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Overrides vigentes</p>
          <p className="mt-1 text-2xl font-bold text-[var(--text)]">{comingSoon?.overridden ? 1 : 0}</p>
        </article>
        <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Estado operativo</p>
          <div className="mt-2">
            <StatusBadge status={comingSoon?.value ? "warning" : "success"} label={comingSoon?.value ? "Modo limitado" : "Operacion normal"} />
          </div>
        </article>
      </section>

      {comingSoon ? (
        <FlagToggle
          flag="comingSoon"
          label="Coming Soon"
          description="Activa o desactiva la capa de bloqueo comercial del sitio principal."
          initialValue={comingSoon.value}
          overridden={comingSoon.overridden}
          expiresAt={comingSoon.expiresAt}
        />
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
            Reglas de seguridad
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--subtext)]">
            <li>Overrides expiran automaticamente.</li>
            <li>Los cambios impactan inmediatamente en toda la aplicacion.</li>
            <li>Las acciones deben ejecutarse por personal autorizado.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
            <Activity className="h-5 w-5 text-sky-300" />
            Historial reciente
          </h2>
          <div className="mt-4 rounded-lg border border-dashed border-[var(--admin-border-strong)] bg-[var(--admin-surface-2)] p-4 text-sm text-[var(--subtext)]">
            <p className="mb-2 inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              Placeholder listo para integrar logs de overrides.
            </p>
            <p>Cuando el backend exponga eventos, esta vista mostrara actor, timestamp e impacto.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
