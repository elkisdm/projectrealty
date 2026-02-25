"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { animePresets } from "@/lib/animations/animeConfigs";

interface AnimatedCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AnimatedCards({ children, className = "", ...props }: AnimatedCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    // Animación de entrada con stagger para todas las cards
    const cards = containerRef.current.querySelectorAll("[data-card]");
    if (cards.length > 0) {
      animePresets.cardStagger(Array.from(cards) as HTMLElement[]);
    }
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
}
