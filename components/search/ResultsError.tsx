"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ResultsErrorProps {
  error: Error;
  onRetry: () => void;
}

/**
 * Componente para mostrar estado de error al cargar resultados
 * Muestra mensaje amigable y botón para reintentar
 */
export function ResultsError({ error, onRetry }: ResultsErrorProps) {
  const prefersReducedMotion = useReducedMotion();

  // Mensaje amigable (no técnico)
  const errorMessage =
    error.message || "Ocurrió un error al cargar los resultados";

  // Determinar si el mensaje es técnico y necesitamos uno más amigable
  const friendlyMessage = errorMessage.includes("fetch")
    ? "No pudimos cargar los resultados en este momento"
    : errorMessage.includes("network")
      ? "Problema de conexión. Verifica tu internet"
      : "Ocurrió un error al cargar los resultados";

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-16 px-4"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex justify-center mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
        </div>
      </motion.div>

      <h3 className="text-xl font-bold tracking-tight text-text mb-2">
        Error al cargar resultados
      </h3>

      <p className="text-subtext mb-8 max-w-md mx-auto">{friendlyMessage}</p>

      <button
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#8B6CFF] text-white font-semibold rounded-xl hover:bg-[#7a5ce6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2 min-h-[44px]"
        aria-label="Reintentar cargar resultados"
      >
        <RefreshCw className="w-5 h-5" aria-hidden="true" />
        Reintentar
      </button>
    </motion.div>
  );
}




