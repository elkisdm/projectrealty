"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface MotionProps {
  opacity?: number;
  x?: number;
  y?: number;
}

interface TransitionProps {
  duration?: number;
  delay?: number;
  ease?: string | number[];
}

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  initial?: MotionProps;
  animate?: MotionProps;
  transition?: TransitionProps;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
}

export default function MotionWrapper({
  children,
  className,
  initial,
  animate,
  transition,
  delay = 0,
  direction = "fade",
}: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  // Si el usuario prefiere menos movimiento, solo hacer fade simple
  if (shouldReduceMotion) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay }}
      >
        {children}
      </motion.div>
    );
  }

  // Definir presets de animación según la dirección
  const presets = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    up: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    down: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
    },
    left: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
    },
    right: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
    },
  };

  const preset = presets[direction];

  return (
    <motion.div
      className={className}
      initial={initial || preset.initial}
      animate={animate || preset.animate}
      transition={
        transition || {
          duration: 0.6,
          delay,
          ease: [0.25, 0.25, 0, 1], // easeInOutCubic
        }
      }
    >
      {children}
    </motion.div>
  );
}






