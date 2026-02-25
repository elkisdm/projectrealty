/**
 * Datos de ejemplo: Condominio Parque Mackenna – Unidad 305
 * Para pre-llenar las fichas de ingreso (condominio y propiedad).
 */

import type { Building, Unit } from "@schemas/models";

const BUILDING_ID = "bld-condominio-parque-mackenna";
const BUILDING_SLUG = "condominio-parque-mackenna";

/** Ficha de condominio (sin units) para FichaCondominio */
export const sampleCondominioParqueMackenna: Omit<Building, "units"> = {
  id: BUILDING_ID,
  slug: BUILDING_SLUG,
  name: "Condominio Parque Mackenna",
  comuna: "Macul",
  address: "Vicuña Mackenna 4192",
  region: "Metropolitana de Santiago",
  amenities: [
    "Accesos controlados y conserjería",
    "Ascensores",
    "Estacionamiento subterráneo y de visitas",
    "Bicicletero y bodega",
    "Piscina, gimnasio y lavandería",
    "Quinchos, sala de cine, sala de internet",
    "Salón de reuniones, lounge y sauna",
    "Terraza panorámica",
    "Áreas verdes, jardines y juegos infantiles",
    "Circuito cerrado de TV y portón eléctrico",
    "Excelente conectividad y transporte urbano cercano",
  ],
  gallery: ["/images/parque-mackenna-305/IMG_4922.jpg"],
  descripcion:
    "Metro Línea 5 – Camino Agrícola: 230 m. Metro Línea 5 – San Joaquín: 700 m. Administración: contactopmk1@admhr.cl. Gastos comunes: transferenciaspmktorre1@gmail.com.",
  seguridadAccesos: ["Accesos controlados", "Conserjería"],
  serviciosEdificio: [
    "Ascensores",
    "Estacionamiento subterráneo",
    "Bicicletero",
    "Bodega",
    "Piscina",
    "Gimnasio",
    "Lavandería",
    "Quinchos",
    "Sala de cine",
    "Sala de internet",
    "Salón de reuniones",
    "Lounge",
    "Sauna",
    "Terraza panorámica",
    "Áreas verdes",
    "Jardines",
    "Juegos infantiles",
    "Circuito cerrado de TV",
    "Portón eléctrico",
  ],
};

/** URLs de imágenes de la unidad 305 (en public/images/parque-mackenna-305/) */
export const sampleUnidad305Images = [
  "/images/parque-mackenna-305/IMG_4922.jpg",
  "/images/parque-mackenna-305/IMG_4923.jpg",
  "/images/parque-mackenna-305/IMG_4924.jpg",
  "/images/parque-mackenna-305/IMG_4925.jpg",
  "/images/parque-mackenna-305/IMG_4926.jpg",
  "/images/parque-mackenna-305/IMG_4927.jpg",
  "/images/parque-mackenna-305/IMG_4928.jpg",
  "/images/parque-mackenna-305/IMG_4929.jpg",
  "/images/parque-mackenna-305/IMG_4930.jpg",
  "/images/parque-mackenna-305/IMG_4931.jpg",
  "/images/parque-mackenna-305/IMG_4932.jpg",
  "/images/parque-mackenna-305/IMG_4934.jpg",
];

/** Ficha de unidad 305 para FichaPropiedad (buildingId se asigna al cargar) */
export function getSampleUnidad305(buildingId: string): Partial<Unit> {
  return {
    id: `${buildingId}-305`,
    slug: `${BUILDING_SLUG}-305`,
    tipologia: "1D1B",
    price: 410_000,
    disponible: true,
    codigoUnidad: "305",
    buildingId,
    dormitorios: 1,
    banos: 1,
    garantia: 410_000,
    gastoComun: 105_000,
    m2: 30,
    m2_terraza: 10,
    area_interior_m2: 30,
    area_exterior_m2: 10,
    piso: 3,
    amoblado: false,
    estacionamiento: true,
    bodega: true,
    pet_friendly: true,
    cuotasGarantia: 3,
    garantia_cuotas: 3,
    guarantee_installments: 3,
    reajuste_meses: 12,
    estado: "Disponible",
    images: sampleUnidad305Images,
  };
}

/** Building completo con unidad 305 para publicar directo en Supabase (POST /api/admin/buildings) */
export function getSampleBuildingWithUnit(): Building {
  const unit: Unit = {
    ...getSampleUnidad305(BUILDING_ID),
    id: `${BUILDING_ID}-305`,
    slug: `${BUILDING_SLUG}-305`,
    tipologia: "1D1B",
    price: 410_000,
    disponible: true,
    codigoUnidad: "305",
    buildingId: BUILDING_ID,
    dormitorios: 1,
    banos: 1,
    garantia: 410_000,
  } as Unit;
  return {
    ...sampleCondominioParqueMackenna,
    units: [unit],
  };
}
