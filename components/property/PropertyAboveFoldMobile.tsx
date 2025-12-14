"use client";
import React, { useState, useEffect } from "react";
import { Share2, Heart, MessageCircle } from "lucide-react";
import type { Building, Unit } from "@schemas/models";
import { PropertyGalleryGrid } from "./PropertyGalleryGrid";

interface PropertyAboveFoldMobileProps {
    building: Building;
    selectedUnit: Unit;
    variant?: "catalog" | "marketing" | "admin";
    onScheduleVisit: () => void;
    onWhatsApp?: () => void;
    onSave?: () => void;
    onShare?: () => void;
}

export function PropertyAboveFoldMobile({
    building,
    selectedUnit,
    variant = "catalog",
    onScheduleVisit,
    onWhatsApp,
    onSave,
    onShare
}: PropertyAboveFoldMobileProps) {
    const [isSaved, setIsSaved] = useState(false);

    // Calcular precio total por mes (arriendo + GGCC)
    const arriendo = selectedUnit?.price || building.precio_desde || 290000;
    const ggcc = selectedUnit?.gastoComun || 45000; // Usar gasto común de la unidad si está disponible
    const precioTotalMes = arriendo + ggcc;

    // Datos para chips y badges
    const tipologia = selectedUnit?.tipologia || "2D";
    const m2 = selectedUnit?.area_interior_m2 || selectedUnit?.m2 || 48;
    const petFriendly = selectedUnit?.petFriendly ?? true; // Default pet friendly
    const minutosMetro = 6; // Default metro time
    const stock = building.units?.filter(u => u.disponible).length || 7;

    return (
        <section aria-labelledby="af-title" className="relative">
            {/* 1. Barra superior mínima (sticky, 56px) */}
            <div className="sticky top-0 z-30 h-14 backdrop-blur bg-white/80 dark:bg-black/30 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between px-4">
                <nav aria-label="breadcrumb" className="text-xs text-gray-800 dark:text-slate-300">
                    <span className="font-medium">{building.comuna}</span>
                    <span className="mx-2 text-gray-300:text-slate-400">·</span>
                    <span className="text-gray-700 dark:text-slate-300">{building.name}</span>
                </nav>
                <div className="flex gap-3">
                    <button
                        onClick={onShare}
                        className="w-8 h-8 flex items-center justify-center text-gray-800 dark:text-white hover:bg-gray-800:hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Compartir propiedad"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            setIsSaved(!isSaved);
                            onSave?.();
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isSaved
                            ? "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-400/20"
                            : "text-gray-800 dark:text-white hover:bg-gray-800:hover:bg-white/10"
                            }`}
                        aria-label={isSaved ? "Quitar de favoritos" : "Guardar en favoritos"}
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                </div>
            </div>

            {/* 2. Galería con grid 1+4 estilo Airbnb */}
            <div className="px-4 py-4">
                <PropertyGalleryGrid unit={selectedUnit} building={building} />
            </div>

            {/* 3. Headline + Precio total/mes */}
            <div className="px-4 py-6 bg-gray-800:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <h1 id="af-title" className="text-xl font-semibold leading-tight text-white:text-white">
                    {tipologia} luminoso en {building.comuna}
                </h1>

                <div className="mt-3">
                    <p className="text-2xl font-bold text-white:text-white">
                        ${precioTotalMes.toLocaleString('es-CL')}
                        <span className="text-sm font-normal text-gray-400:text-slate-400 ml-2">
                            / mes (arriendo + GGCC)
                        </span>
                    </p>
                    <p className="text-xs text-gray-400:text-slate-500 mt-1">
                        Respaldado por Assetplan
                    </p>
                </div>

                {/* 4. Badges clave (scroll mínimo) */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* Badge principal: 0% comisión */}
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/40 shadow-sm">
                        0% comisión
                    </span>

                    {/* Chips de características */}
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-900:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-700:border-gray-600 shadow-sm">
                        {m2} m²
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-900:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-700:border-gray-600 shadow-sm">
                        {petFriendly ? 'Pet-friendly' : 'No mascotas'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-900:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-700:border-gray-600 shadow-sm">
                        Metro {minutosMetro}'
                    </span>

                    {/* Badge de urgencia si stock bajo */}
                    {stock <= 3 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40 shadow-sm">
                            Quedan {stock}
                        </span>
                    )}
                </div>
            </div>

            {/* 5. Sticky CTA (aparece tras ~120px) */}
            <StickyCtaBar
                price={precioTotalMes}
                onScheduleVisit={onScheduleVisit}
                onWhatsApp={onWhatsApp}
            />
        </section>
    );
}

// Componente StickyCtaBar separado para mejor organización
interface StickyCtaBarProps {
    price: number;
    onScheduleVisit: () => void;
    onWhatsApp?: () => void;
}

function StickyCtaBar({ price, onScheduleVisit, onWhatsApp }: StickyCtaBarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsVisible(scrollY > 120);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-700:border-gray-700 shadow-lg px-4 py-3 safe-area-bottom">
            <div className="flex items-center justify-between gap-4">
                {/* Mini precio a la izquierda */}
                <div className="flex-shrink-0">
                    <p className="text-lg font-bold text-white:text-white">
                        ${price.toLocaleString('es-CL')}
                    </p>
                    <p className="text-xs text-gray-400:text-slate-500">/ mes</p>
                </div>

                {/* CTAs */}
                <div className="flex gap-3 flex-1">
                    <button
                        onClick={onScheduleVisit}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                    >
                        Agendar visita
                    </button>

                    {onWhatsApp && (
                        <button
                            onClick={onWhatsApp}
                            className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                            aria-label="Contactar por WhatsApp"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
