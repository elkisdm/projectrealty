"use client";

import { ChevronDown } from "lucide-react";

interface CompactRowProps {
  priceMax: string | undefined;
  moveIn: string | undefined;
  onPriceMaxChange: (value: string | undefined) => void;
  onMoveInChange: (value: string | undefined) => void;
  className?: string;
}

const PRICE_OPTIONS = [
  { value: "", label: "Presupuesto" },
  { value: "400000", label: "$400.000" },
  { value: "500000", label: "$500.000" },
  { value: "650000", label: "$650.000" },
  { value: "800000", label: "$800.000" },
  { value: "1000000", label: "$1.000.000" },
  { value: "1500000", label: "$1.500.000" },
  { value: "2000000", label: "$2.000.000" },
];

const MOVE_IN_OPTIONS = [
  { value: "", label: "Mudanza" },
  { value: "now", label: "Ahora" },
  { value: "30d", label: "30 días" },
  { value: "60d", label: "60 días" },
];

/**
 * Compact row with budget selector and move-in date
 * QuintoAndar-style compact form progression
 */
export function CompactRow({
  priceMax,
  moveIn,
  onPriceMaxChange,
  onMoveInChange,
  className = "",
}: CompactRowProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {/* Presupuesto máx */}
      <div className="relative">
        <select
          value={priceMax || ""}
          onChange={(e) => onPriceMaxChange(e.target.value || undefined)}
          className="w-full h-[52px] px-4 pr-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
          aria-label="Presupuesto máximo"
        >
          {PRICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>

      {/* Mudanza */}
      <div className="relative">
        <select
          value={moveIn || ""}
          onChange={(e) => onMoveInChange(e.target.value || undefined)}
          className="w-full h-[52px] px-4 pr-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
          aria-label="Fecha de mudanza"
        >
          {MOVE_IN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
