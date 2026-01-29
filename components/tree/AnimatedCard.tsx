"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { animePresets } from "@/lib/animations/animeConfigs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function AnimatedCard({
  children,
  className = "",
  highlighted = false,
  onMouseEnter,
  onMouseLeave,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const hoverAnimationRef = useRef<any>(null);

  const handleMouseEnter = () => {
    if (!cardRef.current || prefersReducedMotion) return;

    // Animación hover mejorada con anime.js
    if (hoverAnimationRef.current) {
      hoverAnimationRef.current.pause();
    }
    hoverAnimationRef.current = animePresets.cardHover(cardRef.current);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || prefersReducedMotion) return;

    // Revertir animación hover
    if (hoverAnimationRef.current) {
      hoverAnimationRef.current.pause();
    }
    animePresets.cardLeave(cardRef.current);
    onMouseLeave?.();
  };

  useEffect(() => {
    return () => {
      if (hoverAnimationRef.current) {
        hoverAnimationRef.current.pause();
      }
    };
  }, []);

  return (
    <Card
      ref={cardRef}
      className={cn(
        "rounded-xl border transition-all duration-200 cursor-pointer group bg-card hover:shadow-xl active:scale-[0.98] motion-reduce:active:scale-100",
        highlighted && "ring-2 ring-opacity-20",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}
