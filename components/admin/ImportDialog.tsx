"use client";

import { useState } from "react";

export interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  loading?: boolean;
  acceptedFormats?: string[];
}

export function ImportDialog({
  isOpen,
  onClose,
  onImport,
  loading = false,
  acceptedFormats = [".csv", ".json"],
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor selecciona un archivo");
      return;
    }

    try {
      await onImport(file);
      setFile(null);
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar archivo");
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
            Importar Datos
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Seleccionar archivo
              </label>
              <input
                type="file"
                accept={acceptedFormats.join(",")}
                onChange={handleFileChange}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)] disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-[var(--subtext)]">
                Formatos aceptados: {acceptedFormats.join(", ")}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-600/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {file && (
              <div className="p-3 rounded-lg bg-[var(--bg)] text-sm text-[var(--text)]">
                <p className="font-medium">{file.name}</p>
                <p className="text-[var(--subtext)]">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

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
                disabled={loading || !file}
                className="px-4 py-2 rounded-lg bg-brand-violet text-white hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
              >
                {loading ? "Importando..." : "Importar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}









