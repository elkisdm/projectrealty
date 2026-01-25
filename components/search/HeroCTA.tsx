"use client";

import { Search } from "lucide-react";

interface HeroCTAProps {
  isSubmitting?: boolean;
  onMoreFiltersClick: () => void;
  className?: string;
}

/**
 * Hero CTA section with primary submit button and secondary "Más filtros" link
 * Airbnb-style strong CTA with secondary action
 */
export function HeroCTA({
  isSubmitting = false,
  onMoreFiltersClick,
  className = "",
}: HeroCTAProps) {
  return (
    <div className={`space-y-3 mt-6 ${className}`}>
      {/* Primary CTA */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full h-[52px] rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
        aria-label={isSubmitting ? "Buscando propiedades..." : "Ver opciones disponibles"}
      >
        <Search className="w-5 h-5" aria-hidden="true" />
        <span>{isSubmitting ? "Buscando..." : "Ver opciones"}</span>
      </button>

      {/* Secondary link - Más filtros */}
      <button
        type="button"
        onClick={onMoreFiltersClick}
        className="w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-lg py-2"
      >
        Más filtros
      </button>
    </div>
  );
}
