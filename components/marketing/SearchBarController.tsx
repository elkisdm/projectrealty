'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { UnifiedSearchBar } from './UnifiedSearchBar';
import { useStickyObserver } from '@/hooks/useStickyObserver';
import { clx } from '@/lib/utils';
import { useReducedMotion } from 'framer-motion';

interface SearchBarControllerProps {
  className?: string;
  sentinelId?: string;
}

/**
 * Controller que maneja la transición del SearchBar de hero a sticky
 * Renderiza una sola instancia que cambia de posición al hacer scroll
 * 
 * Usa IntersectionObserver con un sentinel element para detectar cuando
 * activar el modo sticky, y un placeholder para evitar CLS (layout jump).
 */
export function SearchBarController({ 
  className = '',
  sentinelId = 'search-bar-sentinel'
}: SearchBarControllerProps) {
  const { isSticky } = useStickyObserver({ sentinelId });
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [searchBarHeight, setSearchBarHeight] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Medir altura del SearchBar para el placeholder
  useEffect(() => {
    if (!searchBarRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSearchBarHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(searchBarRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Memoizar clases para evitar re-renders
  const containerClasses = useMemo(
    () =>
      clx(
        'w-full transition-all duration-300',
        isSticky && [
          'fixed top-0 left-0 right-0 z-50',
          'bg-background/95 backdrop-blur-md',
          'border-b border-border',
          'shadow-lg',
          prefersReducedMotion ? '' : 'animate-in slide-in-from-top-2',
        ],
        !isSticky && 'relative'
      ),
    [isSticky, prefersReducedMotion]
  );

  return (
    <>
      {/* Sentinel: elemento invisible al final del SearchBar para detectar scroll */}
      <div 
        id={sentinelId} 
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 pointer-events-none" 
        aria-hidden="true"
      />

      {/* Placeholder: mantiene el espacio cuando el SearchBar se vuelve fixed */}
      {isSticky && searchBarHeight !== null && (
        <div 
          className="transition-opacity duration-300"
          style={{ height: searchBarHeight }}
          aria-hidden="true"
        />
      )}

      {/* SearchBar único: cambia de relative a fixed según isSticky */}
      <div ref={searchBarRef} className={containerClasses}>
        <UnifiedSearchBar 
          variant="hero" 
          showAdvancedFilters={true}
          className={className}
        />
      </div>
    </>
  );
}
