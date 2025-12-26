"use client";

import React from "react";
import {
  MapPin, Shield, Car, Package, Heart, Star,
  Waves, Dumbbell, Briefcase, ChefHat, Wine, Shirt,
  Bike, Users, Sun, Gamepad2, Sparkles
} from "lucide-react";
import type { Unit, Building } from "@schemas/models";
import { AmenityChips } from "./AmenityChips";
import type { AmenityChip } from "./AmenityChips";
import type { LucideIcon } from "lucide-react";

// Función helper para obtener icono según nombre de amenity
const getAmenityIcon = (amenityName: string): LucideIcon => {
  const lowerAmenity = amenityName.toLowerCase();

  if (lowerAmenity.includes("piscina") || lowerAmenity.includes("pool")) return Waves;
  if (lowerAmenity.includes("gimnasio") || lowerAmenity.includes("gym")) return Dumbbell;
  if (lowerAmenity.includes("cowork") || lowerAmenity.includes("co-work")) return Briefcase;
  if (lowerAmenity.includes("quincho") || lowerAmenity.includes("bbq")) return ChefHat;
  if (lowerAmenity.includes("sky bar") || lowerAmenity.includes("bar")) return Wine;
  if (lowerAmenity.includes("lavandería") || lowerAmenity.includes("lavanderia") || lowerAmenity.includes("laundry")) return Shirt;
  if (lowerAmenity.includes("conserjería") || lowerAmenity.includes("conserjeria") || lowerAmenity.includes("concierge")) return Shield;
  if (lowerAmenity.includes("biciclet") || lowerAmenity.includes("bike")) return Bike;
  if (lowerAmenity.includes("sala de eventos") || lowerAmenity.includes("eventos") || lowerAmenity.includes("events")) return Users;
  if (lowerAmenity.includes("terraza") || lowerAmenity.includes("terrace")) return Sun;
  if (lowerAmenity.includes("juegos") || lowerAmenity.includes("games")) return Gamepad2;
  if (lowerAmenity.includes("spa") || lowerAmenity.includes("wellness")) return Sparkles;

  return Star; // Icono por defecto
};

interface PropertyAmenitiesTabProps {
  unit: Unit;
  building: Building;
}

export function PropertyAmenitiesTab({ unit, building }: PropertyAmenitiesTabProps) {
  // Convertir amenities a formato AmenityChip
  const amenityChips: AmenityChip[] = (building.amenities || []).map((amenity) => {
    const IconComponent = getAmenityIcon(amenity);
    return {
      icon: IconComponent,
      label: amenity,
      category: "basic" // Puede mejorarse con categorías reales
    };
  });

  // Seguridad y accesos
  const seguridadAccesos = building.seguridadAccesos || [];

  // Estacionamientos y bodegas
  const estacionamientos = building.estacionamientos;
  const bodegas = building.bodegas;

  // Política pet friendly
  const politicaMascotas = building.politicaMascotas;

  return (
    <div className="space-y-6">
      {/* Ubicación */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-[#8B6CFF]/10 rounded-xl">
            <MapPin className="w-6 h-6 text-[#8B6CFF]" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-text mb-2">Ubicación</h4>
            <p className="text-text">{building.address}, {building.comuna}</p>
            {building.metroCercano && (
              <div className="mt-2 text-sm text-subtext">
                Metro {building.metroCercano.nombre}
                {building.metroCercano.distancia && ` - ${building.metroCercano.distancia}m`}
                {building.metroCercano.tiempoCaminando && ` (${building.metroCercano.tiempoCaminando} min caminando)`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amenidades del edificio */}
      {amenityChips.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <AmenityChips items={amenityChips} maxVisible={8} />
        </div>
      )}

      {/* Seguridad y accesos */}
      {seguridadAccesos.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8B6CFF]/10 rounded-xl">
              <Shield className="w-6 h-6 text-[#8B6CFF]" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-text mb-3">Seguridad y accesos</h4>
              <ul className="space-y-2">
                {seguridadAccesos.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-text">
                    <span className="w-1.5 h-1.5 bg-[#8B6CFF] rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Estacionamientos y bodegas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {estacionamientos && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
                <Car className="w-5 h-5 text-[#8B6CFF]" />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-text mb-2">Estacionamientos</h5>
                <div className="text-sm text-subtext space-y-1">
                  {estacionamientos.subterraneo && <p>• Subterráneo</p>}
                  {estacionamientos.visitas && <p>• Para visitas</p>}
                  {estacionamientos.disponibles !== undefined && (
                    <p>• {estacionamientos.disponibles ? "Disponibles" : "No disponibles"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {bodegas && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#8B6CFF]/10 rounded-lg">
                <Package className="w-5 h-5 text-[#8B6CFF]" />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-text mb-2">Bodegas</h5>
                <div className="text-sm text-subtext space-y-1">
                  {bodegas.disponibles !== undefined && (
                    <p>• {bodegas.disponibles ? "Disponibles" : "No disponibles"}</p>
                  )}
                  {bodegas.descripcion && <p>• {bodegas.descripcion}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Política pet friendly */}
      {politicaMascotas && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#8B6CFF]/10 rounded-xl">
              <Heart className="w-6 h-6 text-[#8B6CFF]" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-text mb-2">Política Pet Friendly</h4>
              {typeof politicaMascotas === "string" ? (
                <p className="text-text">{politicaMascotas}</p>
              ) : (
                <div className="space-y-2 text-text">
                  <p>• Mascotas: {politicaMascotas.petFriendly ? "Permitidas" : "No permitidas"}</p>
                  {politicaMascotas.pesoMaximoKg && (
                    <p>• Peso máximo: {politicaMascotas.pesoMaximoKg} kg</p>
                  )}
                  {politicaMascotas.permitidos && politicaMascotas.permitidos.length > 0 && (
                    <p>• Permitidos: {politicaMascotas.permitidos.join(", ")}</p>
                  )}
                  {politicaMascotas.prohibidos && politicaMascotas.prohibidos.length > 0 && (
                    <p>• Prohibidos: {politicaMascotas.prohibidos.join(", ")}</p>
                  )}
                  {politicaMascotas.reglas && politicaMascotas.reglas.length > 0 && (
                    <div>
                      <p className="font-semibold">Reglas:</p>
                      <ul className="list-disc list-inside">
                        {politicaMascotas.reglas.map((regla, idx) => (
                          <li key={idx}>{regla}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {politicaMascotas.nota && <p className="text-sm italic">{politicaMascotas.nota}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





