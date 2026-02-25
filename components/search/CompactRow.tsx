"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompactRowProps {
  priceMax: string | undefined;
  moveIn: string | undefined;
  onPriceMaxChange: (value: string | undefined) => void;
  onMoveInChange: (value: string | undefined) => void;
  className?: string;
}

const PLACEHOLDER = "__none__";
const PRICE_OPTIONS = [
  { value: PLACEHOLDER, label: "Presupuesto" },
  { value: "400000", label: "$400.000" },
  { value: "500000", label: "$500.000" },
  { value: "650000", label: "$650.000" },
  { value: "800000", label: "$800.000" },
  { value: "1000000", label: "$1.000.000" },
  { value: "1500000", label: "$1.500.000" },
  { value: "2000000", label: "$2.000.000" },
];

const MOVE_IN_OPTIONS = [
  { value: PLACEHOLDER, label: "Mudanza" },
  { value: "now", label: "Ahora" },
  { value: "30d", label: "30 días" },
  { value: "60d", label: "60 días" },
];

export function CompactRow({
  priceMax,
  moveIn,
  onPriceMaxChange,
  onMoveInChange,
  className = "",
}: CompactRowProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <Select
        value={priceMax || PLACEHOLDER}
        onValueChange={(v) => onPriceMaxChange(v === PLACEHOLDER ? undefined : v)}
      >
        <SelectTrigger
          className="h-11 rounded-xl border-input bg-background"
          aria-label="Presupuesto máximo"
        >
          <SelectValue placeholder="Presupuesto" />
        </SelectTrigger>
        <SelectContent>
          {PRICE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={moveIn || PLACEHOLDER}
        onValueChange={(v) => onMoveInChange(v === PLACEHOLDER ? undefined : v)}
      >
        <SelectTrigger
          className="h-11 rounded-xl border-input bg-background"
          aria-label="Fecha de mudanza"
        >
          <SelectValue placeholder="Mudanza" />
        </SelectTrigger>
        <SelectContent>
          {MOVE_IN_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
