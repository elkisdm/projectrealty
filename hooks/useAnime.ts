"use client";

import { useRef, useEffect } from "react";
import type { JSAnimation } from "animejs";

/**
 * Hook para usar anime.js en componentes React
 * Maneja cleanup automático de animaciones
 */
export function useAnime() {
  const animationsRef = useRef<JSAnimation[]>([]);

  const cleanup = () => {
    animationsRef.current.forEach((anim) => {
      if (anim && !anim.completed) {
        anim.pause();
      }
    });
    animationsRef.current = [];
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const play = (
    animationFn: (selector: string | HTMLElement) => JSAnimation,
    selector: string | HTMLElement
  ) => {
    const anim = animationFn(selector);
    animationsRef.current.push(anim);
    return anim;
  };

  return {
    play,
    cleanup,
  };
}
