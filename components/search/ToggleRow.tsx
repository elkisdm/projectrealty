"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ToggleRowProps } from "@/types/search";

/**
 * ToggleRow component for filter toggles in bottom sheet
 * Supports three states: null (no filter), true, false
 */
export const ToggleRow = memo(function ToggleRow({
  label,
  value,
  onChange,
  icon,
  className = "",
}: ToggleRowProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleToggle = () => {
    // Cycle: null -> true -> false -> null
    if (value === null) {
      onChange(true);
    } else if (value === true) {
      onChange(false);
    } else {
      onChange(null);
    }
  };

  const isActive = value !== null;
  const isTrue = value === true;

  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-text-muted">{icon}</div>}
        <label className="text-base font-medium text-text">{label}</label>
      </div>

      <motion.button
        type="button"
        role="switch"
        aria-checked={isActive && isTrue}
        aria-label={`${label}: ${value === true ? 'activado' : value === false ? 'desactivado' : 'sin filtrar'}`}
        onClick={handleToggle}
        className={`
          relative
          w-12 h-6
          rounded-full
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B6CFF]
          min-h-[44px] min-w-[48px]
          flex items-center
          ${isActive
            ? isTrue
              ? 'bg-[#8B6CFF]'
              : 'bg-gray-400 dark:bg-gray-600'
            : 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
          }
        `}
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      >
        <motion.div
          className="absolute w-5 h-5 bg-white rounded-full shadow-md"
          animate={{
            x: isActive && isTrue ? 26 : isActive && !isTrue ? 26 : 2,
          }}
          transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
});
