"use client";

import { useState, useMemo } from "react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onRowAction?: (action: string, row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onRowAction,
  selectable = false,
  onSelectionChange,
  loading = false,
  emptyMessage = "No hay datos disponibles",
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column.key);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map((row) => row.id));
      setSelectedRows(allIds);
      onSelectionChange?.(data);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);

    const selectedData = data.filter((row) => newSelected.has(row.id));
    onSelectionChange?.(selectedData);
  };

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  if (loading) {
    return (
      <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-12 bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-12 text-center">
        <p className="text-[var(--subtext)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--bg)]/50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
                    aria-label="Seleccionar todos"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 text-left text-sm font-medium text-[var(--text)] ${
                    column.sortable ? "cursor-pointer hover:bg-[var(--soft)]" : ""
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-[var(--subtext)]">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {onRowAction && (
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text)]">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedData.map((row) => {
              const isSelected = selectedRows.has(row.id);
              return (
                <tr
                  key={row.id}
                  className={`hover:bg-[var(--soft)]/50 transition-colors ${
                    isSelected ? "bg-[var(--soft)]/30" : ""
                  } ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(row.id, e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
                        aria-label={`Seleccionar ${row.id}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = row[column.key as keyof T];
                    return (
                      <td
                        key={String(column.key)}
                        className="px-4 py-3 text-sm text-[var(--text)]"
                      >
                        {column.render
                          ? column.render(value, row)
                          : String(value ?? "")}
                      </td>
                    );
                  })}
                  {onRowAction && (
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRowAction("edit", row)}
                          className="px-3 py-1 text-sm rounded-lg bg-[var(--soft)] text-[var(--text)] hover:bg-[var(--soft)]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
                          aria-label="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onRowAction("delete", row)}
                          className="px-3 py-1 text-sm rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
                          aria-label="Eliminar"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}










