"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { X } from "lucide-react";
import { bottomSheetVariants, backdropVariants, springConfigs } from "@/lib/animations/mobileAnimations";
import { ScrollFadeEffect } from "@/components/ncdai/scroll-fade-effect";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { RefObject } from "react";

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
  triggerRef?: RefObject<HTMLElement | null>;
}

/**
 * Bottom sheet modal tipo iOS para filtros móviles
 * - Animación spring desde abajo
 * - Gestos de arrastre para cerrar
 * - Backdrop con fade
 * - Respeto a prefers-reduced-motion
 */
export function MobileFilterSheet({
  isOpen,
  onClose,
  title = "Filtros",
  children,
  maxHeight = "90vh",
  triggerRef,
}: MobileFilterSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  const { containerRef } = useFocusTrap({
    isActive: isOpen && !isDragging, // Desactivar durante drag para no interferir con gestos
    initialFocusRef: closeButtonRef,
    returnFocusRef: triggerRef,
  });

  // Calcular altura del sheet
  const sheetHeight = useTransform(y, (value) => {
    return Math.max(0, value);
  });

  // Cerrar si se arrastra más del 30% hacia abajo
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100; // px
    if (info.offset.y > threshold || info.velocity.y > 500) {
      onClose();
    }
    setIsDragging(false);
    y.set(0);
  };

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Manejar escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-overlay dark:bg-black/60 z-[99]"
            variants={prefersReducedMotion ? {} : backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={(node) => {
              sheetRef.current = node;
              if (containerRef) {
                (containerRef as React.MutableRefObject<HTMLElement | null>).current = node;
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            aria-describedby="sheet-description"
            className="fixed bottom-0 left-0 right-0 z-[100] bg-surface dark:bg-gray-900 rounded-t-3xl shadow-2xl safe-area-bottom"
            style={{
              maxHeight,
              y: isDragging ? y : 0,
            }}
            variants={prefersReducedMotion ? {} : bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            transition={prefersReducedMotion ? {} : springConfigs.smooth}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-border dark:bg-gray-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-border dark:border-gray-700">
              <div>
                <h2 id="sheet-title" className="text-xl font-bold text-text">{title}</h2>
                <p id="sheet-description" className="sr-only">Ajusta los filtros para encontrar departamentos</p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="
                  p-2 
                  rounded-full 
                  hover:bg-soft 
                  dark:hover:bg-gray-800 
                  transition-colors
                  duration-200
                  focus:outline-none 
                  focus-visible:ring-2 
                  focus-visible:ring-primary
                  mobile-optimized
                  min-h-[44px]
                  min-w-[44px]
                  flex items-center justify-center
                "
                aria-label="Cerrar filtros"
              >
                <X className="h-5 w-5 text-text" />
              </button>
            </div>

            {/* Content */}
            <ScrollFadeEffect
              orientation="vertical"
              className="flex-1 overscroll-contain"
              style={{ maxHeight: `calc(${maxHeight} - 120px)` }}
            >
              <div className="px-4 py-4 pb-6">{children}</div>
            </ScrollFadeEffect>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

