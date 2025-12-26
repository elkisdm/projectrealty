"use client";
import React from "react";
import { DollarSign, ChevronDown } from "lucide-react";

interface FirstPaymentSummaryProps {
    totalFirstPayment: number;
    onViewDetails: () => void;
    className?: string;
}

export function FirstPaymentSummary({
    totalFirstPayment,
    onViewDetails,
    className = ""
}: FirstPaymentSummaryProps) {
    return (
        <div className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg lg:rounded-xl border border-green-200 dark:border-green-700 p-3 lg:p-4 ${className}`}>
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <div className="p-1.5 lg:p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                    <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-text text-sm lg:text-base">
                    Primer pago
                </h3>
            </div>

            <div className="ml-8 lg:ml-11 mb-3 lg:mb-4">
                <div className="text-2xl lg:text-3xl font-bold text-text mb-1">
                    ${totalFirstPayment.toLocaleString('es-CL')}
                </div>
                <div className="text-xs lg:text-sm text-text-secondary">
                    Incluye depósito + primer mes + gastos comunes
                </div>
            </div>

            <button
                onClick={onViewDetails}
                className="w-full flex items-center justify-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200 text-sm font-medium py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                aria-label="Ver detalles del cálculo del primer pago"
            >
                <span>Ver detalles del cálculo</span>
                <ChevronDown className="w-4 h-4" />
            </button>
        </div>
    );
}
