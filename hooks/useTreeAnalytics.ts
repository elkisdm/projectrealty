"use client";

import { useEffect, useRef, useCallback } from "react";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";

interface UseTreeAnalyticsOptions {
  enabled?: boolean;
}

export function useTreeAnalytics(options: UseTreeAnalyticsOptions = {}) {
  const { enabled = true } = options;
  const scrollDepthTracked = useRef<Set<number>>(new Set());
  const timeOnPageTracked = useRef<Set<number>>(new Set());
  const hoverStartTime = useRef<Record<string, number>>({});
  const timeOnPageTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Trackear scroll depth usando scroll events
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercent = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Trackear milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      milestones.forEach((milestone) => {
        if (
          scrollPercent >= milestone &&
          !scrollDepthTracked.current.has(milestone)
        ) {
          scrollDepthTracked.current.add(milestone);
          track(ANALYTICS_EVENTS.TREE_SCROLL_DEPTH, { depth: milestone });
        }
      });
    };

    // Debounce scroll events
    let scrollTimer: NodeJS.Timeout | null = null;
    const debouncedScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScroll, 100);
    };

    window.addEventListener("scroll", debouncedScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [enabled]);

  // Trackear tiempo en página (30s, 1min, 2min, 5min)
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const milestones = [30, 60, 120, 300]; // segundos

    milestones.forEach((seconds) => {
      const timer = setTimeout(() => {
        if (!timeOnPageTracked.current.has(seconds)) {
          timeOnPageTracked.current.add(seconds);
          track(ANALYTICS_EVENTS.TREE_TIME_ON_PAGE, { seconds });
        }
      }, seconds * 1000);

      timeOnPageTimersRef.current.push(timer);
    });

    return () => {
      timeOnPageTimersRef.current.forEach((timer) => clearTimeout(timer));
      timeOnPageTimersRef.current = [];
    };
  }, [enabled]);

  // Callback para trackear hover time en cards
  const trackCardHoverStart = useCallback(
    (cardId: string) => {
      if (!enabled) return;
      hoverStartTime.current[cardId] = Date.now();
    },
    [enabled]
  );

  const trackCardHoverEnd = useCallback(
    (cardId: string) => {
      if (!enabled) return;
      const startTime = hoverStartTime.current[cardId];
      if (startTime) {
        const hoverTime = Date.now() - startTime;
        track(ANALYTICS_EVENTS.TREE_CARD_HOVER_TIME, {
          card: cardId,
          hoverTimeMs: hoverTime,
        });
        delete hoverStartTime.current[cardId];
      }
    },
    [enabled]
  );

  return {
    trackCardHoverStart,
    trackCardHoverEnd,
  };
}
