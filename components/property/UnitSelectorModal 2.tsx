"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import type { Building, Unit } from "@schemas/models";
import { formatPrice } from "@lib/utils";
import { track } from "@lib/analytics";

interface UnitSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  building: Building;
  currentUnitId?: string;
}

// Helper function para calcular m² totales con validaciones
function calculateTotalM2(unit: Unit): number | null {
  const interior = unit.m2 || unit.area_interior_m2 || 0;
  const exterior = unit.area_exterior_m2 || unit.m2_terraza || 0;
  const total = interior + exterior;
  return total > 0 ? total : null;
}

export function UnitSelectorModal({
  isOpen,
  onClose,
  building,
  currentUnitId,
}: UnitSelectorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const selectedUnitRef = useRef<HTMLButtonElement>(null);
  const [expandedTipologia, setExpandedTipologia] = useState<string | null>(null);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  // Detectar prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Memoizar unidades disponibles
  const availableUnits = useMemo(() => {
    if (!building?.units) return [];
    return building.units.filter((unit) => unit.disponible !== false);
  }, [building?.units]);

  // Memoizar agrupación por tipología
  const groupedByTipologia = useMemo(() => {
    return availableUnits.reduce((acc, unit) => {
      const tipologia = unit.tipologia || "Sin tipología";
      if (!acc[tipologia]) {
        acc[tipologia] = [];
      }
      acc[tipologia].push(unit);
      return acc;
    }, {} as Record<string, Unit[]>);
  }, [availableUnits]);

  // Ordenar tipologías por cantidad de unidades (mayor a menor)
  const sortedTipologias = useMemo(() => {
    return Object.entries(groupedByTipologia).sort(
      (a, b) => b[1].length - a[1].length
    );
  }, [groupedByTipologia]);

  // Expandir automáticamente la tipología de la unidad actual
  useEffect(() => {
    if (!isOpen || !currentUnitId) return;

    // Usar building.units directamente para evitar dependencia de availableUnits
    const currentUnit = building.units?.find((u) => u.id === currentUnitId && u.disponible !== false);
    if (currentUnit?.tipologia) {
      setExpandedTipologia(currentUnit.tipologia);
      
      // Scroll a la unidad seleccionada después de un breve delay
      setTimeout(() => {
        if (selectedUnitRef.current) {
          selectedUnitRef.current.scrollIntoView({
            behavior: shouldReduceMotion ? "auto" : "smooth",
            block: "center",
          });
        }
      }, 300);
    }
  }, [isOpen, currentUnitId, building.units, shouldReduceMotion]);

  // Estado para prevenir múltiples clics
  const [isNavigating, setIsNavigating] = useState(false);

  // Manejar selección de unidad - solución simple y directa
  const handleUnitSelect = useCallback((unit: Unit) => {
    // Si es la misma unidad, solo cerrar el modal
    if (unit.id === currentUnitId) {
      onClose();
      return;
    }

    // Prevenir múltiples clics
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);

    // Trackear evento
    track("unit_selected_from_modal", {
      property_id: building.id,
      property_slug: building.slug,
      unit_id: unit.id,
      unit_tipologia: unit.tipologia,
      previous_unit_id: currentUnitId,
    });

    // Construir nueva URL con el parámetro unit
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("unit", unit.id);
      const newUrl = url.pathname + url.search;
      
      // Cerrar modal primero
      onClose();
      
      // Usar un pequeño delay para asegurar que el modal se cierre antes de navegar
      setTimeout(() => {
        // Navegar usando window.location para forzar recarga completa
        // Esto garantiza que el servidor component se ejecute con los nuevos searchParams
        window.location.href = newUrl;
      }, 100);
    } catch (error) {
      console.error("Error al navegar a la unidad:", error);
      setIsNavigating(false);
      onClose();
    }
  }, [currentUnitId, building, onClose, isNavigating]);

  // Manejar cierre con Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Focus trap mejorado
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const getFocusableElements = (): HTMLElement[] => {
      if (!modalRef.current) return [];
      return Array.from(
        modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        const element = el as HTMLElement;
        return !element.hasAttribute('disabled') && 
               element.offsetParent !== null && 
               !element.getAttribute('aria-hidden');
      }) as HTMLElement[];
    };

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    
    // Focus inicial con delay para asegurar que el DOM está listo
    const focusTimer = setTimeout(() => {
      firstElement?.focus();
    }, 100);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleTab);
    };
  }, [isOpen]);

  // Manejar click en overlay
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Casos edge: sin unidades disponibles
  if (availableUnits.length === 0) {
    return (
      <AnimatePresence>
        {isOpen &&
          typeof document !== "undefined" &&
          createPortal(
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              exit={shouldReduceMotion ? {} : { opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleOverlayClick}
                aria-hidden="true"
              />
              <motion.div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="unit-selector-title"
                className="relative w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-sm"
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <h2
                    id="unit-selector-title"
                    className="text-xl font-bold text-text mb-2"
                  >
                    No hay unidades disponibles
                  </h2>
                  <p className="text-sm text-subtext mb-4">
                    No hay unidades disponibles en {building.name} en este momento.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-brand-violet text-white font-medium hover:bg-brand-violet/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>
    );
  }

  const animationProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      };

  const panelAnimationProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <AnimatePresence>
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            {...animationProps}
            onClick={handleOverlayClick}
          >
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
              {...(shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 },
                  })}
            />

            {/* Modal Panel */}
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="unit-selector-title"
              aria-describedby="unit-selector-description"
              className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl border border-white/10 bg-card p-4 sm:p-6 shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col"
              {...panelAnimationProps}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 sm:mb-6 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <h2
                    id="unit-selector-title"
                    className="text-xl sm:text-2xl font-bold text-text mb-1 sm:mb-2"
                  >
                    Selecciona una unidad
                  </h2>
                  <p
                    id="unit-selector-description"
                    className="text-xs sm:text-sm text-subtext"
                  >
                    {building.name} • {availableUnits.length}{" "}
                    {availableUnits.length === 1
                      ? "unidad disponible"
                      : "unidades disponibles"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 p-2 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-text" />
                </button>
              </div>

              {/* Units List - Scrollable */}
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin">
                <div className="space-y-3 sm:space-y-4" role="list" aria-label="Lista de unidades disponibles">
                  {sortedTipologias.map(([tipologia, units]) => {
                    const isExpanded = expandedTipologia === tipologia;
                    const sortedUnits = [...units].sort((a, b) => {
                      // Ordenar por precio (menor a mayor)
                      return (a.price || 0) - (b.price || 0);
                    });

                    return (
                      <div
                        key={tipologia}
                        className="border border-white/10 rounded-xl overflow-hidden bg-white/5"
                        role="listitem"
                      >
                        {/* Tipología Header */}
                        <button
                          onClick={() =>
                            setExpandedTipologia(isExpanded ? null : tipologia)
                          }
                          className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-inset min-h-[44px]"
                          aria-expanded={isExpanded}
                          aria-controls={`tipologia-${tipologia}`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-semibold text-text text-sm sm:text-base truncate">
                                {tipologia}
                              </div>
                              <div className="text-xs text-subtext">
                                {units.length}{" "}
                                {units.length === 1 ? "unidad" : "unidades"}
                              </div>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-subtext flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-subtext flex-shrink-0 ml-2" />
                          )}
                        </button>

                        {/* Units List */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              id={`tipologia-${tipologia}`}
                              initial={
                                shouldReduceMotion
                                  ? {}
                                  : { height: 0, opacity: 0 }
                              }
                              animate={
                                shouldReduceMotion
                                  ? {}
                                  : { height: "auto", opacity: 1 }
                              }
                              exit={
                                shouldReduceMotion
                                  ? {}
                                  : { height: 0, opacity: 0 }
                              }
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                                {sortedUnits.map((unit) => {
                                  const isSelected = unit.id === currentUnitId;
                                  const m2Total = calculateTotalM2(unit);

                                  return (
                                    <button
                                      key={unit.id}
                                      ref={isSelected ? selectedUnitRef : null}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleUnitSelect(unit);
                                      }}
                                      disabled={isSelected || isNavigating}
                                      className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
                                        isSelected
                                          ? "border-brand-violet bg-brand-violet/10 ring-2 ring-brand-violet/20"
                                          : "border-white/10 bg-white/5 hover:border-brand-violet/50 hover:bg-white/10"
                                      }`}
                                      aria-pressed={isSelected}
                                      aria-disabled={isSelected || isNavigating}
                                    >
                                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-bold text-text text-sm sm:text-base">
                                              {unit.codigoUnidad || unit.id}
                                            </span>
                                            {isSelected && (
                                              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-brand-violet text-white whitespace-nowrap">
                                                Seleccionada
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-xs sm:text-sm text-subtext">
                                            {m2Total ? (
                                              <>
                                                {m2Total} m² totales
                                                {unit.orientacion && " • "}
                                              </>
                                            ) : null}
                                            {unit.orientacion && (
                                              <span>
                                                Orientación{" "}
                                                {unit.orientacion.toUpperCase()}
                                              </span>
                                            )}
                                            {!m2Total && !unit.orientacion && (
                                              <span className="text-subtext/70">
                                                Sin detalles adicionales
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="ml-2 sm:ml-4 text-right flex-shrink-0">
                                          <div className="font-bold text-base sm:text-lg text-text">
                                            {formatPrice(unit.price)}
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
    </AnimatePresence>
  );
}
