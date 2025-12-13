"use client";
import React from "react";
import { Info, Bed, Bath, Square, DollarSign } from "lucide-react";
import { FirstPaymentCalculator } from "./FirstPaymentCalculator";
import type { Unit, Building } from "@schemas/models";

interface PropertyMobilePricingProps {
    building: Building;
    selectedUnit: Unit;
    originalPrice: number;
    discountPrice: number;
    unitDetails: any;
    onScheduleVisit: () => void;
    onSendQuotation: () => void;
    variant?: "catalog" | "marketing" | "admin";
    className?: string;
}

export function PropertyMobilePricing({
    building: _building,
    selectedUnit,
    originalPrice,
    discountPrice,
    unitDetails,
    onScheduleVisit,
    onSendQuotation,
    variant = "catalog",
    className = ""
}: PropertyMobilePricingProps) {
    // Badge principal de 0% comisión
    const getMainBadge = () => {
        if (variant === "marketing") {
            return {
                label: "0% comisión",
                tag: "Exclusivo",
                color: "from-green-500 to-emerald-500",
                icon: DollarSign
            };
        }
        return {
            label: "0% comisión",
            tag: "Exclusivo",
            color: "from-green-500 to-emerald-500",
            icon: DollarSign
        };
    };

    const mainBadge = getMainBadge();

    // Badges secundarios según variant
    const getSecondaryBadges = () => {
        if (variant === "marketing") {
            return [
                { label: "50% OFF primer mes", tag: "Oferta", color: "from-orange-500 to-red-500" },
                { label: "Sin aval", tag: "Flexible", color: "from-purple-500 to-indigo-500" }
            ];
        }
        return [
            { label: "50% OFF primer mes", tag: "Oferta", color: "from-orange-500 to-red-500" },
            { label: "Garantía en cuotas", tag: "Flexible", color: "from-indigo-500 to-blue-500" },
            { label: "Opción sin aval", tag: "Sin aval", color: "from-purple-500 to-indigo-500" }
        ];
    };

    const secondaryBadges = getSecondaryBadges();

    // Cálculo del precio total mensual (arriendo + gastos comunes)
    const gastosComunes = 102000; // Esto debería venir de los datos
    const precioTotalMensual = discountPrice + gastosComunes;

    return (
        <section className={`lg:hidden ${className}`}>
            {/* Badge principal de 0% comisión - Above the fold */}
            <div className="mb-4">
                <div className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r ${mainBadge.color} text-white text-sm font-bold rounded-xl shadow-lg`}>
                    <mainBadge.icon className="w-4 h-4" />
                    <span>{mainBadge.label}</span>
                    <span className="text-xs opacity-90 font-normal">{mainBadge.tag}</span>
                </div>
            </div>

            {/* Precio total mensual prominente */}
            <div className="bg-gray-800:bg-gray-800 rounded-xl shadow-lg border border-gray-700:border-gray-700 p-4 mb-4">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-white:text-white mb-1">
                        Departamento {selectedUnit.id}
                    </h2>
                    <p className="text-sm text-gray-300:text-gray-400">
                        {unitDetails.tipologia} • Piso {unitDetails.piso}
                    </p>
                </div>

                {/* Precio total mensual destacado */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 p-4 mb-4">
                    <div className="text-center">
                        <div className="text-sm text-gray-300:text-gray-400 mb-1">
                            Total mensual
                        </div>
                        <div className="text-2xl font-bold text-white:text-white mb-1">
                            ${precioTotalMensual.toLocaleString('es-CL')}
                        </div>
                        <div className="text-xs text-gray-400:text-gray-400">
                            Arriendo + Gastos comunes
                        </div>
                    </div>
                </div>

                {/* Desglose de precios */}
                <div className="bg-gray-800:bg-gray-800 rounded-xl border border-gray-700:border-gray-700 p-3 mb-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300:text-gray-400">Valor arriendo</span>
                            <span className="text-sm line-through text-gray-500">${originalPrice.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-600">50% OFF primer mes</span>
                            <span className="text-lg font-bold text-white:text-white">${discountPrice.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300:text-gray-400">Gasto común fijo</span>
                            <span className="text-sm font-medium text-white:text-white">${gastosComunes.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300:text-gray-400">Garantía</span>
                            <span className="text-sm font-medium text-white:text-white">${originalPrice.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                </div>

                {/* Badges secundarios */}
                <div className="flex flex-wrap gap-1 mb-4">
                    {secondaryBadges.map((badge, index) => (
                        <div
                            key={index}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200`}
                        >
                            <Info className="w-3 h-3" />
                            {badge.label}
                        </div>
                    ))}
                </div>

                {/* Características principales */}
                <div className="bg-gray-900:bg-gray-700 rounded-xl p-3 mb-4">
                    <h3 className="font-semibold text-white:text-white text-center mb-3 text-sm">
                        Características principales
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-gray-800:bg-gray-600 rounded-lg p-2">
                            <Bed className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <div className="text-sm font-semibold text-white:text-white">{unitDetails.dormitorios}</div>
                            <div className="text-xs text-gray-400:text-gray-400">Dorm.</div>
                        </div>
                        <div className="bg-gray-800:bg-gray-600 rounded-lg p-2">
                            <Bath className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <div className="text-sm font-semibold text-white:text-white">{unitDetails.banos}</div>
                            <div className="text-xs text-gray-400:text-gray-400">Baños</div>
                        </div>
                        <div className="bg-gray-800:bg-gray-600 rounded-lg p-2">
                            <Square className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <div className="text-sm font-semibold text-white:text-white">{unitDetails.m2}</div>
                            <div className="text-xs text-gray-400:text-gray-400">m²</div>
                        </div>
                    </div>
                </div>

                {/* Calculadora de primer pago */}
                <FirstPaymentCalculator
                    originalPrice={originalPrice}
                    discountPrice={discountPrice}
                    firstPaymentCalculation={unitDetails.firstPaymentCalculation}
                    moveInDate={unitDetails.moveInDate}
                    includeParking={unitDetails.includeParking}
                    includeStorage={unitDetails.includeStorage}
                    onDateChange={unitDetails.handleDateChange}
                    onParkingChange={unitDetails.setIncludeParking}
                    onStorageChange={unitDetails.setIncludeStorage}
                    onSendQuotation={onSendQuotation}
                    variant="compact"
                />

                {/* Botones de acción */}
                <div className="space-y-2">
                    <button
                        onClick={onScheduleVisit}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-100 text-sm"
                        aria-label="Solicitar visita"
                    >
                        Solicitar visita
                    </button>
                    <button
                        onClick={onSendQuotation}
                        className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-white:text-white text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-100 text-sm"
                        aria-label="Postular"
                    >
                        Postular
                    </button>
                </div>
            </div>
        </section>
    );
}
