"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  isLoading?: boolean;
  variant?: 'normal' | 'compact';
  className?: string;
}

interface InfiniteScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  totalCount: number;
  loadedCount: number;
  className?: string;
}

/**
 * Componente de controles de paginación normal
 */
export function PaginationControls({
  pagination,
  onPageChange,
  onNextPage,
  onPrevPage,
  isLoading = false,
  variant = 'normal',
  className = '',
}: PaginationControlsProps) {
  const { currentPage, totalPages, totalCount, hasNextPage, hasPrevPage, limit } = pagination;
  
  // Calcular páginas visibles (mostrar máximo 7 páginas)
  const getVisiblePages = () => {
    const delta = variant === 'compact' ? 1 : 2;
    const range = [];
    const rangeWithDots = [];
    
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  };
  
  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);
  
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <nav
      role="navigation"
      aria-label="Paginación de resultados"
      className={`flex items-center justify-between ${className}`}
    >
      {/* Información de resultados */}
      <div className="text-sm text-gray-300:text-gray-400">
        <span className="font-medium">{startItem}</span>
        {' - '}
        <span className="font-medium">{endItem}</span>
        {' de '}
        <span className="font-medium">{totalCount}</span>
        {' resultados'}
      </div>
      
      {/* Controles de paginación */}
      <div className="flex items-center space-x-1">
        {/* Botón anterior */}
        <button
          onClick={onPrevPage}
          disabled={!hasPrevPage || isLoading}
          className={`
            inline-flex items-center px-3 py-2 text-sm font-medium
            bg-gray-800:bg-gray-800 border border-gray-300 dark:border-gray-600
            rounded-2xl transition-all duration-200
            hover:bg-gray-900:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
            dark:disabled:hover:bg-gray-800
            ${isLoading ? 'cursor-wait' : ''}
          `}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Anterior</span>
        </button>
        
        {/* Números de página */}
        <div className="hidden sm:flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-sm text-gray-400:text-gray-400"
                >
                  ...
                </span>
              );
            }
            
            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;
            
            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className={`
                  inline-flex items-center px-3 py-2 text-sm font-medium
                  rounded-2xl transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:cursor-wait
                  ${isCurrentPage
                    ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                    : 'bg-gray-800:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-900:hover:bg-gray-700'
                  }
                `}
                aria-label={`Ir a página ${pageNumber}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
        
        {/* Página actual en móvil */}
        <div className="sm:hidden">
          <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
            {currentPage} / {totalPages}
          </span>
        </div>
        
        {/* Botón siguiente */}
        <button
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
          className={`
            inline-flex items-center px-3 py-2 text-sm font-medium
            bg-gray-800:bg-gray-800 border border-gray-300 dark:border-gray-600
            rounded-2xl transition-all duration-200
            hover:bg-gray-900:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
            dark:disabled:hover:bg-gray-800
            ${isLoading ? 'cursor-wait' : ''}
          `}
          aria-label="Página siguiente"
        >
          <span className="mr-1 hidden sm:inline">Siguiente</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

/**
 * Componente de infinite scroll con botón "Cargar más"
 */
export function InfiniteScrollControls({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  totalCount,
  loadedCount,
  className = '',
}: InfiniteScrollProps) {
  if (!hasNextPage && loadedCount >= totalCount) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-sm text-gray-400:text-gray-400">
          Has visto todos los {totalCount} resultados
        </p>
      </div>
    );
  }
  
  return (
    <div className={`text-center py-8 ${className}`}>
      {hasNextPage && (
        <button
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          className={`
            inline-flex items-center px-6 py-3 text-sm font-medium
            bg-blue-600 text-white border border-blue-600
            rounded-2xl transition-all duration-200
            hover:bg-blue-700 hover:border-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isFetchingNextPage ? 'cursor-wait' : ''}
          `}
          aria-label="Cargar más resultados"
        >
          {isFetchingNextPage ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Cargando...
            </>
          ) : (
            'Cargar más resultados'
          )}
        </button>
      )}
      
      {/* Información de progreso */}
      <div className="mt-3 text-sm text-gray-400:text-gray-400">
        Mostrando {loadedCount} de {totalCount} resultados
        {totalCount > loadedCount && (
          <>
            {' • '}
            <span className="font-medium">
              {totalCount - loadedCount} más disponibles
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Hook para scroll infinito automático (observador de intersección)
 */
export function useInfiniteScrollObserver(
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void
) {
  const observerRef = React.useRef<HTMLDivElement | null>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px', // Cargar antes de llegar al final
      }
    );
    
    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }
    
    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  return observerRef;
}

/**
 * Componente de scroll infinito automático (sin botón)
 */
export function AutoInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  totalCount,
  loadedCount,
  className = '',
}: InfiniteScrollProps) {
  const observerRef = useInfiniteScrollObserver(hasNextPage, isFetchingNextPage, onLoadMore);
  
  return (
    <div className={`py-8 ${className}`}>
      {/* Elemento observado para trigger automático */}
      <div ref={observerRef} className="h-px" aria-hidden="true" />
      
      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="text-center">
          <div className="inline-flex items-center text-sm text-gray-400:text-gray-400">
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Cargando más resultados...
          </div>
        </div>
      )}
      
      {/* Mensaje final */}
      {!hasNextPage && loadedCount >= totalCount && (
        <div className="text-center">
          <p className="text-sm text-gray-400:text-gray-400">
            Has visto todos los {totalCount} resultados
          </p>
        </div>
      )}
    </div>
  );
}
