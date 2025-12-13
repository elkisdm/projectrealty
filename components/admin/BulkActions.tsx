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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="rounded-2xl bg-[var(--soft)] ring-1 ring-white/10 shadow-lg p-4 flex items-center gap-4">
        <span className="text-sm font-medium text-[var(--text)]">
          {selected.length} {selected.length === 1 ? "elemento" : "elementos"} seleccionado
          {selected.length > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          {onBulkUpdate && (
            <button
              onClick={onBulkUpdate}
              className="px-3 py-1.5 text-sm rounded-lg bg-brand-violet text-white hover:bg-brand-violet/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
            >
              Actualizar
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1.5 text-sm rounded-lg bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--bg)]/80 transition-colors ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
            >
              Exportar
            </button>
          )}
          {onBulkDelete && (
            <button
              onClick={onBulkDelete}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
            >
              Eliminar
            </button>
          )}
          <button
            onClick={onClearSelection}
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--bg)]/80 transition-colors ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}










