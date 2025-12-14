"use client";

import { useState, useEffect } from "react";
import type { Building, Unit } from "@schemas/models";
import { QuotationInput, QuotationResult } from "@schemas/quotation";

interface PropertyQuotationPanelProps {
  building: Building;
  selectedUnit: Unit;
  isAdmin?: boolean;
  initialStartDate?: string; // YYYY-MM-DD para prefijar fecha
}

export function PropertyQuotationPanel({ building, selectedUnit, isAdmin = false, initialStartDate }: PropertyQuotationPanelProps) {
  const [quotationResult, setQuotationResult] = useState<QuotationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [parkingSelected, setParkingSelected] = useState(false);
  const [storageSelected, setStorageSelected] = useState(false);
  const [parkingPrice, setParkingPrice] = useState(50000);
  const [storagePrice, setStoragePrice] = useState(25000);
  const [creditReportFee, setCreditReportFee] = useState(6000);

  // Set default date on client side to avoid hydration mismatch
  useEffect(() => {
    if (!startDate) {
      const base = initialStartDate ? new Date(initialStartDate + 'T00:00:00') : new Date();
      if (!initialStartDate) {
        base.setDate(base.getDate() + 1);
      }
      const yyyy = base.getFullYear();
      const mm = String(base.getMonth() + 1).padStart(2, '0');
      const dd = String(base.getDate()).padStart(2, '0');
      setStartDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [startDate, initialStartDate]);

  // Update when initialStartDate changes (e.g., al elegir un slot)
  useEffect(() => {
    if (initialStartDate) {
      setStartDate(initialStartDate);
    }
  }, [initialStartDate]);

  const handleGenerateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const quotationData: QuotationInput = {
        unitId: selectedUnit.id,
        startDate,
        options: {
          parkingSelected,
          storageSelected,
          parkingPrice: parkingSelected ? parkingPrice : undefined,
          storagePrice: storageSelected ? storagePrice : undefined,
          creditReportFee,
        }
      };

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
      console.error('Error generating quotation:', error);
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

  if (!isAdmin && !isExpanded) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Cotizador Profesional</h3>
              <p className="text-sm text-gray-600">Genera cotización detallada para esta unidad</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Abrir Cotizador
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cotizador {isAdmin ? 'Administrativo' : 'Profesional'}</h3>
              <p className="text-sm text-gray-600">
                {selectedUnit.tipologia} • {selectedUnit.m2}m² • {formatCurrency(selectedUnit.price)}
              </p>
            </div>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Quick Unit Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{building.name}</h4>
              <p className="text-sm text-gray-600">{building.comuna} • {building.address}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{formatCurrency(selectedUnit.price)}</div>
              <div className="text-sm text-gray-500">mensual</div>
            </div>
          </div>
        </div>

        {/* Quotation Form */}
        <form onSubmit={handleGenerateQuotation} className="space-y-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Additional Services */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={parkingSelected}
                  onChange={(e) => setParkingSelected(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Estacionamiento</span>
              </label>
              {parkingSelected && (
                <input
                  type="number"
                  value={parkingPrice}
                  onChange={(e) => setParkingPrice(Number(e.target.value))}
                  placeholder="50,000"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              )}
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={storageSelected}
                  onChange={(e) => setStorageSelected(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Bodega</span>
              </label>
              {storageSelected && (
                <input
                  type="number"
                  value={storagePrice}
                  onChange={(e) => setStoragePrice(Number(e.target.value))}
                  placeholder="25,000"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              )}
            </div>
          </div>

          {/* Credit Report Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Informe comercial
            </label>
            <input
              type="number"
              value={creditReportFee}
              onChange={(e) => setCreditReportFee(Number(e.target.value))}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
                </svg>
                Generar Cotización
              </>
            )}
          </button>
        </form>

        {/* Results */}
        {quotationResult && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Resultado de Cotización</h4>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Arriendo base:</span>
                  <div className="font-medium">{formatCurrency(quotationResult.lines.baseMonthly)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Garantía:</span>
                  <div className="font-medium">{formatCurrency(quotationResult.lines.guaranteeTotal)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Gastos comunes:</span>
                  <div className="font-medium">{formatCurrency(quotationResult.lines.gcMonthly)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Primer pago:</span>
                  <div className="font-medium text-green-700">{formatCurrency(quotationResult.totals.firstPayment)}</div>
                </div>
              </div>
              
              {/* Copy and Print Actions */}
              <div className="flex gap-2 pt-3 border-t border-white/50">
                <button
                  onClick={() => {
                    const text = `Cotización ${building.name}\n${selectedUnit.tipologia} - ${formatCurrency(quotationResult.lines.baseMonthly)}\nPrimer pago: ${formatCurrency(quotationResult.totals.firstPayment)}`;
                    navigator.clipboard.writeText(text);
                    alert('Cotización copiada');
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
