"use client";

import React from "react";
import { Calendar, MessageCircle, FileText, CheckCircle } from "lucide-react";
import type { Unit, Building } from "@schemas/models";
import { track } from "@lib/analytics";

type CTALocation = "booking_card" | "price_breakdown" | "sticky_bar" | "accordion";
type CTAType = "schedule_visit" | "postular" | "pre_approval" | "whatsapp";
type CTAVariant = "primary" | "secondary" | "terciary";
type ContextVariant = "general" | "mobile" | "marketing";

interface PropertyCTAsProps {
  unit: Unit;
  building: Building;
  onScheduleVisit: () => void;
  onPostular?: () => void;
  onPreApproval?: () => void;
  onWhatsApp?: () => void;
  location: CTALocation;
  context?: ContextVariant;
  variant?: "primary" | "secondary" | "all";
  showPreApproval?: boolean;
  showWhatsApp?: boolean;
  className?: string;
}

// Copy optimizado según contexto
const getCTACopy = (type: CTAType, context: ContextVariant = "general"): string => {
  if (type === "schedule_visit") {
    if (context === "marketing") return "¡Agenda ahora!";
    if (context === "mobile") return "Agendar visita";
    return "Agendar visita";
  }
  
  if (type === "postular") {
    if (context === "marketing") return "Aplicar ahora";
    if (context === "general") return "Enviar propuesta";
    return "Postular";
  }
  
  if (type === "pre_approval") {
    return "Pre-aprobación en 30s";
  }
  
  return "WhatsApp";
};

// Handler para tracking de clicks
const handleCTAClick = (
  type: CTAType,
  location: CTALocation,
  unit: Unit,
  building: Building,
  variant: CTAVariant
) => {
  track("cta_click", {
    cta_type: type,
    location: location,
    property_id: building.id,
    unit_id: unit.id,
    variant: variant,
  });
};

export function PropertyCTAs({
  unit,
  building,
  onScheduleVisit,
  onPostular,
  onPreApproval,
  onWhatsApp,
  location,
  context = "general",
  variant = "all",
  showPreApproval = false,
  showWhatsApp = false,
  className = "",
}: PropertyCTAsProps) {
  const handleScheduleVisit = () => {
    handleCTAClick("schedule_visit", location, unit, building, "primary");
    onScheduleVisit();
  };

  const handlePostular = () => {
    if (onPostular) {
      handleCTAClick("postular", location, unit, building, "secondary");
      onPostular();
    }
  };

  const handlePreApproval = () => {
    if (onPreApproval) {
      handleCTAClick("pre_approval", location, unit, building, "terciary");
      onPreApproval();
    }
  };

  const handleWhatsApp = () => {
    if (onWhatsApp) {
      handleCTAClick("whatsapp", location, unit, building, "secondary");
      onWhatsApp();
    } else {
      const message = encodeURIComponent(
        `Hola! Me interesa el departamento ${unit.tipologia || 'departamento'} en ${building.name}, ${building.comuna}. ¿Podrías darme más información?`
      );
      const waLink = `https://wa.me/56912345678?text=${message}`;
      handleCTAClick("whatsapp", location, unit, building, "secondary");
      window.open(waLink, "_blank");
    }
  };

  // Determinar qué CTAs mostrar
  const showPrimary = variant === "all" || variant === "primary";
  const showSecondary = variant === "all" || variant === "secondary";

  return (
    <div className={`space-y-3 ${className}`}>
      {/* CTA Primario: Agendar visita */}
      {showPrimary && (
        <button
          onClick={handleScheduleVisit}
          className={`w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
            location === "booking_card" || location === "price_breakdown"
              ? "bg-[#8B6CFF] hover:bg-[#7a5ce6] focus:ring-[#8B6CFF]" // Morado para estos contextos
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" // Azul para otros contextos
          }`}
          aria-label={getCTACopy("schedule_visit", context)}
        >
          <Calendar className="w-5 h-5" />
          <span>{getCTACopy("schedule_visit", context)}</span>
        </button>
      )}

      {/* CTAs Secundarios */}
      {showSecondary && (
        <div className="space-y-2">
          {/* CTA Postular */}
          {onPostular && (
            <button
              onClick={handlePostular}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2"
              aria-label={getCTACopy("postular", context)}
            >
              <FileText className="w-5 h-5" />
              <span>{getCTACopy("postular", context)}</span>
            </button>
          )}

          {/* CTA WhatsApp */}
          {showWhatsApp && (
            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </button>
          )}
        </div>
      )}

      {/* CTA Terciario: Pre-aprobación */}
      {showPreApproval && onPreApproval && (
        <button
          onClick={handlePreApproval}
          className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm"
          aria-label={getCTACopy("pre_approval", context)}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{getCTACopy("pre_approval", context)}</span>
        </button>
      )}
    </div>
  );
}
