"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MessageCircle,
  DollarSign,
  Wallet,
  Shield,
  RefreshCw,
  MapPin,
  Bed,
  Bath,
  PawPrint,
  Ruler
} from "lucide-react";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import type { Unit } from "@schemas/models";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface StickyCtaBarProps {
  priceMonthly: number;
  onBook: () => void;
  onWhatsApp: () => void;
  isVisible?: boolean;
  propertyId?: string;
  commune?: string;
  unit?: Unit;
  buildingId?: string;
  buildingName?: string;
  buildingAddress?: string;
  onSelectAnotherUnit?: () => void;
}

export const StickyCtaBar: React.FC<StickyCtaBarProps> = ({
  priceMonthly,
  onBook,
  onWhatsApp,
  isVisible: _isVisible = false,
  propertyId,
  unit,
  buildingId
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
    track(ANALYTICS_EVENTS.CTA_CLICK, {
      cta_type: "schedule_visit",
      location: "sticky_bar",
      property_id: buildingId || propertyId || "",
      unit_id: unit?.id || "",
      variant: "primary",
    });
    onBook();
  }, [onBook, buildingId, propertyId, unit]);

  const handleWhatsAppClick = useCallback(() => {
    track(ANALYTICS_EVENTS.CTA_CLICK, {
      cta_type: "whatsapp",
      location: "sticky_bar",
      property_id: buildingId || propertyId || "",
      unit_id: unit?.id || "",
      variant: "secondary",
    });
    onWhatsApp();
  }, [onWhatsApp, buildingId, propertyId, unit]);

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
            className="bg-[var(--card)]/95 backdrop-blur-xl border-t border-[var(--border)]/50 shadow-lg shadow-black/10"
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
  commune,
  unit,
  buildingId,
  buildingName,
  buildingAddress,
  onSelectAnotherUnit
}) => {
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }),
    []
  );

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-CL", {
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatCurrency = useCallback(
    (value?: number | null) => {
      if (typeof value !== "number") {
        return "Por confirmar";
      }
      return currencyFormatter.format(value);
    },
    [currencyFormatter]
  );

  const handleBookClick = useCallback(() => {
    track(ANALYTICS_EVENTS.CTA_CLICK, {
      cta_type: "schedule_visit",
      location: "sticky_sidebar",
      property_id: buildingId || propertyId || "",
      unit_id: unit?.id || "",
      variant: "primary",
    });
    onBook();
  }, [onBook, buildingId, propertyId, unit]);

  const handleWhatsAppClick = useCallback(() => {
    track(ANALYTICS_EVENTS.CTA_CLICK, {
      cta_type: "whatsapp",
      location: "sticky_sidebar",
      property_id: buildingId || propertyId || "",
      unit_id: unit?.id || "",
      variant: "secondary",
    });
    onWhatsApp();
  }, [onWhatsApp, buildingId, propertyId, unit]);

  const handleSelectAnotherUnit = useCallback(() => {
    if (onSelectAnotherUnit) {
      onSelectAnotherUnit();
      return;
    }
    const anchor = document.getElementById("units-section");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [onSelectAnotherUnit]);

  const gastoComun =
    unit?.gc ?? unit?.gastosComunes ?? unit?.gastoComun ?? null;
  const garantiaHelper =
    typeof unit?.garantia_cuotas === "number" && unit.garantia_cuotas > 0
      ? `Hasta ${unit.garantia_cuotas} cuota${
          unit.garantia_cuotas === 1 ? "" : "s"
        }`
      : typeof unit?.garantia_meses === "number" && unit.garantia_meses > 0
      ? `${unit.garantia_meses} mes${
          unit.garantia_meses === 1 ? "" : "es"
        } de garantía`
      : undefined;
  const reajusteValue =
    typeof unit?.reajuste_meses === "number" && unit.reajuste_meses > 0
      ? `Cada ${unit.reajuste_meses} meses`
      : unit?.reajuste || "Según UF";

  const metricItems = useMemo(() => {
    const items: Array<{
      key: string;
      label: string;
      value: string;
      helper?: string;
      icon: React.ComponentType<{ className?: string }>;
      accent: string;
    }> = [
      {
        key: "rent",
        label: "Valor arriendo",
        value: formatCurrency(unit?.price ?? priceMonthly),
        helper:
          typeof unit?.meses_descuento === "number" && unit.meses_descuento > 0
            ? `Precio fijo primeros ${unit.meses_descuento} meses`
            : "Tarifa mensual referencial",
        icon: DollarSign,
        accent: "text-indigo-600 bg-indigo-50",
      },
    ];

    if (typeof gastoComun === "number") {
      items.push({
        key: "gc",
        label: "Gasto común fijo",
        value: formatCurrency(gastoComun),
        helper: "Monto referencial mensual",
        icon: Wallet,
        accent: "text-amber-600 bg-amber-50",
      });
    }

    if (typeof unit?.garantia === "number") {
      items.push({
        key: "guarantee",
        label: "Garantía",
        value: formatCurrency(unit.garantia),
        helper: garantiaHelper || "Revisa facilidades disponibles",
        icon: Shield,
        accent: "text-emerald-600 bg-emerald-50",
      });
    }

    items.push({
      key: "reajuste",
      label: "Reajuste",
      value: reajusteValue,
      helper: "Arriendo se ajusta según contrato",
      icon: RefreshCw,
      accent: "text-purple-600 bg-purple-50",
    });

    return items;
  }, [formatCurrency, gastoComun, garantiaHelper, reajusteValue, unit, priceMonthly]);

  const summaryChips = useMemo(() => {
    const chips: Array<{
      key: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
    }> = [];

    const surface = unit?.m2 ?? unit?.area_interior_m2;
    if (typeof surface === "number" && surface > 0) {
      chips.push({
        key: "surface",
        icon: Ruler,
        label: `${numberFormatter.format(surface)} m²`,
      });
    }

    const bedrooms = unit?.dormitorios ?? unit?.bedrooms;
    if (typeof bedrooms === "number") {
      chips.push({
        key: "bedrooms",
        icon: Bed,
        label: `${bedrooms} dormitorio${bedrooms === 1 ? "" : "s"}`,
      });
    }

    const bathrooms = unit?.banos ?? unit?.bathrooms;
    if (typeof bathrooms === "number") {
      chips.push({
        key: "bathrooms",
        icon: Bath,
        label: `${bathrooms} baño${bathrooms === 1 ? "" : "s"}`,
      });
    }

    if (unit?.pet_friendly || unit?.petFriendly) {
      chips.push({
        key: "pets",
        icon: PawPrint,
        label: "Pet-friendly",
      });
    }

    return chips;
  }, [numberFormatter, unit]);

  const locationLabel = buildingAddress || commune || "Ubicación por confirmar";
  const unitLabel =
    unit?.tipologia || unit?.slug || unit?.codigoUnidad || "Unidad disponible";

  return (
    <aside className="hidden lg:block sticky top-6" aria-label="Resumen de la unidad y acciones rápidas">
      <div className="ml-auto max-w-sm rounded-3xl border border-gray-100 bg-[var(--card)] p-8 shadow-2xl shadow-violet-200/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/30">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
            <span>{unitLabel}</span>
            {unit?.codigoUnidad && (
              <span className="text-gray-400 dark:text-gray-500">· {unit.codigoUnidad}</span>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text)]">
              {buildingName || "Condominio disponible"}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>{locationLabel}</span>
            </p>
          </div>
          {summaryChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {summaryChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200"
                >
                  <chip.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {chip.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-indigo-100 p-5 text-center dark:border-indigo-900/60 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/40">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
            Arriendo mensual
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--text)]">
            {formatCurrency(unit?.price ?? priceMonthly)}
            <span className="ml-1 text-base font-medium text-gray-500 dark:text-gray-300">/mes</span>
          </p>
          {typeof unit?.meses_descuento === "number" && unit.meses_descuento > 0 && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Precio fijo primeros {unit.meses_descuento} meses
            </p>
          )}
        </div>

        <ul className="mt-6 space-y-4">
          {metricItems.map((item) => (
            <li key={item.key} className="flex items-start gap-3">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-base font-semibold ${item.accent}`}
                aria-hidden="true"
              >
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-lg font-semibold text-[var(--text)]">{item.value}</p>
                {item.helper && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.helper}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleBookClick}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 py-4 text-center text-base font-semibold text-white shadow-lg shadow-violet-300/50 transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label="Agendar visita a la propiedad"
          >
            Agendar visita
          </button>

          <button
            onClick={handleWhatsAppClick}
            className="w-full rounded-2xl bg-emerald-500 py-4 text-center text-base font-semibold text-white shadow-lg shadow-emerald-300/60 transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Contactar por WhatsApp"
          >
            WhatsApp
          </button>
        </div>

        <button
          type="button"
          onClick={handleSelectAnotherUnit}
          className="mt-4 w-full text-center text-sm font-semibold text-indigo-600 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          Selecciona otro departamento
        </button>

        <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-center text-xs text-gray-500 dark:bg-gray-800/70 dark:text-gray-400">
          Respaldado por Assetplan · Atención humana en menos de 15 minutos
        </div>
      </div>
    </aside>
  );
};
