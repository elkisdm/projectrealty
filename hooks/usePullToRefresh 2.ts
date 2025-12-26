import { useState, useCallback, useRef, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';

export type PullToRefreshState = 'idle' | 'pulling' | 'refreshing' | 'complete';

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // Distancia en px para activar refresh (default: 80)
  disabled?: boolean;
  enableHapticFeedback?: boolean; // Feedback táctil cuando esté disponible
}

export interface UsePullToRefreshReturn {
  bind: ReturnType<typeof useDrag>;
  state: PullToRefreshState;
  pullDistance: number; // Distancia actual del pull (0-100+)
  progress: number; // Progreso 0-1 basado en threshold
}

/**
 * Hook para implementar pull to refresh
 * Detecta gesto de pull hacia abajo y ejecuta callback de refresh
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
  enableHapticFeedback = true,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [state, setState] = useState<PullToRefreshState>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const isAtTopRef = useRef(false);

  // Verificar si el contenedor está en el top
  const checkIfAtTop = useCallback(() => {
    if (!scrollContainerRef.current) {
      // Si no hay ref, asumir que estamos en el top del documento
      isAtTopRef.current = window.scrollY === 0;
      return window.scrollY === 0;
    }
    const element = scrollContainerRef.current;
    isAtTopRef.current = element.scrollTop === 0;
    return element.scrollTop === 0;
  }, []);

  // Feedback táctil (vibración)
  const triggerHapticFeedback = useCallback(() => {
    if (!enableHapticFeedback || typeof navigator === 'undefined') return;
    
    // Vibration API está disponible en algunos navegadores móviles
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(50); // Vibración corta de 50ms
      } catch {
        // Ignorar errores si no está disponible
      }
    }
  }, [enableHapticFeedback]);

  const bind = useDrag(
    (state) => {
      if (disabled) return;

      const {
        movement: [mx, my],
        first,
        last,
        active,
        direction: [dx, dy],
      } = state;

      // Solo procesar si es movimiento vertical hacia abajo
      if (dy <= 0) return; // No es movimiento hacia abajo

      // Verificar si estamos en el top antes de procesar
      if (first) {
        const atTop = checkIfAtTop();
        if (!atTop) return; // No procesar si no estamos en el top
      }

      if (first && isAtTopRef.current) {
        setState('pulling');
        triggerHapticFeedback();
      }

      if (active && isAtTopRef.current && my > 0) {
        const distance = Math.max(0, my);
        setPullDistance(distance);

        // Si superamos el threshold, cambiar estado visualmente
        // Estado sigue siendo 'pulling' hasta que se suelte
      }

      if (last && isAtTopRef.current) {
        const distance = Math.max(0, my);
        
        if (distance >= threshold) {
          setState('refreshing');
          setPullDistance(threshold); // Mantener en threshold durante refresh
          
          // Ejecutar callback de refresh
          Promise.resolve(onRefresh())
            .then(() => {
              setState('complete');
              triggerHapticFeedback(); // Feedback al completar
              
              // Reset después de un breve delay
              setTimeout(() => {
                setState('idle');
                setPullDistance(0);
              }, 500);
            })
            .catch((error) => {
              console.error('Error en pull to refresh:', error);
              setState('idle');
              setPullDistance(0);
            });
        } else {
          // No se alcanzó el threshold, resetear
          setState('idle');
          setPullDistance(0);
        }
      }
    },
    {
      axis: 'y', // Solo movimiento vertical
      filterTaps: true,
      preventScroll: false, // Permitir scroll normal
      threshold: 10, // Threshold mínimo para iniciar
    }
  );

  // Escuchar cambios en scroll para actualizar isAtTopRef
  useEffect(() => {
    const handleScroll = () => {
      checkIfAtTop();
    };

    const element = scrollContainerRef.current || window;
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [checkIfAtTop]);

  const progress = Math.min(pullDistance / threshold, 1);

  return {
    bind,
    state,
    pullDistance,
    progress,
  };
}

/**
 * Hook helper para establecer referencia del contenedor scrollable
 * Úsalo para pasar el elemento que tiene scroll
 */
export function usePullToRefreshContainer() {
  const containerRef = useRef<HTMLElement | null>(null);
  
  return containerRef;
}

