"use client";
import { useState, useEffect } from "react";

interface UseScrollVisibilityOptions {
  targetId: string;
  threshold?: number;
  rootMargin?: string;
}

export function useScrollVisibility({ 
  targetId, 
  threshold = 0.1, 
  rootMargin = "0px" 
}: UseScrollVisibilityOptions) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(targetElement);

    return () => {
      observer.unobserve(targetElement);
    };
  }, [targetId, threshold, rootMargin]);

  return isVisible;
}
