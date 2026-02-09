"use client";

export interface BulkActionsProps<T> {
  selected: T[];
  onBulkDelete?: () => void;
  onBulkUpdate?: () => void;
  onExport?: () => void;
  onClearSelection: () => void;
}

export function BulkActions<T extends { id: string }>({
  selected,
  onBulkDelete,
  onBulkUpdate,
  onExport,
  onClearSelection,
}: BulkActionsProps<T>) {
  if (selected.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 transform">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--admin-border-strong)] bg-[var(--admin-surface-1)] p-4 shadow-xl">
        <span className="text-sm font-medium text-[var(--text)]">
          {selected.length} {selected.length === 1 ? "registro seleccionado" : "registros seleccionados"}
        </span>
        <div className="flex items-center gap-2">
          {onBulkUpdate && (
            <button
              onClick={onBulkUpdate}
              className="min-h-[38px] rounded-lg bg-brand-violet px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand-violet/90 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              Actualizar
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="min-h-[38px] rounded-lg bg-[var(--admin-surface-2)] px-3 py-1.5 text-sm text-[var(--text)] ring-1 ring-[var(--admin-border-subtle)] transition-colors hover:bg-[var(--admin-surface-2)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              Exportar
            </button>
          )}
          {onBulkDelete && (
            <button
              onClick={onBulkDelete}
              className="min-h-[38px] rounded-lg bg-rose-500/20 px-3 py-1.5 text-sm text-rose-300 transition-colors hover:bg-rose-500/30 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              Eliminar
            </button>
          )}
          <button
            onClick={onClearSelection}
            className="min-h-[38px] rounded-lg bg-[var(--admin-surface-2)] px-3 py-1.5 text-sm text-[var(--text)] ring-1 ring-[var(--admin-border-subtle)] transition-colors hover:bg-[var(--admin-surface-2)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}














