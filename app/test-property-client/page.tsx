"use client";

import { PropertyClient } from "@components/property/PropertyClient";
import type { Building } from "@schemas/models";
import { HOME_AMENGUAL_EXTENDED } from "@lib/arrienda-sin-comision-mocks";

// Convertir orientación de texto a abreviación
function convertOrientacion(orientacion: string): "N" | "S" | "E" | "O" | "NE" | "NO" | "SE" | "SO" {
  const map: Record<string, "N" | "S" | "E" | "O" | "NE" | "NO" | "SE" | "SO"> = {
    "Norte": "N",
    "Sur": "S",
    "Este": "E",
    "Oeste": "O",
    "Noreste": "NE",
    "Noroeste": "NO",
    "Sureste": "SE",
    "Suroeste": "SO",
  };
  return map[orientacion] || "N";
}

// Convertir el mock a formato Building para PropertyClient
function convertMockToBuilding(mock: typeof HOME_AMENGUAL_EXTENDED): Building {
  return {
    id: mock.id,
    slug: mock.slug,
    name: mock.name,
    comuna: mock.comuna,
    address: mock.address,
    coverImage: mock.coverImage,
    gallery: mock.gallery,
    amenities: mock.amenities,
    units: mock.unidades.map((unidad) => {
      const tipologia = unidad.tipologia === "1 dormitorio" ? "1D1B" : 
                       unidad.tipologia === "2 dormitorios" ? "2D1B" : 
                       unidad.tipologia === "4 dormitorios" ? "3D2B" :
                       "Studio";
      
      return {
        id: `${mock.id}-${unidad.unidad}`,
        tipologia,
        m2: unidad.m2,
        price: unidad.precio,
        estacionamiento: unidad.estacionamiento > 0,
        bodega: unidad.bodega > 0,
        disponible: unidad.estado === "disponible",
        bedrooms: unidad.tipologia === "1 dormitorio" ? 1 :
                  unidad.tipologia === "2 dormitorios" ? 2 :
                  unidad.tipologia === "4 dormitorios" ? 4 : undefined,
        bathrooms: unidad.tipologia === "1 dormitorio" ? 1 :
                   unidad.tipologia === "2 dormitorios" ? 1 :
                   unidad.tipologia === "4 dormitorios" ? 2 : 1,
        orientacion: convertOrientacion(unidad.orientacion),
        gastosComunes: unidad.gc,
        petFriendly: unidad.aceptaMascotas,
      };
    }),
    badges: mock.badges.map((badge) => ({
      label: badge.label,
      type: badge.type as any,
      tag: badge.tag,
    })),
  };
}

export default function TestPropertyClientPage() {
  const building = convertMockToBuilding(HOME_AMENGUAL_EXTENDED);
  const relatedBuildings: Building[] = []; // Sin edificios relacionados para la demo

  return (
    <div className="min-h-screen">
      <PropertyClient
        building={building}
        relatedBuildings={relatedBuildings}
        defaultUnitId="home-amengual-207" // Unidad 207 por defecto
        variant="catalog"
      />
    </div>
  );
}

