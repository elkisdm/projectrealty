"use client";
import React from "react";
import { Bed, Bath, Square, Calendar, Phone } from "lucide-react";
import { FirstPaymentSummary } from "./FirstPaymentSummary";
import { useScrollVisibility } from "@hooks/useScrollVisibility";
import { logger } from "@lib/logger";
import type { Unit, Building } from "@schemas/models";

interface PropertySidebarProps {
  building: Building;
  selectedUnit: Unit | null;
  unitDetails: any;
  originalPrice: number;
  discountPrice: number;
  firstPaymentCalculation: any;
  moveInDate: Date;
  includeParking: boolean;
  includeStorage: boolean;
  onDateChange: (date: Date) => void;
  onParkingChange: (include: boolean) => void;
  onStorageChange: (include: boolean) => void;
  onSendQuotation: () => void;
  onScheduleVisit: () => void;
  onViewPaymentDetails: () => void;
  variant?: "catalog" | "marketing" | "admin";
  className?: string;
}

export function PropertySidebar({
  building,
  selectedUnit,
  unitDetails,
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
  onScheduleVisit,
  onViewPaymentDetails,
  variant = "catalog",
  className = ""
}: PropertySidebarProps) {
  // Hook para detectar cuando el usuario llega a la sección de detalles
  const isPaymentDetailsVisible = useScrollVisibility({
    targetId: "first-payment-details",
    threshold: 0.1
  });
  const getCTAs = () => {
    if (variant === "marketing") {
      return [
        {
          label: "¡Agendar visita ahora!",
          icon: Calendar,
          onClick: onScheduleVisit,
          variant: "primary" as const,
          className: "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900"
        },
        {
          label: "WhatsApp directo",
          icon: Phone,
          onClick: () => {
            const waLink = `https://wa.me/56912345678?text=Hola! Me interesa el departamento ${selectedUnit?.tipologia} en ${building.name}. ¿Podrías darme más información?`;
            window.open(waLink, "_blank");
          },
          variant: "secondary" as const,
          className: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        }
      ];
    }

    if (variant === "admin") {
      return [
        {
          label: "Editar propiedad",
          icon: Calendar,
          onClick: () => logger.log("Editar propiedad"),
          variant: "primary" as const,
          className: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        },
        {
          label: "Ver estadísticas",
          icon: Phone,
          onClick: () => logger.log("Ver estadísticas"),
          variant: "secondary" as const,
          className: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
        }
      ];
    }

    // Variante catalog (por defecto)
    return [
      {
        label: "Agendar visita",
        icon: Calendar,
        onClick: onScheduleVisit,
        variant: "primary" as const,
        className: "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900"
      },
      {
        label: "WhatsApp",
        icon: Phone,
        onClick: () => {
          const waLink = `https://wa.me/56912345678?text=Hola! Me interesa el departamento ${selectedUnit?.tipologia} en ${building.name}. ¿Podrías darme más información?`;
          window.open(waLink, "_blank");
        },
        variant: "secondary" as const,
        className: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
      }
    ];
  };

  const ctas = getCTAs();

  return (
    <aside className={`hidden lg:block lg:col-span-1 ${className}`}>
      <div className="sticky top-8">
        <div className="bg-card rounded-xl lg:rounded-2xl shadow-lg border border-border p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Título de la unidad */}
          <div className="text-center">
            <h2 className="text-xl lg:text-2xl font-bold text-text mb-1">
              Departamento {selectedUnit?.id || 'N/A'}
            </h2>
            <p className="text-xs lg:text-sm text-text-secondary">
              {selectedUnit?.tipologia} • Piso {unitDetails.piso}
            </p>
          </div>

          {/* Precio destacado mejorado - Ultra compacto */}
          <div className="text-center p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg lg:rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="text-2xl lg:text-4xl font-bold text-text mb-1 lg:mb-2">
              ${originalPrice.toLocaleString('es-CL')}
            </div>
            <div className="text-sm lg:text-lg text-green-600 font-bold mb-1">
              50% OFF primer mes
            </div>
            <div className="text-xs lg:text-sm text-text-secondary">
              ${discountPrice.toLocaleString('es-CL')} primer mes
            </div>
            <div className="mt-2 lg:mt-3 text-xs text-text-muted">
              Sin comisión de arriendo
            </div>
          </div>

          {/* Información rápida de la unidad */}
          <div className="bg-surface rounded-lg lg:rounded-xl p-3 lg:p-4 space-y-2 lg:space-y-3">
            <h3 className="font-semibold text-text text-center mb-2 lg:mb-3 text-sm lg:text-base">
              Características principales
            </h3>
            <div className="grid grid-cols-3 gap-2 lg:gap-3 text-center">
              <div className="bg-card rounded-lg p-1.5 lg:p-2">
                <Bed className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs lg:text-sm font-semibold text-text">
                  {unitDetails.dormitorios}
                </div>
                <div className="text-xs text-text-muted">Dorm.</div>
              </div>
              <div className="bg-card rounded-lg p-1.5 lg:p-2">
                <Bath className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs lg:text-sm font-semibold text-text">
                  {unitDetails.banos}
                </div>
                <div className="text-xs text-text-muted">Baños</div>
              </div>
              <div className="bg-card rounded-lg p-1.5 lg:p-2">
                <Square className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs lg:text-sm font-semibold text-text">
                  {unitDetails.m2}
                </div>
                <div className="text-xs text-text-muted">m²</div>
              </div>
            </div>
          </div>

          {/* Resumen del primer pago - Se oculta cuando se llega a la sección de detalles */}
          {!isPaymentDetailsVisible && (
            <FirstPaymentSummary
              totalFirstPayment={firstPaymentCalculation.totalFirstPayment}
              onViewDetails={onViewPaymentDetails}
            />
          )}

          {/* CTAs principales */}
          <div className="space-y-3">
            {ctas.map((cta, index) => (
              <button
                key={cta.label}
                className={`w-full ${cta.className} text-white font-bold py-3 lg:py-4 px-4 lg:px-6 rounded-lg lg:rounded-xl shadow-lg transition-colors duration-100 border border-white/20 text-sm lg:text-base`}
                onClick={cta.onClick}
                aria-label={cta.label}
              >
                <div className="flex items-center justify-center gap-2">
                  <cta.icon className="w-5 h-5" />
                  <span>{cta.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

