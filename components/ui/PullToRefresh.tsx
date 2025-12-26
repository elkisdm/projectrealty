"use client";
import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { usePullToRefresh } from "@hooks/usePullToRefresh";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

/**
 * Componente wrapper que agrega pull to refresh a cualquier contenido
 */
export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
  className = "",
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { bind, state, pullDistance, progress } = usePullToRefresh({
    onRefresh,
    threshold,
    disabled,
    enableHapticFeedback: true,
  });

  // Establecer referencia del contenedor para el hook
  useEffect(() => {
    if (containerRef.current) {
      // El hook necesita saber qué elemento tiene scroll
      // Por ahora, usamos window como contenedor principal
    }
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} {...bind()}>
      {/* Indicador de pull to refresh */}
      <AnimatePresence>
        {(state === "pulling" || state === "refreshing") && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pt-4"
            style={{
              transform: `translateX(-50%) translateY(${Math.min(pullDistance, threshold)}px)`,
            }}
          >
            <div
              className={`
                w-10 h-10 rounded-full bg-card border border-border shadow-lg
                flex items-center justify-center
                ${state === "refreshing" ? "animate-spin" : ""}
              `}
            >
              <RefreshCw
                className={`w-5 h-5 text-text transition-transform ${
                  state === "refreshing" ? "animate-spin" : ""
                }`}
                style={{
                  transform: state === "pulling" ? `rotate(${progress * 180}deg)` : undefined,
                }}
              />
            </div>
            {state === "pulling" && (
              <p className="text-xs text-text/70 font-medium whitespace-nowrap">
                {progress >= 1 ? "Suelta para actualizar" : "Tira para actualizar"}
              </p>
            )}
            {state === "refreshing" && (
              <p className="text-xs text-text/70 font-medium whitespace-nowrap">
                Actualizando...
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div
        style={{
          transform:
            state === "pulling" ? `translateY(${Math.min(pullDistance * 0.5, threshold * 0.5)}px)` : undefined,
          transition: state === "pulling" ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

