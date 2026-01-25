"use client";

import { SearchPills } from "@/components/marketing/SearchPills";

interface HeroQuickPillsProps {
  beds: string | string[] | undefined;
  petFriendly: string | undefined;
  parking: string | undefined;
  onBedsChange: (value: string | string[] | undefined) => void;
  onPetFriendlyChange: (value: string | undefined) => void;
  onParkingChange: (value: string | undefined) => void;
  className?: string;
}

const BEDS_OPTIONS = ["Studio", "1D", "2D", "3D+"];
const BEDS_VALUE_MAP: Record<string, "studio" | "1" | "2" | "3plus"> = {
  "Studio": "studio",
  "1D": "1",
  "2D": "2",
  "3D+": "3plus",
};
const BEDS_DISPLAY_MAP: Record<string, string> = {
  "studio": "Studio",
  "1": "1D",
  "2": "2D",
  "3plus": "3D+",
};

/**
 * Quick filter pills for Hero Cocktail
 * Tipología (beds) + Pet friendly + Estacionamiento
 * Airbnb-style quick filters with multi-select support
 */
export function HeroQuickPills({
  beds,
  petFriendly,
  parking,
  onBedsChange,
  onPetFriendlyChange,
  onParkingChange,
  className = "",
}: HeroQuickPillsProps) {
  // Convert beds values to display format
  const bedsDisplay = Array.isArray(beds)
    ? beds.map((b) => BEDS_DISPLAY_MAP[b] || b)
    : beds
      ? [BEDS_DISPLAY_MAP[beds] || beds]
      : [];

  const handleBedsChange = (value: string | string[] | undefined) => {
    if (!value) {
      onBedsChange(undefined);
      return;
    }

    // Convert display values back to schema values
    const values = Array.isArray(value) ? value : [value];
    const schemaValues = values.map((v) => BEDS_VALUE_MAP[v] || v);
    onBedsChange(schemaValues.length > 0 ? schemaValues : undefined);
  };

  const handlePetFriendlyChange = (value: string | string[] | undefined) => {
    if (!value) {
      onPetFriendlyChange(undefined);
      return;
    }
    // Single select: convert "Sí" to "true", anything else to undefined
    const selected = Array.isArray(value) ? value[0] : value;
    onPetFriendlyChange(selected === "Sí" ? "true" : undefined);
  };

  const handleParkingChange = (value: string | string[] | undefined) => {
    if (!value) {
      onParkingChange(undefined);
      return;
    }
    // Single select: convert "Sí" to "true", anything else to undefined
    const selected = Array.isArray(value) ? value[0] : value;
    onParkingChange(selected === "Sí" ? "true" : undefined);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tipología */}
      <SearchPills
        options={BEDS_OPTIONS}
        selected={bedsDisplay}
        onSelect={handleBedsChange}
        label="Tipología"
        multiple={true}
      />

      {/* Features row */}
      <div className="flex flex-wrap gap-4">
        <SearchPills
          options={["Sí"]}
          selected={petFriendly === "true" ? "Sí" : undefined}
          onSelect={handlePetFriendlyChange}
          label="Pet friendly"
          multiple={false}
        />

        <SearchPills
          options={["Sí"]}
          selected={parking === "true" ? "Sí" : undefined}
          onSelect={handleParkingChange}
          label="Estacionamiento"
          multiple={false}
        />
      </div>
    </div>
  );
}
