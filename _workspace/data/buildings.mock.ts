import type { LegacyBuilding } from "@types";

export const MOCK_BUILDINGS: LegacyBuilding[] = [
  {
    id: "bldg-001",
    slug: "edificio-mirador-la-florida",
    name: "Edificio Mirador de La Florida",
    comuna: "La Florida",
    address: "Av. Vicuña Mackenna 6800",
    hero: "/images/mirador-hero.jpg",
    cover: "/images/mirador-cover.jpg",
    promo: { label: "0% Comisión", tag: "Exclusivo por tiempo limitado" },
    amenities: ["Gimnasio", "Piscina", "Cowork", "Quinchos", "Pet friendly"],
    units: [
      { id: "u-1", tipologia: "1D/1B", m2: 38, price: 380000, estacionamiento: false, bodega: false, disponible: true },
      { id: "u-2", tipologia: "2D/2B", m2: 55, price: 520000, estacionamiento: true, bodega: true, disponible: true },
      { id: "u-3", tipologia: "Studio", m2: 28, price: 310000, estacionamiento: false, bodega: false, disponible: false },
    ],
    gallery: ["/images/mirador-1.jpg","/images/mirador-2.jpg","/images/mirador-3.jpg","/images/mirador-4.jpg"],
  },
  {
    id: "bldg-002",
    slug: "parque-nunoa-residence",
    name: "Parque Ñuñoa Residence",
    comuna: "Ñuñoa",
    address: "Irarrázaval 2400",
    hero: "/images/nunoa-hero.jpg",
    cover: "/images/nunoa-cover.jpg",
    promo: { label: "0% Comisión", tag: "Congela precio 12 meses" },
    amenities: ["Sala Multiuso", "Lavandería", "Conserjería 24/7", "Bicicletero"],
    units: [
      { id: "u-4", tipologia: "1D/1B", m2: 41, price: 410000, estacionamiento: false, bodega: true, disponible: true },
      { id: "u-5", tipologia: "2D/1B", m2: 50, price: 490000, estacionamiento: true, bodega: false, disponible: true },
    ],
    gallery: ["/images/nunoa-1.jpg","/images/nunoa-2.jpg","/images/nunoa-3.jpg"],
  },
  {
    id: "bldg-003",
    slug: "sky-alto-las-condes",
    name: "Sky Alto Las Condes",
    comuna: "Las Condes",
    address: "Apoquindo 5400",
    hero: "/images/lascondes-hero.jpg",
    cover: "/images/lascondes-cover.jpg",
    promo: { label: "0% Comisión", tag: "Hasta 50% dcto 1er mes" },
    amenities: ["Rooftop", "Piscina temperada", "Sauna", "Salón Gourmet"],
    units: [
      { id: "u-6", tipologia: "Studio", m2: 30, price: 460000, estacionamiento: false, bodega: false, disponible: true },
      { id: "u-7", tipologia: "1D/1B", m2: 42, price: 540000, estacionamiento: true, bodega: true, disponible: true },
    ],
    gallery: ["/images/lascondes-1.jpg","/images/lascondes-2.jpg","/images/lascondes-3.jpg","/images/lascondes-4.jpg"],
  },
];
