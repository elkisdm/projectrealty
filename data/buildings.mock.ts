import type { Building } from "@schemas/models";

/**
 * Mock buildings data
 * Used when USE_SUPABASE=false
 * 
 * This is a minimal mock dataset for development/testing.
 * In production, this should be replaced with real data from Supabase.
 */

export const MOCK_BUILDINGS: Array<{
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address?: string;
  cover?: string;
  hero?: string;
  gallery?: string[];
  amenities?: string[];
  units: Array<{
    id: string;
    tipologia: string;
    m2?: number;
    price: number;
    disponible: boolean;
    estacionamiento?: boolean;
    bodega?: boolean;
    bedrooms?: number;
    bathrooms?: number;
  }>;
}> = [
  {
    id: "mock-building-1",
    slug: "edificio-ejemplo-las-condes",
    name: "Edificio Ejemplo Las Condes",
    comuna: "Las Condes",
    address: "Av. Apoquindo 4500, Las Condes",
    cover: "/images/lascondes-cover.jpg",
    gallery: [
      "/images/lascondes-cover.jpg",
      "/images/lascondes-1.jpg",
      "/images/lascondes-2.jpg",
      "/images/lascondes-3.jpg"
    ],
    amenities: ["Piscina", "Gimnasio", "Estacionamiento", "Seguridad 24/7"],
    units: [
      {
        id: "mock-unit-1",
        tipologia: "1D1B",
        m2: 45,
        price: 450000,
        disponible: true,
        estacionamiento: true,
        bodega: false,
        bedrooms: 1,
        bathrooms: 1
      },
      {
        id: "mock-unit-2",
        tipologia: "2D1B",
        m2: 65,
        price: 650000,
        disponible: true,
        estacionamiento: true,
        bodega: true,
        bedrooms: 2,
        bathrooms: 1
      }
    ]
  },
  {
    id: "mock-building-2",
    slug: "edificio-ejemplo-providencia",
    name: "Edificio Ejemplo Providencia",
    comuna: "Providencia",
    address: "Av. Providencia 2000, Providencia",
    cover: "/images/providencia-cover.jpg",
    gallery: [
      "/images/providencia-cover.jpg",
      "/images/providencia-1.jpg",
      "/images/providencia-2.jpg"
    ],
    amenities: ["Gimnasio", "Terraza", "Salón de eventos"],
    units: [
      {
        id: "mock-unit-3",
        tipologia: "Studio",
        m2: 35,
        price: 350000,
        disponible: true,
        estacionamiento: false,
        bodega: false,
        bedrooms: 0,
        bathrooms: 1
      }
    ]
  }
];






