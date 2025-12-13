"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Building } from "@schemas/models";
import { DataTable, type Column } from "@components/admin/DataTable";
import { SearchBar } from "@components/admin/SearchBar";
import { FilterPanel, type FilterConfig } from "@components/admin/FilterPanel";
import { BuildingForm } from "@components/admin/BuildingForm";
import { BulkActions } from "@components/admin/BulkActions";
import { ImportDialog } from "@components/admin/ImportDialog";
import { ExportDialog } from "@components/admin/ExportDialog";
import { ConfirmDialog } from "@components/admin/ConfirmDialog";
import { buildingsToCSV, validateBuildingsFromCSV, downloadCSV } from "@lib/admin/csv";
import { validateAssetPlanCSV } from "@lib/admin/assetplan-csv";
import { logger } from "@lib/logger";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function BuildingsAdminPage() {
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
        limit: String(pagination.limit),
        ...(search && { search }),
        ...(filters.comuna && { comuna: String(filters.comuna) }),
      });

      const response = await fetch(`/api/admin/buildings?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar edificios");
      }

      setBuildings(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filters]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const handleCreate = () => {
    setEditingBuilding(undefined);
    setShowForm(true);
  };

  const handleEdit = (building: Building) => {
    setEditingBuilding(building);
    setShowForm(true);
  };

  const handleDelete = (building: Building) => {
    setDeleteConfirm({ building, isBulk: false });
  };

  const confirmDelete = async () => {
    const { building } = deleteConfirm;
    if (!building) return;

    try {
      const response = await fetch(`/api/admin/buildings/${building.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar edificio");
      }

      toast.success(`Edificio "${building.name}" eliminado correctamente`);
      setDeleteConfirm({ building: null, isBulk: false });
      fetchBuildings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido al eliminar edificio");
    }
  };

  const handleFormSubmit = async (data: Building) => {
    try {
      setFormLoading(true);
      const url = editingBuilding
        ? `/api/admin/buildings/${editingBuilding.id}`
        : "/api/admin/buildings";
      const method = editingBuilding ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar edificio");
      }

      setShowForm(false);
      setEditingBuilding(undefined);
      toast.success(
        editingBuilding
          ? `Edificio "${data.name}" actualizado correctamente`
          : `Edificio "${data.name}" creado correctamente`
      );
      fetchBuildings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido al guardar edificio");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkDelete = () => {
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
          ids: selected.map((b) => b.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar edificios");
      }

      toast.success(`${selected.length} edificio(s) eliminado(s) correctamente`);
      setSelected([]);
      setDeleteConfirm({ building: null, isBulk: false });
      fetchBuildings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido al eliminar edificios");
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();

      // Detectar formato: AssetPlan (separado por ;) o formato estándar (separado por ,)
      const isAssetPlanFormat = text.includes(";") && text.includes("Condominio");

      let valid: Building[] = [];
      let invalid: Array<{ data: Partial<Building>; errors: string[] }> = [];
      let parseErrors: Array<{ row: number; error: string }> = [];

      if (isAssetPlanFormat) {
        // Formato AssetPlan
        const result = validateAssetPlanCSV(text);
        valid = result.valid;
        invalid = result.invalid;
        parseErrors = result.parseErrors;
      } else {
        // Formato estándar
        const result = validateBuildingsFromCSV(text);
        valid = result.valid;
        invalid = result.invalid;
      }

      // Mostrar errores si los hay
      if (parseErrors.length > 0) {
        const errorMsg = `Errores de parsing: ${parseErrors.length}\n${parseErrors.slice(0, 3).map(e => `Fila ${e.row}: ${e.error}`).join('\n')}`;
        logger.warn(errorMsg);
      }

      if (invalid.length > 0) {
        // Mostrar detalles de los errores en la consola
        logger.error("Errores de validación:", invalid);
        logger.error("Datos inválidos:", invalid.map(inv => inv.data));

        toast.warning(
          `${invalid.length} edificio(s) con errores de validación. Continuando con ${valid.length} válido(s)...`,
          { duration: 5000 }
        );
      }

      if (valid.length === 0) {
        throw new Error("No hay registros válidos para importar");
      }

      // Importar en lotes para evitar timeouts
      const batchSize = 10;
      let imported = 0;
      let failed = 0;

      for (let i = 0; i < valid.length; i += batchSize) {
        const batch = valid.slice(i, i + batchSize);

        const response = await fetch("/api/admin/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "import",
            entity: "buildings",
            data: batch,
          }),
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
        toast.warning(`Importación completada: ${imported} edificios importados, ${failed} fallaron.`);
      } else {
        toast.success(`${imported} edificios importados correctamente.`);
      }

      fetchBuildings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al importar edificios");
      throw err;
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      if (format === "csv") {
        const csv = buildingsToCSV(selected.length > 0 ? selected : buildings);
        downloadCSV(csv, `buildings-${new Date().toISOString().split("T")[0]}.csv`);
      } else {
        const json = JSON.stringify(
          selected.length > 0 ? selected : buildings,
          null,
          2
        );
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `buildings-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al exportar");
    }
  };

  const filterConfigs: FilterConfig[] = [
    {
      key: "comuna",
      label: "Comuna",
      type: "select",
      options: Array.from(new Set(buildings.map((b) => b.comuna))).map(
        (comuna) => ({ label: comuna, value: comuna })
      ),
    },
  ];

  const columns: Column<Building>[] = [
    { key: "name", label: "Nombre", sortable: true },
    { key: "slug", label: "Slug", sortable: true },
    { key: "comuna", label: "Comuna", sortable: true },
    { key: "address", label: "Dirección", sortable: false },
    {
      key: "units",
      label: "Unidades",
      sortable: false,
      render: (value) => {
        const units = value as Building["units"];
        return `${units?.length || 0}`;
      },
    },
    {
      key: "amenities",
      label: "Amenities",
      sortable: false,
      render: (value) => {
        const amenities = value as string[];
        return `${amenities?.length || 0}`;
      },
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">
              Gestión de Edificios
            </h1>
            <p className="text-[var(--subtext)]">
              Administra los edificios del sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 rounded-lg bg-[var(--soft)] text-[var(--text)] hover:bg-[var(--soft)]/80 transition-colors ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              Importar
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="px-4 py-2 rounded-lg bg-[var(--soft)] text-[var(--text)] hover:bg-[var(--soft)]/80 transition-colors ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              Exportar
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-lg bg-brand-violet text-white hover:bg-brand-violet/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              + Nuevo Edificio
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre, slug, comuna..."
            />
          </div>
          <FilterPanel
            filters={filterConfigs}
            values={filters}
            onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onClear={() => setFilters({})}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-600/20 text-red-400">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="rounded-2xl bg-[var(--soft)] ring-1 ring-white/10 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4 text-[var(--text)]">
              {editingBuilding ? "Editar Edificio" : "Nuevo Edificio"}
            </h2>
            <BuildingForm
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
      )}

      {/* Table */}
      <DataTable
        data={buildings}
        columns={columns}
        onRowAction={(action, row) => {
          if (action === "edit") handleEdit(row);
          if (action === "delete") handleDelete(row);
        }}
        selectable
        onSelectionChange={setSelected}
        loading={loading}
        emptyMessage="No hay edificios disponibles"
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-[var(--subtext)]">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 rounded-lg bg-[var(--soft)] text-[var(--text)] hover:bg-[var(--soft)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              Anterior
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 rounded-lg bg-[var(--soft)] text-[var(--text)] hover:bg-[var(--soft)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActions
        selected={selected}
        onBulkDelete={handleBulkDelete}
        onExport={() => setShowExport(true)}
        onClearSelection={() => setSelected([])}
      />

      {/* Import Dialog */}
      <ImportDialog
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        onExport={handleExport}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.building !== null || deleteConfirm.isBulk}
        title={deleteConfirm.isBulk ? "Eliminar Múltiples Edificios" : "Eliminar Edificio"}
        message={
          deleteConfirm.isBulk
            ? `¿Estás seguro de eliminar ${selected.length} edificio(s)? Esta acción no se puede deshacer.`
            : `¿Estás seguro de eliminar el edificio "${deleteConfirm.building?.name}"? Esta acción no se puede deshacer.`
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

