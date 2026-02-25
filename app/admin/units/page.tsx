"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Unit, Building } from "@schemas/models";
import { FichaPropiedad } from "@components/admin/FichaPropiedad";
import { BulkActions } from "@components/admin/BulkActions";
import { ImportDialog } from "@components/admin/ImportDialog";
import { ExportDialog } from "@components/admin/ExportDialog";
import { SearchBar } from "@components/admin/SearchBar";
import {
  DataGrid,
  FilterDrawer,
  PageHeader,
  ErrorState,
  PermissionState,
  StatusBadge,
} from "@components/admin/ui";
import type { DataGridColumn, DataGridRowAction, FilterField } from "@/types/admin-ui";
import { unitsToCSV, validateUnitsFromCSV, downloadCSV } from "@lib/admin/csv";
import { getErrorMessage } from "@lib/admin/client-errors";
import { logger } from "@lib/logger";
import { useAdminAuth } from "@hooks/useAdminAuth";

interface UnitWithBuilding extends Unit {
  buildingId: string;
  buildingName: string;
  publicationStatus?: "draft" | "published" | "archived";
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function UnitsAdminPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [units, setUnits] = useState<UnitWithBuilding[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [selected, setSelected] = useState<UnitWithBuilding[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitWithBuilding | undefined>();
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/buildings?page_size=1000")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBuildings(data.data);
        }
      })
      .catch((fetchError) => logger.error("Error fetching buildings:", fetchError));
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(pagination.page),
        page_size: String(pagination.limit),
        ...(search ? { search } : {}),
        ...(filters.buildingId ? { building_id: String(filters.buildingId) } : {}),
        ...(filters.tipologia ? { typology: String(filters.tipologia) } : {}),
        ...(filters.disponible !== undefined ? { disponible: String(filters.disponible) } : {}),
        ...(filters.price_min ? { price_min: String(filters.price_min) } : {}),
        ...(filters.price_max ? { price_max: String(filters.price_max) } : {}),
        ...(filters.status ? { status: String(filters.status) } : {}),
      });

      const response = await fetch(`/api/admin/units?${params}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(getErrorMessage(data.error, "Error al cargar unidades"));
      }

      setUnits(data.data || []);
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
    void fetchUnits();
  }, [fetchUnits]);

  const handleCreate = () => {
    setEditingUnit(undefined);
    setShowForm(true);
  };

  const handleEdit = (unit: UnitWithBuilding) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const handleDelete = async (unit: UnitWithBuilding) => {
    if (user?.role !== "admin") {
      toast.error("Solo administradores pueden eliminar unidades");
      return;
    }

    if (!confirm(`Estas seguro de eliminar la unidad "${unit.id}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/units/${unit.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Error al eliminar unidad");
      }
      toast.success(`Unidad "${unit.id}" eliminada correctamente`);
      void fetchUnits();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handlePublish = async (unit: UnitWithBuilding) => {
    if (user?.role === "viewer") {
      toast.error("Tu rol actual no permite publicar");
      return;
    }

    try {
      const response = await fetch(`/api/admin/units/${unit.id}/publish`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "No se pudo publicar la unidad");
      }
      toast.success("Unidad publicada");
      void fetchUnits();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error publicando unidad");
    }
  };

  const handleArchive = async (unit: UnitWithBuilding) => {
    if (user?.role === "viewer") {
      toast.error("Tu rol actual no permite archivar");
      return;
    }

    try {
      const response = await fetch(`/api/admin/units/${unit.id}/archive`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "No se pudo archivar la unidad");
      }
      toast.success("Unidad archivada");
      void fetchUnits();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error archivando unidad");
    }
  };

  const handleContinueDraft = (unit: UnitWithBuilding) => {
    router.push(`/admin/listar-propiedad?draft=${encodeURIComponent(unit.id)}`);
  };

  const handleFormSubmit = async (data: Unit) => {
    try {
      setFormLoading(true);
      const url = editingUnit ? `/api/admin/units/${editingUnit.id}` : "/api/admin/units";
      const method = editingUnit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUnit ? data : { ...data, buildingId: data.buildingId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(getErrorMessage(errorData.error, "Error al guardar unidad"));
      }

      setShowForm(false);
      setEditingUnit(undefined);
      toast.success(editingUnit ? `Unidad "${data.id}" actualizada` : `Unidad "${data.id}" creada`);
      void fetchUnits();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (user?.role !== "admin") {
      toast.error("Solo administradores pueden eliminar unidades");
      return;
    }

    if (!confirm(`Estas seguro de eliminar ${selected.length} unidades?`)) return;

    try {
      const response = await fetch("/api/admin/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          entity: "units",
          ids: selected.map((item) => item.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar unidades");
      }

      setSelected([]);
      toast.success(`${selected.length} unidad(es) eliminada(s)`);
      void fetchUnits();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const isAssetPlanFormat = text.includes(";") && (text.includes("Tipologia") || text.includes("OP"));

    if (isAssetPlanFormat) {
      toast.error("Importa primero edificios AssetPlan para crear unidades relacionadas.");
      return;
    }

    const { valid, invalid } = validateUnitsFromCSV(text);

    if (invalid.length > 0) {
      logger.error("Errores de validacion:", invalid);
      const details = invalid
        .slice(0, 5)
        .map((item, idx) => `${item.data.id || `Unidad ${idx + 1}`}: ${item.errors.join(", ")}`)
        .join("\n");
      if (!confirm(`${invalid.length} invalidos y ${valid.length} validos.\n\n${details}\n\nContinuar?`)) return;
    }

    if (valid.length === 0) {
      throw new Error("No hay registros validos para importar.");
    }

    const csvLines = text.split("\n").filter((line) => line.trim());
    const headers = csvLines[0]?.split(",").map((header) => header.trim().toLowerCase()) || [];
    const buildingIdIndex = headers.indexOf("buildingid");

    const unitsWithBuildings = valid.map((unit, index) => {
      const dataLine = csvLines[index + 1];
      let buildingId = "";
      if (dataLine && buildingIdIndex >= 0) {
        const values = dataLine.split(",");
        buildingId = values[buildingIdIndex]?.trim().replace(/^"|"$/g, "") || "";
      }
      return { ...unit, buildingId };
    });

    const response = await fetch("/api/admin/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "import",
        entity: "units",
        data: unitsWithBuildings,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al importar unidades");
    }

    void fetchUnits();
  };

  const handleExport = async (format: "csv" | "json") => {
    if (format === "csv") {
      const csv = unitsToCSV(selected.length > 0 ? selected : units);
      downloadCSV(csv, `units-${new Date().toISOString().split("T")[0]}.csv`);
      return;
    }

    const json = JSON.stringify(selected.length > 0 ? selected : units, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `units-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "buildingId",
        label: "Edificio",
        controlType: "select",
        options: buildings.map((building) => ({ label: building.name, value: building.id })),
      },
      {
        key: "tipologia",
        label: "Tipologia",
        controlType: "select",
        options: [
          { label: "Studio", value: "Studio" },
          { label: "1D1B", value: "1D1B" },
          { label: "2D1B", value: "2D1B" },
          { label: "2D2B", value: "2D2B" },
          { label: "3D2B", value: "3D2B" },
        ],
      },
      { key: "status", label: "Publicacion", controlType: "select", options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }, { label: "Archived", value: "archived" }] },
      { key: "disponible", label: "Solo disponibles", controlType: "checkbox" },
      { key: "price", label: "Precio", controlType: "range", min: 0, max: 10000000 },
    ],
    [buildings]
  );

  const columns: DataGridColumn<UnitWithBuilding>[] = [
    { key: "id", label: "ID", sortable: true, width: "w-[180px]" },
    { key: "buildingName", label: "Edificio", sortable: true },
    { key: "tipologia", label: "Tipologia", sortable: true, width: "w-[120px]" },
    {
      key: "price",
      label: "Precio",
      sortable: true,
      align: "right",
      renderCell: (value) => `$${Number(value || 0).toLocaleString("es-CL")}`,
    },
    {
      key: "gastosComunes",
      label: "Gastos comunes",
      align: "right",
      renderCell: (value, row) => {
        const gc = value || row.gastoComun || row.gc;
        return gc ? `$${Number(gc).toLocaleString("es-CL")}` : "-";
      },
    },
    {
      key: "m2",
      label: "m2",
      align: "right",
      renderCell: (value) => (value ? `${value} m2` : "-"),
    },
    {
      key: "disponible",
      label: "Disponibilidad",
      renderCell: (value) => <StatusBadge status={value ? "active" : "inactive"} label={value ? "Disponible" : "No disponible"} />,
    },
    {
      key: "publicationStatus",
      label: "Publicacion",
      renderCell: (value) => <StatusBadge status={String(value || "draft")} />,
    },
  ];

  const rowActions: DataGridRowAction<UnitWithBuilding>[] = [
    { key: "continue-draft", label: "Continuar borrador", onClick: handleContinueDraft, minRole: "editor" },
    { key: "publish", label: "Publicar", onClick: handlePublish, minRole: "editor" },
    { key: "archive", label: "Archivar", onClick: handleArchive, minRole: "editor" },
    { key: "edit", label: "Editar", onClick: handleEdit, minRole: "editor" },
    { key: "delete", label: "Eliminar", variant: "danger", onClick: handleDelete, minRole: "admin" },
  ];

  const initialUnitData: Partial<Unit> | undefined = editingUnit
    ? {
        ...editingUnit,
        buildingId: editingUnit.buildingId,
        dormitorios: editingUnit.dormitorios ?? editingUnit.bedrooms,
        banos: editingUnit.banos ?? editingUnit.bathrooms,
        gastoComun: editingUnit.gastoComun ?? editingUnit.gastosComunes,
      }
    : undefined;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Gestion de unidades"
        description="Bandeja de publicaciones: gestiona borradores, publicaciones y archivados."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Unidades" },
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
            label: "Nueva unidad",
            icon: <Plus className="h-4 w-4" />,
            minRole: "editor",
            onClick: handleCreate,
          },
        ]}
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por ID, tipologia o edificio..." />
        </div>
        <FilterDrawer
          fields={filterFields}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onClear={() => setFilters({})}
        />
      </section>

      {error ? <ErrorState description={error} onRetry={() => void fetchUnits()} /> : null}

      {user?.role === "viewer" && showForm ? (
        <PermissionState description="Tu rol actual solo permite lectura. Solicita permisos de editor o admin." />
      ) : null}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-6">
            <FichaPropiedad
              buildingId={editingUnit?.buildingId ?? ""}
              buildings={buildings}
              initialData={initialUnitData}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingUnit(undefined);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      ) : null}

      <DataGrid
        data={units}
        columns={columns}
        loading={loading}
        selectable
        role={user?.role || "viewer"}
        rowActions={rowActions}
        onSelectionChange={setSelected}
        emptyTitle="No hay unidades disponibles"
        emptyDescription="Ajusta los filtros o crea una nueva unidad para comenzar."
        emptyAction={
          user?.role === "viewer" ? null : (
            <button
              onClick={handleCreate}
              className="rounded-lg bg-brand-violet px-3 py-2 text-sm font-medium text-white hover:bg-brand-violet/90"
            >
              Crear unidad
            </button>
          )
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
    </div>
  );
}
