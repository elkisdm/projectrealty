/**
 * Mock data para la landing "Arrienda Sin Comisión"
 * 
 * Este archivo contiene datos temporales optimizados para demostrar las funcionalidades
 * de la landing con el edificio Home Amengual como caso principal.
 */

import { type BuildingSummary } from '../hooks/useFetchBuildings';
import { PromotionType } from '../schemas/models';

// Definir el tipo para la página de detalle
interface BuildingForArriendaSinComision {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  coverImage: string;
  gallery: string[];
  precioDesde: number;
  precioHasta: number;
  precioPromedio: number;
  hasAvailability: boolean;
  totalUnidades: number;
  unidadesDisponibles: number;
  badges: Array<{ label: string; tag?: string; type: string }>;
  amenities: string[];
  tipologias: string[];
  unidades: Array<{
    op: string;
    unidad: string;
    tipologia: string;
    precio: number;
    m2: number;
    orientacion: string;
    estacionamiento: number;
    bodega: number;
    gc: number;
    aceptaMascotas: boolean;
    estado: string;
    especial: boolean;
    tremendaPromo: boolean;
    descuento: number;
    mesesDescuento: number;
    linkListing: string;
  }>;
  selectedTypology?: string | null;
}

// Mock específico para Home Amengual
export const HOME_AMENGUAL_MOCK: BuildingSummary = {
  id: "home-amengual",
  slug: "home-amengual",
  name: "Home Inclusive Ecuador",
  comuna: "Estación Central",
  address: "Gral. Amengual 0148, Estación Central",
  coverImage: "/images/edificio/original_79516B40-7BA9-4F4E-4F7D-7BA4C0A2A938-mg0578.jpg",
  gallery: [
    "/images/edificio/original_79516B40-7BA9-4F4E-4F7D-7BA4C0A2A938-mg0578.jpg",
    "/images/edificio/original_05CC1BCB-6719-A6F3-4299-F6078DC02E05-mg0345.jpg",
    "/images/edificio/original_311AE0D8-2A11-2E32-04F0-829F5F46775F-mg0348.jpg",
    "/images/edificio/original_58D0B1B6-BDBF-2FEB-A92F-82493157ADA7-mg0731.jpg",
    "/images/edificio/original_87F94E6E-7B88-8EDF-4AE9-481F4458226B-mg0608.jpg",
    "/images/edificio/original_9E2C7938-6514-1B1E-EB7D-90B7D9CC4386-mg0300.jpg",
    "/images/edificio/original_E83F6CA9-97BD-EE6D-9AF3-29C004963C07-mg0309.jpg",
    "/images/edificio/original_D02A4F27-BD68-D47B-14B1-185BE67CE479-mg0626.jpg",
    "/images/edificio/original_07050B6E-BC69-04EB-9619-584F161455C6-mg0659pano.jpg",
    "/images/edificio/original_62CDE25C-4152-E1A0-3ABC-BCAF57A614EB-mg0397pano.jpg"
  ],
  precioDesde: 272000, // Precio mínimo real
  hasAvailability: true,
  badges: [
    {
      type: PromotionType.FREE_COMMISSION,
      label: "Comisión gratis",
      tag: "Exclusivo"
    },
    {
      type: PromotionType.NO_AVAL,
      label: "Garantía en cuotas",
      tag: "Flexible"
    },
    {
      type: PromotionType.NO_GUARANTEE,
      label: "Precio fijo 12 meses",
      tag: "Estable"
    },
    {
      type: PromotionType.FREE_COMMISSION,
      label: "50% OFF",
      tag: "Primer mes"
    },
    {
      type: PromotionType.NO_AVAL,
      label: "Opción sin aval",
      tag: "Sin aval"
    }
  ],
  typologySummary: [
    {
      key: "1D",
      label: "1 dormitorio",
      count: 6,
      minPrice: 272000
    },
    {
      key: "2D",
      label: "2 dormitorios",
      count: 1,
      minPrice: 450000
    },
    {
      key: "4D",
      label: "4 dormitorios",
      count: 2,
      minPrice: 650000
    },
    {
      key: "Estudio",
      label: "Estudio",
      count: 2,
      minPrice: 220000
    }
  ]
};



// Solo usar Home Amengual para la landing
export const LANDING_BUILDINGS_MOCK = [HOME_AMENGUAL_MOCK];

// Mock extendido para la página de detalle
export const HOME_AMENGUAL_EXTENDED: BuildingForArriendaSinComision = {
  id: "home-amengual",
  slug: "home-amengual",
  name: "Home Inclusive Ecuador",
  comuna: "Estación Central",
  address: "Gral. Amengual 0148, Estación Central",
  coverImage: "/images/edificio/original_79516B40-7BA9-4F4E-4F7D-7BA4C0A2A938-mg0578.jpg",
  gallery: [
    "/images/edificio/original_79516B40-7BA9-4F4E-4F7D-7BA4C0A2A938-mg0578.jpg",
    "/images/edificio/original_05CC1BCB-6719-A6F3-4299-F6078DC02E05-mg0345.jpg",
    "/images/edificio/original_311AE0D8-2A11-2E32-04F0-829F5F46775F-mg0348.jpg",
    "/images/edificio/original_58D0B1B6-BDBF-2FEB-A92F-82493157ADA7-mg0731.jpg",
    "/images/edificio/original_87F94E6E-7B88-8EDF-4AE9-481F4458226B-mg0608.jpg",
    "/images/edificio/original_9E2C7938-6514-1B1E-EB7D-90B7D9CC4386-mg0300.jpg",
    "/images/edificio/original_E83F6CA9-97BD-EE6D-9AF3-29C004963C07-mg0309.jpg",
    "/images/edificio/original_D02A4F27-BD68-D47B-14B1-185BE67CE479-mg0626.jpg",
    "/images/edificio/original_07050B6E-BC69-04EB-9619-584F161455C6-mg0659pano.jpg",
    "/images/edificio/original_62CDE25C-4152-E1A0-3ABC-BCAF57A614EB-mg0397pano.jpg"
  ],
  precioDesde: 272000,
  precioHasta: 700000,
  precioPromedio: 435000,
  hasAvailability: true,
  totalUnidades: 11,
  unidadesDisponibles: 7,
  badges: [
    {
      type: "FREE_COMMISSION",
      label: "50% OFF",
      tag: "Primer mes"
    },
    {
      type: "NO_AVAL",
      label: "Garantía en cuotas",
      tag: "Flexible"
    },
    {
      type: "NO_GUARANTEE",
      label: "Precio fijo 12 meses",
      tag: "Estable"
    },
    {
      type: "FREE_COMMISSION",
      label: "Comisión gratis",
      tag: "Exclusivo"
    },
    {
      type: "NO_AVAL",
      label: "Opción sin aval",
      tag: "Sin aval"
    }
  ],
  amenities: [
    "Accesos controlados",
    "Citófono",
    "Gimnasio",
    "Bicicletero",
    "Lavandería",
    "Sala de internet",
    "Quincho",
    "Sala gourmet / eventos",
    "Seguridad",
    "Terraza panorámica",
    "Salón lounge",
    "Transporte cercano"
  ],
  tipologias: ["1 dormitorio", "2 dormitorios", "4 dormitorios", "Estudio"],
  unidades: [
    {
      op: "207",
      unidad: "207",
      tipologia: "1 dormitorio",
      precio: 145000, // Con promo 50% OFF primer mes
      m2: 45,
      orientacion: "Sur",
      estacionamiento: 1,
      bodega: 0,
      gc: 62000,
      aceptaMascotas: true,
      estado: "disponible",
      especial: false,
      tremendaPromo: false,
      descuento: 0,
      mesesDescuento: 0,
      linkListing: "https://maps.app.goo.gl/nLMtyQSTvepMAb1FA?g_st=ipc"
    },
    {
      op: "301",
      unidad: "301",
      tipologia: "1 dormitorio",
      precio: 180000,
      m2: 48,
      orientacion: "Norte",
      estacionamiento: 1,
      bodega: 0,
      gc: 65000,
      aceptaMascotas: false,
      estado: "disponible",
      especial: false,
      tremendaPromo: false,
      descuento: 0,
      mesesDescuento: 0,
      linkListing: "https://maps.app.goo.gl/nLMtyQSTvepMAb1FA?g_st=ipc"
    },
    {
      op: "401",
      unidad: "401",
      tipologia: "2 dormitorios",
      precio: 450000,
      m2: 65,
      orientacion: "Este",
      estacionamiento: 1,
      bodega: 0,
      gc: 85000,
      aceptaMascotas: true,
      estado: "disponible",
      especial: false,
      tremendaPromo: false,
      descuento: 0,
      mesesDescuento: 0,
      linkListing: "https://maps.app.goo.gl/nLMtyQSTvepMAb1FA?g_st=ipc"
    },
    {
      op: "501",
      unidad: "501",
      tipologia: "4 dormitorios",
      precio: 650000,
      m2: 95,
      orientacion: "Oeste",
      estacionamiento: 2,
      bodega: 0,
      gc: 120000,
      aceptaMascotas: false,
      estado: "disponible",
      especial: false,
      tremendaPromo: false,
      descuento: 0,
      mesesDescuento: 0,
      linkListing: "https://maps.app.goo.gl/nLMtyQSTvepMAb1FA?g_st=ipc"
    },
    {
      op: "502",
      unidad: "502",
      tipologia: "4 dormitorios",
      precio: 700000,
      m2: 100,
      orientacion: "Sur",
      estacionamiento: 2,
      bodega: 0,
      gc: 125000,
      aceptaMascotas: true,
      estado: "disponible",
      especial: false,
      tremendaPromo: false,
      descuento: 0,
      mesesDescuento: 0,
      linkListing: "https://maps.app.goo.gl/nLMtyQSTvepMAb1FA?g_st=ipc"
    },
    {
      op: "101",
      unidad: "101",
      tipologia: "Estudio",
      precio: 220000,
      m2: 35,
      orientacion: "Este",
      estacionamiento: 1,
      bodega: 0,
      gc: 45000,
      aceptaMascotas: true,
      estado: "disponible",
      especial: false,
      tremendaPromo: false,
      descuento: 0,
      mesesDescuento: 0,
      linkListing: "https://maps.app.goo.gl/nLMtyQSTvepMAb1FA?g_st=ipc"
    },
    {
      op: "102",
      unidad: "102",
      tipologia: "Estudio",
      precio: 240000,
      m2: 38,
      orientacion: "Oeste",
      estacionamiento: 1,
      bodega: 0,
      gc: 48000,
      aceptaMascotas: false,
      estado: "disponible",
      especial: false,
      tremendaPromo: false,
      descuento: 0,
      mesesDescuento: 0,
      linkListing: "https://maps.app.goo.gl/nLMtyQSTvepMAb1FA?g_st=ipc"
    }
  ]
};

export const MOCK_PROMOTIONS = [
  { 
    label: "0% Comisión", 
    tag: "Exclusivo por tiempo limitado", 
    type: PromotionType.FREE_COMMISSION
  },
  { 
    label: "0% Comisión", 
    tag: "Congela precio 12 meses", 
    type: PromotionType.FREE_COMMISSION
  },
  { 
    label: "0% Comisión", 
    tag: "Hasta 50% dcto 1er mes", 
    type: PromotionType.FREE_COMMISSION
  },
  { 
    label: "0% Comisión", 
    tag: "Sin gastos de gestión", 
    type: PromotionType.FREE_COMMISSION
  },
];

export const MOCK_AMENITIES_SETS = [
  ["Gimnasio", "Piscina", "Cowork", "Quinchos", "Pet friendly"],
  ["Sala Multiuso", "Lavandería", "Conserjería 24/7", "Bicicletero"],
  ["Rooftop", "Piscina temperada", "Sauna", "Salón Gourmet"],
  ["Terraza", "Sala de eventos", "Quincho", "Bodega"],
  ["Spa", "Gimnasio 24/7", "Cowork", "Lavandería"],
  ["Piscina", "Quincho", "Sala de juegos", "Conserjería"],
  ["Gym", "Co-working", "Lavandería", "Bicicletero", "Pet Care"],
];

export const MOCK_GALLERY_SETS = [
  ["/images/nunoa-1.jpg", "/images/nunoa-2.jpg", "/images/nunoa-3.jpg"],
  ["/images/lascondes-1.jpg", "/images/lascondes-2.jpg", "/images/lascondes-3.jpg", "/images/lascondes-4.jpg"],
  ["/images/mirador-1.jpg", "/images/mirador-2.jpg", "/images/mirador-3.jpg", "/images/mirador-4.jpg"],
];

export const MOCK_COVER_IMAGES = [
  "/images/nunoa-cover.jpg",
  "/images/lascondes-cover.jpg", 
  "/images/mirador-cover.jpg",
];

/**
 * Función para asignar datos mock a un edificio basado en su índice
 * Esto asegura consistencia en los datos asignados
 */
export function assignMockDataToBuilding(building: any, index: number) {
  const hasPromotion = index % 3 === 0; // Cada 3 edificios tiene promoción
  
  // Usar datos reales de Supabase cuando estén disponibles, sino usar mocks
  const realAmenities = building.amenities && building.amenities.length > 0;
  const realGallery = building.gallery && building.gallery.length > 0;
  const realCover = building.coverImage;
  
  // Verificar disponibilidad real
  const buildingUnits = building.units || [];
  const availableUnits = buildingUnits.filter((unit: any) => unit.disponible);
  const hasAvailability = availableUnits.length > 0;
  
  return {
    hasPromotion,
    promotion: hasPromotion ? MOCK_PROMOTIONS[index % MOCK_PROMOTIONS.length] : null,
    amenities: realAmenities 
      ? building.amenities.slice(0, 6) 
      : MOCK_AMENITIES_SETS[index % MOCK_AMENITIES_SETS.length],
    gallery: realGallery 
      ? building.gallery 
      : MOCK_GALLERY_SETS[index % MOCK_GALLERY_SETS.length],
    coverImage: realCover 
      ? building.coverImage 
      : MOCK_COVER_IMAGES[index % MOCK_COVER_IMAGES.length],
    hasAvailability,
    // Datos reales de precio y disponibilidad
    precioDesde: hasAvailability 
      ? Math.min(...availableUnits.map((unit: any) => unit.price || unit.precio || 0))
      : building.precio_desde || building.precioDesde || 0,
  };
}

/**
 * Configuración para facilitar la migración futura
 */
export const MIGRATION_CONFIG = {
  // Cuando estos campos estén disponibles en Supabase, actualizar estas banderas
  USE_REAL_PROMOTIONS: false,
  USE_REAL_AMENITIES: false, 
  USE_REAL_GALLERY: false,
  USE_REAL_COVERS: false,
  
  // Campos de Supabase que mapearán a los datos mock
  SUPABASE_MAPPING: {
    promotions: 'building_promotions', // tabla futura
    amenities: 'building_amenities',   // tabla futura  
    gallery: 'building_images',        // tabla futura
    cover: 'cover_image_url',          // campo futuro
  }
};
