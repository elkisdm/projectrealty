"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { DataGridColumn, DataGridRowAction, AdminRole } from "@/types/admin-ui";
import { canAccess } from "@components/admin/ui/role";
import { EmptyState } from "@components/admin/ui/EmptyState";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  loading?: boolean;
  selectable?: boolean;
  role?: AdminRole;
  rowActions?: DataGridRowAction<T>[];
  onSelectionChange?: (rows: T[]) => void;
  rowKey?: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

export function DataGrid<T>({
  data,
  columns,
  loading = false,
  selectable = false,
  role = "viewer",
  rowActions = [],
  onSelectionChange,
  rowKey,
  emptyTitle = "Sin resultados",
  emptyDescription = "No encontramos registros para mostrar.",
  emptyAction,
}: DataGridProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const getRowId = useCallback((row: T, index: number) => {
    if (rowKey) return rowKey(row);
    if (typeof row === "object" && row !== null && "id" in (row as Record<string, unknown>)) {
      const value = (row as Record<string, unknown>).id;
      if (typeof value === "string" || typeof value === "number") return String(value);
    }
    return String(index);
  }, [rowKey]);

  const visibleActions = rowActions.filter((action) => canAccess(role, action.minRole || "viewer"));

  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const mapped: ColumnDef<T>[] = columns.map((column) => ({
      id: String(column.key),
      accessorFn: (row) =>
        typeof row === "object" && row !== null
          ? (row as Record<string, unknown>)[String(column.key)]
          : undefined,
      header: ({ column: tableColumn }) => {
        if (!column.sortable) return <span>{column.label}</span>;
        const isSorted = tableColumn.getIsSorted();
        return (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => tableColumn.toggleSorting(isSorted === "asc")}
            className="h-8 px-0 font-semibold"
          >
            {column.label}
            <span className="ml-1 text-xs">{isSorted === "asc" ? "↑" : isSorted === "desc" ? "↓" : ""}</span>
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue(String(column.key));
        if (column.renderCell) return column.renderCell(value, row.original);
        return String(value ?? "-");
      },
      enableSorting: Boolean(column.sortable),
      meta: {
        align: column.align || "left",
        width: column.width,
      },
    }));

    if (visibleActions.length > 0) {
      mapped.push({
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {visibleActions.map((action) => (
              <Button
                key={`${row.id}-${action.key}`}
                type="button"
                size="sm"
                variant={action.variant === "danger" ? "destructive" : "outline"}
                className="h-8"
                onClick={() => action.onClick(row.original)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ),
      });
    }

    return mapped;
  }, [columns, visibleActions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(next);
    },
    enableRowSelection: selectable,
    state: {
      sorting,
      rowSelection,
    },
    getRowId,
  });

  const selectedRows = useMemo(() => {
    const ids = new Set(Object.entries(rowSelection).filter(([, selected]) => selected).map(([id]) => id));
    return data.filter((row, index) => ids.has(getRowId(row, index)));
  }, [data, rowSelection, getRowId]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  }, [onSelectionChange, selectedRows]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-10 rounded-lg bg-[var(--admin-surface-2)]" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
      <Table>
        <TableHeader className="bg-[var(--admin-surface-2)]/70">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {selectable ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={table.getIsAllRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllRowsSelected(Boolean(value))}
                    aria-label="Seleccionar todas las filas"
                  />
                </TableHead>
              ) : null}
              {headerGroup.headers.map((header) => {
                const headerMeta = header.column.columnDef.meta as { align?: string; width?: string } | undefined;
                const alignClass = headerMeta?.align === "right" ? "text-right" : "text-left";
                const widthClass = headerMeta?.width ?? "";
                return (
                  <TableHead
                    key={header.id}
                    className={[alignClass, widthClass].filter(Boolean).join(" ")}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
              {selectable ? (
                <TableCell className="w-10">
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
                    aria-label="Seleccionar fila"
                  />
                </TableCell>
              ) : null}
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as { align?: string; width?: string } | undefined;
                const alignClass = meta?.align === "right" ? "text-right" : "text-left";
                const widthClass = meta?.width ?? "";
                return (
                  <TableCell
                    key={cell.id}
                    className={[alignClass, widthClass].filter(Boolean).join(" ")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectable && table.getSelectedRowModel().rows.length > 0 ? (
        <div className="border-t border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-3 py-2 text-xs text-[var(--subtext)]">
          {table.getSelectedRowModel().rows.length} seleccionado(s)
        </div>
      ) : null}
    </div>
  );
}
