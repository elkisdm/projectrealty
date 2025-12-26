"use client";

import React, { useState } from "react";
import { Info, Wallet, Shield, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import type { Unit, Building } from "@schemas/models";
import { Tooltip } from "@components/ui/Tooltip";
import { PropertyCTAs } from "./PropertyCTAs";

interface PropertyPriceBreakdownProps {
  building: Building;
  selectedUnit: Unit;
  originalPrice: number;
  discountPrice: number;
  onScheduleVisit?: () => void;
  onWhatsApp?: () => void;
  onSendQuotation?: () => void;
  onSelectOtherUnit?: () => void;
  className?: string;
}

export function PropertyPriceBreakdown({
  building,
  selectedUnit,
  originalPrice: _originalPrice,
  discountPrice,
  onScheduleVisit,
  onWhatsApp,
  onSendQuotation,
  onSelectOtherUnit,
  className = ""
}: PropertyPriceBreakdownProps) {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  // Cálculo de gastos comunes
  const gastosComunes = selectedUnit.gastoComun || 0;

  // Información de la unidad
  const codigoUnidad = selectedUnit.codigoUnidad || selectedUnit.id;
  const tipologia = selectedUnit.tipologia || "1D1B";
  const nombreEdificio = building.name;
  const direccionCompleta = building.address;

  // Información de arriendo
  const precioFijoMeses = selectedUnit.precioFijoMeses || 3;
  const reajuste = selectedUnit.reajuste || "cada 3 meses según UF";

  // Lógica de garantía desde BD
  const garantiaMeses = selectedUnit.guarantee_months ?? 1;
  const garantiaCuotas = selectedUnit.guarantee_installments ?? selectedUnit.garantia_cuotas ?? selectedUnit.cuotasGarantia;
  const garantiaDirecta = selectedUnit.garantia;
  const garantiaTotal = garantiaDirecta || Math.round(discountPrice * garantiaMeses);
  const tieneCuotasGarantia = garantiaCuotas && garantiaCuotas > 1;
  const garantiaEnCuotas = tieneCuotasGarantia;

  // Cálculo de comisión de corretaje (50% arriendo + IVA 19% sobre la comisión)
  const hasFreeCommission = (selectedUnit.promotions ?? []).some((b: any) => b.type === "free_commission") ||
                            (building.badges ?? []).some((b: any) => b.type === "free_commission");
  const IVA = 0.19;
  const comisionBase = Math.round(discountPrice * 0.5);
  const comisionIVA = Math.round(comisionBase * IVA);
  const comisionTotal = hasFreeCommission ? 0 : comisionBase + comisionIVA;

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Contenido del tooltip de garantía (dinámico según si hay cuotas)
  const garantiaTooltipContent = tieneCuotasGarantia && garantiaCuotas
    ? `Garantía total de ${formatPrice(garantiaTotal)}. Disponible pagar en ${garantiaCuotas} cuotas. Se devuelve al término del contrato si no hay daños.`
    : `Garantía de ${formatPrice(garantiaTotal)}. Se devuelve al término del contrato si no hay daños.`;

  // Handler para enviar cotización (Postular)
  const handlePostular = () => {
    if (onSendQuotation) {
      onSendQuotation();
    } else {
      // Fallback: redirigir a cotizador o mostrar alerta
      console.log("Postular clicked - implementar lógica");
    }
  };

  return (
    <section className={`lg:hidden ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
        {/* Header: Información de unidad y edificio */}
        <div className="space-y-1 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {tipologia}
          </div>
          <div className="pt-1">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {nombreEdificio}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {direccionCompleta}
            </div>
          </div>
        </div>

        {/* Precio destacado */}
        <div className="text-center">
          <div className="text-3xl font-bold tracking-tight tabular-nums text-gray-900 dark:text-white">
            {formatPrice(discountPrice)}
            <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
              /mes
            </span>
          </div>
        </div>

        {/* Bloque financiero con iconos - Estilo de la imagen */}
        <div className="space-y-4">
          {/* Valor Arriendo */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8B6CFF]/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Valor Arriendo
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Precio fijo primeros {precioFijoMeses} meses
              </div>
            </div>
          </div>

          {/* Garantía */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8B6CFF]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#8B6CFF]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                Garantía
                <Tooltip content={garantiaTooltipContent}>
                  <Info className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                </Tooltip>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {formatPrice(garantiaTotal)}
                {garantiaEnCuotas && garantiaCuotas && (
                  <span className="block mt-1 text-[#8B6CFF]">
                    Disponible en {garantiaCuotas} cuotas
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
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Reajuste
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Arriendo se reajusta {reajuste}
              </div>
            </div>
          </div>

          {/* Desglose detallado expandible */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
              className="w-full flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
              aria-expanded={isBreakdownExpanded}
            >
              <span className="font-medium">Ver desglose detallado</span>
              {isBreakdownExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {isBreakdownExpanded && (
              <div className="mt-3 space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                {/* Gastos comunes */}
                {gastosComunes > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      Gastos comunes
                      <Tooltip content="Incluye mantención, administración y servicios comunes del edificio">
                        <Info className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                      </Tooltip>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(gastosComunes)}
                    </div>
                  </div>
                )}

                {/* Comisión de corretaje */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    Comisión de corretaje
                    <Tooltip content="Comisión de corretaje equivalente al 50% del arriendo, más IVA (19%) aplicado sobre esa comisión. Se paga una sola vez al inicio del contrato.">
                      <Info className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    </Tooltip>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {hasFreeCommission ? (
                      <span className="text-green-600">$0 (Gratis)</span>
                    ) : (
                      formatPrice(comisionTotal)
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-2">
          <PropertyCTAs
            unit={selectedUnit}
            building={building}
            onScheduleVisit={onScheduleVisit || (() => {})}
            onPostular={undefined}
            onWhatsApp={onWhatsApp}
            location="price_breakdown"
            context="mobile"
            variant="all"
            showWhatsApp={true}
          />
        </div>

        {/* Botón opcional: Selecciona otro departamento */}
        {onSelectOtherUnit && (
          <button
            onClick={onSelectOtherUnit}
            className="w-full text-sm text-[#8B6CFF] hover:text-[#7a5ce6] font-medium py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2 rounded-xl mt-4"
            aria-label="Seleccionar otro departamento"
          >
            Selecciona otro departamento
          </button>
        )}
      </div>
    </section>
  );
}