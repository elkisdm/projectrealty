"use client";
import React, { useState, useEffect, Suspense, useRef, useMemo, useCallback, startTransition } from "react";
import { AlertCircle, HelpCircle } from "lucide-react";

import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { logger } from "@lib/logger";
import { buildPropertyWhatsAppUrl } from "@lib/whatsapp";
import type { Building, Unit } from "@schemas/models";
import { QuintoAndarVisitScheduler } from "@components/flow/QuintoAndarVisitScheduler";
import { usePropertyUnit } from "@hooks/usePropertyUnit";
// TODO: Reintegrar cuando esté pulido
// import { FirstPaymentDetails } from "./FirstPaymentDetails";

// Componentes de propiedad
import { PropertyAboveFoldMobile } from "./PropertyAboveFoldMobile";
import { PropertyBreadcrumb } from "./PropertyBreadcrumb";
import { PropertySidebar } from "./PropertySidebar";
import { PropertyBookingCard } from "./PropertyBookingCard";
import { PropertyTabs } from "./PropertyTabs";
import { PropertySimilarUnits } from "./PropertySimilarUnits";
import { PropertyAccordionSections } from "./PropertyAccordionSections";
import { PropertyFAQ } from "./PropertyFAQ";
import { PropertyFAQModal } from "./PropertyFAQModal";
import { PropertyPriceBreakdown } from "./PropertyPriceBreakdown";
import { UnitSelectorModal } from "./UnitSelectorModal";

// Import directo para evitar problemas de lazy loading
import { RelatedList } from "@components/lists/RelatedList";
import { UnitsList } from "./UnitsList";
import { PullToRefresh } from "@components/ui/PullToRefresh";

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Función para refresh de la página
    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            // Recargar la página para obtener datos actualizados
            window.location.reload();
        } catch (err) {
            console.error("Error al refrescar:", err);
            setIsLoading(false);
        }
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);
    const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);

    // Callback memoizado para abrir el selector de unidades
    const handleOpenUnitSelector = useCallback(() => {
        // Usar startTransition para que el cambio de estado no bloquee el hilo principal
        startTransition(() => {
            setIsUnitSelectorOpen(true);
        });
    }, []);

    // Callback memoizado para cerrar el selector de unidades
    const handleCloseUnitSelector = useCallback(() => {
        setIsUnitSelectorOpen(false);
    }, []);

    // Memoizar fallback unit para evitar crear objetos nuevos en cada render
    const fallbackUnit = useMemo(() => {
        const firstAvailable = building.units.find(u => u.disponible);
        if (firstAvailable) return firstAvailable;
        return {
            id: 'default',
            tipologia: '2D1B',
            slug: 'default-unit',
            codigoUnidad: 'default',
            buildingId: building.id,
            m2: 50,
            price: building.precio_desde || 290000,
            disponible: false,
            dormitorios: 2,
            banos: 1,
            garantia: building.precio_desde || 290000,
            estacionamiento: false,
            bodega: false
        } as Unit;
    }, [building.units, building.precio_desde, building.id]);

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

    // Si se solicita ver todas las unidades o hay filtro de tipología, mostrar lista de unidades
    const availableUnits = useMemo(() => 
        building.units.filter((unit) => unit.disponible),
        [building.units]
    );

    // Analytics tracking on mount - property view con datos de unidad
    // Usar ref para evitar re-ejecuciones innecesarias
    const trackedUnitIdRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (selectedUnit && selectedUnit.id !== trackedUnitIdRef.current) {
            trackedUnitIdRef.current = selectedUnit.id;
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
    }, [building.id, building.slug, building.name, building.comuna, selectedUnit?.id, variant]);

    // Listen for custom event to open modal
    useEffect(() => {
        const handleOpenModal = () => {
            setIsModalOpen(true);
        };

        window.addEventListener('openVisitScheduler', handleOpenModal);
        return () => {
            window.removeEventListener('openVisitScheduler', handleOpenModal);
        };
    }, []);


    // Memoizar unidades disponibles para evitar filtrar en cada render
    const availableUnitsCount = useMemo(() => {
        return building.units.filter(unit => unit.disponible).length;
    }, [building.units]);

    // Handle errors gracefully
    useEffect(() => {
        if (!building) {
            setError("No se pudo cargar la informaci?n de la propiedad");
        } else if (availableUnitsCount === 0) {
            setError("No hay unidades disponibles en esta propiedad");
        } else {
            setError(null); // Clear any previous errors
        }
    }, [building, availableUnitsCount]);

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

    if (showAllUnits || tipologiaFilter) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen bg-bg">
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                        <PropertyBreadcrumb building={building} unit={selectedUnit || undefined} variant={variant} />
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
            <PullToRefresh onRefresh={handleRefresh} disabled={isLoading}>
                <div className="min-h-screen bg-bg">
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                        {/* Breadcrumb accesible */}
                        <PropertyBreadcrumb building={building} unit={selectedUnit || undefined} variant={variant} />

                        {/* Layout principal: 3 columnas */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                        {/* Columna principal (2/3) */}
                        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                            {/* Above the fold m?vil optimizado para conversi?n + Galer?a integrada */}
                            <PropertyAboveFoldMobile
                                building={building}
                                selectedUnit={selectedUnit ?? fallbackUnit}
                                variant={variant}
                                onScheduleVisit={() => setIsModalOpen(true)}
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

                            {/* Breakdown de precios (solo móvil) */}
                            {selectedUnit && (
                                <PropertyPriceBreakdown
                                    building={building}
                                    selectedUnit={selectedUnit}
                                    originalPrice={originalPrice}
                                    discountPrice={discountPrice}
                                    onScheduleVisit={() => setIsModalOpen(true)}
                                    onWhatsApp={handleWhatsAppClick}
                                    onSendQuotation={handleSendQuotation}
                                    onSelectOtherUnit={handleOpenUnitSelector}
                                />
                            )}

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

                            {/* Secciones expandibles (reemplazo de CommuneLifeSection) */}
                            <PropertyAccordionSections building={building} selectedUnit={selectedUnit} />

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

                            {/* Preguntas frecuentes - Botón para abrir modal */}
                            <section aria-labelledby="faq-section-heading" className="mt-12 lg:mt-16">
                                <div className="text-center">
                                    <h2 id="faq-section-heading" className="text-xl lg:text-2xl font-bold text-text mb-4 lg:mb-6">
                                        Preguntas frecuentes
                                    </h2>
                                    <p className="text-sm lg:text-base text-text-muted mb-6 max-w-2xl mx-auto">
                                        Resolvemos las dudas más comunes sobre esta propiedad
                                    </p>
                                    <button
                                        onClick={() => setIsFAQModalOpen(true)}
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 shadow-lg hover:shadow-xl min-h-[48px]"
                                        aria-label="Ver preguntas frecuentes"
                                    >
                                        <HelpCircle className="w-5 h-5" />
                                        <span>Ver preguntas frecuentes</span>
                                    </button>
                                </div>
                            </section>

                            {/* Sticky Mobile CTA ya est? integrado en PropertyAboveFoldMobile */}
                        </div>

                        {/* Sidebar sticky (1/3) - Booking Card según especificación Assetplan */}
                        {selectedUnit && (
                            <PropertyBookingCard
                                unit={selectedUnit}
                                building={building}
                                onScheduleVisit={() => setIsModalOpen(true)}
                                onWhatsApp={handleWhatsAppClick}
                                onSelectOtherUnit={handleOpenUnitSelector}
                            />
                        )}
                    </div>
                </main>

                {/* Modal de Agendamiento QuintoAndar */}
                <QuintoAndarVisitScheduler
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    listingId={building.id}
                    propertyName={building.name}
                    propertyAddress={building.address}
                    propertyImage={(building as { coverImage?: string }).coverImage}
                    unit={selectedUnit ?? undefined}
                    building={building}
                    onSuccess={(visitData) => {
                        logger.log('✅ Visita creada exitosamente:', visitData);
                        track(ANALYTICS_EVENTS.VISIT_SCHEDULED, {
                            property_id: building.id,
                            property_slug: building.slug,
                            property_name: building.name,
                            unit_id: selectedUnit?.id,
                            visit_id: visitData.visitId,
                            variant,
                        });
                        setIsModalOpen(false);
                    }}
                />

                {/* Modal de Selección de Unidades */}
                <UnitSelectorModal
                    isOpen={isUnitSelectorOpen}
                    onClose={handleCloseUnitSelector}
                    building={building}
                    currentUnitId={selectedUnit?.id}
                />

                {/* Modal de Preguntas Frecuentes */}
                <PropertyFAQModal
                    isOpen={isFAQModalOpen}
                    onClose={() => setIsFAQModalOpen(false)}
                    building={building}
                    variant={variant}
                />
                </div>
            </PullToRefresh>
        </ErrorBoundary>
    );
}
