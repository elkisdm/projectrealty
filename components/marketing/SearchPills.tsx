"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SearchPillsProps {
  options: string[];
  selected: string | undefined;
  onSelect: (value: string | undefined) => void;
  label?: string;
  className?: string;
  multiple?: boolean;
}

/**
 * Componente de pills para selección rápida de filtros
 * Usado para Comuna y Dormitorios en el formulario de búsqueda
 */
export function SearchPills({
  options,
  selected,
  onSelect,
  label,
  className = "",
  multiple = false,
}: SearchPillsProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleClick = (value: string) => {
    if (multiple) {
      // Para múltiple, toggle la selección
      // Por ahora implementamos single select según especificación
      onSelect(selected === value ? undefined : value);
    } else {
      // Single select: toggle
      onSelect(selected === value ? undefined : value);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => handleClick(option)}
              aria-pressed={isSelected}
              aria-label={`${label || "Filtro"}: ${option}${isSelected ? " seleccionado" : ""}`}
              className={`
                px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B6CFF]
                min-h-[44px] min-w-[44px]
                ${isSelected
                  ? "bg-[#8B6CFF] text-white shadow-md shadow-violet-500/25"
                  : "bg-surface border border-border text-text hover:bg-soft/50"
                }
              `}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}



