"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, ChevronDown, ChevronUp, Car, Package } from "lucide-react";

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

interface FirstPaymentCalculatorProps {
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
  variant?: "compact" | "detailed";
  className?: string;
}

export function FirstPaymentCalculator({
  originalPrice,
  discountPrice: _discountPrice,
  firstPaymentCalculation,
  moveInDate,
  includeParking,
  includeStorage,
  onDateChange,
  onParkingChange,
  onStorageChange,
  onSendQuotation,
  variant = "detailed",
  className = ""
}: FirstPaymentCalculatorProps) {
  const [isCalculationExpanded, setIsCalculationExpanded] = useState(false);

  const formatDateForSummary = (date: Date) => {
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getSummaryPrice = () => {
    return firstPaymentCalculation.totalFirstPayment.toLocaleString('es-CL');
  };

  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 p-4 ${className}`}>
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
              ${getSummaryPrice()}
            </span>
          </div>
          <div className="text-sm text-gray-400:text-gray-400 mt-1">
            el {formatDateForSummary(moveInDate)}
          </div>
        </div>

        <button
          onClick={() => setIsCalculationExpanded(!isCalculationExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-75"
        >
          {isCalculationExpanded ? (
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

        {/* Contenido desplegable con animación */}
        <AnimatePresence>
          {isCalculationExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{
                duration: 0.1,
                ease: "linear"
              }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Fecha de mudanza */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de mudanza
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={moveInDate.toISOString().split('T')[0]}
                      onChange={(e) => onDateChange(new Date(e.target.value))}
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-gray-800:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-white:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {firstPaymentCalculation.daysChargedCount} días del mes ({firstPaymentCalculation.daysInMonth} días totales)
                  </p>
                </div>

                {/* Servicios adicionales */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Servicios adicionales
                  </label>

                  {/* Estacionamiento */}
                  <div className="flex items-center justify-between p-2 bg-gray-800:bg-gray-700 rounded-lg border border-gray-700:border-gray-600">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-white:text-white">Estacionamiento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white:text-white">$50.000</span>
                      <input
                        type="checkbox"
                        checked={includeParking}
                        onChange={(e) => onParkingChange(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Bodega */}
                  <div className="flex items-center justify-between p-2 bg-gray-800:bg-gray-700 rounded-lg border border-gray-700:border-gray-600">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-white:text-white">Bodega</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white:text-white">$30.000</span>
                      <input
                        type="checkbox"
                        checked={includeStorage}
                        onChange={(e) => onStorageChange(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Desglose detallado */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white:text-white text-sm">Desglose del primer pago</h4>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300:text-gray-400">Renta del mes</span>
                      <span className="font-medium text-white:text-white">
                        ${originalPrice.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300:text-gray-400">Días adicionales</span>
                      <span className="font-medium text-white:text-white">
                        ${(originalPrice * (firstPaymentCalculation.daysChargedCount / firstPaymentCalculation.daysInMonth) - originalPrice).toLocaleString('es-CL')}
                      </span>
                    </div>
                    {includeParking && (
                      <div className="flex justify-between">
                        <span className="text-gray-300:text-gray-400">Estacionamiento</span>
                        <span className="font-medium text-white:text-white">$50.000</span>
                      </div>
                    )}
                    {includeStorage && (
                      <div className="flex justify-between">
                        <span className="text-gray-300:text-gray-400">Bodega</span>
                        <span className="font-medium text-white:text-white">$30.000</span>
                      </div>
                    )}
                    <div className="border-t border-gray-700:border-gray-600 pt-1">
                      <div className="flex justify-between font-bold text-green-600 dark:text-green-400">
                        <span>Total primer pago</span>
                        <span>${firstPaymentCalculation.totalFirstPayment.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección de ahorros */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 text-sm mb-2">¡Ahorras con nosotros!</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">Comisión tradicional</span>
                      <span className="font-medium text-green-800 dark:text-green-200">$150.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">Nuestra comisión</span>
                      <span className="font-medium text-green-800 dark:text-green-200">$0</span>
                    </div>
                    <div className="border-t border-green-200 dark:border-green-700 pt-1">
                      <div className="flex justify-between font-bold text-green-800 dark:text-green-200">
                        <span>Total ahorro</span>
                        <span>$150.000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón enviar cotización */}
                <button
                  onClick={onSendQuotation}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-75 text-sm"
                >
                  Enviar cotización por email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Variante detailed (sidebar)
  return (
    <div className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg lg:rounded-xl border border-green-200 dark:border-green-700 p-3 lg:p-4 ${className}`}>
      {/* Header principal */}
      <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
        <div className="p-1.5 lg:p-2 bg-green-100 dark:bg-green-800 rounded-lg">
          <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-semibold text-white:text-white text-sm lg:text-base">
          Cálculo del primer pago
        </h3>
      </div>

      {/* Resumen destacado */}
      <div className="ml-8 lg:ml-11 mb-3 lg:mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-xs lg:text-sm text-gray-300:text-gray-400">
            Te mudas con
          </span>
          <span className="text-lg lg:text-xl font-bold text-green-600 dark:text-green-400">
            ${getSummaryPrice()}
          </span>
        </div>
        <div className="text-xs lg:text-sm text-gray-400:text-gray-400 mt-1">
          el {formatDateForSummary(moveInDate)}
        </div>
      </div>

      {/* Botón ver más detalles */}
      <button
        onClick={() => setIsCalculationExpanded(!isCalculationExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-75"
      >
        {isCalculationExpanded ? (
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

      {/* Contenido desplegable con animación */}
      <AnimatePresence>
        {isCalculationExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{
              duration: 0.1,
              ease: "linear"
            }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Fecha de mudanza */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de mudanza
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={moveInDate.toISOString().split('T')[0]}
                    onChange={(e) => onDateChange(new Date(e.target.value))}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-800:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-white:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {firstPaymentCalculation.daysChargedCount} días del mes ({firstPaymentCalculation.daysInMonth} días totales)
                </p>
              </div>

              {/* Servicios adicionales */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Servicios adicionales
                </label>

                {/* Estacionamiento */}
                <div className="flex items-center justify-between p-2 bg-gray-800:bg-gray-700 rounded-lg border border-gray-700:border-gray-600">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-white:text-white">Estacionamiento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white:text-white">$50.000</span>
                    <input
                      type="checkbox"
                      checked={includeParking}
                      onChange={(e) => onParkingChange(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Bodega */}
                <div className="flex items-center justify-between p-2 bg-gray-800:bg-gray-700 rounded-lg border border-gray-700:border-gray-600">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-white:text-white">Bodega</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white:text-white">$30.000</span>
                    <input
                      type="checkbox"
                      checked={includeStorage}
                      onChange={(e) => onStorageChange(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Detalle del cálculo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300:text-gray-400">Arriendo prorrateado:</span>
                  <span className="font-medium text-white:text-white">
                    ${firstPaymentCalculation.netRentStorage.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 pl-2">
                  • {firstPaymentCalculation.promoDays} días con 50% OFF: ${Math.round((originalPrice / 30) * firstPaymentCalculation.promoDays * 0.5).toLocaleString('es-CL')}
                  {firstPaymentCalculation.regularDays > 0 && (
                    <span>
                      <br />• {firstPaymentCalculation.regularDays} días precio normal: ${Math.round((originalPrice / 30) * firstPaymentCalculation.regularDays).toLocaleString('es-CL')}
                    </span>
                  )}
                </div>
                {includeParking && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300:text-gray-400">Estacionamiento:</span>
                    <span className="font-medium text-orange-600">
                      ${firstPaymentCalculation.totalParking.toLocaleString('es-CL')}
                    </span>
                  </div>
                )}
                {includeStorage && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300:text-gray-400">Bodega:</span>
                    <span className="font-medium text-purple-600">
                      ${firstPaymentCalculation.totalStorage.toLocaleString('es-CL')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300:text-gray-400">Gastos comunes:</span>
                  <span className="font-medium text-white:text-white">
                    ${firstPaymentCalculation.proratedGC.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300:text-gray-400">Garantía inicial (33%):</span>
                  <span className="font-medium text-white:text-white">
                    ${firstPaymentCalculation.initialDeposit.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300:text-gray-400">Comisión corretaje:</span>
                  <span className="font-medium text-green-600">
                    ${firstPaymentCalculation.commissionToPay.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="border-t border-gray-700:border-gray-600 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white:text-white">Total primer pago:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${firstPaymentCalculation.totalFirstPayment.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ahorros */}
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                  ¡Te estás ahorrando!
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">50% OFF primer mes:</span>
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      ${Math.round((originalPrice / 30) * firstPaymentCalculation.promoDays * 0.5 + (includeParking ? (50000 / 30) * firstPaymentCalculation.promoDays * 0.5 : 0) + (includeStorage ? (30000 / 30) * firstPaymentCalculation.promoDays * 0.5 : 0)).toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Comisión gratis:</span>
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      ${Math.round((originalPrice * 0.5) * 1.19).toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón enviar cotización */}
              <button
                onClick={onSendQuotation}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-75 text-sm"
              >
                Enviar cotización por email
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}







