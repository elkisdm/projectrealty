"use client";

import React from "react";
import { Bed, Bath, Square, Building2, Eye, Home, Heart } from "lucide-react";
import type { Unit, Building } from "@schemas/models";

interface PropertyDetailTabProps {
  unit: Unit;
  building: Building;
}

export function PropertyDetailTab({ unit, building }: PropertyDetailTabProps) {
  // Información de la unidad
  const codigoUnidad = unit.codigoUnidad || unit.id;
  const estado = unit.estado || (unit.disponible ? "Disponible" : "No disponible");
  const tipologia = unit.tipologia || "N/A";
  const dormitorios = unit.dormitorios || unit.bedrooms || 0;
  const banos = unit.banos || unit.bathrooms || 0;
  const superficie = unit.m2 || unit.area_interior_m2 || 0;
  const piso = unit.piso;
  const vista = unit.vista || unit.orientacion;
  const amoblado = unit.amoblado;
  const politicaMascotas = typeof unit.politicaMascotas === "string"
    ? unit.politicaMascotas
    : (building.politicaMascotas?.nota ||
      (building.politicaMascotas?.petFriendly ? "Permitidas" : "No permitidas") ||
      "Consultar");

  // Estado badge color
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "disponible":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "reservado":
        return "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "arrendado":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con código y estado */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text mb-1">
            Código de unidad: {codigoUnidad}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(estado)}`}
            >
              {estado}
            </span>
          </div>
        </div>
      </div>

      {/* Tipología */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h4 className="text-base font-semibold text-text mb-4">Tipología</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
              <Bed className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div>
              <div className="text-sm text-subtext">Dormitorios</div>
              <div className="text-lg font-bold text-text">{dormitorios}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
              <Bath className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div>
              <div className="text-sm text-subtext">Baños</div>
              <div className="text-lg font-bold text-text">{banos}</div>
            </div>
          </div>
          {superficie > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
                <Square className="w-5 h-5 text-[#8B6CFF]" />
              </div>
              <div>
                <div className="text-sm text-subtext">Superficie</div>
                <div className="text-lg font-bold text-text">{superficie} m²</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
              <Building2 className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div>
              <div className="text-sm text-subtext">Tipo</div>
              <div className="text-lg font-bold text-text">{tipologia}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {piso && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
                <Building2 className="w-5 h-5 text-[#8B6CFF]" />
              </div>
              <div>
                <div className="text-sm text-subtext">Piso</div>
                <div className="text-base font-semibold text-text">{piso}</div>
              </div>
            </div>
          </div>
        )}

        {vista && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
                <Eye className="w-5 h-5 text-[#8B6CFF]" />
              </div>
              <div>
                <div className="text-sm text-subtext">Vista/Orientación</div>
                <div className="text-base font-semibold text-text">{vista}</div>
              </div>
            </div>
          </div>
        )}

        {amoblado !== undefined && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
                <Home className="w-5 h-5 text-[#8B6CFF]" />
              </div>
              <div>
                <div className="text-sm text-subtext">Amoblado</div>
                <div className="text-base font-semibold text-text">
                  {amoblado ? "Sí" : "No"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
              <Heart className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div>
              <div className="text-sm text-subtext">Política Mascotas</div>
              <div className="text-base font-semibold text-text">{politicaMascotas}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



