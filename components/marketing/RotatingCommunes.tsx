"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RotatingCommunesProps {
  communes: string[];
  interval?: number; // default 2500ms
  animation?: "fade" | "slide"; // default 'fade'
}

/**
 * Componente que rota automáticamente entre comunas disponibles
 * Respetando prefers-reduced-motion y pausando en hover/focus
 */
export function RotatingCommunes({
  communes,
  interval = 2500,
  animation = "fade",
}: RotatingCommunesProps) {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Memoizar comunas para evitar recálculos
  const validCommunes = useMemo(() => {
    if (!communes || communes.length === 0) {
      return ["Santiago"];
    }
    // Filtrar duplicados y valores vacíos
    return Array.from(new Set(communes.filter((c) => c && c.trim())));
  }, [communes]);

  // Rotación automática
  useEffect(() => {
    if (prefersReducedMotion || isPaused || validCommunes.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validCommunes.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, validCommunes.length, prefersReducedMotion, isPaused]);

  const currentCommune = validCommunes[currentIndex] || "Santiago";

  // Variantes de animación
  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const slideVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const variants = animation === "slide" ? slideVariants : fadeVariants;
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeInOut" };

  return (
    <span
      className="inline-block"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentCommune}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={transition}
          className="inline-block text-[#8B6CFF] font-bold"
        >
          {currentCommune}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
