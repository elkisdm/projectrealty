"use client";
import React from "react";
import { MapPin, Train, Leaf, ShoppingBag, Coffee, Star, Users, Car } from "lucide-react";
import type { Building } from "@schemas/models";
// import { getCommuneData } from "@data/communes/commune-data";

interface CommuneLifeSectionProps {
    building: Building;
    variant?: "catalog" | "marketing" | "admin";
    className?: string;
}

export function CommuneLifeSection({ building, variant: _variant = "catalog", className = "" }: CommuneLifeSectionProps) {
    // Datos estáticos por ahora (se pueden hacer dinámicos después)
    const communeData = {
        name: building.comuna,
        description: "Una comuna vibrante y moderna que combina la tranquilidad residencial con la conveniencia urbana. Conectada por múltiples líneas de metro y rodeada de parques, ofrece una calidad de vida excepcional para familias y profesionales.",
        highlights: [
            { icon: Train, label: "3 líneas de metro", value: "Estación Central, Universidad de Chile, Los Héroes" },
            { icon: Leaf, label: "Parques cercanos", value: "Parque O'Higgins, Parque Forestal, Cerro Santa Lucía" },
            { icon: ShoppingBag, label: "Centros comerciales", value: "Costanera Center, Parque Arauco, Alto Las Condes" },
            { icon: Coffee, label: "Cafés y restaurantes", value: "Más de 200 opciones gastronómicas" }
        ],
        amenities: [
            { icon: Star, label: "Seguridad", value: "Policía local 24/7, vigilancia privada" },
            { icon: Users, label: "Comunidad", value: "Actividades culturales, eventos deportivos" },
            { icon: Car, label: "Transporte", value: "Metro, buses, ciclovías, estacionamientos" }
        ],
        mapPins: [
            { type: "metro", label: "Estación Metro", coordinates: "center", color: "blue" },
            { type: "park", label: "Parque O'Higgins", coordinates: "top-right", color: "green" },
            { type: "services", label: "Centro Comercial", coordinates: "bottom-left", color: "orange" }
        ]
    };

    return (
        <section className={`bg-gray-800:bg-gray-800 rounded-2xl shadow-lg border border-gray-700:border-gray-700 p-6 lg:p-8 ${className}`}>
            {/* Header con título y descripción */}
            <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-white:text-white mb-4">
                    Cómo es vivir en {communeData.name}
                </h2>
                <p className="text-base lg:text-lg text-gray-300:text-gray-300 leading-relaxed">
                    {communeData.description}
                </p>
            </div>

            {/* Highlights principales con íconos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8">
                {communeData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-900:bg-gray-700 rounded-xl">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <highlight.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white:text-white text-sm lg:text-base mb-1">
                                {highlight.label}
                            </h3>
                            <p className="text-sm text-gray-300:text-gray-400">
                                {highlight.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid de 2 columnas: Amenidades + Mapa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Amenidades de la comuna */}
                <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-white:text-white mb-4">
                        Amenidades de la comuna
                    </h3>
                    <div className="space-y-3">
                        {communeData.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-900:bg-gray-700 rounded-lg">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <amenity.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <span className="font-medium text-white:text-white text-sm">
                                        {amenity.label}:
                                    </span>
                                    <span className="text-sm text-gray-300:text-gray-400 ml-2">
                                        {amenity.value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mapa estático con pins */}
                <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-white:text-white mb-4">
                        Ubicación estratégica
                    </h3>
                    <div className="relative bg-gray-800:bg-gray-600 rounded-xl h-48 lg:h-56 overflow-hidden">
                        {/* Mapa de fondo (placeholder - en producción sería una imagen real) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 flex items-center justify-center">
                            <MapPin className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                        </div>

                        {/* Pins del mapa */}
                        {communeData.mapPins.map((pin, index) => (
                            <div
                                key={index}
                                className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg ${pin.color === "blue" ? "bg-blue-500" :
                                    pin.color === "green" ? "bg-green-500" :
                                        "bg-orange-500"
                                    }`}
                                style={{
                                    top: pin.coordinates === "top-right" ? "20%" :
                                        pin.coordinates === "bottom-left" ? "70%" : "45%",
                                    left: pin.coordinates === "top-right" ? "70%" :
                                        pin.coordinates === "bottom-left" ? "20%" : "50%",
                                    transform: "translate(-50%, -50%)"
                                }}
                                title={pin.label}
                            />
                        ))}

                        {/* Leyenda del mapa */}
                        <div className="absolute bottom-3 left-3 right-3">
                            <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 text-xs">
                                <div className="flex items-center justify-center gap-4 text-gray-300:text-gray-300">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span>Metro</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>Parques</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <span>Servicios</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA para ver más propiedades en la comuna */}
            <div className="mt-8 text-center">
                <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200">
                    <MapPin className="w-4 h-4" />
                    Ver más departamentos en {communeData.name}
                </button>
            </div>
        </section>
    );
}
