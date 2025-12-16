"use client";

import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Link from "next/link";

interface EmptyResultsProps {
  searchTerm?: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}

/**
 * Componente para mostrar estado vacío cuando no hay resultados
 * Mensaje contextual según si hay búsqueda, filtros, etc.
 */
export function EmptyResults({
  searchTerm,
  hasFilters,
  onClearFilters,
}: EmptyResultsProps) {
  const prefersReducedMotion = useReducedMotion();

  // Determinar mensaje según contexto
  let title = "No se encontraron propiedades";
  let message = "Intenta ajustar tus filtros de búsqueda";
  let suggestion = "Prueba con otros filtros o busca en otra comuna";

  if (searchTerm) {
    title = `No encontramos propiedades para "${searchTerm}"`;
    if (hasFilters) {
      message = "Intenta ajustar tus filtros o buscar con otro término";
    } else {
      message = "Prueba con otro término de búsqueda";
    }
  } else if (hasFilters) {
    title = "No hay propiedades que coincidan con tus filtros";
    message = "Intenta ajustar tus filtros de búsqueda";
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-16 px-4"
    >
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex justify-center mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-soft flex items-center justify-center">
          <Search className="w-8 h-8 text-subtext" aria-hidden="true" />
        </div>
      </motion.div>

      <h3 className="text-xl font-bold tracking-tight text-text mb-2">
        {title}
      </h3>

      <p className="text-subtext mb-6 max-w-md mx-auto">{message}</p>

      {suggestion && (
        <p className="text-sm text-text-muted mb-8">{suggestion}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#8B6CFF] text-white font-semibold rounded-xl hover:bg-[#7a5ce6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2 min-h-[44px]"
          >
            Limpiar Filtros
          </button>
        )}

        <Link
          href="/buscar"
          className="inline-flex items-center justify-center px-6 py-3 bg-surface border border-border text-text font-semibold rounded-xl hover:bg-soft transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2 min-h-[44px]"
        >
          Ver todas las propiedades
        </Link>
      </div>
    </motion.div>
  );
}


