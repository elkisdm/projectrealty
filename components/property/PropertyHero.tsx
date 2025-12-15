"use client";
import React from "react";
import { MapPin } from "lucide-react";
import type { Building, Unit } from "@schemas/models";
import { PropertyGalleryGrid } from "./PropertyGalleryGrid";
import { PropertyTags } from "./PropertyTags";
import { AvailabilityStatus } from "./AvailabilityStatus";

interface PropertyHeroProps {
    building: Building;
    unit?: Unit;
    variant?: "catalog" | "marketing" | "admin";
}

export function PropertyHero({ building, unit, variant = "catalog" }: PropertyHeroProps) {

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

            {/* Tags de estado y urgencia */}
            <PropertyTags building={building} unit={unit} variant={variant} />

            {/* Estado de disponibilidad */}
            {unit && <AvailabilityStatus unit={unit} buildingName={building.name} />}

            {/* Galería con grid 1+4 estilo Airbnb */}
            <div className="mt-6 lg:mt-8">
                <PropertyGalleryGrid unit={unit} building={building} />
            </div>
        </section>
    );
}
