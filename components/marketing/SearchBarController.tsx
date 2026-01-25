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

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBarController.tsx:30',message:'isSticky changed',data:{isSticky,searchBarHeight,prefersReducedMotion},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
  }, [isSticky, searchBarHeight, prefersReducedMotion]);
  // #endregion

  // Medir altura del SearchBar para el placeholder
  useEffect(() => {
    if (!searchBarRef.current) return;

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBarController.tsx:39',message:'ResizeObserver setup',data:{hasRef:!!searchBarRef.current,initialHeight:searchBarRef.current?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBarController.tsx:46',message:'ResizeObserver callback',data:{newHeight:entry.contentRect.height,previousHeight:searchBarHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
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
          'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md',
          'border-b border-gray-200 dark:border-gray-800',
          'shadow-lg',
          prefersReducedMotion ? '' : 'animate-in slide-in-from-top-2',
        ],
        !isSticky && 'relative'
      ),
    [isSticky, prefersReducedMotion]
  );

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBarController.tsx:68',message:'Render state',data:{isSticky,showPlaceholder:isSticky&&searchBarHeight!==null,searchBarHeight,containerClasses},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
  });
  // #endregion

  return (
    <>
      {/* Sentinel: elemento invisible al final del SearchBar para detectar scroll */}
      <div 
        id={sentinelId} 
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 pointer-events-none" 
        aria-hidden="true"
        ref={(el) => {
          // #region agent log
          if (el) {
            fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBarController.tsx:82',message:'Sentinel mounted',data:{rect:el.getBoundingClientRect(),offsetTop:el.offsetTop,parentTag:el.parentElement?.tagName,parentClasses:el.parentElement?.className},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'E'})}).catch(()=>{});
          }
          // #endregion
        }}
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
