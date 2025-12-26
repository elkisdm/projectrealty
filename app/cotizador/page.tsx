"use client";

import { useState, useEffect } from "react";
import Providers from "../providers";
import { useBuildingsForQuotation } from "@hooks/useBuildingsForQuotation";
import { logger } from "@lib/logger";
import type { Building, Unit } from "@schemas/models";
import { QuotationInput, QuotationResult } from "@schemas/quotation";

function CotizadorContent() {
  const [selectedUnit, setSelectedUnit] = useState<{ unit: Unit, building: Building } | null>(null);
  const [quotationResult, setQuotationResult] = useState<QuotationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Usar hook específico para cotizador que devuelve Building[] completos
  const { data: buildings, isLoading: loadingBuildings } = useBuildingsForQuotation();

  // Filtrar unidades disponibles
  const availableUnits = buildings
    ?.flatMap(building =>
      building.units
        ?.filter((unit: Unit) => unit.disponible)
        ?.map((unit: Unit) => ({ unit, building }))
    )
    ?.filter(item =>
      searchTerm === "" ||
      item.building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.building.comuna.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.tipologia.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleGenerateQuotation = async (quotationData: QuotationInput) => {
    if (!selectedUnit) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: QuotationResult = await response.json();
      setQuotationResult(result);
    } catch (error) {
      logger.error('Error generating quotation:', error);
      alert('Error generando cotización. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header mejorado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Sistema de Cotizaciones Elkis Realtor
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cotizador de Arriendos
            <span className="text-blue-600"> 0% Comisión</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Genera cotizaciones profesionales y detalladas con cálculos precisos de arriendos,
            garantías y promociones. Sistema automatizado con datos reales del mercado.
          </p>

          {/* Stats bar */}
          <div className="flex justify-center items-center gap-8 mt-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Datos Reales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Cálculos Precisos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Sin Comisiones</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Búsqueda de Unidades */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m-2 0H3m2 0v-3a2 2 0 012-2h4a2 2 0 012 2v3m-6 0h6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Seleccionar Unidad</h2>
                <p className="text-sm text-gray-600">Explora propiedades disponibles</p>
              </div>
            </div>

            {/* Búsqueda mejorada */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por edificio, comuna o tipología..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Filtros rápidos */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {['Studio', '1D1B', '2D1B', '2D2B'].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setSearchTerm(tipo)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats de búsqueda */}
            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              <span>
                {loadingBuildings ? 'Cargando...' : `${availableUnits.length} unidades disponibles`}
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar filtro
                </button>
              )}
            </div>

            {/* Lista de Unidades */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loadingBuildings ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Cargando propiedades...</p>
                  <p className="text-sm text-gray-500">Obteniendo datos reales del mercado</p>
                </div>
              ) : availableUnits.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m-2 0H3m2 0v-3a2 2 0 012-2h4a2 2 0 012 2v3m-6 0h6" />
                  </svg>
                  <p className="text-gray-500 font-medium">
                    {searchTerm ? "No se encontraron unidades" : "No hay unidades disponibles"}
                  </p>
                  {searchTerm && (
                    <p className="text-sm text-gray-400 mt-1">
                      Intenta con otros términos de búsqueda
                    </p>
                  )}
                </div>
              ) : (
                availableUnits.map((item) => (
                  <div
                    key={`${item.building.id}-${item.unit.id}`}
                    className={`group p-5 border rounded-xl cursor-pointer transition-all duration-200 ${selectedUnit?.unit.id === item.unit.id && selectedUnit?.building.id === item.building.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    onClick={() => setSelectedUnit(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{item.building.name}</h3>
                          {selectedUnit?.unit.id === item.unit.id && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Seleccionada
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.building.comuna} • {item.building.address || 'Dirección disponible'}</p>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="font-medium text-blue-700">{item.unit.tipologia}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            <span className="text-gray-600">{item.unit.m2}m²</span>
                          </div>
                          {item.unit.estacionamiento && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              <span className="text-gray-600">Parking</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatCurrency(item.unit.price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          mensual
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {item.unit.id}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel de Configuración y Resultado */}
          <div className="space-y-6">
            {/* Información del proceso */}
            {!selectedUnit && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cómo funciona el cotizador</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Selecciona una unidad de tu interés</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Configura fecha de inicio y servicios</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>Obtén tu cotización detallada instantánea</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium">
                        🎉 Sin comisiones de corretaje • Datos reales del mercado • Cálculos precisos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario de Cotización */}
            {selectedUnit && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Configurar Cotización</h2>
                    <p className="text-sm text-gray-600">Personaliza los detalles de tu arriendo</p>
                  </div>
                </div>

                <QuotationForm
                  selectedUnit={selectedUnit}
                  onSubmit={handleGenerateQuotation}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Resultado de Cotización */}
            {quotationResult && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Cotización Generada</h2>
                      <p className="text-sm text-gray-600">Desglose completo de costos</p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const text = `Cotización de arriendo:\n${selectedUnit?.building.name}\n${selectedUnit?.unit.tipologia} - ${formatCurrency(quotationResult.lines.baseMonthly)}\nTotal primer pago: ${formatCurrency(quotationResult.totals.firstPayment)}`;
                        navigator.clipboard.writeText(text);
                        alert('Cotización copiada al portapapeles');
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Imprimir
                    </button>
                  </div>
                </div>

                <QuotationResults result={quotationResult} />

                {/* Calculadora de affordability */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-3">💡 Calculadora de Affordability</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Para este arriendo necesitas ingresos mínimos de aproximadamente:
                  </p>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(quotationResult.lines.baseMonthly * 3)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cálculo basado en regla 30% de ingresos para arriendo
                  </p>
                </div>

                {/* Call to action */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">¿Te interesa esta propiedad?</h3>
                      <p className="text-sm text-gray-600">Agenda una visita o solicita más información</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer informativo */}
        <div className="mt-16 border-t border-gray-200 pt-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Sistema con datos reales del mercado
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Cálculos Precisos</h3>
                <p className="text-sm text-gray-600">Motor de cotización con prorrateo automático, promociones y cálculos de garantías</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">0% Comisión</h3>
                <p className="text-sm text-gray-600">Sin comisiones de corretaje. Arrienda directo con el propietario</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Proceso Rápido</h3>
                <p className="text-sm text-gray-600">Cotización instantánea con toda la información que necesitas para decidir</p>
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-500">
              <p>Cotizador Elkis Realtor v2.0 • Datos actualizados en tiempo real • Sistema validado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Formulario de Cotización
function QuotationForm({
  selectedUnit,
  onSubmit,
  isLoading
}: {
  selectedUnit: { unit: Unit, building: Building };
  onSubmit: (data: QuotationInput) => void;
  isLoading: boolean;
}) {
  const [startDate, setStartDate] = useState('');
  const [parkingSelected, setParkingSelected] = useState(false);
  const [storageSelected, setStorageSelected] = useState(false);
  const [parkingPrice, setParkingPrice] = useState(50000);
  const [storagePrice, setStoragePrice] = useState(25000);
  const [creditReportFee, setCreditReportFee] = useState(6000);

  // Set default date on client side to avoid hydration mismatch
  useEffect(() => {
    if (!startDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStartDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [startDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quotationData: QuotationInput = {
      unitId: selectedUnit.unit.id,
      startDate,
      options: {
        parkingSelected,
        storageSelected,
        parkingPrice: parkingSelected ? parkingPrice : undefined,
        storagePrice: storageSelected ? storagePrice : undefined,
        creditReportFee,
      }
    };

    onSubmit(quotationData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información de la unidad seleccionada */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border border-green-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{selectedUnit.building.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedUnit.building.comuna} • {selectedUnit.building.address || 'Dirección disponible'}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm font-medium text-blue-700">{selectedUnit.unit.tipologia}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="text-sm text-gray-600">{selectedUnit.unit.m2}m²</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(selectedUnit.unit.price)}
            </div>
            <div className="text-sm text-gray-500">mensual</div>
          </div>
        </div>
      </div>

      {/* Fecha de inicio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          📅 Fecha de inicio del arriendo
        </label>
        <div className="relative">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 El cálculo incluye prorrateo automático si inicias a mitad de mes
        </p>
      </div>

      {/* Servicios adicionales */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">🚗 Servicios Adicionales</h4>

        {/* Estacionamiento */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Estacionamiento adicional
                </label>
                <p className="text-xs text-gray-500">Agrega un espacio de estacionamiento</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={parkingSelected}
                onChange={(e) => setParkingSelected(e.target.checked)}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
              />
            </div>
          </div>

          {parkingSelected && (
            <div className="animate-in slide-in-from-top-1 duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio mensual del estacionamiento
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={parkingPrice}
                  onChange={(e) => setParkingPrice(Number(e.target.value))}
                  min="0"
                  step="1000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50,000"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bodega */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Bodega adicional
                </label>
                <p className="text-xs text-gray-500">Agrega espacio de almacenamiento</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={storageSelected}
                onChange={(e) => setStorageSelected(e.target.checked)}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
              />
            </div>
          </div>

          {storageSelected && (
            <div className="animate-in slide-in-from-top-1 duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio mensual de la bodega
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={storagePrice}
                  onChange={(e) => setStoragePrice(Number(e.target.value))}
                  min="0"
                  step="1000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25,000"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Informe comercial */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          📋 Informe comercial
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500">$</span>
          <input
            type="number"
            value={creditReportFee}
            onChange={(e) => setCreditReportFee(Number(e.target.value))}
            min="0"
            step="1000"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="6,000"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Incluye verificación de antecedentes financieros
        </p>
      </div>

      {/* Resumen rápido */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">📊 Resumen de tu cotización</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Arriendo base:</span>
            <span className="font-medium">{formatCurrency(selectedUnit.unit.price)}</span>
          </div>
          {parkingSelected && (
            <div className="flex justify-between">
              <span>+ Estacionamiento:</span>
              <span className="font-medium">{formatCurrency(parkingPrice)}</span>
            </div>
          )}
          {storageSelected && (
            <div className="flex justify-between">
              <span>+ Bodega:</span>
              <span className="font-medium">{formatCurrency(storagePrice)}</span>
            </div>
          )}
          <div className="border-t border-blue-200 pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total mensual:</span>
              <span>{formatCurrency(selectedUnit.unit.price + (parkingSelected ? parkingPrice : 0) + (storageSelected ? storagePrice : 0))}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Generando cotización...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
            </svg>
            Generar Cotización Detallada
          </>
        )}
      </button>
    </form>
  );
}

// Componente de Resultados de Cotización
function QuotationResults({ result }: { result: QuotationResult }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Información general */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Información de la Cotización</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Fecha inicio:</span>
            <span className="ml-2 font-medium">{formatDate(result.meta.startDate)}</span>
          </div>
          <div>
            <span className="text-blue-700">Días cobrados:</span>
            <span className="ml-2 font-medium">{result.meta.daysCharged} de {result.meta.daysInMonth}</span>
          </div>
        </div>
      </div>

      {/* Desglose de costos */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Desglose de Costos</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Arriendo mensual base</span>
            <span className="font-medium">{formatCurrency(result.lines.baseMonthly)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Arriendo prorrateado</span>
            <span className="font-medium">{formatCurrency(result.lines.proratedRent)}</span>
          </div>

          {result.lines.discountPromo > 0 && (
            <div className="flex justify-between items-center py-2 text-green-600">
              <span>Descuento promocional ({result.flags.discountPercent}%)</span>
              <span className="font-medium">-{formatCurrency(result.lines.discountPromo)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-t border-gray-200">
            <span className="text-gray-600">Arriendo neto</span>
            <span className="font-medium">{formatCurrency(result.lines.netRent)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Gastos comunes prorrateados</span>
            <span className="font-medium">{formatCurrency(result.lines.gcProrated)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Garantía (entrada)</span>
            <span className="font-medium">{formatCurrency(result.lines.guaranteeEntry)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Informe comercial</span>
            <span className="font-medium">{formatCurrency(result.lines.creditReportFee)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className={`text-gray-600 ${result.flags.hasFreeCommission ? 'line-through' : ''}`}>
              Comisión de corretaje
            </span>
            <span className={`font-medium ${result.flags.hasFreeCommission ? 'text-green-600' : ''}`}>
              {result.flags.hasFreeCommission ? 'GRATIS' : formatCurrency(result.lines.commission)}
            </span>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="border-t-2 border-gray-300 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total primer pago</span>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(result.totals.firstPayment)}
          </span>
        </div>
      </div>

      {/* Promociones activas */}
      {(result.flags.hasFreeCommission || result.flags.discountPercent > 0) && (
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">🎉 Promociones Activas</h3>
          <ul className="text-sm text-green-800 space-y-1">
            {result.flags.hasFreeCommission && (
              <li>• Sin comisión de corretaje</li>
            )}
            {result.flags.discountPercent > 0 && (
              <li>• {result.flags.discountPercent}% de descuento en arriendo</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function CotizadorPage() {
  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <CotizadorContent />
      </div>
    </Providers>
  );
}
