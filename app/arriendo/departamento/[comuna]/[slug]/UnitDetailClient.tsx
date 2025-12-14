"use client";

import React from "react";
import type { Unit, Building } from "@/schemas/models";
import { PropertyClient } from "@/components/property/PropertyClient";
import { normalizeComunaSlug } from "@/lib/utils/slug";

interface UnitDetailClientProps {
  unit: Unit;
  building: Omit<Building, 'units'>;
  similarUnits?: Unit[];
}

/**
 * Componente cliente para mostrar una unidad específica
 * Adapta el PropertyClient existente para mostrar una sola unidad
 */
export function UnitDetailClient({
  unit,
  building,
  similarUnits,
}: UnitDetailClientProps) {
  // Crear un Building con solo esta unidad para compatibilidad con PropertyClient
  const buildingWithSingleUnit: Building = {
    ...building,
    units: [unit],
  };

  // Obtener unidades relacionadas (similar units) como "related buildings"
  // Por ahora, usamos un array vacío ya que PropertyClient espera Building[]
  const relatedBuildings: Building[] = [];

  return (
    <PropertyClient
      building={buildingWithSingleUnit}
      relatedBuildings={relatedBuildings}
      defaultUnitId={unit.id}
      showAllUnits={false}
    />
  );
}


