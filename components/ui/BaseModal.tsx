/**
 * BaseModal - Componente base reutilizable para modales
 * 
 * ⚠️ PATRÓN CORRECTO PARA MODALES CON FRAMER MOTION:
 * 
 * 1. El portal debe crearse UNA VEZ y permanecer montado
 * 2. AnimatePresence debe estar DENTRO del portal
 * 3. La condición {isOpen &&} debe estar DENTRO de AnimatePresence
 * 4. El motion.div debe tener una key única
 * 
 * ❌ INCORRECTO:
 * <AnimatePresence>
 *   {isOpen && createPortal(<motion.div>...</motion.div>, document.body)}
 * </AnimatePresence>
 * 
 * ✅ CORRECTO:
 * createPortal(
 *   <AnimatePresence>
 *     {isOpen && <motion.div key="modal">...</motion.div>}
 *   </AnimatePresence>,
 *   document.body
 * )
 */

"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useEffect, useRef, type ReactNode } from "react";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /**
   * Título del modal para accesibilidad
   */
  title?: string;
  /**
   * Descripción del modal para accesibilidad
   */
  description?: string;
  /**
   * Clase CSS adicional para el contenedor del modal
   */
  className?: string;
  /**
   * Clase CSS adicional para el panel del modal
   */
  panelClassName?: string;
  /**
   * Z-index del modal (default: 9999)
   */
  zIndex?: number;
  /**
   * Si es true, el overlay no cierra el modal al hacer clic
   */
  closeOnOverlayClick?: boolean;
  /**
   * Si es true, el modal se cierra con Escape
   */
  closeOnEscape?: boolean;
  /**
   * Si es true, bloquea el scroll del body cuando está abierto
   */
  lockBodyScroll?: boolean;
  /**
   * Variantes de animación personalizadas para el overlay
   */
  overlayVariants?: Variants;
  /**
   * Variantes de animación personalizadas para el panel
   */
  panelVariants?: Variants;
}

const defaultOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const defaultPanelVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.95 },
};

export function BaseModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  className = "",
  panelClassName = "",
  zIndex = 9999,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  lockBodyScroll = true,
  overlayVariants = defaultOverlayVariants,
  panelVariants = defaultPanelVariants,
}: BaseModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Bloquear scroll del body
  useEffect(() => {
    if (!lockBodyScroll || !isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, lockBodyScroll]);

  // Manejar Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Guardar elemento activo previo
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus inicial en el modal
    const timeout = setTimeout(() => {
      modalRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timeout);
      // Restaurar focus al elemento previo
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // No renderizar en servidor
  if (typeof document === "undefined") return null;

  // Variantes de animación (respetar prefers-reduced-motion)
  const finalOverlayVariants = shouldReduceMotion ? {} : overlayVariants;
  const finalPanelVariants = shouldReduceMotion ? {} : panelVariants;

  // Handler para clic en overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // ⚠️ PATRÓN CORRECTO: Portal primero, AnimatePresence dentro
  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="base-modal"
          className={`fixed inset-0 flex items-center justify-center p-2 sm:p-4 ${className}`}
          style={{ position: "fixed", zIndex }}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={finalOverlayVariants}
          onClick={handleOverlayClick}
        >
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ position: "fixed", zIndex: zIndex - 1 }}
            aria-hidden="true"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={finalOverlayVariants}
          />

          {/* Panel del Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "base-modal-title" : undefined}
            aria-describedby={description ? "base-modal-description" : undefined}
            tabIndex={-1}
            className={`relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl border border-white/10 bg-card p-4 sm:p-6 shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col ${panelClassName}`}
            style={{ position: "relative", zIndex }}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={finalPanelVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <h2 id="base-modal-title" className="sr-only">
                {title}
              </h2>
            )}
            {description && (
              <p id="base-modal-description" className="sr-only">
                {description}
              </p>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}



