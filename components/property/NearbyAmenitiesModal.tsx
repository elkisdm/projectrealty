"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { 
  Bus, 
  GraduationCap, 
  Leaf, 
  ShoppingBag, 
  Cross, 
  X, 
  MapPin,
  UserRound
} from "lucide-react";
import type { Building } from "@schemas/models";
import type { GroupedAmenities } from "@/lib/api/nearby-amenities";
import { logger } from "@/lib/logger";

interface NearbyAmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  building: Building;
}

type CategoryId = 'transporte' | 'educacion' | 'areas_verdes' | 'comercios' | 'salud';

interface CategoryConfig {
  id: CategoryId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'transporte', label: 'Transporte', icon: Bus },
  { id: 'educacion', label: 'Educación', icon: GraduationCap },
  { id: 'areas_verdes', label: 'Áreas verdes', icon: Leaf },
  { id: 'comercios', label: 'Comercios', icon: ShoppingBag },
  { id: 'salud', label: 'Salud', icon: Cross },
];

const SUBCATEGORY_LABELS: Record<string, string> = {
  metro: 'Estaciones de metro',
  paraderos: 'Paraderos',
  jardines_infantiles: 'Jardines infantiles',
  colegios: 'Colegios',
  universidades: 'Universidades',
  plazas: 'Plazas',
  farmacias: 'Farmacias',
  clinicas: 'Clínicas',
};

export function NearbyAmenitiesModal({
  isOpen,
  onClose,
  building,
}: NearbyAmenitiesModalProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('transporte');
  const [amenities, setAmenities] = useState<GroupedAmenities | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Cargar amenidades cuando se abre el modal
  useEffect(() => {
    if (isOpen && building.id) {
      setLoading(true);
      setError(null);
      
      // Llamar a la API route desde el cliente
      fetch(`/api/nearby-amenities?buildingId=${encodeURIComponent(building.id)}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${res.status}`);
          }
          return res.json();
        })
        .then((response) => {
          if (response.data) {
            setAmenities(response.data);
          } else {
            setAmenities(null);
          }
          setLoading(false);
        })
        .catch((err) => {
          logger.error('[NearbyAmenitiesModal] Error loading amenities:', err);
          setError(err.message || 'Error al cargar las amenidades cercanas');
          setLoading(false);
        });
    }
  }, [isOpen, building.id]);

  // Configuración de animaciones respetando prefers-reduced-motion
  const animationConfig = (() => {
    if (shouldReduceMotion) {
      return { duration: 0, ease: "linear" as const };
    }
    return { duration: 0.3, ease: "easeInOut" as const };
  })();

  // Focus trap y manejo de teclado
  useEffect(() => {
    if (!isOpen) return;

    // Guardar elemento activo previo
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Función para obtener elementos focusables
    const getFocusableElements = () => {
      if (!modalRef.current) return [];
      return Array.from(
        modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled')) as HTMLElement[];
    };

    // Función para manejar Tab y Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus inicial en botón de cerrar
    const focusTimer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    }, 10);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;

      // Restaurar focus al elemento previo
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Manejar click en overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  const overlayAnimationProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
      };

  const panelAnimationProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }
      };

  // Renderizar contenido de la categoría activa
  const renderCategoryContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Cargando amenidades...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetch(`/api/nearby-amenities?buildingId=${encodeURIComponent(building.id)}`)
                  .then(async (res) => {
                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({}));
                      throw new Error(errorData.message || `Error ${res.status}`);
                    }
                    return res.json();
                  })
                  .then((response) => {
                    if (response.data) {
                      setAmenities(response.data);
                    } else {
                      setAmenities(null);
                    }
                    setLoading(false);
                  })
                  .catch((err) => {
                    logger.error('[NearbyAmenitiesModal] Error retrying:', err);
                    setError(err.message || 'Error al cargar las amenidades cercanas');
                    setLoading(false);
                  });
              }}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    if (!amenities) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-300">No hay amenidades cercanas disponibles</p>
        </div>
      );
    }

    const categoryData = amenities[activeCategory];
    if (!categoryData) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-300">No hay datos para esta categoría</p>
        </div>
      );
    }

    // Obtener todas las subcategorías con datos
    const subcategories = Object.entries(categoryData).filter(([_, items]) => items.length > 0);

    if (subcategories.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-300">No hay amenidades en esta categoría</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {subcategories.map(([subcategory, items]) => (
          <div key={subcategory}>
            <h3 className="text-lg font-semibold text-white mb-3">
              {SUBCATEGORY_LABELS[subcategory] || subcategory}
            </h3>
            <div className="space-y-2">
              {items.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <UserRound className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {amenity.name}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-300">
                    {amenity.walkingTimeMinutes} mins - {amenity.distanceMeters} metros
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          {...overlayAnimationProps}
          onClick={handleOverlayClick}
        >
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            {...overlayAnimationProps}
          />

          {/* Modal Panel */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="amenities-modal-title"
            aria-describedby="amenities-modal-description"
            className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl border border-white/10 bg-card p-4 sm:p-6 shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col"
            {...panelAnimationProps}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6 flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 id="amenities-modal-title" className="text-xl sm:text-2xl font-bold text-white">
                    Amenidades cercanas
                  </h2>
                  <p id="amenities-modal-description" className="mt-1 text-sm sm:text-base text-gray-300">
                    {building.name}
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="ml-4 p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 flex-shrink-0"
                aria-label="Cerrar modal de amenidades"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-700 overflow-x-auto scrollbar-hide mb-6 flex-shrink-0">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`
                      flex-shrink-0 px-4 py-3 text-sm font-semibold transition-all duration-200
                      border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
                      flex items-center gap-2
                      ${isActive
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                      }
                    `}
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${category.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              <div
                id={`tabpanel-${activeCategory}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeCategory}`}
              >
                {renderCategoryContent()}
              </div>
            </div>

            {/* Footer con badge Elkis Realtor */}
            <div className="mt-6 pt-6 border-t border-gray-700 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-300 mb-2">
                    Operado por
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-white">
                    Elkis Realtor
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
