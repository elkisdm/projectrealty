"use client";

import { useState, useEffect } from "react";

interface UseStickySearchOptions {
  threshold?: number;
  enabled?: boolean;
}

/**
 * Hook para detectar cuando mostrar barra de búsqueda sticky
 * Detecta scroll y muestra/oculta la barra según el threshold
 */
export function useStickySearch({ threshold = 100, enabled = true }: UseStickySearchOptions = {}) {
  const [isSticky, setIsSticky] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setIsSticky(false);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsSticky(currentScrollY > threshold);
    };

    // Verificar posición inicial
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, enabled]);

  return {
    isSticky,
    scrollY,
  };
}




