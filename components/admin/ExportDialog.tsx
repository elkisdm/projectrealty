"use client";

import { useState } from "react";

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "csv" | "json") => Promise<void>;
  loading?: boolean;
}

export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  loading = false,
}: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "json">("csv");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onExport(format);
      onClose();
    } catch (error) {
      // El error será manejado por el componente padre
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="rounded-2xl bg-[var(--soft)] ring-1 ring-white/10 shadow-lg w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4 text-[var(--text)]">
            Exportar Datos
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Formato de exportación
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg bg-[var(--bg)] hover:bg-[var(--bg)]/80 transition-colors">
                  <input
                    type="radio"
                    value="csv"
                    checked={format === "csv"}
                    onChange={(e) => setFormat(e.target.value as "csv")}
                    className="text-brand-violet focus:ring-2 focus:ring-brand-violet"
                  />
                  <span className="text-sm text-[var(--text)]">CSV (Excel compatible)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg bg-[var(--bg)] hover:bg-[var(--bg)]/80 transition-colors">
                  <input
                    type="radio"
                    value="json"
                    checked={format === "json"}
                    onChange={(e) => setFormat(e.target.value as "json")}
                    className="text-brand-violet focus:ring-2 focus:ring-brand-violet"
                  />
                  <span className="text-sm text-[var(--text)]">JSON (Datos completos)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--bg)]/80 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-brand-violet text-white hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
              >
                {loading ? "Exportando..." : "Exportar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


