"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { SearchForm } from "./SearchForm";
import { SearchInput } from "@/components/filters/SearchInput";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Link from "next/link";

/**
 * Sección de búsqueda mejorada con filtros desplegables
 * Según COPY_VISUAL_STRUCTURE.md:
 * - Input de búsqueda visible siempre
 * - Botón "Filtros" que despliega panel con pills y inputs
 * - Botón "Ver todos los departamentos" al final
 */
export function SearchSection() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/buscar");
    }
  }, [searchQuery, router]);

  const toggleFilters = () => {
    setIsFiltersOpen((prev) => !prev);
  };

  // Variantes de animación para el panel
  const panelVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.3, ease: "easeInOut" },
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <section id="search-section" className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-4xl">
        {/* Título */}
        <h2 className="text-2xl font-bold tracking-tight text-text mb-6 text-center sm:text-3xl">
          Encuentra tu departamento
        </h2>

        {/* Contenedor principal con glass effect */}
        <div className="rounded-2xl bg-soft/30 p-8 ring-1 ring-soft/50 backdrop-blur-sm">
          {/* Input de búsqueda siempre visible */}
          <div className="mb-4">
            <label htmlFor="search-input" className="sr-only">
              Buscar departamentos
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Busca por comuna, dirección o nombre de edificio..."
                    className="w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex items-center justify-center rounded-xl bg-[#8B6CFF] hover:bg-[#7a5ce6] text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B6CFF] min-h-[44px]"
                  aria-label="Buscar departamentos"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                onClick={toggleFilters}
                aria-expanded={isFiltersOpen}
                aria-controls="filters-panel"
                className="inline-flex items-center gap-2 rounded-xl border border-soft/50 bg-bg/80 px-4 py-3 text-sm font-medium text-text backdrop-blur-sm transition-colors hover:bg-soft/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B6CFF] min-h-[44px]"
              >
                {isFiltersOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Ocultar filtros</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Filtros</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Panel de filtros desplegable */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                id="filters-panel"
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={panelVariants}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-soft/30">
                  <SearchForm className="space-y-4" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón Ver todos los departamentos */}
          <div className="mt-6 text-center">
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 rounded-xl border border-soft/50 bg-bg/80 px-6 py-3 text-sm font-medium text-text backdrop-blur-sm transition-colors hover:bg-soft/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring sm:px-8 sm:py-4 sm:text-base"
            >
              Ver todos los departamentos
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
