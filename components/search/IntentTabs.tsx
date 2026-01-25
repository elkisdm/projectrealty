"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface IntentTabsProps {
  value: "rent" | "buy" | "invest";
  onChange: (value: "rent" | "buy" | "invest") => void;
  className?: string;
  /** Visual variant: "default" or "subtle" (reduced visual weight) */
  variant?: "default" | "subtle";
}

/**
 * Intent tabs for Arrendar/Comprar/Inversión
 * QuintoAndar-style app-like panel with tabs
 * Only "Arrendar" is functional; others show "Próximamente" tooltip
 */
export function IntentTabs({ value, onChange, className = "", variant = "default" }: IntentTabsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const tabs = [
    { id: "rent", label: "Arrendar", disabled: false },
    { id: "buy", label: "Comprar", disabled: true },
    { id: "invest", label: "Inversión", disabled: true },
  ] as const;

  // Subtle variant has smaller, less prominent styling
  const isSubtle = variant === "subtle";

  return (
    <div className={`${isSubtle ? "mb-2" : "mb-6"} ${className}`}>
      <div className="flex gap-2" role="tablist" aria-label="Tipo de búsqueda">
        {tabs.map((tab) => (
          <div key={tab.id} className="relative flex-1">
            <button
              type="button"
              role="tab"
              aria-selected={value === tab.id}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`
                relative w-full rounded-xl
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
                ${isSubtle
                  ? "px-3 py-2 text-xs font-medium min-h-[36px]"
                  : "px-4 py-3 text-sm font-semibold min-h-[44px]"
                }
                ${value === tab.id
                  ? isSubtle
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-primary text-white shadow-md shadow-primary/25"
                  : tab.disabled
                    ? isSubtle
                      ? "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                    : isSubtle
                      ? "bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }
              `}
            >
              {tab.label}
            </button>

            {/* Tooltip for disabled tabs */}
            {tab.disabled && hoveredTab === tab.id && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-50"
              >
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                  Próximamente
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
