"use client";

import { useEffect, useRef, RefObject } from "react";

interface UseFocusTrapOptions {
  isActive: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Hook para implementar focus trap en modals/sheets
 * Mantiene el focus dentro del contenedor usando Tab/Shift+Tab
 * Restaura el focus al elemento previo al cerrar
 */
export function useFocusTrap({
  isActive,
  initialFocusRef,
  returnFocusRef,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Guardar elemento activo previo
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus inicial
    const timeout = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        // Buscar primer elemento focusable
        const firstFocusable = containerRef.current.querySelector(
          'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }
    }, 100);

    // Focus trap: mantener Tab dentro del contenedor
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll(
        'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab (navegación hacia atrás)
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab (navegación hacia adelante)
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", handleKeyDown);

      // Restaurar focus
      const elementToFocus = returnFocusRef?.current || previousActiveElementRef.current;
      if (elementToFocus && typeof elementToFocus.focus === "function") {
        // Pequeño delay para asegurar que el elemento está disponible
        setTimeout(() => {
          elementToFocus.focus();
        }, 0);
      }
    };
  }, [isActive, initialFocusRef, returnFocusRef]);

  return { containerRef };
}
