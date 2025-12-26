"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { pillVariants, springConfigs } from "@/lib/animations/mobileAnimations";

interface MobileFilterPillsProps {
  options: string[];
  selected: string | string[] | undefined;
  onSelect: (value: string | string[] | undefined) => void;
  label?: string;
  className?: string;
  multiple?: boolean;
}

/**
 * Pills de filtros optimizados para móvil
 * - Scroll horizontal suave con snap points
 * - Indicador visual de scroll disponible
 * - Animación de selección con ripple effect
 * - Optimizado para interacción táctil
 */
export function MobileFilterPills({
  options,
  selected,
  onSelect,
  label,
  className = "",
  multiple = false,
}: MobileFilterPillsProps) {
  const prefersReducedMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  // Verificar si hay scroll disponible y mostrar gradientes
  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
    };

    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      // Verificar también en resize
      window.addEventListener("resize", checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [options]);

  const handleClick = (value: string) => {
    if (multiple) {
      // Multiselección: toggle en array
      const currentSelected = Array.isArray(selected) ? selected : selected ? [selected] : [];
      const isSelected = currentSelected.includes(value);

      if (isSelected) {
        // Remover del array
        const newSelected = currentSelected.filter((v) => v !== value);
        onSelect(newSelected.length > 0 ? newSelected : undefined);
      } else {
        // Agregar al array
        const newSelected = [...currentSelected, value];
        onSelect(newSelected);
      }
    } else {
      // Single select: toggle
      onSelect(selected === value ? undefined : value);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-text px-1">{label}:</label>
      )}
      <div className="relative">
        {/* Gradiente izquierdo */}
        {showLeftGradient && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
        )}

        {/* Gradiente derecho */}
        {showRightGradient && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-bg z-10 pointer-events-none" />
        )}

        {/* Contenedor de scroll horizontal */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
          style={{
            scrollSnapType: "x proximity",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {options.map((option) => {
            const isSelected = multiple
              ? Array.isArray(selected) && selected.includes(option)
              : selected === option;

            return (
              <motion.button
                key={option}
                type="button"
                onClick={() => handleClick(option)}
                aria-pressed={isSelected}
                aria-label={`${label || "Filtro"}: ${option}${isSelected ? " seleccionado" : ""}`}
                className={`
                  flex-shrink-0
                  px-5 py-3 
                  rounded-full 
                  text-sm font-medium
                  transition-colors
                  duration-200
                  min-h-[44px]
                  min-w-[44px]
                  focus:outline-none 
                  focus-visible:ring-2 
                  focus-visible:ring-offset-2 
                  focus-visible:ring-primary
                  mobile-optimized
                  ${isSelected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-surface border border-border text-text hover:bg-soft/50"
                  }
                `}
                style={{
                  scrollSnapAlign: "start",
                }}
                variants={prefersReducedMotion ? {} : pillVariants}
                animate={isSelected ? "selected" : "unselected"}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? undefined : "tap"}
                transition={prefersReducedMotion ? {} : springConfigs.quick}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

