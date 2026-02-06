"use client";
import React, { useState, useEffect, Suspense } from "react";
import { AlertCircle } from "lucide-react";

import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { logger } from "@lib/logger";
import { buildPropertyWhatsAppUrl } from "@lib/whatsapp";
import type { Building } from "@schemas/models";
import { QuintoAndarVisitScheduler } from "@components/flow/QuintoAndarVisitScheduler";
import { usePropertyUnit } from "@hooks/usePropertyUnit";
// TODO: Reintegrar cuando esté pulido
// import { FirstPaymentDetails } from "./FirstPaymentDetails";

// Componentes de propiedad
import { PropertyAboveFoldMobile } from "./PropertyAboveFoldMobile";
import { PropertySidebar } from "./PropertySidebar";
import { PropertyBookingCard } from "./PropertyBookingCard";
import { PropertyTabs } from "./PropertyTabs";
import { PropertySimilarUnits } from "./PropertySimilarUnits";
import { CommuneLifeSection } from "./CommuneLifeSection";
import { UnitSelectorModal } from "./UnitSelectorModal";

// Import directo para evitar problemas de lazy loading
import { RelatedList } from "@components/lists/RelatedList";
import { UnitsList } from "./UnitsList";

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
        logger.error("PropertyClient Error:", error, errorInfo);
        track("error", { error: error.message, component: "PropertyClient" });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-bg flex items-center justify-center p-6">
                    <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-text mb-2">
                            Algo sali? mal
                        </h2>
                        <p className="text-text-secondary mb-4">
                            No pudimos cargar la informaci?n de la propiedad. Por favor, intenta de nuevo.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                        >
                            Recargar p?gina
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Loading Skeleton Component
const PropertySkeleton = () => (
    <div className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-8 bg-white/10 rounded-xl animate-pulse"></div>
                    <div className="h-64 bg-white/10 rounded-2xl animate-pulse"></div>
                    <div className="space-y-4">
                        <div className="h-6 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-6 bg-white/10 rounded animate-pulse w-3/4"></div>
                    </div>
                </div>
                {/* Sidebar skeleton */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                        <div className="h-8 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-12 bg-white/10 rounded-xl animate-pulse"></div>
                        <div className="h-12 bg-white/10 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

interface PropertyClientProps {
    building: Building;
    relatedBuildings: Building[];
    defaultUnitId?: string;
    tipologiaFilter?: string;
    showAllUnits?: boolean;
    variant?: "catalog" | "marketing" | "admin";
}

export function PropertyClient({
    building,
    relatedBuildings,
    defaultUnitId,
    tipologiaFilter,
    showAllUnits,
    variant = "catalog"
}: PropertyClientProps) {
    const [isLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [isUnitSelectorModalOpen, setIsUnitSelectorModalOpen] = useState(false);

    // Usar el hook para manejar la l?gica de la unidad
    const {
        selectedUnit,
        moveInDate,
        includeParking,
        includeStorage,
        originalPrice,
        discountPrice,
        unitDetails,
        firstPaymentCalculation,
        handleDateChange,
        setIncludeParking,
        setIncludeStorage
    } = usePropertyUnit({ building, defaultUnitId });

    // Analytics tracking on mount - property view con datos de unidad
    useEffect(() => {
        if (selectedUnit) {
            track(ANALYTICS_EVENTS.PROPERTY_VIEW, {
                property_id: building.id,
                property_slug: building.slug,
                property_name: building.name,
                unit_id: selectedUnit.id,
                unit_slug: selectedUnit.slug,
                price_monthly: selectedUnit.price,
                comuna: building.comuna,
                tipologia: selectedUnit.tipologia,
                dormitorios: selectedUnit.dormitorios,
                variant,
            });
        }
    }, [building.id, building.slug, building.name, building.comuna, selectedUnit, variant]);

    // Listen for custom event to open visit modal
    useEffect(() => {
        const handleOpenModal = () => {
            setIsVisitModalOpen(true);
        };

        window.addEventListener('openVisitScheduler', handleOpenModal);
        return () => {
            window.removeEventListener('openVisitScheduler', handleOpenModal);
        };
    }, []);

    // Handler para abrir modal de selector de unidades
    const handleOpenUnitSelector = React.useCallback(() => {
        // Validar que existan unidades en el edificio
        if (!building?.units || !Array.isArray(building.units)) {
            logger.warn("Building units not available", { buildingId: building?.id });
            return;
        }

        // El modal debe mostrar TODAS las unidades del edificio, no solo las disponibles
        // Esto permite ver todas las opciones aunque algunas no estén disponibles
        const totalUnits = building.units.length;
        const availableUnits = building.units.filter((unit) => unit.disponible !== false);
        
        if (totalUnits === 0) {
            logger.warn("No units in building", { buildingId: building.id });
            return;
        }

        // Log para debugging
        logger.log("Opening unit selector modal", {
            buildingId: building.id,
            totalUnits,
            availableUnits: availableUnits.length,
            currentUnitId: selectedUnit?.id,
        });

        // Trackear evento de apertura de modal
        track("unit_selector_modal_opened", {
            property_id: building.id,
            property_slug: building.slug,
            current_unit_id: selectedUnit?.id,
            total_units_count: totalUnits,
            available_units_count: availableUnits.length,
            variant,
        });

        setIsUnitSelectorModalOpen(true);
    }, [building, selectedUnit, variant]);

    // Handler para cerrar modal de selector de unidades
    const handleCloseUnitSelector = React.useCallback(() => {
        setIsUnitSelectorModalOpen(false);
    }, []);

    // Handle errors gracefully
    useEffect(() => {
        if (!building) {
            setError("No se pudo cargar la informaci?n de la propiedad");
        } else if (building && building.units.filter(unit => unit.disponible).length === 0) {
            setError("No hay unidades disponibles en esta propiedad");
        } else {
            setError(null); // Clear any previous errors
        }
    }, [building]);

    // Funci?n para enviar cotizaci?n
    const handleSendQuotation = () => {
        track("quotation_sent", {
            property_id: building.id,
            property_name: building.name,
            variant
        });
        alert(`Cotizaci?n enviada por email para la propiedad ${building.name}`);
    };

    // Funci?n para navegar a la secci?n de detalles del primer pago
    const handleViewPaymentDetails = () => {
        const element = document.getElementById('first-payment-details');
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Handler para WhatsApp click
    const handleWhatsAppClick = React.useCallback(() => {
        if (!selectedUnit) {
            logger.warn("No unit selected for WhatsApp");
            return;
        }

        // Construir URL de la propiedad
        const baseUrl = typeof window !== 'undefined'
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SITE_URL || '';
        const propertyUrl = `${baseUrl}/property/${building.slug}`;

        // Construir URL de WhatsApp
        const whatsappUrl = buildPropertyWhatsAppUrl(
            selectedUnit,
            building,
            propertyUrl
        );

        if (!whatsappUrl) {
            // WhatsApp no configurado - mostrar mensaje al usuario
            logger.warn("WhatsApp no configurado - verificar variables de entorno");
            alert("WhatsApp no está configurado. Por favor, contacte al administrador.");
            return;
        }

        // Trackear evento
        track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, {
            property_id: building.id,
            property_slug: building.slug,
            unit_id: selectedUnit.id,
            commune: building.comuna,
            price: selectedUnit.price,
            variant,
        });

        // Abrir WhatsApp en nueva pestaña
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }, [selectedUnit, building, variant]);

    // Show loading state
    if (isLoading) {
        return <PropertySkeleton />;
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center p-6">
                <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-text mb-2">
                        Error de carga
                    </h2>
                    <p className="text-text-secondary mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                        aria-label="Recargar p?gina"
                    >
                        Recargar p?gina
                    </button>
                </div>
            </div>
        );
    }

    // Si se solicita ver todas las unidades o hay filtro de tipolog?a, mostrar lista de unidades
    const availableUnits = building.units.filter((unit) => unit.disponible);

    if (showAllUnits || tipologiaFilter) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen bg-bg">
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                        <div className="mt-6">
                            <a
                                href={`/property/${building.slug}`}
                                className="inline-flex items-center gap-2 text-sm text-subtext hover:text-text transition-colors mb-6"
                            >
                                ? Volver a la propiedad
                            </a>
                            <UnitsList
                                building={building}
                                units={availableUnits}
                                tipologiaFilter={tipologiaFilter}
                            />
                        </div>
                    </main>
                </div>
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-bg">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 overflow-x-hidden">
                    {/* Layout principal: 3 columnas */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                        {/* Columna principal (2/3) */}
                        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                            {/* Above the fold m?vil optimizado para conversi?n + Galer?a integrada */}
                            <PropertyAboveFoldMobile
                                building={building}
                                selectedUnit={selectedUnit || building.units[0] || {
                                    id: 'default',
                                    tipologia: '2D1B',
                                    m2: 50,
                                    price: building.precio_desde || 290000,
                                    estacionamiento: false,
                                    bodega: false,
                                    disponible: false
                                }}
                                variant={variant}
                                onScheduleVisit={() => setIsVisitModalOpen(true)}
                                onWhatsApp={handleWhatsAppClick}
                                onSelectOtherUnit={handleOpenUnitSelector}
                                onSave={() => {
                                    // TODO: Implementar guardar en favoritos
                                    logger.log("Save clicked");
                                }}
                                onShare={() => {
                                    // TODO: Implementar compartir
                                    logger.log("Share clicked");
                                }}
                            />

                            {/* Tabs de contenido según especificación Assetplan */}
                            {selectedUnit && (
                                <PropertyTabs
                                    unit={selectedUnit}
                                    building={building}
                                />
                            )}

                            {/* Unidades similares */}
                            {selectedUnit && (
                                <PropertySimilarUnits
                                    currentUnit={selectedUnit}
                                    building={building}
                                    limit={6}
                                />
                            )}

                            {/* C?mo es vivir en la comuna */}
                            <CommuneLifeSection building={building} variant={variant} />

                            {/* TODO: Reintegrar Calculadora del primer pago cuando esté pulida
                            <FirstPaymentDetails
                                originalPrice={originalPrice}
                                discountPrice={discountPrice}
                                firstPaymentCalculation={firstPaymentCalculation}
                                moveInDate={moveInDate}
                                includeParking={includeParking}
                                includeStorage={includeStorage}
                                onDateChange={handleDateChange}
                                onParkingChange={setIncludeParking}
                                onStorageChange={setIncludeStorage}
                                onSendQuotation={handleSendQuotation}
                            />
                            */}

                            {/* Propiedades relacionadas */}
                            <section
                                aria-label="Propiedades relacionadas"
                                className="mt-12 lg:mt-16"
                            >
                                <h2 className="text-xl lg:text-2xl font-bold text-text mb-4 lg:mb-6">
                                    Propiedades relacionadas
                                </h2>
                                <Suspense fallback={
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" aria-hidden="true"></div>
                                        ))}
                                    </div>
                                }>
                                    <RelatedList buildings={relatedBuildings as (Building & { precioDesde: number | null })[]} />
                                </Suspense>
                            </section>

                            {/* Sticky Mobile CTA ya est? integrado en PropertyAboveFoldMobile */}
                        </div>

                        {/* Sidebar sticky (1/3) - Booking Card según especificación Assetplan */}
                        {selectedUnit && (
                            <PropertyBookingCard
                                unit={selectedUnit}
                                building={building}
                                onScheduleVisit={() => setIsVisitModalOpen(true)}
                                onWhatsApp={handleWhatsAppClick}
                                onSelectOtherUnit={handleOpenUnitSelector}
                            />
                        )}
                    </div>
                </main>

                {/* Modal de Agendamiento QuintoAndar */}
                <QuintoAndarVisitScheduler
                    isOpen={isVisitModalOpen}
                    onClose={() => setIsVisitModalOpen(false)}
                    listingId={building.id}
                    propertyName={building.name}
                    propertyAddress={building.address}
                    propertyImage={building.coverImage}
                    onSuccess={(visitData) => {
                        logger.log('? Visita creada exitosamente:', visitData);
                        track(ANALYTICS_EVENTS.VISIT_SCHEDULED, {
                            property_id: building.id,
                            property_slug: building.slug,
                            property_name: building.name,
                            unit_id: selectedUnit?.id,
                            visit_id: visitData.visitId,
                            variant,
                        });
                        setIsVisitModalOpen(false);
                    }}
                />

                {/* Modal de Selector de Unidades */}
                <UnitSelectorModal
                    isOpen={isUnitSelectorModalOpen}
                    onClose={handleCloseUnitSelector}
                    building={building}
                    currentUnitId={selectedUnit?.id}
                />
            </div>
        </ErrorBoundary>
    );
}
