"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FormPreviewTooltipProps {
  flow: "rent" | "buy" | "rent-property" | "sell-property";
  children: React.ReactNode;
  className?: string;
}

const formPreviews: Record<string, { title: string; description: string }> = {
  rent: {
    title: "Formulario de Arriendo",
    description: "Formulario de 9 pasos: presupuesto, ubicación preferida, preferencias de dormitorios, fecha de mudanza y más.",
  },
  buy: {
    title: "Formulario de Compra",
    description: "Formulario de 9 pasos: situación financiera, capacidad de ahorro, renta mensual, complementos y más.",
  },
  "rent-property": {
    title: "Publicar Propiedad",
    description: "Formulario para publicar tu propiedad: detalles de la propiedad, ubicación, precio y preferencias de arriendo.",
  },
  "sell-property": {
    title: "Asesoría de Venta",
    description: "Formulario de asesoría para venta: información de la propiedad, valor estimado y preferencias de venta.",
  },
};

export function FormPreviewTooltip({ flow, children, className = "" }: FormPreviewTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipSide, setTooltipSide] = useState<"top" | "bottom">("top");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const preview = formPreviews[flow];

  // Calcular posición del tooltip
  useEffect(() => {
    if (isOpen && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Si el tooltip se sale por arriba, mostrarlo abajo
      if (tooltipSide === "top" && triggerRect.top - tooltipRect.height < 0) {
        setTooltipSide("bottom");
      }
      // Si el tooltip se sale por abajo, mostrarlo arriba
      else if (tooltipSide === "bottom" && triggerRect.bottom + tooltipRect.height > viewportHeight) {
        setTooltipSide("top");
      }
    }
  }, [isOpen, tooltipSide]);

  // Delay de 500ms antes de mostrar (evitar spam)
  const handleMouseEnter = () => {
    delayTimerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, []);

  // Solo mostrar en desktop (no mobile)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      ref={triggerRef}
      className={`relative ${className}`}
      onMouseEnter={!isMobile ? handleMouseEnter : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-describedby={isOpen ? `tooltip-${flow}` : undefined}
    >
      {children}
      <AnimatePresence>
        {isOpen && !isMobile && preview && (
          <motion.div
            ref={tooltipRef}
            id={`tooltip-${flow}`}
            role="tooltip"
            initial={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : tooltipSide === "top" ? 10 : -10,
            }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : tooltipSide === "top" ? 10 : -10,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: "easeOut" }
            }
            className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg max-w-xs ${tooltipSide === "top" ? "bottom-full mb-2" : "top-full mt-2"
              } left-1/2 transform -translate-x-1/2 pointer-events-none`}
          >
            <div className="font-semibold mb-1">{preview.title}</div>
            <div className="whitespace-normal break-words text-xs opacity-90">
              {preview.description}
            </div>
            {/* Arrow */}
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-4 border-transparent ${tooltipSide === "top"
                  ? "top-full border-t-gray-900 dark:border-t-gray-800"
                  : "bottom-full border-b-gray-900 dark:border-b-gray-800"
                }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
