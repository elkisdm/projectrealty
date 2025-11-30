import { useState, useEffect, useMemo, useCallback } from 'react';
import { type BuildingSummary } from './useFetchBuildings';

// Configuración de responsive breakpoints (coincide con Tailwind)
const GRID_CONFIG = {
  // Breakpoints en px (mobile-first)
  breakpoints: {
    mobile: 0,    // grid-cols-1
    tablet: 768,  // md:grid-cols-2  
    desktop: 1024, // lg:grid-cols-3
    wide: 1536    // 2xl:grid-cols-4
  },
  // Columnas por breakpoint
  columns: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4
  },
  // Dimensiones de card (incluyendo gap)
  cardHeight: 320, // Altura estimada de BuildingCardV2 + gap
  cardWidth: 280,  // Ancho base de card
  gap: 24         // gap-6 en Tailwind = 24px
} as const;

type GridBreakpoint = keyof typeof GRID_CONFIG.columns;

interface VirtualGridDimensions {
  containerWidth: number;
  containerHeight: number;
  columns: number;
  rows: number;
  itemWidth: number;
  itemHeight: number;
  totalItems: number;
}

interface VirtualGridConfig {
  // Datos
  items: BuildingSummary[];
  // Configuración de contenedor
  containerRef?: React.RefObject<HTMLDivElement>;
  // Opciones de virtualización
  overscan?: number; // Items extra a renderizar fuera del viewport
  enableVirtualization?: boolean; // Permitir desactivar virtualización
}

interface VirtualGridReturn {
  // Dimensiones calculadas
  dimensions: VirtualGridDimensions;
  // Configuración para react-window
  FixedSizeGrid: unknown; // Componente react-window
  gridProps: {
    columnCount: number;
    rowCount: number;
    columnWidth: number;
    rowHeight: number;
    height: number;
    width: number;
    overscanRowCount: number;
    overscanColumnCount: number;
  };
  // Funciones helper
  getItemIndex: (rowIndex: number, columnIndex: number) => number;
  getItemData: (itemIndex: number) => BuildingSummary | undefined;
  isItemLoaded: (itemIndex: number) => boolean;
  // Estado responsivo
  currentBreakpoint: GridBreakpoint;
  isVirtualizationActive: boolean;
}

/**
 * Hook para manejar virtualización de grid con react-window
 * 
 * Funcionalidades:
 * - Cálculo automático de columnas responsivas (1/2/3/4)
 * - Dimensiones dinámicas basadas en viewport
 * - Compatibilidad con react-window FixedSizeGrid
 * - Overscan configurable para performance
 * - Detección de breakpoints Tailwind
 * 
 * @param config Configuración del virtual grid
 * @returns Configuración y helpers para virtualización
 */
export function useVirtualGrid({
  items = [],
  containerRef,
  overscan = 2,
  enableVirtualization = true
}: VirtualGridConfig): VirtualGridReturn {
  // Estado de dimensiones del viewport
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Detectar breakpoint actual
  const currentBreakpoint = useMemo((): GridBreakpoint => {
    const width = viewportSize.width;
    
    if (width >= GRID_CONFIG.breakpoints.wide) return 'wide';
    if (width >= GRID_CONFIG.breakpoints.desktop) return 'desktop';
    if (width >= GRID_CONFIG.breakpoints.tablet) return 'tablet';
    return 'mobile';
  }, [viewportSize.width]);

  // Calcular dimensiones del grid
  const dimensions = useMemo((): VirtualGridDimensions => {
    const columns = GRID_CONFIG.columns[currentBreakpoint];
    const totalItems = items.length;
    const rows = Math.ceil(totalItems / columns);
    
    // Calcular ancho del contenedor (usar containerRef si está disponible)
    let containerWidth = viewportSize.width;
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerWidth = rect.width;
    }
    
    // Calcular ancho de item (descontando gaps)
    const totalGapWidth = (columns - 1) * GRID_CONFIG.gap;
    const itemWidth = (containerWidth - totalGapWidth) / columns;
    
    // Altura del contenedor basada en filas visibles
    const itemHeight = GRID_CONFIG.cardHeight;
    const totalGapHeight = Math.max(0, rows - 1) * GRID_CONFIG.gap;
    const containerHeight = (rows * itemHeight) + totalGapHeight;
    
    return {
      containerWidth,
      containerHeight,
      columns,
      rows,
      itemWidth: Math.max(itemWidth, 200), // Mínimo 200px
      itemHeight,
      totalItems
    };
  }, [currentBreakpoint, items.length, viewportSize, containerRef]);

  // Configuración para react-window FixedSizeGrid
  const gridProps = useMemo(() => ({
    columnCount: dimensions.columns,
    rowCount: dimensions.rows,
    columnWidth: dimensions.itemWidth,
    rowHeight: dimensions.itemHeight,
    height: Math.min(dimensions.containerHeight, viewportSize.height * 0.8), // Max 80% viewport
    width: dimensions.containerWidth,
    overscanRowCount: overscan,
    overscanColumnCount: overscan,
  }), [dimensions, viewportSize.height, overscan]);

  // Helper: Obtener index de item basado en posición de grid
  const getItemIndex = useCallback((rowIndex: number, columnIndex: number): number => {
    return (rowIndex * dimensions.columns) + columnIndex;
  }, [dimensions.columns]);

  // Helper: Obtener datos de item por index
  const getItemData = useCallback((itemIndex: number): BuildingSummary | undefined => {
    return items[itemIndex];
  }, [items]);

  // Helper: Verificar si item está cargado
  const isItemLoaded = useCallback((itemIndex: number): boolean => {
    return itemIndex < items.length && Boolean(items[itemIndex]);
  }, [items]);

  // Detectar cambios en viewport size
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Throttle resize events
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', throttledResize);
    
    // Initial size detection
    handleResize();

    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Determinar si la virtualización debe estar activa
  const isVirtualizationActive = enableVirtualization && items.length > 20; // Activar solo con 20+ items

  // Importar FixedSizeGrid dinámicamente para evitar SSR issues
  const [FixedSizeGrid, setFixedSizeGrid] = useState<unknown>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && isVirtualizationActive) {
      import('react-window').then((module) => {
        setFixedSizeGrid(() => module.FixedSizeGrid);
      });
    }
  }, [isVirtualizationActive]);

  return {
    dimensions,
    FixedSizeGrid,
    gridProps,
    getItemIndex,
    getItemData,
    isItemLoaded,
    currentBreakpoint,
    isVirtualizationActive
  };
}

/**
 * Hook simplificado para usar solo cálculos de grid sin virtualización
 * Útil para componentes que necesitan dimensiones responsive pero no virtualización
 */
export function useResponsiveGrid(items: BuildingSummary[] = []) {
  const { dimensions, currentBreakpoint } = useVirtualGrid({ 
    items, 
    enableVirtualization: false 
  });
  
  return {
    columns: dimensions.columns,
    rows: dimensions.rows,
    breakpoint: currentBreakpoint,
    gridClassName: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6`
  };
}

// Tipos para exportar
export type { VirtualGridDimensions, VirtualGridConfig, VirtualGridReturn, GridBreakpoint };
