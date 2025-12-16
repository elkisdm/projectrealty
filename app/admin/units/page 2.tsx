"use client";

import { useState, useEffect, useCallback } from "react";
import type { Unit, Building } from "@schemas/models";
import { DataTable, type Column } from "@components/admin/DataTable";
import { SearchBar } from "@components/admin/SearchBar";
import { FilterPanel, type FilterConfig } from "@components/admin/FilterPanel";
import { UnitForm } from "@components/admin/UnitForm";
import { BulkActions } from "@components/admin/BulkActions";
import { ImportDialog } from "@components/admin/ImportDialog";
import { ExportDialog } from "@components/admin/ExportDialog";
import { unitsToCSV, validateUnitsFromCSV, downloadCSV } from "@lib/admin/csv";

interface UnitWithBuilding extends Unit {
  buildingId: string;
  buildingName: string;
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

  // Cargar edificios para el selector
  useEffect(() => {
    fetch("/api/admin/buildings?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBuildings(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(search && { search }),
        ...(filters.buildingId && { buildingId: String(filters.buildingId) }),
        ...(filters.tipologia && { tipologia: String(filters.tipologia) }),
        ...(filters.disponible !== undefined && {
          disponible: String(filters.disponible),
        }),
        ...(filters.minPrice && { minPrice: String(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: String(filters.maxPrice) }),
      });

      const response = await fetch(`/api/admin/units?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar unidades");
      }

      setUnits(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filters]);

  useEffect(() => {
    fetchUnits();
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
    if (!confirm(`¿Estás seguro de eliminar la unidad "${unit.id}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/units/${unit.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar unidad");
      }

      fetchUnits();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleFormSubmit = async (data: Unit, buildingId: string) => {
    try {
      setFormLoading(true);
      const url = editingUnit
        ? `/api/admin/units/${editingUnit.id}`
        : "/api/admin/units";
      const method = editingUnit ? "PUT" : "POST";

      const body = editingUnit
        ? data
        : { ...data, buildingId };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar unidad");
      }

      setShowForm(false);
      setEditingUnit(undefined);
      fetchUnits();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar ${selected.length} unidades?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          entity: "units",
          ids: selected.map((u) => u.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar unidades");
      }

      setSelected([]);
      fetchUnits();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      
      // Detectar formato: AssetPlan (separado por ;) o formato estándar (separado por ,)
      const isAssetPlanFormat = text.includes(";") && (text.includes("Tipologia") || text.includes("OP"));
      
      let valid: Unit[] = [];
      let invalid: Array<{ data: Partial<Unit>; errors: string[] }> = [];
      
      if (isAssetPlanFormat) {
        // Para AssetPlan, necesitamos importar desde edificios primero
        // o crear una función específica para unidades AssetPlan
        alert("Para importar unidades desde CSV de AssetPlan, primero importa los edificios desde la sección de Edificios. Las unidades se crearán automáticamente.");
        return;
      } else {
        // Formato estándar
        const result = validateUnitsFromCSV(text);
        valid = result.valid;
        invalid = result.invalid;
      }

      if (invalid.length > 0) {
        // Mostrar detalles de los errores
        console.error("Errores de validación:", invalid);
        const errorDetails = invalid.slice(0, 5).map((inv, idx) => {
          const unitId = inv.data.id || `Unidad ${idx + 1}`;
          const allErrors = inv.errors.join('\n  - ');
          return `${unitId}:\n  - ${allErrors}`;
        }).join('\n\n');
        
        const invalidMsg = `${invalid.length} registro(s) inválido(s).\n${valid.length} registro(s) válido(s) para importar.\n\nDetalles de errores:\n\n${errorDetails}\n\n¿Deseas continuar con la importación de los ${valid.length} registro(s) válido(s)?`;
        
        if (!confirm(invalidMsg)) {
          return;
        }
      }

      if (valid.length === 0) {
        throw new Error("No hay registros válidos para importar. Revisa la consola para ver los detalles de los errores.");
      }

      // Necesitamos buildingId para cada unidad
      // Parsear el CSV nuevamente para obtener los buildingIds originales
      const csvLines = text.split('\n').filter(line => line.trim());
      const headers = csvLines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
      const buildingIdIndex = headers.indexOf('buildingid');
      
      const unitsWithBuildings = valid.map((unit, index) => {
        // Obtener el buildingId del CSV original
        const dataLine = csvLines[index + 1]; // +1 porque la primera línea son headers
        let buildingId = "";
        if (dataLine && buildingIdIndex >= 0) {
          const values = dataLine.split(',');
          buildingId = values[buildingIdIndex]?.trim().replace(/^"|"$/g, '') || "";
        }
        return {
          ...unit,
          buildingId,
        };
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

      fetchUnits();
    } catch (err) {
      throw err;
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      if (format === "csv") {
        const csv = unitsToCSV(selected.length > 0 ? selected : units);
        downloadCSV(csv, `units-${new Date().toISOString().split("T")[0]}.csv`);
      } else {
        const json = JSON.stringify(
          selected.length > 0 ? selected : units,
          null,
          2
        );
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `units-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al exportar");
    }
  };

  const filterConfigs: FilterConfig[] = [
    {
      key: "buildingId",
      label: "Edificio",
      type: "select",
      options: buildings.map((b) => ({ label: b.name, value: b.id })),
    },
    {
      key: "tipologia",
      label: "Tipología",
      type: "select",
      options: [
        { label: "Studio", value: "Studio" },
        { label: "1D1B", value: "1D1B" },
        { label: "2D1B", value: "2D1B" },
        { label: "2D2B", value: "2D2B" },
        { label: "3D2B", value: "3D2B" },
      ],
    },
    {
      key: "disponible",
      label: "Disponible",
      type: "checkbox",
    },
    {
      key: "price",
      label: "Precio",
      type: "range",
      min: 0,
      max: 10000000,
    },
  ];

  const columns: Column<UnitWithBuilding>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "buildingName", label: "Edificio", sortable: true },
    { key: "tipologia", label: "Tipología", sortable: true },
    {
      key: "price",
      label: "Precio",
      sortable: true,
      render: (value) => `$${(value as number).toLocaleString("es-CL")}`,
    },
    {
      key: "gastosComunes",
      label: "Gastos Comunes",
      sortable: true,
      render: (value) => value ? `$${(value as number).toLocaleString("es-CL")}` : "-",
    },
    {
      key: "m2",
      label: "Área (m²)",
      sortable: true,
      render: (value) => `${value} m²`,
    },
    {
      key: "disponible",
      label: "Disponible",
      sortable: true,
      render: (value) => (
        <span className={value ? "text-green-400" : "text-red-400"}>
          {value ? "✓" : "✗"}
        </span>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">
              Gestión de Unidades
            </h1>
            <p className="text-[var(--subtext)]">
              Administra las unidades del sistema
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
              + Nueva Unidad
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buscar por tipología, edificio..."
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
              {editingUnit ? "Editar Unidad" : "Nueva Unidad"}
            </h2>
            <UnitForm
              initialData={editingUnit}
              buildings={buildings}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingUnit(undefined);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        data={units}
        columns={columns}
        onRowAction={(action, row) => {
          if (action === "edit") handleEdit(row);
          if (action === "delete") handleDelete(row);
        }}
        selectable
        onSelectionChange={setSelected}
        loading={loading}
        emptyMessage="No hay unidades disponibles"
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
    </div>
  );
}

