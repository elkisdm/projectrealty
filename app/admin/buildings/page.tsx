"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, PlusSquare, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Building } from "@schemas/models";
import { FichaCondominio } from "@components/admin/FichaCondominio";
import { BulkActions } from "@components/admin/BulkActions";
import { ImportDialog } from "@components/admin/ImportDialog";
import { ExportDialog } from "@components/admin/ExportDialog";
import { ConfirmDialog } from "@components/admin/ConfirmDialog";
import { SearchBar } from "@components/admin/SearchBar";
import { buildingsToCSV, validateBuildingsFromCSV, downloadCSV } from "@lib/admin/csv";
import { validateAssetPlanCSV } from "@lib/admin/assetplan-csv";
import { getErrorMessage } from "@lib/admin/client-errors";
import { logger } from "@lib/logger";
import { useAdminAuth } from "@hooks/useAdminAuth";
import {
  DataGrid,
  FilterDrawer,
  PageHeader,
  ErrorState,
  PermissionState,
  StatusBadge,
} from "@components/admin/ui";
import type { DataGridColumn, DataGridRowAction, FilterField } from "@/types/admin-ui";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function BuildingsAdminPage() {
  const { user } = useAdminAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [selected, setSelected] = useState<Building[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | undefined>();
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ building: Building | null; isBulk: boolean }>({
    building: null,
    isBulk: false,
  });

  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(pagination.page),
        page_size: String(pagination.limit),
        ...(search ? { search } : {}),
        ...(filters.comuna ? { city: String(filters.comuna) } : {}),
        ...(filters.is_active !== undefined ? { is_active: String(filters.is_active) } : {}),
      });

      const response = await fetch(`/api/admin/buildings?${params}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(getErrorMessage(data.error, "Error al cargar edificios"));
      }

      setBuildings(data.data || []);
      const meta = data.pagination || data.meta;
      setPagination({
        page: meta?.page || 1,
        limit: meta?.page_size || pagination.limit,
        total: meta?.total || 0,
        totalPages: meta?.total_pages || 1,
        hasNextPage: Boolean(meta?.has_next_page),
        hasPrevPage: Boolean(meta?.has_prev_page),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.page, search]);

  useEffect(() => {
    void fetchBuildings();
  }, [fetchBuildings]);

  const handleEdit = (building: Building) => {
    setEditingBuilding(building);
    setShowForm(true);
  };

  const handleDelete = (building: Building) => {
    if (user?.role !== "admin") {
      toast.error("Solo administradores pueden eliminar edificios");
      return;
    }
    setDeleteConfirm({ building, isBulk: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.building) return;
    try {
      const response = await fetch(`/api/admin/buildings/${deleteConfirm.building.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Error al eliminar edificio");
      }
      toast.success(`Edificio "${deleteConfirm.building.name}" eliminado`);
      setDeleteConfirm({ building: null, isBulk: false });
      void fetchBuildings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido al eliminar edificio");
    }
  };

  const handleFormSubmit = async (data: Omit<Building, "units">) => {
    if (!editingBuilding) {
      toast.error("La creacion de edificios se realiza desde Listar propiedad");
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch(`/api/admin/buildings/${editingBuilding.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(getErrorMessage(errorData.error, "Error al guardar edificio"));
      }

      setShowForm(false);
      setEditingBuilding(undefined);
      toast.success(`Edificio "${data.name}" actualizado`);
      void fetchBuildings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido al guardar edificio");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (user?.role !== "admin") {
      toast.error("Solo administradores pueden eliminar edificios");
      return;
    }
    if (selected.length === 0) return;
    setDeleteConfirm({ building: null, isBulk: true });
  };

  const confirmBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      const response = await fetch("/api/admin/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          entity: "buildings",
          ids: selected.map((building) => building.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar edificios");
      }

      toast.success(`${selected.length} edificio(s) eliminado(s)`);
      setSelected([]);
      setDeleteConfirm({ building: null, isBulk: false });
      void fetchBuildings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido al eliminar edificios");
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const isAssetPlanFormat = text.includes(";") && text.includes("Condominio");

      let valid: Building[] = [];
      let invalid: Array<{ data: Partial<Building>; errors: string[] }> = [];
      let parseErrors: Array<{ row: number; error: string }> = [];

      if (isAssetPlanFormat) {
        const result = validateAssetPlanCSV(text);
        valid = result.valid;
        invalid = result.invalid;
        parseErrors = result.parseErrors;
      } else {
        const result = validateBuildingsFromCSV(text);
        valid = result.valid;
        invalid = result.invalid;
      }

      if (parseErrors.length > 0) {
        logger.warn(`Errores de parsing: ${parseErrors.length}`);
      }

      if (invalid.length > 0) {
        logger.error("Errores de validacion:", invalid);
        toast.warning(`${invalid.length} edificios invalidos. Se continuara con ${valid.length} validos.`);
      }

      if (valid.length === 0) {
        throw new Error("No hay registros validos para importar");
      }

      const batchSize = 10;
      let imported = 0;
      let failed = 0;

      for (let index = 0; index < valid.length; index += batchSize) {
        const batch = valid.slice(index, index + batchSize);
        const response = await fetch("/api/admin/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation: "import", entity: "buildings", data: batch }),
        });

        if (response.ok) {
          const result = await response.json();
          imported += result.summary?.success || batch.length;
          failed += result.summary?.failed || 0;
        } else {
          failed += batch.length;
        }
      }

      if (failed > 0) {
        toast.warning(`Importacion completada: ${imported} importados, ${failed} fallidos.`);
      } else {
        toast.success(`${imported} edificios importados correctamente.`);
      }

      void fetchBuildings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al importar edificios");
      throw err;
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    if (format === "csv") {
      const csv = buildingsToCSV(selected.length > 0 ? selected : buildings);
      downloadCSV(csv, `buildings-${new Date().toISOString().split("T")[0]}.csv`);
      return;
    }

    const json = JSON.stringify(selected.length > 0 ? selected : buildings, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `buildings-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "comuna",
        label: "Comuna",
        controlType: "select",
        options: Array.from(new Set(buildings.map((building) => building.comuna))).map((comuna) => ({
          label: comuna,
          value: comuna,
        })),
      },
      { key: "is_active", label: "Solo activos", controlType: "checkbox" },
    ],
    [buildings]
  );

  const columns: DataGridColumn<Building>[] = [
    { key: "name", label: "Nombre", sortable: true },
    { key: "slug", label: "Slug", sortable: true },
    { key: "comuna", label: "Comuna", sortable: true },
    { key: "address", label: "Direccion" },
    {
      key: "isActive",
      label: "Estado",
      renderCell: (value) => <StatusBadge status={value ? "active" : "inactive"} label={value ? "Activo" : "Inactivo"} />,
    },
    {
      key: "units",
      label: "Unidades",
      align: "right",
      renderCell: (value) => `${(value as Building["units"])?.length || 0}`,
    },
    {
      key: "amenities",
      label: "Amenities",
      align: "right",
      renderCell: (value) => `${(value as string[])?.length || 0}`,
    },
  ];

  const rowActions: DataGridRowAction<Building>[] = [
    { key: "edit", label: "Editar", minRole: "editor", onClick: handleEdit },
    { key: "delete", label: "Eliminar", minRole: "admin", variant: "danger", onClick: handleDelete },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Gestion de edificios"
        description="Administra informacion comercial y operacional de edificios."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Edificios" },
        ]}
        role={user?.role || "viewer"}
        actions={[
          {
            key: "import",
            label: "Importar",
            icon: <Upload className="h-4 w-4" />,
            variant: "secondary",
            minRole: "editor",
            onClick: () => setShowImport(true),
          },
          {
            key: "export",
            label: "Exportar",
            icon: <Download className="h-4 w-4" />,
            variant: "secondary",
            onClick: () => setShowExport(true),
          },
          {
            key: "new",
            label: "Nuevo edificio/propiedad",
            icon: <PlusSquare className="h-4 w-4" />,
            minRole: "editor",
            href: "/admin/listar-propiedad",
          },
        ]}
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre, slug o comuna..." />
        </div>
        <FilterDrawer
          fields={filterFields}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onClear={() => setFilters({})}
        />
      </section>

      {error ? <ErrorState description={error} onRetry={() => void fetchBuildings()} /> : null}
      {user?.role === "viewer" && showForm ? (
        <PermissionState description="Tu rol actual solo permite lectura. Solicita permisos de editor o admin." />
      ) : null}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-6">
            <FichaCondominio
              initialData={editingBuilding}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingBuilding(undefined);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      ) : null}

      <DataGrid
        data={buildings}
        columns={columns}
        loading={loading}
        selectable
        role={user?.role || "viewer"}
        rowActions={rowActions}
        onSelectionChange={setSelected}
        emptyTitle="No hay edificios disponibles"
        emptyDescription="Importa data o crea una nueva propiedad para iniciar."
        emptyAction={
          <Link href="/admin/listar-propiedad" className="rounded-lg bg-brand-violet px-3 py-2 text-sm font-medium text-white hover:bg-brand-violet/90">
            Crear desde wizard
          </Link>
        }
      />

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] px-4 py-3">
          <p className="text-sm text-[var(--subtext)]">
            Pagina {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrevPage}
              className="min-h-[38px] rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-3 py-1.5 text-sm text-[var(--text)] disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNextPage}
              className="min-h-[38px] rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-3 py-1.5 text-sm text-[var(--text)] disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}

      <BulkActions
        selected={selected}
        onBulkDelete={user?.role === "admin" ? handleBulkDelete : undefined}
        onExport={() => setShowExport(true)}
        onClearSelection={() => setSelected([])}
      />

      <ImportDialog isOpen={showImport} onClose={() => setShowImport(false)} onImport={handleImport} />
      <ExportDialog isOpen={showExport} onClose={() => setShowExport(false)} onExport={handleExport} />

      <ConfirmDialog
        isOpen={deleteConfirm.building !== null || deleteConfirm.isBulk}
        title={deleteConfirm.isBulk ? "Eliminar multiples edificios" : "Eliminar edificio"}
        message={
          deleteConfirm.isBulk
            ? `Estas seguro de eliminar ${selected.length} edificio(s)? Esta accion no se puede deshacer.`
            : `Estas seguro de eliminar el edificio "${deleteConfirm.building?.name}"? Esta accion no se puede deshacer.`
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={deleteConfirm.isBulk ? confirmBulkDelete : confirmDelete}
        onCancel={() => setDeleteConfirm({ building: null, isBulk: false })}
      />
    </div>
  );
}
