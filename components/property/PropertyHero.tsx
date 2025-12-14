"use client";
import React from "react";
import { MapPin, DollarSign, Flame, Shield } from "lucide-react";
import type { Building, Unit } from "@schemas/models";
import { PropertyGalleryGrid } from "./PropertyGalleryGrid";

interface PropertyHeroProps {
    building: Building;
    unit?: Unit;
    variant?: "catalog" | "marketing" | "admin";
}

export function PropertyHero({ building, unit, variant = "catalog" }: PropertyHeroProps) {
    // Badges basados en variant
    const getBadges = () => {
        switch (variant) {
            case "marketing":
                return [
                    { type: "free_commission", label: "0% comisión", tag: "Exclusivo", icon: DollarSign, color: "from-green-500 to-emerald-500" },
                    { type: "discount", label: "50% OFF primer mes", tag: "Oferta", icon: Flame, color: "from-orange-500 to-red-500" }
                ];
            case "admin":
                return [
                    { type: "admin", label: "Vista Admin", tag: "Interno", icon: Shield, color: "from-purple-500 to-indigo-500" }
                ];
            default: // catalog
                return [
                    { type: "free_commission", label: "0% comisión", tag: "Exclusivo", icon: DollarSign, color: "from-green-500 to-emerald-500" },
                    { type: "discount", label: "50% OFF primer mes", tag: "Oferta", icon: Flame, color: "from-orange-500 to-red-500" },
                    { type: "guarantee", label: "Garantía en cuotas", tag: "Flexible", icon: Shield, color: "from-indigo-500 to-blue-500" }
                ];
        }
    };

    const badges = getBadges();

    return (
        <section className="space-y-4 lg:space-y-6">
            {/* Título y ubicación con mejor jerarquía */}
            <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white:text-white leading-tight">
                    {building.name}
                </h1>
                <div className="flex items-center gap-2 text-base lg:text-lg text-gray-300:text-gray-400">
                    <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                    <span className="font-medium">{building.comuna}</span>
                    <span className="text-gray-400">•</span>
                    <span>{building.address}</span>
                </div>
            </div>

            {/* Badges promocionales optimizados para conversión */}
            <div className="flex flex-wrap gap-2 lg:gap-3" role="group" aria-label="Características destacadas">
                {badges.map((badge) => (
                    <div
                        key={badge.type}
                        className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r ${badge.color} text-white text-sm lg:text-base font-bold rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group cursor-pointer`}
                        tabIndex={0}
                        role="button"
                        aria-label={badge.label}
                        onClick={() => {
                            // Analytics tracking
                            if (typeof window !== 'undefined' && window.gtag) {
                                window.gtag('event', 'badge_click', {
                                    badge_type: badge.type,
                                    badge_label: badge.label,
                                    property_id: building.id
                                });
                            }
                        }}
                    >
                        <badge.icon className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span className="whitespace-nowrap hidden sm:inline">{badge.label}</span>
                        <span className="whitespace-nowrap sm:hidden">{badge.label.split(' ')[0]}</span>
                        <span className="text-xs lg:text-sm opacity-90 font-normal">{badge.tag}</span>
                    </div>
                ))}
            </div>

            {/* Galería con grid 1+4 estilo Airbnb */}
            <div className="mt-6 lg:mt-8">
                <PropertyGalleryGrid unit={unit} building={building} />
            </div>
        </section>
    );
}
