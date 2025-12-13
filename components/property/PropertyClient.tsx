"use client";
import React, { useState, useEffect, Suspense } from "react";
import { AlertCircle } from "lucide-react";

import { track } from "@lib/analytics";
import { logger } from "@lib/logger";
import type { Building } from "@schemas/models";
import { QuintoAndarVisitScheduler } from "@components/flow/QuintoAndarVisitScheduler";
import { usePropertyUnit } from "@hooks/usePropertyUnit";
import { FirstPaymentDetails } from "./FirstPaymentDetails";

// Componentes de propiedad
import { PropertyAboveFoldMobile } from "./PropertyAboveFoldMobile";
import { PropertyBreadcrumb } from "./PropertyBreadcrumb";
import { PropertySidebar } from "./PropertySidebar";
import { PropertyAccordion } from "./PropertyAccordion";
import { CommuneLifeSection } from "./CommuneLifeSection";
import { PropertyFAQ } from "./PropertyFAQ";

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
                            Algo salió mal
                        </h2>
                        <p className="text-text-secondary mb-4">
                            No pudimos cargar la información de la propiedad. Por favor, intenta de nuevo.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Usar el hook para manejar la lógica de la unidad
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

    // Analytics tracking on mount
    useEffect(() => {
        track("property_view", {
            property_id: building.id,
            property_name: building.name,
            property_slug: building.slug,
            variant
        });
    }, [building.id, building.name, building.slug, variant]);

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

    // Handle errors gracefully
    useEffect(() => {
        if (!building) {
            setError("No se pudo cargar la información de la propiedad");
        } else if (building && building.units.filter(unit => unit.disponible).length === 0) {
            setError("No hay unidades disponibles en esta propiedad");
        } else {
            setError(null); // Clear any previous errors
        }
    }, [building]);

    // Función para enviar cotización
    const handleSendQuotation = () => {
        track("quotation_sent", {
            property_id: building.id,
            property_name: building.name,
            variant
        });
        alert(`Cotización enviada por email para la propiedad ${building.name}`);
    };

    // Función para navegar a la sección de detalles del primer pago
    const handleViewPaymentDetails = () => {
        const element = document.getElementById('first-payment-details');
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

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
                        aria-label="Recargar página"
                    >
                        Recargar página
                    </button>
                </div>
            </div>
        );
    }

    // Si se solicita ver todas las unidades o hay filtro de tipología, mostrar lista de unidades
    const availableUnits = building.units.filter((unit) => unit.disponible);

    if (showAllUnits || tipologiaFilter) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen bg-bg">
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                        <PropertyBreadcrumb building={building} variant={variant} />
                        <div className="mt-6">
                            <a
                                href={`/property/${building.slug}`}
                                className="inline-flex items-center gap-2 text-sm text-subtext hover:text-text transition-colors mb-6"
                            >
                                ← Volver a la propiedad
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
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                    {/* Breadcrumb accesible */}
                    <PropertyBreadcrumb building={building} variant={variant} />

                    {/* Layout principal: 3 columnas */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                        {/* Columna principal (2/3) */}
                        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                            {/* Above the fold móvil optimizado para conversión + Galería integrada */}
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
                                onScheduleVisit={() => setIsModalOpen(true)}
                                onWhatsApp={() => {
                                    // TODO: Implementar WhatsApp
                                    logger.log("WhatsApp clicked");
                                }}
                                onSave={() => {
                                    // TODO: Implementar guardar en favoritos
                                    logger.log("Save clicked");
                                }}
                                onShare={() => {
                                    // TODO: Implementar compartir
                                    logger.log("Share clicked");
                                }}
                            />

                            {/* Acordeones optimizados para conversión */}
                            <PropertyAccordion
                                building={building}
                                selectedUnit={selectedUnit}
                                onScheduleVisit={() => setIsModalOpen(true)}
                                onPreapproval={() => {
                                    // TODO: Implementar modal de preaprobación
                                    logger.log("Preaprobación iniciada");
                                }}
                            />

                            {/* Cómo es vivir en la comuna */}
                            <CommuneLifeSection building={building} variant={variant} />

                            {/* Calculadora detallada del primer pago */}
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

                            {/* Preguntas frecuentes */}
                            <PropertyFAQ building={building} variant={variant} />

                            {/* Sticky Mobile CTA ya está integrado en PropertyAboveFoldMobile */}
                        </div>

                        {/* Sidebar sticky (1/3) - Oculto en móviles */}
                        <PropertySidebar
                            building={building}
                            selectedUnit={selectedUnit}
                            unitDetails={unitDetails}
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
                            onScheduleVisit={() => setIsModalOpen(true)}
                            onViewPaymentDetails={handleViewPaymentDetails}
                            variant={variant}
                        />
                    </div>
                </main>

                {/* Modal de Agendamiento QuintoAndar */}
                <QuintoAndarVisitScheduler
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    listingId={building.id}
                    propertyName={building.name}
                    propertyAddress={building.address}
                    propertyImage={building.coverImage}
                    onSuccess={(visitData) => {
                        logger.log('✅ Visita creada exitosamente:', visitData);
                        track("visit_scheduled", {
                            property_id: building.id,
                            property_name: building.name,
                            visit_id: visitData.visitId,
                            variant
                        });
                        setIsModalOpen(false);
                    }}
                />
            </div>
        </ErrorBoundary>
    );
}
