"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface NavigationLoaderProps {
  isNavigating: boolean;
}

export function NavigationLoader({ isNavigating }: NavigationLoaderProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [showLoader, setShowLoader] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce de 300ms antes de mostrar loader (evitar flash)
  useEffect(() => {
    if (isNavigating) {
      // Limpiar timer anterior si existe
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const timer = setTimeout(() => {
        setShowLoader(true);
      }, 300);
      debounceTimerRef.current = timer;
    } else {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setShowLoader(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [isNavigating]);

  // Ocultar loader cuando cambia la ruta
  useEffect(() => {
    setShowLoader(false);
  }, [pathname]);

  // Timeout de seguridad de 5s
  useEffect(() => {
    if (showLoader) {
      const safetyTimer = setTimeout(() => {
        setShowLoader(false);
      }, 5000);

      return () => clearTimeout(safetyTimer);
    }
  }, [showLoader]);

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 dark:bg-bg/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Cargando..."
        >
          <motion.div
            initial={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="w-8 h-8 text-brand-violet dark:text-brand-aqua animate-spin" />
            <p className="text-sm text-text-secondary">Cargando...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
