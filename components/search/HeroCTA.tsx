"use client";

import { Search } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";

interface HeroCTAProps {
  isSubmitting?: boolean;
  onMoreFiltersClick: () => void;
  className?: string;
  moreFiltersButtonRef?: RefObject<HTMLButtonElement | null>;
}

export function HeroCTA({
  isSubmitting = false,
  onMoreFiltersClick,
  className = "",
  moreFiltersButtonRef,
}: HeroCTAProps) {
  return (
    <div className={`space-y-2 mt-6 ${className}`}>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-xl font-semibold"
        aria-label={isSubmitting ? "Buscando propiedades..." : "Buscar inmuebles"}
      >
        <Search className="w-4 h-4 mr-2" aria-hidden="true" />
        {isSubmitting ? "Buscando..." : "Buscar inmuebles"}
      </Button>

      <Button
        ref={moreFiltersButtonRef}
        type="button"
        variant="ghost"
        size="sm"
        onClick={onMoreFiltersClick}
        className="w-full text-muted-foreground hover:text-foreground"
      >
        Más filtros avanzados
      </Button>
    </div>
  );
}
