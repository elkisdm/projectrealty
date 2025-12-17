"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AmenityChip {
  icon: LucideIcon;
  label: string;
  category?: string;
  description?: string;
}

interface AmenityChipsProps {
  items: AmenityChip[];
  maxVisible?: number;
  className?: string;
}

const categoryColors = {
  basic: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
  luxury: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200",
  outdoor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
  security: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
  default: "bg-gray-800:bg-gray-700 text-gray-800 dark:text-gray-200"
};

export const AmenityChips: React.FC<AmenityChipsProps> = ({
  items,
  maxVisible = 8,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);

  const visibleItems = isExpanded ? items : items.slice(0, maxVisible);
  const hasMoreItems = items.length > maxVisible;

  const getCategoryColor = (category?: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white:text-white">
          Amenidades destacadas
        </h3>
        <span className="text-sm text-gray-400:text-gray-400">
          {items.length} amenidades
        </span>
      </div>

      {/* Chips Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={`amenity-${item.label}-${index}`}
              variants={chipVariants}
              whileHover="hover"
              onHoverStart={() => setHoveredChip(item.label)}
              onHoverEnd={() => setHoveredChip(null)}
              className="relative group"
            >
              <motion.div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-700:border-gray-700 cursor-pointer transition-all duration-300 ${getCategoryColor(item.category)}`}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  transition: { duration: 0.2, ease: cubicBezier(0.4, 0, 0.2, 1) }
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { duration: 0.1, ease: cubicBezier(0.4, 0, 0.2, 1) }
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              </motion.div>

              {/* Tooltip */}
              {hoveredChip === item.label && item.description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg z-10 whitespace-nowrap"
                >
                  {item.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Expand/Collapse Button */}
      {hasMoreItems && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
            aria-label={isExpanded ? "Mostrar menos amenidades" : "Ver más amenidades"}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver {items.length - maxVisible} más
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Categories Legend */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-gray-700:border-gray-700"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Categorías
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryColors).map(([category, colorClass]) => {
                const categoryItems = items.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div
                    key={category}
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs ${colorClass}`}
                  >
                    <span className="capitalize">{category}</span>
                    <span className="text-xs opacity-75">({categoryItems.length})</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente de skeleton para loading
export const AmenityChipsSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};
