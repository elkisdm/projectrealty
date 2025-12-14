"use client";

import React from "react";
import { Wallet, Building2, Shield, TrendingUp, MessageCircle } from "lucide-react";
import type { Unit, Building } from "@schemas/models";

interface PropertyBookingCardProps {
  unit: Unit;
  building: Building;
  onScheduleVisit: () => void;
  onWhatsApp?: () => void;
  className?: string;
}

export function PropertyBookingCard({
  unit,
  building,
  onScheduleVisit,
  onWhatsApp,
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

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // WhatsApp link
  const handleWhatsApp = () => {
    if (onWhatsApp) {
      onWhatsApp();
    } else {
      const message = encodeURIComponent(
        `Hola! Me interesa el departamento ${unit.tipologia || 'departamento'} en ${building.name}, ${building.comuna}. ¿Podrías darme más información?`
      );
      const waLink = `https://wa.me/56912345678?text=${message}`;
      window.open(waLink, "_blank");
    }
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
                DEPARTAMENTO {unit.codigoUnidad?.replace(/^\D+/, '') || ''} <span className="text-[#8B6CFF]">—</span> {unit.tipologia || 'DEPARTAMENTO'}
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
            <div className="space-y-3 pt-2">
              {/* CTA Principal: Solicitar Visita */}
              <button
                onClick={onScheduleVisit}
                className="w-full bg-[#8B6CFF] hover:bg-[#7a5ce6] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2 shadow-lg hover:shadow-xl"
                aria-label="Solicitar visita"
              >
                Solicitar Visita
              </button>

              {/* CTA Secundario: WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                aria-label="Contactar por WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>
            </div>

            {/* Botón opcional: Selecciona otro departamento */}
            <button
              onClick={() => {
                // Scroll a lista de unidades o mostrar selector
                const unitsSection = document.getElementById('units-list');
                if (unitsSection) {
                  unitsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full text-sm text-[#8B6CFF] hover:text-[#7a5ce6] font-medium py-2 transition-colors"
              aria-label="Seleccionar otro departamento"
            >
              Selecciona otro departamento
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Fixed Bottom Bar - Solo se muestra si PropertyAboveFoldMobile no está visible */}
      {/* Nota: PropertyAboveFoldMobile ya tiene su propio StickyCtaBar, así que este solo se muestra como fallback */}
      {/* Por ahora, ocultamos el mobile bar ya que PropertyAboveFoldMobile lo maneja */}
    </>
  );
}
