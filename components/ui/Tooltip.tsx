"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

export function Tooltip({ content, children, className = "", side = "top" }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipSide, setTooltipSide] = useState<"top" | "bottom">(side);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

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

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);
  const handleFocus = () => setIsOpen(true);
  const handleBlur = () => setIsOpen(false);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const tooltipContent = children || (
    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
  );

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Mostrar información"
      aria-describedby={isOpen ? "tooltip-content" : undefined}
    >
      {tooltipContent}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            id="tooltip-content"
            role="tooltip"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : tooltipSide === "top" ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : tooltipSide === "top" ? 10 : -10 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.1 }
                : { duration: 0.2, ease: "easeOut" }
            }
            className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg max-w-xs ${
              tooltipSide === "top" ? "bottom-full mb-2" : "top-full mt-2"
            } left-1/2 transform -translate-x-1/2 pointer-events-none`}
          >
            <div className="whitespace-normal break-words">{content}</div>
            {/* Arrow */}
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-4 border-transparent ${
                tooltipSide === "top"
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

