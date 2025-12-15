"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Share2, Heart } from "lucide-react";
import type { Building, Unit } from "@schemas/models";
import { PropertyGalleryGrid } from "./PropertyGalleryGrid";
import { StickyCtaBar } from "@components/ui/StickyCtaBar";

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

                <div className="mt-3 flex items-end justify-between gap-4">
                    <div className="flex flex-col">
                        <p className="text-2xl font-bold text-white:text-white">
                            ${arriendo.toLocaleString('es-CL')}
                            <span className="text-sm font-normal text-gray-400:text-slate-400 ml-2">
                                / mes
                            </span>
                        </p>
                        <p className="text-lg font-medium text-gray-300:text-slate-300">
                            + ${ggcc.toLocaleString('es-CL')}
                            <span className="text-sm font-normal text-gray-400:text-slate-400 ml-2">
                                (GGCC)
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pb-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                            Operado por
                        </span>
                        <div className="flex items-center">
                            <div className="relative w-24 h-6">
                                <Image
                                    src="/images/assetplan-logo.svg"
                                    alt="AssetPlan"
                                    fill
                                    className="object-contain object-right"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Badges clave (scroll mínimo) */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* Badge principal: 0% comisión - DESHABILITADO TEMPORALMENTE
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/40 shadow-sm">
                        0% comisión
                    </span>
                    */}

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

            {/* Sticky CTA Bar - aparece después de scroll > 120px */}
            <StickyCtaBar
                priceMonthly={precioTotalMes}
                onBook={onScheduleVisit}
                onWhatsApp={onWhatsApp || (() => {})}
                propertyId={selectedUnit?.id}
                commune={building.comuna}
            />
        </section>
    );
}
