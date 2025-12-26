"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, ChevronDown, ChevronUp, Info, Bed, Bath, Square } from "lucide-react";
import type { Unit, Building } from "@schemas/models";
import { Tooltip } from "@components/ui/Tooltip";

interface PriceBreakdownProps {
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

export function PriceBreakdown({
  building,
  selectedUnit,
  originalPrice,
  discountPrice,
  unitDetails,
  onScheduleVisit,
  onSendQuotation,
  variant = "catalog",
  className = ""
}: PriceBreakdownProps) {
  const [isDetailed, setIsDetailed] = useState(false);

  // Cálculo del precio total mensual (arriendo + gastos comunes)
  const gastosComunes = selectedUnit.gastoComun || 0;
  const precioTotalMensual = selectedUnit.total_mensual || (discountPrice + gastosComunes);

  // Si hay descuento, el ahorro es sobre el arriendo base
  const ahorroPrimerMes = originalPrice - discountPrice;

  // Lógica de garantía desde BD
  const garantiaMeses = selectedUnit.guarantee_months ?? 1;
  const garantiaCuotas = selectedUnit.guarantee_installments ?? selectedUnit.garantia_cuotas ?? selectedUnit.cuotasGarantia;
  const garantiaDirecta = selectedUnit.garantia;
  const garantiaTotal = garantiaDirecta || Math.round(discountPrice * garantiaMeses);
  const tieneCuotasGarantia = garantiaCuotas && garantiaCuotas > 1;
  const cuotaGarantia = tieneCuotasGarantia ? Math.round(garantiaTotal / garantiaCuotas) : null;

  // Cálculo de comisión de corretaje (50% arriendo + IVA 19% sobre la comisión)
  const hasFreeCommission = (selectedUnit.promotions ?? []).some((b: any) => b.type === "free_commission") ||
                            (building.badges ?? []).some((b: any) => b.type === "free_commission");
  const IVA = 0.19;
  const comisionBase = Math.round(discountPrice * 0.5);
  const comisionIVA = Math.round(comisionBase * IVA);
  const comisionTotal = hasFreeCommission ? 0 : comisionBase + comisionIVA;

  // Badge principal de 0% comisión
  const getMainBadge = () => {
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

      {/* Contenedor principal */}
      <div className="bg-gray-800:bg-gray-800 rounded-xl shadow-lg border border-gray-700:border-gray-700 p-4 space-y-4">
        {/* Título de la unidad */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white:text-white mb-1">
            Departamento {selectedUnit.id}
          </h2>
          <p className="text-sm text-gray-300:text-gray-400">
            {unitDetails.tipologia} • Piso {unitDetails.piso}
          </p>
        </div>

        {/* Precio total mensual destacado */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 p-4">
          <div className="text-center">
            <div className="text-sm text-gray-300:text-gray-400 mb-1">
              Total estimado / mes
            </div>
            <div className="text-2xl font-bold text-white:text-white mb-1">
              ${precioTotalMensual.toLocaleString('es-CL')}
            </div>
            <div className="text-xs text-gray-400:text-gray-400">
              Arriendo + Gastos comunes
            </div>
          </div>
        </div>

        {/* Tabla de desglose de precios */}
        <div className="bg-gray-900:bg-gray-700 rounded-xl p-3">
          <h3 className="font-semibold text-white:text-white text-center mb-3 text-sm">
            Desglose de costos
          </h3>

          <dl className="space-y-2 relative">
            {/* Arriendo */}
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-300:text-gray-400 flex items-center gap-1">
                Arriendo
                <Tooltip content="Precio base del arriendo mensual" />
              </dt>
              <dd className="text-sm font-medium text-white:text-white">${discountPrice.toLocaleString('es-CL')}</dd>
            </div>

            {/* Gastos comunes */}
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-300:text-gray-400 flex items-center gap-1">
                Gastos comunes
                <Tooltip content="Incluye mantención, administración y servicios comunes del edificio" />
              </dt>
              <dd className="text-sm font-medium text-white:text-white">${gastosComunes.toLocaleString('es-CL')}</dd>
            </div>

            {/* Garantía */}
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-300:text-gray-400 flex items-center gap-1">
                Garantía
                <Tooltip
                  content={
                    tieneCuotasGarantia && cuotaGarantia
                      ? `Garantía total de $${garantiaTotal.toLocaleString('es-CL')}. Disponible pagar en ${garantiaCuotas} cuotas de $${cuotaGarantia.toLocaleString('es-CL')}. Se devuelve al término del contrato si no hay daños.`
                      : `Garantía de $${garantiaTotal.toLocaleString('es-CL')}. Se devuelve al término del contrato si no hay daños.`
                  }
                />
              </dt>
              <dd className="text-sm font-medium text-white:text-white">
                ${garantiaTotal.toLocaleString('es-CL')}
                {tieneCuotasGarantia && cuotaGarantia && (
                  <span className="text-xs text-gray-400 ml-1">
                    (en {garantiaCuotas} cuotas de ${cuotaGarantia.toLocaleString('es-CL')})
                  </span>
                )}
              </dd>
            </div>

            {/* Comisión de corretaje */}
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-300:text-gray-400 flex items-center gap-1">
                Comisión de corretaje
                <Tooltip content="Comisión de corretaje equivalente al 50% del arriendo, más IVA (19%) aplicado sobre esa comisión. Se paga una sola vez al inicio del contrato." />
              </dt>
              <dd className="text-sm font-medium text-white:text-white">
                {hasFreeCommission ? (
                  <span className="text-green-600">$0 (Gratis)</span>
                ) : (
                  `$${comisionTotal.toLocaleString('es-CL')}`
                )}
              </dd>
            </div>

            {/* Total destacado */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700:border-gray-600">
              <dt className="text-sm font-semibold text-white:text-white">Total mensual</dt>
              <dd className="text-lg font-bold text-white:text-white">${precioTotalMensual.toLocaleString('es-CL')}</dd>
            </div>
          </dl>
        </div>

        {/* Badges secundarios */}
        <div className="flex flex-wrap gap-1">
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
        <div className="bg-gray-900:bg-gray-700 rounded-xl p-3">
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
            {/* New Chips */}
            {selectedUnit.orientacion && (
              <div className="bg-gray-800:bg-gray-600 rounded-lg p-2 col-span-1">
                <div className="text-sm font-semibold text-white:text-white">{selectedUnit.orientacion}</div>
                <div className="text-xs text-gray-400:text-gray-400">Orient.</div>
              </div>
            )}
            {selectedUnit.pet_friendly && (
              <div className="bg-gray-800:bg-gray-600 rounded-lg p-2 col-span-2 flex items-center justify-center gap-2">
                <span className="text-xl">🐾</span>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white:text-white">Mascotas</div>
                  <div className="text-[10px] text-gray-400:text-gray-400">Permitidas</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calculadora de primer pago expandible */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-white:text-white">
              Cálculo del primer pago
            </h3>
          </div>

          <div className="ml-11 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-300:text-gray-400">
                Te mudas con
              </span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                ${(originalPrice + gastosComunes).toLocaleString('es-CL')}
              </span>
            </div>
            <div className="text-sm text-gray-400:text-gray-400 mt-1">
              el {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
            </div>
          </div>

          <button
            onClick={() => setIsDetailed(!isDetailed)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-75"
          >
            {isDetailed ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ocultar detalles
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver más detalles
              </>
            )}
          </button>

          {/* Detalles expandibles */}
          <AnimatePresence>
            {isDetailed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300:text-gray-400">Depósito</span>
                    <span className="font-medium">${originalPrice.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300:text-gray-400">Primer mes</span>
                    <span className="font-medium">${discountPrice.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300:text-gray-400">Gastos comunes</span>
                    <span className="font-medium">${gastosComunes.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-green-200 dark:border-green-700">
                    <span>Total primer pago</span>
                    <span className="text-green-600 dark:text-green-400">
                      ${(originalPrice + discountPrice + gastosComunes).toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2">
          <button
            onClick={onScheduleVisit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-100 text-sm"
            aria-label="Solicitar visita"
          >
            Solicitar visita
          </button>
          {/* Botón deshabilitado temporalmente */}
          {/* <button
            onClick={onSendQuotation}
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-white:text-white text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-100 text-sm"
            aria-label="Postular"
          >
            Postular
          </button> */}
        </div>
      </div>
    </section>
  );
}
