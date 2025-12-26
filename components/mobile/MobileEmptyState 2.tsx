"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { emptyStateVariants, fadeVariants } from "@/lib/animations/mobileAnimations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MobileEmptyStateProps {
  title?: string;
  description?: string;
  searchTerm?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  className?: string;
}

/**
 * Estado vacío móvil con ilustración animada
 * - Animación suave de entrada
 * - Ilustración SVG animada
 * - Acción clara para limpiar filtros
 */
export function MobileEmptyState({
  title = "No se encontraron propiedades",
  description = "Intenta ajustar tus filtros de búsqueda",
  searchTerm,
  hasFilters = false,
  onClearFilters,
  className = "",
}: MobileEmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      variants={prefersReducedMotion ? {} : emptyStateVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ilustración animada */}
      <motion.div
        className="mb-6 relative"
        variants={
          prefersReducedMotion
            ? {}
            : {
                hidden: { scale: 0.8, opacity: 0 },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: { delay: 0.2, type: "spring", stiffness: 200, damping: 20 },
                },
              }
        }
      >
        <div className="relative w-48 h-48">
          {/* Círculo de fondo animado */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/10"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Icono de búsqueda */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-24 h-24 text-subtext" strokeWidth={1.5} />
          </div>
        </div>
      </motion.div>

      {/* Título */}
      <motion.h3
        className="text-2xl font-bold text-text mb-2"
        variants={prefersReducedMotion ? {} : fadeVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>

      {/* Descripción */}
      <motion.p
        className="text-base text-subtext mb-6 max-w-sm"
        variants={prefersReducedMotion ? {} : fadeVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        {searchTerm ? (
          <>
            No encontramos resultados para <span className="font-semibold text-text">"{searchTerm}"</span>
          </>
        ) : (
          description
        )}
      </motion.p>

      {/* Botón para limpiar filtros */}
      {hasFilters && onClearFilters && (
        <motion.button
          onClick={onClearFilters}
          className="
            inline-flex items-center gap-2
            px-6 py-3
            bg-primary text-primary-foreground
            rounded-full
            font-medium
            shadow-md shadow-primary/25
            hover:shadow-lg hover:shadow-primary/30
            focus:outline-none 
            focus-visible:ring-2 
            focus-visible:ring-primary
            transition-all
            duration-200
            mobile-optimized
            min-h-[44px]
          "
          variants={prefersReducedMotion ? {} : fadeVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        >
          <X className="w-4 h-4" />
          Limpiar filtros
        </motion.button>
      )}
    </motion.div>
  );
}




