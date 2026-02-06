"use client";

import React from "react";
import { MapPin } from "lucide-react";
import type { Building } from "@schemas/models";

interface PropertyLocationTabProps {
  building: Building;
}

export function PropertyLocationTab({ building }: PropertyLocationTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#8B6CFF]/10 rounded-xl flex-shrink-0">
            <MapPin className="w-6 h-6 text-[#8B6CFF]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-text mb-2">Ubicación</h4>
            <p className="text-text">{building.address}, {building.comuna}</p>
            {building.metroCercano && (
              <div className="mt-2 text-sm text-subtext">
                Metro {building.metroCercano.nombre}
                {building.metroCercano.distancia != null && building.metroCercano.distancia !== undefined && ` - ${building.metroCercano.distancia}m`}
                {building.metroCercano.tiempoCaminando != null && building.metroCercano.tiempoCaminando !== undefined && ` (${building.metroCercano.tiempoCaminando} min caminando)`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
