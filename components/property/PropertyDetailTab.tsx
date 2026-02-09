"use client";

import React from "react";
import { Bed, Bath, Square, Building2, Eye, Home, PawPrint, Ruler, Car, Package, Sun } from "lucide-react";
import type { Unit, Building } from "@schemas/models";

interface PropertyDetailTabProps {
  unit: Unit;
  building: Building;
}

export function PropertyDetailTab({ unit, building }: PropertyDetailTabProps) {
  // Helpers para parsear datos
  const parseTipologia = (tipo: string) => {
    const match = tipo.match(/(\d+)D(\d+)B/);
    if (match) {
      return {
        dorms: parseInt(match[1]),
        banos: parseInt(match[2])
      };
    }
    return { dorms: 0, banos: 0 };
  };

  const mapOrientacion = (ori: string) => {
    const map: Record<string, string> = {
      "N": "Norte",
      "S": "Sur",
      "O": "Oriente",
      "P": "Poniente",
      "NO": "Nor-Poniente",
      "NE": "Nor-Oriente",
      "SO": "Sur-Poniente",
      "SE": "Sur-Oriente"
    };
    return map[ori] || ori;
  };

  // Información de la unidad
  const estado = unit.estado || (unit.disponible ? "Disponible" : "No disponible");
  const tipologia = unit.tipologia || "N/A";

  // Lógica inteligente para dormitorios y baños
  // Regla especial: Estudios siempre tienen 1 ambiente + 1 baño
  const isEstudio = tipologia === "Studio" || tipologia === "Estudio";

  let dormitorios = unit.dormitorios || unit.bedrooms || 0;
  let banos = unit.banos || unit.bathrooms || 0;

  if (dormitorios === 0 && banos === 0 && tipologia !== "N/A") {
    const parsed = parseTipologia(tipologia);
    dormitorios = parsed.dorms;
    banos = parsed.banos;
  }

  // Aplicar regla de estudios: siempre 1 ambiente + 1 baño
  if (isEstudio) {
    dormitorios = 1;
    banos = 1;
  }

  // Superficie: Usar m2 totales, si no hay terraza explícita se asume incluida o 0
  const superficie = unit.m2 || unit.area_interior_m2 || 0;
  const superficieTerraza = unit.m2_terraza || 0;

  const piso = unit.piso;
  const vistaRaw = unit.vista || unit.orientacion || "";
  const vista = mapOrientacion(vistaRaw);

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
      {/* Header con estado */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(estado)}`}
            >
              {estado}
            </span>
          </div>
        </div>
      </div>

      {/* Grid 2 columnas: tipología + piso, vista, amoblado, mascotas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
              <Bed className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div>
              <div className="text-sm text-subtext">Dormitorios</div>
              <div className="text-base font-semibold text-text">{dormitorios}</div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
              <Bath className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div>
              <div className="text-sm text-subtext">Baños</div>
              <div className="text-base font-semibold text-text">{banos}</div>
            </div>
          </div>
        </div>
        {superficie > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
                <Ruler className="w-5 h-5 text-[#8B6CFF]" />
              </div>
              <div>
                <div className="text-sm text-subtext">Superficie Interior</div>
                <div className="text-base font-semibold text-text">{superficie} m²</div>
              </div>
            </div>
          </div>
        )}
        {superficieTerraza > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
                <Sun className="w-5 h-5 text-[#8B6CFF]" />
              </div>
              <div>
                <div className="text-sm text-subtext">Superficie exterior</div>
                <div className="text-base font-semibold text-text">{superficieTerraza} m²</div>
              </div>
            </div>
          </div>
        )}
        {!(dormitorios > 0 || banos > 0) && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
                <Building2 className="w-5 h-5 text-[#8B6CFF]" />
              </div>
              <div>
                <div className="text-sm text-subtext">Tipo</div>
                <div className="text-base font-semibold text-text">{tipologia}</div>
              </div>
            </div>
          </div>
        )}
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
              <PawPrint className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div>
              <div className="text-sm text-subtext">Política Mascotas</div>
              <div className="text-base font-semibold text-text">{politicaMascotas}</div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
              <Car className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div>
              <div className="text-sm text-subtext">Estacionamiento</div>
              <div className="text-base font-semibold text-text">
                {unit.estacionamiento ? "Incluido" : "No"}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
              <Package className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div>
              <div className="text-sm text-subtext">Bodega</div>
              <div className="text-base font-semibold text-text">
                {unit.bodega ? "Incluido" : "No"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





