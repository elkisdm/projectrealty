"use client";

import { useState } from "react";
import { BasicFilters } from "./BasicFilters";
import { FeaturedGridClient } from "./FeaturedGridClient";
import type { Building } from "@schemas/models";

type FeaturedGridWithFiltersProps = {
  initialBuildings: (Building & { precioDesde: number | null })[];
};

export function FeaturedGridWithFilters({ initialBuildings }: FeaturedGridWithFiltersProps) {
  const [filteredBuildings, setFilteredBuildings] = useState<(Building & { precioDesde: number | null })[]>(initialBuildings);

  return (
    <>
      <BasicFilters
        buildings={initialBuildings}
        onFiltersChange={setFilteredBuildings}
      />
      <div className="mt-8">
        <FeaturedGridClient buildings={filteredBuildings} />
      </div>
    </>
  );
}
















