"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
}

/**
 * Componente de chip individual para mostrar un filtro activo
 * Similar a SearchPills pero con botón de remover
 */
export function FilterChip({
  label,
  value,
  onRemove,
  className = "",
}: FilterChipProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center gap-2
        px-3 py-1.5 rounded-full
        bg-[#8B6CFF] text-white text-sm font-medium
        shadow-md shadow-violet-500/25
        ${className}
      `}
    >
      <span>{label}: {value}</span>
      <button
        onClick={onRemove}
        aria-label={`Remover filtro ${label}: ${value}`}
        className="
          p-0.5 rounded-full
          hover:bg-white/20
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8B6CFF]
          transition-colors duration-200
          min-w-[20px] min-h-[20px] flex items-center justify-center
        "
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  );
}




