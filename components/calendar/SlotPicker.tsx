"use client";

import { useMemo } from "react";
import type { AvailabilitySlot } from "@/types/calendar";
import { clx } from "@lib/utils";

export type SlotPickerProps = {
  slots: AvailabilitySlot[];
  onSelect?: (slot: AvailabilitySlot) => void;
  className?: string;
};

export default function SlotPicker({ slots, onSelect, className }: SlotPickerProps) {
  const available = useMemo(() => slots.filter((s) => s.available), [slots]);

  if (available.length === 0) {
    return (
      <div className={clx("px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400", className)} aria-live="polite">
        No hay horarios disponibles para este día.
      </div>
    );
  }

  return (
    <ul className={clx("px-4 py-3 grid grid-cols-2 gap-2", className)} role="list">
      {available.map((slot) => (
        <li key={slot.start} role="listitem">
          <button
            type="button"
            className={clx(
              "w-full rounded-xl border border-[var(--ring)]/20 bg-gray-800:bg-zinc-900 text-sm",
              "px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm",
              "transition-colors motion-reduce:transition-none",
              "hover:bg-violet-50 dark:hover:bg-violet-900/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900"
            )}
            onClick={() => onSelect?.(slot)}
            aria-label={`Seleccionar ${formatHour(slot.start)} a ${formatHour(slot.end)}`}
          >
            <span className="tabular-nums">
              {formatHour(slot.start)} – {formatHour(slot.end)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function formatHour(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
