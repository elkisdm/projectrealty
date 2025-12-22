/**
 * Configuraciones Spring para animaciones premium tipo Apple
 * Usa física de resorte para transiciones naturales y fluidas
 */

export const springConfigs = {
  /**
   * Spring suave para transiciones generales
   * Ideal para: cards, modales, sheets
   */
  gentle: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },

  /**
   * Spring más rápido para micro-interacciones
   * Ideal para: botones, pills, iconos
   */
  quick: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 0.5,
  },

  /**
   * Spring suave para elementos grandes
   * Ideal para: bottom sheets, modales grandes
   */
  smooth: {
    type: "spring" as const,
    stiffness: 280,
    damping: 35,
    mass: 1,
  },

  /**
   * Spring muy rápido para feedback inmediato
   * Ideal para: taps, clicks, estados hover
   */
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.3,
  },

  /**
   * Spring para elementos que necesitan rebote sutil
   * Ideal para: elementos que aparecen, entradas dramáticas
   */
  bouncy: {
    type: "spring" as const,
    stiffness: 350,
    damping: 20,
    mass: 0.8,
  },
} as const;

/**
 * Configuración reducida para usuarios con prefers-reduced-motion
 */
export const reducedMotionConfig = {
  type: "tween" as const,
  duration: 0.2,
  ease: "easeOut" as const,
};







