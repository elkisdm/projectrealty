"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MessageCircle, DollarSign } from "lucide-react";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface StickyCtaBarProps {
  priceMonthly: number;
  onBook: () => void;
  onWhatsApp: () => void;
  isVisible?: boolean;
  propertyId?: string;
  commune?: string;
}

export const StickyCtaBar: React.FC<StickyCtaBarProps> = ({
  priceMonthly,
  onBook,
  onWhatsApp,
  isVisible: _isVisible = false,
  propertyId,
  commune
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Intersection Observer para detectar scroll (QuintoAndar pattern: 100-150px, usando 120px)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 120);
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, []);

  const handleBookClick = useCallback(() => {
    track(ANALYTICS_EVENTS.CTA_BOOK_CLICK, {
      context: "sticky_bar",
      propertyId,
      commune,
      price: priceMonthly
    });
    onBook();
  }, [onBook, propertyId, commune, priceMonthly]);

  const handleWhatsAppClick = useCallback(() => {
    track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, {
      context: "sticky_bar",
      propertyId,
      commune,
      price: priceMonthly
    });
    onWhatsApp();
  }, [onWhatsApp, propertyId, commune, priceMonthly]);

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.div
          initial={{ y: prefersReducedMotion ? 0 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: prefersReducedMotion ? 0 : 100, opacity: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.2 }
              : {
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }
          }
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          role="navigation"
          aria-label="Acciones rápidas para agendar visita"
        >
          <div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-black/10"
            style={{
              paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))"
            }}
          >
            <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Precio destacado */}
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-2 sm:px-3 py-2 flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-bold text-green-700 dark:text-green-300">
                    ${priceMonthly.toLocaleString('es-CL')}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    /mes
                  </span>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 flex-1">
                  <motion.button
                    onClick={handleBookClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold min-h-[44px] py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 relative overflow-hidden group shadow-lg hover:shadow-xl"
                    aria-label="Agendar visita a la propiedad"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  >
                    {!prefersReducedMotion && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                    <Calendar className="w-4 h-4 relative z-10" aria-hidden="true" />
                    <span className="text-sm relative z-10">Agendar visita</span>
                  </motion.button>

                  <motion.button
                    onClick={handleWhatsAppClick}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold min-h-[44px] min-w-[44px] py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 relative overflow-hidden group shadow-lg hover:shadow-xl"
                    aria-label="Contactar por WhatsApp"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  >
                    {!prefersReducedMotion && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                    <MessageCircle className="w-4 h-4 relative z-10" aria-hidden="true" />
                    <span className="sr-only relative z-10">WhatsApp</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Desktop version - Sidebar sticky
export const StickyCtaSidebar: React.FC<StickyCtaBarProps> = ({
  priceMonthly,
  onBook,
  onWhatsApp,
  propertyId,
  commune
}) => {
  const handleBookClick = useCallback(() => {
    track(ANALYTICS_EVENTS.CTA_BOOK_CLICK, {
      context: "sticky_sidebar",
      propertyId,
      commune,
      price: priceMonthly
    });
    onBook();
  }, [onBook, propertyId, commune, priceMonthly]);

  const handleWhatsAppClick = useCallback(() => {
    track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, {
      context: "sticky_sidebar",
      propertyId,
      commune,
      price: priceMonthly
    });
    onWhatsApp();
  }, [onWhatsApp, propertyId, commune, priceMonthly]);

  return (
    <div className="hidden lg:block sticky top-6">
      <div className="bg-gray-800:bg-gray-800 rounded-2xl shadow-lg border border-gray-700:border-gray-700 p-6">
        {/* Precio destacado */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="text-2xl font-bold text-green-700 dark:text-green-300">
              ${priceMonthly.toLocaleString('es-CL')}
            </span>
          </div>
          <span className="text-sm text-gray-300:text-gray-400">
            Total estimado / mes
          </span>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleBookClick}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Agendar visita a la propiedad"
          >
            <Calendar className="w-5 h-5" aria-hidden="true" />
            <span>Agendar visita</span>
          </button>

          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            <span>Hablar por WhatsApp</span>
          </button>
        </div>

        {/* Micro-trust */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400:text-gray-400">
            Respaldado por Assetplan
          </p>
        </div>
      </div>
    </div>
  );
};
