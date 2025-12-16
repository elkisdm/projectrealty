"use client";

import { useState, useEffect, useRef } from "react";

interface UseHeroScrollTransitionOptions {
  heroId?: string;
  searchFormId?: string;
  startThreshold?: number; // Píxeles desde el top para iniciar transición
  endThreshold?: number; // Píxeles desde el top para completar transición
}

/**
 * Hook para calcular el progreso de transición basado en el scroll
 * Retorna un valor de 0 a 1 donde:
 * - 0 = hero completamente visible
 * - 1 = hero completamente fuera, sticky activo
 */
export function useHeroScrollTransition({
  heroId = "hero-section",
  searchFormId = "hero-search-form",
  startThreshold = 200, // Iniciar transición cuando el buscador está a 200px del top
  endThreshold = 0, // Completar transición cuando el hero está completamente fuera
}: UseHeroScrollTransitionOptions = {}): number {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const updateProgress = () => {
      const heroElement = document.getElementById(heroId);
      const searchFormElement = document.getElementById(searchFormId);

      if (!heroElement || !searchFormElement) {
        // Fallback: calcular basado en scroll simple
        const scrollY = window.scrollY;
        const fallbackProgress = Math.min(1, Math.max(0, scrollY / startThreshold));
        setProgress(fallbackProgress);
        return;
      }

      const heroRect = heroElement.getBoundingClientRect();
      const searchFormRect = searchFormElement.getBoundingClientRect();

      // Calcular posición del buscador relativa al viewport
      const searchFormTop = searchFormRect.top;
      const searchFormBottom = searchFormRect.bottom;
      const heroBottom = heroRect.bottom;

      // Calcular progreso continuo y reversible basado en la posición del scroll
      // Esto funciona en ambas direcciones (scroll arriba y abajo)
      
      // Si el hero ya pasó completamente, progreso = 1
      if (heroBottom <= endThreshold) {
        setProgress(1);
        return;
      }

      // Si el buscador aún no ha alcanzado el threshold de inicio, progreso = 0
      if (searchFormTop > startThreshold) {
        setProgress(0);
        return;
      }

      // Calcular progreso continuo entre startThreshold y endThreshold
      // Cuando searchFormTop está en startThreshold, progress = 0
      // Cuando heroBottom está en endThreshold, progress = 1
      // Esto funciona en ambas direcciones automáticamente
      const range = startThreshold - endThreshold;
      const currentPosition = searchFormTop;
      const normalizedProgress = (startThreshold - currentPosition) / range;

      // Clamp entre 0 y 1 (asegura que funcione correctamente al hacer scroll arriba)
      const clampedProgress = Math.min(1, Math.max(0, normalizedProgress));
      
      // Aplicar easing muy suave tipo "ease-in-out-quart" para transición ultra fluida
      // Esto crea una curva de animación muy suave y natural en ambas direcciones
      const easedProgress = clampedProgress < 0.5
        ? 8 * clampedProgress * clampedProgress * clampedProgress * clampedProgress
        : 1 - Math.pow(-2 * clampedProgress + 2, 4) / 2;

      setProgress(easedProgress);
    };

    const handleScroll = () => {
      // Usar requestAnimationFrame para optimizar performance
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    // Verificar estado inicial
    updateProgress();

    // Agregar listeners
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [heroId, searchFormId, startThreshold, endThreshold]);

  return progress;
}


