"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { MobileSearchInput } from "./MobileSearchInput";
import { stickyBarVariants, springConfigs } from "@/lib/animations/mobileAnimations";
import { useStickySearch } from "@/hooks/useStickySearch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onFilterClick?: () => void;
  filterCount?: number;
  placeholder?: string;
  className?: string;
  threshold?: number;
  enabled?: boolean;
}

/**
 * Barra de búsqueda sticky optimizada para móvil
 * - Aparece al hacer scroll con animación suave
 * - Badge de contador de filtros
 * - Transiciones premium
 */
export function MobileSearchBar({
  value,
  onChange,
  onSubmit,
  onFilterClick,
  filterCount = 0,
  placeholder = "Buscar propiedades...",
  className = "",
  threshold = 100,
  enabled = true,
}: MobileSearchBarProps) {
  const { isSticky } = useStickySearch({ threshold, enabled });
  const prefersReducedMotion = useReducedMotion();

  if (!enabled) {
    return null;
  }

  return (
    <div className="lg:hidden">
      <AnimatePresence>
        {isSticky && (
          <motion.div
            className={`fixed top-0 left-0 right-0 z-40 bg-surface/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-border dark:border-gray-700 shadow-lg safe-area-top ${className}`}
          variants={prefersReducedMotion ? {} : stickyBarVariants}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          transition={prefersReducedMotion ? {} : springConfigs.gentle}
        >
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Input de búsqueda */}
            <div className="flex-1">
              <MobileSearchInput
                value={value}
                onChange={onChange}
                onSubmit={onSubmit}
                placeholder={placeholder}
                className="w-full"
              />
            </div>

            {/* Botón de filtros con badge */}
            {onFilterClick && (
              <motion.button
                onClick={onFilterClick}
                className="
                  relative
                  p-3
                  rounded-2xl
                  bg-surface
                  dark:bg-gray-800
                  border-2
                  border-border
                  dark:border-gray-700
                  text-text
                  hover:bg-soft
                  dark:hover:bg-gray-700
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary
                  transition-colors
                  duration-200
                  mobile-optimized
                  min-h-[44px]
                  min-w-[44px]
                  flex items-center justify-center
                "
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                aria-label={`Filtros${filterCount > 0 ? ` (${filterCount} activos)` : ""}`}
              >
                <Filter className="w-5 h-5" />
                {filterCount > 0 && (
                  <motion.span
                    className="
                      absolute -top-1 -right-1
                      min-w-[20px] h-5
                      px-1.5
                      flex items-center justify-center
                      bg-primary text-primary-foreground
                      text-xs font-bold
                      rounded-full
                    "
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springConfigs.snappy}
                  >
                    {filterCount > 9 ? "9+" : filterCount}
                  </motion.span>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

