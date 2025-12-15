"use client";

import { useState } from "react";
import { formatPrice } from "@lib/utils";
import { track } from "@lib/analytics";
import type { Building, Unit } from "@schemas/models";
import { QuintoAndarVisitScheduler } from "@components/flow/QuintoAndarVisitScheduler";

interface UnitsListProps {
  building: Building;
  units: Unit[];
  tipologiaFilter?: string;
}

export function UnitsList({ building, units, tipologiaFilter }: UnitsListProps) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar unidades por tipología si hay filtro
  const filteredUnits = tipologiaFilter
    ? units.filter((unit) => unit.tipologia === tipologiaFilter)
    : units;

  // Agrupar por tipología
  const groupedByTipologia = filteredUnits.reduce((acc, unit) => {
    if (!acc[unit.tipologia]) {
      acc[unit.tipologia] = [];
    }
    acc[unit.tipologia].push(unit);
    return acc;
  }, {} as Record<string, Unit[]>);

  const handleScheduleVisit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
    track("unit_visit_scheduled", {
      property_id: building.id,
      property_name: building.name,
      unit_id: unit.id,
      tipologia: unit.tipologia,
    });
  };

  if (filteredUnits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-subtext mb-4">
          {tipologiaFilter
            ? `No hay unidades disponibles de tipología "${tipologiaFilter}"`
            : "No hay unidades disponibles"}
        </p>
        <a
          href={`/property/${building.slug}`}
          className="text-primary hover:underline"
        >
          Volver a la propiedad
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text mb-2">
            {tipologiaFilter
              ? `Unidades ${tipologiaFilter} disponibles`
              : "Todas las unidades disponibles"}
          </h2>
          <p className="text-subtext">
            {filteredUnits.length} {filteredUnits.length === 1 ? "unidad disponible" : "unidades disponibles"}
          </p>
        </div>

        {Object.entries(groupedByTipologia).map(([tipologia, tipologiaUnits]) => (
          <div key={tipologia} className="space-y-4">
            <h3 className="text-xl font-semibold text-text">
              {tipologia} ({tipologiaUnits.length} {tipologiaUnits.length === 1 ? "unidad" : "unidades"})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tipologiaUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="rounded-xl bg-soft/30 p-4 ring-1 ring-soft/50 hover:ring-primary/50 transition-all"
                >
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold text-text mb-1">
                        {unit.tipologia}
                      </div>
                      <div className="text-sm text-subtext">
                        {unit.m2} m²
                        {unit.orientacion && ` · ${unit.orientacion}`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-text">
                          {formatPrice(unit.price)}
                        </div>
                        <div className="text-xs text-subtext">por mes</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {unit.estacionamiento && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                          Estacionamiento
                        </span>
                      )}
                      {unit.bodega && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                          Bodega
                        </span>
                      )}
                      {unit.petFriendly && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                          Pet Friendly
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleScheduleVisit(unit)}
                      className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    >
                      Agendar Visita
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedUnit && (
        <QuintoAndarVisitScheduler
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUnit(null);
          }}
          listingId={building.slug}
          propertyName={building.name}
          propertyAddress={building.address || `${building.comuna}, Chile`}
          propertyImage={building.coverImage || building.gallery?.[0] || ""}
          unit={selectedUnit}
          building={building}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedUnit(null);
          }}
        />
      )}
    </>
  );
}
