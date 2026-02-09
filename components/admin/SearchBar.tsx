"use client";

import { useState, useEffect } from "react";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showShortcutHint?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  debounceMs = 300,
  showShortcutHint = true,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-[var(--subtext)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setLocalValue("");
            onChange("");
          }
        }}
        placeholder={placeholder}
        className="w-full min-h-[40px] pl-10 pr-16 py-2 rounded-lg bg-[var(--admin-surface-1)] text-[var(--text)] placeholder-[var(--subtext)] border border-[var(--admin-border-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        aria-label="Barra de búsqueda"
      />
      {showShortcutHint ? (
        <kbd className="pointer-events-none absolute inset-y-0 right-9 my-auto hidden h-fit rounded border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--subtext)] md:block">
          ESC
        </kbd>
      ) : null}
      {localValue && (
        <button
          onClick={() => {
            setLocalValue("");
            onChange("");
          }}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--subtext)] hover:text-[var(--text)] transition-colors"
          aria-label="Limpiar búsqueda"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}














