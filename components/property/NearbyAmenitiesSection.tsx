"use client";

import React, { useState, useEffect } from "react";
import {
  Train,
  Bus,
  GraduationCap,
  School,
  Baby,
  Trees,
  Store,
  Pill,
  HeartPulse,
  Footprints,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion/accordion";
import Image from "next/image";
import type { Building } from "@schemas/models";
import type { GroupedAmenities } from "@/lib/api/nearby-amenities";
import { logger } from "@/lib/logger";

interface NearbyAmenitiesSectionProps {
  building: Building;
  className?: string;
}

type CategoryId = 'transporte' | 'educacion' | 'areas_verdes' | 'comercios' | 'salud';

interface CategoryConfig {
  id: CategoryId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen: boolean;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'transporte', label: 'Transporte', icon: Train, defaultOpen: false },
  { id: 'educacion', label: 'Educación', icon: GraduationCap, defaultOpen: false },
  { id: 'areas_verdes', label: 'Áreas verdes', icon: Trees, defaultOpen: false },
  { id: 'comercios', label: 'Comercios', icon: Store, defaultOpen: false },
  { id: 'salud', label: 'Salud', icon: HeartPulse, defaultOpen: false },
];

const SUBCATEGORY_LABELS: Record<string, string> = {
  metro: 'Estaciones de metro',
  paraderos: 'Paraderos',
  jardines_infantiles: 'Jardines infantiles',
  colegios: 'Colegios',
  universidades: 'Universidades',
  plazas: 'Plazas',
  farmacias: 'Farmacias',
  clinicas: 'Clínicas',
};

const SUBCATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  metro: Train,
  paraderos: Bus,
  jardines_infantiles: Baby,
  colegios: School,
  universidades: GraduationCap,
  plazas: Trees,
  farmacias: Pill,
  clinicas: HeartPulse,
};

const METRO_ICON = "/icons/metro-santiago.png";
const RED_METROPOLITANA_LOGO = "/icons/red-metropolitana-movilidad.png";

function TransportIcon({ subcategory }: { subcategory: string }) {
  if (subcategory === "metro") {
    return (
      <Image
        src={METRO_ICON}
        alt=""
        width={16}
        height={16}
        className="shrink-0 object-contain"
        aria-hidden
      />
    );
  }
  if (subcategory === "paraderos") {
    return (
      <Image
        src={RED_METROPOLITANA_LOGO}
        alt=""
        width={16}
        height={16}
        className="shrink-0 object-contain"
        aria-hidden
      />
    );
  }
  return (
    <Footprints
      className="w-4 h-4 text-subtext shrink-0"
      aria-hidden
    />
  );
}

function AmenityItem({ amenity, subcategory }: { amenity: any; subcategory: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0">
      <div className="flex-shrink-0 w-4 h-4 flex items-start justify-center mt-0.5">
        <TransportIcon subcategory={subcategory} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text font-medium">
          {amenity.name}
        </p>
        <p className="text-xs text-subtext mt-0.5">
          {amenity.walkingTimeMinutes} min - {amenity.distanceMeters} metros
        </p>
      </div>
    </div>
  );
}

function SubcategoryGroup({
  subcategory,
  items,
}: {
  subcategory: string;
  items: any[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-0">
      {items.map((amenity) => (
        <AmenityItem key={amenity.id} amenity={amenity} subcategory={subcategory} />
      ))}
    </div>
  );
}

export function NearbyAmenitiesSection({
  building,
  className,
}: NearbyAmenitiesSectionProps) {
  const [amenities, setAmenities] = useState<GroupedAmenities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar amenidades
  useEffect(() => {
    if (!building.id) return;

    setLoading(true);
    setError(null);

    fetch(`/api/nearby-amenities?buildingId=${encodeURIComponent(building.id)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          logger.warn('[NearbyAmenitiesSection] API non-ok:', res.status, data);
          setAmenities(null);
          setLoading(false);
          return;
        }
        if (data.data) {
          setAmenities(data.data);
        } else {
          setAmenities(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        logger.error('[NearbyAmenitiesSection] Error loading amenities:', err);
        setAmenities(null);
        setLoading(false);
      });
  }, [building.id]);

  const hasCategoryData = (categoryId: CategoryId): boolean => {
    if (!amenities) return false;
    const category = amenities[categoryId];
    if (!category) return false;
    return Object.values(category).some((items) => items.length > 0);
  };

  const getCategorySummary = (categoryId: CategoryId): string | undefined => {
    if (!amenities) return undefined;
    const category = amenities[categoryId];
    if (!category) return undefined;

    const parts: string[] = [];
    
    if (categoryId === 'transporte') {
      const cat = category as GroupedAmenities['transporte'];
      const metro = cat.metro?.length || 0;
      const paraderos = cat.paraderos?.length || 0;
      if (metro > 0) parts.push(`${metro} ${metro === 1 ? 'estación' : 'estaciones'} de metro`);
      if (paraderos > 0) parts.push(`${paraderos} ${paraderos === 1 ? 'paradero' : 'paraderos'}`);
    } else if (categoryId === 'educacion') {
      const cat = category as GroupedAmenities['educacion'];
      const jardines = cat.jardines_infantiles?.length || 0;
      const colegios = cat.colegios?.length || 0;
      const universidades = cat.universidades?.length || 0;
      if (jardines > 0) parts.push(`${jardines} ${jardines === 1 ? 'jardín' : 'jardines'}`);
      if (colegios > 0) parts.push(`${colegios} ${colegios === 1 ? 'colegio' : 'colegios'}`);
      if (universidades > 0) parts.push(`${universidades} ${universidades === 1 ? 'universidad' : 'universidades'}`);
    } else if (categoryId === 'areas_verdes') {
      const cat = category as GroupedAmenities['areas_verdes'];
      const plazas = cat.plazas?.length || 0;
      if (plazas > 0) parts.push(`${plazas} ${plazas === 1 ? 'plaza' : 'plazas'}`);
    } else if (categoryId === 'comercios') {
      const cat = category as GroupedAmenities['comercios'];
      const farmacias = cat.farmacias?.length || 0;
      if (farmacias > 0) parts.push(`${farmacias} ${farmacias === 1 ? 'farmacia' : 'farmacias'}`);
    } else if (categoryId === 'salud') {
      const cat = category as GroupedAmenities['salud'];
      const clinicas = cat.clinicas?.length || 0;
      if (clinicas > 0) parts.push(`${clinicas} ${clinicas === 1 ? 'clínica' : 'clínicas'}`);
    }

    return parts.length > 0 ? parts.join(', ') : undefined;
  };

  const renderCategoryContent = (categoryId: CategoryId) => {
    if (!amenities) return null;
    const category = amenities[categoryId];
    if (!category) return null;

    const subcategories = Object.entries(category).filter(([_, items]) => items.length > 0);

    if (subcategories.length === 0) return null;

    return (
      <div className="space-y-0">
        {subcategories.map(([subcategory, items]) => (
          <SubcategoryGroup key={subcategory} subcategory={subcategory} items={items} />
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <section className={`${className || ''}`}>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-soft rounded animate-pulse" />
              <div className="h-5 bg-soft rounded w-40 animate-pulse" />
            </div>
          </div>
          <div className="px-4 py-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-surface rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`${className || ''}`}>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-center py-4">
            <p className="text-sm text-accent-error mb-3">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetch(`/api/nearby-amenities?buildingId=${encodeURIComponent(building.id)}`)
                  .then(async (res) => {
                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({}));
                      throw new Error(errorData.message || `Error ${res.status}`);
                    }
                    return res.json();
                  })
                  .then((response) => {
                    if (response.data) {
                      setAmenities(response.data);
                    } else {
                      setAmenities(null);
                    }
                    setLoading(false);
                  })
                  .catch((err) => {
                    logger.error('[NearbyAmenitiesSection] Error retrying:', err);
                    setError(err.message || 'Error al cargar los puntos de interés');
                    setLoading(false);
                  });
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state (API ok pero sin datos, o API falló y se trató como sin datos)
  if (!amenities) {
    const retryLoad = () => {
      setLoading(true);
      fetch(`/api/nearby-amenities?buildingId=${encodeURIComponent(building.id)}`)
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.data) setAmenities(data.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    return (
      <section className={`${className || ''}`}>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-center py-4">
            <p className="text-sm text-subtext mb-3">
              No hay puntos de interés disponibles
            </p>
            <button
              type="button"
              onClick={retryLoad}
              className="text-sm text-accent-secondary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Success state
  return (
    <section className={`${className || ''}`}>
      {/* Main container */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header: título con jerarquía visual */}
        <div className="px-4 py-5 border-b border-border text-center">
          <h2 className="text-lg font-bold text-text tracking-tight">
            Puntos de interés
          </h2>
          <p className="text-sm text-subtext mt-1">
            {building.name}
          </p>
        </div>

        {/* Categories */}
        <Accordion className="w-full max-w-none border-0 rounded-none shadow-none">
          {CATEGORIES.map((category) => {
            const hasData = hasCategoryData(category.id);
            if (!hasData) return null;

            const summary = getCategorySummary(category.id);
            const Icon = category.icon;

            return (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionHeader>
                  <AccordionTrigger className="flex items-center gap-3 py-3 px-4 text-left">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-base text-text block mb-0.5">
                          {category.label}
                        </span>
                        {summary && (
                          <span className="text-sm text-subtext truncate block">
                            {summary}
                          </span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel className="border-t border-border">
                  <div className="px-4 py-3">
                    {renderCategoryContent(category.id)}
                  </div>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Footer badge */}
        <div className="px-4 py-3 border-t border-border bg-bg-secondary">
          <div className="text-center">
            <p className="text-xs text-subtext">
              Operado por <span className="font-semibold text-text-secondary">Elkis Realtor</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
