"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { logger } from "@lib/logger";
import { buildPropertyWhatsAppUrl } from "@lib/whatsapp";
import type { Unit, Building } from "@schemas/models";
import { QuintoAndarVisitScheduler } from "@components/flow/QuintoAndarVisitScheduler";
import { UnitSelectorModal } from "@components/property/UnitSelectorModal";

// Componentes de propiedad
import { PropertyAboveFoldMobile } from "@components/property/PropertyAboveFoldMobile";
import { PropertyBreadcrumb } from "@components/property/PropertyBreadcrumb";
import { PropertySidebar } from "@components/property/PropertySidebar";
import { PropertyBookingCard } from "@components/property/PropertyBookingCard";
import { PropertyTabs } from "@components/property/PropertyTabs";
import { PropertySimilarUnits } from "@components/property/PropertySimilarUnits";
import { CommuneLifeSection } from "@components/property/CommuneLifeSection";
import { PropertyFAQ } from "@components/property/PropertyFAQ";
import { UnitCard } from "@components/ui/UnitCard";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("UnitDetailClient ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text mb-2">
              Error de carga
            </h2>
            <p className="text-text-secondary mb-4">
              {this.state.error?.message || "Ocurrió un error inesperado"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
              aria-label="Recargar página"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface UnitDetailClientProps {
  unit: Unit;
  building: {
    id: string;
    name: string;
    slug: string;
    address: string;
    comuna: string;
    amenities: string[];
    gallery: string[];
    allUnits?: Unit[]; // Todas las unidades del edificio (opcional)
  } & Record<string, unknown>; // Permitir propiedades adicionales como allUnits
  similarUnits?: Unit[];
}

export function UnitDetailClient({
  unit,
  building,
  similarUnits = [],
}: UnitDetailClientProps) {
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isUnitSelectorModalOpen, setIsUnitSelectorModalOpen] = useState(false);

  // Usar todas las unidades del edificio si están disponibles, sino solo la unidad actual
  const allBuildingUnits = building.allUnits && building.allUnits.length > 0 
    ? building.allUnits 
    : [unit];

  // Convertir building reducido a Building completo para componentes que lo requieren
  // Usar todas las unidades obtenidas, no solo la unidad actual
  const fullBuilding: Building = {
    id: building.id,
    name: building.name,
    slug: building.slug,
    address: building.address,
    comuna: building.comuna,
    amenities: building.amenities.length > 0 ? building.amenities : ['Áreas comunes'],
    gallery: building.gallery.length > 0 ? building.gallery : ["/images/default-building.jpg"],
    coverImage: building.gallery[0] || "/images/default-building.jpg",
    precio_desde: unit.price,
    units: allBuildingUnits, // TODAS las unidades del edificio
  };

  // Handler para abrir modal de selector de unidades
  const handleOpenUnitSelector = React.useCallback(() => {
    // Validar que existan unidades en el edificio
    if (!fullBuilding?.units || !Array.isArray(fullBuilding.units)) {
      logger.warn("Building units not available", { buildingId: building?.id });
      return;
    }

    const totalUnits = fullBuilding.units.length;
    
    if (totalUnits === 0) {
      logger.warn("No units in building", { buildingId: building.id });
      return;
    }

    // Log para debugging
    logger.log("Opening unit selector modal from UnitDetailClient", {
      buildingId: building.id,
      totalUnits,
      currentUnitId: unit?.id,
    });

    // Trackear evento de apertura de modal
    track("unit_selector_modal_opened", {
      property_id: building.id,
      property_slug: building.slug,
      current_unit_id: unit?.id,
      total_units_count: totalUnits,
      variant: "catalog",
    });

    setIsUnitSelectorModalOpen(true);
  }, [fullBuilding, building, unit]);

  // Handler para cerrar modal de selector de unidades
  const handleCloseUnitSelector = React.useCallback(() => {
    setIsUnitSelectorModalOpen(false);
  }, []);

  // Analytics tracking on mount
  useEffect(() => {
    track(ANALYTICS_EVENTS.PROPERTY_VIEW, {
      property_id: building.id,
      property_slug: building.slug,
      property_name: building.name,
      unit_id: unit.id,
      unit_slug: unit.slug,
      price_monthly: unit.price,
      comuna: building.comuna,
      tipologia: unit.tipologia,
      dormitorios: unit.dormitorios,
      variant: "catalog",
    });
  }, [building.id, building.slug, building.name, building.comuna, unit]);

  // Listen for custom event to open visit modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsVisitModalOpen(true);
    };

    window.addEventListener("openVisitScheduler", handleOpenModal);
    return () => {
      window.removeEventListener("openVisitScheduler", handleOpenModal);
    };
  }, []);

  // Handler para WhatsApp click
  const handleWhatsAppClick = React.useCallback(() => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "";
    const propertyUrl = `${baseUrl}/arriendo/departamento/${building.comuna.toLowerCase().replace(/\s+/g, "-")}/${unit.slug}`;

    const whatsappUrl = buildPropertyWhatsAppUrl(unit, fullBuilding, propertyUrl);

    if (!whatsappUrl) {
      logger.warn("WhatsApp no configurado - verificar variables de entorno");
      alert("WhatsApp no está configurado. Por favor, contacte al administrador.");
      return;
    }

    track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, {
      property_id: building.id,
      property_slug: building.slug,
      unit_id: unit.id,
      commune: building.comuna,
      price: unit.price,
      variant: "catalog",
    });

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }, [unit, building, fullBuilding]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          {/* Breadcrumb */}
          <PropertyBreadcrumb building={fullBuilding} unit={unit} variant="catalog" />

          {/* Layout principal: 3 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Columna principal (2/3) */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Above the fold móvil optimizado */}
              <PropertyAboveFoldMobile
                building={fullBuilding}
                selectedUnit={unit}
                variant="catalog"
                onScheduleVisit={() => setIsVisitModalOpen(true)}
                onWhatsApp={handleWhatsAppClick}
                onSelectOtherUnit={handleOpenUnitSelector}
                onSave={() => {
                  logger.log("Save clicked");
                }}
                onShare={() => {
                  logger.log("Share clicked");
                }}
              />

              {/* Tabs de contenido */}
              <PropertyTabs unit={unit} building={fullBuilding} />

              {/* Unidades similares */}
              {similarUnits && similarUnits.length > 0 ? (
                <section className="py-8">
                  <h2 className="text-2xl font-bold text-text mb-8">
                    Unidades similares
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {similarUnits.map((similarUnit, index) => (
                      <UnitCard
                        key={similarUnit.id}
                        unit={similarUnit}
                        building={fullBuilding}
                        priority={index < 4}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <PropertySimilarUnits
                  currentUnit={unit}
                  building={fullBuilding}
                  limit={6}
                />
              )}

              {/* Cómo es vivir en la comuna */}
              <CommuneLifeSection building={fullBuilding} variant="catalog" />

              {/* Preguntas frecuentes */}
              <PropertyFAQ building={fullBuilding} variant="catalog" />
            </div>

            {/* Sidebar sticky (1/3) - Booking Card */}
            <PropertyBookingCard
              unit={unit}
              building={fullBuilding}
              onScheduleVisit={() => setIsVisitModalOpen(true)}
              onWhatsApp={handleWhatsAppClick}
              onSelectOtherUnit={handleOpenUnitSelector}
            />
          </div>
        </main>

        {/* Modal de Agendamiento QuintoAndar */}
        <QuintoAndarVisitScheduler
          isOpen={isVisitModalOpen}
          onClose={() => setIsVisitModalOpen(false)}
          listingId={building.id}
          propertyName={building.name}
          propertyAddress={building.address}
          propertyImage={building.gallery[0] || fullBuilding.coverImage}
          onSuccess={(visitData) => {
            logger.log("✅ Visita creada exitosamente:", visitData);
            track(ANALYTICS_EVENTS.VISIT_SCHEDULED, {
              property_id: building.id,
              property_slug: building.slug,
              property_name: building.name,
              unit_id: unit.id,
              visit_id: visitData.visitId,
              variant: "catalog",
            });
            setIsVisitModalOpen(false);
          }}
        />

        {/* Modal de Selector de Unidades */}
        <UnitSelectorModal
          isOpen={isUnitSelectorModalOpen}
          onClose={handleCloseUnitSelector}
          building={fullBuilding}
          currentUnitId={unit.id}
        />
      </div>
    </ErrorBoundary>
  );
}



