"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  limit: number;
  onPageChange?: (page: number) => void;
}

/**
 * Componente de controles de paginación
 * Muestra números de página, botones anterior/siguiente y conteo de resultados
 */
export function PaginationControls({
  currentPage,
  totalPages,
  totalResults,
  limit,
  onPageChange,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  // Calcular rango de resultados mostrados
  const startResult = (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalResults);

  // Generar números de página a mostrar (máximo 7 visibles)
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son 7 o menos
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 4) {
        // Cerca del inicio
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Cerca del final
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) {
        return;
      }

      // Si hay callback, usarlo
      if (onPageChange) {
        onPageChange(page);
        return;
      }

      // Si no, actualizar URL directamente
      const params = new URLSearchParams(searchParams.toString());
      if (page > 1) {
        params.set("page", page.toString());
      } else {
        params.delete("page");
      }

      router.push(`/buscar?${params.toString()}`, { scroll: false });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentPage, totalPages, onPageChange, searchParams, router]
  );

  // No mostrar si hay 1 página o menos
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Conteo de resultados */}
      <div className="text-sm text-subtext">
        Mostrando {startResult.toLocaleString()} - {endResult.toLocaleString()}{" "}
        de {totalResults.toLocaleString()} resultados
      </div>

      {/* Controles de paginación */}
      <nav aria-label="Paginación de resultados">
        <div className="flex items-center gap-2">
          {/* Botón Anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-surface text-text hover:bg-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Números de página - Desktop */}
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-subtext"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <motion.button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Ir a página ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    min-w-[40px] h-10 px-3 rounded-lg font-medium
                    transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2
                    ${isActive
                      ? "bg-[#8B6CFF] text-white shadow-md shadow-violet-500/25"
                      : "bg-surface border border-border text-text hover:bg-soft"
                    }
                  `}
                  whileHover={prefersReducedMotion || isActive ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion || isActive ? {} : { scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {pageNum}
                </motion.button>
              );
            })}
          </div>

          {/* Mobile: Solo mostrar página actual */}
          <div className="sm:hidden flex items-center gap-2">
            <span className="text-sm text-subtext">
              Página {currentPage} de {totalPages}
            </span>
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-surface text-text hover:bg-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </div>
  );
}


