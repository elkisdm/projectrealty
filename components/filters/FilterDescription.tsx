"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { generateFilterDescription, hasActiveFilters, type FilterDescriptionInput } from "@/lib/utils/filterDescription";

interface FilterDescriptionProps {
  filters: FilterDescriptionInput;
  onClear: () => void;
  className?: string;
}

/**
 * Componente que muestra una descripción dinámica de los filtros activos
 * en formato de texto natural dentro de una pill larga
 */
export function FilterDescription({
  filters,
  onClear,
  className = "",
}: FilterDescriptionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const description = generateFilterDescription(filters);
  
  // Si no hay filtros activos, no mostrar nada
  if (!hasActiveFilters(filters)) {
    return null;
  }
  
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center gap-3
        px-6 py-3 rounded-full
        bg-[#8B6CFF] text-white text-base font-medium
        shadow-md shadow-violet-500/25
        ${className}
      `}
    >
      <span className="whitespace-normal break-words">{description}</span>
      <button
        onClick={onClear}
        aria-label="Limpiar filtros"
        className="
          flex-shrink-0
          p-1.5 rounded-full
          hover:bg-white/20
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8B6CFF]
          transition-colors duration-200
          min-w-[28px] min-h-[28px] flex items-center justify-center
        "
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

