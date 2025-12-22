/**
 * Presets de animaciones premium para móvil
 * Estilo Apple: suaves, naturales y respetuosas con prefers-reduced-motion
 */

import { Variants, Transition } from "framer-motion";
import { springConfigs, reducedMotionConfig } from "./springConfigs";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Re-export springConfigs for use in components
export { springConfigs };

/**
 * Hook para obtener configuración de transición respetando prefers-reduced-motion
 */
export function useMobileTransition(config: Transition = springConfigs.gentle): Transition {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? reducedMotionConfig : config;
}

/**
 * Variantes para input de búsqueda con expansión al focus
 */
export const searchInputVariants: Variants = {
  initial: {
    scale: 0.98,
    opacity: 0.9,
  },
  focused: {
    scale: 1,
    opacity: 1,
    transition: springConfigs.gentle,
  },
  unfocused: {
    scale: 0.98,
    opacity: 0.9,
    transition: springConfigs.quick,
  },
};

/**
 * Variantes para icono de búsqueda pulsante
 */
export const searchIconVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 0.7,
  },
  pulsing: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Variantes para bottom sheet (filtros)
 */
export const bottomSheetVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: springConfigs.smooth,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: springConfigs.quick,
  },
};

/**
 * Variantes para backdrop de modales/sheets
 */
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

/**
 * Variantes para pills con ripple effect
 */
export const pillVariants: Variants = {
  unselected: {
    scale: 1,
    backgroundColor: "var(--surface)",
  },
  selected: {
    scale: 1,
    backgroundColor: "var(--primary)",
    transition: springConfigs.quick,
  },
  tap: {
    scale: 0.95,
    transition: springConfigs.snappy,
  },
};

/**
 * Variantes para lista de resultados con stagger
 */
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...springConfigs.gentle,
      delay: i * 0.05,
    },
  }),
};

/**
 * Variantes para cards de resultados
 */
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springConfigs.gentle,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: springConfigs.quick,
  },
  tap: {
    scale: 0.98,
    transition: springConfigs.snappy,
  },
};

/**
 * Variantes para skeleton shimmer
 */
export const skeletonVariants: Variants = {
  shimmer: {
    backgroundPosition: ["0%", "100%"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * Variantes para estados vacíos con ilustración
 */
export const emptyStateVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfigs.gentle,
  },
};

/**
 * Variantes para barra sticky con collapse/expand
 */
export const stickyBarVariants: Variants = {
  expanded: {
    height: "auto",
    opacity: 1,
    transition: springConfigs.gentle,
  },
  collapsed: {
    height: "60px",
    opacity: 0.95,
    transition: springConfigs.quick,
  },
};

/**
 * Variantes para pull-to-refresh
 */
export const pullToRefreshVariants: Variants = {
  idle: {
    y: 0,
    opacity: 0,
  },
  pulling: {
    y: 0,
    opacity: 1,
    transition: springConfigs.quick,
  },
  refreshing: {
    y: 0,
    opacity: 1,
    transition: {
      ...springConfigs.gentle,
      repeat: Infinity,
    },
  },
};

/**
 * Variantes para scroll horizontal de pills
 */
export const horizontalScrollVariants: Variants = {
  initial: {
    x: 0,
  },
  scroll: {
    x: 0,
    transition: springConfigs.gentle,
  },
};

/**
 * Variantes para fade in/out genérico
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

/**
 * Variantes para slide up (entrada desde abajo)
 */
export const slideUpVariants: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: springConfigs.gentle,
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: springConfigs.quick,
  },
};

/**
 * Variantes para slide down (entrada desde arriba)
 */
export const slideDownVariants: Variants = {
  hidden: {
    y: -20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: springConfigs.gentle,
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: springConfigs.quick,
  },
};

/**
 * Helper para crear variantes con delay escalonado
 */
export function createStaggerVariants(
  baseVariants: Variants,
  staggerDelay: number = 0.05
): Variants {
  return {
    ...baseVariants,
    visible: (i: number) => {
      // Si visible es una función, llamarla con el índice
      const baseVisible = typeof baseVariants.visible === "function"
        ? (baseVariants.visible as (custom: number) => Record<string, unknown> | undefined)(i)
        : baseVariants.visible;
      
      const baseTransition = typeof baseVisible === "object" && baseVisible !== null && "transition" in baseVisible
        ? baseVisible.transition as Record<string, unknown> | undefined
        : undefined;
      
      return {
        ...(typeof baseVisible === "object" && baseVisible !== null ? baseVisible : {}),
        transition: {
          ...(baseTransition || {}),
          delay: i * staggerDelay,
        },
      };
    },
  };
}

