"use client";
import React, { useState, useEffect } from "react";
import { Calendar, MessageCircle, Phone } from "lucide-react";

interface StickyMobileCTAProps {
  onScheduleVisit: () => void;
  onWhatsApp?: () => void;
  onCall?: () => void;
  price?: number;
  discountPrice?: number;
  className?: string;
}

export function StickyMobileCTA({
  onScheduleVisit,
  onWhatsApp,
  onCall,
  price,
  discountPrice,
  className = ""
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 120; // Aparece tras ~120px de scroll
      const hasScrolled = scrollY > 50;

      setIsVisible(shouldShow);
      setIsScrolled(hasScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Si no está visible, no renderizar nada
  if (!isVisible) return null;

  const handleWhatsApp = () => {
    if (onWhatsApp) {
      onWhatsApp();
    } else {
      // WhatsApp por defecto
      const message = `Hola! Me interesa esta propiedad. ¿Podrías darme más información?`;
      const waLink = `https://wa.me/56912345678?text=${encodeURIComponent(message)}`;
      window.open(waLink, "_blank");
    }
  };

  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      // Llamada por defecto
      window.location.href = "tel:+56912345678";
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        } ${className}`}
      style={{
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
      }}
    >
      {/* Fondo con blur y borde superior */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-black/10">
        <div className="p-3 lg:p-4">
          <div className="flex gap-2 lg:gap-3 max-w-sm mx-auto">
            {/* Precio resumido a la izquierda */}
            {price && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-900:bg-gray-800 rounded-lg border border-gray-700:border-gray-700">
                <div className="text-right">
                  <div className="text-xs text-gray-400:text-gray-400">
                    {discountPrice ? 'Desde' : 'Precio'}
                  </div>
                  <div className="text-sm font-bold text-white:text-white">
                    ${(discountPrice || price).toLocaleString('es-CL')}
                  </div>
                </div>
              </div>
            )}

            {/* Botón principal: Reservar visita */}
            <button
              onClick={onScheduleVisit}
              className="flex-1 flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm lg:text-base font-medium rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-all duration-200 motion-reduce:transition-none"
              aria-label="Ir al formulario de reserva de visita"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>Reservar visita</span>
            </button>

            {/* Botón secundario: WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-green-600 hover:bg-green-700 text-white text-sm lg:text-base font-medium rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-all duration-200 motion-reduce:transition-none"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">WhatsApp</span>
            </button>

            {/* Botón terciario: Llamada (opcional) */}
            {onCall && (
              <button
                onClick={handleCall}
                className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-white:text-white text-sm lg:text-base font-medium rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-all duration-200 motion-reduce:transition-none"
                aria-label="Llamar por teléfono"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Llamar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
