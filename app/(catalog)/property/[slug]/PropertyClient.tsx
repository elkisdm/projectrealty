"use client";
import React from "react";
import type { Building } from "@schemas/models";
import { PropertyClient as BasePropertyClient } from "@components/property/PropertyClient";

interface PropertyClientProps {
  building: Building;
  relatedBuildings: Building[];
  defaultUnitId?: string;
  tipologiaFilter?: string;
  showAllUnits?: boolean;
}

export function PropertyClient({
  building,
  relatedBuildings,
  defaultUnitId,
  tipologiaFilter,
  showAllUnits
}: PropertyClientProps) {
  return (
    <BasePropertyClient
      building={building}
      relatedBuildings={relatedBuildings}
      defaultUnitId={defaultUnitId}
      tipologiaFilter={tipologiaFilter}
      showAllUnits={showAllUnits}
      variant="catalog"
    />
  );
}

