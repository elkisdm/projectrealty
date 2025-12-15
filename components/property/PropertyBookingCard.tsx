"use client";

import React, { useState } from "react";
import { Wallet, Building2, Shield, TrendingUp } from "lucide-react";
import type { Unit, Building } from "@schemas/models";
import { PropertyCTAs } from "./PropertyCTAs";
import { PreApprovalCard } from "./PreApprovalCard";

interface PropertyBookingCardProps {
  unit: Unit;
  building: Building;
  onScheduleVisit: () => void;
  onWhatsApp?: () => void;
  onSelectOtherUnit?: () => void;
  className?: string;
}

export function PropertyBookingCard({
  unit,
  building,
  onScheduleVisit,
  onWhatsApp,
  onSelectOtherUnit,
  className = ""
}: PropertyBookingCardProps) {
  // Información económica
  const arriendo = unit.price;
  const gastoComun = unit.gastoComun || 0;
  const garantia = unit.garantia || arriendo; // Fallback: garantía = arriendo si no está definida
  const precioFijoMeses = unit.precioFijoMeses || 3;
  const garantiaEnCuotas = unit.garantiaEnCuotas || false;
  const cuotasGarantia = unit.cuotasGarantia || 3;
  const reajuste = unit.reajuste || "cada 3 meses según UF";
  const [showPreApproval, setShowPreApproval] = useState(false);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handler para postular
  const handlePostular = () => {
    // TODO: Implementar lógica de postulación
    console.log("Postular clicked");
  };

  // Handler para pre-aprobación
  const handlePreApprovalOpen = () => {
    setShowPreApproval(true);
  };

  // Información de unidad y edificio
  const codigoUnidad = unit.codigoUnidad || unit.id;
  const nombreEdificio = building.name;
  const direccionCompleta = building.address;

  return (
    <>
      {/* Desktop: Sticky Card en Sidebar */}
      <div className={`hidden lg:block ${className}`}>
        <div className="sticky top-24">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-6 space-y-6">
            {/* Información de unidad y edificio */}
            {/* Información de unidad y edificio */}
            <div className="space-y-1 pb-4 border-b border-border">
              <div className="text-xl font-bold text-text leading-tight">
                {unit.tipologia || 'DEPARTAMENTO'}
              </div>
              <div className="pt-1">
                <div className="text-sm font-semibold text-text">
                  {nombreEdificio}
                </div>
                <div className="text-xs text-subtext">
                  {direccionCompleta}
                </div>
              </div>
            </div>

            {/* Precio destacado */}
            <div className="text-center">
              <div className="text-3xl font-bold tracking-tight tabular-nums text-text mb-1">
                {formatPrice(arriendo)}
              </div>
              <div className="text-sm text-subtext">
                /mes
              </div>
            </div>

            {/* Bloque financiero con iconos */}
            <div className="space-y-4">
              {/* Valor Arriendo */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8B6CFF]/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#8B6CFF]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text">
                    Valor Arriendo
                  </div>
                  <div className="text-xs text-subtext mt-0.5">
                    Precio fijo primeros {precioFijoMeses} meses
                  </div>
                </div>
              </div>

              {/* Gasto Común */}
              {gastoComun > 0 && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8B6CFF]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#8B6CFF]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text">
                      Gasto Común Fijo
                    </div>
                    <div className="text-xs text-subtext mt-0.5">
                      {formatPrice(gastoComun)}
                    </div>
                  </div>
                </div>
              )}

              {/* Garantía */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8B6CFF]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#8B6CFF]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text">
                    Garantía
                  </div>
                  <div className="text-xs text-subtext mt-0.5">
                    {formatPrice(garantia)}
                    {garantiaEnCuotas && (
                      <span className="block mt-1 text-[#8B6CFF]">
                        Disponible en {cuotasGarantia} cuotas
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reajuste */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8B6CFF]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#8B6CFF]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text">
                    Reajuste
                  </div>
                  <div className="text-xs text-subtext mt-0.5">
                    Arriendo se reajusta {reajuste}
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2">
              <PropertyCTAs
                unit={unit}
                building={building}
                onScheduleVisit={onScheduleVisit}
                onPostular={undefined}
                onPreApproval={handlePreApprovalOpen}
                onWhatsApp={onWhatsApp}
                location="booking_card"
                context="general"
                variant="all"
                showWhatsApp={true}
                showPreApproval={false}
              />
              
              {/* Pre-aprobación como opción adicional */}
              {showPreApproval && (
                <div className="mt-4">
                  <PreApprovalCard
                    unit={unit}
                    building={building}
                    variant="inline"
                    onComplete={(data) => {
                      console.log("Pre-approval complete:", data);
                      setShowPreApproval(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Botón opcional: Selecciona otro departamento */}
            {onSelectOtherUnit && (
              <button
                onClick={onSelectOtherUnit}
                className="w-full text-sm text-[#8B6CFF] hover:text-[#7a5ce6] font-medium py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2 rounded-xl"
                aria-label="Seleccionar otro departamento"
              >
                Selecciona otro departamento
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Fixed Bottom Bar - Solo se muestra si PropertyAboveFoldMobile no está visible */}
      {/* Nota: PropertyAboveFoldMobile ya tiene su propio StickyCtaBar, así que este solo se muestra como fallback */}
      {/* Por ahora, ocultamos el mobile bar ya que PropertyAboveFoldMobile lo maneja */}
    </>
  );
}
