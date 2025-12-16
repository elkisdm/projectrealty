"use client";
import { useState, useEffect } from "react";

interface UseScrollPositionOptions {
  threshold?: number;
}

/**
 * Hook para detectar la posición del scroll
 * Útil para mostrar/ocultar elementos sticky basados en el scroll
 */
export function useScrollPosition({ threshold = 100 }: UseScrollPositionOptions = {}) {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > threshold);
    };

    // Verificar posición inicial
    handleScroll();

    // Agregar listener con passive para mejor performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return { scrollY, isScrolled };
}


