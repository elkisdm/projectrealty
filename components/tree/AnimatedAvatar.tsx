"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { animePresets } from "@/lib/animations/animeConfigs";

interface AnimatedAvatarProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedAvatar({ children, className = "" }: AnimatedAvatarProps) {
  const avatarRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!avatarRef.current || prefersReducedMotion) return;

    // Animación de entrada con bounce sutil usando anime.js
    const anim = animePresets.avatarEnter(avatarRef.current);

    return () => {
      if (anim) {
        anim.pause();
      }
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={avatarRef} className={className}>
      {children}
    </div>
  );
}
