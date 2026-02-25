"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollFadeEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
  /** Gradient size in px */
  gradientSize?: number;
  children: React.ReactNode;
}

/**
 * Wraps scrollable content with fade gradients at edges to indicate more content.
 * Supports vertical and horizontal scrolling.
 */
export const ScrollFadeEffect = React.forwardRef<
  HTMLDivElement,
  ScrollFadeEffectProps
>(
  (
    {
      className,
      orientation = "vertical",
      gradientSize = 24,
      children,
      ...props
    },
    ref
  ) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [showTop, setShowTop] = React.useState(false);
    const [showBottom, setShowBottom] = React.useState(false);

    const updateGradients = React.useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const isVertical = orientation === "vertical";
      const scroll = isVertical ? el.scrollTop : el.scrollLeft;
      const size = isVertical ? el.clientHeight : el.clientWidth;
      const scrollSize = isVertical ? el.scrollHeight : el.scrollWidth;

      setShowTop(scroll > 1);
      setShowBottom(scroll + size < scrollSize - 1);
    }, [orientation]);

    React.useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      updateGradients();
      const observer = new ResizeObserver(updateGradients);
      observer.observe(el);
      el.addEventListener("scroll", updateGradients, { passive: true });
      return () => {
        observer.disconnect();
        el.removeEventListener("scroll", updateGradients);
      };
    }, [updateGradients]);

    const isVertical = orientation === "vertical";

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {/* Top / Left gradient */}
        <div
          aria-hidden
          className={cn(
            "absolute z-10 pointer-events-none bg-gradient-to-b from-background to-transparent transition-opacity duration-200",
            isVertical
              ? "inset-x-0 top-0 left-0 right-0"
              : "inset-y-0 left-0 top-0 bottom-0 bg-gradient-to-r from-background to-transparent",
            showTop ? "opacity-100" : "opacity-0"
          )}
          style={
            isVertical
              ? { height: gradientSize }
              : { width: gradientSize }
          }
        />

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className={cn(
            "overflow-auto",
            isVertical ? "overflow-y-auto overflow-x-hidden" : "overflow-x-auto overflow-y-hidden"
          )}
        >
          {children}
        </div>

        {/* Bottom / Right gradient */}
        <div
          aria-hidden
          className={cn(
            "absolute z-10 pointer-events-none bg-gradient-to-t from-background to-transparent transition-opacity duration-200",
            isVertical
              ? "inset-x-0 bottom-0 left-0 right-0"
              : "inset-y-0 right-0 top-0 bottom-0 bg-gradient-to-l from-background to-transparent",
            showBottom ? "opacity-100" : "opacity-0"
          )}
          style={
            isVertical
              ? { height: gradientSize }
              : { width: gradientSize }
          }
        />
      </div>
    );
  }
);

ScrollFadeEffect.displayName = "ScrollFadeEffect";
