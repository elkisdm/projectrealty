/**
 * Configuraciones y presets para anime.js v4
 * Complementa Framer Motion con animaciones más complejas y controladas
 */

import { animate, stagger, createTimeline } from "animejs";
import type { AnimationParams } from "animejs";

/**
 * Verificar si el usuario prefiere movimiento reducido
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Configuración base respetando prefers-reduced-motion
 */
function getBaseConfig(overrides: Partial<AnimationParams> = {}): AnimationParams {
  const reduced = prefersReducedMotion();
  return {
    duration: reduced ? 200 : 600,
    ease: reduced ? "linear" : "outExpo",
    ...overrides,
  };
}

/**
 * Presets de animaciones para TreeLanding
 */
export const animePresets = {
  /**
   * Animación de entrada para cards con stagger
   */
  cardStagger: (selector: string | HTMLElement[]) => {
    return animate(selector, {
      ...getBaseConfig(),
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.95, 1],
      delay: stagger(100),
    });
  },

  /**
   * Animación de hover para cards (más pronunciada que Framer Motion)
   */
  cardHover: (selector: string | HTMLElement) => {
    return animate(selector, {
      ...getBaseConfig({ duration: 300 }),
      translateY: -8,
      scale: 1.03,
    });
  },

  /**
   * Animación de salida para cards
   */
  cardLeave: (selector: string | HTMLElement) => {
    return animate(selector, {
      ...getBaseConfig({ duration: 200 }),
      translateY: 0,
      scale: 1,
      opacity: [1, 0],
      ease: "inExpo",
    });
  },

  /**
   * Animación de entrada para el avatar con bounce sutil
   */
  avatarEnter: (selector: string | HTMLElement) => {
    return animate(selector, {
      ...getBaseConfig({ duration: 800 }),
      opacity: [0, 1],
      scale: [0.8, 1.05, 1],
      rotate: [-10, 5, 0],
      ease: "outElastic",
    });
  },

  /**
   * Animación de pulso para iconos sociales
   */
  iconPulse: (selector: string | HTMLElement[]) => {
    return animate(selector, {
      ...getBaseConfig({ duration: 1500 }),
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      delay: stagger(100),
      ease: "inOutSine",
      loop: true,
    });
  },

  /**
   * Animación de número contador (para UFIndicator)
   */
  numberCount: (
    selector: string | HTMLElement,
    from: number,
    to: number,
    duration: number = 1000
  ) => {
    const element = typeof selector === "string" 
      ? document.querySelector<HTMLElement>(selector)
      : selector;
    
    if (!element) return animate(selector, {});

    return animate({ value: from }, {
      ...getBaseConfig({ duration }),
      value: to,
      round: 1,
      ease: "outExpo",
      update: function (anim: any) {
        if (element) {
          element.innerHTML = Math.floor(anim.currentTarget.value).toString();
        }
      },
    });
  },

  /**
   * Animación de texto con efecto de escritura (typing)
   */
  textTyping: (
    selector: string | HTMLElement,
    text: string,
    duration: number = 2000
  ) => {
    const element = typeof selector === "string" 
      ? document.querySelector<HTMLElement>(selector)
      : selector;
    
    if (!element) return animate(selector, {});

    return animate({ progress: 0 }, {
      ...getBaseConfig({ duration }),
      progress: text.length,
      round: 1,
      ease: "linear",
      update: function (anim: any) {
        if (element) {
          const progress = Math.floor(anim.currentTarget.progress);
          element.innerHTML = text.substring(0, progress);
        }
      },
    });
  },

  /**
   * Animación de ondas para elementos destacados
   */
  ripple: (selector: string | HTMLElement) => {
    return animate(selector, {
      ...getBaseConfig({ duration: 600 }),
      scale: [1, 1.2],
      opacity: [0.8, 0],
    });
  },

  /**
   * Animación de shake para errores o atención
   */
  shake: (selector: string | HTMLElement) => {
    return animate(selector, {
      ...getBaseConfig({ duration: 500 }),
      translateX: [0, -10, 10, -10, 10, 0],
      ease: "inOutQuad",
    });
  },

  /**
   * Animación de fade in con slide desde diferentes direcciones
   */
  fadeSlideIn: (
    selector: string | HTMLElement,
    direction: "up" | "down" | "left" | "right" = "up"
  ) => {
    const directions = {
      up: { translateY: [30, 0] },
      down: { translateY: [-30, 0] },
      left: { translateX: [30, 0] },
      right: { translateX: [-30, 0] },
    };

    return animate(selector, {
      ...getBaseConfig(),
      opacity: [0, 1],
      ...directions[direction],
    });
  },

  /**
   * Animación de rotación continua (para loaders)
   */
  rotate: (selector: string | HTMLElement, duration: number = 2000) => {
    return animate(selector, {
      ...getBaseConfig({ duration }),
      rotate: 360,
      ease: "linear",
      loop: true,
    });
  },

  /**
   * Animación de bounce para elementos que aparecen
   */
  bounce: (selector: string | HTMLElement) => {
    return animate(selector, {
      ...getBaseConfig({ duration: 800 }),
      translateY: [0, -20, 0],
      scale: [1, 1.1, 1],
      ease: "outElastic",
    });
  },
};

