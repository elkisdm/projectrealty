"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { StickyCTAProps } from "@/types/search";

/**
 * StickyCTA component for bottom sheet
 * Shows result count and applies filters on click
 */
export const StickyCTA = memo(function StickyCTA({
  resultsCount,
  isLoading = false,
  onClick,
  className = "",
  label,
}: StickyCTAProps) {
  const prefersReducedMotion = useReducedMotion();

  const getButtonText = useMemo(() => {
    if (isLoading) {
      return "Buscando...";
    }
    // Use custom label if provided
    if (label) {
      return label;
    }
    if (resultsCount === undefined) {
      return "Ver departamentos";
    }
    if (resultsCount === 0) {
      return "Sin resultados";
    }
    if (resultsCount === 1) {
      return "Ver 1 departamento";
    }
    return `Ver ${resultsCount} departamentos`;
  }, [isLoading, resultsCount, label]);

  const isDisabled = isLoading || resultsCount === 0;

  return (
    <div
      className={`
        sticky bottom-0 left-0 right-0
        bg-surface
        border-t border-border
        p-4
        z-10
        ${className}
      `}
    >
      <motion.button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`
          w-full
          px-6 py-4
          rounded-xl
          font-semibold text-base
          transition-all duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B6CFF]
          min-h-[56px]
          flex items-center justify-center gap-2
          ${
            isDisabled
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-[#8B6CFF] hover:bg-[#7a5ce6] text-white shadow-lg shadow-violet-500/25"
          }
        `}
        whileHover={isDisabled || prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={isDisabled || prefersReducedMotion ? {} : { scale: 0.98 }}
        aria-label={getButtonText}
      >
        {isLoading && (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        )}
        <span>{getButtonText}</span>
      </motion.button>
    </div>
  );
});
