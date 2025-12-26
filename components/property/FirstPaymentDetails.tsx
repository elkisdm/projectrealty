"use client";
import React from "react";
import { Calculator } from "lucide-react";
import { FirstPaymentCalculator } from "./FirstPaymentCalculator";

interface FirstPaymentCalculation {
    netRentStorage: number;
    proratedGC: number;
    initialDeposit: number;
    commissionToPay: number;
    totalFirstPayment: number;
    daysChargedCount: number;
    daysInMonth: number;
    prorateFactor: number;
    promoDays: number;
    regularDays: number;
    totalRent: number;
    totalParking: number;
    totalStorage: number;
}

interface FirstPaymentDetailsProps {
    originalPrice: number;
    discountPrice: number;
    firstPaymentCalculation: FirstPaymentCalculation;
    moveInDate: Date;
    includeParking: boolean;
    includeStorage: boolean;
    onDateChange: (date: Date) => void;
    onParkingChange: (include: boolean) => void;
    onStorageChange: (include: boolean) => void;
    onSendQuotation: () => void;
    className?: string;
}

export function FirstPaymentDetails({
    originalPrice,
    discountPrice,
    firstPaymentCalculation,
    moveInDate,
    includeParking,
    includeStorage,
    onDateChange,
    onParkingChange,
    onStorageChange,
    onSendQuotation,
    className = ""
}: FirstPaymentDetailsProps) {
    return (
        <section id="first-payment-details" className={`py-6 lg:py-8 ${className}`}>
            <div className="max-w-3xl mx-auto px-4 lg:px-6">
                {/* Header compacto */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                            <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl lg:text-2xl font-bold text-text">
                            Calculadora del Primer Pago
                        </h2>
                    </div>
                    <p className="text-sm text-text-secondary max-w-xl mx-auto">
                        Calcula exactamente cuánto necesitas para el primer pago.
                    </p>
                </div>

                {/* Resumen compacto */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 p-4 mb-6">
                    <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-text mb-2">
                            ${firstPaymentCalculation.totalFirstPayment.toLocaleString('es-CL')}
                        </div>
                        <div className="text-sm text-text-secondary mb-3">
                            Total del primer pago
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                                <div className="font-semibold text-text">Depósito</div>
                                <div className="text-green-600 font-bold">
                                    ${firstPaymentCalculation.initialDeposit.toLocaleString('es-CL')}
                                </div>
                            </div>
                            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                                <div className="font-semibold text-text">Primer mes</div>
                                <div className="text-green-600 font-bold">
                                    ${firstPaymentCalculation.totalRent.toLocaleString('es-CL')}
                                </div>
                            </div>
                            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                                <div className="font-semibold text-text">Gastos comunes</div>
                                <div className="text-green-600 font-bold">
                                    ${firstPaymentCalculation.proratedGC.toLocaleString('es-CL')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calculadora interactiva compacta */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-4 lg:p-6">
                    <FirstPaymentCalculator
                        originalPrice={originalPrice}
                        discountPrice={discountPrice}
                        firstPaymentCalculation={firstPaymentCalculation}
                        moveInDate={moveInDate}
                        includeParking={includeParking}
                        includeStorage={includeStorage}
                        onDateChange={onDateChange}
                        onParkingChange={onParkingChange}
                        onStorageChange={onStorageChange}
                        onSendQuotation={onSendQuotation}
                        variant="detailed"
                    />
                </div>
            </div>
        </section>
    );
}
