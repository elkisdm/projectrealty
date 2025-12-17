"use client";

import React from "react";
import type { Unit, Building } from "@schemas/models";
import { PropertyFAQ } from "./PropertyFAQ";

interface PropertyFAQTabProps {
  unit: Unit;
  building: Building;
}

export function PropertyFAQTab({ unit, building }: PropertyFAQTabProps) {
  return (
    <div>
      <PropertyFAQ building={building} variant="catalog" />
    </div>
  );
}



