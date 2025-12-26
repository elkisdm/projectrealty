"use client";

import { StickySearchBar } from "./StickySearchBar";

interface StickySearchWrapperProps {
  heroId?: string;
}

/**
 * Wrapper para la barra de búsqueda sticky
 * Aparece cuando el usuario hace scroll después del hero
 */
export function StickySearchWrapper({ heroId }: StickySearchWrapperProps) {
  return <StickySearchBar />;
}
