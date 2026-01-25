'use client';

import { useState, useEffect, useRef } from 'react';

interface UseStickyObserverOptions {
  sentinelId?: string;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Hook para detectar cuando un elemento debe volverse sticky
 * usando IntersectionObserver con un sentinel element
 * 
 * @param sentinelId - ID del elemento sentinel a observar
 * @param threshold - Umbral de intersección (0-1)
 * @param rootMargin - Margen para activar antes/después
 * @param enabled - Si el observer está habilitado
 * @returns { isSticky } - true cuando el sentinel sale del viewport
 */
export function useStickyObserver({
  sentinelId = 'search-bar-sentinel',
  threshold = 0,
  rootMargin = '-64px 0px 0px 0px', // Activar 64px antes
  enabled = true,
}: UseStickyObserverOptions = {}) {
  const [isSticky, setIsSticky] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStickyObserver.ts:33',message:'useEffect started',data:{enabled,sentinelId,rootMargin,threshold},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStickyObserver.ts:38',message:'SENTINEL NOT FOUND',data:{sentinelId,available:document.querySelectorAll('[id]').length},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.warn(`Sentinel element with id "${sentinelId}" not found`);
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStickyObserver.ts:44',message:'Sentinel found',data:{sentinelId,rect:sentinel.getBoundingClientRect(),offsetTop:sentinel.offsetTop,parentId:sentinel.parentElement?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/a713a060-5962-4a10-89c4-1bd50c03514c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStickyObserver.ts:51',message:'IntersectionObserver callback',data:{isIntersecting:entry.isIntersecting,intersectionRatio:entry.intersectionRatio,boundingRect:entry.boundingClientRect,newIsSticky:!entry.isIntersecting},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        // Cuando el sentinel sale del viewport, activar sticky
        setIsSticky(!entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sentinelId, threshold, rootMargin, enabled]);

  return { isSticky };
}
