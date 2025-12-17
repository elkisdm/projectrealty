"use client";

import React from "react";
import { MapPin, Train } from "lucide-react";
import type { Unit, Building } from "@schemas/models";

interface PropertyLocationTabProps {
  unit: Unit;
  building: Building;
}

export function PropertyLocationTab({ unit, building }: PropertyLocationTabProps) {
  // Información de ubicación
  const direccion = building.address || "";
  const comuna = building.comuna || "";
  const region = building.region || "Región Metropolitana";
  const direccionCompleta = `${direccion}, ${comuna}, ${region}, Chile`;

  // Metro cercano
  const metroCercano = building.metroCercano;
  const nombreEstacion = metroCercano?.nombre || "No especificado";
  const distancia = metroCercano?.distancia;
  const tiempoCaminando = metroCercano?.tiempoCaminando;

  return (
    <div className="space-y-6">
      {/* Dirección */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#8B6CFF]/10 rounded-xl">
            <MapPin className="w-6 h-6 text-[#8B6CFF]" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-text mb-2">Dirección</h4>
            <p className="text-text leading-relaxed">{direccionCompleta}</p>
          </div>
        </div>
      </div>

      {/* Metro cercano */}
      {metroCercano && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8B6CFF]/10 rounded-xl">
              <Train className="w-6 h-6 text-[#8B6CFF]" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-text mb-3">Metro cercano</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-subtext mb-1">Estación</div>
                  <div className="text-lg font-semibold text-text">{nombreEstacion}</div>
                </div>
                {distancia && (
                  <div>
                    <div className="text-sm text-subtext mb-1">Distancia</div>
                    <div className="text-base font-medium text-text">{distancia} metros</div>
                  </div>
                )}
                {tiempoCaminando && (
                  <div>
                    <div className="text-sm text-subtext mb-1">Tiempo caminando</div>
                    <div className="text-base font-medium text-text">{tiempoCaminando} minutos</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mapa implícito/referencial (solo texto por ahora) */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-sm">
            Mapa disponible próximamente
          </p>
        </div>
      </div>
    </div>
  );
}



