"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { UnitCard } from "@/components/ui/UnitCard";
import { MobileLoadingSkeleton } from "./MobileLoadingSkeleton";
import { listItemVariants, cardVariants } from "@/lib/animations/mobileAnimations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Unit, Building } from "@/types";

interface MobileResultsListProps {
  items: Array<{ unit: Unit; building: Building }>;
  isLoading?: boolean;
  isFetching?: boolean;
  className?: string;
}

/**
 * Lista de resultados optimizada para móvil
 * - Layout vertical (no grid)
 * - Animaciones stagger para entrada
 * - Lazy loading optimizado
 * - Cards con altura optimizada para scroll rápido
 */
export const MobileResultsList = memo(function MobileResultsList({
  items,
  isLoading = false,
  isFetching = false,
  className = "",
}: MobileResultsListProps) {
  const prefersReducedMotion = useReducedMotion();

  // Loading inicial
  if (isLoading && items.length === 0) {
    return <MobileLoadingSkeleton count={6} className={className} />;
  }

  // Estado vacío
  if (!isLoading && !isFetching && items.length === 0) {
    return null; // El componente padre maneja el estado vacío
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={`${item.building.id}-${item.unit.id}`}
          variants={prefersReducedMotion ? {} : listItemVariants}
          initial="hidden"
          animate="visible"
          custom={index}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.02, y: -4 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        >
          <UnitCard
            unit={item.unit}
            building={item.building}
            priority={index < 4}
            variant="compact"
            className="w-full"
          />
        </motion.div>
      ))}

      {/* Loading durante fetch (mostrar skeletons adicionales) */}
      {isFetching && items.length > 0 && (
        <MobileLoadingSkeleton count={2} />
      )}
    </div>
  );
});

