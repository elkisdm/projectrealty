"use client";

import { cn } from "@/lib/utils";

interface HeroQuickPillsProps {
  beds: string | string[] | undefined;
  petFriendly: string | undefined;
  parking: string | undefined;
  onBedsChange: (value: string | string[] | undefined) => void;
  onPetFriendlyChange: (value: string | undefined) => void;
  onParkingChange: (value: string | undefined) => void;
  className?: string;
}

const BEDS_OPTIONS = [
  { display: "Studio", value: "studio" as const },
  { display: "1D", value: "1" as const },
  { display: "2D", value: "2" as const },
  { display: "3D+", value: "3plus" as const },
];

function isBedsSelected(
  beds: string | string[] | undefined,
  value: string
): boolean {
  if (!beds) return false;
  const arr = Array.isArray(beds) ? beds : [beds];
  return arr.includes(value);
}

export function HeroQuickPills({
  beds,
  petFriendly,
  parking,
  onBedsChange,
  onPetFriendlyChange,
  onParkingChange,
  className = "",
}: HeroQuickPillsProps) {
  const handleBedsClick = (value: string) => {
    const arr = Array.isArray(beds) ? [...beds] : beds ? [beds] : [];
    const idx = arr.indexOf(value);
    if (idx >= 0) {
      arr.splice(idx, 1);
      onBedsChange(arr.length > 0 ? arr : undefined);
    } else {
      onBedsChange([...arr, value]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground shrink-0">Tipología:</span>
        {BEDS_OPTIONS.map((opt) => (
          <Pill
            key={opt.value}
            label={opt.display}
            selected={isBedsSelected(beds, opt.value)}
            onToggle={() => handleBedsClick(opt.value)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill
          label="Pet friendly"
          selected={petFriendly === "true"}
          onToggle={() => onPetFriendlyChange(petFriendly === "true" ? undefined : "true")}
        />
        <Pill
          label="Estacionamiento"
          selected={parking === "true"}
          onToggle={() => onParkingChange(parking === "true" ? undefined : "true")}
        />
      </div>
    </div>
  );
}

function Pill({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px] min-w-[36px] justify-center",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {label}
    </button>
  );
}
