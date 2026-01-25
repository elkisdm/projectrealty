"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Building, Unit } from "@schemas/models";
import { formatPrice } from "@lib/utils";
import { track } from "@lib/analytics";
import { logger } from "@lib/logger";
import { normalizeComunaSlug } from "@lib/utils/slug";

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

function UnitSelectorModalContent({
  isOpen,
  onClose,
  building,
  currentUnitId,
}: UnitSelectorModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const modalRef = useRef<HTMLDivElement>(null);
  const selectedUnitRef = useRef<HTMLButtonElement>(null);
  const [expandedTipologia, setExpandedTipologia] = useState<string | null>(null);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Validar building y units antes de procesar
  const isValidBuilding = useMemo(() => {
    if (!building) {
      logger.warn("UnitSelectorModal: building is undefined");
      return false;
    }
    if (!building.units || !Array.isArray(building.units)) {
      logger.warn("UnitSelectorModal: building.units is not a valid array", { 
        buildingId: building.id,
        unitsType: typeof building.units 
      });
      return false;
    }
    return true;
  }, [building]);

  // Memoizar TODAS las unidades del edificio (no solo disponibles)
  // Esto es importante porque hay 1 edificio con 111 departamentos
  // El usuario debe poder ver todas las opciones, incluso si no están disponibles
  const allUnits = useMemo(() => {
    if (!isValidBuilding || !building?.units) return [];
    return building.units; // Mostrar TODAS las unidades, no solo disponibles
  }, [building?.units, isValidBuilding]);

  // También calcular unidades disponibles para mostrar información
  const availableUnits = useMemo(() => {
    return allUnits.filter((unit) => unit.disponible !== false);
  }, [allUnits]);

  // Memoizar agrupación por tipología usando TODAS las unidades
  const groupedByTipologia = useMemo(() => {
    return allUnits.reduce((acc, unit) => {
      const tipologia = unit.tipologia || "Sin tipología";
      if (!acc[tipologia]) {
        acc[tipologia] = [];
      }
      acc[tipologia].push(unit);
      return acc;
    }, {} as Record<string, Unit[]>);
  }, [allUnits]);

  // Ordenar tipologías por cantidad de unidades (mayor a menor)
  const sortedTipologias = useMemo(() => {
    return Object.entries(groupedByTipologia).sort(
      (a, b) => b[1].length - a[1].length
    );
  }, [groupedByTipologia]);

  // Expandir automáticamente la tipología de la unidad actual
  useEffect(() => {
    if (!isOpen || !currentUnitId || !isValidBuilding) return;

    // Buscar la unidad actual en TODAS las unidades (no solo disponibles)
    const currentUnit = building.units?.find((u) => u.id === currentUnitId);
    if (currentUnit?.tipologia) {
      setExpandedTipologia(currentUnit.tipologia);
      
      // Scroll a la unidad seleccionada después de un breve delay
      setTimeout(() => {
        try {
          if (selectedUnitRef.current) {
            selectedUnitRef.current.scrollIntoView({
              behavior: shouldReduceMotion ? "auto" : "smooth",
              block: "center",
            });
          }
        } catch (error) {
          logger.warn("Error scrolling to selected unit", { 
            error: error instanceof Error ? error.message : String(error),
            currentUnitId 
          });
        }
      }, 300);
    } else if (currentUnitId && allUnits.length > 0 && sortedTipologias.length > 0) {
      // Si currentUnitId no existe en unidades disponibles, expandir primera tipología
      const firstTipologia = sortedTipologias[0]?.[0];
      if (firstTipologia) {
        setExpandedTipologia(firstTipologia);
      }
    }
  }, [isOpen, currentUnitId, building.units, shouldReduceMotion, isValidBuilding, allUnits.length, sortedTipologias]);

  // Timeout de seguridad para resetear isNavigating después de 5 segundos
  useEffect(() => {
    if (isNavigating) {
      // Limpiar timeout anterior si existe
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Establecer nuevo timeout
      navigationTimeoutRef.current = setTimeout(() => {
        logger.warn("Navigation timeout: resetting isNavigating state", {
          buildingId: building?.id,
          currentUnitId,
        });
        setIsNavigating(false);
      }, 5000);

      return () => {
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
      };
    }
  }, [isNavigating, building?.id, currentUnitId]);

  // Helper para generar el slug de la unidad
  const getUnitSlug = useCallback((unit: Unit): string => {
    // Usar el slug de la unidad si está disponible
    if (unit.slug) {
      return unit.slug;
    }
    // Fallback: generar slug si no existe
    if (building?.slug) {
      return `${building.slug}-${unit.id.substring(0, 8)}`;
    }
    // Último fallback: usar id de la unidad
    return unit.id;
  }, [building]);

  // Manejar selección de unidad
  const handleUnitSelect = useCallback((unit: Unit) => {
    // Validaciones iniciales con logging detallado
    if (!building) {
      logger.error("UnitSelectorModal: Invalid building", {
        hasBuilding: false,
        buildingId: 'undefined',
        unitId: unit?.id || 'undefined',
        pathname: pathname || 'undefined',
      });
      onClose();
      return;
    }

    if (!unit || !unit.id) {
      logger.error("UnitSelectorModal: Invalid unit", {
        hasUnit: !!unit,
        unitId: unit?.id || 'undefined',
        buildingId: building.id || 'undefined',
        pathname: pathname || 'undefined',
      });
      onClose();
      return;
    }

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

    // Construir nueva URL según la ruta actual
    try {
      // Validar que tenemos los datos necesarios antes de construir la URL
      if (!unit.id) {
        throw new Error("Unit ID is required but missing");
      }

      // Detectar si estamos en ruta de unidad (/arriendo/departamento/[comuna]/[slug])
      const isUnitRoute = pathname?.includes('/arriendo/departamento/');
      
      let newUrl: string;

      if (isUnitRoute && building.comuna) {
        // Estamos en ruta de unidad, navegar a la nueva unidad en la misma estructura
        const comunaSlug = normalizeComunaSlug(building.comuna);
        if (!comunaSlug) {
          throw new Error(`Failed to normalize comuna slug: ${building.comuna}`);
        }

        const unitSlug = getUnitSlug(unit);
        if (!unitSlug) {
          throw new Error("Failed to generate unit slug");
        }

        newUrl = `/arriendo/departamento/${comunaSlug}/${unitSlug}`;
      } else {
        // Estamos en ruta de propiedad (/property/[slug]), usar query param
        if (!searchParams) {
          throw new Error("searchParams is not available");
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set("unit", unit.id);
        
        // Validar que el slug del building es válido
        const buildingSlug = building.slug?.trim();
        if (!buildingSlug) {
          throw new Error(`Building slug is empty. Building ID: ${building.id}`);
        }

        newUrl = `/property/${buildingSlug}?${params.toString()}`;
      }

      // Validar que newUrl fue construida correctamente
      if (!newUrl || newUrl.length === 0) {
        throw new Error("Failed to construct navigation URL");
      }
      
      // Validar que la URL construida es válida
      try {
        new URL(newUrl, window.location.origin);
      } catch (urlError) {
        throw new Error(`Invalid URL constructed: ${newUrl}`);
      }
      
      // Cerrar modal primero
      onClose();
      
      // Navegar usando router.push con scroll: false
      // router.push puede retornar void o Promise<void>, envolver en Promise.resolve para manejar ambos casos
      Promise.resolve(router.push(newUrl, { scroll: false })).catch((routerError: unknown) => {
        // Si router.push falla, loggear y resetear estado
        const routerErrorDetails: Record<string, unknown> = {
          errorMessage: routerError instanceof Error ? routerError.message : String(routerError),
          errorType: routerError instanceof Error ? routerError.constructor.name : typeof routerError,
          newUrl: newUrl || 'undefined',
          pathname: pathname || 'undefined',
        };

        if (building) {
          routerErrorDetails.buildingId = building.id || 'undefined';
          routerErrorDetails.buildingSlug = building.slug || 'undefined';
        }

        if (unit) {
          routerErrorDetails.unitId = unit.id || 'undefined';
          routerErrorDetails.unitSlug = unit.slug || 'undefined';
        }

        if (routerError instanceof Error && routerError.stack) {
          routerErrorDetails.stack = routerError.stack;
        }

        logger.error("Error navigating to unit (router.push failed)", routerErrorDetails);
        setIsNavigating(false);
        // Trackear error de navegación
        track("unit_navigation_error", {
          property_id: building.id || 'unknown',
          unit_id: unit.id || 'unknown',
          error: routerError instanceof Error ? routerError.message : String(routerError),
        });
      }).finally(() => {
        // Resetear estado después de un breve delay si no hubo error
        setTimeout(() => {
          setIsNavigating(false);
        }, 100);
      });
    } catch (error) {
      // Construir objeto de error directamente con valores seguros
      const errorDetails = {
        errorMessage: error instanceof Error ? error.message : (String(error) || 'Unknown error'),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        buildingId: building?.id ?? 'undefined',
        buildingSlug: building?.slug ?? 'undefined',
        buildingComuna: building?.comuna ?? 'undefined',
        hasBuilding: building ? 'true' : 'false',
        unitId: unit?.id ?? 'undefined',
        unitSlug: unit?.slug ?? 'undefined',
        unitTipologia: unit?.tipologia ?? 'undefined',
        hasUnit: unit ? 'true' : 'false',
        pathname: pathname ?? 'undefined',
        currentUnitId: currentUnitId ?? 'undefined',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
      };

      // Log directo para debugging (siempre se muestra)
      console.error('[UnitSelectorModal] Error caught:', JSON.stringify(errorDetails, null, 2));
      console.error('[UnitSelectorModal] Error object keys:', Object.keys(errorDetails));
      console.error('[UnitSelectorModal] Error object values:', Object.values(errorDetails));

      // Usar logger con el objeto
      logger.error("Error al navegar a la unidad", errorDetails);
      setIsNavigating(false);
      onClose();
      
      // Trackear error con información mínima
      track("unit_navigation_error", {
        property_id: building?.id || 'unknown',
        unit_id: unit?.id || 'unknown',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [currentUnitId, building, searchParams, router, onClose, isNavigating, pathname, getUnitSlug]);

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

  // Validar building antes de renderizar
  if (!isValidBuilding) {
    return null;
  }

  // Casos edge: sin unidades en el edificio
  if (allUnits.length === 0) {
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
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
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
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
      };

  if (typeof document === "undefined") return null;

  // Debug: Log cuando se intenta renderizar el portal
  if (isOpen) {
    logger.log("UnitSelectorModalContent: Creating portal", {
      isOpen,
      hasDocument: typeof document !== "undefined",
      allUnitsCount: allUnits.length,
    });
  }

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="unit-selector-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
          style={{ position: 'fixed', zIndex: 9999 }}
          {...animationProps}
          onClick={handleOverlayClick}
        >
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            style={{ position: 'fixed', zIndex: 9998 }}
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
              className="relative z-[9999] w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl border border-white/10 bg-card p-4 sm:p-6 shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col"
              style={{ position: 'relative', zIndex: 9999 }}
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
                    {building.name} • {allUnits.length}{" "}
                    {allUnits.length === 1
                      ? "unidad"
                      : "unidades"}
                    {availableUnits.length !== allUnits.length && (
                      <span className="ml-1">
                        ({availableUnits.length} disponible{availableUnits.length !== 1 ? "s" : ""})
                      </span>
                    )}
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
                                  const isAvailable = unit.disponible !== false;
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
                                      disabled={isSelected || isNavigating || !isAvailable}
                                      className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
                                        isSelected
                                          ? "border-brand-violet bg-brand-violet/10 ring-2 ring-brand-violet/20"
                                          : !isAvailable
                                          ? "border-white/5 bg-white/2 opacity-60"
                                          : "border-white/10 bg-white/5 hover:border-brand-violet/50 hover:bg-white/10"
                                      }`}
                                      aria-pressed={isSelected}
                                      aria-disabled={isSelected || isNavigating || !isAvailable}
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
                                            {!isAvailable && (
                                              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-500/50 text-gray-300 whitespace-nowrap">
                                                No disponible
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
          </motion.div>
        )}
    </AnimatePresence>,
    document.body
  );
}

export function UnitSelectorModal(props: UnitSelectorModalProps) {
  // Validar props antes de renderizar
  if (!props.building) {
    logger.warn("UnitSelectorModal: building prop is missing");
    return null;
  }

  // Debug: Log cuando el modal se renderiza
  if (props.isOpen) {
    logger.log("UnitSelectorModal: Rendering modal", {
      buildingId: props.building.id,
      currentUnitId: props.currentUnitId,
      unitsCount: props.building.units?.length || 0,
    });
  }

  return (
    <Suspense fallback={null}>
      <UnitSelectorModalContent {...props} />
    </Suspense>
  );
}
