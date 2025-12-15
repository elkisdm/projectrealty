"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SearchPillsProps {
  options: string[];
  selected: string | string[] | undefined;
  onSelect: (value: string | string[] | undefined) => void;
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
      // Multiselección: toggle en array
      const currentSelected = Array.isArray(selected) ? selected : selected ? [selected] : [];
      const isSelected = currentSelected.includes(value);
      
      if (isSelected) {
        // Remover del array
        const newSelected = currentSelected.filter(v => v !== value);
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
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-text whitespace-nowrap">
          {label}:
        </label>
      )}
      <div className="flex flex-wrap gap-2">
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



