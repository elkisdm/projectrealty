"use client";

import { useState } from "react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "range" | "checkbox";
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | number | boolean) => void;
  onClear: () => void;
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onClear,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = Object.values(values).some(
    (v) => v !== "" && v !== undefined && v !== null
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--soft)] text-[var(--text)] hover:bg-[var(--soft)]/80 transition-colors ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)] ${
          hasActiveFilters ? "ring-2 ring-brand-violet" : ""
        }`}
        aria-expanded={isOpen}
        aria-label="Filtros"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filtros
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-brand-violet text-white">
            {Object.values(values).filter((v) => v !== "" && v !== undefined && v !== null).length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[var(--soft)] ring-1 ring-white/10 shadow-lg z-20 p-4">
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    {filter.label}
                  </label>
                  {filter.type === "select" && filter.options && (
                    <select
                      value={String(values[filter.key] || "")}
                      onChange={(e) => onChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
                    >
                      <option value="">Todos</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {filter.type === "range" && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Mín"
                        min={filter.min}
                        max={filter.max}
                        value={String(values[`${filter.key}_min`] || "")}
                        onChange={(e) =>
                          onChange(
                            `${filter.key}_min`,
                            e.target.value ? parseInt(e.target.value, 10) : ""
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
                      />
                      <input
                        type="number"
                        placeholder="Máx"
                        min={filter.min}
                        max={filter.max}
                        value={String(values[`${filter.key}_max`] || "")}
                        onChange={(e) =>
                          onChange(
                            `${filter.key}_max`,
                            e.target.value ? parseInt(e.target.value, 10) : ""
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
                      />
                    </div>
                  )}
                  {filter.type === "checkbox" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(values[filter.key])}
                        onChange={(e) => onChange(filter.key, e.target.checked)}
                        className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
                      />
                      <span className="text-sm text-[var(--text)]">
                        {filter.label}
                      </span>
                    </label>
                  )}
                </div>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={onClear}
                  className="w-full px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

