"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Shield, Car, Package, Heart, Star,
  Waves, Dumbbell, Briefcase, ChefHat, Wine, Shirt,
  Bike, Users, Gamepad2, Sparkles,
  ArrowUpFromLine, Film, Flame, ChevronDown, ChevronUp, Check
} from "lucide-react";
import type { Unit, Building } from "@schemas/models";
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
  if (lowerAmenity.includes("accesos")) return Shield;
  if (lowerAmenity.includes("biciclet") || lowerAmenity.includes("bike")) return Bike;
  if (lowerAmenity.includes("sala de eventos") || lowerAmenity.includes("eventos")) return Users;
  if (lowerAmenity.includes("sala de cine") || lowerAmenity.includes("cine")) return Film;
  if (lowerAmenity.includes("terraza") || lowerAmenity.includes("terrace")) return Star; // Render: custom balcon icon
  if (lowerAmenity.includes("juegos") || lowerAmenity.includes("games")) return Gamepad2;
  if (lowerAmenity.includes("spa") || lowerAmenity.includes("wellness")) return Sparkles;
  if (lowerAmenity.includes("sauna")) return Flame;
  if (lowerAmenity.includes("ascensor")) return ArrowUpFromLine;
  if (lowerAmenity.includes("estacionamiento")) return Car;
  if (lowerAmenity.includes("bodega")) return Package;

  return Star; // Icono por defecto
};

const EXCLUDE_AMENITIES = new Set([
  "bodega",
  "conserjería",
  "conserjeria",
  "estacionamiento subterráneo",
  "estacionamiento subterraneo",
  "de visitas",
  "visitas",
  "áreas verdes",
  "areas verdes",
]);

/** Desagrupa strings en ítems individuales. Excluye bodega, conserjería, est. subterráneo y "de visitas"; muestra "Estacionamiento de visitas". */
function splitAmenities(amenities: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of amenities) {
    const parts = raw
      .split(/\s*,\s*/)
      .flatMap((p) => p.split(/\s+y\s+/))
      .map((s) => s.trim())
      .filter(Boolean);

    for (const part of parts) {
      const lower = part.toLowerCase();
      if (EXCLUDE_AMENITIES.has(lower)) continue;
      // Mostrar "Estacionamiento de visitas" como ítem único cuando en el texto original aparezca "de visitas"
      const isEstacionamientoVisitas = lower === "estacionamiento de visitas";
      const labelToAdd = isEstacionamientoVisitas ? "Estacionamiento de visitas" : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      const key = isEstacionamientoVisitas ? "estacionamiento de visitas" : lower;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(labelToAdd);
    }
  }

  // Si en el texto original había "de visitas", añadir "Estacionamiento de visitas" una vez
  const rawJoined = amenities.join(" ").toLowerCase();
  if (rawJoined.includes("de visitas")) {
    const key = "estacionamiento de visitas";
    if (!seen.has(key)) {
      seen.add(key);
      out.push("Estacionamiento de visitas");
    }
  }

  return out;
}

/** Amenidades que se muestran primero (más interesantes). El resto va en "Ver más". */
const AMENITIES_PRIORITY_KEYWORDS = [
  "piscina", "gimnasio", "quincho", "terraza", "cowork", "sky bar", "bar",
  "sala de eventos", "cine", "spa", "sauna", "lavandería", "lavanderia",
  "biciclet", "juegos", "wellness", "áreas comunes", "areas comunes"
];
const INITIAL_AMENITIES_VISIBLE = 6;

function sortAmenitiesByPriority(amenities: string[]): string[] {
  return [...amenities].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aScore = AMENITIES_PRIORITY_KEYWORDS.findIndex(k => aLower.includes(k));
    const bScore = AMENITIES_PRIORITY_KEYWORDS.findIndex(k => bLower.includes(k));
    if (aScore === -1 && bScore === -1) return 0;
    if (aScore === -1) return 1;
    if (bScore === -1) return -1;
    return aScore - bScore;
  });
}

interface PropertyAmenitiesTabProps {
  unit: Unit;
  building: Building;
}

export function PropertyAmenitiesTab({ unit, building }: PropertyAmenitiesTabProps) {
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);

  const rawAmenities = building.amenities || [];
  const amenities = splitAmenities(rawAmenities);
  const amenitiesSorted = sortAmenitiesByPriority(amenities);
  const initialCount = Math.min(INITIAL_AMENITIES_VISIBLE, amenitiesSorted.length);
  const visibleAmenities = amenitiesExpanded ? amenitiesSorted : amenitiesSorted.slice(0, initialCount);
  const hasMoreAmenities = amenitiesSorted.length > initialCount;

  // Seguridad y accesos
  const seguridadAccesos = building.seguridadAccesos || [];

  // Estacionamientos y bodegas
  const estacionamientos = building.estacionamientos;
  const bodegas = building.bodegas;

  // Política pet friendly
  const politicaMascotas = building.politicaMascotas;

  const terminaciones = building.terminaciones ?? [];
  const equipamiento = building.equipamiento ?? [];

  // Aplanar para grid 2 columnas (estilo amenities): "Segmento: detalle" → solo detalle en celda
  const terminacionesFlat = terminaciones.map((item) => {
    const colonIndex = item.indexOf(": ");
    if (colonIndex >= 0) return { label: item.slice(colonIndex + 2).trim(), segment: item.slice(0, colonIndex).trim() };
    return { label: item, segment: "" };
  });
  /** Normaliza etiquetas de equipamiento: si el edificio tiene "Conexión lavadora: Puede variar..." y la unidad tiene conexion_lavadora, mostrar "Conexión a lavadora: Sí/No". */
  const normalizeEquipamientoLabel = (fullItem: string, label: string): string => {
    const lower = fullItem.toLowerCase();
    if (!/conexi[oó]n\s*lavadora/.test(lower) || !/puede variar/.test(lower)) return label;
    const valor = unit?.conexion_lavadora;
    if (valor === true) return "Conexión a lavadora: Sí";
    if (valor === false) return "Conexión a lavadora: No";
    return label;
  };

  const equipamientoFlat = equipamiento.map((item) => {
    const colonIndex = item.indexOf(": ");
    if (colonIndex >= 0) {
      const segment = item.slice(0, colonIndex).trim();
      const label = item.slice(colonIndex + 2).trim();
      return { label: normalizeEquipamientoLabel(item, label), segment };
    }
    return { label: item, segment: "" };
  });

  return (
    <div className="space-y-6">
      {/* Terminaciones: mismo estilo que amenidades, 2 columnas */}
      {terminaciones.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h4 className="text-base font-semibold text-text mb-4">Terminaciones</h4>
          <div className="grid grid-cols-2 gap-2">
            {terminacionesFlat.map(({ label, segment }, index) => (
              <div
                key={`term-${index}-${label}`}
                className="flex items-center gap-2 rounded-xl border border-border bg-bg/50 dark:bg-bg/30 px-2.5 py-2 min-w-0"
              >
                <div className="p-1 bg-[#8B6CFF]/10 rounded-lg flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#8B6CFF]" aria-hidden />
                </div>
                <span className="text-xs font-medium text-text break-words line-clamp-2" title={segment ? `${segment}: ${label}` : label}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipamiento: mismo estilo que amenidades, 2 columnas */}
      {equipamiento.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h4 className="text-base font-semibold text-text mb-4">Equipamiento</h4>
          <div className="grid grid-cols-2 gap-2">
            {equipamientoFlat.map(({ label }, index) => (
              <div
                key={`equip-${index}-${label}`}
                className="flex items-center gap-2 rounded-xl border border-border bg-bg/50 dark:bg-bg/30 px-2.5 py-2 min-w-0"
              >
                <div className="p-1 bg-[#8B6CFF]/10 rounded-lg flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#8B6CFF]" aria-hidden />
                </div>
                <span className="text-xs font-medium text-text break-words line-clamp-2">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenidades destacadas: primeras visibles, resto desplegable */}
      {amenities.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h4 className="text-base font-semibold text-text mb-4">Amenidades destacadas</h4>
          <div className="grid grid-cols-2 gap-2">
            {visibleAmenities.map((amenity, index) => {
              const isTerraza = /terraza|terrace/.test(amenity.toLowerCase());
              const IconComponent = getAmenityIcon(amenity);
              return (
                <div
                  key={`amenity-${index}-${amenity}`}
                  className="flex items-center gap-2 rounded-xl border border-border bg-bg/50 dark:bg-bg/30 px-2.5 py-2 min-w-0"
                >
                  <div className="p-1 bg-[#8B6CFF]/10 rounded-lg flex-shrink-0">
                    {isTerraza ? (
                      <Image src="/icons/balcon.svg" alt="" width={14} height={14} className="shrink-0 object-contain" aria-hidden />
                    ) : (
                      <IconComponent className="w-3.5 h-3.5 text-[#8B6CFF]" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-text break-words line-clamp-2">{amenity}</span>
                </div>
              );
            })}
          </div>
          {hasMoreAmenities && (
            <button
              type="button"
              onClick={() => setAmenitiesExpanded(!amenitiesExpanded)}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-[#8B6CFF] hover:text-[#7a5ce6] border border-[#8B6CFF]/30 hover:border-[#8B6CFF]/50 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2"
              aria-expanded={amenitiesExpanded}
              aria-label={amenitiesExpanded ? "Ver menos amenidades" : "Ver más amenidades"}
            >
              {amenitiesExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" aria-hidden />
                  Ver menos amenidades
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" aria-hidden />
                  Ver más amenidades ({amenitiesSorted.length - initialCount} más)
                </>
              )}
            </button>
          )}
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





